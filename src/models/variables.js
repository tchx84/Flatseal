/* exported FlatpakVariablesModel */

/* variables.js
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


var FlatpakVariablesModel = GObject.registerClass({
    GTypeName: 'FlatpakVariablesModel',
}, class FlatpakVariablesModel extends FlatpakSharedModel {
    _init() {
        super._init({});
        this.reset();
    }

    getPermissions() {
        return {
            variables: {
                supported: this._info.supports('0.4.0'),
                description: _('Variables'),
                option: null,
                value: this.constructor.getDefault(),
                example: _('e.g. GTK_DEBUG=interactive'),
            },
        };
    }

    static getDefault() {
        return '';
    }

    static getType() {
        return 'variable';
    }

    static getGroup() {
        return 'Environment';
    }

    static getKey() {
        return null;
    }

    static getStyle() {
        return 'environment';
    }

    static getTitle() {
        return 'Environment';
    }

    static getDescription() {
        return _('List of variables exported to the application');
    }

    static variableSplit(string, separator) {
        const [key, ...value] = string.split(separator);
        return [key, value.join(separator)];
    }

    getOptions() { // eslint-disable-line class-methods-use-this
        return null;
    }

    updateFromProxyProperty(property, value) {
        const overrides = {};
        const variables = {};
        const values = value.split(';');

        values
            .filter(v => v.length !== 0)
            .filter(v => this._expression.test(v))
            .map(v => this.constructor.variableSplit(v, '='))
            .forEach(([_key, _value]) => {
                variables[_key] = _value;
            });

        /* Add new variables */
        Object.entries(variables).forEach(([_key, _value]) => {
            if (!(_key in this._originals && this._originals[_key] === _value))
                overrides[_key] = _value;
        });

        /* Remove original variables */
        Object.entries(this._originals).forEach(([_key]) => {
            if (!(_key in variables))
                overrides[_key] = '';
        });

        this._overrides = overrides;
    }

    updateProxyProperty(proxy) {
        const originals = Object.entries(this._originals)
            .filter(([key]) => !(key in this._overrides))
            .map(([key, value]) => `${key}=${value}`);

        const overrides = Object.entries(this._overrides)
            .filter(([, value]) => value.length !== 0)
            .map(([key, value]) => `${key}=${value}`);

        const values = [...originals, ...overrides];

        proxy.set_property('variables', values.join(';'));
    }

    loadFromKeyFile(group, key, value, overrides, global) {
        if (!overrides && value.length === 0)
            return;

        const dict = this._findProperSet(overrides, global);
        dict[key] = value;
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
        this._expression = new RegExp(/^\w+=\S+$/);
    }
});
