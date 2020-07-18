/* sessionBus.js
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

const {FlatpakSharedModel} = imports.models.shared;


var FlatpakSessionBusModel = GObject.registerClass({
    GTypeName: 'FlatpakSessionBusModel',
}, class FlatpakSessionBusModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            talk: {
                version: '0.4.0',
                description: _('Talk'),
                value: this.constructor.getDefault(),
                example: 'e.g. org.freedesktop.Notifications',
            },
            own: {
                version: '0.4.0',
                description: _('Own'),
                value: this.constructor.getDefault(),
                example: 'e.g. org.gnome.Contacts.SearchProvider',
            },
        };
    }

    static getDefault() {
        return '';
    }

    static getType() {
        return 'bus';
    }

    static getGroup() {
        return 'Session Bus Policy';
    }

    static getKey() {
        return 'session';
    }

    static getDescription() {
        return _('List of well-known names on the session bus');
    }

    updateFromProxyProperty(property, value) {
        const prefix = `${this.constructor.getKey()}-`;
        const option = property.replace(prefix, '');
        const names = value.split(';');

        /* Separate overrides from originals */
        const overrides = names
            .filter(name => name.length !== 0)
            .filter(name => !this._originals[option].has(name));

        /* Find originals no longer present */
        const missing = [...this._originals[option]]
            .filter(name => name.length !== 0)
            .filter(name => !names.includes(name));

        this._overrides[option] = new Set(overrides);
        this._missing[option] = new Set(missing);
    }

    updateProxyProperty(proxy) {
        ['talk', 'own'].forEach(option => {
            const originals = [...this._originals[option]]
                .filter(name => !this._overrides['talk'].has(name))
                .filter(name => !this._overrides['own'].has(name))
                .filter(name => !this._overrides['none'].has(name));

            const values = [...originals, ...this._overrides[option]];
            const property = `${this.constructor.getKey()}-${option}`;
            proxy.set_property(property, values.join(';'));
        });
    }

    loadFromKeyFile(group, name, option, override) {
        const dictionary = override ? this._overrides : this._originals;
        dictionary[option].add(name);
    }

    saveToKeyFile(keyFile) {
        const overrides = {};

        /* Populate all overrides */
        ['talk', 'own'].forEach(option => {
            this._overrides[option].forEach(name => {
                overrides[name] = option;
            });
        });

        /* Find original names that are really missing */
        ['talk', 'own'].forEach(option => {
            this._missing[option].forEach(name => {
                if (name in overrides)
                    return;
                overrides[name] = 'none';
            });
        });

        /* Write to overrides file */
        const group = this.constructor.getGroup();
        Object.entries(overrides).forEach(([key, value]) => {
            keyFile.set_value(group, key, value);
        });
    }

    reset() {
        this._overrides = {};
        this._originals = {};
        this._missing = {};

        /* Sets for every possible value */
        ['talk', 'own', 'none'].forEach(option => {
            this._overrides[option] = new Set();
            this._originals[option] = new Set();
            this._missing[option] = new Set();
        });
    }
});
