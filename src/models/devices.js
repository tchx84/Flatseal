/* devices.js
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


var FlatpakDevicesModel = GObject.registerClass({
    GTypeName: 'FlatpakDevicesModel',
}, class FlatpakDevicesModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            dri: {
                version: '0.4.0',
                description: _('GPU acceleration'),
                value: this.constructor.getDefault(),
                example: 'device=dri',
            },
            kvm: {
                version: '0.6.12',
                description: _('Virtualization'),
                value: this.constructor.getDefault(),
                example: 'device=kvm',
            },
            shm: {
                version: '1.6.1',
                description: _('Shared memory (e.g. JACK sound server)'),
                value: this.constructor.getDefault(),
                example: 'device=shm',
            },
            all: {
                version: '0.6.6',
                description: _('All devices (e.g. webcam)'),
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

    static getDescription() {
        return _('List of devices available in the sandbox');
    }
});
