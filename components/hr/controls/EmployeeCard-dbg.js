sap.ui.define([
	'sap/ui/core/Control'
], function (Control) {
	'use strict'

	return Control.extend('com.alarhoo.empflowyee.components.hr.controls.EmployeeCard', {
		metadata: {
			properties: {
				name: 'string',
				location: 'string',
				email: 'string',
				phone: 'string',
				skills: 'string',
				experience: 'string',
				salary: 'string',
				startDate: 'string',
				photo: 'string'
			},
			aggregations: {},
			events: {
				press: {}
			}
		},

		renderer: function (oRM, oControl) {
			oRM.write('<div')
			oRM.writeControlData(oControl)
			oRM.addClass('empCard')
			oRM.writeClasses()
			oRM.write('>')

			// Avatar & header
			oRM.write('<div class=\'empCard-header\'>')
			oRM.write(`<img class='empCard-photo' src='${oControl.getPhoto()}' alt='Photo' />`)
			oRM.write('<div class=\'empCard-details\'>')
			oRM.write(`<h3 class='empCard-name'>${oControl.getName()}</h3>`)
			oRM.write(`<p class='empCard-location'>${oControl.getLocation()}</p>`)
			oRM.write(`<p class='empCard-contact'>${oControl.getEmail()}<br/>${oControl.getPhone()}</p>`)
			oRM.write('</div></div>')

			// Info section
			oRM.write('<div class=\'empCard-info\'>')
			oRM.write(`<p><strong>Skills:</strong> ${oControl.getSkills()}</p>`)
			oRM.write(`<p><strong>Experience:</strong> ${oControl.getExperience()}</p>`)
			oRM.write(`<p><strong>Salary:</strong> ${oControl.getSalary()}</p>`)
			oRM.write(`<p><strong>Start Date:</strong> ${oControl.getStartDate()}</p>`)
			oRM.write('</div>')

			// Footer
			oRM.write('<div class=\'empCard-footer\'>')
			oRM.write('<button class=\'empCard-btn\' onclick=\'')
			oRM.write(`${oControl.getId()}.firePress()`)
			oRM.write('\'>View Full Resume</button>')
			oRM.write('<button class=\'empCard-like\'>♡</button>')
			oRM.write('</div>')

			oRM.write('</div>')
		}
	})
})
