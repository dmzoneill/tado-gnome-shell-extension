'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ByteArray = imports.byteArray;
const { GLib, GObject, Soup, Gio, St } = imports.gi;

class TadoController {

  static debugLog = [];
  static username = "";
  static password = "";
  static clientSecret = "";
  static token = "";
  static home = {};
  static homeState = {};
  static deviceList = {};
  static incidentList = {};
  static zoneStatesList = {};
  static zoneStates = {};
  static zoneList = {};
  static lastStatusCode = 200;
  static headers = {
    "authority": "auth.tado.com",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    "dnt": "1",
    "origin": "https://app.tado.com",
    "pragma": "no-cache",
    "referer": "https://app.tado.com/",
    "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "redirect": "follow",
    "credentials": "same-origin"
  }

  constructor() {

  }

  log(msg) {
    if (TadoController.debugLog.length > 100) {
      TadoController.debugLog.shift()
    }
    TadoController.debugLog.push(msg);
  }

  getLog() {
    return TadoController.lastStatusCode === Soup.Status.OK
  }

  getStatus() {
    return message.get_status()
  }

  async run() {
    try {
      TadoController.debugLog = []; // empty the log each run
      let self = this;
      let res = false;

      res = await self._getSecret();
      if (!res) return false;

      res = await self._getToken();
      if (!res) return false;

      res = await self._getHome();
      if (!res) return false;

      res = await self._getZones();
      if (!res) return false;

      res = await self._getHomeState();
      if (!res) return false;

      res = await self._getDeviceList();
      if (!res) return false;

      res = await self._getIncidents();
      if (!res) return false;

      res = await self._getZoneStates();
      if (!res) return false;

      TadoController.zoneList.forEach(element => {
        self._getZoneState(element['id']);
      });

      for (let y = 0; y < TadoController.debugLog.length; y++) {
        try {
          // log(JSON.stringify(JSON.parse(TadoController.debugLog[y]), null, 2));
        } catch (e) {
          // log(TadoController.debugLog[y]);
        }
      }
      return true;
    } catch (e) {
      this.log(e);
      return false;
    }
  }

  async checkLogin(username, password) {
    let res = true;

    TadoController.username = username;
    TadoController.password = password;

    res = await this._getSecret();
    res = await this._getToken();

    return res;
  }

  async _getSecret() {
    try {
      TadoController.headers["authority"] = "auth.tado.com";
      let res = await this.req("https://app.tado.com/env.js", {}, 'GET', false, false);
      if (res == false) return false;
      var rx = /clientSecret: '(.*?)'/g;
      var arr = rx.exec(res);
      TadoController.clientSecret = arr[1];
      return true;
    }
    catch (e) {
      return false;
    }
  }

  getSecret() {
    return TadoController.clientSecret;
  }

  async _getToken() {
    try {
      TadoController.headers["authority"] = "auth.tado.com";
      let url = 'https://auth.tado.com/oauth/token';
      let creds = {
        'client_id': 'tado-web-app',
        'client_secret': TadoController.clientSecret,
        'grant_type': 'password',
        'password': TadoController.password,
        'scope': 'home.user',
        'username': TadoController.username
      }

      let res = await this.req(url, creds, 'POST', false, true);

      if (res == false) {
        return false;
      }

      if (typeof res === "object") {
        if (Object.keys(res).includes('access_token') === false) {
          return false;
        }
      }
      else {
        if (res.indexOf('error') > -1) {
          return false;
        }
      }

      TadoController.token = res['access_token'];
      return true;
    }
    catch (e) {
      return false;
    }
  }

  getToken() {
    return TadoController.token;
  }

  async _getRefreshToken() {
    try {
      TadoController.headers["authority"] = "auth.tado.com";
      let url = 'https://auth.tado.com/oauth/token';
      let creds = {
        'grant_type': 'refresh_token',
        'refresh_token': 'def',
        'client_id': 'tado-web-app',
        'scope': 'home.user',
        'client_secret': TadoController.clientSecret
      }

      let res = await this.req(url, creds, 'POST', false, false)
      TadoController.clientSecret = res['access_token'];
    }
    catch (e) {
      return false;
    }
  }

  getRefreshToken() {
    return TadoController.token;
  }

  async _getHome() {
    try {
      TadoController.headers["authority"] = "my.tado.com";
      let url = 'https://my.tado.com/api/v1/me';
      let res = await this.req(url, {}, 'GET', false, true);
      TadoController.home = res;
      return true
    }
    catch (e) {
      return false;
    }
  }

  getHome() {
    return TadoController.home;
  }

