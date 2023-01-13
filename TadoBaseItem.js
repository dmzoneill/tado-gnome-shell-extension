const { St, GObject } = imports.gi // eslint-disable-line
const PopupMenu = imports.ui.popupMenu // eslint-disable-line

try {
  /// //////////////////////////////////////////////////////
  // TadoBaseItem
  /// //////////////////////////////////////////////////////

  var TadoBaseItem = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoBaseItem'
  }, class TadoBaseItem extends PopupMenu.PopupBaseMenuItem {
    constructor (helpers) {
      super(
        {
          activate: false
        }
      )

      this.helpers = helpers

      this._box = new St.BoxLayout(
        {
          x_align: St.Align.START,
          x_expand: true,
          width: 320,
          style_class: 'base'
        }
      )
    }

    makeButton (iconName, callback) {
      const icon = this.helpers.GetIcon(iconName)
      const iconblue = this.helpers.GetIcon(iconName + 'BLUE')

      const button = new St.Button(
        {
          x_expand: true,
          child: new St.Icon(
            {
              gicon: icon,
              style_class: 'lower-menu-icon'
            }
          )
        }
      )

      if (callback !== false) {
        button.connect('clicked', callback)

        button.connect('enter-event', function () {
          if (button.child === null) return
          button.child.set_gicon(iconblue)
        })

        button.connect('leave-event', function () {
          if (button.child == null) return
          button.child.set_gicon(icon)
        })
      }

      return button
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
