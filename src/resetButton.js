/* resetButton.js
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


var FlatsealResetButton = GObject.registerClass({
    GTypeName: 'FlatsealResetButton',
}, class FlatsealResetButton extends Gtk.Button {
    _init(permissions) {
        super._init();
        this._setup(permissions);
    }

    /*  XXX Can't move this a .ui file for some reason */
    _setup(permissions) {
        this._permissions = permissions;
        this._permissions.connect('changed', this._update.bind(this));

        this.set_label(_('Reset'));
        this.sensitive = false;
        this.can_focus = false;
        this.visible = true;
        this.connect('clicked', this._clicked.bind(this));
    }

    _clicked() {
        this._permissions.reset();
    }

    _update(permissions, overriden) {
        this.sensitive = overriden;
        if (this.sensitive)
            this.set_tooltip_text(_('Reset this application permissions'));
        else
            this.set_tooltip_text(_('No changes made to this application'));
    }
});
