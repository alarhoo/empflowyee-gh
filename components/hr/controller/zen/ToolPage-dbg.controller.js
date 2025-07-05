sap.ui.define([
	'com/alarhoo/empflowyee/components/hr/controller/BaseController',
	'sap/ui/Device',
	'sap/m/MessageToast'
], function (Controller, Device, MessageToast) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.hr.controller.zen.ToolPage', {

		onInit: function () {
			this._adaptMediaScreen()
			this.getRouter().attachRouteMatched(this._onRouteChange.bind(this))
		},

		_adaptMediaScreen: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())

			// if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
			if (Device.resize.width <= 1024) {
				this.onSideNavButtonPress()
			}

			Device.media.attachHandler(this._handleWindowResize)
		},

		onSideNavButtonPress: function () {
			try {
				const oToolPage = this.byId('idHRToolPage')
				const bSideExpanded = oToolPage.getSideExpanded()
				MessageToast.show(String(bSideExpanded))
				this._setToggleButtonTooltip(bSideExpanded)
				oToolPage.setSideExpanded(!oToolPage.getSideExpanded())
			} catch (error) {
				MessageToast.show(error.message)
			}
		},

		_setToggleButtonTooltip: function (bSideExpanded) {
			const oToggleButton = this.byId('idHRSideNavigationToggleButton')
			this.getBundleText(bSideExpanded ? 'expandMenuButtonText' : 'collpaseMenuButtonText', [])
				.then(function (sTooltipText) {
					oToggleButton.setTooltip(sTooltipText)
				})
		},

		_onRouteChange: function (oEvent) {
			this.getModel('side').setProperty('/selectedKey', oEvent.getParameter('name'))

			if (Device.system.phone) {
				this.onSideNavButtonPress()
			}
		},

		onSideNavigationItemSelect: function (event) {
			const selectedItem = event.getParameter('item')
			const selectedRoute = selectedItem.getKey()
			this.getRouter().navTo(selectedRoute)
			// this.getRouter().navTo('hrRoute', {}, {
			// 	'hrTarget': {
			// 		route: selectedRoute,
			// 		parameters: {}
			// 	}
			// })
		},

		_handleWindowResize: function (oDevice) {
			// if ((oDevice.name === 'Tablet' && this._bExpanded) || oDevice.name === 'Desktop') {
			// 	this.onSideNavButtonPress()
			// 	// set the _bExpanded to false on tablet devices
			// 	// extending and collapsing of side navigation should be done when resizing from
			// 	// desktop to tablet screen sizes)
			// 	this._bExpanded = (oDevice.name === 'Desktop')
			// }
		},

		onPageLinkPress: function () {
			this.getOwnerComponent().getRouter().navTo('applyLeave')
		},

		onExit: function () {
			Device.media.detachHandler(this._handleWindowResize, this)
		},
	})
})
