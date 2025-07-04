sap.ui.define([
	'./BaseController'
], function (Controller) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.hr.controller.FlexibleColumnLayout', {
		onInit: function () {
			this.getRouter().attachRouteMatched(this._onRouteMatched, this)
			this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this)
		},

		_onBeforeRouteMatched: async function (event) {
			const model = this.getOwnerComponent().getModel()
			let layout = event.getParameters().arguments.layout

			if (!layout) {
				const helper = await this.getOwnerComponent().getHelper()
				layout = helper.getNextUIState(0).layout
			}

			if (layout) {
				model.setProperty('/layout', layout)
			}
		},

		_onRouteMatched: function (event) {
			const routeName = event.getParameter('name')
			const args = event.getParameter('arguments')

			this._updateUIElements()

			this._currentRouteName = routeName
			this._currentEmployee = args.employee
		},

		onStateChanged: function (event) {
			const isNavigationArrow = event.getParameter('isNavigationArrow')
			const layout = event.getParameter('layout')

			this._updateUIElements()

			if (isNavigationArrow) {
				this.getRouter().navTo(this._currentRouteName, {
					layout,
					employee: this._currentEmployee
				})
			}
		},

		_updateUIElements: async function () {
			const model = this.getOwnerComponent().getModel()
			const helper = await this.getOwnerComponent().getHelper()
			const uiState = helper.getCurrentUIState()
			model.setData(uiState)
		},

		onExit: function () {
			this.getRouter().detachRouteMatched(this._onRouteMatched, this)
			this.getRouter().detachBeforeRouteMatched(this._onBeforeRouteMatched, this)
		},
	})
})
