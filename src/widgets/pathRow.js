/* exported FlatsealPathRow */

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
const {FlatsealOverrideStatusIcon} = imports.widgets.overrideStatusIcon;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

const _options = {
    '/': _('this absolute path'),
    '~/': _('this path relative to the home directory'),
    'host-etc': _('all system configurations'),
    'host-os': _('all system libraries, executables and static data'),
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

var validity = {
    VALID: 'valid',
    NOTVALID: 'not-valid',
};

const _modeDescription = {
    'read-only': _('Can read: %s'),
    'read-write': _('Can modify and read: %s'),
    create: _('Can create, modify and read: %s'),
};

const _negationSymbol = '!';
const _negationRegex = '^!{0,1}';
const _modeNegatedDescription = {
    'read-only': _('Can\'t read: %s'),
    'read-write': _('Can\'t modify or read: %s'),
    create: _('Can\'t create, modify or read: %s'),
    reset: _('Can\'t create, modify or read: %s'),
};

const _notValidMsg = _('This is not a valid option');


var FlatsealPathRow = GObject.registerClass({
    GTypeName: 'FlatsealPathRow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/pathRow.ui',
    InternalChildren: ['entry', 'button', 'store', 'image', 'statusBox'],
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
        this._statusIcon = new FlatsealOverrideStatusIcon();
        this._statusBox.add(this._statusIcon);

        Object.keys(_options).forEach(option => {
            this._store.set(this._store.append(), [0], [option]);
            this._store.set(this._store.append(), [0], [`!${option}`]);
        });

        const paths = Object.keys(_options)
            .slice(0, 2)
            .join('|');
        this._pathRE = new RegExp(`${_negationRegex}((${paths})[^/]+)+(?<!\\s)$`);

        const options = Object.keys(_options)
            .slice(2)
            .join('|');
        this._optionRE = new RegExp(`${_negationRegex}(${options})((:.*)|((/)[^/]+)*)$`);

        const modes = [':ro$', ':rw$', ':create$', '^((?!:).)*$'].join('|');
        this._modeRE = new RegExp(modes);

        const negationModes = [':reset$', '^((?!:).)*$'].join('|');
        this._negationModeRE = new RegExp(negationModes);

        this._entry.connect('notify::text', this._changed.bind(this));
        this._button.connect('clicked', this._remove.bind(this));
    }

    _remove() {
        this.emit('remove-requested');
    }

    _changed() {
        this._update();
        this._validate();
        this.notify('text');
    }

    _update() {
        let modeMsg = '';
        let optionMsg = '';

        const negated = this.text.startsWith(_negationSymbol);
        const text = this.text.replace(_negationSymbol, '');

        if (this.text.endsWith(':ro'))
            this.mode = mode.READONLY;
        else if (this.text.endsWith(':create'))
            this.mode = mode.CREATE;
        else
            this.mode = mode.READWRITE;

        modeMsg = negated ? _modeNegatedDescription[this.mode] : _modeDescription[this.mode];

        Object.keys(_options).some(option => {
            if (text.startsWith(option)) {
                optionMsg = _options[option];
                return true;
            }
            return false;
        });

        this._image.set_tooltip_text(modeMsg.format(optionMsg));
    }

    _validate() {
        const negated = this.text.startsWith(_negationSymbol);
        const context = this.get_style_context();

        if (context.has_class(validity.VALID))
            context.remove_class(validity.VALID);
        else if (context.has_class(validity.NOTVALID))
            context.remove_class(validity.NOTVALID);

        if ((this._pathRE.test(this.text) ||
            this._optionRE.test(this.text)) &&
            (!negated && this._modeRE.test(this.text) ||
             negated && this._negationModeRE.test(this.text))) {
            context.add_class(validity.VALID);
            return;
        }

        context.add_class(validity.NOTVALID);
        this._image.set_tooltip_text(_notValidMsg);
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
        this._validate();
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

    get status() {
        return this._statusIcon.status;
    }

    set status(status) {
        this._statusIcon.status = status;
    }
});
