sap.ui.define([
	'./BaseController',
	'sap/ui/core/Messaging',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	'sap/m/MessageBox',
], function (Controller, Messaging, JSONModel, MessageToast, MessageBox) {
	'use strict'

	const _Controller = Controller.extend('com.alarhoo.empflowyee.components.employee.controller.ApplyLeave', {
		constructor: function () {
			Controller.apply(this, arguments)
			this._leaveRequestData = {
				LeaveType: 'sick',
				StartDate: null,
				EndDate: null,
				IsHalfDay: false,
				Approvers: [{
					key: 'user1',
					text: 'User 1'
				}, {
					key: 'user2',
					text: 'User 2'
				}],
				Reason: ''
			}
			this._leaveRequestModel = null
			this._uiModel = null
			this._isFormDirty = false
		}
	})

	// initialize json model for holding leave request data
	_Controller.prototype.onInit = function () {
		// register the view with the messaging service
		Messaging.registerObject(this.getView(), true)
		// Initialize the UI model with dynamic minDate and maxDate
		this._initUIModel()
		this._initLeaveRequestModel()

		this.getView().addEventDelegate({
			onBeforeShow: function () {
				console.log('onBeforeShow called')
			},
			onBeforeHide: function () {
				console.log('onAfterHide called')
				// this.onAfterHide()
			},
			onAfterHide: function () {
				console.log('onAfterHide called')
			},
			onAfterShow: function () {
				console.log('onAfterShow called')
			}
		}, this)

	}

	_Controller.prototype._initUIModel = function () {
		const today = new Date()
		const endOfYear = new Date(today.getFullYear(), 11, 31)

		this._uiModel = new JSONModel({
			minDate: today,
			maxDate: endOfYear
		})
		this.getView().setModel(this._uiModel, 'ui')
	}

	// initialize json model for holding leave request data using es6
	_Controller.prototype._initLeaveRequestModel = function () {
		// set the leave request model with initial data
		this._leaveRequestModel = new JSONModel(structuredClone(this._leaveRequestData))
		this._leaveRequestModel.attachPropertyChange(() => {
			this._isFormDirty = true
		})
		this.getView().setModel(this._leaveRequestModel, 'leaveRequest')
	}

	// create a private method to handle leave request submission
	_Controller.prototype._submitLeaveRequest = function () {
		const leaveRequestData = this._leaveRequestModel.getData()

		// Perform validation
		if (!leaveRequestData.LeaveType || !leaveRequestData.StartDate || !leaveRequestData.EndDate || !leaveRequestData.Reason) {
			MessageToast.show('Please fill all fields')
			return
		}

		// Submit the leave request (mock implementation)
		MessageToast.show('Leave request submitted')
	}

	_Controller.prototype.onLeaveRequestSubmit = function () {
		this._submitLeaveRequest()
	}

	_Controller.prototype.onLeaveRequestCancel = function () {
		// reset leave request data
		this._leaveRequestModel.setData(structuredClone(this._leaveRequestData))
	}

	_Controller.prototype.onAfterHide = function () {
		if (this._isFormDirty) {
		// Show warning when leaving the view
			MessageBox.confirm('You have unsaved changes. Do you want to leave?', {
				actions: ['Yes', 'No'],
				onClose: (sAction) => {
					if (sAction === 'No') {
					// Navigate back to this view if user cancels
						const router = sap.ui.core.UIComponent.getRouterFor(this)
						router.navTo('ApplyLeave')
					} else {
						this._isFormDirty = false
					}
				}
			})
		}
	}

	_Controller.prototype.onExit = function () {
		this._leaveRequestModel.detachPropertyChange(() => {
			this._isFormDirty = false
		})
		Messaging.removeAllMessages()
	}

	return _Controller
})
