'use strict';

const Main = imports.ui.main
const PanelMenu = imports.ui.panelMenu;
const { St, GObject } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TadoHelpers = Me.imports.TadoHelpers;
const TadoMenuStrategy = Me.imports.TadoMenuStrategy;

const GETTEXT_DOMAIN = "ie.fio"

/////////////////////////////////////////////////////////
// TadoIndicator
/////////////////////////////////////////////////////////
const TadoIndicator = GObject.registerClass(
  class TadoIndicator extends PanelMenu.Button {
    _init() {
      try {
        super._init(0.5, _('Tado Heating Control'));
        this.helpers = new TadoHelpers.TadoHelpers();

        this.add_child(new St.Icon({
          gicon: this.helpers.GetIcon('TADOSIZED'),
          style_class: 'tado-icon',
        }));
        
        this.MenuStrategy = new TadoMenuStrategy.TadoMenuStrategy(this.helpers, this.menu);
        this.MenuStrategy.Display();
      } catch (e) {
        log(e)
      }
    }

    Destruct() {
      this.MenuStrategy.Destruct();
    }
  }
);

class Extension {
  constructor(uuid) {
    this._uuid = uuid;
    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
  }

  enable() {
    this.ti = new TadoIndicator();
    Main.panel.addToStatusArea(this._uuid, this.ti);
  }

  disable() {
    this.ti.Destruct(); // clear setInterval
    this.ti.destroy();
    this.ti = null;
  }
}

function init(meta) {
  return new Extension(meta.uuid);
}

