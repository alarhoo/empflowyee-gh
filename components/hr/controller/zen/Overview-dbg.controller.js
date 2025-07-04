sap.ui.define([
	'../BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/unified/CalendarLegendItem',
	'sap/ui/unified/DateTypeRange'
], function (Controller, JSONModel, CalendarLegendItem, DateTypeRange) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.hr.controller.zen.Overview', {

		onInit: function () {
			this._onRouteMatched()
			this._upcomingEvents()
		},

		onAfterRendering: function () {
			this._addLegendItems()
			this._highlightCalendarDates()
		},

		_onRouteMatched: function () {
			const sampleData = [
				{ name: 'Sales', value: 120 },
				{ name: 'Marketing', value: 90 },
				{ name: 'Development', value: 150 },
				{ name: 'Support', value: 70 },
				{ name: 'HR', value: 40 }
			]
			const groupedData = [
				{
					group: 'Q1',
					values: [
						{ category: 'Sales', value: 120 },
						{ category: 'HR', value: 80 },
						{ category: 'IT', value: 65 }
					]
				},
				{
					group: 'Q2',
					values: [
						{ category: 'Sales', value: 150 },
						{ category: 'HR', value: 60 },
						{ category: 'IT', value: 95 }
					]
				}
			]

			const bubbleData = [
				{ name: 'Finance', title: 'Finance Dept', group: 'Dept A', value: 100 },
				{ name: 'Sales', title: 'Sales Dept', group: 'Dept A', value: 80 },
				{ name: 'Marketing', title: 'Marketing Dept', group: 'Dept B', value: 65 },
				{ name: 'HR', title: 'HR Dept', group: 'Dept B', value: 45 },
				{ name: 'IT', title: 'IT Dept', group: 'Dept C', value: 120 },
				{ name: 'Legal', title: 'Legal Dept', group: 'Dept C', value: 50 }
			]

			const genderData = [
				{ name: 'Male', value: 120 },
				{ name: 'Female', value: 80 },
				{ name: 'Non-Binary', value: 10 },
				{ name: 'Prefer not to say', value: 5 }
			]

			const orgData =
			{
				name: 'CEO',
				children: [
					{
						name: 'CTO',
						children: [
							{ name: 'Dev Manager' },
							{ name: 'QA Manager' }
						]
					},
					{
						name: 'CFO',
						children: [
							{ name: 'Accountant' }
						]
					},
					{ name: 'COO' }
				]
			}

			const microDonutData = [
				{ name: 'Completed', value: 90 },
				{ name: 'Remaining', value: 10 }
			]
			const model = new sap.ui.model.json.JSONModel({
				chartData: sampleData,
				groupedData: groupedData,
				bubbleData: bubbleData,
				genderData: genderData,
				microDonutData: microDonutData,
				orgData: orgData,
				totalEmployees: 28,
				activeEmployees: 7,
				onLeaveToday: 3,
				pendingApprovals: 1,
				monthlyHiring: 12,
				attritionRate: 5
			})
			this.getView().setModel(model)
		},

		_upcomingEvents: function () {
			const allEvents = [
				{
					'emp_id': 'D001',
					'emp_name': 'Michael Scott',
					'emp_dob': '1964-03-15',
					'emp_age': 61,
					'date': '2025-07-15T00:00:00Z',
					'type': 'Birthday'
				},
				{
					'emp_id': 'D002',
					'emp_name': 'Jim Halpert',
					'emp_dob': '1978-10-01',
					'emp_age': 46,
					'date': '2025-07-20T00:00:00Z',
					'type': 'Birthday'
				},
				{
					'emp_id': 'D003',
					'emp_name': 'Pam Beesly',
					'emp_dob': '1979-03-25',
					'emp_age': 46,
					'date': '2025-07-30T00:00:00Z',
					'type': 'Birthday'
				},
				{
					'emp_id': 'D004',
					'emp_name': 'Dwight Schrute',
					'emp_dob': '1970-01-20',
					'emp_age': 55,
					'date': '2025-07-04T00:00:00Z',
					'type': 'Anniversary'
				},
				{
					'emp_id': 'D005',
					'emp_name': 'Dunder Mifflin Picnic Day',
					'emp_age': '',
					'date': '2025-07-04T00:00:00Z',
					'type': 'Holiday'
				}
			]

			const today = new Date()
			const next30 = new Date()
			next30.setDate(today.getDate() + 30)

			const enrichedData = allEvents.map(e => ({
				...e,
				date: new Date(e.date) // ensure JS Date
			}))
			const upcoming = enrichedData.filter(e => {
				return e.date >= today && e.date <= next30
			})

			this._allEvents = upcoming // ✅ store for reuse
			this.getView().setModel(new JSONModel({ UpcomingEvents: upcoming }), 'overview')

			today.setHours(0, 0, 0, 0)

			const maxDate = new Date(today)
			maxDate.setDate(today.getDate() + 30)

			const oModel = this.getView().getModel('overview')
			if (oModel) {
				oModel.setProperty('/minDate', today)
				oModel.setProperty('/maxDate', maxDate)
			}
		},

		_addLegendItems: function () {
			const oLegend = this.byId('legend')
			if (oLegend) {
				oLegend.setStandardItems([]) // ✅ disable defaults
				oLegend.removeAllItems()

				oLegend.addItem(new CalendarLegendItem({
					text: 'Birthday',
					type: sap.ui.unified.CalendarDayType.Type08
				}))
				oLegend.addItem(new CalendarLegendItem({
					text: 'Anniversary',
					type: sap.ui.unified.CalendarDayType.Type06
				}))
				oLegend.addItem(new CalendarLegendItem({
					text: 'Holiday',
					type: sap.ui.unified.CalendarDayType.Type01
				}))
				oLegend.addItem(new CalendarLegendItem({
					text: 'Multiple Events',
					type: sap.ui.unified.CalendarDayType.Type10
				}))
			}
		},

		_highlightCalendarDates: function () {
			const oCalendar = this.byId('calendar')
			if (!oCalendar || !this._allEvents) return

			oCalendar.removeAllSpecialDates()

			const typeMap = {
				'Birthday': sap.ui.unified.CalendarDayType.Type01,
				'Anniversary': sap.ui.unified.CalendarDayType.Type02,
				'Holiday': sap.ui.unified.CalendarDayType.Type07
			}

			const grouped = {}

			this._allEvents.forEach(event => {
				const dateKey = event.date.toISOString().split('T')[0]
				if (!grouped[dateKey]) {
					grouped[dateKey] = []
				}
				grouped[dateKey].push(event)
			})

			Object.keys(grouped).forEach(dateKey => {
				const events = grouped[dateKey]
				const jsDate = new Date(dateKey)
				const tooltipText = events.map(e => `${e.type}: ${e.emp_name || e.emp_id}`).join('\n')

				let type
				if (events.length > 1) {
					type = sap.ui.unified.CalendarDayType.Type10 // 🔴 Multiple
				} else {
					type = typeMap[events[0].type] || sap.ui.unified.CalendarDayType.None
				}

				oCalendar.addSpecialDate(new DateTypeRange({
					startDate: jsDate,
					type,
					tooltip: tooltipText
				}))
			})
		},

		_getLegendType: function (sType) {
			switch (sType) {
			case 'Birthday': return sap.ui.unified.CalendarDayType.Type08
			case 'Anniversary': return sap.ui.unified.CalendarDayType.Type06
			case 'Holiday': return sap.ui.unified.CalendarDayType.Type01
			default: return sap.ui.unified.CalendarDayType.None
			}
		},

		getHighlightFromType: function (sType) {
			switch (sType) {
			case 'Birthday': return 'Success'
			case 'Anniversary': return 'Information'
			case 'Holiday': return 'Warning'
			default: return 'None'
			}
		},

		getStateFromType: function (sType) {
			switch (sType) {
			case 'Birthday': return 'Success'
			case 'Anniversary': return 'Information'
			case 'Holiday': return 'Warning'
			default: return 'None'
			}
		}
	})
})
