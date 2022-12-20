'use strict';

const { Gio, GLib, St, GObject } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

/////////////////////////////////////////////////////////
// schema
/////////////////////////////////////////////////////////
const schema_path = "org.gnome.shell.extensions.tado";


var TadoHelpers = GObject.registerClass({
  GTypeName: "TadoHelpers"
}, class TadoHelpers extends GObject.Object {
  Icons = {};

  constructor() {
    super();
    let settings = Gio.Settings.new('org.gnome.desktop.interface');
    settings.connect('changed::color-scheme', this.ColorSchemeChanged.bind(this));
    this.ColorSchemeChanged();
  }

  ColorSchemeChanged() {
    try {
      let settings = Gio.Settings.new('org.gnome.desktop.interface');

      if (settings.get_string('color-scheme') == "default") {
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
        BOOSTBLUE: 'boost-light-blue',
      }
    }
    catch (e) {
      // log(e)
    }
  }

  GetIconName(name) {
    return this.Icons[name];
  }

  GetIcon(name) {
    let real_name = this.GetIconName(name);
    return Gio.Icon.new_for_string(Me.dir.get_child('icons').get_child(`${real_name}.svg`).get_path());;
  }

  GetSchemaPath() {
    return schema_path;
  }
});
