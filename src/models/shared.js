/* exported FlatpakSharedModel */

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
const {info} = imports.models;


var FlatpakSharedModel = GObject.registerClass({
    GTypeName: 'FlatpakSharedModel',
}, class FlatpakSharedModel extends GObject.Object {
    _init() {
        super._init({});
        this._info = info.getDefault();
        this.reset();
    }

    getPermissions() {
        return {
            'shared-network': {
                supported: this._info.supports('0.4.0'),
                description: _('Network'),
                option: 'network',
                value: this.constructor.getDefault(),
                example: 'share=network',
            },
            'shared-ipc': {
                supported: this._info.supports('0.4.0'),
                description: _('Inter-process communications'),
                option: 'ipc',
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

    static getStyle() {
        return 'shared';
    }

    static getTitle() {
        return 'Share';
    }

    static getDescription() {
        return _('List of subsystems shared with the host system');
    }

    getOptions() {
        return Object.entries(this.getPermissions())
            .map(([, permission]) => permission.option);
    }

    updateFromProxyProperty(property, value) {
        const permission = this.getPermissions()[property];
        const {option} = permission;
        const negated = !value;
        const negatedOption = `!${option}`;

        this._overrides.delete(option);
        this._overrides.delete(negatedOption);

        if (negated) {
            if (this._globalOverrides.has(negatedOption))
                return;
            if (!this._globalOverrides.has(option)) {
                if (this._originals.has(negatedOption))
                    return;
                if (!this._originals.has(option))
                    return;
            }
            this._overrides.add(negatedOption);

        } else {
            if (this._globalOverrides.has(option))
                return;
            if (!this._globalOverrides.has(negatedOption)) {
                if (this._originals.has(option))
                    return;
            }
            this._overrides.add(option);
        }
    }

    updateProxyProperty(proxy) {
        const globalOverrides = [...this._globalOverrides]
            .filter(o => !this._overrides.has(o))
            .filter(o => !this._overrides.has(`!${o}`))
            .filter(o => !this._overrides.has(o.replace('!', '')));

        const mergedOverrides = new Set([...globalOverrides, ...this._overrides]);

        const originals = [...this._originals]
            .filter(o => !mergedOverrides.has(o))
            .filter(o => !mergedOverrides.has(`!${o}`))
            .filter(o => !mergedOverrides.has(o.replace('!', '')));

        const permissions = new Set([...originals, ...mergedOverrides]);

        Object.entries(this.getPermissions()).forEach(([property, permission]) => {
            let value = this.constructor.getDefault();

            const {option} = permission;
            if (permissions.has(option))
                value = true;
            if (permissions.has(`!${option}`))
                value = false;

            proxy.set_property(property, value);
        });
    }

   loadOriginal(_, value) {
        const option = value.replace('!', '');
        this._originals.delete(option);
        this._originals.delete(`!${option}`);
        this._originals.add(value);
    }

    loadGlobalOverride(_, value) {
        const option = value.replace('!', '');
        this._globalOverrides.delete(option);
        this._globalOverrides.delete(`!${option}`);
        this._globalOverrides.add(value);
    }

    loadOverride(_, value) {
        const option = value.replace('!', '');
        this._overrides.delete(option);
        this._overrides.delete(`!${option}`);
        this._overrides.add(value);
    }

    /** @deprecated */
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
            let _value = value;

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
        this._overrides = new Set();
        this._globalOverrides = new Set();
        this._originals = new Set();
    }
});
