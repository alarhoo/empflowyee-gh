sap.ui.define([
	'com/alarhoo/empflowyee/components/hr/controller/BaseController',
	'sap/ui/Device',
	'sap/m/MessageToast'
], function (Controller, Device, MessageToast) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.hr.controller.zen.ToolPage', {

		onInit: function () {
			// this._adaptMediaScreen()
			// this.getRouter().attachRouteMatched(this._onRouteChange.bind(this))
		},

		_adaptMediaScreen: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())

			// Collapse side nav on tablet/desktop, expand on phone
			if (Device.system.phone) {
				this._setSideNavExpanded(false)
			} else if (Device.resize.width <= 1024) {
				this._setSideNavExpanded(false)
			} else {
				this._setSideNavExpanded(true)
			}

			Device.media.attachHandler(this._handleWindowResize, this)
		},

		_setSideNavExpanded: function (bExpanded) {
			const oToolPage = this.byId('idHRToolPage')
			if (oToolPage) {
				oToolPage.setSideExpanded(bExpanded)
			}
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
			// Always collapse on phone, expand on desktop, collapse on tablet
			if (oDevice.name === 'Phone') {
				this._setSideNavExpanded(false)
			} else if (oDevice.name === 'Tablet') {
				this._setSideNavExpanded(false)
			} else if (oDevice.name === 'Desktop') {
				this._setSideNavExpanded(true)
			}
		},

		onPageLinkPress: function () {
			this.getOwnerComponent().getRouter().navTo('applyLeave')
		},

		onExit: function () {
			Device.media.detachHandler(this._handleWindowResize, this)
		},
	})
})
