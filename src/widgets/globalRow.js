/* exported FlatsealGlobalRow */

/* globalRow.js
 *
 * Copyright 2022 Martin Abente Lahaye
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

const {GObject, Adw} = imports.gi;


var FlatsealGlobalRow = GObject.registerClass({
    GTypeName: 'FlatsealGlobalRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/globalRow.ui',
    InternalChildren: ['icon'],
}, class FlatsealGlobalRow extends Adw.ActionRow {
    _init() {
        super._init();
    }

    get appId() {
        return this.get_subtitle();
    }

    get appName() {
        return this.get_title();
    }
});
