'use strict';


var Icons = {};

const Main = imports.ui.main;
const Util = imports.misc.util;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;
const { Gtk, St, GObject, Meta, Gio, Shell, Pango, Clutter } = imports.gi;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const _ = ExtensionUtils.gettext;
const Tado = Me.imports.Tado;

const GETTEXT_DOMAIN = "ie.fio"

const genIcon = x => Gio.Icon.new_for_string(Me.dir.get_child('icons').get_child(`${x}.svg`).get_path());

/////////////////////////////////////////////////////////
// setInterval
/////////////////////////////////////////////////////////

window.setInterval = function (func, delay, ...args) {
  return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
    func(...args);
    return GLib.SOURCE_CONTINUE;
  });
};

window.clearInterval = GLib.source_remove;

/////////////////////////////////////////////////////////
// ButtonListItemSeparator
/////////////////////////////////////////////////////////
class ZoneListItemSeparator extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(
      {
        activate: false
      }
    );

    let col = 'rgba(%d, %d, %d, %.2f)'.format(66, 66, 66, 255);
    this.height = 1;
    this.actor.style = 'background-color: ' + col + '; margin-top: 3px; margin-bottom: 3px; margin-left: 35px; margin-right: 35px';
  }
}

/////////////////////////////////////////////////////////
// CustomSectionHeader
/////////////////////////////////////////////////////////
class CustomSectionHeader extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  constructor(str) {
    super(
      {
        activate: false
      }
    );

    let container = new St.BoxLayout(
      {
        x_align: St.Align.START,
        x_expand: true,
        y_expand: true
      }
    );

    let zones_label = new St.Label(
      {
        text: str,
        x_expand: true,
        style_class: 'section-header-label'
      }
    );

    container.add(zones_label);
    this.add_child(container);
    this.set_style_class_name('section-header-label');
  }
}

/////////////////////////////////////////////////////////
// SignInMenuItem
/////////////////////////////////////////////////////////
class SignInMenuItem extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(
      {
        activate: false
      }
    );

    this.actor.style = 'background-color: rgba(255,255,255,0); margin-top: 0px; margin-bottom: 0px; margin-left: auto; margin-right: auto; padding: 0px';

    this._box = new St.BoxLayout(
      {
        x_align: St.Align.START,
        x_expand: true,
        vertical: true,
        width: 200
      }
    );

    let username_label = new St.Label(
      {
        text: "Username",
        x_expand: true,
        style_class: 'section-header-label',
        width: 250
      }
    );

    let password_label = new St.Label(
      {
        text: "Password",
        x_expand: true,
        style_class: 'section-header-label',
        width: 250
      }
    );

    let username = TadoIndicator.settings.get_string('username');
    let password = TadoIndicator.settings.get_string('password');

    this.username_entry = new St.Entry({
      text: username,
      x_expand: true,
      style_class: 'input-text-box',
      width: 250
    });

    this.password_entry = new St.PasswordEntry({
      text: password,
      x_expand: true,
      style_class: 'input-text-box',
      width: 250
    });

    this._box.add(username_label);
    this._box.add(this.username_entry);
    this._box.add(password_label);
    this._box.add(this.password_entry);

    this.add_child(this._box);
  }

  getUsername() {
    return this.username_entry.text;
  }

  getPassword() {
    return this.password_entry.get_text();
  }

  loginFailed() {
    this.username_entry.set_style_class_name('input-text-box-failed');
    this.password_entry.set_style_class_name('input-text-box-failed');
  }

  clearFailed() {
    this.username_entry.set_style_class_name('input-text-box');
    this.password_entry.set_style_class_name('input-text-box');
  }
}

/////////////////////////////////////////////////////////
// ButtonListItem
/////////////////////////////////////////////////////////
class ButtonListItem extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  constructor(cbs) {
    super(
      {
        activate: false
      }
    );

    this._box = new St.BoxLayout(
      {
        x_align: St.Align.START,
        x_expand: true
      }
    );

    if (cbs[0][0] == "TADOSIZED") {
      this.actor.style = 'background-color: rgba(255,255,255,0); margin-top: 0px; margin-bottom: 0px; margin-left: auto; margin-right: auto; padding: 0px';
      this.height = 60;
      let button = this.makeButton(cbs[0][0], cbs[0][1]);
      this._box.add_child(button);
      this.add_child(this._box);
      return;
    }

