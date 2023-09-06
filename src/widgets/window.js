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

const {GObject, GLib, Gtk, Adw} = imports.gi;

const {applications, permissions} = imports.models;

const {FlatsealAppInfoViewer} = imports.widgets.appInfoViewer;
const {FlatsealGlobalInfoViewer} = imports.widgets.globalInfoViewer;
const {FlatsealApplicationRow} = imports.widgets.applicationRow;
const {FlatsealGlobalRow} = imports.widgets.globalRow;
const {FlatsealPermissionEntryRow} = imports.widgets.permissionEntryRow;
const {FlatsealPermissionPortalRow} = imports.widgets.permissionPortalRow;
const {FlatsealPermissionSwitchRow} = imports.widgets.permissionSwitchRow;
const {FlatsealResetButton} = imports.widgets.resetButton;
const {FlatsealDetailsButton} = imports.widgets.detailsButton;
const {FlatsealPathRow} = imports.widgets.pathRow;
const {FlatsealRelativePathRow} = imports.widgets.relativePathRow;
const {FlatsealVariableRow} = imports.widgets.variableRow;
const {FlatsealBusNameRow} = imports.widgets.busNameRow;
const {FlatsealSettingsModel} = imports.models.settings;
const {isGlobalOverride} = imports.models.globalModel;

const _bindFlags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
const _bindReadFlags = GObject.BindingFlags.SYNC_CREATE;

const menuResource = '/com/github/tchx84/Flatseal/widgets/menu.ui';
const ACTION_BAR_BREAKPOINT = 540;
const APP_SELECTION_DELAY = 100;


