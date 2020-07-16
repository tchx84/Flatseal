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
                description: _('Talks'),
                value: this.constructor.getDefault(),
                example: 'e.g. org.freedesktop.Notifications',
            },
            own: {
                version: '0.4.0',
                description: _('Owns'),
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

        if (option === 'talk')
            this._overrides = {};

        names.forEach(name => {
            this._overrides[name] = option;
        });

        if (option === 'own') {
            Object.entries(this._originals)
                .filter(([name]) => !(name in this._overrides))
                .forEach(([name]) => {
                    this._overrides[name] = 'none';
                });
        }
    }

    updateProxyProperty(proxy) {
        const permissions = this.getPermissions();

        Object.entries(permissions).forEach(([key]) => {
            const originals = Object.entries(this._originals)
                .filter(([, option]) => option === key)
                .filter(([name]) => !(name in this._overrides))
                .map(([name]) => name);

            const overrides = Object.entries(this._overrides)
                .filter(([, option]) => option === key)
                .map(([name]) => name);

            const values = [...new Set([...originals, ...overrides])];
            const property = `${this.constructor.getKey()}-${key}`;

            proxy.set_property(property, values.join(';'));
        });
    }

    loadFromKeyFile(group, key, value, override) {
        const dictionary = override ? this._overrides : this._originals;
        dictionary[key] = value;
    }

    saveToKeyFile(keyFile) {
        const group = this.constructor.getGroup();
        Object.entries(this._overrides).forEach(([key, value]) => {
            keyFile.set_value(group, key, value);
        });
    }

    reset() {
        this._overrides = {};
        this._originals = {};
    }
});
