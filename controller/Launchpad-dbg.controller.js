sap.ui.define([
	'./BaseController',
	'sap/m/MessageToast'
], function (BaseController, MessageToast) {
	'use strict'

	return BaseController.extend('com.alarhoo.empflowyee.controller.Launchpad', {
		onInit: function () {
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())
		},

		onTilePress: function (evt) {
			try {
				const tile = evt.getSource()
				const { route } = tile.getBindingContext('launchpad').getObject()

				const iconTabBar = this.byId('idIconTabBar')
				const selectedKey = iconTabBar.getSelectedKey()

				const oSelectedTab = iconTabBar.getItems().find(function (item) {
					return item.getKey() === selectedKey
				})
				const selectedRoute = oSelectedTab.data('route')
				const selectedComponentTarget = oSelectedTab.data('componentTarget')

				// inter-component navigation
				this.getRouter().navTo(selectedRoute, {}, {
					[selectedComponentTarget]: {
						route: route,
						parameters: {}
					}
				})
			} catch (error) {
				console.error('Error in onTilePress:', error)
				MessageToast.show(error.message || 'An error occurred while processing the tile press event.')
			}
		}
	})
})
