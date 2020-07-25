/* features.js
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


var FlatpakFeaturesModel = GObject.registerClass({
    GTypeName: 'FlatpakFeaturesModel',
}, class FlatpakFeaturesModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            'features-devel': {
                version: '0.6.10',
                description: _('Development syscalls (e.g. ptrace)'),
                option: 'devel',
                value: this.constructor.getDefault(),
                example: 'allow=devel',
            },
            'features-multiarch': {
                version: '0.6.12',
                description: _('Programs from other architectures'),
                option: 'multiarch',
                value: this.constructor.getDefault(),
                example: 'allow=multiarch',
            },
            'features-bluetooth': {
                version: '0.11.8',
                description: _('Bluetooth'),
                option: 'bluetooth',
                value: this.constructor.getDefault(),
                example: 'allow=bluetooth',
            },
            'features-canbus': {
                version: '1.0.3',
                description: _('Controller Area Network bus'),
                option: 'canbus',
                value: this.constructor.getDefault(),
                example: 'allow=canbus',
            },
        };
    }

    static getGroup() {
        return 'Context';
    }

    static getKey() {
        return 'features';
    }

    static getStyle() {
        return 'features';
    }

    static getTitle() {
        return 'Allow';
    }

    static getDescription() {
        return _('List of features available to the application');
    }
});
