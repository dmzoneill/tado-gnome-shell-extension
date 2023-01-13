'use strict';

const { St, GObject, GLib, Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TadoBaseItem = Me.imports.TadoBaseItem;
const Util = imports.misc.util;

try {
  /////////////////////////////////////////////////////////
  // TadoHeader
  /////////////////////////////////////////////////////////
  var TadoHyperlinkMenuItem = GObject.registerClass({
    GTypeName: "TadoHyperlinkMenuItem"
  }, class TadoHyperlinkMenuItem extends TadoBaseItem.TadoBaseItem {
    constructor(str, url, helpers) {
      super(helpers);

      let hyperlink_label = new St.Label(
        {
          text: str,
          x_expand: false,
          y_expand: false,
          style_class: 'hyperlink'
        }
      );

      let button = new St.Button(
        {
          x_expand: true,
          child: hyperlink_label
        }
      );

      button.connect('clicked', () => {
        try {
          let [success, argv] = GLib.shell_parse_argv("xdg-open \"" + url + "\"");
          Util.spawn(argv);
        } catch (err) {
          // log(err);
        }
      });

      this._box = new St.BoxLayout(
        {
          x_align: St.Align.MIDDLE,
          x_expand: true,
          style_class: 'clean',
          width: 300
        }
      );

      this._box.add_child(button);
      this.add_child(this._box);
      this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px';
    }
  });
} catch (error) {
  log(error);
}