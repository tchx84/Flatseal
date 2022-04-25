/* exported FlatpakUnsupportedModel */
/* eslint class-methods-use-this: */

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

    getPermissions() {
        return {};
    }

    static getGroup() {
        return 'unsupported';
    }

    updateFromProxyProperty() { // eslint-disable-line class-methods-use-this
        return false;
    }

    updateStatusProperty() {

        /* does not apply to this backend */
    }

    updateProxyProperty() { // eslint-disable-line class-methods-use-this
        return false;
    }

    loadFromKeyFile(group, key, value) {
        this._permissions.add([group, key, value]);
        return true;
    }

    saveToKeyFile(keyFile) {
        this._permissions.forEach(([group, key, value]) => {
            let _value;

            try {
                const existing = keyFile.get_value(group, key);
                _value = `${value};${existing}`;
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
        return this._permissions.size === 0;
    }
});
