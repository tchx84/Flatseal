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
const {Leaflet, TitleBar, SwipeGroup, Clamp} = imports.gi.Handy;

const {FlatpakApplicationsModel} = imports.models.applications;
const {FlatpakPermissionsModel} = imports.models.permissions;

const {FlatsealAppInfoViewer} = imports.widgets.appInfoViewer;
const {FlatsealApplicationRow} = imports.widgets.applicationRow;
const {FlatsealGroupRow} = imports.widgets.groupRow;
const {FlatsealPermissionEntryRow} = imports.widgets.permissionEntryRow;
const {FlatsealPermissionSwitchRow} = imports.widgets.permissionSwitchRow;
const {FlatsealResetButton} = imports.widgets.resetButton;
const {FlatsealDetailsButton} = imports.widgets.detailsButton;
const {FlatsealPathRow} = imports.widgets.pathRow;
const {FlatsealRelativePathRow} = imports.widgets.relativePathRow;
const {FlatsealUndoPopup} = imports.widgets.undoPopup;
const {FlatsealVariableRow} = imports.widgets.variableRow;
const {FlatsealBusNameRow} = imports.widgets.busNameRow;

const _bindFlags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
const _bindReadFlags = GObject.BindingFlags.SYNC_CREATE;
const _bindInvertFlags = _bindReadFlags | GObject.BindingFlags.INVERT_BOOLEAN;

const menuResource = '/com/github/tchx84/Flatseal/widgets/menu.ui';


var FlatsealWindow = GObject.registerClass({
    GTypeName: 'FlatsealWindow',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/window.ui',
    InternalChildren: [
        'actionBar',
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
        'headerLeaflet',
        'contentLeaflet',
        'swipeGroup',
        'undoPopupBox',
    ],
}, class FlatsealWindow extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({application});
        this._setup();
        this.maximize();
    }

    _setup() {
        const builder = Gtk.Builder.new_from_resource(menuResource);
        this._menuButton.set_menu_model(builder.get_object('menu'));

        this._permissions = new FlatpakPermissionsModel();
        this._applications = new FlatpakApplicationsModel();

        const applications = this._applications.getAll();
        const permissions = this._permissions.getAll();

        const detailsHeaderButton = new FlatsealDetailsButton(this._permissions);
        this._startHeaderBox.add(detailsHeaderButton);
        const resetHeaderButton = new FlatsealResetButton(this._permissions);
        this._endHeaderBox.add(resetHeaderButton);

        const detailsActionButton = new FlatsealDetailsButton(this._permissions);
        this._startActionBox.add(detailsActionButton);
        const resetActionButton = new FlatsealResetButton(this._permissions);
        this._endActionBox.add(resetActionButton);

        this._undoPopup = new FlatsealUndoPopup(this._permissions);
        this._undoPopupBox.add(this._undoPopup);

        this._contentLeaflet.bind_property(
            'folded', this._backButton, 'visible', _bindReadFlags);
        this._contentLeaflet.bind_property(
            'folded', this._actionBar, 'visible', _bindReadFlags);
        this._contentLeaflet.bind_property(
            'folded', detailsHeaderButton, 'visible', _bindInvertFlags);
        this._contentLeaflet.bind_property(
            'folded', resetHeaderButton, 'visible', _bindInvertFlags);

        this._layoutNotifyId = 0;
        this._updateControlsPlacement();
        this._headerLeaflet.connect('notify::folded', this._updateControlsPlacement.bind(this));

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
        this._permissionsBox.add(this._appInfoViewer);
        this._contentLeaflet.bind_property(
            'folded', this._appInfoViewer, 'compact', _bindReadFlags);

        var lastGroup = '';

        permissions.forEach(p => {
            var row;
            var property = 'text';

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
                const groupRow = new FlatsealGroupRow(p.groupTitle, p.groupDescription);
                this._permissionsBox.add(groupRow);
                lastGroup = p.groupStyle;
            }

            row.sensitive = p.supported;
            this._permissionsBox.add(row);
            this._permissions.bind_property(p.property, row.content, property, _bindFlags);
        });

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

        this._showApplications();
        this._backButton.set_sensitive(true);
        this._backButton.connect('clicked', this._showApplications.bind(this));
    }

    _shutdown() {
        this._permissions.shutdown();
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

    _filter(row) {
        const text = this._applicationsSearchEntry.get_text();
        if (text.length === 0)
            return true;

        return row.appId.toLowerCase().includes(text.toLowerCase());
    }

    _invalidate() {
        this._applicationsListBox.invalidate_filter();
    }

    _cancel() {
        this._applicationsSearchEntry.set_text('');
    }

    _showApplications() {
        this._headerLeaflet.set_visible_child_name('applications');
        this._contentLeaflet.set_visible_child_name('applications');
        this._backButton.active = false;
    }

    _showPermissions() {
        this._headerLeaflet.set_visible_child_name('permissions');
        this._contentLeaflet.set_visible_child_name('permissions');
    }

    _updateControlsPlacement() {
        const settings = Gtk.Settings.get_default();
        if (this._layoutNotifyId !== 0)
            settings.disconnect(this._layoutNotifyId);
        this._layoutNotifyId = settings.connect(
            'notify::gtk-decoration-layout', this._updateControlsPlacement.bind(this));

        var showApplicationsButton = false;
        var showPermissionsButton = true;

        const closeButtonOnLeft = settings.gtk_decoration_layout.startsWith('close');
        if (closeButtonOnLeft) {
            showApplicationsButton = true;
            showPermissionsButton = false;
        }

        const isFolded = this._headerLeaflet.folded;
        if (isFolded) {
            showApplicationsButton = true;
            showPermissionsButton = true;
        }

        this._applicationsHeaderBar.show_close_button = showApplicationsButton;
        this._permissionsHeaderBar.show_close_button = showPermissionsButton;
    }
});
