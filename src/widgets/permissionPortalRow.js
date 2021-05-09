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

const {GObject, Handy} = imports.gi;

const {portals} = imports.models;


var FlatsealPermissionPortalRow = GObject.registerClass({
    GTypeName: 'FlatsealPermissionPortalRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/permissionPortalRow.ui',
    InternalChildren: ['content'],
}, class FlatsealPermissionPortalRow extends Handy.ActionRow {
    _init(description, permission, content, table, id) {
        super._init({});
        this.set_title(description);
        this.set_subtitle(permission);
        this._content.set_state(content);
        this._table = table;
        this._id = id;
        this._portals = portals.getDefault();
        this._portals.connect('reloaded', this._update.bind(this));
    }

    _update() {
        this.sensitive = this._portals.isSupported(this._table, this._id);

        if (this.sensitive === false)
            this.set_tooltip_text(this._portals.whatReason(this._table, this._id));
        else
            this.set_tooltip_text('');
    }

    get content() {
        return this._content;
    }
});
