/* detailsButton.js
 *
 * Copyright 2020 Martin Abente Lahaye
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const {Gio, GObject, Gtk, GLib} = imports.gi;

const GSActivateIface = `
<node xmlns:doc="http://www.freedesktop.org/dbus/1.0/doc.dtd">
    <interface name='org.gtk.Actions'>
        <method name='Activate'>
            <arg type='s' name='action_name'/>
            <arg type='av' name='parameter'/>
            <arg type='a{sv}' name='platorm_data'/>
        </method>
    </interface>
</node>
`;

const DBListNamesIface = `
<node xmlns:doc="http://www.freedesktop.org/dbus/1.0/doc.dtd">
    <interface name='org.freedesktop.DBus'>
        <method name='ListActivatableNames'>
            <arg type='as' direction='out'/>
        </method>
    </interface>
</node>
`;


var FlatsealDetailsButton = GObject.registerClass({
    GTypeName: 'FlatsealDetailsButton',
}, class FlatsealDetailsButton extends Gtk.Button {
    _init(permissions) {
        super._init();
        this._setup(permissions);
    }

    _setup(permissions) {
        this._permissions = permissions;
        this._permissions.connect('changed', this._update.bind(this));

        this._found_manager = this.constructor._has_software_manager();

        this.set_label(_('Show Details'));
        this.can_focus = false;
        this.visible = true;

        if (this.sensitive)
            this.connect('clicked', this._clicked.bind(this));

        this._update();
    }

    static _has_software_manager() {
        const DBListNamesProxy = Gio.DBusProxy.makeProxyWrapper(DBListNamesIface);
        const proxy = new DBListNamesProxy(
            Gio.DBus.session, 'org.freedesktop.DBus', '/org/freedesktop/DBus');
        const [services] = proxy.ListActivatableNamesSync();
        return services.indexOf('org.gnome.Software') !== -1;
    }

    _clicked() {
        const GSProxy = Gio.DBusProxy.makeProxyWrapper(GSActivateIface);
        const proxy = new GSProxy(
            Gio.DBus.session, 'org.gnome.Software', '/org/gnome/Software');
        const args = GLib.Variant.new('(ss)', [this._permissions.appId, '']);
        proxy.ActivateSync('details', [args], null);
    }

    _update() {
        this.sensitive = this._found_manager && this._permissions.appId;

        if (this.sensitive)
            this.set_tooltip_text(_('Show application in a software manager'));
        else
            this.set_tooltip_text(_('No software manager found'));
    }
});
