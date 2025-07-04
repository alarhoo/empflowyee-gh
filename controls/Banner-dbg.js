sap.ui.define([
	'sap/ui/core/Control'
], function (Control) {
	'use strict'

	return Control.extend('com.alarhoo.empflowyee.controls.Banner', {
		metadata: {
			properties: {
				backgroundSrc: { type: 'string', defaultValue: '/components/hr/img/triangunal.svg' },
				backgroundSize: { type: 'string', defaultValue: 'cover' },
				width: { type: 'sap.ui.core.CSSSize', defaultValue: '100%' },
				height: { type: 'sap.ui.core.CSSSize', defaultValue: '10rem' }
			},
			defaultAggregation: 'content',
			aggregations: {
				content: {
					type: 'sap.ui.core.Control',
					multiple: true,
					singularName: 'content'
				}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function (rm, control) {
				rm.openStart('div', control)
				rm.class('customBanner')
				rm.style('background-image', `url('${control.getBackgroundSrc()}')`)
				rm.style('background-size', control.getBackgroundSize())
				rm.style('width', control.getWidth())
				rm.style('height', control.getHeight())
				rm.style('display', 'flex')
				rm.style('flex-direction', 'column')
				rm.style('justify-content', 'center')
				rm.style('align-items', 'center')
				rm.style('color', '#fff')
				rm.style('text-align', 'center')
				rm.style('padding', '1rem')
				rm.style('border-radius', '12px')
				rm.openEnd()

				control.getContent().forEach(function (child) {
					rm.renderControl(child)
				})

				rm.close('div')
			}
		}
	})
})
