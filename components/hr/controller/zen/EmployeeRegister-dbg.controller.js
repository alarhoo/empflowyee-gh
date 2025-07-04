sap.ui.define([
	'../BaseController',
	'com/alarhoo/empflowyee/lib/Utils',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/SimpleType',
	'sap/ui/model/ValidateException',
	'sap/ui/core/Core',
	'sap/m/MessageBox',
	'sap/m/MessageToast',
], function (BaseController, Utils, JSONModel, SimpleType, ValidateException, Core, MessageBox, MessageToast) {
	'use strict'

	return BaseController.extend('com.alarhoo.empflowyee.components.hr.controller.zen.EmployeeRegister', {
		onInit: function () {
			this._wizard = this.byId('idCreateEmployeeWizard')
			this._navContainer = this.byId('idEmployeeRegisterNavContainer')
			this._registerPage = this.byId('idEmployeeRegisterPage')
			this._reviewPage = this.byId('idEmployeeReviewPage')
			this._registerModel = new JSONModel({
				EmpMainFirst: '',
				EmpMainMiddle: '',
				EmpMainLast: '',
				EmpMail: '',
				EmpMainDob: '',
				EmpMainGender: 0,
				empBloodGroup: '',
				EmpMainId: '',
				EmpMainOrgMail: '',
				EmpMainDoj: '',
				EmpMainBillable: true,
				EmpMainContract: false,
				EmpMainProfile: 'BASIC,HR,MANAGER,ADMIN',
				EmpMainDesignation: '',
				EmpMainLead: '',
				EmpMainWorkspace: 'India',
				EmpInfoPriContact: '',
				EmpInfoSecContact: '',
				EmpInfoEmgContact: '',
				EmpInfoEmgName: '',
				EmpInfoEmgRel: 'friends',
				EmpInfoAddrLoc: '',
				EmpInfoRegionLoc: '',
				EmpInfoStateLoc: '',
				EmpInfoCountryLoc: '',
				EmpInfoPostLoc: '',
				EmpInfoAddrSame: false,
				EmpInfoAddrPerm: '',
				EmpInfoRegionPerm: '',
				EmpInfoStatePerm: '',
				EmpInfoCountryPerm: '',
				EmpInfoPostPerm: '',
				EmpIdPAN: '',
				EmpIdAadhar: '',
				EmpIdVoter: '',
				EmpIdDL: '',
				EmpIdSSN: '',
				EmpIdPassport: '',
				EmpIdPassportFirst: '',
				EmpIdPassportMid: '',
				EmpIdPassportLast: '',
				EmpIdPassportDob: '',
				EmpIdPassportIssueDate: '',
				EmpIdPassportExpiryDate: '',
				EmpIdPassportIssuePlace: ''
			})
			this.getView().setModel(this._registerModel, 'register')

			const uploadModel = new JSONModel({
				empPAN: {
					name: 'PAN Card',
					source: null
				},
				empAadhar: {
					name: 'Aadhar Card',
					source: null
				},
				empVoterCard: {
					name: 'Voter ID',
					source: null
				},
				empDrivingLicense: {
					name: 'Driving License',
					source: null
				},
				empPassport: {
					name: 'Passport',
					source: null
				},
				empSSN: {
					name: 'Social Security Number',
					source: null
				}
			})
			this.getView().setModel(uploadModel, 'upload')

			this._uiModel = this.getOwnerComponent().getModel('ui')

			this.getRouter().getRoute('employeeRegisterRoute').attachPatternMatched(this._onEmployeeRegisterMatched, this)
			this.getRouter().getRoute('employeeEditRoute').attachPatternMatched(this._onEmployeeEditMatched, this)
		},

		_onEmployeeRegisterMatched: function () {
			this._uiModel.setData({
				pageTitle: 'Register Employee',
				saveButtonText: 'Create',
				saveButtonType: 'Emphasized'
			})
		},

		_onEmployeeEditMatched: function (event) {
			const employeeId = event.getParameter('arguments').employeeId
			if (!employeeId) {
				MessageToast.show('No employee ID provided for editing.')
				return
			}

			this._uiModel.setData({
				pageTitle: 'Update Employee',
				saveButtonText: 'Update',
				saveButtonType: 'Success'
			})

			const aEmployeesMain = this.getOwnerComponent().getModel('emp').getData()
			const aEmployeesInfo = this.getOwnerComponent().getModel('empInfo').getData()

			const oEmployeeMainData = aEmployeesMain.find(emp => emp.EmpMainId === employeeId)
			const oEmployeeInfoData = aEmployeesInfo.find(info => info.EmpInfoMain === employeeId)

			if (oEmployeeMainData && oEmployeeInfoData) {
				const oCombinedData = {
					...oEmployeeMainData,
					...oEmployeeInfoData
				}
				console.log(oCombinedData)
				this._registerModel.setData(oCombinedData)

				// force the wizard to its first step
				this._wizard.discardProgress(this.byId('PrimaryStep'))
				this._wizard.goToStep(this.byId('PrimaryStep'))
				this._navContainer.to(this._registerPage)
				MessageToast.show(`Employee ${employeeId} loaded for editing.`)
			} else {
				MessageToast.show(`Employee ${employeeId} data not found in either model.`)
				console.warn(`Employee data not found for ID: ${employeeId}`)
				this.getRouter().navTo('employeeMasterRoute', {})
			}
		},

		onGenderRadioButtonSelect: function (event) {
			const selectedKey = event.getParameter('selectedKey')
			this._registerModel.setProperty('/EmpMainGender', parseInt(selectedKey, 10))
		},

		onProfileTypeSelect: function (oEvent) {
			try {
				const oCheckBox = oEvent.getSource()
				const sRole = oCheckBox.getText().toUpperCase() // BASIC, MANAGER, etc.
				const bSelected = oEvent.getParameter('selected')

				const sProfiles = this._registerModel.getProperty('/EmpMainProfile') || ''
				let aProfiles = sProfiles.split(',').filter(Boolean)

				if (bSelected && !aProfiles.includes(sRole)) {
					aProfiles.push(sRole)
				} else if (!bSelected && aProfiles.includes(sRole)) {
					aProfiles = aProfiles.filter(role => role !== sRole)
				}

				this._registerModel.setProperty('/EmpMainProfile', aProfiles.join(','))
			} catch (error) {
				MessageToast.show(error.message)
				console.error(error)
			}
		},

		isProfileSelected: function (value, parameters) {
			if (!value || !parameters || !parameters.value) return false
			return value.split(',').includes(parameters.value)
		},

		onWorkplaceSelect: function (event) {
			const selectedWorkspace = event.getSource().getSelectedButton().getText()
			this._registerModel.setProperty('/EmpMainWorkspace', selectedWorkspace)
		},

		_validateInput: function (input) {
			let valueState = 'None'
			let validationError = false
			const binding = input.getBinding('value')
			try {
				binding.getType().validateValue(input.getValue())
			} catch (exception) {
				valueState = 'Error'
				validationError = true
				console.error('validation error: ' + exception.message)
			}

			input.setValueState(valueState)

			return validationError
		},

		validateValue: function (value) {
			const rexMail = /^\w+[\w-+.]*@utegration.com$/
			if (!value.match(rexMail)) {
				throw new ValidateException('\'' + value + '\' is not a valid e-mail address')
			}
		},

		onSubmit: function () {
			const view = this.getView(),
				inputs = [view.byId('nameInput'), view.byId('emailInput')]
			let	validationError = false

			inputs.forEach(function (input) {
				validationError = this._validateInput(input) || validationError
			}, this)

			if (!validationError) {
				MessageToast.show('The input is validated. Your form has been submitted.')
			} else {
				MessageBox.alert('A validation error has occurred. Complete your input first.')
			}
		},

		onPrimaryDetailsLiveChange: function () {
			try {
				const { EmpMainId, EmpMail, EmpMainDoj, EmpMainFirst, EmpMainLast, EmpMainDob, EmpMainDesignation, EmpMainLead, EmpInfoPriContact, EmpInfoEmgContact, EmpInfoEmgName } = this._registerModel.getData()
				if (Utils.valueExists(EmpMainId) && Utils.valueExists(EmpMail) && Utils.valueExists(EmpMainDoj) && Utils.valueExists(EmpMainFirst) && Utils.valueExists(EmpMainLast) && Utils.valueExists(EmpMainDob) && Utils.valueExists(EmpMainDesignation) && Utils.valueExists(EmpMainLead) && Utils.valueExists(EmpInfoPriContact) && Utils.valueExists(EmpInfoEmgContact)&& Utils.valueExists(EmpInfoEmgName)) {
					this._wizard.validateStep(this.byId('PrimaryStep'))
				} else {
					this._wizard.invalidateStep(this.byId('PrimaryStep'))
				}
			} catch (error) {
				MessageToast.show(error.message)
				console.error(error)
			}
		},

		onSecondaryDetailsLiveChange: function () {
			try {
				const { EmpInfoAddrLoc, EmpInfoRegionLoc, EmpInfoStateLoc, EmpInfoCountryLoc, EmpInfoPostLoc, EmpInfoAddrSame } = this._registerModel.getData()
				if (Utils.valueExists(EmpInfoAddrLoc) && Utils.valueExists(EmpInfoRegionLoc) && Utils.valueExists(EmpInfoStateLoc) && Utils.valueExists(EmpInfoCountryLoc) && Utils.valueExists(EmpInfoPostLoc)) {
					this._wizard.validateStep(this.byId('SecondaryStep'))
				} else {
					this._wizard.invalidateStep(this.byId('SecondaryStep'))
				}
				if (EmpInfoAddrSame) {
					this._validateSameAsAddress(EmpInfoAddrSame)
				}
			} catch (error) {
				MessageToast.show(error.message)
				console.error(error)
			}
		},

		onIdentificationDetailsLiveChange: function () {
			try {
				const { EmpIdPAN, EmpIdAadhar } = this._registerModel.getData()
				if (Utils.valueExists(EmpIdPAN) && Utils.valueExists(EmpIdAadhar)) {
					this._wizard.validateStep(this.byId('IdentificationStep'))
				} else {
					this._wizard.invalidateStep(this.byId('IdentificationStep'))
				}
			} catch (error) {
				MessageToast.show(error.message)
				console.error(error)
			}
		},

		onCreateEmployeeWizardComplete: function () {
			this._navContainer.to(this._reviewPage)
		},

		_backToWizardContent: function () {
			this._navContainer.backToPage(this._registerPage.getId())
		},

		_handleNavigationToStep: function (stepNumber) {
			const afterNavigate = function () {
				this._wizard.goToStep(this._wizard.getSteps()[stepNumber])
				this._navContainer.detachAfterNavigate(afterNavigate)
			}.bind(this)

			this._navContainer.attachAfterNavigate(afterNavigate)
			this._backToWizardContent()
		},

		editStepOne: function () {
			this._handleNavigationToStep(0)
		},

		editStepTwo: function () {
			this._handleNavigationToStep(1)
		},

		editStepThree: function () {
			this._handleNavigationToStep(2)
		},

		onEmployeeCreateButtonPress: function () {
			try {
				const empployeeData = this._registerModel.getData()
				console.log('send data to backend', empployeeData)
			} catch (error) {
				console.log(error)
				MessageToast.show(error.message)
			}
		},

		onReviewPageNavButtonPress: function () {
			this._navContainer.to(this._registerPage)
		},

		onSameAsLocalAddressCheckBoxSelect: function (event) {
			const isSelected = event.getSource().getSelected()
			this._validateSameAsAddress(isSelected)
		},

		_validateSameAsAddress: function (isSelected) {
			const { EmpInfoAddrLoc, EmpInfoRegionLoc, EmpInfoStateLoc, EmpInfoCountryLoc, EmpInfoPostLoc } = this._registerModel.getData()
			if (isSelected) {
				this._registerModel.setProperty('/EmpInfoAddrPerm', EmpInfoAddrLoc)
				this._registerModel.setProperty('/EmpInfoRegionPerm', EmpInfoRegionLoc)
				this._registerModel.setProperty('/EmpInfoStatePerm', EmpInfoStateLoc)
				this._registerModel.setProperty('/EmpInfoCountryPerm', EmpInfoCountryLoc)
				this._registerModel.setProperty('/EmpInfoPostPerm', EmpInfoPostLoc)
			}
		},

		onFileUploadChange: function (event) {
			const file = event.getParameter('file')
			if (file) {
				console.log('Received file:', file)
				// use for upload later
			}
		},

		customEMailType: SimpleType.extend('email', {
			formatValue: function (value) {
				return value
			},

			parseValue: function (value) {
				return value
			},

			validateValue: function (value) {
				const rexMail = /^\w+[\w-+.]*@utegration.com$/
				if (!value.match(rexMail)) {
					throw new ValidateException('\'' + value + '\' is not a valid e-mail address')
				}
			}
		})
	})
})
