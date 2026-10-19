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
const {FlatsealOverrideStatusIcon} = imports.widgets.overrideStatusIcon;
const {FlatsealOverrideStatus} = imports.models.overrideStatus;


var FlatsealGlobalRow = GObject.registerClass({
    GTypeName: 'FlatsealGlobalRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/globalRow.ui',
    InternalChildren: ['icon', 'statusBox'],
}, class FlatsealGlobalRow extends Adw.ActionRow {
    _init() {
        super._init();

        this._statusIcon = new FlatsealOverrideStatusIcon();
        this._statusBox.append(this._statusIcon);
    }

    get hasOverrides() {
        return this._statusIcon.status === FlatsealOverrideStatus.USER;
    }

    set hasOverrides(hasOverrides) {
        this._statusIcon.status = hasOverrides
            ? FlatsealOverrideStatus.USER : FlatsealOverrideStatus.ORIGINAL;
    }

    get appId() {
        return this.get_subtitle();
    }

    get appName() {
        return this.get_title();
    }
});
