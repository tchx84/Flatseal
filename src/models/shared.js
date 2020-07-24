/* shared.js
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


var FlatpakSharedModel = GObject.registerClass({
    GTypeName: 'FlatpakSharedModel',
}, class FlatpakSharedModel extends GObject.Object {
    _init() {
        super._init({});
        this.reset();
    }

    getPermissions() {
        return {
            network: {
                version: '0.4.0',
                description: _('Network'),
                value: this.constructor.getDefault(),
                example: 'share=network',
            },
            ipc: {
                version: '0.4.0',
                description: _('Inter-process communications'),
                value: this.constructor.getDefault(),
                example: 'share=ipc',
            },
        };
    }

    static getGroup() {
        return 'Context';
    }

    static getKey() {
        return 'shared';
    }

    static getType() {
        return 'state';
    }

    static getDefault() {
        return false;
    }

    getOptions() {
        return new Set(Object.keys(this.getPermissions()));
    }

    static getStyle() {
        return 'shared';
    }

    static getTitle() {
        return 'Share';
    }

    static getDescription() {
        return _('List of subsystems shared with the host system');
    }

    updateFromProxyProperty(property, value) {
        const option = property.replace(/\w+-/, '');
        const negated = !value;
        const override = negated ? `!${option}` : option;

        this._overrides.delete(option);
        this._overrides.delete(`!${option}`);

        if (this._originals.has(override))
            return;
        if (!this._originals.has(option) && negated)
            return;

        this._overrides.add(override);
    }

    updateProxyProperty(proxy) {
        const key = this.constructor.getKey();

        const originals = [...this._originals]
            .filter(o => !this._overrides.has(o))
            .filter(o => !this._overrides.has(`!${o}`));

        var permissions = new Set([...originals, ...this._overrides]);

        Object.entries(this.getPermissions()).forEach(([option, permission]) => {
            const property = `${key}-${option}`;

            var {value} = permission;
            if (permissions.has(option))
                value = true;
            if (permissions.has(`!${option}`))
                value = false;

            proxy.set_property(property, value);
        });
    }

    loadFromKeyFile(group, key, value, overrides) {
        const option = value.replace('!', '');
        const set = overrides ? this._overrides : this._originals;

        set.delete(option);
        set.delete(`!${option}`);

        set.add(value);
    }

    saveToKeyFile(keyFile) {
        const group = this.constructor.getGroup();
        const key = this.constructor.getKey();

        this._overrides.forEach(value => {
            var _value = value;

            try {
                var existing = keyFile.get_value(group, key);
                _value = `${value};${existing}`;
            } catch (err) {
                _value = `${value}`;
            }

            keyFile.set_value(group, key, _value);
        });
    }

    reset() {
        this._overrides = new Set();
        this._originals = new Set();
    }
});
