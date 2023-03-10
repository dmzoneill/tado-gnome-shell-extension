
'use strict'

const { St, GObject } = imports.gi // eslint-disable-line
const PopupMenu = imports.ui.popupMenu // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoCustomSectionHeader = Me.imports.TadoCustomSectionHeader
const TadoSignInMenuItem = Me.imports.TadoSignInMenuItem
const TadoHeader = Me.imports.TadoHeader
const TadoButtonListItem = Me.imports.TadoButtonListItem

try {
  /// //////////////////////////////////////////////////////
  // TadoLoginMenuStrategy
  /// //////////////////////////////////////////////////////
  var TadoLoginMenuStrategy = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoLoginMenuStrategy'
  }, class TadoLoginMenuStrategy extends GObject.Object {
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

        // sign in header
        menu.addMenuItem(new TadoCustomSectionHeader.TadoCustomSectionHeader('Credentials', this.helpers))

        // sign in view
        menu.addMenuItem(this.signInMenu)

        // separator
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())

        // save button
        const savebutton = new St.Button(
          {
            x_expand: true,
            child: new St.Icon(),
            style: 'margin-right: 15px'
          }
        )

        savebutton.child.set_gicon(this.helpers.GetIcon('SAVE'))
        savebutton.connect('clicked', async () => {
          self.signInMenu.clearFailed()
          const login = await self.tado.checkLogin(self.signInMenu.getUsername(), self.signInMenu.getPassword())

          if (login === false) {
            self.signInMenu.loginFailed()
            return
          }

          const settings = ExtensionUtils.getSettings(self.helpers.GetSchemaPath())
          settings.set_string('tado-username', self.signInMenu.getUsername())
          settings.set_string('tado-password', self.signInMenu.getPassword())
          settings.set_boolean('tado-debug', self.signInMenu.getDebug())

          self.manager.DisplayMainMenu()
        })
        savebutton._icon_name = this.helpers.GetIcon('SAVE')
        savebutton.connect('enter-event', function () {
          savebutton.child.set_gicon(self.helpers.GetIcon('SAVE' + 'BLUE'))
        })
        savebutton.connect('leave-event', function () {
          savebutton.child.set_gicon(self.helpers.GetIcon('SAVE'))
        })

        // bottom menu
        menu.addMenuItem(
          new TadoButtonListItem.TadoButtonListItem([savebutton], this.helpers)
        )
      } catch (error) {
        this.helpers.log(error)
      }
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
