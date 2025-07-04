sap.ui.define([
	'../BaseController',
	'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
	'use strict'

	const className = 'com.alarhoo.empflowyee.components.hr.controller.zen.EmployeeDetail'
	const _Controller = Controller.extend(className, {
		constructor: function () {
			this._model = null
			this._employee = null
			this._empModel = null
			this._empInfoModel = null
			this._employeeDetailModel = null
		}
	})

	_Controller.prototype.onInit = function () {
		this._employeeDetailModel = new JSONModel()

		this._empModel = this.getOwnerComponent().getModel('emp')
		this._empInfoModel = this.getOwnerComponent().getModel('empInfo')

		this._model = this.getOwnerComponent().getModel()
		this.getRouter().getRoute('employeeDetailRoute').attachPatternMatched(this._onEmployeeMatched, this)

		this.getView().setModel(this._employeeDetailModel, 'empDetail')
	}

	_Controller.prototype.handleFullScreen = function () {
		const sNextLayout = this._model.getProperty('/actionButtonsInfo/midColumn/fullScreen')
		// console.log(this._model, sNextLayout);
		this.getRouter().navTo('employeeDetailRoute', {
			layout: sNextLayout,
			employee: this._employee,
		})
	}

	_Controller.prototype.handleExitFullScreen = function () {
		const sNextLayout = this._model.getProperty('/actionButtonsInfo/midColumn/exitFullScreen')
		this.getRouter().navTo('employeeDetailRoute', {
			layout: sNextLayout,
			employee: this._employee,
		})
	}

	_Controller.prototype.handleClose = function () {
		const sNextLayout = this._model.getProperty('/actionButtonsInfo/midColumn/closeColumn')
		this.getRouter().navTo('zenployeeRoute', {
			layout: sNextLayout,
		})
	}

	_Controller.prototype._onEmployeeMatched = function (oEvent) {
		this._employee = oEvent.getParameter('arguments').employeeId || this._employee || '0'

		// Get the full data from both models
		const aEmployeesMain = this._empModel.getData()
		const aEmployeesInfo = this._empInfoModel.getData()

		let oCurrentEmployee = null
		let oCurrentEmployeeInfo = null

		// Find the employee in EmployeesMain.json
		oCurrentEmployee = aEmployeesMain.find(emp => emp.EmpMainId === this._employee)

		// Find the employee info in EmployeesInfo.json
		oCurrentEmployeeInfo = aEmployeesInfo.find(info => info.EmpInfoMain === this._employee)

		if (oCurrentEmployee && oCurrentEmployeeInfo) {
			// Create a combined data object for the view
			const oCombinedData = {
				...oCurrentEmployee,
				...oCurrentEmployeeInfo,
				isEditable: false
			}

			// Set the combined data to the local model
			this._employeeDetailModel.setData(oCombinedData)

			// Bind the view's element to the root of this local model
			// The path is now simply '/' because the entire combined object is at the root of _employeeDetailModel
			this.getView().bindElement({
				path: '/',
				model: 'empDetail', // Bind to the new local model named "empDetail"
			})
		} else {
			// Handle case where employee data is not found (e.g., navigate back or show error)
			console.warn(`Employee with ID ${this._employee} or its info not found.`)
			// Optionally, clear the model data to clear the view
			this._employeeDetailModel.setData({})
		}
	}

	_Controller.prototype.handleTelPress = function () {
		sap.m.URLHelper.triggerTel(this.byId('empTel').getText())
	}

	_Controller.prototype.handleEmailPress = function () {
		sap.m.URLHelper.triggerEmail(this.byId('empEmail').getText(), 'Info Request')
	}

	return _Controller
})