  async _getHomeState() {
    try {
      TadoController.headers["authority"] = "my.tado.com";
      let url = 'https://my.tado.com/api/v2/homes/' + TadoController.home['homeId'].toString() + '/state?ngsw-bypass=true';
      let res = await this.req(url, {}, 'GET', false, true);
      TadoController.homeState = res;
      return true
    }
    catch (e) {
      return false;
    }
  }

  getHomeState() {
    return TadoController.homeState;
  }

  async _getDeviceList() {
    try {
      TadoController.headers["authority"] = "my.tado.com";
      let url = 'https://my.tado.com/api/v2/homes/' + TadoController.home['homeId'].toString() + '/deviceList?ngsw-bypass=true';
      let res = await this.req(url, {}, 'GET', false, true)
      TadoController.deviceList = res;
      return true
    }
    catch (e) {
      return false;
    }
  }

  getDeviceList() {
    return TadoController.deviceList;
  }

  async _getIncidents() {
    try {
      TadoController.headers["authority"] = "my.tado.com";
      let url = 'https://minder.tado.com/v1/homes/' + TadoController.home['homeId'].toString() + '/incidents?ngsw-bypass=true';
      let res = await this.req(url, {}, 'GET', false, true)
      TadoController.incidentList = res;
      return true
    }
    catch (e) {
      return false;
    }
  }

  getIncidents() {
    return TadoController.incidentList;
  }

  async _getZones() {
    try {
      TadoController.headers["authority"] = "my.tado.com";
      let url = 'https://my.tado.com/api/v2/homes/' + TadoController.home['homeId'].toString() + '/zones?ngsw-bypass=true';
      let res = await this.req(url, {}, 'GET', false, true)
      TadoController.zoneList = res;
      return true
    }
    catch (e) {
      return false;
    }
  }

  getZones() {
    return TadoController.zoneList;
  }

  getZoneTempHumidity(id) {
    try {
      let zone = TadoController.zoneStatesList['zoneStates'][id.toString()];
      let sensorDataPoints = zone['sensorDataPoints'];
      let insideTemperature = sensorDataPoints['insideTemperature']['celsius'];
      let humidity = sensorDataPoints['humidity']['percentage'];
      return [insideTemperature, humidity];
    }
    catch (e) {
      this.log(e);
      return [0, 0];
    }
  }

  getZonePowerSetting(id) {
    try {
      let zone = TadoController.zoneStatesList['zoneStates'][id.toString()];
      let power = zone['setting']['power'];
      return power == "OFF" ? false : true;
    }
    catch (e) {
      this.log(e);
      return 99;
    }
  }

  getZoneTempSetting(id) {
    try {
      let zone = TadoController.zoneStatesList['zoneStates'][id.toString()];
      let nextScheduleChange = zone['nextScheduleChange'];
      let nextTemperature = nextScheduleChange['setting']['temperature']['celsius'];
      return nextTemperature;
    }
    catch (e) {
      this.log(e);
      return false;
    }
  }

  getNextState(id) {
    try {
      let zone = TadoController.zoneStatesList['zoneStates'][id.toString()];
      let nextScheduleChange = zone['nextScheduleChange'];
      let start = nextScheduleChange['start'];
      let power = nextScheduleChange['setting']['power'];
      return [start, power];
    }
    catch (e) {
      this.log(e);
      return ['', ''];
    }
  }

  async _getZoneStates() {
    try {
      TadoController.headers["authority"] = "my.tado.com";
      let url = 'https://my.tado.com/api/v2/homes/' + TadoController.home['homeId'].toString() + '/zoneStates?ngsw-bypass=true';
      let res = await this.req(url, {}, 'GET', false, true)
      TadoController.zoneStatesList = res;
      return true
    }
    catch (e) {
      return false;
    }
  }

  getZoneStates() {
    return TadoController.zoneStatesList;
  }

  async _getZoneState(id) {
    try {
      TadoController.headers["authority"] = "my.tado.com";
      let url = 'https://my.tado.com/api/v2/homes/' + TadoController.home['homeId'].toString() + '/zones/' + id.toString() + '/capabilities?ngsw-bypass=true';
      let res = await this.req(url, {}, 'GET', false, true)
      TadoController.zoneStates[id.toString()] = res;
      return true
    }
    catch (e) {
      return false;
    }
  }

  getZoneState(id) {
    return TadoController.zoneStates[id];
  }

