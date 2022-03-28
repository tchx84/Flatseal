/* exported FlatpakDevicesModel */

/* devices.js
 *
 * Copyright 2020 The Flatseal Authors
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


var FlatpakDevicesModel = GObject.registerClass({
    GTypeName: 'FlatpakDevicesModel',
}, class FlatpakDevicesModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            'devices-dri': {
                supported: this._info.supports('0.4.0'),
                description: _('GPU acceleration'),
                option: 'dri',
                value: this.constructor.getDefault(),
                example: 'device=dri',
            },
            'devices-kvm': {
                supported: this._info.supports('0.6.12'),
                description: _('Virtualization'),
                option: 'kvm',
                value: this.constructor.getDefault(),
                example: 'device=kvm',
            },
            'devices-shm': {
                supported: this._info.supports('1.6.1'),
                description: _('Shared memory'),
                option: 'shm',
                value: this.constructor.getDefault(),
                example: 'device=shm',
            },
            'devices-all': {
                supported: this._info.supports('0.6.6'),
                description: _('All devices (e.g. webcam)'),
                option: 'all',
                value: this.constructor.getDefault(),
                example: 'device=all',
            },
        };
    }

    static getGroup() {
        return 'Context';
    }

    static getKey() {
        return 'devices';
    }

    static getStyle() {
        return 'devices';
    }

    static getTitle() {
        return 'Device';
    }

    static getDescription() {
        return _('List of devices available in the sandbox');
    }
});
