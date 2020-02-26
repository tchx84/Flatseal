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

const _options = {
    '/': _('this arbitrary absolute path'),
    '~/': _('this arbitrary path relative to the home directory'),
    host: _('all system files'),
    home: _('all user files'),
    'xdg-desktop': _('the desktop directory'),
    'xdg-documents': _('the documents directory'),
    'xdg-download': _('the download directory'),
    'xdg-music': _('the music directory'),
    'xdg-pictures': _('the pictures directory'),
    'xdg-public-share': _('the public directory'),
    'xdg-videos': _('the videos directory'),
    'xdg-templates': _('the templates directory'),
    'xdg-config': _('the config directory'),
    'xdg-cache': _('the cache directory'),
    'xdg-data': _('the data directory'),
    'xdg-run': _('the runtime directory'),
};

var mode = {
    READONLY: 'read-only',
    READWRITE: 'read-write',
    CREATE: 'create',
};

const _modeDescription = {
    'read-only': _('Can read: %s'),
    'read-write': _('Can modify and read: %s'),
    create: _('Can create, modify and read: %s'),
};

var FlatsealPathRow = GObject.registerClass({
    GTypeName: 'FlatsealPathRow',
    Template: 'resource:///com/github/tchx84/Flatseal/pathRow.ui',
    InternalChildren: ['entry', 'button', 'store', 'image'],
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
        this._setup();
    }

    _setup() {
        Object.keys(_options).forEach(option => {
            this._store.set(this._store.append(), [0], [option]);
        });

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
        var modeMsg = '';
        var optionMsg = '';

        if (this.text.endsWith(':ro'))
            this.mode = mode.READONLY;
        else if (this.text.endsWith(':create'))
            this.mode = mode.CREATE;
        else
            this.mode = mode.READWRITE;

        modeMsg = _modeDescription[this.mode];

        Object.keys(_options).some(option => {
            if (this.text.startsWith(option)) {
                optionMsg = _options[option];
                return true;
            }
            return false;
        });

        this._image.set_tooltip_text(modeMsg.format(optionMsg));
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
