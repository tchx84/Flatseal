/* window.js
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
const {FlatsealApplicationRow} = imports.applicationRow;
const {FlatsealModel} = imports.model;
const {FlatsealPermissionEntryRow} = imports.permissionEntryRow;
const {FlatsealPermissionSwitchRow} = imports.permissionSwitchRow;

const _bindFlags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;


var FlatsealWindow = GObject.registerClass({
    GTypeName: 'FlatsealWindow',
    Template: 'resource:///com/github/tchx84/Flatseal/window.ui',
    InternalChildren: [
        'applicationsSearchEntry',
        'applicationsStack',
        'applicationsListBox',
        'permissionsStack',
        'permissionsBox',
        'resetButton',
        'menu',
    ],
}, class FlatsealWindow extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({application});
        this._setupView();
    }

    _setupView() {
        this._model = new FlatsealModel();
        const applications = this._model.listApplications();
        const permissions = this._model.listPermissions();

        if (applications.length <= 0 || permissions.length <= 0)
            return;

        const iconTheme = Gtk.IconTheme.get_default();
        applications.forEach(appId => {
            iconTheme.append_search_path(this._model.getIconThemePathForAppId(appId));
            const row = new FlatsealApplicationRow(appId);
            this._applicationsListBox.add(row);
        });

        permissions.forEach(permission => {
            var row;

            if (permission.type === 'text') {
                row = new FlatsealPermissionEntryRow(
                    permission.description,
                    permission.permission,
                    permission.value);
            } else {
                row = new FlatsealPermissionSwitchRow(
                    permission.description,
                    permission.permission,
                    permission.value);
            }

            this._permissionsBox.add(row);
            this._model.bind_property(
                permission.property,
                row._permissionContent,
                permission.type, _bindFlags);
        });

        this._applicationsStack.visibleChildName = 'withApplicationsPage';
        this._permissionsStack.visibleChildName = 'withPermissionsPage';

        this._applicationsListBox.connect('row-selected', this._updateApplication.bind(this));
        this._applicationsListBox.set_filter_func(this._filterApplications.bind(this));
        this._applicationsSearchEntry.connect('stop-search', this._cancelSearch.bind(this));
        this._applicationsSearchEntry.connect(
            'search-changed', this._invalidateSearch.bind(this));

        this._resetButton.set_sensitive(true);
        this._resetButton.connect('clicked', this._resetApplication.bind(this));

        const builder = Gtk.Builder.new_from_resource('/com/github/tchx84/Flatseal/menu.ui');
        this._menu.set_menu_model(builder.get_object('menu'));

        /* XXX shouldn't this be automatically ? */
        this._applicationsListBox.select_row(this._applicationsListBox.get_row_at_index(0));
    }

    _updateApplication() {
        const row = this._applicationsListBox.get_selected_row();
        this._model.setAppId(row.appId);
        this.set_title(row.appId);
    }

    _resetApplication() {
        const row = this._applicationsListBox.get_selected_row();
        this._model.resetPermissionsForAppId(row.appId);
    }

    _filterApplications(application) {
        const text = this._applicationsSearchEntry.get_text();

        if (text.length === 0)
            return true;

        return application.appId.toLowerCase().includes(text.toLowerCase());
    }

    _invalidateSearch() {
        this._applicationsListBox.invalidate_filter();
    }

    _cancelSearch() {
        this._applicationsSearchEntry.set_text('');
    }
});
