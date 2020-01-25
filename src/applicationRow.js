/* applicationRow.js
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


var FlatsealApplicationRow = GObject.registerClass({
    GTypeName: 'FlatsealApplicationRow',
    Template: 'resource:///com/github/tchx84/Flatseal/applicationRow.ui',
    InternalChildren: ['applicationLabel'],
}, class FlatsealApplicationRow extends Gtk.ListBoxRow {
    _init(appId) {
        super._init();
        this.appId = appId;
        this._applicationLabel.set_text(this.appId);
    }
});
