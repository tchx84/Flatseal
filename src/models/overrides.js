/* overrides.js
 *
 * Copyright 2026 Kafilat Adeleke
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

const {GLib, Gio, GObject} = imports.gi;

const SIGNAL_DELAY = 500;

var FlatpakOverridesModel = GObject.registerClass({
    GTypeName: 'FlatpakOverridesModel',
    Signals: {
        'changed': {},
    },
}, class FlatpakOverridesModel extends GObject.Object {
    _init(paths) {
        super._init();
        this._overriddenApps = new Set();
        this._monitors = [];
        this._changedDelayHandlerId = 0;
        this._setup(paths);
    }

    _setup(paths) {
        paths.forEach(path => {
            const directory = Gio.File.new_for_path(path);

            /* Scan existing files */
            if (GLib.access(path, 0) === 0) {
                try {
                    const enumerator = directory.enumerate_children(
                        'standard::name',
                        Gio.FileQueryInfoFlags.NONE,
                        null
                    );
                    let fileInfo = enumerator.next_file(null);
                    while (fileInfo !== null) {
                        this._overriddenApps.add(fileInfo.get_name());
                        fileInfo = enumerator.next_file(null);
                    }
                } catch (e) {
                    /* Directory may be empty or inaccessible */
                }
            }

            /* Watch for future changes */
            try {
                const monitor = directory.monitor_directory(
                    Gio.FileMonitorFlags.NONE,
                    null
                );
                monitor.connect('changed', this._onDirectoryChanged.bind(this));
                this._monitors.push(monitor);
            } catch (e) {
                /* Directory doesn't exist yet, skip monitoring */
            }
        });
    }

    _onDirectoryChanged(monitor, file, _otherFile, eventType) {
        const name = file.get_basename();

        if (eventType === Gio.FileMonitorEvent.CREATED ||
            eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
            this._overriddenApps.add(name);
            this._emitChangedDelayed();
        } else if (eventType === Gio.FileMonitorEvent.DELETED) {
            this._overriddenApps.delete(name);
            this._emitChangedDelayed();
        }
    }

    _emitChangedDelayed() {
        if (this._changedDelayHandlerId !== 0)
            GLib.Source.remove(this._changedDelayHandlerId);

        this._changedDelayHandlerId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT, SIGNAL_DELAY, () => {
                this.emit('changed');
                this._changedDelayHandlerId = 0;
                return GLib.SOURCE_REMOVE;
            });
    }

    isOverridden(appId) {
        return this._overriddenApps.has(appId);
    }

    shutdown() {
        if (this._changedDelayHandlerId !== 0)
            GLib.Source.remove(this._changedDelayHandlerId);
        this._changedDelayHandlerId = 0;

        this._monitors.forEach(m => m.cancel());
        this._monitors = [];
    }
});


var getDefault = (function() {
    let instance;
    return function(paths) {
        if (typeof instance === 'undefined')
            instance = new FlatpakOverridesModel(paths);
        return instance;
    };
}());
