/* exported FlatsealApplicationRow */

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

const {GObject, Gtk, Adw} = imports.gi;


var FlatsealApplicationRow = GObject.registerClass({
    GTypeName: 'FlatsealApplicationRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/applicationRow.ui',
    InternalChildren: ['icon'],
}, class FlatsealApplicationRow extends Adw.ActionRow {
    _init(appId, appName, appIconName) {
        super._init();
        this._icon.set_from_icon_name(appIconName);
        this.set_title(appName);
        this.set_subtitle(appId);
    }

    get appId() {
        return this.get_subtitle();
    }

    get appName() {
        return this.get_title();
    }
});
