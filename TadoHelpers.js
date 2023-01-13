'use strict'

const { Gio, GObject } = imports.gi // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()

/// //////////////////////////////////////////////////////
// schema
/// //////////////////////////////////////////////////////
const schemaPath = 'org.gnome.shell.extensions.tado'

try {
  var TadoHelpers = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoHelpers'
  }, class TadoHelpers extends GObject.Object {
    static debugLog = []
    Icons = {}

    constructor () {
      super()
      const settings = Gio.Settings.new('org.gnome.desktop.interface')
      settings.connect('changed::color-scheme', this.ColorSchemeChanged.bind(this))
      this.ColorSchemeChanged()
    }

    log (msg) {
      if (TadoHelpers.debugLog.length > 100) {
        TadoHelpers.debugLog.shift()
      }
      TadoHelpers.debugLog.push(msg)

      const settings = ExtensionUtils.getSettings(this.GetSchemaPath())
      const enabled = settings.get_boolean('tado-debug')

      if (enabled) {
        log(msg) // eslint-disable-line
      }
    }

    ColorSchemeChanged () {
      try {
        const settings = Gio.Settings.new('org.gnome.desktop.interface')

        if (settings.get_string('color-scheme') === 'default') {
          // detect color is white
        } else {
          // detect color is black
        }

        this.Icons = {
          TADO: 'tado-light',
          TADOSIZED: 'tado-logo-light',
          RESUME: 'resume-light',
          RESUMEBLUE: 'resume-light-blue',
          POWER: 'power-off-light',
          POWERTURNOFF: 'power-on-light-red',
          POWERTURNON: 'power-off-light-green',
          SETTINGS: 'settings-light',
          SETTINGSBLUE: 'settings-light-blue',
          HOME: 'home-active-light',
          HOMEBLUE: 'home-active-light-blue',
          COOL: 'face-cool-symbolic',
          DEL: 'edit-delete-symbolic',
          SAVE: 'document-save-symbolic-light',
          SAVEBLUE: 'document-save-symbolic-light-blue',
          URL: 'mail-forward-symbolic',
          SET: 'emblem-system-symbolic',
          EDOWN: 'eye-not-looking-symbolic',
          ADDON: 'application-x-addon-symbolic',
          DEBUG: 'applications-engineering-symbolic',
          EOPEN: 'eye-open-negative-filled-symbolic',
          EOPENBLUE: 'eye-open-negative-filled-symbolic-blue',
          ECLOSED: 'eye-not-looking-symbolic-light',
          ECLOSEDBLUE: 'eye-not-looking-symbolic-light-blue',
          BOOST: 'boost-light',
          BOOSTBLUE: 'boost-light-blue'
        }
      } catch (e) {
        // log(e)
      }
    }

    GetIconName (name) {
      return this.Icons[name]
    }

    GetIcon (name) {
      const realName = this.GetIconName(name)
      return Gio.Icon.new_for_string(Me.dir.get_child('icons').get_child(`${realName}.svg`).get_path())
    }

    GetSchemaPath () {
      return schemaPath
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
