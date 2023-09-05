/* exported FlatsealSettingsModel getDefault */

/* settings.js
 *
 * Copyright 2021 Martin Abente Lahaye
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

const {GObject, Gio} = imports.gi;


var FlatsealSettingsModel = GObject.registerClass({
    GTypeName: 'FlatsealSettingsModel',
}, class FlatsealSettingsModel extends GObject.Object {
    _init() {
        super._init({});
        this._settings = new Gio.Settings({schema_id: 'com.github.tchx84.Flatseal'});
    }

    restoreWindowState(window) {
        window.default_width = this._settings.get_int('window-width');
        window.default_height = this._settings.get_int('window-height');
        if (this._settings.get_boolean('window-maximized'))
            window.maximize();
    }

    saveWindowState(window) {
        if (!window.maximized) {
            const [width, height] = window.get_default_size();
            this._settings.set_int('window-width', width);
            this._settings.set_int('window-height', height);
        }
        this._settings.set_boolean('window-maximized', window.maximized);
    }

    getSelectedAppId() {
        return this._settings.get_string('selected-app-id');
    }

    setSelectedAppId(appId) {
        this._settings.set_string('selected-app-id', appId);
    }
});
