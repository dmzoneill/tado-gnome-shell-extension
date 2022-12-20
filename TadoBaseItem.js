const { St, GObject } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

/////////////////////////////////////////////////////////
// TadoBaseItem
/////////////////////////////////////////////////////////

var TadoBaseItem = GObject.registerClass({
  GTypeName: "TadoBaseItem"
}, class TadoBaseItem extends PopupMenu.PopupBaseMenuItem {
  constructor(helpers) {
    super(
      {
        activate: false
      }
    );

    this.helpers = helpers;

    this._box = new St.BoxLayout(
      {
        x_align: St.Align.START,
        x_expand: true,
        width: 320,
        style_class: 'base'
      }
    );
  }

  makeButton(icon_name, callback) {
    let icon = this.helpers.GetIcon(icon_name);
    let iconblue = this.helpers.GetIcon(icon_name + 'BLUE');

    let button = new St.Button(
      {
        x_expand: true,
        child: new St.Icon(
          {
            gicon: icon,
            style_class: 'lower-menu-icon'
          }
        )
      }
    );

    if (callback != false) {
      button.connect('clicked', callback);

      button.connect("enter-event", function () {
        if (button.child == null) return;
        button.child.set_gicon(iconblue);
      });

      button.connect("leave-event", function () {
        if (button.child == null) return;
        button.child.set_gicon(icon);
      });
    }

    return button;
  }
});
