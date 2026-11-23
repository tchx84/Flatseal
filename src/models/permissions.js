/* exported FlatpakPermissionsModel getDefault */

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

const {Gio, GObject, GLib} = imports.gi;

const {FlatpakUnsupportedModel} = imports.models.unsupported;
const {FlatpakDevicesModel} = imports.models.devices;
const {FlatpakSharedModel} = imports.models.shared;
const {FlatpakSocketsModel} = imports.models.sockets;
const {FlatpakFeaturesModel} = imports.models.features;
const {FlatpakFilesystemsOtherModel} = imports.models.filesystemsOther;
const {FlatpakVariablesModel} = imports.models.variables;
const {FlatpakSessionBusModel} = imports.models.sessionBus;
const {FlatpakSystemBusModel} = imports.models.systemBus;
const {FlatpakUsbModel} = imports.models.usb;
const {getPermissionClass} = imports.models.permissionValue;
const {isGlobalOverride} = imports.models.globalModel;
const {applications, filesystems, persistent, portals} = imports.models;

const FLAGS = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY;

const MODELS = {
    shared: new FlatpakSharedModel(),
    sockets: new FlatpakSocketsModel(),
    devices: new FlatpakDevicesModel(),
    features: new FlatpakFeaturesModel(),
    filesystems: filesystems.getDefault(),
    filesystemsOther: new FlatpakFilesystemsOtherModel(),
    persistent: persistent.getDefault(),
    variables: new FlatpakVariablesModel(),
    system: new FlatpakSystemBusModel(),
    session: new FlatpakSessionBusModel(),
    usb: new FlatpakUsbModel(),
    portals: portals.getDefault(),
    unsupported: new FlatpakUnsupportedModel(),
};

/* Models that support conditional permissions */
const CONDITIONAL_MODELS = [
    MODELS.shared,
    MODELS.sockets,
    MODELS.devices,
    MODELS.features,
];

function generate_index() {
    const index = {};

    Object.values(MODELS).forEach(model => {
        const group = model.constructor.getGroup();
        const key = model.constructor.getKey();
        const options = model.getOptions();

        if (key === null) {
            index[`${group}`] = model;
        } else if (options === null) {
            index[`${group}_${key}`] = model;
        } else {
            options.forEach(option => {
                index[`${group}_${key}_${option}`] = model;
            });
        }
    });

    return index;
}

const INDEX = generate_index();

/* Pick a class for each permission based on the type of value it
 * holds and whether it supports conditionals. */
function generate_classes() {
    const classes = {};

    Object.values(MODELS).forEach(model => {
        Object.entries(model.getPermissions()).forEach(([property]) => {
            const value = model.constructor.getDefault();
            const permissionClass = getPermissionClass(value, CONDITIONAL_MODELS.includes(model));

            if (permissionClass === null) {
                logError(`No support for ${property}:${typeof value}`);
                return;
            }

            classes[property] = permissionClass;
        });
    });

    return classes;
}

const CLASSES = generate_classes();

function generate() {
    const properties = {};

    Object.entries(CLASSES).forEach(([property, permissionClass]) => {
        properties[property] = GObject.ParamSpec.object(
            property, property, property, FLAGS, permissionClass.$gtype);
    });

    return properties;
}

/* Creates one permission object for each permission property. */
function generatePermissions() {
    const permissions = {};

    Object.entries(CLASSES).forEach(([property, permissionClass]) => {
        permissions[property.replace(/-/g, '_')] = new permissionClass();
    });

    return permissions;
}

var DELAY = 500;
var CONDITIONAL_PREFIX = 'if:';

