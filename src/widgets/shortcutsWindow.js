/* exported FlatsealShortcutsWindow */

/* shortcutsWindow.js
 *
 * Copyright 2021 Martin Abente Lahaye
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


var FlatsealShortcutsWindow = GObject.registerClass({
    GTypeName: 'FlatsealShortcutsWindow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/shortcutsWindow.ui',
}, class FlatsealShortcutsWindow extends Gtk.ShortcutsWindow {
});
