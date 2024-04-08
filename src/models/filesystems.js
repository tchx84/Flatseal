/* exported FlatpakFilesystemsModel getDefault */

/* filesystems.js
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


var FlatpakFilesystemsModel = GObject.registerClass({
    GTypeName: 'FlatpakFilesystemsModel',
}, class FlatpakFilesystemsModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            'filesystems-host': {
                supported: this._info.supports('0.4.0'),
                description: _('All system files'),
                option: 'host',
                value: this.constructor.getDefault(),
                example: 'filesystem=host',
            },
            'filesystems-host-os': {
                supported: this._info.supports('1.7.1'),
                description: _('All system libraries, executables and static data'),
                option: 'host-os',
                value: this.constructor.getDefault(),
                example: 'filesystem=host-os',
            },
            'filesystems-host-etc': {
                supported: this._info.supports('1.7.1'),
                description: _('All system configurations'),
                option: 'host-etc',
                value: this.constructor.getDefault(),
                example: 'filesystem=host-etc',
            },
            'filesystems-home': {
                supported: this._info.supports('0.4.0'),
                description: _('All user files'),
                option: 'home',
                value: this.constructor.getDefault(),
                example: 'filesystem=home',
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

    get overrides() {
        return this._overrides;
    }

    get globals() {
        return this._globals;
    }

    get originals() {
        return this._originals;
    }

});

var getDefault = (function() {
    let instance;
    return function() {
        if (typeof instance === 'undefined')
            instance = new FlatpakFilesystemsModel();
        return instance;
    };
}());
