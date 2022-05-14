/* exported FlatsealPathsViewer */

/* pathsViewer.js
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
const {FlatsealOverrideStatus} = imports.models.overrideStatus;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;


var FlatsealPathsViewer = GObject.registerClass({
    GTypeName: 'FlatsealPathsViewer',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/pathsViewer.ui',
    InternalChildren: ['box'],
    Properties: {
        text: GObject.ParamSpec.string(
            'text',
            'text',
            'text',
            _propFlags, ''),
        status: GObject.ParamSpec.string(
            'status',
            'status',
            'status',
            _propFlags,
            FlatsealOverrideStatus.ORIGINAL),
    },
}, class FlatsealPathsViewer extends Gtk.Box {
    _init(rowClass) {
        this._status = FlatsealOverrideStatus.ORIGINAL;
        super._init({});
        this._rowClass = rowClass;
    }

    _changed() {
        this.notify('text');
    }

    _remove(row) {
        this._box.remove(row);
        row.destroy();
        this._changed();
    }

    _update(text) {
        this._box.get_children().forEach(row => {
            this._box.remove(row);
            row.destroy();
        });

        const paths = text.split(';');

        paths.forEach(path => {
            if (path.length === 0)
                return;

            this.add(path);
        });

        this._updateStatus();
    }

    _updateStatus() {
        const statuses = this._status
            .split(';')
            .filter(s => s.length !== 0);
        const rows = this._box.get_children()
            .reverse();

        /* if it's still out of sync, bail out */
        if (statuses.length !== rows.length)
            return;

        rows.forEach((row, index) => {
            row.status = statuses[index];
        });
    }

    set text(text) {
        if (this._box && text === '') {
            this._update(text);
            return;
        }

        if (text === this.text)
            return;

        this._update(text);
        this.notify('text');
    }

    get text() {
        if (!this._box)
            return '';

        return this._box.get_children()
            .map(row => row.text)
            .reverse()
            .join(';');
    }

    set status(status) {
        if (!this._box)
            return;

        this._status = status;
        this._updateStatus();
    }

    get status() {
        return this._status;
    }

    add(path) {
        const row = new this._rowClass();
        row.text = path;
        row.connect('remove-requested', this._remove.bind(this, row));
        row.connect('notify::text', this._changed.bind(this));
        row.show();

        this._box.pack_end(row, true, true, 0);
    }
});