  async turnOff() {
    try {
      TadoController.headers["authority"] = "my.tado.com";

      let json_data = {
        'overlays': []
      }

      for (let h = 0; h < TadoController.zoneList.length; h++) {
        let overlay_zone = {
          "overlay": {
            "setting": {
              "power": "OFF",
              "type": "HEATING"
            },
            "termination": {
              "typeSkillBasedApp": "MANUAL"
            }
          },
          "room": 2
        };
        overlay_zone['room'] = TadoController.zoneList[h]['id'];
        json_data['overlays'].push(overlay_zone)
      }

      let url = 'https://my.tado.com/api/v2/homes/' + TadoController.home['homeId'].toString() + '/overlay?ngsw-bypass=true';
      await this.req(url, json_data, 'POST', true, false);
    }
    catch (e) {
      return false;
    }
  }

  isBoostActive() {
    let boost = 0;
    let zones = TadoController.zoneStatesList['zoneStates'];
    let zoneIds = Object.keys(zones);

    for (let g = 0; g < zoneIds.length; g++) {
      if (zones[zoneIds[g]]['overlayType'] != null) {
        boost += 1;
      }
    }

    return boost >= zoneIds.length - 1;
  }

  async boost() {
    try {
      TadoController.headers["authority"] = "my.tado.com";

      let json_data = {
        'overlays': []
      }

      for (let h = 0; h < TadoController.zoneList.length; h++) {
        let overlay_zone = {
          'overlay': {
            'setting': {
              'temperature': {
                'celsius': 25,
                'fahrenheit': 77,
              },
              'power': 'ON',
              'type': 'HEATING',
            },
            'termination': {
              'typeSkillBasedApp': 'TIMER',
              'durationInSeconds': 1800,
            },
          },
          'room': 2
        };
        overlay_zone['room'] = TadoController.zoneList[h]['id'];
        json_data['overlays'].push(overlay_zone);

      }

      let url = 'https://my.tado.com/api/v2/homes/' + TadoController.home['homeId'].toString() + '/overlay?ngsw-bypass=true';
      await this.req(url, json_data, 'POST', true, false);
      await self._getZones();
      await self._getHomeState();
      await self._getDeviceList();
      await self._getIncidents();
      await self._getZoneStates();
    }
    catch (e) {
      return false;
    }
  }

  async resumeSchedule() {
    try {
      let zones = [];
      for (let h = 0; h < TadoController.zoneList.length; h++) {
        zones.push(TadoController.zoneList[h]['id'].toString());
      }
      TadoController.headers["authority"] = "my.tado.com";
      let url = 'https://my.tado.com/api/v2/homes/' + TadoController.home['homeId'].toString() + '/overlay?rooms=' + zones.join(',') + '&ngsw-bypass=true';
      await this.req(url, {}, 'DELETE', false, false);
    }
    catch (e) {
      return false;
    }
  }

  async req(url = '', data = {}, method = 'GET', json_post = false, return_json = true) {
    try {
      let res = await this.DoReqAsync(url, data, method, json_post, return_json);
      return res;
    }
    catch (e) {
      this.log(e);
      return false;
    }
  }

  DoReqAsync(url = '', data = {}, method = 'GET', json_post = false, return_json = true) {
    return new Promise((resolve, reject) => {

      let message = Soup.Message.new(method, url);

      for (const [key, value] of Object.entries(TadoController.headers)) {
        message.request_headers.append(key, value);
      }

      if (TadoController.token != "") {
        message.request_headers.append('Authorization', 'Bearer ' + TadoController.token);
      }

      if (method == 'POST') {
        this.log("Sending");
        let utf8Encode = new TextEncoder();;
        if (json_post) {
          let sjs = JSON.stringify(data);
          message.set_request_body_from_bytes("application/json", utf8Encode.encode(sjs));
          this.log(sjs);
        } else {
          var formBody = [];
          for (var property in data) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
          }
          formBody = formBody.join("&");
          message.set_request_body_from_bytes("application/x-www-form-urlencoded", utf8Encode.encode(formBody));
          this.log(formBody);
        }
      }

      let httpSession = new Soup.Session();

      httpSession.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null, (httpSession, result) => {
        TadoController.lastStatusCode = message.get_status();
        let data = httpSession.send_and_read_finish(result).get_data();
        if (data instanceof Uint8Array) {
          data = ByteArray.toString(data);
          this.log(data);
        }
        try {
          if (!data) {
            this.log("No data in response body");
          }
          if (return_json) {
            resolve(JSON.parse(data));
          }
          resolve(data);
        }
        catch (e) {
          httpSession.abort();
          reject(e);
        }
      });
    });
  }
}


var Tado = class Tado extends TadoController {
  constructor(params) {
    super();
    Object.assign(this, params);
  }
};