    for (let t = 0; t < cbs.length; t++) {
      let item = cbs[t];
      if (Array.isArray(item)) {
        let button = this.makeButton(item[0], item[1]);
        this._box.add_child(button);
      }
      else {
        this._box.add_child(item);
      }
    }

    this.actor.style = 'background-color: rgba(255,255,255,0); margin: auto; padding: 10px';
    this.add_child(this._box);
  }

  makeButton(icon_name, callback) {
    let className = callback ? 'lower-menu-icon' : 'top-icon';

    let button = new St.Button(
      {
        x_expand: true,
        child: new St.Icon(
          {
            style_class: className
          }
        )
      }
    );

    button.child.set_gicon(genIcon(Icons[icon_name]));

    if (callback != false) {
      button.connect('clicked', callback);
      button._icon_name = Icons[icon_name];

      button.connect("enter-event", function () {
        button.child.set_gicon(genIcon(Icons[icon_name + 'BLUE']));
      });

      button.connect("leave-event", function () {
        button.child.set_gicon(genIcon(Icons[icon_name]));
      });
    }

    return button;
  }
}

/////////////////////////////////////////////////////////
// ZoneListItem
/////////////////////////////////////////////////////////
class ZoneListItem extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  constructor(zone, tado) {
    super(
      {
        activate: false
      }
    );

    let self = this;

    this.set_style_class_name('ZoneListItem');
    this.connect("enter-event", function () {
      self.set_style_class_name('ZoneListItemHover');
    });
    this.connect("leave-event", function () {
      self.set_style_class_name('ZoneListItem');
    });

    this.zone = zone;
    this.tado = tado;
    let temphum = this.tado.getZoneTempHumidity(this.zone['id']);
    let tempSetting = this.tado.getZoneTempSetting(this.zone['id']);
    let power = this.tado.getZonePowerSetting(this.zone['id']);
    let nextState = this.tado.getNextState(this.zone['id']);
    let nextTime = new Date(nextState[0]);
    nextTime = nextTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.inDrag = false;
    this.slider = new Slider.Slider(0);
    this.slider.value = tempSetting / 25;
    this.sliderChangedId = this.slider.connect('notify::value', () => { log(this.slider.value); });
    this.slider.connect('drag-begin', () => (this.inDrag = true));
    this.slider.connect('drag-end', () => {
      this.inDrag = false;
      log("changed");
      log(this.slider.value);
    });

    // for focus indication
    let sliderBin = new St.Bin({
      style_class: 'slider-bin',
      child: this.slider,
      reactive: true,
      can_focus: true,
      x_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
    });

    sliderBin.set_accessible(this.slider.get_accessible());
    sliderBin.connect('event', (bin, event) => this.slider.event(event, false));

    let button = new St.Button(
      {
        x_expand: false,
        x_align: St.Align.START,
        child: new St.Icon(
          {
            style_class: 'power-off-button'
          }
        )
      }
    );

    button.child.set_gicon(genIcon(power ? Icons.POWERTURNON : Icons.POWER));
    button.set_margin_right(15);

    button.connect("enter-event", function () {
      if (power) {
        button.child.set_gicon(genIcon(Icons.POWERTURNOFF));
      } else {
        button.child.set_gicon(genIcon(Icons.POWERTURNON));
      }
    });

    button.connect("leave-event", function () {
      if (power) {
        button.child.set_gicon(genIcon(Icons.POWERTURNON));
      } else {
        button.child.set_gicon(genIcon(Icons.POWER));
      }
    });

    let next_state_label = new St.Label(
      {
        text: "Scheduled " + nextTime + " (" + nextState[1] + ")",
        x_align: St.Align.END,
        x_expand: true,
        width: 190,
        style_class: 'next_state_label'
      }
    );

    let zone_label = new St.Label(
      {
        text: this.zone['name'],
        x_expand: true
      }
    );

    let spacer1 = new St.Label(
      {
        text: "   ",
        x_expand: false,
        style_class: 'spacer'
      }
    );

    let spacer2 = new St.Label(
      {
        text: "   ",
        x_expand: false,
        style_class: 'spacer'
      }
    );

    let tempSingleDecimal = parseFloat(temphum[0]);
    tempSingleDecimal = tempSingleDecimal.toFixed(1);

