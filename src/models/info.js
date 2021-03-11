/* exported FlatpakInfoModel getDefault */

/* info.js
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


var FlatpakInfoModel = GObject.registerClass({
    GTypeName: 'FlatpakInfoModel',
}, class FlatpakInfoModel extends GObject.Object {
    _init() {
        super._init({});
        this._version = null;
    }

    static _getInfoPath() {
        var path = GLib.getenv('FLATPAK_INFO_PATH');
        if (path)
            return path;

        return GLib.build_filenamev([
            GLib.DIR_SEPARATOR_S, '.flatpak-info',
        ]);
    }

    _parseVersion() {
        const keyFile = new GLib.KeyFile();

        try {
            keyFile.load_from_file(this.constructor._getInfoPath(), GLib.KeyFileFlags.NONE);
            return keyFile.get_value('Instance', 'flatpak-version');
        } catch (err) {
            return null;
        }
    }

    getVersion() {
        if (this._version === null)
            this._version = this._parseVersion();

        return this._version;
    }

    supports(target) {
        const version = this.getVersion();

        if (version === null)
            return true;

        const versions = version.split('.');
        const targets = target.split('.');
        const components = Math.max(versions.length, targets.length);

        for (var index = 0; index < components; index++) {
            const _version = parseInt(versions[index] || 0, 10);
            const _target = parseInt(targets[index] || 0, 10);

            if (_version < _target)
                return false;
            if (_version > _target)
                return true;
        }

        return true;
    }

    reload() {
        this._version = this._parseVersion();
    }
});


var getDefault = (function() {
    let instance;
    return function() {
        if (typeof instance === 'undefined')
            instance = new FlatpakInfoModel();
        return instance;
    };
}());
