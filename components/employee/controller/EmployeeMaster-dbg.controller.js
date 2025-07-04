sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function (
	Controller
) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.employee.controller.EmployeeMaster', {

		onEmployeeListItemPress: function (oEvent) {
			const oItem = oEvent.getSource()
			const oContext = oItem.getBindingContext('employee')
			if (oContext) {
				const sPath = oContext.getPath().substring(1) // Remove leading '/'
				this.getOwnerComponent().getRouter().navTo('employeeDetail', { employeeId: sPath })
			} else {
				sap.m.MessageToast.show('No employee selected.')
			}
		}
	})
})
