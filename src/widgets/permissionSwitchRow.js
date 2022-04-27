/* exported FlatsealPermissionSwitchRow */

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

const {GObject, Handy} = imports.gi;
const {FlatsealOverrideStatusIcon} = imports.widgets.overrideStatusIcon;


var FlatsealPermissionSwitchRow = GObject.registerClass({
    GTypeName: 'FlatsealPermissionSwitchRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/permissionSwitchRow.ui',
    InternalChildren: ['content', 'statusBox'],
}, class FlatsealPermissionSwitchRow extends Handy.ActionRow {
    _init(description, permission, content) {
        super._init({});
        this.set_title(description);
        this.set_subtitle(permission);
        this._content.set_state(content);
        this.connect('notify::sensitive', this._update.bind(this));

        this._statusIcon = new FlatsealOverrideStatusIcon();
        this._statusBox.add(this._statusIcon);
    }

    _update() {
        if (this.sensitive === false)
            this.set_tooltip_text(_('Not supported by the installed version of Flatpak'));
        else
            this.set_tooltip_text('');
    }

    get content() {
        return this._content;
    }

    get status() {
        return this._statusIcon;
    }
});
