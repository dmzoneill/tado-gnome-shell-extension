'use strict'

const { St, GObject, Clutter } = imports.gi // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoBaseItem = Me.imports.TadoBaseItem
const PopupMenu = imports.ui.popupMenu // eslint-disable-line

try {
  /// //////////////////////////////////////////////////////
  // TadoSignInMenuItem
  /// //////////////////////////////////////////////////////
  var TadoSignInMenuItem = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoSignInMenuItem'
  },
  class TadoSignInMenuItem extends TadoBaseItem.TadoBaseItem {
    constructor (helpers) {
      super(helpers)

      this._box = new St.BoxLayout(
        {
          x_align: St.Align.START,
          x_expand: true,
          y_expand: true,
          width: 250,
          vertical: true,
          style_class: 'base'
        }
      )

      this.actor.style = 'background-color: rgba(255,255,255,0); margin-top: 0px; margin-bottom: 10px; margin-left: auto; margin-right: auto; padding: 0px'

      const usernameLabel = new St.Label(
        {
          text: 'Username',
          x_expand: true,
          style_class: 'section-header-label',
          width: 250
        }
      )

      const passwordLabel = new St.Label(
        {
          text: 'Password',
          x_expand: true,
          style_class: 'section-header-label',
          width: 250
        }
      )

      const settings = ExtensionUtils.getSettings(this.helpers.GetSchemaPath())
      const username = settings.get_string('tado-username')
      const password = settings.get_string('tado-password')
      const enabled = settings.get_boolean('tado-debug')

      this.username_entry = new St.Entry({
        text: username,
        x_expand: true,
        style_class: 'input-text-box',
        width: 250
      })

      this.password_entry = new St.PasswordEntry({
        text: password,
        x_expand: true,
        style_class: 'input-text-box',
        width: 250
      })

      this._box.add(usernameLabel)
      this._box.add(this.username_entry)
      this._box.add(passwordLabel)
      this._box.add(this.password_entry)

      this.switchBox = new PopupMenu.Switch(false)
      this.switchButton = new St.Button({ reactive: true, can_focus: true })
      this.switchButton.set_x_align(Clutter.ActorAlign.START)
      this.switchButton.set_x_expand(false)
      this.switchButton.child = this.switchBox

      const self = this

      this.switchButton.connect(
        'button-press-event',
        () => {
          self.switchBox.toggle()
        }
      )

      if (enabled) {
        this.switchBox.state = true
      }

      const debugLabel = new St.Label(
        {
          text: 'Enable debug output',
          x_expand: true,
          style_class: 'section-header-label',
          width: 250
        }
      )

      this._box.add(debugLabel)
      this._box.add(this.switchButton)

      this.add_child(this._box)
    }

    getUsername () {
      return this.username_entry.text
    }

    getPassword () {
      return this.password_entry.get_text()
    }

    getDebug () {
      return this.switchBox.state
    }

    loginFailed () {
      this.username_entry.set_style_class_name('input-text-box-failed')
      this.password_entry.set_style_class_name('input-text-box-failed')
    }

    clearFailed () {
      this.username_entry.set_style_class_name('input-text-box')
      this.password_entry.set_style_class_name('input-text-box')
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
