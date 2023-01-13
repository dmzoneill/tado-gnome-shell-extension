'use strict'

const { St, GObject } = imports.gi // eslint-disable-line
const { Gio } = imports.gi // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoBaseItem = Me.imports.TadoBaseItem

try {
  /// //////////////////////////////////////////////////////
  // TadoHeader
  /// //////////////////////////////////////////////////////
  var TadoTextMenuItem = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoTextMenuItem'
  }, class TadoTextMenuItem extends TadoBaseItem.TadoBaseItem {
    constructor (str, helpers) {
      super(helpers)

      const disclaimerLabel = new St.Label(
        {
          text: str,
          x_expand: true,
          y_expand: true,
          style_class: 'disclaimer',
          width: 300
        }
      )

      this._box.add_child(disclaimerLabel)
      this.add_child(this._box)
      this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px'
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
