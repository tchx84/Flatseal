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
const {FlatsealOverrideStatus} = imports.models.overrideStatus;


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

    getOptions() { // eslint-disable-line class-methods-use-this
        return null;
    }

    updateFromProxyProperty(property, value) {
        const overrides = {};
        const variables = {};
        const originals = {...this._originals, ...this._globals};

        value
            .split(';')
            .filter(v => this._expression.test(v))
            .map(v => v.split(/[=](.*)/s))
            .forEach(([k, v]) => {
                variables[k] = v;
            });

        Object.entries(variables)
            .filter(([k, v]) => !(k in originals) || originals[k] !== v)
            .forEach(([k, v]) => {
                overrides[k] = v;
            });

        Object.keys(originals)
            .filter(k => !(k in variables))
            .forEach(k => {
                overrides[k] = '';
            });

        this._overrides = overrides;
    }

    _getStatusForPermission(variable) {
        const [key] = variable.split(/[=](.*)/s);

        let status = FlatsealOverrideStatus.ORIGINAL;
        if (key in this._globals)
            status = FlatsealOverrideStatus.GLOBAL;
        if (key in this._overrides)
            status = FlatsealOverrideStatus.USER;

        return status;
    }

    updateStatusProperty(proxy) {
        const values = proxy.variables
            .split(';')
            .filter(v => v.length !== 0)
            .map(v => this._getStatusForPermission(v));

        proxy.set_property('variables-status', values.join(';'));
    }

    updateProxyProperty(proxy) {
        let variables = {...this._originals, ...this._globals, ...this._overrides};

        variables = Object.entries(variables)
            .filter(([, value]) => value.length !== 0)
            .map(([key, value]) => `${key}=${value}`)
            .join(';');

        proxy.set_property('variables', variables);
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
