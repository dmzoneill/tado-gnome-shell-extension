'use strict'

const { St, GObject, GLib } = imports.gi // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoBaseItem = Me.imports.TadoBaseItem
const Util = imports.misc.util // eslint-disable-line

try {
  /// //////////////////////////////////////////////////////
  // TadoHeader
  /// //////////////////////////////////////////////////////
  var TadoHyperlinkMenuItem = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoHyperlinkMenuItem'
  }, class TadoHyperlinkMenuItem extends TadoBaseItem.TadoBaseItem {
    constructor (str, url, helpers) {
      super(helpers)

      const hyperlinkLabel = new St.Label(
        {
          text: str,
          x_expand: false,
          y_expand: false,
          style_class: 'hyperlink'
        }
      )

      const button = new St.Button(
        {
          x_expand: true,
          child: hyperlinkLabel
        }
      )

      button.connect('clicked', () => {
        try {
          const [, argv] = GLib.shell_parse_argv('xdg-open "' + url + '"')
          Util.spawn(argv)
        } catch (err) {
          // log(err);
        }
      })

      this._box = new St.BoxLayout(
        {
          x_align: St.Align.MIDDLE,
          x_expand: true,
          style_class: 'clean',
          width: 300
        }
      )

      this._box.add_child(button)
      this.add_child(this._box)
      this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px'
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
