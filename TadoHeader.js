'use strict'

const { GObject } = imports.gi // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoBaseItem = Me.imports.TadoBaseItem

try {
  /// //////////////////////////////////////////////////////
  // TadoHeader
  /// //////////////////////////////////////////////////////
  var TadoHeader = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoHeader'
  }, class TadoHeader extends TadoBaseItem.TadoBaseItem {
    constructor (helpers) {
      super(helpers)

      this.height = 60
      const button = this.makeButton('TADOSIZED', false)
      this._box.add_child(button)
      this.add_child(this._box)
      this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px'
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
