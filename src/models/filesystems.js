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
            host: {
                version: '0.4.0',
                description: _('All system files'),
                value: this.constructor.getDefault(),
                example: 'filesystem=host',
            },
            'host-os': {
                version: '1.7.1',
                description: _('All system libraries, executables and static data'),
                value: this.constructor.getDefault(),
                example: 'filesystem=host-os',
            },
            'host-etc': {
                version: '1.7.1',
                description: _('All system configurations'),
                value: this.constructor.getDefault(),
                example: 'filesystem=host-etc',
            },
            home: {
                version: '0.4.0',
                description: _('All user files'),
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
});
