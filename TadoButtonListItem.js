'use strict';

const { St, GObject } = imports.gi;
const { Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TadoBaseItem = Me.imports.TadoBaseItem;

/////////////////////////////////////////////////////////
// TadoButtonListItem
/////////////////////////////////////////////////////////
var TadoButtonListItem = GObject.registerClass({
  GTypeName: "TadoButtonListItem"
}, class TadoButtonListItem extends TadoBaseItem.TadoBaseItem {
  constructor(items, helpers) {
    super(helpers);

    for (let t = 0; t < items.length; t++) {
      let item = items[t];
      if (Array.isArray(item)) {
        let button = this.makeButton(item[0], item[1]);
        this._box.add_child(button);
      }
      else {
        this._box.add_child(item);
      }
    }

    this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px';
    this.add_child(this._box);
  }
});
