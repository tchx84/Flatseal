/* exported FlatpakSessionBusModel */

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
const {FlatsealOverrideStatus} = imports.models.overrideStatus;


var FlatpakSessionBusModel = GObject.registerClass({
    GTypeName: 'FlatpakSessionBusModel',
}, class FlatpakSessionBusModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            'session-talk': {
                supported: this._info.supports('0.4.0'),
                description: _('Talks'),
                option: 'talk',
                value: this.constructor.getDefault(),
                example: 'e.g. org.freedesktop.Notifications',
            },
            'session-own': {
                supported: this._info.supports('0.4.0'),
                description: _('Owns'),
                option: 'own',
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
        return null;
    }

    static getPrefix() {
        return 'session';
    }

    static getStyle() {
        return 'session';
    }

    static getTitle() {
        return 'Session Bus';
    }

    static getDescription() {
        return _('List of well-known names on the session bus');
    }

    getOptions() { // eslint-disable-line class-methods-use-this
        return null;
    }

    updateFromProxyProperty(property, value) {
        const prefix = this.constructor.getPrefix();
        const option = property.replace(`${prefix}-`, '');

        const originals = {...this._originals, ...this._globals};
        const values = value.split(';');

        /* Reset overrides on Talk since it's the first to update */
        if (option === 'talk') {
            this._overrides = {};
            this._missing = {};
        }

        values
            .filter(n => n.length !== 0)
            .filter(n => !(n in originals) || originals[n] !== option)
            .forEach(n => {
                this._overrides[n] = option;
            });

        Object.keys(originals)
            .filter(n => originals[n] === option)
            .filter(n => values.indexOf(n) === -1)
            .forEach(n => {
                this._missing[n] = 'none';
            });

        /* Add missing ones after Own since it's the last to update */
        if (option !== 'own')
            return;

        this._overrides = {...this._missing, ...this._overrides};
    }

    _getStatusForPermission(name) {
        let status = FlatsealOverrideStatus.ORIGINAL;

        if (name in this._globals)
            status = FlatsealOverrideStatus.GLOBAL;
        if (name in this._overrides)
            status = FlatsealOverrideStatus.USER;

        return status;
    }

    updateStatusProperty(proxy) {
        const prefix = this.constructor.getPrefix();

        const talk_values = proxy[`${prefix}-talk`]
            .split(';')
            .filter(n => n.length !== 0)
            .map(n => this._getStatusForPermission(n));

        const own_values = proxy[`${prefix}-own`]
            .split(';')
            .filter(n => n.length !== 0)
            .map(n => this._getStatusForPermission(n));

        proxy.set_property(`${prefix}-talk-status`, talk_values.join(';'));
        proxy.set_property(`${prefix}-own-status`, own_values.join(';'));
    }

    updateProxyProperty(proxy) {
        const options = {talk: [], own: [], none: []};
        const values = {...this._originals, ...this._globals, ...this._overrides};

        Object.entries(values).forEach(([name, option]) => {
            if (!(option in options))
                return;
            options[option].push(name);
        });

        const prefix = this.constructor.getPrefix();
        proxy.set_property(`${prefix}-talk`, options['talk'].join(';'));
        proxy.set_property(`${prefix}-own`, options['own'].join(';'));
    }

    loadFromKeyFile(group, name, option, overrides, global) {
        const dictionary = this._findProperSet(overrides, global);
        dictionary[name] = option;
    }

    saveToKeyFile(keyFile) {
        const group = this.constructor.getGroup();
        Object.entries(this._overrides).forEach(([key, value]) => {
            keyFile.set_value(group, key, value);
        });
    }

    reset() {
        this._overrides = {};
        this._globals = {};
        this._originals = {};
        this._missing = {};
    }
});
