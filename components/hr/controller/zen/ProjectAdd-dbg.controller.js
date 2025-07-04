sap.ui.define([
	'../BaseController'
], function (Controller) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.hr.controller.zen.HolidayAdd', {

		onInit: function () {
			this.getRouter().getRoute('holidayAddRoute').attachPatternMatched(this._onHolidayAddMatched, this)
			this.getRouter().getRoute('holidayEditRoute').attachPatternMatched(this._onHolidayEditMatched, this)
		},

		_onHolidayAddMatched: function () {
		},

		_onHolidayEditMatched: function () {
		},

		onExit: function () {
			this.getRouter().getRoute('holidayAddRoute').detachPatternMatched(this._onHolidayAddMatched, this)
			this.getRouter().getRoute('holidayEditRoute').detachPatternMatched(this._onHolidayEditMatched, this)
		},
	})
})
