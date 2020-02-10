/* permissionEntryRow.js
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

const {FlatsealPathsViewer} = imports.pathsViewer;


var FlatsealPermissionEntryRow = GObject.registerClass({
    GTypeName: 'FlatsealPermissionEntryRow',
    Template: 'resource:///com/github/tchx84/Flatseal/permissionEntryRow.ui',
    InternalChildren: [
        'description',
        'permission',
        'box',
        'button',
    ],
}, class FlatsealpermissionEntryRow extends Gtk.Box {
    _init(description, permission, content) {
        super._init({});
        this._description.set_text(description);
        this._permission.set_text(permission);

        this._content = new FlatsealPathsViewer();
        this._content.text = content;
        this._box.add(this._content);

        this._button.connect('clicked', this._add.bind(this));
    }

    _add() {
        this._content.add('');
    }

    get content() {
        return this._content;
    }
});
