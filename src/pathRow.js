/* pathRow.js
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

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var mode = {
    READONLY: 'read-only',
    READWRITE: 'read-write',
    CREATE: 'create',
};


var FlatsealPathRow = GObject.registerClass({
    GTypeName: 'FlatsealPathRow',
    Template: 'resource:///com/github/tchx84/Flatseal/pathRow.ui',
    InternalChildren: ['entry', 'button'],
    Properties: {
        text: GObject.ParamSpec.string(
            'text',
            'text',
            'text',
            _propFlags, ''),
        mode: GObject.ParamSpec.string(
            'mode',
            'mode',
            'mode',
            _propFlags, mode.READONLY),
    },
    Signals: {
        'remove-requested': {},
    },
}, class FlatsealPathRow extends Gtk.Box {
    _init() {
        this._mode = mode.READONLY;
        super._init({});
        this._entry.connect('notify::text', this._changed.bind(this));
        this._button.connect('clicked', this._remove.bind(this));
    }

    _remove() {
        this.emit('remove-requested');
    }

    _changed() {
        this._update();
        this.notify('text');
    }

    _update() {
        if (this.text.endsWith(':ro'))
            this.mode = mode.READONLY;
        else if (this.text.endsWith(':create'))
            this.mode = mode.CREATE;
        else
            this.mode = mode.READWRITE;
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
        this._update();
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        const context = this.get_style_context();

        if (context.has_class(mode.READONLY))
            context.remove_class(mode.READONLY);
        else if (context.has_class(mode.READWRITE))
            context.remove_class(mode.READWRITE);
        else if (context.has_class(mode.CREATE))
            context.remove_class(mode.CREATE);

        if (value === mode.READONLY)
            context.add_class(mode.READONLY);
        else if (value === mode.READWRITE)
            context.add_class(mode.READWRITE);
        else if (value === mode.CREATE)
            context.add_class(mode.CREATE);

        if (this._mode === value)
            return;

        this._mode = value;
        this.notify('mode');
    }
});
