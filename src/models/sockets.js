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
            x11: {
                version: '0.4.0',
                description: _('X11 windowing system'),
                value: this.constructor.getDefault(),
                example: 'socket=x11',
            },
            wayland: {
                version: '0.4.0',
                description: _('Wayland windowing system'),
                value: this.constructor.getDefault(),
                example: 'socket=wayland',
            },
            'fallback-x11': {
                version: '0.11.1',
                description: _('Fallback to X11 windowing system'),
                value: this.constructor.getDefault(),
                example: 'socket=fallback-x11',
            },
            pulseaudio: {
                version: '0.4.0',
                description: _('PulseAudio sound server'),
                value: this.constructor.getDefault(),
                example: 'socket=pulseaudio',
            },
            'session-bus': {
                version: '0.4.0',
                description: _('D-Bus session bus'),
                value: this.constructor.getDefault(),
                example: 'socket=session-bus',
            },
            'system-bus': {
                version: '0.4.0',
                description: _('D-Bus system bus'),
                value: this.constructor.getDefault(),
                example: 'socket=system-bus',
            },
            'ssh-auth': {
                version: '0.99.1',
                description: _('Secure Shell agent'),
                value: this.constructor.getDefault(),
                example: 'socket=ssh-auth',
            },
            pcsc: {
                version: '1.3.2',
                description: _('Smart cards'),
                value: this.constructor.getDefault(),
                example: 'socket=pcsc',
            },
            cups: {
                version: '1.5.2',
                description: _('Printing system'),
                value: this.constructor.getDefault(),
                example: 'socket=cups',
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
