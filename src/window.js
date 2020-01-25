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

const {GObject, Gtk, Gdk} = imports.gi;
const {FlatsealView} = imports.view;


var FlatsealWindow = GObject.registerClass({
    GTypeName: 'FlatsealWindow',
    Template: 'resource:///com/github/tchx84/Flatseal/window.ui',
    InternalChildren: ['resetButton'],
}, class FlatsealWindow extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({application});
        this._setupStylesheet();
        this.add(new FlatsealView(this._resetButton));
    }

    _setupStylesheet() {
        const provider = new Gtk.CssProvider();
        provider.load_from_resource('/com/github/tchx84/Flatseal/window.css');
        Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
            provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
    }
});
