/* unsupported.js
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

const {GObject} = imports.gi;


var FlatpakUnsupportedModel = GObject.registerClass({
    GTypeName: 'FlatpakUnsupportedModel',
}, class FlatpakUnsupportedModel extends GObject.Object {
    _init() {
        super._init();
        this.reset();
    }

    backup(group, key, value) {
        if (this._permissions.has([group, key, value]))
            return;
        this._permissions.add([group, key, value]);
    }

    restore(keyFile) {
        this._permissions.forEach(([group, key, value]) => {
            var _value;

            try {
                var existing = keyFile.get_value(group, key);
                _value = `${_value};${existing}`;
            } catch (err) {
                _value = `${value}`;
            }

            keyFile.set_value(group, key, _value);
        });
    }

    reset() {
        this._permissions = new Set();
    }

    isEmpty() {
        return this._permissions.size === 0
    }
});
