sap.ui.define([
	'./BaseController',
	'sap/ui/Device',
	'sap/m/MessageToast',
	'sap/ui/core/Fragment'
], function (Controller, Device, MessageToast, Fragment) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.employee.controller.LeaveHistory', {

		onInit: function () {
			this._mViewSettingsDialogs = {}
			this.mGroupFunctions = {
				SupplierName: function (oContext) {
					const name = oContext.getProperty('SupplierName')
					return {
						key: name,
						text: name
					}
				},
				Price: function (oContext) {
					const price = oContext.getProperty('Price')
					const currencyCode = oContext.getProperty('CurrencyCode')
					let key, text
					if (price <= 100) {
						key = 'LE100'
						text = '100 ' + currencyCode + ' or less'
					} else if (price <= 1000) {
						key = 'BT100-1000'
						text = 'Between 100 and 1000 ' + currencyCode
					} else {
						key = 'GT1000'
						text = 'More than 1000 ' + currencyCode
					}
					return {
						key: key,
						text: text
					}
				}
			}
		},

		handleSortButtonPressed: function () {
			this._getViewSettingsDialog('com.alarhoo.empflowyee.components.employee.fragments.leave.SortDialog')
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open()
				})
		},

		handleFilterButtonPressed: function () {
			this._getViewSettingsDialog('com.alarhoo.empflowyee.components.employee.fragments.leave.FilterDialog')
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open()
				})
		},

		handleGroupButtonPressed: function () {
			this._getViewSettingsDialog('com.alarhoo.empflowyee.components.employee.fragments.leave.GroupDialog')
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open()
				})
		},

		handleExportButtonPressed: function () {
			MessageToast.show('Export functionality is not implemented yet.')
			// Implement export logic here, e.g., exporting to Excel or CSV
			// This could involve creating a CSV string from the table data and triggering a download
		},

		onLeaveSearch: function () {
			this.getRouter().navTo('LeaveHistorySearch')
		},

		handleSortDialogConfirm: function () {},

		handleFilterDialogConfirm: function () {},

		handleGroupDialogConfirm: function () {},

		resetGroupDialog: function () {},

		_getViewSettingsDialog: function (sDialogFragmentName) {
			let pDialog = this._mViewSettingsDialogs[sDialogFragmentName]

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass('sapUiSizeCompact')
					}
					return oDialog
				})
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog
			}
			return pDialog
		},
	})
})
