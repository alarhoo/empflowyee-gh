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
				console.log(flatData)
				flatData = [
					{
						'id': '100',
						'name': 'Michael',
						'lastName': 'Scott',
						'email': 'MSCOTT',
						'position': 'Regional Manager',
						'job_id': 'REG_MGR',
						'job_min_salary': '5000',
						'job_max_salary': '8000',
						'salary': '7500',
						'phone_number': '570.555.0100',
						'department_id': '01',
						'department_name': 'Management',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1710',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2001-04-01T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/d/dc/MichaelScott.png',
						'parentId': '115'
					},
					{
						'id': '101',
						'name': 'Dwight',
						'lastName': 'Schrute',
						'email': 'DSCHRUTE',
						'position': 'Assistant Regional Manager',
						'job_id': 'ASST_MGR',
						'salary': '6000',
						'job_min_salary': '4000',
						'job_max_salary': '7000',
						'phone_number': '570.555.0101',
						'department_id': '02',
						'department_name': 'Sales',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1720',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2002-06-15T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/c/cd/Dwight_Schrute.jpg',
						'parentId': '100'
					},
					{
						'id': '102',
						'name': 'Jim',
						'lastName': 'Halpert',
						'email': 'JHALPERT',
						'position': 'Sales Representative',
						'job_id': 'SALES_REP',
						'salary': '4500',
						'job_min_salary': '3000',
						'job_max_salary': '6000',
						'phone_number': '570.555.0102',
						'department_id': '02',
						'department_name': 'Sales',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1720',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2003-03-20T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/7/7e/Jim-halpert.jpg',
						'parentId': '101'
					},
					{
						'id': '103',
						'name': 'Pam',
						'lastName': 'Beesly',
						'email': 'PBEESLY',
						'position': 'Receptionist',
						'job_id': 'RECEP',
						'salary': '3000',
						'job_min_salary': '2500',
						'job_max_salary': '4000',
						'phone_number': '570.555.0103',
						'department_id': '03',
						'department_name': 'Administration',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1730',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2003-01-15T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/6/67/Pam_Beesley.jpg',
						'parentId': '100'
					},
					{
						'id': '104',
						'name': 'Angela',
						'lastName': 'Martin',
						'email': 'AMARTIN',
						'position': 'Senior Accountant',
						'job_id': 'ACC_SNR',
						'salary': '4200',
						'job_min_salary': '3000',
						'job_max_salary': '5000',
						'phone_number': '570.555.0104',
						'department_id': '04',
						'department_name': 'Accounting',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1740',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2003-07-01T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/0/0b/Angela_Martin.jpg',
						'parentId': '100'
					},
					{
						'id': '105',
						'name': 'Kevin',
						'lastName': 'Malone',
						'email': 'KMALONE',
						'position': 'Accountant',
						'job_id': 'ACC',
						'salary': '3500',
						'job_min_salary': '2500',
						'job_max_salary': '4500',
						'phone_number': '570.555.0105',
						'department_id': '04',
						'department_name': 'Accounting',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1740',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2004-03-12T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/6/60/Office-1200-baumgartner1.jpg',
						'parentId': '104'
					},
					{
						'id': '106',
						'name': 'Oscar',
						'lastName': 'Martinez',
						'email': 'OMARTINEZ',
						'position': 'Accountant',
						'job_id': 'ACC',
						'salary': '3700',
						'job_min_salary': '2500',
						'job_max_salary': '4500',
						'phone_number': '570.555.0106',
						'department_id': '04',
						'department_name': 'Accounting',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1740',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2004-04-10T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/5/54/Oscar_Martinez_of_The_Office.jpg',
						'parentId': '104'
					},
					{
						'id': '107',
						'name': 'Stanley',
						'lastName': 'Hudson',
						'email': 'SHUDSON',
						'position': 'Sales Representative',
						'job_id': 'SALES_REP',
						'salary': '4600',
						'job_min_salary': '3000',
						'job_max_salary': '6000',
						'phone_number': '570.555.0107',
						'department_id': '02',
						'department_name': 'Sales',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1720',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2002-11-01T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/9/91/Ryan_Howard_%28The_Office%29.jpg',
						'parentId': '101'
					},
					{
						'id': '108',
						'name': 'Meredith',
						'lastName': 'Palmer',
						'email': 'MPALMER',
						'position': 'Supplier Relations',
						'job_id': 'SUPPLY_REP',
						'salary': '3100',
						'job_min_salary': '2500',
						'job_max_salary': '4000',
						'phone_number': '570.555.0108',
						'department_id': '05',
						'department_name': 'Purchasing',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1750',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2003-09-01T00:00:00.000Z',
						'image': 'https://www.peacocktv.com/dam/growth/assets/Library/TheOffice/office-character-meredith-min.png',
						'parentId': '100'
					},
					{
						'id': '109',
						'name': 'Kelly',
						'lastName': 'Kapoor',
						'email': 'KKAPOOR',
						'position': 'Customer Service Rep',
						'job_id': 'CUST_SERV',
						'salary': '3200',
						'job_min_salary': '2500',
						'job_max_salary': '4000',
						'phone_number': '570.555.0109',
						'department_id': '06',
						'department_name': 'Customer Relations',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1760',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2003-10-12T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/6/69/Kelly_Kapoor.jpg',
						'parentId': '100'
					},
					{
						'id': '110',
						'name': 'Creed',
						'lastName': 'Bratton',
						'email': 'CBRATTON',
						'position': 'Quality Assurance',
						'job_id': 'QA',
						'salary': '3600',
						'job_min_salary': '2800',
						'job_max_salary': '4600',
						'phone_number': '570.555.0110',
						'department_id': '07',
						'department_name': 'Quality Control',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1770',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2002-08-01T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Creed_Bratton_2019_%2848474439927%29_CROPPED.jpg/500px-Creed_Bratton_2019_%2848474439927%29_CROPPED.jpg',
						'parentId': '100'
					},
					{
						'id': '111',
						'name': 'Andy',
						'lastName': 'Bernard',
						'email': 'ABERNARD',
						'position': 'Sales Director',
						'job_id': 'SALES_DIR',
						'salary': '5200',
						'job_min_salary': '4000',
						'job_max_salary': '7000',
						'phone_number': '570.555.0111',
						'department_id': '02',
						'department_name': 'Sales',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1720',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2005-02-01T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/8/84/Andy_Bernard_photoshot.jpg',
						'parentId': '100'
					},
					{
						'id': '112',
						'name': 'Toby',
						'lastName': 'Flenderson',
						'email': 'TFLENDERSON',
						'position': 'HR Representative',
						'job_id': 'HR_REP',
						'salary': '4000',
						'job_min_salary': '3000',
						'job_max_salary': '5000',
						'phone_number': '570.555.0112',
						'department_id': '08',
						'department_name': 'Human Resources',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1780',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2002-10-01T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/PaulLieberstein.jpg/500px-PaulLieberstein.jpg',
						'parentId': '100'
					},
					{
						'id': '113',
						'name': 'Ryan',
						'lastName': 'Howard',
						'email': 'RHOWARD',
						'position': 'Temp',
						'job_id': 'TEMP',
						'salary': '2800',
						'job_min_salary': '2000',
						'job_max_salary': '3500',
						'phone_number': '570.555.0113',
						'department_id': '02',
						'department_name': 'Sales',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1720',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2004-01-10T00:00:00.000Z',
						'image': 'https://upload.wikimedia.org/wikipedia/en/9/91/Ryan_Howard_%28The_Office%29.jpg',
						'parentId': '101'
					},
					{
						'id': '114',
						'name': 'Darryl',
						'lastName': 'Philbin',
						'email': 'DPHILBIN',
						'position': 'Warehouse Manager',
						'job_id': 'WARE_MGR',
						'salary': '4300',
						'job_min_salary': '3000',
						'job_max_salary': '5000',
						'phone_number': '570.555.0114',
						'department_id': '09',
						'department_name': 'Warehouse',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1790',
						'department_location_postal_code': '18505',
						'department_location_street_address': '1725 Slough Ave',
						'location_state': 'Pennsylvania',
						'hire_date': '2003-06-01T00:00:00.000Z',
						'image': 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSw7fJbskykoOb9Xp8QTnn_gcxGuhM7GjCMuu1VliRNt9nC_24iCuZg-Cx9PRiCw_iPQ7LBYSQqF0rEGehq3um5saFP0BktExFk94RKrw',
						'parentId': '100'
					},
					{
						'id': '115',
						'name': 'Jan',
						'lastName': 'Levinson',
						'email': 'JLEVINSON',
						'position': 'VP, Northeast Sales',
						'job_id': 'VP_SALES',
						'salary': '8500',
						'job_min_salary': '7000',
						'job_max_salary': '9500',
						'phone_number': '212.555.0115',
						'department_id': '10',
						'department_name': 'Corporate',
						'department_location_country_id': 'US',
						'department_location_country_name': 'United States of America',
						'department_location_country_region_id': '2',
						'department_location_country_region_name': 'Americas',
						'department_location_id': '1800',
						'department_location_postal_code': '10001',
						'department_location_street_address': '123 Corporate Plaza',
						'location_state': 'New York',
						'hire_date': '1999-01-01T00:00:00.000Z',
						'image': 'https://static.wikia.nocookie.net/loveinterest/images/4/49/Jan-the-office--28us-29-34544_895_1024.jpg',
						'parentId': null
					}
				]
				console.log(flatData)

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
                        <div style="font-family: 'Inter', sans-serif;background-color:${color};  margin-left:-1px;width:${d.width - 2}px;height:${d.height - imageDiffVert}px;border-radius:10px;border: ${d.data._highlighted || d.data._upToTheRootHighlighted ? '5px solid #E27396"' : '1px solid #E4E2E9"'}>
                            <div style="display:flex;justify-content:flex-end;margin-top:5px;margin-right:8px">#${d.data.id}</div><div style="background-color:${color};margin-top:${-imageDiffVert - 20}px;margin-left:${15}px;border-radius:100px;width:50px;height:50px;"></div><div style="margin-top:${-imageDiffVert - 20}px;">   <img src=" ${d.data.image}" style="margin-left:${20}px;border-radius:100px;width:40px;height:40px;" /></div><div style="font-size:15px;color:#08011E;margin-left:20px;margin-top:10px">  ${d.data.name} </div><div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;"> ${d.data.position} </div>
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
