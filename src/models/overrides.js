/* exported FlatpakOverridesModel getDefault */

/* overrides.js
 *
 * Copyright 2026 Malika Odeny Asman
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

const {GObject, GLib, Gio} = imports.gi;

const {permissions} = imports.models;

const DELAY = 500;


var FlatpakOverridesModel = GObject.registerClass({
    GTypeName: 'FlatpakOverridesModel',
    Signals: {
        changed: {},
    },
}, class FlatpakOverridesModel extends GObject.Object {
    _init() {
        super._init({});
        this._setup();
    }

    _setup() {
        this._permissions = permissions.getDefault();
        this._monitor = null;
        this._changedDelayHandlerId = 0;

        this._appIds = this._getApplications();

        const path = this._permissions._getBaseOverridesPath();
        const file = Gio.File.new_for_path(path);

        try {
            this._monitor = file.monitor_directory(Gio.FileMonitorFlags.NONE, null);
            this._monitor.connect('changed', this._changedDelayed.bind(this));
        } catch (err) {
            logError(err);
        }
    }

    _getApplications() {
        const appIds = [];
        const path = this._permissions._getBaseOverridesPath();

        if (GLib.access(path, 0) !== 0)
            return appIds;

        const directory = Gio.File.new_for_path(path);
        const enumerator = directory.enumerate_children('*', Gio.FileQueryInfoFlags.NONE, null);
        let fileInfo = enumerator.next_file(null);

        while (fileInfo !== null) {
            appIds.push(fileInfo.get_name());
            fileInfo = enumerator.next_file(null);
        }
        return appIds;
    }

    _changedDelayed() {
        if (this._changedDelayHandlerId !== 0)
            GLib.Source.remove(this._changedDelayHandlerId);

        this._changedDelayHandlerId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT, DELAY, this._emitChanged.bind(this));
    }

    _emitChanged() {
        this._appIds = this._getApplications();
        this.emit('changed');
        this._changedDelayHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    hasOverrides(appId) {
        return this._appIds.includes(appId);
    }

    shutdown() {
        if (this._changedDelayHandlerId !== 0)
            GLib.Source.remove(this._changedDelayHandlerId);
        this._changedDelayHandlerId = 0;

        if (this._monitor !== null)
            this._monitor.cancel();
        this._monitor = null;
    }

    reload() {
        this.shutdown();
        this._setup();
    }
});


var getDefault = (function() {
    let instance;
    return function() {
        if (typeof instance === 'undefined')
            instance = new FlatpakOverridesModel();
        return instance;
    };
}());
