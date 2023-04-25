/* exported FlatpakMonitorModel */

/* monitor.js
 *
 * Copyright 2023 Martin Abente Lahaye
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

const {GObject, Gio, GLib} = imports.gi;

const {applications} = imports.models;

const SIGNAL_DELAY = 500;
const TARGET_EVENTS = [
    Gio.FileMonitorEvent.CHANGES_DONE_HINT,
    Gio.FileMonitorEvent.DELETED,
];

var FlatpakMonitorModel = GObject.registerClass({
    GTypeName: 'FlatpakMonitorModel',
    Signals: {
        changed: {},
    },
}, class FlatpakMonitorModel extends GObject.Object {
    _init() {
        super._init({});
        this._setup();
    }

    _setup() {
        this._monitors = [];
        this._changedDelayHandlerId = 0;
        const model = applications.getDefault();

        model._getInstallationsPaths().forEach(path => {
            const file = Gio.File.new_for_path(GLib.build_filenamev([path, 'app']));

            const monitor = file.monitor_directory(Gio.FileMonitorFlags.NONE, null);
            monitor.connect('changed', this._changedDelayed.bind(this));

            this._monitors.push(monitor);
        });
    }

    _changedDelayed(monitor, file, other_file, event) {
        if (!TARGET_EVENTS.includes(event))
            return;

        if (this._changedDelayHandlerId !== 0)
            GLib.Source.remove(this._changedDelayHandlerId);

        this._changedDelayHandlerId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT, SIGNAL_DELAY, this._emitChanged.bind(this));
    }

    _emitChanged() {
        this.emit('changed');
        this._changedDelayHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    shutdown() {
        this._monitors.forEach(monitor => {
            monitor.cancel();
        });
    }
});
