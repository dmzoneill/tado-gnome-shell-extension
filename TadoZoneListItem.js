'use strict'

const { St, GObject, Clutter } = imports.gi // eslint-disable-line
const { Gio } = imports.gi // eslint-disable-line
const Slider = imports.ui.slider // eslint-disable-line
const ExtensionUtils = imports.misc.extensionUtils // eslint-disable-line
const Me = ExtensionUtils.getCurrentExtension()
const TadoBaseItem = Me.imports.TadoBaseItem

try {
  /// //////////////////////////////////////////////////////
  // TadoZoneListItem
  /// //////////////////////////////////////////////////////
  var TadoZoneListItem = GObject.registerClass({ // eslint-disable-line
    GTypeName: 'TadoZoneListItem'
  }, class TadoZoneListItem extends TadoBaseItem.TadoBaseItem {
    constructor (zone, tado, helpers) {
      super(helpers)

      const self = this

      this.set_style_class_name('ZoneListItem')
      this.connect('enter-event', function () {
        self.set_style_class_name('ZoneListItemHover')
      })
      this.connect('leave-event', function () {
        self.set_style_class_name('ZoneListItem')
      })

      this.zone = zone
      this.tado = tado
      const temphum = this.tado.getZoneTempHumidity(this.zone.id)
      const tempSetting = this.tado.getZoneTempSetting(this.zone.id)
      const power = this.tado.getZonePowerSetting(this.zone.id)
      const nextState = this.tado.getNextState(this.zone.id)
      let nextTime = new Date(nextState[0])
      nextTime = nextTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })

      this.inDrag = false
      this.slider = new Slider.Slider(0)
      this.slider.value = tempSetting / 25
      this.sliderChangedId = this.slider.connect('notify::value', () => {
        // log(this.slider.value);
      })
      this.slider.connect('drag-begin', () => (this.inDrag = true))
      this.slider.connect('drag-end', () => {
        this.inDrag = false
        // log("changed");
        // log(this.slider.value);
      })

      // for focus indication
      const sliderBin = new St.Bin({
        style_class: 'slider-bin',
        child: this.slider,
        reactive: true,
        can_focus: true,
        x_expand: true,
        y_align: Clutter.ActorAlign.CENTER
      })

      sliderBin.set_accessible(this.slider.get_accessible())
      sliderBin.connect('event', (bin, event) => this.slider.event(event, false))

      const button = new St.Button(
        {
          x_expand: false,
          x_align: St.Align.START,
          child: new St.Icon(
            {
              style_class: 'power-off-button'
            }
          )
        }
      )

      button.child.set_gicon(this.helpers.GetIcon(power ? 'POWERTURNON' : 'POWER'))
      button.set_margin_right(15)

      button.connect('enter-event', function () {
        if (power) {
          button.child.set_gicon(self.helpers.GetIcon('POWERTURNOFF'))
        } else {
          button.child.set_gicon(self.helpers.GetIcon('POWERTURNON'))
        }
      })

      button.connect('leave-event', function () {
        if (power) {
          button.child.set_gicon(self.helpers.GetIcon('POWERTURNON'))
        } else {
          button.child.set_gicon(self.helpers.GetIcon('POWER'))
        }
      })

      const nextStateLabel = new St.Label(
        {
          text: 'Scheduled ' + nextTime + ' (' + nextState[1] + ')',
          x_align: St.Align.END,
          x_expand: true,
          width: 190,
          style_class: 'next_state_label'
        }
      )

      const zoneLabel = new St.Label(
        {
          text: this.zone.name,
          x_expand: true
        }
      )

      const spacer1 = new St.Label(
        {
          text: '   ',
          x_expand: false,
          style_class: 'spacer'
        }
      )

      const spacer2 = new St.Label(
        {
          text: '   ',
          x_expand: false,
          style_class: 'spacer'
        }
      )

      let tempSingleDecimal = parseFloat(temphum[0])
      tempSingleDecimal = tempSingleDecimal.toFixed(1)

      const temperature = new St.Label(
        {
          text: tempSingleDecimal.toString() + '°',
          x_expand: false,
          y_expand: true,
          style_class: 'temperature'
        }
      )

      const firstBox = new St.BoxLayout(
        {
          x_align: St.Align.START,
          x_expand: false,
          y_expand: true,
          width: 30
        }
      )

      const secondBox = new St.BoxLayout(
        {
          x_align: St.Align.END,
          x_expand: true,
          y_expand: true,
          vertical: true,
          width: 200
        }
      )

      const thirdBox = new St.BoxLayout(
        {
          x_align: St.Align.END,
          y_align: St.Align.MIDDLE,
          x_expand: false,
          y_expand: true,
          vertical: true
        }
      )

      const secondBoxInner1 = new St.BoxLayout(
        {
          x_align: St.Align.START,
          x_expand: true,
          height: 20,
          width: 200
        }
      )

      const secondBoxInner2 = new St.BoxLayout(
        {
          x_align: St.Align.START,
          x_expand: true,
          height: 30,
          width: 200
        }
      )

      const secondBoxInner3 = new St.BoxLayout(
        {
          x_align: St.Align.END,
          x_expand: true,
          height: 20,
          width: 200
        }
      )

      const thirdBoxInner1 = new St.BoxLayout(
        {
          x_align: St.Align.START,
          y_align: St.Align.MIDDLE,
          x_expand: true,
          y_expand: true,
          height: 60
        }
      )

      secondBoxInner1.add(zoneLabel)
      secondBoxInner2.add(sliderBin)
      secondBoxInner3.add(nextStateLabel)
      thirdBoxInner1.add(temperature)

      firstBox.add(button)
      secondBox.add(secondBoxInner1)
      secondBox.add(secondBoxInner2)
      secondBox.add(secondBoxInner3)
      thirdBox.add(thirdBoxInner1)

      this._box.add(firstBox)
      this._box.add(spacer1)
      this._box.add(secondBox)
      this._box.add(spacer2)
      this._box.add(thirdBox)

      this.actor.add_child(this._box)
    }
  })
} catch (error) {
  log(error) // eslint-disable-line
}
