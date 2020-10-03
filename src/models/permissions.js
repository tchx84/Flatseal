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
const {FlatpakSystemBusModel} = imports.models.systemBus;
const {persistent} = imports.models;

const FLAGS = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

const MODELS = {
    shared: new FlatpakSharedModel(),
    sockets: new FlatpakSocketsModel(),
    devices: new FlatpakDevicesModel(),
    features: new FlatpakFeaturesModel(),
    filesystems: new FlatpakFilesystemsModel(),
    filesystemsOther: new FlatpakFilesystemsOtherModel(),
    persistent: persistent.getDefault(),
    variables: new FlatpakVariablesModel(),
    system: new FlatpakSystemBusModel(),
    session: new FlatpakSessionBusModel(),
};

const MODEL_UNSUPPORTED = new FlatpakUnsupportedModel();

function generate() {
    const properties = {};

    Object.entries(MODELS).forEach(([, model]) => {
        Object.entries(model.getPermissions()).forEach(([property]) => {
            const model_type = model.constructor.getType();
            const type = model_type === 'state' ? 'boolean' : 'string';
            const value = model.constructor.getDefault();
            properties[property] = GObject.ParamSpec[type](
                property, property, property, FLAGS, value);
        });
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
        reset: {},
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
                    var model = null;
                    const option = value.replace('!', '');

                    for (const [, _model] of Object.entries(MODELS)) {
                        if (_model.constructor.getGroup() !== group)
                            continue;

                        const _key = _model.constructor.getKey();
                        if (_key !== null && _key !== key)
                            continue;

                        const options = _model.getOptions();
                        if (options !== null && options.includes(option)) {
                            model = _model;
                            break;
                        } else if (options === null) {
                            model = _model;
                            break;
                        } else {

                            /* unsupported */
                        }
                    }

                    if (model === null && overrides)
                        model = MODEL_UNSUPPORTED;

                    if (model !== null)
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
        const unsupported = !MODEL_UNSUPPORTED.isEmpty();
        this.emit('changed', exists, unsupported);
    }

    _saveOverrides() {
        const keyFile = new GLib.KeyFile();

        for (const [, model] of Object.entries(MODELS))
            model.saveToKeyFile(keyFile);

        MODEL_UNSUPPORTED.saveToKeyFile(keyFile);

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

        MODEL_UNSUPPORTED.updateProxyProperty(this);

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
        Object.entries(MODELS).forEach(([, model]) => {
            Object.entries(model.getPermissions()).forEach(([property]) => {
                model.updateFromProxyProperty(
                    property,
                    this[property.replace(/-/g, '_')]);
            });
        });

        this._saveOverrides();

        this._delayedHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    _setup() {
        for (const [, model] of Object.entries(MODELS))
            model.reset();

        MODEL_UNSUPPORTED.reset();

        this._loadPermissions();
        this._loadOverrides();
        this._updateProperties();
    }

    getAll() {
        const list = [];

        Object.entries(MODELS).forEach(([, model]) => {
            Object.entries(model.getPermissions()).forEach(([property, permission]) => {
                const entry = {};

                entry['property'] = property;
                entry['description'] = permission.description;
                entry['value'] = this[property.replace(/-/g, '_')];
                entry['type'] = model.constructor.getType();
                entry['permission'] = permission.example;
                entry['supported'] = this._info.supports(permission.version);
                entry['groupTitle'] = model.constructor.getTitle();
                entry['groupStyle'] = model.constructor.getStyle();
                entry['groupDescription'] = model.constructor.getDescription();

                list.push(entry);
            });
        });

        return list;
    }

    undo() {
        const path = this._getOverridesPath();
        this._backup.save_to_file(path);
        this._setup();
    }

    backup() {
        this._backup = new GLib.KeyFile();

        for (const [, model] of Object.entries(MODELS))
            model.saveToKeyFile(this._backup);

        MODEL_UNSUPPORTED.saveToKeyFile(this._backup);
    }

    reset() {
        this.backup();
        const path = this._getOverridesPath();
        GLib.unlink(path);
        this._setup();
        this.emit('reset');
    }

    shutdown() {
        this._processPendingUpdates();
    }

    set appId(appId) {
        this._backup = null;
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
