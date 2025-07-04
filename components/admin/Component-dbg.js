sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	'use strict'

	return UIComponent.extend('com.alarhoo.empflowyee.components.admin.Component', {
		metadata: {
			manifest: 'json'
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments)

			// Initialize the router
			this.getRouter().initialize()
		}
	})
})
