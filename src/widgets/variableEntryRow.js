/* variableEntryRow.js
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

const {FlatsealPathsViewer} = imports.widgets.pathsViewer;
const {FlatsealVariableRow} = imports.widgets.variableRow;


var FlatsealVariableEntryRow = GObject.registerClass({
    GTypeName: 'FlatsealVariableEntryRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/variableEntryRow.ui',
    InternalChildren: [
        'box',
        'button',
        'description',
        'permission',
    ],
}, class FlatsealVariableEntryRow extends Gtk.Box {
    _init(text) {
        super._init({});
        this._setup(text);
    }

    _setup(text) {
        this._content = new FlatsealPathsViewer(FlatsealVariableRow);
        this._content.text = text;
        this._box.add(this._content);

        this._description.set_label(_('Beware'));
        this._permission.set_label(_('Changing these could break the application'));

        this._button.connect('clicked', this._add.bind(this));
        this.connect('notify::sensitive', this._update.bind(this));
    }

    _add() {
        this._content.add('');
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
});
