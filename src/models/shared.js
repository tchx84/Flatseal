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
const {FlatsealOverrideStatus} = imports.models.overrideStatus;


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
        const override = value ? option : `!${option}`;

        /* Determine if this value is an actual override */

        const matchesDefault = value === permission.value;

        const fromOriginals = this._originals.has(override);
        const fromGlobals = this._globals.has(override);

        const seenInOriginals = this.constructor._isOverriden(this._originals, override);
        const seenInGlobals = this.constructor._isOverriden(this._globals, override);

        /* Assume it isn't */
        this._overrides.delete(option);
        this._overrides.delete(`!${option}`);

        /* Ignore if it came from originals or from globals */
        if (fromOriginals && !seenInGlobals || fromGlobals)
            return;

        /* Ignore if it's just the default value */
        if (matchesDefault && !seenInGlobals && !seenInOriginals)
            return;

        /* It's an override */
        this._overrides.add(override);
    }

    static _isOverriden(set, permission) {
        const option = permission.replace('!', '');
        return set.has(option) || set.has(`!${option}`);
    }

    _getStatusForPermission(permission) {
        let status = FlatsealOverrideStatus.ORIGINAL;

        if (this._globals.has(permission) || this._globals.has(`!${permission}`))
            status = FlatsealOverrideStatus.GLOBAL;
        if (this._overrides.has(permission) || this._overrides.has(`!${permission}`))
            status = FlatsealOverrideStatus.USER;

        return status;
    }

    updateStatusProperty(proxy) {
        Object.entries(this.getPermissions()).forEach(([property, permission]) => {
            const {option} = permission;
            const statusProperty = `${property}-status`;
            const status = this._getStatusForPermission(option);

            proxy.set_property(statusProperty, status);
        });
    }

    updateProxyProperty(proxy) {
        const originals = [...this._originals]
            .filter(o => !this.constructor._isOverriden(this._globals, o))
            .filter(o => !this.constructor._isOverriden(this._overrides, o));

        const globals = [...this._globals]
            .filter(g => !this.constructor._isOverriden(this._overrides, g));

        const permissions = new Set([...originals, ...globals, ...this._overrides]);

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

    _findProperSet(overrides, global) {
        if (overrides && global)
            return this._globals;
        if (overrides && !global)
            return this._overrides;
        return this._originals;
    }

    loadFromKeyFile(group, key, value, overrides, global) {
        const set = this._findProperSet(overrides, global);
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
        this._globals = new Set();
        this._originals = new Set();
    }
});
