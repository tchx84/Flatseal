/* exported FlatsealAppInfoViewer */
/* eslint accessor-pairs: */

/* appInfoViewer.js
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

const {GObject, GLib, Gtk} = imports.gi;

const {applications} = imports.models;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

const styles = {
    NORMAL: 'normal',
    COMPACT: 'compact',
};

var FlatsealAppInfoViewer = GObject.registerClass({
    GTypeName: 'FlatsealAppInfoViewer',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/appInfoViewer.ui',
    InternalChildren: ['icon', 'name', 'author', 'version', 'released', 'runtime'],
    Properties: {
        compact: GObject.ParamSpec.boolean(
            'compact',
            'compact',
            'compact',
            _propFlags, false),
    },
}, class FlatsealAppInfoViewer extends Gtk.Box {
    _init() {
        super._init();
        this._appId = '';
        this._compact = false;
        this._applications = applications.getDefault();
        this._validator = new RegExp(/^(\d+)-(\d+)-(\d+)$/);
    }

    _getFormattedDate(string) {
        if (!this._validator.test(string))
            return string;

        const [, year, month, day] = string.match(this._validator);
        const date = GLib.DateTime.new(GLib.TimeZone.new_local(), year, month, day, 0, 0, 0);

        /* TRANSLATORS: <full-month-name> <day-of-month>, <year-with-century> */
        return date.format(_('%B %e, %Y'));
    }

    _setup() {
        const appdata = this._applications.getAppDataForAppId(this._appId);
        const desktop = this._applications.getDesktopForAppData(appdata);

        this._name.set_label(appdata.name);
        this._author.set_label(appdata.author);
        this._version.set_label(appdata.version);
        this._released.set_label(this._getFormattedDate(appdata.date));

        this._icon.set_from_icon_name(desktop.icon);

        const metadata = this._applications.getMetadataForAppId(this._appId);
        this._runtime.set_label(metadata.runtime);
    }

    set appId(id) {
        this._appId = id;
        this._setup();
    }

    set compact(value) {
        if (typeof this._icon === 'undefined')
            return;
        if (this._compact === value)
            return;

        const orientation = value ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL;
        const alignment = value ? Gtk.Align.CENTER : Gtk.Align.START;

        this.set_orientation(orientation);
        this._icon.halign = alignment;
        this._name.halign = alignment;
        this._author.halign = alignment;
        this.halign = alignment;

        const style = value ? styles.COMPACT : styles.NORMAL;
        const context = this.get_style_context();

        if (context.has_class(styles.NORMAL))
            context.remove_class(styles.NORMAL);
        if (context.has_class(styles.COMPACT))
            context.remove_class(styles.COMPACT);

        context.add_class(style);

        this._compact = value;
    }
});
