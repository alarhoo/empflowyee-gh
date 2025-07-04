sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel',
	'sap/f/FlexibleColumnLayoutSemanticHelper',
	'sap/ui/core/Messaging',
	'sap/base/security/URLListValidator',
	'sap/f/library',
	'./model/models'
], function (UIComponent, JSONModel, FlexibleColumnLayoutSemanticHelper, Messaging, URLListValidator, library, models) {
	'use strict'
	const LayoutType = library.LayoutType

	return UIComponent.extend('com.alarhoo.empflowyee.components.hr.Component', {
		metadata: {
			manifest: 'json'
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments)

			const oModel = new JSONModel()
			this.setModel(oModel)

			// set message model
			this.setModel(Messaging.getMessageModel(), 'message')

			// Initialize the router
			this.getRouter().initialize()

			// set the device model
			this.setModel(models.createDeviceModel(), 'device')

			// add blob to safelist
			// This is necessary for the FileUploader to work with blob URLs
			URLListValidator.add('blob')
			URLListValidator.add('data')
		},

		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = 'sapUiSizeCompact'
				} else {
					this._sContentDensityClass = 'sapUiSizeCozy'
				}
			}
			return this._sContentDensityClass
		},

		getHelper: function () {
			return this._getFcl().then(function (oFCL) {
				const params = new URLSearchParams(location.search)
				const settings = {
					defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
					initialColumnsCount: 1,
					mode: params.get('mode'),
					maxColumnsCount: params.get('max'),
				}
				return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, settings)
			})
		},

		_getFcl: function () {
			return new Promise((resolve, reject) => {
				const oRootView = this.getRootControl()

				const tryGetFCL = () => {
					try {
						const oApp = oRootView.byId('idHRComponentApp')
						if (!oApp || !oApp.getPages) return null

						const oToolPage = oApp.getPages()[0]
						if (!oToolPage || !oToolPage.getContent) return null

						const oToolPageInner = oToolPage.getContent()[0]
						if (!oToolPageInner || !oToolPageInner.getMainContents) return null

						const oFclContainer = oToolPageInner.getMainContents()[0]
						if (!oFclContainer || !oFclContainer.getCurrentPage) return null

						const oCurrentPage = oFclContainer.getCurrentPage()
						if (!oCurrentPage || !oCurrentPage.byId) return null

						const oFCL = oCurrentPage.byId('idHRFcl')
						return oFCL || null
					} catch (e) {
						console.error('Error while locating FCL:', e)
						return null
					}
				}

				// Try immediately
				let oFCL = tryGetFCL()
				if (oFCL) {
					resolve(oFCL)
					return
				}

				// Poll if not found yet
				const interval = setInterval(() => {
					oFCL = tryGetFCL()
					if (oFCL) {
						clearInterval(interval)
						resolve(oFCL)
					}
				}, 100)

				// Optional: Add timeout
				setTimeout(() => {
					clearInterval(interval)
					reject('FlexibleColumnLayout (idHRFcl) could not be found after timeout.')
				}, 5000)
			})
		}
	})
})