var FlatpakPermissionsModel = GObject.registerClass({
    GTypeName: 'FlatpakPermissionsModel',
    Properties: generate(),
    Signals: {
        changed: {
            param_types: [GObject.TYPE_BOOLEAN, GObject.TYPE_BOOLEAN],
        },
        reset: {},
        failed: {},
    },
}, class FlatpakPermissionsModel extends GObject.Object {
    _init() {
        super._init(generatePermissions());
        this._appId = '';
        this._delayedHandlerId = 0;
        this._monitors = [];
        this._monitorsDelayedHandlerId = 0;
        this._changesByUser = 0;
        this._applications = applications.getDefault();

        /* The user can only change the value, so that's all we need to save. */
        this._valueHandlerIds = this._getAllPermissions().map(permission => {
            const handlerId = permission.connect('notify::value', this._delayedUpdate.bind(this));
            return [permission, handlerId];
        });
        this._ensureBaseOverridesPath();
    }

    _ensureBaseOverridesPath() {
        const path = this._getBaseOverridesPath();
        if (GLib.access(path, 0) !== 0)
            GLib.mkdir_with_parents(path, 0o0755);
    }

    _getBaseOverridesPath() {
        return GLib.build_filenamev([this._applications.userPath, 'overrides']);
    }

    _getMetadataPath() {
        return this._applications.getMetadataPathForAppId(this._appId);
    }

    _getGlobalOverridesPath() {
        return GLib.build_filenamev([this._getBaseOverridesPath(), 'global']);
    }

    _getOverridesPath() {
        return GLib.build_filenamev([this._getBaseOverridesPath(), this._appId]);
    }

    _loadPermissionsForPath(path, overrides, global) {
        if (GLib.access(path, 0) !== 0)
            return;

        const keyFile = new GLib.KeyFile();

        try {
            keyFile.load_from_file(path, 0);
        } catch (err) {
            logError(err, `Could not load ${path}`);
            this.emit('failed');
            return;
        }

        const [groups] = keyFile.get_groups();

        groups.forEach(group => {
            const [keys] = keyFile.get_keys(group);

            keys.forEach(key => {
                const value = keyFile.get_value(group, key);

                /* First for models that process the value as a whole */
                let model = this.constructor._find(`${group}`);

                if (model !== null) {
                    model.loadFromKeyFile(group, key, value, overrides, global);
                    return;
                }

                /* Then check models that process the value as individually */
                const values = value
                    .replace(/;+$/, '')
                    .split(';');

                values.forEach(option => {
                    let isConditional = false;
                    let bareOption = option;

                    if (option.startsWith(CONDITIONAL_PREFIX)) {
                        const parts = option.slice(CONDITIONAL_PREFIX.length).split(':');

                        /* A valid conditional has both an option and a
                         * condition after "if:". Ignore incomplete
                         * entries instead of treating them as
                         * conditionals. */
                        if (parts.length >= 2) {
                            isConditional = true;
                            [bareOption] = parts;
                        }
                    }

                    /* Conditionals from overrides (per-app or global)
                     * are dropped. They can't be written back without
                     * risking a change in their meaning, so they are
                     * neither loaded nor displayed. */
                    if (isConditional && overrides)
                        return;

                    model = this.constructor._find(`${group}_${key}_${bareOption.replace('!', '')}`);

                    if (model === null)
                        model = this.constructor._find(`${group}_${key}`);

                    if (model === null && overrides && !global)
                        model = MODELS.unsupported;

                    /* Only the four models in CONDITIONAL_MODELS
                     * support conditionals. A conditional for any
                     * other permission is dropped instead of being
                     * loaded as a plain, unconditional permission. */
                    if (isConditional && !CONDITIONAL_MODELS.includes(model))
                        return;

                    if (model !== null) {
                        model.loadFromKeyFile(group, key, bareOption, overrides, global);

                        if (isConditional)
                            model.markConditional(bareOption, option);
                    }
                });
            });
        });
    }

    _loadPermissions() {
        if (isGlobalOverride(this._appId))
            return;

        this._loadPermissionsForPath(this._getMetadataPath(), false, false);
    }

    _loadGlobalOverrides() {
        if (isGlobalOverride(this._appId))
            return;

        this._loadPermissionsForPath(
            this._getGlobalOverridesPath(), true, true);
    }

    _loadOverrides() {
        this._loadPermissionsForPath(
            this._getOverridesPath(), true, false);
    }

    _checkIfChanged() {
        const overrideExists = GLib.access(this._getOverridesPath(), 0) === 0;
        const portalsChanged = MODELS.portals.changed();
        const changed = overrideExists || portalsChanged;
        const unsupported = !MODELS.unsupported.isEmpty();
        this.emit('changed', changed, unsupported);
    }

    _saveOverrides() {
        const keyFile = new GLib.KeyFile();

        Object.values(MODELS).forEach(model => model.saveToKeyFile(keyFile));

        const [, length] = keyFile.to_data();
        const path = this._getOverridesPath();

        if (length === 0)
            GLib.unlink(path);
        else
            keyFile.save_to_file(path);

        this._checkIfChanged();
    }

    _getAllPermissions() {
        const permissions = [];

        Object.values(MODELS).forEach(model => {
            Object.keys(model.getPermissions()).forEach(property => {
                permissions.push(this.getPermission(property));
            });
        });

        return permissions;
    }

    /* Values loaded from the files shouldn't be written back. */
    _updateProperties() {
        this._valueHandlerIds.forEach(([permission, handlerId]) => {
            GObject.signal_handler_block(permission, handlerId);
        });

        Object.values(MODELS).forEach(model => model.updateProxyProperty(this));

        this._checkIfChanged();

        this._valueHandlerIds.forEach(([permission, handlerId]) => {
            GObject.signal_handler_unblock(permission, handlerId);
        });
    }

    /* Status and conditional aren't user-editable, so there's
     * nothing to save here. */
    _updateStatusProperties() {
        Object.values(MODELS).forEach(model => model.updateStatusProperty(this));
        CONDITIONAL_MODELS.forEach(model => model.updateConditionalProperty(this));
    }

    _delayedUpdate() {
        if (this._delayedHandlerId !== 0)
            GLib.Source.remove(this._delayedHandlerId);

        this._delayedHandlerId = GLib.timeout_add(
            GLib.PRIORITY_HIGH, DELAY, this._updateModels.bind(this));
    }

    _processPendingUpdates() {
        if (this._appId === '')
            return;

        if (this._delayedHandlerId === 0)
            return;

        GLib.Source.remove(this._delayedHandlerId);
        this._updateModels();
    }

    _updateModels() {
        Object.values(MODELS).forEach(model => {
            Object.entries(model.getPermissions()).forEach(([property]) => {
                model.updateFromProxyProperty(
                    property,
                    this.getPermission(property).value);
            });
        });

        this._changesByUser += 1;
        this._saveOverrides();
        this._updateStatusProperties();

        this._delayedHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    _setup() {
        if (this._appId === '')
            return;

        Object.values(MODELS).forEach(model => model.reset());
        this._loadPermissions();
        this._loadGlobalOverrides();
        this._loadOverrides();
        this._updateProperties();
        this._updateStatusProperties();
    }

    _setupMonitors() {
        if (this._appId === '')
            return;

        let paths = [this._getGlobalOverridesPath()];

        if (!isGlobalOverride(this._appId))
            paths = [...paths, this._getMetadataPath(), this._getOverridesPath()];

        paths.forEach(path => {
            const file = Gio.File.new_for_path(path);

            try {
                const monitor = file.monitor_file(Gio.FileMonitorFlags.WATCH_MOVES, null);
                monitor.connect('changed', this._delayMonitorsChanged.bind(this));
                this._monitors.push(monitor);
            } catch (err) {
                logError(err);
            }
        });
    }

    _cancelMonitors() {
        if (this._monitorsDelayedHandlerId !== 0)
            GLib.Source.remove(this._monitorsDelayedHandlerId);

        this._monitors.forEach(monitor => {
            monitor.cancel();
        });

        this._monitors = [];
        this._monitorsDelayedHandlerId = 0;
        this._changesByUser = 0;
    }

    _delayMonitorsChanged() {
        if (this._monitorsDelayedHandlerId !== 0)
            GLib.Source.remove(this._monitorsDelayedHandlerId);

        this._monitorsDelayedHandlerId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT, DELAY, this._updateFromMonitors.bind(this));
    }

    _updateFromMonitors() {
        if (this._changesByUser === 0)
            this._setup();
        else
            this._changesByUser -= 1;

        this._monitorsDelayedHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    getAll() {
        const list = [];

        Object.values(MODELS).forEach(model => {
            Object.entries(model.getPermissions()).forEach(([property, permission]) => {
                const entry = {};

                entry['property'] = property;
                entry['description'] = permission.description;
                entry['value'] = this.getPermission(property).value;
                entry['type'] = model.constructor.getType();
                entry['permission'] = permission.example;
                entry['supported'] = permission.supported;
                entry['portalTable'] = permission.table;
                entry['portalId'] = permission.id;
                entry['groupTitle'] = model.constructor.getTitle();
                entry['groupStyle'] = model.constructor.getStyle();
                entry['groupDescription'] = model.constructor.getDescription();
                entry['object'] = this.getPermission(property);
                entry['conditional'] = CONDITIONAL_MODELS.includes(model);
                entry['serializeFunc'] = model.constructor.serialize;
                entry['deserializeFunc'] = model.constructor.deserialize;

                list.push(entry);
            });
        });

        return list;
    }

    undo() {
        this._changesByUser += 1;
        const path = this._getOverridesPath();
        this._backup.save_to_file(path);
        MODELS.portals.restore();
        this._setup();
    }

    backup() {
        this._backup = new GLib.KeyFile();
        Object.values(MODELS).forEach(model => model.saveToKeyFile(this._backup));
        MODELS.portals.backup();
    }

    reset() {
        this._changesByUser += 1;
        this.backup();
        const path = this._getOverridesPath();
        GLib.unlink(path);
        MODELS.portals.forget();
        this._setup();
        this.emit('reset');
    }

    shutdown() {
        this._processPendingUpdates();
        this._cancelMonitors();
    }

    reload() {
        this.shutdown();
        this._setup();
        this._setupMonitors();
    }

    set appId(appId) {
        this._backup = null;
        this.shutdown();
        this._appId = appId;
        MODELS.portals.appId = appId;
        this._setup();
        this._setupMonitors();
    }

    get appId() {
        return this._appId;
    }

    getPermission(property) {
        return this[property.replace(/-/g, '_')];
    }

    static _find(key) {
        return Object.hasOwn(INDEX, key) ? INDEX[key] : null;
    }

    /* testing */

    static getGroupForProperty(property) {
        const [group] = property.split('-');
        return MODELS[group].constructor.getGroup();
    }
});


var getDefault = (function() {
    let instance;
    return function() {
        if (typeof instance === 'undefined')
            instance = new FlatpakPermissionsModel();
        return instance;
    };
}());
