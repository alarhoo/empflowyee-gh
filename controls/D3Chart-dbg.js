sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/HTML',
	'sap/ui/core/ResizeHandler',
	'sap/m/MessageToast',
	'./../lib/d3.v7.min',
	'./../lib/d3-org-chart',
	'./../lib/d3-flextree'
], function (Control, HTML, ResizeHandler, MessageToast) {
	'use strict'

	return Control.extend('com.alarhoo.empflowyee.controls.D3Chart', {
		metadata: {
			properties: {
				chartType: { type: 'string', defaultValue: 'bar' },
				title: { type: 'string', defaultValue: '' },
				height: { type: 'string', defaultValue: '400' },
				xAxisLabel: { type: 'string', defaultValue: '' },
				yAxisLabel: { type: 'string', defaultValue: '' },
				showLegend: { type: 'boolean', defaultValue: false }
			},
			aggregations: {
				htmlContainer: {
					type: 'sap.ui.core.HTML',
					multiple: false,
					visibility: 'hidden'
				},
				data: {
					type: 'sap.ui.base.ManagedObject'
				}
			}
		},

		init: function () {
			this._containerId = this.getId() + '--chart-container'
			this.setAggregation('htmlContainer', new HTML({
				content: `<svg id="${this._containerId}" style="height: '100%'"></svg>`
			}))
		},

		exit: function () {
			if (this._resizeHandlerId) {
				ResizeHandler.deregister(this._resizeHandlerId)
			}
		},

		renderer: {
			apiVersion: 2,
			render: function (renderManager, control) {
				renderManager.openStart('div', control)
				renderManager.class('d3-chart')
				renderManager.openEnd()
				renderManager.renderControl(control.getAggregation('htmlContainer'))
				renderManager.close('div')
			}
		},

		onBeforeRendering: function () {
			if (this._resizeHandlerId) {
				ResizeHandler.deregister(this._resizeHandlerId)
			}
		},

		onAfterRendering: function () {
			this._resizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this))
			this._renderChart()
		},

		_onResize: function () {
			this._renderChart()
		},

		_renderChart: function () {
			const svg = d3.select(`#${this._containerId}`)
			svg.selectAll('*').remove()

			const width = this.$().width()
			const height = this.getHeight()
			svg.attr('width', width)
			svg.attr('height', height)

			try {
				const binding = this.getBinding('data')
				if (!binding) {
					throw new Error('No data binding found.')
				}

				const data = binding.getContexts().map(context => context.getObject())
				if (!Array.isArray(data) || data.length === 0) {
					throw new Error('No data found to render chart.')
				}

				const chartType = this.getChartType()
				switch (chartType) {
				case 'bubble':
					this._renderBubbleChart(svg, width, height, data)
					break
				case 'bar':
					this._renderBarChart(svg, width, height, data)
					break
				case 'groupedBar':
					this._renderGroupedBarChart(svg, width, height, data)
					break
				case 'pie':
					this._renderPieChart(svg, width, height, data)
					break
				case 'microDonut':
					this._renderMicroDonutChart(svg, width, height, data)
					break
				case 'org':
					this._renderOrgChart(`#${this._containerId}`, data)
					break
				default:
					throw new Error(`Unsupported chart type: ${chartType}`)
				}

				// Title
				if (this.getTitle()) {
					svg.append('text')
						.attr('x', width / 2)
						.attr('y', 20)
						.attr('text-anchor', 'middle')
						.style('font-size', '16px')
						.style('font-weight', 'bold')
						.text(this.getTitle())
				}

				// Axis Labels
				if (this.getXAxisLabel()) {
					svg.append('text')
						.attr('x', width / 2)
						.attr('y', height - 10)
						.attr('text-anchor', 'middle')
						.text(this.getXAxisLabel())
				}
				if (this.getYAxisLabel()) {
					svg.append('text')
						.attr('text-anchor', 'middle')
						.attr('transform', `translate(15, ${height / 2}) rotate(-90)`)
						.text(this.getYAxisLabel())
				}

				// Legend
				if (this.getShowLegend()) {
					const chartType = this.getChartType()
					const data = binding.getContexts().map(ctx => ctx.getObject())
					const colorDomain = Array.from(new Set(
						chartType === 'groupedBar'
							? data.flatMap(d => d.values.map(v => v.category))
							: data.map(d => d.name || d.category || d.group)
					))
					const color = d3.scaleOrdinal()
						.domain(colorDomain)
						.range(d3.schemeCategory10)

					const legend = svg.append('g')
						.attr('transform', `translate(${width - 120}, 40)`)

					legend.selectAll('rect')
						.data(colorDomain)
						.enter().append('rect')
						.attr('x', 0)
						.attr('y', (d, i) => i * 20)
						.attr('width', 12)
						.attr('height', 12)
						.attr('fill', d => color(d))

					legend.selectAll('text')
						.data(colorDomain)
						.enter().append('text')
						.attr('x', 18)
						.attr('y', (d, i) => i * 20 + 10)
						.text(d => d)
				}
			} catch (err) {
				svg.append('text')
					.attr('x', '50%')
					.attr('y', '50%')
					.attr('dominant-baseline', 'middle')
					.attr('text-anchor', 'middle')
					.attr('fill', '#999')
					.style('font-size', '14px')
					.text(`Unable to render chart: ${err.message}`)

				MessageToast.show(`Chart rendering failed: ${err.message}`)
				console.error(err)
			}
		},

		_renderBubbleChart: function (svg, width, height, data) {
			const format = d3.format(',d')

			// Get unique group values (domain)
			const groups = Array.from(new Set(data.map(d => d.group)))

			const color = d3.scaleOrdinal()
				.domain(groups)
				.range(d3.schemeCategory10)

			const pack = d3.pack()
				.size([width - 2, height - 2])
				.padding(3)

			const root = pack(
				d3.hierarchy({ children: data }).sum(d => d.value)
			)

			svg.attr('viewBox', [0, 0, width, height])
				.attr('font-size', 10)
				.attr('font-family', 'sans-serif')
				.attr('text-anchor', 'middle')

			const leaf = svg.selectAll('g')
				.data(root.leaves())
				.join('g')
				.attr('transform', d => `translate(${d.x + 1},${d.y + 1})`)

			leaf.append('circle')
				.attr('r', d => d.r)
				.attr('fill-opacity', 0.7)
				.attr('fill', d => color(d.data.group))

			leaf.append('text')
				.text(d => d.data.name)

			leaf.append('title')
				.text(d => `${d.data.title}\n${format(d.data.value)}`)
		},

		_renderBarChart: function (svg, width, height, data) {
			const margin = { top: 20, right: 30, bottom: 40, left: 40 }
			const chartWidth = width - margin.left - margin.right
			const chartHeight = height - margin.top - margin.bottom

			const x = d3.scaleBand()
				.domain(data.map(d => d.name))
				.range([0, chartWidth])
				.padding(0.1)

			const y = d3.scaleLinear()
				.domain([0, d3.max(data, d => d.value)]).nice()
				.range([chartHeight, 0])

			const group = svg.append('g')
				.attr('transform', `translate(${margin.left},${margin.top})`)

			group.append('g').call(d3.axisLeft(y))

			group.append('g')
				.attr('transform', `translate(0,${chartHeight})`)
				.call(d3.axisBottom(x))

			group.selectAll('rect')
				.data(data)
				.enter().append('rect')
				.attr('x', d => x(d.name))
				.attr('y', d => y(d.value))
				.attr('height', d => chartHeight - y(d.value))
				.attr('width', x.bandwidth())
				.attr('fill', 'steelblue')
		},

		_renderGroupedBarChart: function (svg, width, height, data) {
			const margin = { top: 20, right: 30, bottom: 50, left: 50 }
			const chartWidth = width - margin.left - margin.right
			const chartHeight = height - margin.top - margin.bottom

			const allGroups = data.map(d => d.group)
			const allCategories = data[0]?.values.map(v => v.category) || []

			const x0 = d3.scaleBand()
				.domain(allGroups)
				.rangeRound([0, chartWidth])
				.paddingInner(0.1)

			const x1 = d3.scaleBand()
				.domain(allCategories)
				.rangeRound([0, x0.bandwidth()])
				.padding(0.05)

			const y = d3.scaleLinear()
				.domain([0, d3.max(data, d => d3.max(d.values, v => v.value))])
				.nice()
				.rangeRound([chartHeight, 0])

			const color = d3.scaleOrdinal()
				.domain(allCategories)
				.range(d3.schemeCategory10)

			const chartGroup = svg.append('g')
				.attr('transform', `translate(${margin.left},${margin.top})`)

			chartGroup.append('g')
				.call(d3.axisLeft(y))

			chartGroup.append('g')
				.attr('transform', `translate(0,${chartHeight})`)
				.call(d3.axisBottom(x0))

			const group = chartGroup.selectAll('g.layer')
				.data(data)
				.join('g')
				.attr('class', 'layer')
				.attr('transform', d => `translate(${x0(d.group)},0)`)

			group.selectAll('rect')
				.data(d => d.values)
				.join('rect')
				.attr('x', d => x1(d.category))
				.attr('y', d => y(d.value))
				.attr('width', x1.bandwidth())
				.attr('height', d => chartHeight - y(d.value))
				.attr('fill', d => color(d.category))
		},

		_renderPieChart: function (svg, width, height, data) {
			const radius = Math.min(width, height) / 2 - 40
			const g = svg.append('g')
				.attr('transform', `translate(${width / 2}, ${height / 2})`)

			const pie = d3.pie()
				.value(d => d.value)
				.sort(null)

			const arc = d3.arc()
				.innerRadius(0)
				.outerRadius(radius)

			const arcLabel = d3.arc()
				.innerRadius(radius * 0.6)
				.outerRadius(radius * 0.6)

			const color = d3.scaleOrdinal(d3.schemeCategory10)

			const pieData = pie(data)

			const total = d3.sum(data, d => d.value)

			// Draw pie paths
			g.selectAll('path')
				.data(pieData)
				.enter()
				.append('path')
				.attr('d', arc)
				.attr('fill', d => color(d.data.name))
				.attr('stroke', 'white')
				.attr('stroke-width', 1.5)
				.append('title')
				.text(d => `${d.data.name}: ${d.data.value} (${((d.data.value / total) * 100).toFixed(1)}%)`)

			// Add labels inside pie
			g.selectAll('text')
				.data(pieData)
				.enter()
				.append('text')
				.attr('transform', d => `translate(${arcLabel.centroid(d)})`)
				.attr('text-anchor', 'middle')
				.attr('font-size', '10px')
				.attr('fill', '#fff')
				.text(d => {
					const percent = (d.data.value / total) * 100
					return percent >= 5 ? `${d.data.name}\n${percent.toFixed(1)}%` : ''
				})
		},

		_renderMicroDonutChart: function (svg, width, height, data) {
			const centerTextSize = '16px'
			const centerTextColor = 'red'

			// Calculate radius based on the smaller dimension to fit within the container
			const outerRadius = Math.min(width, height) / 2 - 10 // -10 for a small margin
			const innerRadius = outerRadius * 0.6 // Inner radius for donut hole

			const g = svg.append('g')
				.attr('transform', `translate(${width / 2}, ${height / 2})`)

			const pie = d3.pie()
				.value(d => d.value)
				.sort(null) // Do not sort slices

			const arc = d3.arc()
				.innerRadius(innerRadius)
				.outerRadius(outerRadius)

			const color = d3.scaleOrdinal(d3.schemeCategory10) // Or use a custom color scheme

			const pieData = pie(data)

			const total = d3.sum(data, d => d.value)
			const firstSliceValue = data.length > 0 ? data[0].value : 0
			const percentage = total > 0 ? ((firstSliceValue / total) * 100).toFixed(0) : '0' // Round to 0 decimal places

			// Draw donut paths
			g.selectAll('path')
				.data(pieData)
				.enter()
				.append('path')
				.attr('d', arc)
				.attr('fill', d => color(d.data.name || d.index)) // Use name or index for color mapping
				.attr('stroke', 'white')
				.attr('stroke-width', 1.5)
				.append('title') // Add tooltip
				.text(d => `${d.data.name || `Slice ${d.index + 1}`}: ${d.data.value} (${((d.data.value / total) * 100).toFixed(1)}%)`)

			// Add center text
			g.append('text')
				.attr('text-anchor', 'middle')
				.attr('dy', '0.35em') // Vertically center the text
				.style('font-size', centerTextSize)
				.style('fill', centerTextColor)
				.text(`${percentage}%`) // Display percentage of the first slice

			// Optionally, add a smaller text below for context
			g.append('text')
				.attr('text-anchor', 'middle')
				.attr('dy', '1.8em') // Position below the percentage
				.style('font-size', '10px')
				.style('fill', '#666')
				.text(data.length > 0 ? (data[0].name || 'Progress') : '')
		},

		_renderOrgChart: function (containerSelector, data) {
			if (!window.d3 || !window.d3.OrgChart) {
				throw new Error('d3-org-chart is not loaded.')
			}

			this._orgChart = null

			d3.csv(
				'https://raw.githubusercontent.com/bumbeishvili/sample-data/main/data-oracle.csv'
			).then((flatData) => {
				this._orgChart = new d3.OrgChart()
					.nodeHeight(() => 85 + 25)
					.nodeWidth(() => 220 + 2)
					.childrenMargin(() => 50)
					.compactMarginBetween(() => 35)
					.compactMarginPair(() => 30)
					.neighbourMargin(() => 20)
					.nodeContent(function (d) {
						const color = '#FFFFFF'
						const imageDiffVert = 25 + 2
						return `
                <div style='width:${d.width}px;height:${d.height}px;padding-top:${imageDiffVert - 2}px;padding-left:1px;padding-right:1px'>
                        <div style="font-family: 'Inter', sans-serif;background-color:${color};  margin-left:-1px;width:${d.width - 2}px;height:${d.height - imageDiffVert}px;border-radius:10px;border: ${d.data._highlighted || d.data._upToTheRootHighlighted ? '5px solid #E27396"' : '1px solid #E4E2E9"'} >
                            <div style="display:flex;justify-content:flex-end;margin-top:5px;margin-right:8px">#${d.data.id}</div><div style="background-color:${color};margin-top:${-imageDiffVert - 20}px;margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
                            <div style="margin-top:${-imageDiffVert - 20}px;">   <img src=" ${d.data.image}" style="margin-left:${20}px;border-radius:100px;width:40px;height:40px;" /></div>
                            <div style="font-size:15px;color:#08011E;margin-left:20px;margin-top:10px">  ${d.data.name} </div>
                            <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;"> ${d.data.position} </div>
                        </div>
                    </div>`
					})
					.container(containerSelector)
					.data(flatData || data)
					.render()
			})

			// this._orgChart.fullscreen()
		}
	})
})
