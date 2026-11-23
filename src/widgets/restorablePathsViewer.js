/* exported FlatsealRestorablePathsViewer */

/* restorablePathsViewer.js
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

const {GObject} = imports.gi;
const {FlatsealOverrideStatus} = imports.models.overrideStatus;
const {FlatpakFilesystemsOtherModel} = imports.models.filesystemsOther;
const {FlatsealPathsViewer} = imports.widgets.pathsViewer;


/* shows a path and its negation as a single removed row */
var FlatsealRestorablePathsViewer = GObject.registerClass({
    GTypeName: 'FlatsealRestorablePathsViewer',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/restorablePathsViewer.ui',
}, class FlatsealRestorablePathsViewer extends FlatsealPathsViewer {
    _init(serializeFunc, deserializeFunc, rowClass) {
        this._paths = [];
        this._negations = new Map();
        super._init(serializeFunc, deserializeFunc, rowClass);
    }

    static _getNegation(path) {
        return FlatpakFilesystemsOtherModel.negate(
            FlatpakFilesystemsOtherModel.removeMode(path));
    }

    _changed() {
        this._paths = this._deserializeFunc(this.text)
            .filter(p => p.length !== 0);
        super._changed();
    }

    _updateNegation(row) {
        /* negations loaded by _update are already known */
        if (this._negations.has(row) === row.removed)
            return;

        if (row.removed)
            this._negations.set(row, this.constructor._getNegation(row.text));
        else
            this._negations.delete(row);

        this._changed();
    }

    _update(text) {
        this._negations.clear();

        const paths = this._deserializeFunc(text);

        /* the model lists originals and globals before overrides */
        const negations = paths
            .filter((p, index) => paths
                .slice(0, index)
                .some(o => FlatpakFilesystemsOtherModel.isNegationOf(o, p)));

        super._update(this._serializeFunc(paths.filter(p => !negations.includes(p))));

        for (const row of Array.from(this)) {
            const negation = negations.find(n => FlatpakFilesystemsOtherModel.isNegationOf(row.text, n));
            if (negation === undefined)
                continue;

            this._negations.set(row, negation);
            row.removed = true;
        }

        /* statuses still belong to the loaded paths */
        this._paths = paths;
        this._updateStatus();
    }

    _updateStatus() {
        const statuses = this._status
            .split(';')
            .filter(s => s.length !== 0);

        /* if it's still out of sync, bail out */
        if (statuses.length !== this._paths.length)
            return;

        const status = new Map(this._paths.map((p, index) => [p, statuses[index]]));

        for (const row of Array.from(this)) {
            /* removed rows show the status of their negation */
            const path = this._negations.has(row) ? this._negations.get(row) : row.text;
            if (status.has(path))
                row.status = status.get(path);
        }
    }

    set text(text) {
        super.text = text;
    }

    get text() {
        return this._serializeFunc(Array.from(this)
            .reverse()
            .flatMap(row => this._negations.has(row)
                ? [row.text, this._negations.get(row)]
                : [row.text]),
        );
    }

    add(path) {
        super.add(path);

        const row = this.get_first_child();

        /* new rows belong to the user, until _updateStatus says otherwise */
        row.status = FlatsealOverrideStatus.USER;
        row.connect('notify::removed', this._updateNegation.bind(this, row));
    }
});
