/* groupRow.js
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


var FlatsealGroupRow = GObject.registerClass({
    GTypeName: 'FlatsealGroupRow',
    Template: 'resource:///com/github/tchx84/Flatseal/groupRow.ui',
    InternalChildren: ['title', 'description'],
}, class FlatsealGroupRow extends Gtk.Box {
    _init(title, description) {
        super._init({});
        this._title.set_label(this.constructor._formatTitle(title));
        this._description.set_label(description);
    }

    static _formatTitle(title) {
        return title.replace(/^\w/, c => c.toUpperCase());
    }
});
