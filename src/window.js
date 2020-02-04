/* window.js
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
const {FlatsealView} = imports.view;


var FlatsealWindow = GObject.registerClass({
    GTypeName: 'FlatsealWindow',
    Template: 'resource:///com/github/tchx84/Flatseal/window.ui',
    InternalChildren: ['resetButton', 'menu'],
}, class FlatsealWindow extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({application});

        this._view = new FlatsealView();
        this._view.connect('notify::app-id', this._updateApplication.bind(this));
        this.add(this._view);

        this._resetButton.connect('clicked', this._resetApplication.bind(this));

        const builder = Gtk.Builder.new_from_resource('/com/github/tchx84/Flatseal/menu.ui');
        this._menu.set_menu_model(builder.get_object('menu'));
    }

    _updateApplication() {
        this.set_title(this._view.app_id);
        this._resetButton.set_sensitive(!!this._view.app_id);
    }

    _resetApplication() {
        this._view.resetApplication();
    }
});
