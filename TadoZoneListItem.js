'use strict';

const { St, GObject, Clutter } = imports.gi;
const { Gio } = imports.gi;
const Slider = imports.ui.slider;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TadoBaseItem = Me.imports.TadoBaseItem;

/////////////////////////////////////////////////////////
// TadoZoneListItem
/////////////////////////////////////////////////////////
var TadoZoneListItem = GObject.registerClass({
  GTypeName: "TadoZoneListItem"
}, class TadoZoneListItem extends TadoBaseItem.TadoBaseItem {
  constructor(zone, tado, helpers) {
    super(helpers);

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
    this.sliderChangedId = this.slider.connect('notify::value', () => { 
      // log(this.slider.value); 
    });
    this.slider.connect('drag-begin', () => (this.inDrag = true));
    this.slider.connect('drag-end', () => {
      this.inDrag = false;
      // log("changed");
      // log(this.slider.value);
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

    button.child.set_gicon(this.helpers.GetIcon(power ? 'POWERTURNON' : 'POWER'));
    button.set_margin_right(15);

    button.connect("enter-event", function () {
      if (power) {
        button.child.set_gicon(self.helpers.GetIcon('POWERTURNOFF'));
      } else {
        button.child.set_gicon(self.helpers.GetIcon('POWERTURNON'));
      }
    });

    button.connect("leave-event", function () {
      if (power) {
        button.child.set_gicon(self.helpers.GetIcon('POWERTURNON'));
      } else {
        button.child.set_gicon(self.helpers.GetIcon('POWER'));
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

    this._box.add(first_box);
    this._box.add(spacer1);
    this._box.add(second_box);
    this._box.add(spacer2);
    this._box.add(third_box);

    this.actor.add_child(this._box)
  }
});