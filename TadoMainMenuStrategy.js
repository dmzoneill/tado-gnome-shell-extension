
'use strict'

const { St, GObject } = imports.gi // eslint-disable-line
const { Gio } = imports.gi // eslint-disable-line
const PopupMenu = imports.ui.popupMenu // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoCustomSectionHeader = Me.imports.TadoCustomSectionHeader
const TadoZoneListItemSeparator = Me.imports.TadoZoneListItemSeparator
const TadoButtonListItem = Me.imports.TadoButtonListItem
const TadoZoneListItem = Me.imports.TadoZoneListItem
const TadoHeader = Me.imports.TadoHeader

try {
  /// //////////////////////////////////////////////////////
  // TadoMainMenuStrategy
  /// //////////////////////////////////////////////////////
  var TadoMainMenuStrategy = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoMainMenuStrategy'
  }, class TadoMainMenuStrategy extends GObject.Object {
    constructor (manager, helpers, tado) {
      super()
      this.manager = manager
      this.helpers = helpers
      this.tado = tado
    }

    async createMenu (menu, ticker) {
      try {
        this.zoneListItems = []

        const res = await this.tado.run()
        if (res === false) {
          if ('countDownLabel' in this) {
            this.countDownLabel.text = ticker === 0 ? 'Failed updating ..' : ticker.toString()
          }
          this.manager.resetCountDownTimer()
          return
        }

        // remove all the previous menuitems
        menu.removeAll()

        // tado header
        menu.addMenuItem(new TadoHeader.TadoHeader(this.helpers))

        // separator
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())

        // zones header
        menu.addMenuItem(new TadoCustomSectionHeader.TadoCustomSectionHeader('Zones', this.helpers))

        // zones
        const zones = this.tado.getZones()
        for (let i = 0; i < zones.length; i++) {
          const item = new TadoZoneListItem.TadoZoneListItem(zones[i], this.tado, this.helpers)
          menu.addMenuItem(item)
          this.zoneListItems.push(item)
          if (zones.length > 1 && i < zones.length - 1) {
            menu.addMenuItem(new TadoZoneListItemSeparator.TadoZoneListItemSeparator(this.helpers))
          }
        }

        // separator
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())

        this.countDownLabel = new St.Label(
          {
            text: ticker === 0 ? 'Updating ..' : ticker.toString(),
            x_expand: false,
            y_expand: true
          }
        )

        let boostOption = null

        if (this.tado.isBoostActive() === false) {
          boostOption = ['BOOST', () => {
            this.tado.boost()
            this.manager.resetCountDownTimer(2)
          }]
        } else {
          boostOption = ['RESUME', () => {
            this.tado.resumeSchedule()
            this.manager.resetCountDownTimer(2)
          }]
        }

        const spacer1 = new St.Label({ text: '   ', x_expand: false, style_class: 'spacer' })
        const spacer2 = new St.Label({ text: '   ', x_expand: false, style_class: 'spacer' })

        // bottom menu
        menu.addMenuItem(new TadoButtonListItem.TadoButtonListItem([
          boostOption,
          ['HOME', () => {
            // log("Clicked");
          }],
          spacer1,
          this.countDownLabel,
          spacer2,
          ['SETTINGS', () => {
            this.manager.DisplaySigninMenu()
          }],
          ['EOPEN', () => {
            this.manager.DisplayAbout()
          }]
        ], this.helpers))
      } catch (error) {
        this.helpers.log(error)
      }
    }

    async updateMenu (menu, counter) {
      if ('countDownLabel' in this) {
        this.countDownLabel.text = counter === 0 ? 'Updating ..' : counter.toString()
      }
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
