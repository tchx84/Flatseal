/* view.js
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

const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;


var FlatsealView = GObject.registerClass({
    GTypeName: 'FlatsealView',
    Template: 'resource:///com/github/tchx84/Flatseal/view.ui',
    InternalChildren: [
        'applicationsStack',
        'applicationsListBox',
        'permissionsStack',
        'permissionsBox',
    ],
}, class FlatsealView extends Gtk.Box {
    _init(resetButton) {
        super._init({});
        this._model = new FlatsealModel();
        const applications = this._model.listApplications();
        const permissions = this._model.listPermissions();

        applications.forEach(appId => {
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
                permission.type, flags);
        });

        if (applications.length <= 0 || permissions.length <= 0)
            return;


        this._applicationsStack.visibleChildName = 'withApplicationsPage';
        this._permissionsStack.visibleChildName = 'withPermissionsPage';

        this._applicationsListBox.connect('row-selected', this._updateApplication.bind(this));

        resetButton.set_sensitive(true);
        resetButton.connect('clicked', this._resetApplication.bind(this));
    }

    _updateApplication() {
        const row = this._applicationsListBox.get_selected_row();
        this._model.setApplicationId(row.appId);
    }

    _resetApplication() {
        const row = this._applicationsListBox.get_selected_row();
        this._model._resetPermissionsForAppId(row.appId);
    }
});
