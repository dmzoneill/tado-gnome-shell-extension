
'use strict';

const { St, GObject } = imports.gi;
const { Gio, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Tado = Me.imports.Tado;
const TadoMainMenuStrategy = Me.imports.TadoMainMenuStrategy;
const TadoAboutMenuStrategy = Me.imports.TadoAboutMenuStrategy;
const TadoLoginMenuStrategy = Me.imports.TadoLoginMenuStrategy;

/////////////////////////////////////////////////////////
// setInterval
/////////////////////////////////////////////////////////
// https://gist.github.com/andyholmes/582c29facbdbe67048c831a6370173eb
window._setInterval = function (func, delay, ...args) {
  return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
    func(...args);
    return GLib.SOURCE_CONTINUE;
  });
};

// https://gist.github.com/andyholmes/582c29facbdbe67048c831a6370173eb
window._clearInterval = GLib.source_remove;

/////////////////////////////////////////////////////////
// TadoMenuStrategy 
/////////////////////////////////////////////////////////
var TadoMenuStrategy = GObject.registerClass({
  GTypeName: "TadoMenuStrategy"
}, class TadoMenuStrategy extends GObject.Object {

  constructor(helpers, menu) {
    super();
    this.helpers = helpers;
    this.menu = menu;
    this.tado = new Tado.Tado();
    this.updateInterval = null;
    this.countDownTimer = 0;
    this.MainMenu = new TadoMainMenuStrategy.TadoMainMenuStrategy(this, this.helpers, this.tado);
    this.AboutMenu = new TadoAboutMenuStrategy.TadoAboutMenuStrategy(this, this.helpers, this.tado);
    this.SigninMenu = new TadoLoginMenuStrategy.TadoLoginMenuStrategy(this, this.helpers, this.tado);
  }

  Destruct() {
    this.clearInterval();
  }

  async Display() {
    try {
      let settings = ExtensionUtils.getSettings(this.helpers.GetSchemaPath());
      let username = settings.get_string('tado-username');
      let password = settings.get_string('tado-password');

      if (username == "test" || password == "test") {
        this.DisplaySigninMenu();
        return;
      }

      let login = await this.tado.checkLogin(username, password);

      if (login == false) {
        this.DisplaySigninMenu();
        return;
      }

      this.DisplayMainMenu();
    }
    catch (e) {
      // log(e);
    }
  }

  async DisplayMainMenu() {
    try {
      this.MainMenu.createMenu(this.menu, this.countDownTimer);
      this.setInterval();
    }
    catch (e) {
      // log(e);
    }
  }

  async DisplaySigninMenu() {
    try {
      this.clearInterval();
      this.SigninMenu.createMenu(this.menu, this.countDownTimer);
    }
    catch (e) {
      // log(e);
    }
  }

  async DisplayAbout() {
    try {
      this.clearInterval();
      this.AboutMenu.createMenu(this.menu, this.countDownTimer);
    }
    catch (e) {
      // log(e);
    }
  }

  clearInterval() {
    try {
      _clearInterval(this.updateInterval);
    } catch (e) {
      // log(e)
    }
  }

  setInterval() {
    this.countDownTimer = 0;
    this.updateInterval = _setInterval(() => {
      if (this.countDownTimer == 0) {
        this.countDownTimer = 60;
        this.MainMenu.createMenu(this.menu, this.countDownTimer);
      } else {
        this.MainMenu.updateMenu(this.menu, this.countDownTimer);
        this.countDownTimer -= 1;
      }
    }, 1000);
  }

  resetCountDownTimer(next = 60) {
    this.countDownTimer = next;
  }
});