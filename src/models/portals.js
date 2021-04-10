/* exported FlatpakPortalsModel getDefault */
/* eslint class-methods-use-this: */

/* portals.js
 *
 * Copyright 2020-2021 Martin Abente Lahaye
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

const {Gio, GLib, GObject} = imports.gi;
const {info} = imports.models;

var PermissionsIface = `
<node xmlns:doc="http://www.freedesktop.org/dbus/1.0/doc.dtd">
    <interface name="org.freedesktop.impl.portal.PermissionStore">
        <method name="List">
            <arg type="s" name="table" direction="in"/>
            <arg type="as" name="ids" direction="out"/>
        </method>
        <method name="Lookup">
            <arg type="s" name="table" direction="in"/>
            <arg type="s" name="id" direction="in"/>
            <arg type="a{sas}" name="permissions" direction="out"/>
            <arg type="v" name="data" direction="out"/>
        </method>
        <method name="SetPermission">
            <arg type="s" name="table" direction="in"/>
            <arg type="b" name="create" direction="in"/>
            <arg type="s" name="id" direction="in"/>
            <arg type="s" name="app" direction="in"/>
            <arg type="as" name="permissions" direction="in"/>
        </method>
        <property name="version" type="u" access="read"/>
    </interface>
</node>
`;


const SUPPORTED_VERSION = 2;


var FlatpakPortalsModel = GObject.registerClass({
    GTypeName: 'FlatpakPortalsModel',
}, class FlatpakPortalsModel extends GObject.Object {
    _init() {
        super._init({});
        this._proxy = null;
        this._backgroundSupported = null;
        this._notificationsSupported = null;
        this._devicesSupported = null;
        this._locationSupported = null;
        this._info = info.getDefault();
        this.appId = '';
    }

    _setup() {
        if (this._proxy !== null)
            return;

        var busName = GLib.getenv('FLATSEAL_PORTAL_BUS_NAME');
        if (busName === null)
            busName = 'org.freedesktop.impl.portal.PermissionStore';

        const PermissionsProxy = Gio.DBusProxy.makeProxyWrapper(PermissionsIface);
        this._proxy = new PermissionsProxy(
            Gio.DBus.session,
            busName,
            '/org/freedesktop/impl/portal/PermissionStore');
    }

    getPermissions() {
        return {
            'portals-background': {
                supported: this.isSupported('background'),
                description: _('Background'),
                value: this.constructor.getDefault(),
                example: _('Can run in the background'),
                table: 'background',
                id: 'background',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-notification': {
                supported: this.isSupported('notifications'),
                description: _('Notifications'),
                value: this.constructor.getDefault(),
                example: _('Can send notifications'),
                table: 'notifications',
                id: 'notification',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-microphone': {
                supported: this.isSupported('devices'),
                description: _('Microphone'),
                value: this.constructor.getDefault(),
                example: _('Can listen to your microphone'),
                table: 'devices',
                id: 'microphone',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-speakers': {
                supported: this.isSupported('devices'),
                description: _('Speakers'),
                value: this.constructor.getDefault(),
                example: _('Can play sounds to your speakers'),
                table: 'devices',
                id: 'speakers',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-camera': {
                supported: this.isSupported('devices'),
                description: _('Camera'),
                value: this.constructor.getDefault(),
                example: _('Can record videos with your camera'),
                table: 'devices',
                id: 'camera',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-location': {
                supported: this.isSupported('location'),
                description: _('Location'),
                value: this.constructor.getDefault(),
                example: _('Can access your location'),
                table: 'location',
                id: 'location',
                allowed: ['EXACT', '0'],
                disallowed: ['NONE', '0'],
            },
        };
    }

    static getType() {
        return 'state';
    }

    static getDefault() {
        return false;
    }

    static getStyle() {
        return 'portals';
    }

    static getGroup() {
        return 'portals';
    }

    static getTitle() {
        return 'Portals';
    }

    static getDescription() {
        return _('List of resources selectively granted to the application');
    }

    isSupported(table) {
        if (this[`_${table}Supported`] !== null)
            return this[`_${table}Supported`];

        this._setup();
        const [ids] = this._proxy.ListSync(table);

        const flatpakSupported = this._info.supports('0.4.0');
        const serviceSupported = this._proxy.version >= SUPPORTED_VERSION;
        const tableSupported = ids.length > 0;

        this[`_${table}Supported`] = serviceSupported && tableSupported && flatpakSupported;
        return this[`_${table}Supported`];
    }

    updateFromProxyProperty(property, value) {
        const permission = this.getPermissions()[property];

        this._setup();
        if (!this.isSupported(permission.table))
            return;

        // don't write to the store unnecessarily
        if (value === permission.value) {
            const [appIds] = this._proxy.LookupSync(permission.table, permission.id);
            if (!(this.appId in appIds))
                return;
        }

        const access = value ? permission.allowed : permission.disallowed;

        this._proxy.SetPermissionSync(
            permission.table,
            false,
            permission.id,
            this.appId,
            access);
    }

    updateProxyProperty(proxy) {
        Object.entries(this.getPermissions()).forEach(([property, permission]) => {
            this._setup();
            if (!this.isSupported(permission.table))
                return;

            try {
                const [appIds] = this._proxy.LookupSync(permission.table, permission.id);
                const value = this.appId in appIds && appIds[this.appId][0] === permission.allowed[0];
                proxy.set_property(property, value);
            } catch (err) {
                proxy.set_property(property, false);
            }
        });
    }

    backup(proxy) {
        this._backup = {};
        Object.keys(this.getPermissions()).forEach(property => {
            this._backup[property] = proxy[property];
        });
    }

    restore() {
        Object.keys(this.getPermissions()).forEach(property => {
            this.updateFromProxyProperty(property, this._backup[property]);
        });
    }

    forget() {
        Object.entries(this.getPermissions()).forEach(([property, permission]) => {
            // XXX use https://github.com/flatpak/xdg-desktop-portal/issues/573
            this.updateFromProxyProperty(property, permission.value);
        });
    }

    changed(proxy) {
        for (const property in this.getPermissions()) {
            if (proxy[property] === true)
                return true;
        }
        return false;
    }

    saveToKeyFile() {

        /* this backend has no file */
    }

    reset() {

        /* this backends speaks directly to DBus */
    }

    reload() {
        const permissions = this.getPermissions();

        Object.keys(permissions).forEach(property => {
            const permission = permissions[property];
            this[`_${permission.table}Supported`] = null;
            this.isSupported(permission.table);
        });
    }
});


var getDefault = (function() {
    let instance;
    return function() {
        if (typeof instance === 'undefined')
            instance = new FlatpakPortalsModel();
        return instance;
    };
}());
