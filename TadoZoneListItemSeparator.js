'use strict';

const { St, GObject } = imports.gi;
const { Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TadoBaseItem = Me.imports.TadoBaseItem;

try {
  /////////////////////////////////////////////////////////
  // TadoZoneListItemSeparator
  /////////////////////////////////////////////////////////
  var TadoZoneListItemSeparator = GObject.registerClass({
    GTypeName: "TadoZoneListItemSeparator"
  }, class TadoZoneListItemSeparator extends TadoBaseItem.TadoBaseItem {
    constructor(helpers) {
      super(helpers);

      let col = 'rgba(%d, %d, %d, %.2f)'.format(66, 66, 66, 255);
      this.height = 1;
      this.actor.style = 'background-color: ' + col + '; margin-top: 3px; margin-bottom: 3px; margin-left: 35px; margin-right: 35px';
    }
  });
} catch (error) {
  log(error);
}