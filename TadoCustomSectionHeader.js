'use strict'

const { St, GObject } = imports.gi // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoBaseItem = Me.imports.TadoBaseItem

try {
  /// //////////////////////////////////////////////////////
  // TadoCustomSectionHeader
  /// //////////////////////////////////////////////////////
  var TadoCustomSectionHeader = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoCustomSectionHeader'
  }, class TadoCustomSectionHeader extends TadoBaseItem.TadoBaseItem {
    constructor (str, helpers) {
      super(helpers)

      const zonesLabel = new St.Label(
        {
          text: str,
          x_expand: true,
          style_class: 'section-header-label'
        }
      )

      this._box.add(zonesLabel)
      this.add_child(this._box)
      this.set_style_class_name('section-header-label')
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
