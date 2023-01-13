'use strict'

const Main = imports.ui.main // eslint-disable-line
const PanelMenu = imports.ui.panelMenu // eslint-disable-line
const { St, GObject } = imports.gi // eslint-disable-line

const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoHelpers = Me.imports.TadoHelpers
const TadoMenuStrategy = Me.imports.TadoMenuStrategy

const GETTEXT_DOMAIN = 'ie.fio'

/// //////////////////////////////////////////////////////
// TadoIndicator
/// //////////////////////////////////////////////////////
const TadoIndicator = GObject.registerClass(
  class TadoIndicator extends PanelMenu.Button {
    _init () {
      this.helpers = new TadoHelpers.TadoHelpers()
      try {
        super._init(0.5, _('Tado Heating Control')) // eslint-disable-line

        this.add_child(new St.Icon({
          gicon: this.helpers.GetIcon('TADOSIZED'),
          style_class: 'tado-icon'
        }))

        this.MenuStrategy = new TadoMenuStrategy.TadoMenuStrategy(this.helpers, this.menu)
        this.MenuStrategy.Display()
      } catch (error) {
        this.helpers.log(error)
      }
    }

    Destruct () {
      this.MenuStrategy.Destruct()
    }
  }
)

class Extension {
  constructor (uuid) {
    this._uuid = uuid
    ExtensionUtils.initTranslations(GETTEXT_DOMAIN)
  }

  enable () {
    this.ti = new TadoIndicator()
    Main.panel.addToStatusArea(this._uuid, this.ti)
  }

  disable () {
    this.ti.Destruct() // clear setInterval
    this.ti.destroy()
    this.ti = null
  }
}

function init (meta) { // eslint-disable-line
  return new Extension(meta.uuid)
}