    let temperature = new St.Label(
      {
        text: tempSingleDecimal.toString() + "°",
        x_expand: false,
        y_expand: true,
        style_class: 'temperature'
      }
    );

    let container = new St.BoxLayout(
      {
        x_align: St.Align.START,
        x_expand: true,
        y_expand: true
      }
    );

    let first_box = new St.BoxLayout(
      {
        x_align: St.Align.START,
        x_expand: false,
        y_expand: true,
        width: 30
      }
    );

    let second_box = new St.BoxLayout(
      {
        x_align: St.Align.END,
        x_expand: true,
        y_expand: true,
        vertical: true,
        width: 200
      }
    );

    let third_box = new St.BoxLayout(
      {
        x_align: St.Align.END,
        y_align: St.Align.MIDDLE,
        x_expand: false,
        y_expand: true,
        vertical: true
      }
    );

    let second_box_inner1 = new St.BoxLayout(
      {
        x_align: St.Align.START,
        x_expand: true,
        height: 20,
        width: 200
      }
    );

    let second_box_inner2 = new St.BoxLayout(
      {
        x_align: St.Align.START,
        x_expand: true,
        height: 30,
        width: 200
      }
    );

    let second_box_inner3 = new St.BoxLayout(
      {
        x_align: St.Align.END,
        x_expand: true,
        height: 20,
        width: 200
      }
    );

    let third_box_inner1 = new St.BoxLayout(
      {
        x_align: St.Align.START,
        y_align: St.Align.MIDDLE,
        x_expand: true,
        y_expand: true,
        height: 60
      }
    );

    second_box_inner1.add(zone_label);
    // second_box_inner1.add(PopupMenu.arrowIcon(St.Side.BOTTOM));
    second_box_inner2.add(sliderBin);
    second_box_inner3.add(next_state_label);
    third_box_inner1.add(temperature);

    first_box.add(button);
    second_box.add(second_box_inner1);
    second_box.add(second_box_inner2);
    second_box.add(second_box_inner3);
    third_box.add(third_box_inner1);

    container.add(first_box);
    container.add(spacer1);
    container.add(second_box);
    container.add(spacer2);
    container.add(third_box);

    this.actor.add_child(container)
  }
}

