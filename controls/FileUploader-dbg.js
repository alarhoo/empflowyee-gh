sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/Fragment',
	'sap/m/PDFViewer',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel',
	'sap/m/Dialog',
	'sap/m/Image'
], function (Control, Fragment, PDFViewer, MessageToast, JSONModel, Dialog, Image) {
	'use strict'

	return Control.extend('com.alarhoo.empflowyee.controls.FileUploader', {
		metadata: {
			properties: {
				label: { type: 'string' },
				documentSource: { type: 'string', bindable: true },
				fileName: { type: 'string', bindable: true },
				fileType: { type: 'string', defaultValue: 'pdf' },
				maxFileSize: { type: 'int', defaultValue: 2 },
			},
			aggregations: {
				_content: { type: 'sap.ui.core.Control', multiple: false, visibility: 'hidden' }
			},
			events: {
				change: {
					parameters: {
						file: { type: 'object' },
						name: { type: 'string' },
						size: { type: 'int' },
						type: { type: 'string' }
					}
				}
			},
			interfaces: ['sap.ui.core.IFormContent']
		},

		renderer: {
			apiVersion: 2,
			render: function (oRM, oControl) {
				oRM.openStart('div', oControl)
				oRM.class('fileUploaderControl')
				oRM.openEnd()
				oRM.renderControl(oControl.getAggregation('_content'))
				oRM.close('div')
			}
		},

		init: function () {
			this._pdfViewer = new PDFViewer({
				isTrustedSource : true,
				showDownloadButton: false
			})
			this._imageDialog = null
		},

		onBeforeRendering: function () {
			if (this._bFragmentLoaded || this.getAggregation('_content')) return

			this._bFragmentLoaded = true

			Fragment.load({
				name: 'com.alarhoo.empflowyee.controls.FileUploaderContent',
				controller: this
			}).then(function (fragment) {
				// internal model for control's binding
				const label = this.getLabel()
				const placeholder = `Upload ${label || 'document'}`
				const fileType = this.getFileType()
				const maxFileSize = this.getMaxFileSize()
				const tooltip = `Only ${fileType} files up to ${maxFileSize}MB are allowed.`

				const controlModel = new JSONModel({
					label: this.getLabel(),
					placeholder: placeholder,
					tooltip: tooltip,
					documentSource: this.getDocumentSource(),
					fileName: this.getFileName(),
					fileType: fileType
				})
				this.setModel(controlModel, 'control')
				fragment.setModel(controlModel, 'control')

				this.setAggregation('_content', fragment)
			}.bind(this)).catch(function (err) {
				console.error('Failed to load FileUploader fragment:', err)
			})
		},

		onFileUploadChange: function (event) {
			try {
				const fileUploader = event.getSource()
				const file = event.getParameter('files')?.[0]
				const MAX_SIZE = this.getMaxFileSize() * 1024 * 1024

				if (!file) {
					MessageToast.show('No file selected.')
					return
				}

				if (file.size > MAX_SIZE) {
					MessageToast.show(`File size exceeds ${this.getMaxFileSize()}MB limit.`)
					fileUploader.clear()
					return
				}

				const reader = new FileReader()
				reader.onload = (e) => {
					const dataUrl = e.target.result
					const model = this.getModel('control')

					model.setProperty('/documentSource', dataUrl)
					model.setProperty('/fileName', file.name)
					model.setProperty('/fileMimeType', file.type)
					model.setProperty('/fileSize', (file.size / 1024).toFixed(1) + ' KB')
					this.fireChange({
						file,
						name: file.name,
						size: file.size,
						type: file.type
					})
				}
				reader.onerror = () => {
					console.error('File read failed')
					MessageToast.show('Failed to read file')
				}
				reader.readAsDataURL(file)
			} catch (err) {
				console.error('Upload error:', err)
				MessageToast.show('Something went wrong')
			}
		},

		onFileTypeMismatch: function (event) {
			const fileTypes = event.getSource().getFileType() || []
			const supportedTypes = fileTypes.map(type => '*.' + type).join(', ')
			const uploadedType = event.getParameter('fileType')

			MessageToast.show(`The file type *.${uploadedType} is not supported. Choose one of the following types: ${supportedTypes}`)
		},

		onPreviewPress: function () {
			const model = this.getModel('control')
			const src = model.getProperty('/documentSource')
			const name = model.getProperty('/fileName')
			const mimeType = model.getProperty('/fileMimeType')

			if (!src) {
				MessageToast.show('No file to preview')
				return
			}

			if (mimeType && mimeType.startsWith('image/')) {
				// Show image in dialog
				if (!this._imageDialog) {
					this._imageDialog = new Dialog({
						title: name || 'Image Preview',
						content: [
							new Image({
								src: src,
								width: '100%',
								densityAware: false
							})
						],
						endButton: new sap.m.Button({
							text: 'Close',
							press: function () {
								this._imageDialog.close()
							}.bind(this)
						}),
						afterClose: function () {
							this._imageDialog.destroy()
							this._imageDialog = null
						}.bind(this)
					})
				} else {
					this._imageDialog.setTitle(name || 'Image Preview')
					this._imageDialog.getContent()[0].setSrc(src)
				}
				this._imageDialog.open()
			} else if (mimeType === 'application/pdf') {
				this._pdfViewer.setSource(src)
				this._pdfViewer.setTitle(name || 'Preview')
				this._pdfViewer.open()
			} else {
				MessageToast.show('Preview not supported for this file type.')
			}
		},

		onClearUpload: function () {
			const oModel = this.getModel('control')
			oModel.setProperty('/documentSource', null)
			oModel.setProperty('/fileName', null)
			oModel.setProperty('/fileSize', null)

			const oContent = this.getAggregation('_content')
			if (oContent) {
				const aFileUploaders = oContent.findAggregatedObjects(true).filter(ctrl =>
					ctrl.isA('sap.ui.unified.FileUploader')
				)
				if (aFileUploaders.length > 0) {
					aFileUploaders[0].clear()
				}
			}
		},

		getFormDoNotAdjustWidth: function () {
			return false
		}
	})
})
