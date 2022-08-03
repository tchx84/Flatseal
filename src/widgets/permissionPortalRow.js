/* exported FlatsealPermissionPortalRow */

/* permissionPortalRow.js
 *
 * Copyright 2021 Martin Abente Lahaye
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

const {GLib, GObject, Adw} = imports.gi;

const {getDefault, FlatpakPortalState} = imports.models.portals;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;


var FlatsealPermissionPortalRow = GObject.registerClass({
    GTypeName: 'FlatsealPermissionPortalRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/permissionPortalRow.ui',
    InternalChildren: ['stateSwitch', 'unsetButton'],
    Properties: {
        state: GObject.ParamSpec.int(
            'state',
            'state',
            'state',
            _propFlags,
            FlatpakPortalState.UNKNOWN,
            FlatpakPortalState.ALLOWED,
            FlatpakPortalState.UNKNOWN),
    },
}, class FlatsealPermissionPortalRow extends Adw.ActionRow {
    _init(description, permission, content, table, id) {
        super._init({});

        this.set_title(description);
        this.set_subtitle(permission);
        this._state = content;

        this._table = table;
        this._id = id;

        this._portals = getDefault();
        this._unsetButton.connect('clicked', this._unsetClicked.bind(this));
        this._stateHandlerId = this._stateSwitch.connect('state-set', this._stateSwitched.bind(this));
    }

    _stateSwitched() {
        if (this._stateSwitch.active)
            this._state = FlatpakPortalState.ALLOWED;
        else
            this._state = FlatpakPortalState.DISALLOWED;

        this._updateWidget();
        this.notify('state');
    }

    _unsetClicked() {
        this._state = FlatpakPortalState.UNSET;
        this._updateWidget();
        this.notify('state');
    }

    _updateWidget() {
        GObject.signal_handler_block(this._stateSwitch, this._stateHandlerId);

        if (this._state === FlatpakPortalState.UNSUPPORTED) {
            this._stateSwitch.active = false;
            this._unsetButton.visible = false;
            this.sensitive = false;
            this.set_tooltip_text(this._portals.getUnsupportedReason(this._table, this._id));
        } else if (this._state === FlatpakPortalState.UNSET) {
            this._stateSwitch.active = false;
            this._unsetButton.visible = false;
            this.sensitive = true;
            this.set_tooltip_text('');
        } else if (this._state === FlatpakPortalState.DISALLOWED) {
            this._stateSwitch.active = false;
            this._unsetButton.visible = true;
            this.sensitive = true;
            this.set_tooltip_text('');
        } else if (this._state === FlatpakPortalState.ALLOWED) {
            this._stateSwitch.active = true;
            this._unsetButton.visible = true;
            this.sensitive = true;
            this.set_tooltip_text('');
        }

        GObject.signal_handler_unblock(this._stateSwitch, this._stateHandlerId);
    }

    get content() {
        return this;
    }

    set state(value) {
        if (value === this._state || typeof this._state === 'undefined')
            return;

        this._state = value;
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, this._updateWidget.bind(this));
    }

    get state() {
        return this._state;
    }

    get supported() {
        return this.sensitive;
    }

    set supported(supported) {
        this.sensitive = supported;
        this._updateWidget();
    }
});
