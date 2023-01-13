'use strict';

const { St, GObject } = imports.gi;
const { Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TadoBaseItem = Me.imports.TadoBaseItem;

try {
  /////////////////////////////////////////////////////////
  // TadoHeader
  /////////////////////////////////////////////////////////
  var TadoTextMenuItem = GObject.registerClass({
    GTypeName: "TadoTextMenuItem"
  }, class TadoTextMenuItem extends TadoBaseItem.TadoBaseItem {
    constructor(str, helpers) {
      super(helpers);

      let disclaimer_label = new St.Label(
        {
          text: str,
          x_expand: true,
          y_expand: true,
          style_class: 'disclaimer',
          width: 300
        }
      );

      this._box.add_child(disclaimer_label);
      this.add_child(this._box);
      this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px';
    }
  });
} catch (error) {
  log(error);
}