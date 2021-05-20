/* exported FlatsealWindow */

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

const {GObject, Gtk, Handy} = imports.gi;

const {FlatpakApplicationsModel} = imports.models.applications;
const {FlatpakPermissionsModel} = imports.models.permissions;

const {FlatsealAppInfoViewer} = imports.widgets.appInfoViewer;
const {FlatsealApplicationRow} = imports.widgets.applicationRow;
const {FlatsealPermissionEntryRow} = imports.widgets.permissionEntryRow;
const {FlatsealPermissionPortalRow} = imports.widgets.permissionPortalRow;
const {FlatsealPermissionSwitchRow} = imports.widgets.permissionSwitchRow;
const {FlatsealResetButton} = imports.widgets.resetButton;
const {FlatsealDetailsButton} = imports.widgets.detailsButton;
const {FlatsealPathRow} = imports.widgets.pathRow;
const {FlatsealRelativePathRow} = imports.widgets.relativePathRow;
const {FlatsealUndoPopup} = imports.widgets.undoPopup;
const {FlatsealVariableRow} = imports.widgets.variableRow;
const {FlatsealBusNameRow} = imports.widgets.busNameRow;
const {FlatsealSettingsModel} = imports.models.settings;

const _bindFlags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
const _bindReadFlags = GObject.BindingFlags.SYNC_CREATE;

const menuResource = '/com/github/tchx84/Flatseal/widgets/menu.ui';
const ACTION_BAR_THRESHOLD = 540;


