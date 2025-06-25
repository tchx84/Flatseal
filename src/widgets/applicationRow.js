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

const {GLib, GObject, Adw, Gtk} = imports.gi;


var FlatsealApplicationRow = GObject.registerClass({
    GTypeName: 'FlatsealApplicationRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/applicationRow.ui',
    InternalChildren: ['icon'],
}, class FlatsealApplicationRow extends Adw.ActionRow {
    _init(appId, appName, appIconName, asDangerousFs = false) {
        super._init();
        this._icon.set_from_icon_name(appIconName);
        this.set_title(GLib.markup_escape_text(appName, -1));
        this.set_subtitle(appId);

        if (asDangerousFs) {
            // Cria um ícone de alerta
            const warningIcon = new Gtk.Image({
                icon_name: 'dialog-warning-symbolic',
                pixel_size: 16,
                tooltip_text: 'Este app tem acesso total ao sistema de arquivos (filesystem=host ou home). Isso pode ser um risco de segurança.'
            });
            this.add_suffix(warningIcon);
        }

    }

    get appId() {
        return this.get_subtitle();
    }

    get appName() {
        return this.get_title();
    }
});
