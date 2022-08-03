/* exported FlatsealOverrideStatusIcon OverrideStatus */

/* overrideStatusIcon.js
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

const { GObject, Gtk } = imports.gi;
const { FlatsealOverrideStatus } = imports.models.overrideStatus;

const OverrideStatusDescription = {
    global: _('Changed globally'),
    user: _('Changed by the user'),
};

var FlatsealOverrideStatusIcon = GObject.registerClass({
    GTypeName: 'FlatsealOverrideStatusIcon',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/overrideStatusIcon.ui',
    Properties: {
        status: GObject.ParamSpec.string(
            'status',
            'status',
            'status',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            FlatsealOverrideStatus.ORIGINAL,
        ),
    },
}, class FlatsealOverrideStatusIcon extends Gtk.Box {
    _init() {
        super._init({});
        this._status = FlatsealOverrideStatus.ORIGINAL;
    }

    set status(status) {
        if (this._status === status)
            return;

        const context = this.get_style_context();
        if (context.has_class(FlatsealOverrideStatus.USER))
            context.remove_class(FlatsealOverrideStatus.USER);
        else if (context.has_class(FlatsealOverrideStatus.GLOBAL))
            context.remove_class(FlatsealOverrideStatus.GLOBAL);

        this._status = status;
        if (status === FlatsealOverrideStatus.ORIGINAL) {
            this.set_tooltip_text('');
            this.visible = false;
            return;
        }

        this.set_tooltip_text(OverrideStatusDescription[status]);
        this.visible = true;
        context.add_class(status);
    }

    get status() {
        return this._status;
    }
});
