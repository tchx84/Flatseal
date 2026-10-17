/* exported FlatsealConditionalStatusIcon */

/* conditionalStatusIcon.js
 *
 * Copyright 2026 Malika Odeny Asman
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


var FlatsealConditionalStatusIcon = GObject.registerClass({
    GTypeName: 'FlatsealConditionalStatusIcon',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/conditionalStatusIcon.ui',
    Properties: {
        value: GObject.ParamSpec.string(
            'value',
            'value',
            'value',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            '',
        ),
    },
}, class FlatsealConditionalStatusIcon extends Gtk.Image {
    _init() {
        super._init({});
        this._value = '';
    }

    set value(value) {
        if (this._value === value)
            return;

        this._value = value;

        if (value === '') {
            this.set_tooltip_text('');
            this.visible = false;
            return;
        }

        const condition = value
            .split(':')
            .slice(2)
            .join(':');
        this.set_tooltip_text(_('Only granted if: %s').format(condition));
        this.visible = true;
    }

    get value() {
        return this._value;
    }
});
