/* exported FlatsealBusNameRow */

/* busNameRow.js
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

const {FlatsealOverrideStatusIcon} = imports.widgets.overrideStatusIcon;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

/* https://dbus.freedesktop.org/doc/dbus-specification.html */
const EXP = /^(([A-Z]|[a-z]|[0-9]|_|-)+)(\.(([A-Z]|[a-z]|[0-9]|_|-)+))+(\.\*){0,1}$/;

var validity = {
    VALID: 'valid',
    NOTVALID: 'not-valid',
};

const _notValidMsg = _('This is not a valid option');


var FlatsealBusNameRow = GObject.registerClass({
    GTypeName: 'FlatsealBusNameRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/busNameRow.ui',
    InternalChildren: ['entry', 'button', 'store', 'image', 'statusBox'],
    Properties: {
        text: GObject.ParamSpec.string(
            'text',
            'text',
            'text',
            _propFlags, ''),
    },
    Signals: {
        'remove-requested': {},
    },
}, class FlatsealBusNameRow extends Gtk.Box {
    _init() {
        super._init({});
        this._setup();
    }

    _setup() {
        this._expression = new RegExp(EXP);

        this._entry.connect('notify::text', this._changed.bind(this));
        this._button.connect('clicked', this._remove.bind(this));

        this._statusIcon = new FlatsealOverrideStatusIcon();
        this._statusBox.add(this._statusIcon);
    }

    _remove() {
        this.emit('remove-requested');
    }

    _changed() {
        this._validate();
        this.notify('text');
    }

    _validate() {
        const context = this.get_style_context();

        if (context.has_class(validity.VALID))
            context.remove_class(validity.VALID);
        else if (context.has_class(validity.NOTVALID))
            context.remove_class(validity.NOTVALID);

        if (this._expression.test(this.text)) {
            context.add_class(validity.VALID);
            this._image.set_tooltip_text('');
        } else {
            context.add_class(validity.NOTVALID);
            this._image.set_tooltip_text(_notValidMsg);
        }
    }

    get text() {
        if (!this._entry)
            return '';
        return this._entry.get_text();
    }

    set text(text) {
        if (this.text === text)
            return;
        this._entry.set_text(text);
    }

    get status() {
        return this._statusIcon.status;
    }

    set status(status) {
        this._statusIcon.status = status;
    }
});
