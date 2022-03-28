/* exported FlatsealUndoPopup */

/* undoPopup.js
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

const {GLib, GObject, Gtk} = imports.gi;

const POPUP_ACTIVE_TIME = 3 * 1000;


var FlatsealUndoPopup = GObject.registerClass({
    GTypeName: 'FlatsealUndoPopup',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/undoPopup.ui',
    InternalChildren: [
        'closeButton',
        'undoButton',
    ],
}, class FlatsealUndoPopup extends Gtk.Revealer {
    _init(permissions) {
        super._init();
        this._setup(permissions);
    }

    _setup(permissions) {
        this._closeHandlerId = 0;
        this._permissions = permissions;
        this._permissions.connect('reset', this._reset.bind(this));
        this._undoButton.connect('clicked', this._undo.bind(this));
        this._closeButton.connect('clicked', this.close.bind(this));
    }

    _resetCloseHandler() {
        if (this._closeHandlerId !== 0) {
            GLib.Source.remove(this._closeHandlerId);
            this._closeHandlerId = 0;
        }
    }

    _undo() {
        this._permissions.undo();
        this.reveal_child = false;
        this._resetCloseHandler();
    }

    _reset() {
        this.reveal_child = true;
        this._closeButton.grab_focus();
        this._resetCloseHandler();
        this._closeHandlerId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT, POPUP_ACTIVE_TIME, this.close.bind(this));
    }

    close() {
        this.reveal_child = false;
        this._resetCloseHandler();
    }
});
