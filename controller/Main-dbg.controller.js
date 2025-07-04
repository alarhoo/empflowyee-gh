sap.ui.define([
	'./BaseController',
	'sap/m/MessageBox'
], function (BaseController, MessageBox) {
	'use strict'

	return BaseController.extend('com.alarhoo.empflowyee.controller.Main', {
		sayHello: function () {
			MessageBox.show('Hello World!')
		},
		onNavToEmployee: function () {
			this.getOwnerComponent().getRouter().navTo('employeeComponent')
		},

		onNavToHR () {
			this.getOwnerComponent().getRouter().navTo('employeeComponent')
		},

		onNavToManager () {
			this.getOwnerComponent().getRouter().navTo('employeeComponent')
		}
	})
})
