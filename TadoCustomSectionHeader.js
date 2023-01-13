'use strict';

const { St, GObject } = imports.gi;
const { Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TadoBaseItem = Me.imports.TadoBaseItem;

try {
  /////////////////////////////////////////////////////////
  // TadoCustomSectionHeader
  /////////////////////////////////////////////////////////
  var TadoCustomSectionHeader = GObject.registerClass({
    GTypeName: "TadoCustomSectionHeader"
  }, class TadoCustomSectionHeader extends TadoBaseItem.TadoBaseItem {

    constructor(str, helpers) {
      super(helpers);

      let zones_label = new St.Label(
        {
          text: str,
          x_expand: true,
          style_class: 'section-header-label'
        }
      );

      this._box.add(zones_label);
      this.add_child(this._box);
      this.set_style_class_name('section-header-label');
    }
  });
} catch (error) {
  log(error);
}