/* exported FlatpakSocketsModel */

/* sockets.js
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


var FlatpakSocketsModel = GObject.registerClass({
    GTypeName: 'FlatpakSocketsModel',
}, class FlatpakSocketsModel extends FlatpakSharedModel {
    _init() {
        super._init({});
    }

    getPermissions() {
        return {
            'sockets-x11': {
                supported: this._info.supports('0.4.0'),
                description: _('X11 Windowing System'),
                option: 'x11',
                value: this.constructor.getDefault(),
                example: 'socket=x11',
            },
            'sockets-wayland': {
                supported: this._info.supports('0.4.0'),
                description: _('Wayland Windowing System'),
                option: 'wayland',
                value: this.constructor.getDefault(),
                example: 'socket=wayland',
            },
            'sockets-fallback-x11': {
                supported: this._info.supports('0.11.1'),
                description: _('Fallback to X11 Windowing System'),
                option: 'fallback-x11',
                value: this.constructor.getDefault(),
                example: 'socket=fallback-x11',
            },
            'sockets-pulseaudio': {
                supported: this._info.supports('0.4.0'),
                description: _('PulseAudio Sound Server'),
                option: 'pulseaudio',
                value: this.constructor.getDefault(),
                example: 'socket=pulseaudio',
            },
            'sockets-session-bus': {
                supported: this._info.supports('0.4.0'),
                description: _('D-Bus Session Bus'),
                option: 'session-bus',
                value: this.constructor.getDefault(),
                example: 'socket=session-bus',
            },
            'sockets-system-bus': {
                supported: this._info.supports('0.4.0'),
                description: _('D-Bus System Bus'),
                option: 'system-bus',
                value: this.constructor.getDefault(),
                example: 'socket=system-bus',
            },
            'sockets-ssh-auth': {
                supported: this._info.supports('0.99.1'),
                description: _('Secure Shell Agent'),
                option: 'ssh-auth',
                value: this.constructor.getDefault(),
                example: 'socket=ssh-auth',
            },
            'sockets-pcsc': {
                supported: this._info.supports('1.3.2'),
                description: _('Smart Cards'),
                option: 'pcsc',
                value: this.constructor.getDefault(),
                example: 'socket=pcsc',
            },
            'sockets-cups': {
                supported: this._info.supports('1.5.2'),
                description: _('Printing System'),
                option: 'cups',
                value: this.constructor.getDefault(),
                example: 'socket=cups',
            },
            'sockets-gpg-agent': {
                supported: this._info.supports('1.14.0'),
                description: _('GPG-Agent Directories'),
                option: 'gpg-agent',
                value: this.constructor.getDefault(),
                example: 'socket=gpg-agent',
            },
        };
    }

    static getGroup() {
        return 'Context';
    }

    static getKey() {
        return 'sockets';
    }

    static getStyle() {
        return 'sockets';
    }

    static getTitle() {
        return 'Socket';
    }

    static getDescription() {
        return _('List of well-known sockets available in the sandbox');
    }
});
