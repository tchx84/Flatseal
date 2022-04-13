/* exported FlatpakPersistentModel getDefault */

/* persistent.js
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


var FlatpakPersistentModel = GObject.registerClass({
    GTypeName: 'FlatpakPersistentModel',
}, class FlatpakPersistentModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            persistent: {
                supported: this._info.supports('0.4.0'),
                description: _('Files'),
                option: null,
                value: this.constructor.getDefault(),
                example: _('e.g. .thunderbird'),
            },
        };
    }

    static getGroup() {
        return 'Context';
    }

    static getKey() {
        return 'persistent';
    }

    static getStyle() {
        return 'persistent';
    }

    static getTitle() {
        return 'Persistent';
    }

    static getDescription() {
        return _('List of homedir-relative paths created in the sandbox');
    }

    static getType() {
        return 'relativePath';
    }

    static getDefault() {
        return '';
    }

    getOptions() { // eslint-disable-line class-methods-use-this
        return null;
    }

    updateFromProxyProperty(property, value) {
        const paths = value.split(';')
            .filter(p => p.length !== 0)
            .filter(p => !this._originals.has(p));
        this._overrides = new Set(paths);
    }

    updateProxyProperty(proxy) {
        const union = new Set([...this._originals, ...this._overrides]);
        const values = [...union].join(';');
        proxy.set_property('persistent', values);
    }

    loadFromKeyFile(group, key, value, overrides, global) {
        if (value.length === 0)
            return;
        const set = this._findProperSet(overrides, global);
        set.add(value);
    }

    isOriginal(value) {
        return this._originals.has(value);
    }
});

var getDefault = (function() {
    let instance;
    return function() {
        if (typeof instance === 'undefined')
            instance = new FlatpakPersistentModel();
        return instance;
    };
}());
