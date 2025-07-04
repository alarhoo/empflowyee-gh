sap.ui.define([
	'../BaseController',
	'sap/m/MessageToast'
], function (Controller, MessageToast) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.hr.controller.zen.HolidayAdd', {

		onInit: function () {
			this._uiModel = this.getOwnerComponent().getModel('ui')
			this.getRouter().getRoute('holidayAddRoute').attachPatternMatched(this._onHolidayAddMatched, this)
			this.getRouter().getRoute('holidayEditRoute').attachPatternMatched(this._onHolidayEditMatched, this)
		},

		_onHolidayAddMatched: function () {
			this._uiModel.setData({
				pageTitle: 'Add Holiday',
				saveButtonText: 'Create',
				saveButtonType: 'Emphasized'
			})
		},

		_onHolidayEditMatched: function () {
			const holidayId = event.getParameter('arguments').holidayId
			if (!holidayId) {
				MessageToast.show('No holiday ID provided for editing.')
				return
			}

			const holidayData = this._getHolidayData(holidayId)
			if (holidayData) {
				this._uiModel.setData({
					pageTitle: 'Update Holiday',
					saveButtonText: 'Update',
					saveButtonType: 'Success'
				})

				this.getRouter().navTo('holidayEditRoute', {
					holidayId: holidayId
				})
				MessageToast.show(`Holiday ${holidayId} loaded for editing.`)
			} else {
				const message = `Holiday data not found for ID: ${holidayId}`
				MessageToast.show(message)
				console.warn(message)
				this.getRouter().navTo('holidayViewRoute', {})
			}
		},

		_getHolidayData: function (holidayId) {
			const existingHolidayData = {
				holidayId
			}
			return existingHolidayData
		},

		onExit: function () {
			this.getRouter().getRoute('holidayAddRoute').detachPatternMatched(this._onHolidayAddMatched, this)
			this.getRouter().getRoute('holidayEditRoute').detachPatternMatched(this._onHolidayEditMatched, this)
		},
	})
})
