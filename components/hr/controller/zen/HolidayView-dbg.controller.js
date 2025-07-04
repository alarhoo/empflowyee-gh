sap.ui.define([
	'../BaseController',
	'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.hr.controller.zen.HolidayView', {

		onInit: function () {
			this._initHolidayView()
		},

		onHolidayEditPress: function (event) {
			const source = event.getSource()
			const holiday = source.getBindingContext('holiday').getObject()
			console.log(holiday)
			this.getRouter().navTo('holidayEditRoute', {
				holidayId: holiday.HolId
			})
		},

		_initHolidayView: function () {
			const yearModel = new JSONModel()
			const years = []
			const currentYear = new Date().getFullYear()

			for (let i = 0; i < 5; i++) {
				const year = currentYear - i
				years.push({
					key: year.toString(),
					text: year.toString()
				})
			}

			yearModel.setData({
				years: years
			})
			this.getView().setModel(yearModel, 'year')
		},
	})
})
