sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function (
	Controller
) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.employee.controller.ToolPage', {

		/**
		 * @override
		 * @returns {void|undefined}
		 */
		onInit: function () {
			const launchpadModel = this.getOwnerComponent().getModel('launchpad')
			const employeeData = launchpadModel.getProperty('/groups').find((group) => group.id === 'idEmployeeSelfService')
			console.log(employeeData)
			this.getOwnerComponent().getModel('side').setProperty('/navigation', employeeData.tiles)
		},

		onPageLinkPress: function () {
			this.getOwnerComponent().getRouter().navTo('applyLeave')
		}
	})
})
