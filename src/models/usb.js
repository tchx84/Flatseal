/* exported FlatpakUsbModel */

/* usb.js
 *
 * Copyright 2025 Martin Abente Lahaye
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

var FlatpakUsbModel = GObject.registerClass({
    GTypeName: 'FlatpakUsbModel',
}, class FlatpakUsbModel extends FlatpakSharedModel {
    _init() {
        super._init({});
        this.reset();
    }

    getPermissions() {
        return {
            usb: {
                supported: this._info.supports('1.15.11'),
                description: _('Devices'),
                option: null,
                value: this.constructor.getDefault(),
                example: _('e.g. vnd:0123+dev:4567'),
            },
        };
    }

    static getDefault() {
        return '';
    }

    static getType() {
        return 'usb';
    }

    static getGroup() {
        return 'USB Devices';
    }

    static getKey() {
        return 'enumerable-devices';
    }

    static getStyle() {
        return 'usb';
    }

    static getTitle() {
        return 'USB';
    }

    static getDescription() {
        return _('List of devices matching the query visible to the USB portal');
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

    updateFromProxyProperty(property, value) {
        const values = new Set(this.constructor.deserialize(value));

        const baseline = this._originals.union(this._globals);
        const added = values.difference(baseline);
        const removed = new Set([...baseline.difference(values)]
            .map(d => this.constructor.negate(d)));

        this._overrides = added.union(removed);
    }

    updateStatusProperty(proxy) {
        const statuses = this.constructor.deserialize(proxy.usb)
            .map(d => this._getStatusForPermission(d));

        proxy.set_property('usb-status', this.constructor.serialize(statuses));
    }

    updateProxyProperty(proxy) {
        const originals = [...this._originals]
            .filter(o => !this._globals.has(this.constructor.negate(o)))
            .filter(o => !this._overrides.has(this.constructor.negate(o)));

        const globals = [...this._globals]
            .filter(g => !this._overrides.has(this.constructor.negate(g)));

        const usb = [...originals, ...globals, ...this._overrides];

        proxy.set_property('usb', this.constructor.serialize(usb));
    }
});
