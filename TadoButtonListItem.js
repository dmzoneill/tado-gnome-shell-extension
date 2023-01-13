'use strict'

const { GObject } = imports.gi // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoBaseItem = Me.imports.TadoBaseItem

try {
  /// //////////////////////////////////////////////////////
  // TadoButtonListItem
  /// //////////////////////////////////////////////////////
  var TadoButtonListItem = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoButtonListItem'
  }, class TadoButtonListItem extends TadoBaseItem.TadoBaseItem {
    constructor (items, helpers) {
      super(helpers)

      for (let t = 0; t < items.length; t++) {
        const item = items[t]
        if (Array.isArray(item)) {
          const button = this.makeButton(item[0], item[1])
          this._box.add_child(button)
        } else {
          this._box.add_child(item)
        }
      }

      this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px'
      this.add_child(this._box)
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
