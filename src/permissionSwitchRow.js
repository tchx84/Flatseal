/* permissionSwitchRow.js
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

const {GObject, Gtk} = imports.gi;


var FlatsealPermissionSwitchRow = GObject.registerClass({
    GTypeName: 'FlatsealPermissionSwitchRow',
    Template: 'resource:///com/github/tchx84/Flatseal/permissionSwitchRow.ui',
    InternalChildren: ['permissionLabel', 'permissionDescription', 'permissionContent'],
}, class FlatsealPermissionSwitchRow extends Gtk.Box {
    _init(description, permission, state) {
        super._init({});
        this._permissionLabel.set_text(description);
        this._permissionDescription.set_text(permission);
        this._permissionContent.set_state(state);
    }
});
