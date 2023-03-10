
'use strict'

const { St, GObject } = imports.gi // eslint-disable-line
const PopupMenu = imports.ui.popupMenu // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoSignInMenuItem = Me.imports.TadoSignInMenuItem
const TadoHeader = Me.imports.TadoHeader
const TadoButtonListItem = Me.imports.TadoButtonListItem
const TadoTextMenuItem = Me.imports.TadoTextMenuItem
const TadoHyperlinkMenuItem = Me.imports.TadoHyperlinkMenuItem

try {
  /// //////////////////////////////////////////////////////
  // TadoAboutMenuStrategy
  /// //////////////////////////////////////////////////////
  var TadoAboutMenuStrategy = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoAboutMenuStrategy'
  }, class TadoAboutMenuStrategy extends GObject.Object {
    constructor (manager, helpers, tado) {
      super()
      this.manager = manager
      this.helpers = helpers
      this.tado = tado
    }

    async createMenu (menu, ticker) {
      try {
        const self = this

        // credentials editor
        this.signInMenu = new TadoSignInMenuItem.TadoSignInMenuItem(this.helpers)

        // remove all the previous menuitems
        menu.removeAll()

        // tado header
        menu.addMenuItem(new TadoHeader.TadoHeader(this.helpers))

        // separator
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())

        let str = '\n\nTado° trademarks are copyright Tado GmbH\n\n'
        str += 'This gnome extension is provided \n'
        str += 'free without charge under GPLv3.\n\n'
        str += 'Further information can be found on\n\n'

        menu.addMenuItem(new TadoTextMenuItem.TadoTextMenuItem(str, this.helpers))
        menu.addMenuItem(new TadoHyperlinkMenuItem.TadoHyperlinkMenuItem('github.com/dmzoneill', 'https://github.com/dmzoneill/tado-gnome-shell-extension', this.helpers))

        // separator
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())

        // close button
        const closebutton = new St.Button(
          {
            x_expand: false,
            child: new St.Icon(),
            style: 'margin-right: 15px'
          }
        )

        closebutton.child.set_gicon(this.helpers.GetIcon('ECLOSED'))
        closebutton.connect('clicked', async () => {
          self.manager.DisplayMainMenu()
        })
        closebutton._icon_name = this.helpers.GetIcon('ECLOSED')
        closebutton.connect('enter-event', function () {
          closebutton.child.set_gicon(self.helpers.GetIcon('ECLOSED' + 'BLUE'))
        })
        closebutton.connect('leave-event', function () {
          closebutton.child.set_gicon(self.helpers.GetIcon('ECLOSED'))
        })

        // bottom menu
        menu.addMenuItem(new TadoButtonListItem.TadoButtonListItem([closebutton], this.helpers))
      } catch (error) {
        this.helpers.log(error)
      }
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
