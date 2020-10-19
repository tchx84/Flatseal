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

const {FlatpakSessionBusModel} = imports.models.sessionBus;


var FlatpakSystemBusModel = GObject.registerClass({
    GTypeName: 'FlatpakSystemBusModel',
}, class FlatpakSystemBusModel extends FlatpakSessionBusModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            'system-talk': {
                version: '0.4.0',
                description: _('Talks'),
                option: 'talk',
                value: this.constructor.getDefault(),
                example: 'e.g. org.freedesktop.Accounts',
            },
            'system-own': {
                version: '0.4.0',
                description: _('Owns'),
                option: 'own',
                value: this.constructor.getDefault(),
                example: 'e.g. org.freedesktop.GeoClue2',
            },
        };
    }

    static getGroup() {
        return 'System Bus Policy';
    }

    static getKey() {
        return null;
    }

    static getPrefix() {
        return 'system';
    }

    static getTitle() {
        return 'System Bus';
    }

    static getDescription() {
        return _('List of well-known names on the system bus');
    }
});
