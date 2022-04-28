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

const {GObject, GLib, Gtk, Handy} = imports.gi;

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
const APP_SELECTION_DELAY = 100;


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
    Signals: {
        find: {
            flags: GObject.SignalFlags.RUN_LAST | GObject.SignalFlags.ACTION,
        },
    },
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

        this._contentLeaflet.connect('notify::visible-child-name', this._focusContent.bind(this));
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

            if (!row.status)
                return;

            this._permissions.bind_property(p.statusProperty, row.status, 'status', _bindFlags);
        });

        this.connect('delete-event', this._saveSettings.bind(this));
        this.connect('destroy', this._shutdown.bind(this));

        this._permissionsStack.visibleChildName = 'withPermissionsPage';
        this._applicationsStack.visibleChildName = 'withApplicationsPage';

        this._applicationsListBox.set_filter_func(this._filter.bind(this));
        this._applicationsListBox.set_sort_func(this._sort.bind(this));

        /* select after the list has been sorted */
        const row = this._applicationsListBox.get_row_at_index(0);
        this._applicationsListBox.select_row(row);
        this._updatePermissions();

        this._applicationsDelayHandlerId = 0;
        this._applicationsListBox.connect('row-selected', this._selectApplicationDelayed.bind(this));
        this._applicationsListBox.connect('row-activated', this._activateApplication.bind(this));

        this._applicationsSearchEntry.connect('activate', this._selectSearch.bind(this));
        this._applicationsSearchEntry.connect('stop-search', this._cancelSearch.bind(this));
        this._applicationsSearchEntry.connect('search-changed', this._resetSearch.bind(this));

        this._applicationsSearchButton.bind_property(
            'active', this._applicationsSearchRevealer, 'reveal-child', _bindFlags);
        this._applicationsSearchButton.connect(
            'toggled', this._toggleSearchWithButton.bind(this));

        this.connect('find', this._enableSearchWithShortcut.bind(this));

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

    _selectApplicationDelayed() {
        if (this._applicationsDelayHandlerId !== 0)
            GLib.Source.remove(this._applicationsDelayHandlerId);

        this._applicationsDelayHandlerId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT, APP_SELECTION_DELAY, this._selectApplication.bind(this));
    }

    _activateApplication() {
        if (this._contentLeaflet.folded)
            this._showPermissions();
    }

    _selectApplication() {
        this._updatePermissions();
    }

    _updatePermissions() {
        const row = this._applicationsListBox.get_selected_row();
        this._permissions.appId = row.appId;
        this._permissionsHeaderBar.set_title(row.appName);
        this._appInfoViewer.appId = row.appId;
        this._undoPopup.close();

        this._applicationsDelayHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    _updateVisibility(window, allocation) {
        const visible = allocation.width <= ACTION_BAR_THRESHOLD;

        this._detailsHeaderButton.visible = !visible;
        this._resetHeaderButton.visible = !visible;

        this._actionBar.visible = visible;
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

    _sort(row1, row2) { // eslint-disable-line class-methods-use-this
        const name1 = row1.appName.toLowerCase();
        const name2 = row2.appName.toLowerCase();

        if (name1 === name2)
            return 0;
        if (name1 < name2)
            return -1;

        return 1;
    }

    _enableSearchWithShortcut() {
        this._applicationsSearchRevealer.reveal_child = true;
        this._applicationsSearchEntry.grab_focus();
    }

    _toggleSearchWithButton() {
        this._applicationsSearchEntry.set_text('');

        if (this._applicationsSearchButton.active)
            this._applicationsSearchEntry.grab_focus();
        else
            this._applicationsSearchButton.grab_focus();
    }

    _cancelSearch() {
        if (this._applicationsSearchEntry.get_text() === '')
            this._applicationsSearchRevealer.reveal_child = false;

        this._applicationsSearchEntry.set_text('');
    }

    _selectSearch() {
        const row = this._applicationsListBox.get_row_at_y(0);
        if (row === null)
            return;

        this._applicationsListBox.select_row(row);
        row.grab_focus();
    }

    _resetSearch() {
        this._applicationsListBox.invalidate_filter();
    }

    _showApplications() {
        this._contentLeaflet.set_visible_child_name('applications');
        this._backButton.active = false;
        this._focusOnApplications();
    }

    _showPermissions() {
        this._contentLeaflet.set_visible_child_name('permissions');
    }

    _focusOnApplications() {
        const row = this._applicationsListBox.get_selected_row();
        if (row !== null)
            row.grab_focus();
    }

    _focusOnPermissions() {
        const [firstGroup] = this._permissionsBox.get_children();
        const [firstRow] = firstGroup.get_children();
        firstRow.grab_focus();
    }

    _focusContent() {
        if (this._contentLeaflet.visible_child_name === 'applications')
            this._focusOnApplications();
        else
            this._focusOnPermissions();
    }
});