/////////////////////////////////////////////////////////
// TadoIndicator
/////////////////////////////////////////////////////////
const TadoIndicator = GObject.registerClass(
  class TadoIndicator extends PanelMenu.Button {
    static settings = ExtensionUtils.getSettings('ie.fio.tado');

    _init() {
      super._init(0.5, _('Tado Heating Control'));

      this.add_child(new St.Icon({
        gicon: genIcon(Icons.TADOSIZED),
        style_class: 'tado-icon',
      }));


      this.setup();
    }

    async setup() {
      try {
        this.runner = new Tado.Tado();

        let username = TadoIndicator.settings.get_string('username');
        let password = TadoIndicator.settings.get_string('password');

        if (username == "test" || password == "test") {
          this.drawSigninMenu();
          return;
        }

        let login = await this.runner.checkLogin(username, password);

        if (login == false) {
          this.drawSigninMenu();
          return;
        }

        this.countDownTimer = 0;
        this.drawMainMenu();
        this.updateInterval = setInterval(() => this.drawMainMenu(), 1000);
      }
      catch (e) {
        log(e);
      }
    }

    async drawMainMenu() {
      try {
        if (this.countDownTimer == 0) {
          this.countDownTimer = 60;
          this.zoneListItems = [];

          let res = await this.runner.run();
          if (res == false) {
            if ('countDownLabel' in this) {
              this.countDownLabel.text = this.countDownTimer == 0 ? "Failed updating .." : this.countDownTimer.toString();
            }
            this.countDownTimer = 60;
            return;
          }

          // remove all the previous menuitems
          this.menu.removeAll();

          // tado header
          this.menu.addMenuItem(new ButtonListItem([['TADOSIZED', false]]));

          // separator
          this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

          // zones header
          this.menu.addMenuItem(new CustomSectionHeader("Zones"));

          // zones
          let zones = this.runner.getZones();
          for (let i = 0; i < zones.length; i++) {
            let item = new ZoneListItem(zones[i], this.runner);
            this.menu.addMenuItem(item);
            this.zoneListItems.push(item);
            if (zones.length > 1 && i < zones.length - 1) {
              this.menu.addMenuItem(new ZoneListItemSeparator());
            }
          }

          // separator
          this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

          this.countDownLabel = new St.Label(
            {
              text: this.countDownTimer == 0 ? "Updating .." : this.countDownTimer.toString(),
              x_expand: false,
              y_expand: true
            }
          );

          let boostOption = this.runner.isBoostActive() == false ? ['BOOST', () => { this.runner.boost(); this.countDownTimer = 2; }] : ['RESUME', () => { this.runner.resumeSchedule(); this.countDownTimer = 2; }];

          // bottom menu
          this.menu.addMenuItem(new ButtonListItem([
            boostOption,
            ['HOME', () => { log("Clicked"); }],  
            new St.Label({ text: "   ", x_expand: false, style_class: 'spacer' }),
            this.countDownLabel,
            new St.Label({ text: "   ", x_expand: false, style_class: 'spacer' }),
            ['SETTINGS', () => {
              clearInterval(this.updateInterval);
              this.drawSigninMenu();
            }],  
            ['EOPEN', () => { log("Clicked"); }]
          ]));
        } else {
          this.countDownTimer -= 1;
          if ('countDownLabel' in this) {
            this.countDownLabel.text = this.countDownTimer == 0 ? "Updating .." : this.countDownTimer.toString();
          }
        }
      }
      catch (e) {
        log(e);
      }
    }

    async drawSigninMenu() {
      try {
        let self = this;

        // credentials editor
        this.signInMenu = new SignInMenuItem();

        // remove all the previous menuitems
        this.menu.removeAll();

        // tado header
        this.menu.addMenuItem(new ButtonListItem([['TADOSIZED', false]]));

        // separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // sign in header
        this.menu.addMenuItem(new CustomSectionHeader("Credentials"));

        // sign in view
        this.menu.addMenuItem(this.signInMenu);

        // separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // save button
        let savebutton = new St.Button(
          {
            x_expand: true,
            child: new St.Icon(),
            style: 'margin-right: 15px'
          }
        );

        savebutton.child.set_gicon(genIcon(Icons['SAVE']));
        savebutton.connect('clicked', async () => {
          this.signInMenu.clearFailed();
          let login = await this.runner.checkLogin(this.signInMenu.getUsername(), this.signInMenu.getPassword());

          if (login == false) {
            self.signInMenu.loginFailed();
            return;
          }

          TadoIndicator.settings.set_string('username', this.signInMenu.getUsername());
          TadoIndicator.settings.set_string('password', this.signInMenu.getPassword());

          self.countDownTimer = 0;
          self.drawMainMenu();
          self.updateInterval = setInterval(() => self.drawMainMenu(), 1000);
        });
        savebutton._icon_name = Icons['SAVE'];
        savebutton.connect("enter-event", function () {
          savebutton.child.set_gicon(genIcon(Icons['SAVE' + 'BLUE']));
        });
        savebutton.connect("leave-event", function () {
          savebutton.child.set_gicon(genIcon(Icons['SAVE']));
        });

        // bottom menu
        this.menu.addMenuItem(
          new ButtonListItem([savebutton])
        );
      }
      catch (e) {
        log(e);
      }
    }
  }
);


class Extension {
  constructor(uuid) {
    this._uuid = uuid;
    this.init = false;
    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    this.settings = Gio.Settings.new('org.gnome.desktop.interface');
    this.settings.connect('changed::color-scheme', this.ColorSchemeChanged.bind(this));
    this.ColorSchemeChanged();
  }

  ColorSchemeChanged() {
    try {
      log("Set theme")
      if (this.settings.get_string('color-scheme') == "default") {
        // detect panel color is white
      } else {
        // detect panel color is black
      }

      Icons = {
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
        BOOST: 'boost-light',
        BOOSTBLUE: 'boost-light-blue',
      }

      if (this.init == false) {
        this.init = true;
        return;
      }

      this.disable();
      this.enable();
    }
    catch (e) {
      log(e)
    }
  }

  enable() {
    log('Enable extension');
    this.ti = new TadoIndicator();
    Main.panel.addToStatusArea(this._uuid, this.ti);
  }

  disable() {
    this.ti.destroy();
    this.ti = null;
    log('Disable extension');
  }
}

function init(meta) {
  return new Extension(meta.uuid);
}

