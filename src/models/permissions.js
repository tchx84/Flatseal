/* permissions.js
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

const {GObject, GLib} = imports.gi;

const {FlatpakInfoModel} = imports.models.info;
const {FlatpakApplicationsModel} = imports.models.applications;
const {FlatpakUnsupportedModel} = imports.models.unsupported;
const {FlatpakDevicesModel} = imports.models.devices;
const {FlatpakSharedModel} = imports.models.shared;
const {FlatpakSocketsModel} = imports.models.sockets;
const {FlatpakFeaturesModel} = imports.models.features;
const {FlatpakFilesystemsModel} = imports.models.filesystems;
const {FlatpakFilesystemsOtherModel} = imports.models.filesystemsOther;
const {FlatpakVariablesModel} = imports.models.variables;
const {FlatpakSessionBusModel} = imports.models.sessionBus;
const {persistent} = imports.models;

const FLAGS = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

const MODELS = {
    shared: new FlatpakSharedModel(),
    sockets: new FlatpakSocketsModel(),
    devices: new FlatpakDevicesModel(),
    features: new FlatpakFeaturesModel(),
    filesystems: new FlatpakFilesystemsModel(),
    'filesystems-other': new FlatpakFilesystemsOtherModel(),
    persistent: persistent.getDefault(),
    variables: new FlatpakVariablesModel(),
    session: new FlatpakSessionBusModel(),
    unsupported: new FlatpakUnsupportedModel(),
};

const PERMISSIONS = {
    'shared-network': MODELS['shared'],
    'shared-ipc': MODELS['shared'],
    'sockets-x11': MODELS['sockets'],
    'sockets-wayland': MODELS['sockets'],
    'sockets-fallback-x11': MODELS['sockets'],
    'sockets-pulseaudio': MODELS['sockets'],
    'sockets-session-bus': MODELS['sockets'],
    'sockets-system-bus': MODELS['sockets'],
    'sockets-ssh-auth': MODELS['sockets'],
    'sockets-pcsc': MODELS['sockets'],
    'sockets-cups': MODELS['sockets'],
    'devices-dri': MODELS['devices'],
    'devices-kvm': MODELS['devices'],
    'devices-shm': MODELS['devices'],
    'devices-all': MODELS['devices'],
    'features-devel': MODELS['features'],
    'features-multiarch': MODELS['features'],
    'features-bluetooth': MODELS['features'],
    'features-canbus': MODELS['features'],
    'filesystems-host': MODELS['filesystems'],
    'filesystems-host-os': MODELS['filesystems'],
    'filesystems-host-etc': MODELS['filesystems'],
    'filesystems-home': MODELS['filesystems'],
    'filesystems-other': MODELS['filesystems-other'],
    'session-talk': MODELS['session'],
    'session-own': MODELS['session'],
    persistent: MODELS['persistent'],
    variables: MODELS['variables'],
};

function generate() {
    const properties = {};

    Object.entries(PERMISSIONS).forEach(([property, model]) => {
        const type = model.constructor.getType() === 'state' ? 'boolean' : 'string';
        const value = model.constructor.getDefault();
        properties[property] = GObject.ParamSpec[type](
            property, property, property, FLAGS, value);
    });

    return properties;
}

var DELAY = 500;

var FlatpakPermissionsModel = GObject.registerClass({
    GTypeName: 'FlatpakPermissionsModel',
    Properties: generate(),
    Signals: {
        changed: {
            param_types: [GObject.TYPE_BOOLEAN, GObject.TYPE_BOOLEAN],
        },
    },
}, class FlatpakPermissionsModel extends GObject.Object {
    _init() {
        super._init({});
        this._appId = '';
        this._delayedHandlerId = 0;

        this._info = new FlatpakInfoModel();
        this._applications = new FlatpakApplicationsModel();

        this._notifyHandlerId = this.connect('notify', this._delayedUpdate.bind(this));
    }

    _getOverridesPath() {
        return GLib.build_filenamev([this._applications.userPath, 'overrides', this._appId]);
    }

    static _loadPermissionsForPath(path, overrides) {
        if (GLib.access(path, 0) !== 0)
            return;

        const keyFile = new GLib.KeyFile();
        keyFile.load_from_file(path, 0);

        const [groups] = keyFile.get_groups();

        groups.forEach(group => {
            const [keys] = keyFile.get_keys(group);

            keys.forEach(key => {
                const values = keyFile.get_value(group, key).split(';');
                values.forEach(value => {
                    var permission = value.replace('!', '');
                    var property = `${key}-${permission}`;

                    /* Handle custom filesystem permissions */
                    const target = 'filesystems';
                    if (key === target && !(permission in MODELS[target].getPermissions()))
                        property = 'filesystems-other';

                    /* Handle persistent permissions */
                    if (key === 'persistent')
                        property = 'persistent';

                    var model = PERMISSIONS[property];

                    /* Handle environment variables */
                    if (group === MODELS.variables.constructor.getGroup())
                        model = MODELS.variables;

                    /* Handle session bus */
                    if (group === MODELS.session.constructor.getGroup())
                        model = MODELS.session;

                    if (typeof model === 'undefined' && overrides)
                        model = MODELS.unsupported;

                    /* Non-permission related metadata */
                    if (typeof model === 'undefined')
                        return;

                    model.loadFromKeyFile(group, key, value, overrides);
                });
            });
        });
    }

    _loadPermissions() {
        return this.constructor._loadPermissionsForPath(
            this._applications.getMetadataPathForAppId(this._appId), false);
    }

    _loadOverrides() {
        return this.constructor._loadPermissionsForPath(this._getOverridesPath(), true);
    }

    _checkIfChanged() {
        const exists = GLib.access(this._getOverridesPath(), 0) === 0;
        const unsupported = !MODELS['unsupported'].isEmpty();
        this.emit('changed', exists, unsupported);
    }

    _saveOverrides() {
        const keyFile = new GLib.KeyFile();

        for (const [, model] of Object.entries(MODELS))
            model.saveToKeyFile(keyFile);


        const [, length] = keyFile.to_data();
        const path = this._getOverridesPath();

        if (length === 0)
            GLib.unlink(path);
        else
            keyFile.save_to_file(path);

        this._checkIfChanged();
    }

    _updateProperties() {
        GObject.signal_handler_block(this, this._notifyHandlerId);

        for (const [, model] of Object.entries(MODELS))
            model.updateProxyProperty(this);


        this._checkIfChanged();

        GObject.signal_handler_unblock(this, this._notifyHandlerId);
    }

    _delayedUpdate() {
        if (this._delayedHandlerId !== 0)
            GLib.Source.remove(this._delayedHandlerId);

        this._delayedHandlerId = GLib.timeout_add(
            GLib.PRIORITY_HIGH, DELAY, this._updateModels.bind(this));
    }

    _processPendingUpdates() {
        if (this._delayedHandlerId === 0)
            return;

        GLib.Source.remove(this._delayedHandlerId);
        this._updateModels();
    }

    _updateModels() {
        Object.entries(PERMISSIONS).forEach(([property, model]) => {
            model.updateFromProxyProperty(
                property,
                this[property.replace(/-/g, '_')]);
        });

        this._saveOverrides();

        this._delayedHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    _setup() {
        for (const [, model] of Object.entries(MODELS))
            model.reset();

        this._loadPermissions();
        this._loadOverrides();
        this._updateProperties();
    }

    getAll() {
        const list = [];

        Object.entries(PERMISSIONS).forEach(([property, model]) => {
            const entry = {};
            const key = property.replace(/\w+-/, '');
            const permission = model.getPermissions()[key];

            entry['property'] = property;
            entry['description'] = permission.description;
            entry['value'] = this[property.replace(/-/g, '_')];
            entry['type'] = model.constructor.getType();
            entry['permission'] = permission.example;
            entry['supported'] = this._info.supports(permission.version);
            entry['group'] = model.constructor.getKey();
            entry['groupDescription'] = model.constructor.getDescription();

            list.push(entry);
        });

        return list;
    }

    reset() {
        const path = this._getOverridesPath();
        GLib.unlink(path);
        this._setup();
    }

    shutdown() {
        this._processPendingUpdates();
    }

    set appId(appId) {
        this._processPendingUpdates();
        this._appId = appId;
        this._setup();
    }

    get appId() {
        return this._appId;
    }

    /* testing */

    static getGroupForProperty(property) {
        const [group] = property.split('-');
        return MODELS[group].constructor.getGroup();
    }

    set info(info) {
        this._info = info;
    }

    set applications(applications) {
        this._applications = applications;
    }
});
