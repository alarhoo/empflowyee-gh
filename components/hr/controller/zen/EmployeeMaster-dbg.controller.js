sap.ui.define([
	'../BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/Device',
	'sap/m/MessageToast',
	'sap/ui/core/Fragment'
], function (Controller, JSONModel, Filter, FilterOperator, Device, MessageToast, Fragment) {
	'use strict'

	const className = 'com.alarhoo.empflowyee.components.hr.controller.zen.EmployeeMaster'
	const _Controller = Controller.extend(className, {
		constructor: function () {
			this._mViewSettingsDialogs = null
			this._currentRouteName = null
		},
	})

	_Controller.prototype.onInit = function () {
		this._mViewSettingsDialogs = {}
		// Get the current route name
		this._currentRouteName = this.getCurrentRouteName()
	}


	_Controller.prototype.onListItemPress = async function (event) {
		const helper = await this.getOwnerComponent().getHelper()
		const uiState = helper.getNextUIState(1)

		const oBindingContext = event.getSource().getBindingContext('emp')

		if (oBindingContext) {
			const oEmployeeData = oBindingContext.getObject()
			const employeeId = oEmployeeData.EmpMainId

			// Conditional navigation based on the current route
			if (this._currentRouteName === 'employeeEditViewRoute') {
				this.getRouter().navTo('employeeEditRoute', {
					layout: uiState.layout,
					employeeId: employeeId
				})
			} else {
				// Default navigation to employeeDetailRoute
				this.getRouter().navTo('employeeDetailRoute', {
					layout: uiState.layout,
					employeeId: employeeId
				})
			}

			const item = event.getSource()
			item.setNavigated(true)
		} else {
			const message = 'No binding context found for the clicked list item.'
			MessageToast.show(message)
			console.warn(message)
		}
	}

	_Controller.prototype.onEmployeeListItemDetailPress = async function (event) {
		const helper = await this.getOwnerComponent().getHelper()
		const uiState = helper.getNextUIState(1)

		const bindingContext = event.getSource().getBindingContext('emp')

		if (bindingContext) {
			const oEmployeeData = bindingContext.getObject()
			const employeeId = oEmployeeData.EmpMainId
			this.getRouter().navTo('employeeEditRoute', {
				layout: uiState.layout,
				employeeId: employeeId
			})
		} else {
			const message = 'No binding context found for the clicked list item.'
			MessageToast.show(message)
			console.warn(message)
		}
	}

	_Controller.prototype.onEmployeeSortPress = function () {
		this._getViewSettingsDialog('com.alarhoo.empflowyee.components.hr.fragments.zen.SortDialog')
			.then(function (oViewSettingsDialog) {
				oViewSettingsDialog.open()
			})
	}

	_Controller.prototype.onEmployeeFilterPress = function () {
		this._getViewSettingsDialog('com.alarhoo.empflowyee.components.hr.fragments.zen.FilterDialog')
			.then(function (oViewSettingsDialog) {
				oViewSettingsDialog.open()
			})
	}

	_Controller.prototype.onEmployeeGroupPress = function () {
		this._getViewSettingsDialog('com.alarhoo.empflowyee.components.hr.fragments.zen.GroupDialog')
			.then(function (oViewSettingsDialog) {
				oViewSettingsDialog.open()
			})
	}

	_Controller.prototype.onEmployeeExportPress = function () {
		MessageToast.show('Export functionality is not implemented yet.')
	}


	_Controller.prototype.onEmployeeSortDialogConfirm = function (event) {
		try {
			const oTable = this.byId('idEmployeeList')
			const oBinding = oTable.getBinding('items')

			const oParams = event.getParameters()
			const sPath = oParams.sortItem.getKey() // e.g., "EmpMainFirst"
			const bDescending = oParams.sortDescending

			const oSorter = new sap.ui.model.Sorter(sPath, bDescending)
			oBinding.sort(oSorter)
		} catch (err) {
			console.error('Error during sort:', err)
			MessageToast.show('Failed to sort employee list.')
		}
	}

	_Controller.prototype.onEmployeeFilterDialogConfirm = function (event) {
		try {
			const oTable = this.byId('idEmployeeList')
			const oBinding = oTable.getBinding('items')

			const oParams = event.getParameters()
			const aFilters = []

			oParams.filterItems.forEach((item) => {
				const sPath = item.getParent().getKey() // Group key from ViewSettingsFilterItem
				const sValue = item.getKey() // Value from ViewSettingsItem
				if (sPath && sValue) {
					aFilters.push(new Filter(sPath, FilterOperator.EQ, sValue))
				}
			})

			oBinding.filter(aFilters, 'Application')
		} catch (err) {
			console.error('Error during filter:', err)
			MessageToast.show('Failed to apply filters.')
		}
	}

	_Controller.prototype.onEmployeeGroupDialogConfirm = function (event) {
		try {
			const oList = this.byId('idEmployeeList') // if ID is different, use that
			const oBinding = oList.getBinding('items')

			const oParams = event.getParameters()
			const sPath = oParams.groupItem.getKey() // e.g., "emp_main_department"
			const bDescending = oParams.groupDescending

			const oSorter = new sap.ui.model.Sorter(sPath, bDescending, true) // `true` enables grouping

			// Set the group header factory
			oList.setGroupHeaderFactory(function (oGroup) {
				return new sap.m.GroupHeaderListItem({
					title: oGroup.key,
					upperCase: false
				})
			})

			oBinding.sort(oSorter)
		} catch (err) {
			console.error('Error during grouping:', err)
			sap.m.MessageToast.show('Failed to group employees.')
		}
	}

	_Controller.prototype.resetGroupDialog = function () {
		try {
			const oTable = this.byId('employeeTable')
			const oBinding = oTable.getBinding('items')
			oBinding.sort(null)
			MessageToast.show('Grouping reset.')
		} catch (err) {
			console.error('Error while resetting group:', err)
			MessageToast.show('Failed to reset grouping.')
		}
	}

	_Controller.prototype._getViewSettingsDialog = function (sDialogFragmentName) {
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
	}

	_Controller.prototype.onEmployeeSearch = function (event) {
		try {
			const oTable = this.byId('idEmployeeList')
			const oBinding = oTable.getBinding('items')

			const sQuery = event.getParameter('query')
			const aFilters = []

			if (sQuery) {
				aFilters.push(
					new Filter({
						filters: [
							new Filter('EmpMainFirst', FilterOperator.Contains, sQuery),
							new Filter('EmpMainLast', FilterOperator.Contains, sQuery),
							new Filter('EmpMainEmail', FilterOperator.Contains, sQuery)
						],
						and: false
					})
				)
			}

			oBinding.filter(aFilters, 'Application')
		} catch (err) {
			console.error('Error during search:', err)
			MessageToast.show('Search failed. Please try again.')
		}
	}

	return _Controller
})
