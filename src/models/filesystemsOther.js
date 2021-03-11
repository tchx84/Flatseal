/* exported FlatpakFilesystemsOtherModel */

/* filesystemsOther.js
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


var FlatpakFilesystemsOtherModel = GObject.registerClass({
    GTypeName: 'FlatpakFilesystemsOtherModel',
}, class FlatpakFilesystemsOtherModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            'filesystems-other': {
                supported: this._info.supports('0.6.14'),
                description: _('Other files'),
                option: null,
                value: this.constructor.getDefault(),
                example: _('e.g. ~/games:ro, xdg-pictures, etc'),
            },
        };
    }

    static getGroup() {
        return 'Context';
    }

    static getKey() {
        return 'filesystems';
    }

    static getStyle() {
        return 'filesystems';
    }

    static getTitle() {
        return 'Filesystem';
    }

    static getDescription() {
        return _('List of filesystem subsets available to the application');
    }

    static getType() {
        return 'path';
    }

    static getDefault() {
        return '';
    }

    getOptions() { // eslint-disable-line class-methods-use-this
        return null;
    }

    static isNegated(value) {
        return value.startsWith('!');
    }

    static negate(value) {
        if (this.isNegated(value))
            return value.replace('!', '');
        return `!${value}`;
    }

    static isOverriden(set, value) {
        var [path] = value.split(':');
        path = path.replace('!', '');

        return (
            set.has(path) ||
            set.has(`${path}:ro`) ||
            set.has(`${path}:rw`) ||
            set.has(`${path}:create`) ||
            set.has(`!${path}`) ||
            set.has(`!${path}:ro`) ||
            set.has(`!${path}:rw`) ||
            set.has(`!${path}:create`));
    }

    updateFromProxyProperty(property, value) {
        const paths = new Set(value.split(';'));

        var added = new Set([...paths]
            .filter(p => p.length !== 0)
            .filter(p => !this._originals.has(p)));

        const removed = [...this._originals]
            .filter(p => !paths.has(p))
            .filter(p => !this.constructor.isOverriden(added, p))
            .map(p => this.constructor.negate(p));

        this._overrides = new Set([...added, ...removed]);
    }

    updateProxyProperty(proxy) {
        const originals = [...this._originals]
            .filter(p => !this.constructor.isOverriden(this._overrides, p));

        const overrides = [...this._overrides]
            .filter(p => !this.constructor.isNegated(p));

        const paths = new Set([...originals, ...overrides]);

        const value = [...paths].join(';');
        proxy.set_property('filesystems-other', value);
    }

    loadFromKeyFile(group, key, value, overrides) {
        if (value.length === 0)
            return;

        const set = overrides ? this._overrides : this._originals;
        set.add(value);
    }
});
