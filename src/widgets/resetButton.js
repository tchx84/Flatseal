/* exported FlatsealResetButton */

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

const {GObject, Gtk, Adw} = imports.gi;


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

        this.label = _('_Reset');
        this.use_underline = true;
        this.sensitive = false;

        this.add_css_class('reset-button');

        this.connect('clicked', this._clicked.bind(this));
    }

    _clicked() {
        this._permissions.reset();
    }

    _update(widget, overriden, unsupported) {
        this.sensitive = overriden;
        if (unsupported) {
            const content = new Adw.ButtonContent();
            content.icon_name = 'dialog-warning-symbolic';
            content.label = _('_Reset');
            content.use_underline = true;
            this.set_child(content);
        } else {
            this.label = _('_Reset');
        }

        let text = _('No changes made to this application');

        if (overriden)
            text = _('Reset this application permissions');
        if (unsupported)
            text += _(', including changes not made with Flatseal');

        this.set_tooltip_text(text);
    }
});
