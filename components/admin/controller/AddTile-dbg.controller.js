sap.ui.define([
	'com/alarhoo/empflowyee/controller/BaseController',
	'sap/m/MessageBox'
], function (Controller, MessageBox) {
	'use strict'

	return Controller.extend('com.alarhoo.empflowyee.components.admin.controller.AddTile', {

		onInit: function () {
			this._getTilesData()
		},

		_getTilesData: function () {
			// Flatten tile data from all groups into one array
			const rawData = this.getOwnerComponent().getModel('launchpad').getData()
			const allTiles = []
			rawData.groups.forEach(group => {
				group.tiles.forEach(tile => {
					allTiles.push({ ...tile, group: group.title })
				})
			})
			const model = new sap.ui.model.json.JSONModel({ allTiles })
			this.getView().setModel(model)
		},

		onEditTile: function (oEvent) {
			const context = oEvent.getSource().getBindingContext()
			const tileData = context.getObject()
			if (!this._addDialog) {
				this._addDialog = sap.ui.xmlfragment('com.alarhoo.empflowyee.components.admin.fragments.AddEditTile', this)
				this.getView().addDependent(this._addDialog)
			}
			this._addDialog.setModel(new sap.ui.model.json.JSONModel({ isEdit: true, tile: { ...tileData } }))
			this._addDialog.open()
		},

		onAddTile: function () {
			if (!this._addDialog) {
				this._addDialog = sap.ui.xmlfragment('com.alarhoo.empflowyee.components.admin.fragments.AddEditTile', this)
				this.getView().addDependent(this._addDialog)
			}
			this._addDialog.setModel(new sap.ui.model.json.JSONModel({ isEdit: false, tile: {} }))
			this._addDialog.open()
		},

		onDeleteTile: function (oEvent) {
			const context = oEvent.getSource().getBindingContext()
			const tileData = context.getObject()
			MessageBox.confirm(`Are you sure you want to delete the tile: ${tileData.title}?`, {
				onClose: (sAction) => {
					if (sAction === MessageBox.Action.OK) {
						// remove from model
						const model = this.getView().getModel()
						const allTiles = model.getProperty('/allTiles').filter(t => t !== tileData)
						model.setProperty('/allTiles', allTiles)
					}
				}
			})
		},

		onSaveTile: function () {
			const data = this._addDialog.getModel().getData()
			const model = this.getView().getModel()
			const allTiles = model.getProperty('/allTiles')

			if (data.isEdit) {
				const index = allTiles.findIndex(t => t.title === data.tile.title && t.group === data.tile.group)
				if (index !== -1) allTiles[index] = data.tile
			} else {
				allTiles.push(data.tile)
			}

			model.setProperty('/allTiles', allTiles)
			this._addDialog.close()
		},

		onCancelTile: function () {
			this._addDialog.close()
		}
	})
})
