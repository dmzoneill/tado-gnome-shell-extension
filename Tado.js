'use strict'
// comment
const ByteArray = imports.byteArray // eslint-disable-line no-undef
const { GLib, Soup } = imports.gi // eslint-disable-line no-undef

class TadoController {
  static helpers = null
  static username = ''
  static password = ''
  static clientSecret = ''
  static token = ''
  static home = {}
  static homeState = {}
  static deviceList = {}
  static incidentList = {}
  static zoneStatesList = {}
  static zoneStates = {}
  static zoneList = {}
  static lastStatusCode = 200
  static headers = {
    authority: 'auth.tado.com',
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    'content-type': 'application/x-www-form-urlencoded',
    dnt: '1',
    origin: 'https://app.tado.com',
    pragma: 'no-cache',
    referer: 'https://app.tado.com/',
    'sec-ch-ua':
      '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    redirect: 'follow',
    credentials: 'same-origin'
  }

  constructor (helpers) {
    TadoController.helpers = helpers
  }

  getLog () {
    return TadoController.lastStatusCode === Soup.Status.OK
  }

  async run () {
    try {
      TadoController.helpers.debugLog = [] // empty the log each run
      const self = this
      let res = false

      res = await this._getSecret()
      if (!res) return false

      res = await this._getToken()
      if (!res) return false

      res = await this._getHome()
      if (!res) return false

      res = await this._getZones()
      if (!res) return false

      res = await this._getHomeState()
      if (!res) return false

      res = await this._getDeviceList()
      if (!res) return false

      res = await this._getIncidents()
      if (!res) return false

      res = await this._getZoneStates()
      if (!res) return false

      TadoController.zoneList.forEach((element) => {
        self._getZoneState(element.id)
      })

      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  async checkLogin (username, password) {
    let res = true

    TadoController.username = username
    TadoController.password = password

    res = await this._getSecret()
    res = await this._getToken()

    return res
  }

  async _getSecret () {
    try {
      TadoController.headers.authority = 'auth.tado.com'
      const res = await this.req(
        'https://app.tado.com/env.js',
        {},
        'GET',
        false,
        false
      )
      if (res === false) return false
      const rx = /clientSecret: '(.*?)'/g
      const arr = rx.exec(res)
      TadoController.clientSecret = arr[1]
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getSecret () {
    return TadoController.clientSecret
  }

  async _getToken () {
    try {
      TadoController.headers.authority = 'auth.tado.com'
      const url = 'https://auth.tado.com/oauth/token'
      const creds = {
        client_id: 'tado-web-app',
        client_secret: TadoController.clientSecret,
        grant_type: 'password',
        password: TadoController.password,
        scope: 'home.user',
        username: TadoController.username
      }

      const res = await this.req(url, creds, 'POST', false, true)

      if (res === false) {
        return false
      }

      if (typeof res === 'object') {
        if (Object.keys(res).includes('access_token') === false) {
          return false
        }
      } else {
        if (res.indexOf('error') > -1) {
          return false
        }
      }

      TadoController.token = res.access_token
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getToken () {
    return TadoController.token
  }

  async _getRefreshToken () {
    try {
      TadoController.headers.authority = 'auth.tado.com'
      const url = 'https://auth.tado.com/oauth/token'
      const creds = {
        grant_type: 'refresh_token',
        refresh_token: 'def',
        client_id: 'tado-web-app',
        scope: 'home.user',
        client_secret: TadoController.clientSecret
      }

      const res = await this.req(url, creds, 'POST', false, false)
      TadoController.clientSecret = res.access_token
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getRefreshToken () {
    return TadoController.token
  }

  async _getHome () {
    try {
      TadoController.headers.authority = 'my.tado.com'
      const url = 'https://my.tado.com/api/v1/me'
      const res = await this.req(url, {}, 'GET', false, true)
      TadoController.home = res
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getHome () {
    return TadoController.home
  }

  async _getHomeState () {
    try {
      TadoController.headers.authority = 'my.tado.com'
      const url =
        'https://my.tado.com/api/v2/homes/' +
        TadoController.home.homeId.toString() +
        '/state?ngsw-bypass=true'
      const res = await this.req(url, {}, 'GET', false, true)
      TadoController.homeState = res
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getHomeState () {
    return TadoController.homeState
  }

  async _getDeviceList () {
    try {
      TadoController.headers.authority = 'my.tado.com'
      const url =
        'https://my.tado.com/api/v2/homes/' +
        TadoController.home.homeId.toString() +
        '/deviceList?ngsw-bypass=true'
      const res = await this.req(url, {}, 'GET', false, true)
      TadoController.deviceList = res
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getDeviceList () {
    return TadoController.deviceList
  }

  async _getIncidents () {
    try {
      TadoController.headers.authority = 'my.tado.com'
      const url =
        'https://minder.tado.com/v1/homes/' +
        TadoController.home.homeId.toString() +
        '/incidents?ngsw-bypass=true'
      const res = await this.req(url, {}, 'GET', false, true)
      TadoController.incidentList = res
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getIncidents () {
    return TadoController.incidentList
  }

  async _getZones () {
    try {
      TadoController.headers.authority = 'my.tado.com'
      const url =
        'https://my.tado.com/api/v2/homes/' +
        TadoController.home.homeId.toString() +
        '/zones?ngsw-bypass=true'
      const res = await this.req(url, {}, 'GET', false, true)
      TadoController.zoneList = res
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getZones () {
    return TadoController.zoneList
  }

  getZoneTempHumidity (id) {
    try {
      const zone = TadoController.zoneStatesList.zoneStates[id.toString()]
      const sensorDataPoints = zone.sensorDataPoints
      const insideTemperature = sensorDataPoints.insideTemperature.celsius
      const humidity = sensorDataPoints.humidity.percentage
      return [insideTemperature, humidity]
    } catch (error) {
      TadoController.helpers.log(error)
      return [0, 0]
    }
  }

  getZonePowerSetting (id) {
    try {
      const zone = TadoController.zoneStatesList.zoneStates[id.toString()]
      const power = zone.setting.power
      return power !== 'OFF'
    } catch (error) {
      TadoController.helpers.log(error)
      return 99
    }
  }

  getZoneTempSetting (id) {
    try {
      const zone = TadoController.zoneStatesList.zoneStates[id.toString()]
      const nextScheduleChange = zone.nextScheduleChange
      const nextTemperature = nextScheduleChange.setting.temperature.celsius
      return nextTemperature
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getNextState (id) {
    try {
      const zone = TadoController.zoneStatesList.zoneStates[id.toString()]
      const nextScheduleChange = zone.nextScheduleChange
      const start = nextScheduleChange.start
      const power = nextScheduleChange.setting.power
      return [start, power]
    } catch (error) {
      TadoController.helpers.log(error)
      return ['', '']
    }
  }

  async _getZoneStates () {
    try {
      TadoController.headers.authority = 'my.tado.com'
      const url =
        'https://my.tado.com/api/v2/homes/' +
        TadoController.home.homeId.toString() +
        '/zoneStates?ngsw-bypass=true'
      const res = await this.req(url, {}, 'GET', false, true)
      TadoController.zoneStatesList = res
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getZoneStates () {
    return TadoController.zoneStatesList
  }

  async _getZoneState (id) {
    try {
      TadoController.headers.authority = 'my.tado.com'
      const url =
        'https://my.tado.com/api/v2/homes/' +
        TadoController.home.homeId.toString() +
        '/zones/' +
        id.toString() +
        '/capabilities?ngsw-bypass=true'
      const res = await this.req(url, {}, 'GET', false, true)
      TadoController.zoneStates[id.toString()] = res
      return true
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  getZoneState (id) {
    return TadoController.zoneStates[id]
  }

  async turnOff () {
    try {
      TadoController.headers.authority = 'my.tado.com'

      const jsonData = {
        overlays: []
      }

      for (let h = 0; h < TadoController.zoneList.length; h++) {
        const overlayZone = {
          overlay: {
            setting: {
              power: 'OFF',
              type: 'HEATING'
            },
            termination: {
              typeSkillBasedApp: 'MANUAL'
            }
          },
          room: 2
        }
        overlayZone.room = TadoController.zoneList[h].id
        jsonData.overlays.push(overlayZone)
      }

      const url =
        'https://my.tado.com/api/v2/homes/' +
        TadoController.home.homeId.toString() +
        '/overlay?ngsw-bypass=true'
      await this.req(url, jsonData, 'POST', true, false)
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  isBoostActive () {
    let boost = 0
    const zones = TadoController.zoneStatesList.zoneStates
    const zoneIds = Object.keys(zones)

    for (let g = 0; g < zoneIds.length; g++) {
      if (zones[zoneIds[g]].overlayType != null) {
        boost += 1
      }
    }

    return boost >= zoneIds.length - 1
  }

  async boost () {
    try {
      TadoController.headers.authority = 'my.tado.com'

      const jsonData = {
        overlays: []
      }

      for (let h = 0; h < TadoController.zoneList.length; h++) {
        const overlayZone = {
          overlay: {
            setting: {
              temperature: {
                celsius: 25,
                fahrenheit: 77
              },
              power: 'ON',
              type: 'HEATING'
            },
            termination: {
              typeSkillBasedApp: 'TIMER',
              durationInSeconds: 1800
            }
          },
          room: 2
        }
        overlayZone.room = TadoController.zoneList[h].id
        jsonData.overlays.push(overlayZone)
      }

      const url =
        'https://my.tado.com/api/v2/homes/' +
        TadoController.home.homeId.toString() +
        '/overlay?ngsw-bypass=true'
      await this.req(url, jsonData, 'POST', true, false)
      await this._getZones()
      await this._getHomeState()
      await this._getDeviceList()
      await this._getIncidents()
      await this._getZoneStates()
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  async resumeSchedule () {
    try {
      const zones = []
      for (let h = 0; h < TadoController.zoneList.length; h++) {
        zones.push(TadoController.zoneList[h].id.toString())
      }
      TadoController.headers.authority = 'my.tado.com'
      const url =
        'https://my.tado.com/api/v2/homes/' +
        TadoController.home.homeId.toString() +
        '/overlay?rooms=' +
        zones.join(',') +
        '&ngsw-bypass=true'
      await this.req(url, {}, 'DELETE', false, false)
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  async req (
    url = '',
    data = {},
    method = 'GET',
    jsonPost = false,
    returnJson = true
  ) {
    try {
      const res = await this.DoReqAsync(
        url,
        data,
        method,
        jsonPost,
        returnJson
      )
      return res
    } catch (error) {
      TadoController.helpers.log(error)
      return false
    }
  }

  DoReqAsync (
    url = '',
    data = {},
    method = 'GET',
    jsonPost = false,
    returnJson = true
  ) {
    return new Promise((resolve, reject) => {
      const message = Soup.Message.new(method, url)

      for (const [key, value] of Object.entries(TadoController.headers)) {
        message.request_headers.append(key, value)
      }

      if (TadoController.token !== '') {
        message.request_headers.append(
          'Authorization',
          'Bearer ' + TadoController.token
        )
      }

      if (method === 'POST') {
        TadoController.helpers.log('Sending')
        const utf8Encode = new TextEncoder()
        if (jsonPost) {
          const sjs = JSON.stringify(data)
          message.set_request_body_from_bytes(
            'application/json',
            utf8Encode.encode(sjs)
          )
          TadoController.helpers.log(sjs)
        } else {
          let formBody = []
          for (const property in data) {
            const encodedKey = encodeURIComponent(property)
            const encodedValue = encodeURIComponent(data[property])
            formBody.push(encodedKey + '=' + encodedValue)
          }
          formBody = formBody.join('&')
          message.set_request_body_from_bytes(
            'application/x-www-form-urlencoded',
            utf8Encode.encode(formBody)
          )
          TadoController.helpers.log(formBody)
        }
      }

      const httpSession = new Soup.Session()

      httpSession.send_and_read_async(
        message,
        GLib.PRIORITY_DEFAULT,
        null,
        (httpSession, result) => {
          TadoController.lastStatusCode = message.get_status()
          let data = httpSession.send_and_read_finish(result).get_data()
          if (data instanceof Uint8Array) {
            data = ByteArray.toString(data)
            TadoController.helpers.log(data)
          }
          try {
            if (!data) {
              TadoController.helpers.log('No data in response body')
            }
            if (returnJson) {
              resolve(JSON.parse(data))
            }
            resolve(data)
          } catch (e) {
            httpSession.abort()
            reject(e)
          }
        }
      )
    })
  }
}

var Tado = class Tado extends TadoController { // eslint-disable-line
  // eslint-disable-line
  constructor (params) {
    super(params)
    Object.assign(this, params)
  }
}
