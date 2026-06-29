/* exported FlatpakUsbModel */

/* usb.js
 *
 * Copyright 2025 Martin Abente Lahaye
 * Copyright 2026 Malika Odeny Asman
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
            'usb-hidden': {
                supported: this._info.supports('1.15.11'),
                description: _('Blocked devices'),
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
        return null;
    }

    static getStyle() {
        return 'usb';
    }

    static getTitle() {
        return 'USB';
    }

    static getDescription() {
        return _('List of USB devices accessible through the portal');
    }

    getOptions() { // eslint-disable-line class-methods-use-this
        return null;
    }

    reset() {
        super.reset();
        this._hiddenOriginals = new Set();
        this._hiddenGlobals = new Set();
        this._hiddenOverrides = new Set();
    }

    _findProperHiddenSet(overrides, global) {
        if (overrides && global)
            return this._hiddenGlobals;
        if (overrides && !global)
            return this._hiddenOverrides;
        return this._hiddenOriginals;
    }

    _getHiddenStatusForDevice(device) {
        let status = FlatsealOverrideStatus.ORIGINAL;
        if (this._hiddenGlobals.has(device))
            status = FlatsealOverrideStatus.GLOBAL;
        if (this._hiddenOverrides.has(device))
            status = FlatsealOverrideStatus.USER;
        return status;
    }

    updateFromProxyProperty(property, value) {
        const devices = new Set(this.constructor.deserialize(value)
            .filter(d => d.length !== 0));

        if (property === 'usb') {
            this._overrides = new Set([...devices]
                .filter(d => !this._originals.has(d))
                .filter(d => !this._globals.has(d)));

            /* Originals removed from allowed → auto-block via hidden-devices */
            [...this._originals].forEach(d => {
                if (!devices.has(d))
                    this._hiddenOverrides.add(d);
                else
                    this._hiddenOverrides.delete(d);
            });
        } else if (property === 'usb-hidden') {
            const hiddenKnown = new Set([...this._hiddenOriginals, ...this._hiddenGlobals]);
            this._hiddenOverrides = new Set([...devices]
                .filter(d => !hiddenKnown.has(d)));
        }
    }

    updateStatusProperty(proxy) {
        const usbStatuses = this.constructor.deserialize(proxy.usb)
            .filter(d => d.length !== 0)
            .map(d => this._getStatusForPermission(d));
        proxy.set_property('usb-status', this.constructor.serialize(usbStatuses));

        const hiddenStatuses = this.constructor.deserialize(proxy.usb_hidden)
            .filter(d => d.length !== 0)
            .map(d => this._getHiddenStatusForDevice(d));
        proxy.set_property('usb-hidden-status', this.constructor.serialize(hiddenStatuses));
    }

    updateProxyProperty(proxy) {
        const allHidden = new Set([
            ...this._hiddenOriginals,
            ...this._hiddenGlobals,
            ...this._hiddenOverrides,
        ]);

        const allowed = new Set([
            ...[...this._originals].filter(d => !allHidden.has(d)),
            ...[...this._globals].filter(d => !allHidden.has(d)),
            ...[...this._overrides].filter(d => !allHidden.has(d)),
        ]);

        const blocked = new Set([
            ...this._hiddenOriginals,
            ...this._hiddenGlobals,
            ...this._hiddenOverrides,
        ]);

        proxy.set_property('usb', this.constructor.serialize([...allowed]));
        proxy.set_property('usb-hidden', this.constructor.serialize([...blocked]));
    }

    loadFromKeyFile(group, key, value, overrides, global) {
        const devices = this.constructor.deserialize(value)
            .filter(d => d.length !== 0);

        if (key === 'enumerable-devices') {
            const set = this._findProperSet(overrides, global);
            devices.forEach(d => set.add(d));
        } else if (key === 'hidden-devices') {
            const set = this._findProperHiddenSet(overrides, global);
            devices.forEach(d => set.add(d));
        }
    }

    saveToKeyFile(keyFile) {
        const group = this.constructor.getGroup();

        this._overrides.forEach(value => {
            try {
                const existing = keyFile.get_value(group, 'enumerable-devices');
                keyFile.set_value(group, 'enumerable-devices', `${value};${existing}`);
            } catch (err) {
                keyFile.set_value(group, 'enumerable-devices', `${value}`);
            }
        });

        this._hiddenOverrides.forEach(value => {
            try {
                const existing = keyFile.get_value(group, 'hidden-devices');
                keyFile.set_value(group, 'hidden-devices', `${value};${existing}`);
            } catch (err) {
                keyFile.set_value(group, 'hidden-devices', `${value}`);
            }
        });
    }
});
