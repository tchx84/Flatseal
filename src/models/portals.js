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
        <method name="DeletePermission">
            <arg name='table' type='s' direction='in'/>
            <arg name='id' type='s' direction='in'/>
            <arg name='app' type='s' direction='in'/>
        </method>
        <property name="version" type="u" access="read"/>
    </interface>
</node>
`;


const SUPPORTED_SERVICE_VERSION = 2;
const SUPPORTED_FLATPAK_VERSION = '0.4.0';

var FlatpakPortalState = {
    UNKNOWN: 0,
    UNSUPPORTED: 1,
    UNSET: 2,
    DISALLOWED: 3,
    ALLOWED: 4,
};


var FlatpakPortalsModel = GObject.registerClass({
    GTypeName: 'FlatpakPortalsModel',
}, class FlatpakPortalsModel extends GObject.Object {
    _init() {
        super._init({});
        this._backup = {};
        this._proxy = null;

        this._backgroundbackgroundSupported = null;
        this._notificationsnotificationSupported = null;
        this._devicesmicrophoneSupported = null;
        this._devicesspeakersSupported = null;
        this._devicescameraSupported = null;
        this._locationlocationSupported = null;

        this._backgroundbackgroundReason = '';
        this._notificationsnotificationReason = '';
        this._devicesmicrophoneReason = '';
        this._devicesspeakersReason = '';
        this._devicescameraReason = '';
        this._locationlocationReason = '';

        this._info = info.getDefault();
        this._appId = '';
    }

    _setup() {
        if (this._proxy !== null)
            return;

        let busName = GLib.getenv('FLATSEAL_PORTAL_BUS_NAME');
        if (busName === null)
            busName = 'org.freedesktop.impl.portal.PermissionStore';

        const PermissionsProxy = Gio.DBusProxy.makeProxyWrapper(PermissionsIface);

        try {
            this._proxy = new PermissionsProxy(
                Gio.DBus.session,
                busName,
                '/org/freedesktop/impl/portal/PermissionStore');
        } catch (err) {
            logError(err);
        }
    }

    getPermissions() {
        return {
            'portals-background': {
                supported: this.isSupported('background', 'background'),
                description: _('Background'),
                value: this.constructor.getDefault(),
                example: _('Can run in the background'),
                table: 'background',
                id: 'background',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-notification': {
                supported: this.isSupported('notifications', 'notification'),
                description: _('Notifications'),
                value: this.constructor.getDefault(),
                example: _('Can send notifications'),
                table: 'notifications',
                id: 'notification',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-microphone': {
                supported: this.isSupported('devices', 'microphone'),
                description: _('Microphone'),
                value: this.constructor.getDefault(),
                example: _('Can listen to your microphone'),
                table: 'devices',
                id: 'microphone',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-speakers': {
                supported: this.isSupported('devices', 'speakers'),
                description: _('Speakers'),
                value: this.constructor.getDefault(),
                example: _('Can play sounds to your speakers'),
                table: 'devices',
                id: 'speakers',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-camera': {
                supported: this.isSupported('devices', 'camera'),
                description: _('Camera'),
                value: this.constructor.getDefault(),
                example: _('Can record videos with your camera'),
                table: 'devices',
                id: 'camera',
                allowed: ['yes'],
                disallowed: ['no'],
            },
            'portals-location': {
                supported: this.isSupported('location', 'location'),
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
        return 'portal';
    }

    static getDefault() {
        return FlatpakPortalState.UNKNOWN;
    }

    static getMax() {
        return FlatpakPortalState.ALLOWED;
    }

    static getMin() {
        return FlatpakPortalState.UNKNOWN;
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

    safeList(table) {
        try {
            return this._proxy.ListSync(table);
        } catch (err) {
            return [[]];
        }
    }

    safeLookUp(table, id) {
        try {
            return this._proxy.LookupSync(table, id);
        } catch (err) {
            return [null];
        }
    }

    safeSetPermission(table, id, appId, access) {
        try {
            this._proxy.SetPermissionSync(table, false, id, appId, access);
        } catch (err) {
            logError(err);
        }
    }

    safeDeletePermission(table, id, appId) {
        try {
            this._proxy.DeletePermissionSync(table, id, appId);
        } catch (err) {
            logError(err);
        }
    }

    isSupported(table, id) {
        if (this[`_${table}${id}Supported`] !== null)
            return this[`_${table}${id}Supported`];

        if (this._info.supports(SUPPORTED_FLATPAK_VERSION) === false) {
            this[`_${table}${id}Reason`] = _('Not supported by the installed version of Flatpak');
            this[`_${table}${id}Supported`] = false;
            return false;
        }

        this._setup();

        if (this._proxy === null || this._proxy.version >= SUPPORTED_SERVICE_VERSION === false) {
            this[`_${table}${id}Reason`] = _('Requires permission store version 2 or newer');
            this[`_${table}${id}Supported`] = false;
            return false;
        }

        const [appIds] = this.safeLookUp(table, id);

        if (appIds === null) {
            this[`_${table}${id}Reason`] = _('Portal data has not been set up yet');
            this[`_${table}${id}Supported`] = false;
            return false;
        }

        this[`_${table}${id}Reason`] = '';
        this[`_${table}${id}Supported`] = true;
        return true;
    }

    getUnsupportedReason(table, id) {
        return this[`_${table}${id}Reason`];
    }

    updateFromProxyProperty(property, value) {
        const permission = this.getPermissions()[property];

        if (!this.isSupported(permission.table, permission.id))
            return;

        if (value === FlatpakPortalState.UNSET) {
            this.unset(permission.table, permission.id);
        } else if (value === FlatpakPortalState.ALLOWED) {
            this.safeSetPermission(permission.table, permission.id, this.appId, permission.allowed);
        } else if (value === FlatpakPortalState.DISALLOWED) {
            this.safeSetPermission(permission.table, permission.id, this.appId, permission.disallowed);
        } else {

            /* unsupported */
        }
    }

    updateStatusProperty() {

        /* does not apply to this backend */
    }

    updateProxyProperty(proxy) {
        Object.entries(this.getPermissions()).forEach(([property, permission]) => {
            if (!this.isSupported(permission.table, permission.id)) {
                proxy.set_property(property, FlatpakPortalState.UNSUPPORTED);
                return;
            }

            const [appIds] = this.safeLookUp(permission.table, permission.id);

            if (appIds === null)
                proxy.set_property(property, FlatpakPortalState.UNSUPPORTED);
            else if (!(this.appId in appIds))
                proxy.set_property(property, FlatpakPortalState.UNSET);
            else if (appIds[this.appId][0] === permission.allowed[0])
                proxy.set_property(property, FlatpakPortalState.ALLOWED);
            else
                proxy.set_property(property, FlatpakPortalState.DISALLOWED);
        });
    }

    backup() {
        this._backup = {};

        for (const [property, permission] of Object.entries(this.getPermissions())) {
            if (!this.isSupported(permission.table, permission.id))
                continue;

            const [appIds] = this.safeLookUp(permission.table, permission.id);
            if (appIds === null || !(this.appId in appIds))
                continue;

            this._backup[property] = appIds[this.appId];
        }
    }

    restore() {
        for (const [property, permission] of Object.entries(this.getPermissions())) {
            if (!(property in this._backup))
                continue;

            this.safeSetPermission(permission.table, permission.id, this.appId, this._backup[property]);
        }
    }

    unset(table, id) {
        const [appIds] = this.safeLookUp(table, id);
        if (appIds === null || !(this.appId in appIds))
            return;

        /* https://github.com/flatpak/xdg-desktop-portal/issues/573 */
        if (Object.keys(appIds).length === 1)
            this.safeSetPermission(table, id, '', []);

        this.safeDeletePermission(table, id, this.appId);
    }

    forget() {
        for (const [, permission] of Object.entries(this.getPermissions())) {
            if (!this.isSupported(permission.table, permission.id))
                continue;

            this.unset(permission.table, permission.id);
        }
    }

    changed() {
        for (const [, permission] of Object.entries(this.getPermissions())) {
            if (!this.isSupported(permission.table, permission.id))
                continue;

            const [appIds] = this.safeLookUp(permission.table, permission.id);
            if (appIds !== null && this.appId in appIds)
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
            this[`_${permission.table}${permission.id}Supported`] = null;
            this.isSupported(permission.table, permission.id);
        });
    }

    set appId(appId) {
        this._appId = appId;
    }

    get appId() {
        return this._appId;
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
