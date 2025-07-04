sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/core/Messaging'
], function (UIComponent, Messaging) {
	'use strict'

	return UIComponent.extend('com.alarhoo.empflowyee.components.employee.Component', {
		metadata: {
			manifest: 'json'
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments)

			// set message model
			this.setModel(Messaging.getMessageModel(), 'message')

			// Initialize the router
			this.getRouter().initialize()
		}
	})
})
