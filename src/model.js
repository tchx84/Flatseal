/* model.js
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

const Gettext = imports.gettext;
const {GObject, Gio, GLib} = imports.gi;

const _ = Gettext.gettext;

const _group = 'Context';

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var DELAY = 500;


var FlatsealModel = GObject.registerClass({
    GTypeName: 'FlatsealModel',
    Properties: {
        'shared-network': GObject.ParamSpec.boolean(
            'shared-network',
            'shared-network',
            _('Access network'),
            _propFlags, false),
        'shared-ipc': GObject.ParamSpec.boolean(
            'shared-ipc',
            'shared-ipc',
            _('Access inter-process communications'),
            _propFlags, false),
        'sockets-x11': GObject.ParamSpec.boolean(
            'sockets-x11',
            'sockets-x11',
            _('Access X11 windowing system'),
            _propFlags, false),
        'sockets-fallback-x11': GObject.ParamSpec.boolean(
            'sockets-fallback-x11',
            'sockets-fallback-x11',
            _('Access X11 windowing system (as fallback)'),
            _propFlags, false),
        'sockets-wayland': GObject.ParamSpec.boolean(
            'sockets-wayland',
            'sockets-wayland',
            _('Access Wayland windowing system'),
            _propFlags, false),
        'sockets-pulseaudio': GObject.ParamSpec.boolean(
            'sockets-pulseaudio',
            'sockets-pulseaudio',
            _('Access PulseAudio sound server'),
            _propFlags, false),
        'sockets-system-bus': GObject.ParamSpec.boolean(
            'sockets-system-bus',
            'sockets-system-bus',
            _('Access D-Bus system bus (unrestricted)'),
            _propFlags, false),
        'sockets-session-bus': GObject.ParamSpec.boolean(
            'sockets-session-bus',
            'sockets-session-bus',
            _('Access D-Bus session bus (unrestricted)'),
            _propFlags, false),
        'sockets-ssh-auth': GObject.ParamSpec.boolean(
            'sockets-ssh-auth',
            'sockets-ssh-auth',
            _('Access Secure Shell agent'),
            _propFlags, false),
        'sockets-cups': GObject.ParamSpec.boolean(
            'sockets-cups',
            'sockets-cups',
            _('Access printing system'),
            _propFlags, false),
        'devices-dri': GObject.ParamSpec.boolean(
            'devices-dri',
            'devices-dri',
            _('Access GPU acceleration'),
            _propFlags, false),
        'devices-all': GObject.ParamSpec.boolean(
            'devices-all',
            'devices-all',
            _('Access all devices (e.g. webcam)'),
            _propFlags, false),
        'filesystems-host': GObject.ParamSpec.boolean(
            'filesystems-host',
            'filesystems-host',
            _('Access all system directories (unrestricted)'),
            _propFlags, false),
        'filesystems-home': GObject.ParamSpec.boolean(
            'filesystems-home',
            'filesystems-home',
            _('Access home directory (unrestricted)'),
            _propFlags, false),
        'features-bluetooth': GObject.ParamSpec.boolean(
            'features-bluetooth',
            'features-bluetooth',
            _('Access Bluetooth'),
            _propFlags, false),
        'features-devel': GObject.ParamSpec.boolean(
            'features-devel',
            'features-devel',
            _('Access other syscalls (e.g. ptrace)'),
            _propFlags, false),
        'features-multiarch': GObject.ParamSpec.boolean(
            'features-multiarch',
            'features-multiarch',
            _('Access programs from other architectures'),
            _propFlags, false),
        'filesystems-custom': GObject.ParamSpec.string(
            'filesystems-custom',
            'filesystems-custom',
            _('Access other directories'),
            _propFlags, ''),
    },
}, class FlatsealModel extends GObject.Object {
    _init() {
        super._init({});
        this._lastAppId = '';
        this._delayedHandlerId = 0;

        this._systemInstallationPath = GLib.build_filenamev([
            GLib.DIR_SEPARATOR_S, 'var', 'lib', 'flatpak',
        ]);
        this._userInstallationPath = GLib.build_filenamev([
            GLib.get_home_dir(), '.local', 'share', 'flatpak',
        ]);

        this._notifyHandlerId = this.connect('notify', this._delayedUpdate.bind(this));
    }

    _getSystemInstallationPath() {
        return this._systemInstallationPath;
    }

    _getUserInstallationPath() {
        return this._userInstallationPath;
    }

    _getUserApplicationsPath() {
        return GLib.build_filenamev([this._getUserInstallationPath(), 'app']);
    }

    _getSystemApplicationsPath() {
        return GLib.build_filenamev([this._getSystemInstallationPath(), 'app']);
    }

    _getOverridesPathForAppId(appId) {
        return GLib.build_filenamev([this._getUserInstallationPath(), 'overrides', appId]);
    }

    _getBundlePathForAppId(appId) {
        const path = GLib.build_filenamev([
            this._getUserApplicationsPath(), appId, 'current', 'active',
        ]);

        /* XXX Assume user installation takes precedence */
        if (GLib.access(path, 0) === 0)
            return path;

        return GLib.build_filenamev([
            this._getSystemApplicationsPath(), appId, 'current', 'active',
        ]);
    }

    _getMetadataPathForAppId(appId) {
        return GLib.build_filenamev([this._getBundlePathForAppId(appId), 'metadata']);
    }

    _getPermissionsForPath(path) {
        const list = [];

        if (GLib.access(path, 0) !== 0)
            return list;

        const keyFile = new GLib.KeyFile();
        keyFile.load_from_file(path, 0);

        if (!keyFile.has_group(_group))
            return list;

        const [keys] = keyFile.get_keys(_group);

        keys.forEach(key => {
            const values = keyFile.get_value(_group, key).split(';');
            values.forEach(value => {
                if (value.length === 0)
                    return;

                list.push(`${key}=${value}`);
            });
        });

        return list;
    }

    _getPermissionsForAppId(appId) {
        return this._getPermissionsForPath(this._getMetadataPathForAppId(appId));
    }

    _getOverridesForAppId(appId) {
        return this._getPermissionsForPath(this._getOverridesPathForAppId(appId));
    }

    _getCurrentPermissionsForAppId(appId) {
        const permissions = this._getPermissionsForAppId(appId);
        const overrides = new Set(this._getOverridesForAppId(appId));

        /* Remove permission if overriden with negation values */
        const current = new Set(permissions.filter(p => !overrides.has(p.replace('=', '=!'))));

        /* Add permission if a) not a negation b) doesn't exists */
        [...overrides].filter(p => p.indexOf('=!') === -1).forEach(p => current.add(p));

        return [...current];
    }

    _setOverridesForAppId(appId, overrides) {
        const keyFile = new GLib.KeyFile();

        overrides.forEach(override => {
            var [key, value] = override.split('=');

            try {
                var _value = keyFile.get_value(_group, key);
                value = `${_value}${value};`;
            } catch (err) {
                value = `${value};`;
            }
            keyFile.set_value(_group, key, value);
        });

        const [, length] = keyFile.to_data();
        const path = this._getOverridesPathForAppId(appId);

        if (length === 0)
            GLib.unlink(path);
        else
            keyFile.save_to_file(path);
    }

    _updatePropertiesForAppId(appId) {
        GObject.signal_handler_block(this, this._notifyHandlerId);

        const permissions = this._getCurrentPermissionsForAppId(appId);
        const props = GObject.Object.list_properties.call(this.constructor.$gtype);

        props.forEach(pspec => {
            var value;
            const property = pspec.get_name();
            const permission = property.replace(/-/, '=');
            const [key] = permission.split('=');
            const isText = typeof pspec.get_default_value() === 'string';

            if (isText) {
                value = permissions
                    .filter(p => p.startsWith(`${key}=`))
                    .map(p => p.split('=')[1])
                    .filter(p => ['home', 'host'].indexOf(p) === -1)
                    .join(';');
            } else {
                value = permissions.indexOf(permission) !== -1;
            }

            this[property.replace(/-/g, '_')] = value;
            this.notify(property);
        });

        GObject.signal_handler_unblock(this, this._notifyHandlerId);
    }

    _delayedUpdate() {
        if (this._delayedHandlerId !== 0)
            GLib.Source.remove(this._delayedHandlerId);

        this._delayedHandlerId = GLib.timeout_add(
            GLib.PRIORITY_HIGH, DELAY, this._findChangesAndUpdate.bind(this));
    }

    _findChangesAndUpdate() {
        const selected = new Set();
        const existing = new Set(this._getPermissionsForAppId(this._lastAppId));
        const props = GObject.Object.list_properties.call(this.constructor.$gtype);

        props.forEach(pspec => {
            const property = pspec.get_name();
            const attribute = property.replace(/-/g, '_');
            const permission = property.replace(/-/, '=');

            if (typeof pspec.get_default_value() === 'boolean' && this[attribute]) {
                selected.add(permission);
            } else if (typeof pspec.get_default_value() === 'string') {
                const [real_permission] = permission.split('=');
                var values = this[attribute].split(';');

                values.forEach(value => {
                    if (value.length === 0)
                        return;

                    selected.add(`${real_permission}=${value}`);
                });
            }
        });

        /* Add overrides that didn't exist in the original permissions */
        const added = new Set([...selected].filter(p => !existing.has(p)));

        /* Don't mess with permissions we don't support */
        const supportedState = new Set(this.listPermissions()
            .filter(p => p.type !== 'text')
            .map(p => p.permission));
        const supportedText = new Set(this.listPermissions()
            .filter(p => p.type === 'text')
            .map(p => p.permission.split('=')[0]));

        /* Add overrides that explicitly negate original permissions */
        const removed = new Set([...existing]
            .filter(p => supportedState.has(p) || supportedText.has(p.split('=')[0]))
            .filter(p => !selected.has(p))
            .map(p => p.replace('=', '=!')));

        this._setOverridesForAppId(this._lastAppId, [...added, ...removed]);
        this._delayedHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    _listApplicationsForPath(path) {
        const list = [];

        if (GLib.access(path, 0) !== 0)
            return list;

        const directory = Gio.File.new_for_path(path);
        const enumerator = directory.enumerate_children('*', Gio.FileQueryInfoFlags.NONE, null);
        var info = enumerator.next_file(null);

        while (info !== null) {
            const file = enumerator.get_child(info);
            const appId = GLib.path_get_basename(file.get_path());
            const activePath = GLib.build_filenamev([file.get_path(), 'current', 'active']);

            if (GLib.access(activePath, 0) === 0)
                list.push(appId);

            info = enumerator.next_file(null);
        }

        return list;
    }

    listApplications() {
        const userApplications = this._listApplicationsForPath(
            this._getUserApplicationsPath());
        const systemApplications = this._listApplicationsForPath(
            this._getSystemApplicationsPath());
        const union = new Set([...userApplications, ...systemApplications]);
        const list = [...union];

        list.sort();

        return list;
    }

    listPermissions() {
        const list = [];
        const props = GObject.Object.list_properties.call(this.constructor.$gtype);

        props.forEach(pspec => {
            const property = pspec.get_name();
            const entry = {};
            const isText = typeof pspec.get_default_value() === 'string';

            entry['property'] = property;
            entry['description'] = pspec.get_blurb();
            entry['value'] = this[pspec.get_name().replace(/-/g, '_')];
            entry['type'] = isText ? 'text' : 'state';
            entry['permission'] = property.replace(/-/, '=');

            list.push(entry);
        });

        return list;
    }

    setAppId(appId) {
        this._lastAppId = appId;
        this._updatePropertiesForAppId(appId);
    }

    setSystemInstallationPath(path) {
        this._systemInstallationPath = path;
    }

    setUserInstallationPath(path) {
        this._userInstallationPath = path;
    }

    resetPermissionsForAppId(appId) {
        const path = this._getOverridesPathForAppId(appId);
        GLib.unlink(path);
        this._updatePropertiesForAppId(appId);
    }

    getIconThemePathForAppId(appId) {
        return GLib.build_filenamev([
            this._getBundlePathForAppId(appId), 'files', 'share', 'icons',
        ]);
    }
});
