/* eslint-disable camelcase */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/ResizeHandler',
	'sap/base/Log'
], function (Control, ResizeHandler, Log) {
	'use strict'

	const basePath = sap.ui.require.toUrl('com/alarhoo/empflowyee/lib/tinymce')

	return Control.extend('com.alarhoo.empflowyee.controls.RichTextEditor', {
		metadata: {
			properties: {
				value: { type: 'string', defaultValue: '' },
				width: { type: 'sap.ui.core.CSSSize', defaultValue: '100%' },
				height: { type: 'sap.ui.core.CSSSize', defaultValue: '600px' },
				editorId: { type: 'string', defaultValue: null },
				config: { type: 'object', defaultValue: {} }
			},
			events: {
				change: { parameters: { value: { type: 'string' } } },
				ready: {}
			}
		},

		init: function () {
			this._editorId = this.getId() + '-rte'
			this._editor = null
			this._tinymceLoaded = false
			this._resizeHandlerId = null
		},

		renderer: function (rm, control) {
			rm.openStart('div', control)
			rm.style('width', control.getWidth())
			rm.style('height', control.getHeight())
			rm.class(control.getMetadata().getName())
			rm.openEnd()
			rm.openStart('textarea', control.getEditorId() || control._editorId)
			rm.openEnd()
			rm.text(control.getValue() || '')
			rm.close('textarea')

			rm.close('div')
		},

		onAfterRendering: function () {
			const id = this.getEditorId() || this._editorId

			if (window.tinymce?.get(id)) {
				window.tinymce.get(id).remove()
			}

			if (!this._tinymceLoaded) {
				this._loadTinyMCE(id)
			} else {
				this._initTinyMCE(id)
			}

			if (!this._resizeHandlerId) {
				this._resizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this))
			}
		},

		_loadTinyMCE: function (id) {
			const scriptUrl = `${basePath}/tinymce.min.js`
			const script = document.createElement('script')
			script.src = scriptUrl
			script.async = true
			script.onload = () => {
				this._tinymceLoaded = true
				this._initTinyMCE(id)
			}
			script.onerror = (err) => {
				Log.error('TinyMCE script load failed:', err.message)
				this.fireEvent('error', { message: 'Failed to load TinyMCE editor.' })
			}
			document.head.appendChild(script)
		},

		_initTinyMCE: function (id) {
			if (typeof tinymce === 'undefined') {
				Log.warning('TinyMCE is not available.')
				return
			}

			const config = {
				selector: `#${id}`,
				base_url: basePath,
				suffix: '.min',
				height: this.getHeight(),
				plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
				toolbar: 'undo redo | formatselect | bold italic backcolor | blocks fontsizeinput | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | fullscreen image link math media | removeformat preview | help',
				skin: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide',
				content_css: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
				branding: false,
				menubar: false,
				resize: false,
				init_instance_callback: (editor) => {
					this._editor = editor
					if (this.getValue()) {
						this._editor.setContent(this.getValue())
					}
					this.fireReady()
					editor.on('change keyup', () => {
						const newValue = editor.getContent()
						if (this.getValue() !== newValue) {
							this.setProperty('value', newValue, true)
							this.fireChange({ value: newValue })
						}
					})
				},
				...this.getConfig()
			}

			tinymce.init(config).then((editors) => {
				if (editors?.length > 0 && !this._editor) {
					this._editor = editors[0]
				}
			}).catch((err) => {
				Log.error('TinyMCE init failed:', err.message)
				this.fireEvent('error', { message: 'TinyMCE initialization failed.' })
			})
		},

		setValue: function (value) {
			if (this._editor && this._editor.initialized && this._editor.getContent() !== value) {
				this._editor.setContent(value)
			}
			return this.setProperty('value', value, true)
		},

		_onResize: function () {
			if (this._editor && !this._editor.isHidden()) {
				const domRef = this.getDomRef()
				if (domRef) {
					this._editor.execCommand('mceResize', false, {
						width: domRef.offsetWidth,
						height: domRef.offsetHeight
					})
				}
			}
		},

		exit: function () {
			if (this._editor) {
				this._editor.remove()
				this._editor = null
			}
			if (this._resizeHandlerId) {
				ResizeHandler.deregister(this._resizeHandlerId)
				this._resizeHandlerId = null
			}
			if (Control.prototype.exit) {
				Control.prototype.exit.apply(this, arguments)
			}
		}
	})
})