var FlatsealWindow = GObject.registerClass({
    GTypeName: 'FlatsealWindow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/window.ui',
    InternalChildren: [
        'actionBar',
        'appInfoGroup',
        'applicationsSearchButton',
        'applicationsSearchBar',
        'applicationsSearchEntry',
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
        'permissionsTitle',
        'toastOverlay',
    ],
}, class FlatsealWindow extends Adw.ApplicationWindow {
    _init(application) {
        super._init({application});
        this._setup();
    }

    _setup() {
        const builder = Gtk.Builder.new_from_resource(menuResource);
        this._menuButton.set_menu_model(builder.get_object('menu'));

        this._settings = new FlatsealSettingsModel();
        this._settings.restoreWindowState(this);

        this._permissions = permissions.getDefault();
        this._applications = applications.getDefault();

        this._detailsHeaderButton = new FlatsealDetailsButton(this._permissions);
        this._startHeaderBox.append(this._detailsHeaderButton);
        this._resetHeaderButton = new FlatsealResetButton(this._permissions);
        this._endHeaderBox.append(this._resetHeaderButton);

        this._detailsActionButton = new FlatsealDetailsButton(this._permissions);
        this._startActionBox.append(this._detailsActionButton);
        this._resetActionButton = new FlatsealResetButton(this._permissions);
        this._endActionBox.append(this._resetActionButton);

        this._toast = new Adw.Toast();
        this._toast.title = _('Permissions have been reset');
        this._toast.button_label = _('_Undo');
        this._toast.timeout = 3;
        this._toast.connect('button-clicked', this._undoReset.bind(this));
        this._resetHandlerId = this._permissions.connect('reset', this._showToast.bind(this));

        this._failedToast = new Adw.Toast();
        this._failedToast.title = _('Can\'t load overrides due to wrong contents');
        this._failedToast.button_label = _('_Reset');
        this._failedToast.timeout = null;
        this._failedToast.connect('button-clicked', this._doReset.bind(this));
        this._permissions.connect('failed', this._showFailedToast.bind(this));

        this._contentLeaflet.bind_property(
            'folded', this._backButton, 'visible', _bindReadFlags);

        this._applicationsListBox.set_filter_func(this._filter.bind(this));
        this._applicationsListBox.set_sort_func(this._sort.bind(this));

        this._applicationsDelayHandlerId = 0;
        this._applicationsListBox.connect('row-selected', this._selectApplicationDelayed.bind(this));
        this._applicationsListBox.connect('row-activated', this._activateApplication.bind(this));

        this._applicationsSearchEntry.connect('activate', this._selectSearch.bind(this));
        this._applicationsSearchEntry.connect('search-changed', this._resetSearch.bind(this));

        this._applicationsSearchButton.bind_property(
            'active', this._applicationsSearchBar, 'search-mode-enabled', _bindFlags);

        this._setupApplications();
        this._setupPermissions();
        this._updatePermissions();

        this._showApplications();
        this._backButton.set_sensitive(true);
        this._backButton.connect('clicked', this._showApplications.bind(this));

        this._applicationsSearchBar.set_key_capture_widget(this.root);
    }

    _setupApplications() {
        for (const row of Array.from(this._applicationsListBox)) {
            if (row instanceof Adw.ActionRow)
                this._applicationsListBox.remove(row);
        }

        /* Find all available applications */
        const allApplications = this._applications.getAll();

        if (allApplications.length === 0) {
            this._applicationsListBox.unselect_all();
            this._permissionsStack.visibleChildName = 'withNoPermissionsPage';
            return;
        }

        /* Add rows for every application */
        let selectedRow = null;
        const iconTheme = Gtk.IconTheme.get_for_display(this.get_display());

        allApplications.forEach(app => {
            iconTheme.add_search_path(app.appThemePath);
            const row = new FlatsealApplicationRow(app.appId, app.appName, app.appIconName);
            this._applicationsListBox.append(row);

            if (app.appId === this._settings.getSelectedAppId())
                selectedRow = row;
        });

        /* Add row for global overrides */
        this._globalRow = new FlatsealGlobalRow();
        this._applicationsListBox.append(this._globalRow);

        /* Select after the list has been sorted */
        if (selectedRow === null)
            selectedRow = this._applicationsListBox.get_row_at_index(1);

        /* XXX Switch to ListBox.scroll_to when available */
        selectedRow.grab_focus();

        this._applicationsListBox.select_row(selectedRow);

        /* Enable permissions view only if there's applications */
        this._permissionsStack.visibleChildName = 'withPermissionsPage';
    }

    _setupPermissions() {
        const allPermissions = this._permissions.getAll();

        if (allPermissions.length === 0)
            return;

        /* Set up applications information viewer */
        this._appInfoViewer = new FlatsealAppInfoViewer();
        this._appInfoGroup.add(this._appInfoViewer);
        this._contentLeaflet.bind_property(
            'folded', this._appInfoViewer, 'compact', _bindReadFlags);

        this._globalInfoViewer = new FlatsealGlobalInfoViewer();
        this._appInfoGroup.add(this._globalInfoViewer);
        this._contentLeaflet.bind_property(
            'folded', this._globalInfoViewer, 'compact', _bindReadFlags);

        let lastGroup = '';
        let lastPrefsGroup;

        allPermissions.forEach(p => {
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
                property = 'active';
                row = new FlatsealPermissionSwitchRow(
                    p.description,
                    p.permission,
                    p.value);
            }

            const context = row.get_style_context();
            context.add_class(p.groupStyle);

            if (p.groupStyle !== lastGroup) {
                const groupRow = new Adw.PreferencesGroup();
                groupRow.set_title(p.groupTitle);
                groupRow.set_description(p.groupDescription);
                this._permissionsBox.add(groupRow);
                lastGroup = p.groupStyle;
                lastPrefsGroup = groupRow;
            }

            row.supported = p.supported;
            lastPrefsGroup.add(row);
            this._portalsGroup = lastPrefsGroup;

            this._permissions.bind_property(p.property, row.content, property, _bindFlags);

            if (!row.status)
                return;

            this._permissions.bind_property(p.statusProperty, row.status, 'status', _bindFlags);
        });
    }

    _shutdown() {
        this._permissions.shutdown();
        this._applications.shutdown();
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

    _updatePermissionsPane(row) {
        if (row === null) {
            this._permissionsTitle.title = '';
            this._resetActionButton.sensitive = false;
            this._resetHeaderButton.sensitive = false;
            this._detailsHeaderButton.disable();
            this._detailsActionButton.disable();
        } else if (isGlobalOverride(row.appId)) {
            this._permissionsTitle.title = row.appName;
            this._appInfoViewer.visible = false;
            this._globalInfoViewer.visible = true;
            this._portalsGroup.visible = false;
            this._detailsHeaderButton.disable();
            this._detailsActionButton.disable();
        } else {
            this._permissionsTitle.title = row.appName;
            this._appInfoViewer.appId = row.appId;
            this._appInfoViewer.visible = true;
            this._globalInfoViewer.visible = false;
            this._portalsGroup.visible = true;
            this._detailsHeaderButton.enable();
            this._detailsActionButton.enable();
        }
    }

    _updatePermissions() {
        this._failedToast.dismiss();
        const row = this._applicationsListBox.get_selected_row();
        this._updatePermissionsPane(row);

        const appId = row ? row.appId : '';
        this._permissions.appId = appId;
        this._settings.setSelectedAppId(appId);
        this._toast.dismiss();

        this._applicationsDelayHandlerId = 0;
        return GLib.SOURCE_REMOVE;
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
        if (isGlobalOverride(row1.appId) || isGlobalOverride(row2.appId))
            return 1;

        const name1 = row1.appName.toLowerCase();
        const name2 = row2.appName.toLowerCase();

        if (name1 === name2)
            return 0;
        if (name1 < name2)
            return -1;

        return 1;
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
    }

    _showPermissions() {
        this._contentLeaflet.set_visible_child_name('permissions');
    }

    _showToast() {
        this._toastOverlay.add_toast(this._toast);
    }

    _showFailedToast() {
        this._toastOverlay.add_toast(this._failedToast);
    }

    _doReset() {
        GObject.signal_handler_block(this._permissions, this._resetHandlerId);

        this._permissions.reset();

        GObject.signal_handler_unblock(this._permissions, this._resetHandlerId);
    }

    _undoReset() {
        this._permissions.undo();
    }

    /* XXX switch to Breakpoints API when available */
    vfunc_size_allocate(width, height, baseline) {
        const visible = width <= ACTION_BAR_BREAKPOINT;

        this._detailsHeaderButton.visible = !visible;
        this._resetHeaderButton.visible = !visible;
        this._actionBar.visible = visible;

        return super.vfunc_size_allocate(width, height, baseline);
    }

    vfunc_close_request() {
        this._settings.saveWindowState(this);
        this._shutdown();
        return super.vfunc_close_request();
    }
});