var FlatsealWindow = GObject.registerClass({
    GTypeName: 'FlatsealWindow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/window.ui',
    InternalChildren: [
        'actionBar',
        'appInfoGroup',
        'applicationsSearchButton',
        'applicationsSearchRevealer',
        'applicationsSearchEntry',
        'applicationsStack',
        'applicationsListBox',
        'applicationsHeaderBar',
        'permissionsHeaderBar',
        'permissionsStack',
        'permissionsBox',
        'startHeaderBox',
        'endHeaderBox',
        'startActionBox',
        'endActionBox',
        'menuButton',
        'backButton',
        'contentLeaflet',
        'undoPopupBox',
    ],
}, class FlatsealWindow extends Handy.ApplicationWindow {
    _init(application) {
        super._init({application});
        this._setup();
    }

    _setup() {
        const builder = Gtk.Builder.new_from_resource(menuResource);
        this._menuButton.set_menu_model(builder.get_object('menu'));

        this._settings = new FlatsealSettingsModel();
        this._settings.restoreWindowState(this);

        this._permissions = new FlatpakPermissionsModel();
        this._applications = new FlatpakApplicationsModel();

        const applications = this._applications.getAll();
        const permissions = this._permissions.getAll();

        this._detailsHeaderButton = new FlatsealDetailsButton(this._permissions);
        this._startHeaderBox.add(this._detailsHeaderButton);
        this._resetHeaderButton = new FlatsealResetButton(this._permissions);
        this._endHeaderBox.add(this._resetHeaderButton);

        const detailsActionButton = new FlatsealDetailsButton(this._permissions);
        this._startActionBox.add(detailsActionButton);
        const resetActionButton = new FlatsealResetButton(this._permissions);
        this._endActionBox.add(resetActionButton);

        this._undoPopup = new FlatsealUndoPopup(this._permissions);
        this._undoPopupBox.add(this._undoPopup);

        this._contentLeaflet.bind_property(
            'folded', this._backButton, 'visible', _bindReadFlags);
        this._permissionsHeaderBar.connect_after(
            'size-allocate', this._updateVisibility.bind(this));

        if (applications.length === 0 || permissions.length === 0)
            return;

        const iconTheme = Gtk.IconTheme.get_default();

        applications.forEach(app => {
            iconTheme.append_search_path(app.appThemePath);
            const row = new FlatsealApplicationRow(app.appId, app.appName, app.appIconName);
            this._applicationsListBox.add(row);
        });

        this._appInfoViewer = new FlatsealAppInfoViewer();
        this._appInfoViewer.show();
        this._appInfoGroup.add(this._appInfoViewer);
        this._contentLeaflet.bind_property(
            'folded', this._appInfoViewer, 'compact', _bindReadFlags);

        let lastGroup = '';
        let lastPrefsGroup;

        permissions.forEach(p => {
            let row;
            let property = 'text';

            if (p.type === 'path') {
                row = new FlatsealPermissionEntryRow(
                    p.description,
                    p.permission,
                    p.value,
                    FlatsealPathRow,
                    'folder-new-symbolic');
            } else if (p.type === 'relativePath') {
                row = new FlatsealPermissionEntryRow(
                    p.description,
                    p.permission,
                    p.value,
                    FlatsealRelativePathRow,
                    'folder-new-symbolic');
            } else if (p.type === 'variable') {
                row = new FlatsealPermissionEntryRow(
                    p.description,
                    p.permission,
                    p.value,
                    FlatsealVariableRow,
                    'list-add-symbolic');
            } else if (p.type === 'bus') {
                row = new FlatsealPermissionEntryRow(
                    p.description,
                    p.permission,
                    p.value,
                    FlatsealBusNameRow,
                    'list-add-symbolic');
            } else if (p.type === 'portal') {
                property = 'state';
                row = new FlatsealPermissionPortalRow(
                    p.description,
                    p.permission,
                    p.value,
                    p.portalTable,
                    p.portalId);
            } else {
                property = 'state';
                row = new FlatsealPermissionSwitchRow(
                    p.description,
                    p.permission,
                    p.value);
            }

            const context = row.get_style_context();
            context.add_class(p.groupStyle);

            if (p.groupStyle !== lastGroup) {
                const groupRow = new Handy.PreferencesGroup();
                groupRow.set_title(p.groupTitle);
                groupRow.set_description(p.groupDescription);
                groupRow.show();
                this._permissionsBox.add(groupRow);
                lastGroup = p.groupStyle;
                lastPrefsGroup = groupRow;
            }

            row.sensitive = p.supported;
            lastPrefsGroup.add(row);
            this._permissions.bind_property(p.property, row.content, property, _bindFlags);
        });

        this.connect('delete-event', this._saveSettings.bind(this));
        this.connect('destroy', this._shutdown.bind(this));

        this._permissionsStack.visibleChildName = 'withPermissionsPage';
        this._applicationsStack.visibleChildName = 'withApplicationsPage';

        const row = this._applicationsListBox.get_row_at_index(0);
        this._applicationsListBox.select_row(row);
        this._update(false);

        this._applicationsListBox.connect('row-selected', this._update.bind(this));
        this._applicationsListBox.set_filter_func(this._filter.bind(this));

        this._applicationsSearchEntry.connect('stop-search', this._cancel.bind(this));
        this._applicationsSearchEntry.connect('search-changed', this._invalidate.bind(this));
        this._applicationsSearchButton.connect('toggled', this._updateSearch.bind(this));
        this._applicationsSearchButton.bind_property(
            'active', this._applicationsSearchRevealer, 'reveal-child', _bindFlags);

        this._showApplications();
        this._backButton.set_sensitive(true);
        this._backButton.connect('clicked', this._showApplications.bind(this));
    }

    _shutdown() {
        this._permissions.shutdown();
    }

    _saveSettings() {
        this._settings.saveWindowState(this);
    }

    _update(switchPage = true) {
        const row = this._applicationsListBox.get_selected_row();
        this._permissions.appId = row.appId;
        this._permissionsHeaderBar.set_title(row.appName);
        this._appInfoViewer.appId = row.appId;
        this._undoPopup.close();
        if (switchPage)
            this._showPermissions();
    }

    _updateVisibility(window, allocation) {
        const visible = allocation.width <= ACTION_BAR_THRESHOLD;

        this._detailsHeaderButton.visible = !visible;
        this._resetHeaderButton.visible = !visible;

        this._actionBar.visible = visible;
    }

    _updateSearch() {
        if (this._applicationsSearchButton.active)
            this._applicationsSearchEntry.grab_focus();
        else
            this._applicationsSearchEntry.set_text('');
    }

    _filter(row) {
        const text = this._applicationsSearchEntry.get_text();
        if (text.length === 0)
            return true;

        const subString = text.toLowerCase();

        return (
            row.appId.toLowerCase().includes(subString) ||
            row.appName.toLowerCase().includes(subString)
        );
    }

    _invalidate() {
        this._applicationsListBox.invalidate_filter();
    }

    _cancel() {
        this._applicationsSearchEntry.set_text('');
    }

    _showApplications() {
        this._contentLeaflet.set_visible_child_name('applications');
        this._backButton.active = false;
    }

    _showPermissions() {
        this._contentLeaflet.set_visible_child_name('permissions');
    }
});
