'use strict';

const { St, GObject } = imports.gi;
const { Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TadoBaseItem = Me.imports.TadoBaseItem;

/////////////////////////////////////////////////////////
// TadoHeader
/////////////////////////////////////////////////////////
var TadoHeader = GObject.registerClass({
  GTypeName: "TadoHeader"
}, class TadoHeader extends TadoBaseItem.TadoBaseItem {
  constructor(helpers) {
    super(helpers);

    this.height = 60;
    let button = this.makeButton('TADOSIZED', false);
    this._box.add_child(button);
    this.add_child(this._box);
    this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px';
  }
});