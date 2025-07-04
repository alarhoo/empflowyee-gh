sap.ui.define([
	'./BaseController'
], function (BaseController) {
	'use strict'

	return BaseController.extend('com.alarhoo.empflowyee.controller.App', {
		onInit: function () {
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())
		},
		onShellBarHomeIconPressed: function () {
			this.getOwnerComponent().getRouter().navTo('launchpad')
		},
		onShellBarNotificationsPressed: function () {
			this.getOwnerComponent().getRouter().navTo('notifications')
		}
	})
})
