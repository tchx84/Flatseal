/* applications.js
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

/* exported FlatpakApplicationsModel getDefault */

const {GObject, GLib, Gio, AppStream} = imports.gi;

const {info} = imports.models;

const SIGNAL_DELAY = 2500;
const TARGET_EVENTS = [
    Gio.FileMonitorEvent.CHANGES_DONE_HINT,
    Gio.FileMonitorEvent.DELETED,
];

var FlatpakApplicationsModel = GObject.registerClass({
    GTypeName: 'FlatpakApplicationsModel',
    Signals: {
        changed: {},
    },
}, class FlatpakApplicationsModel extends GObject.Object {
    _init() {
        super._init({});
        this._setup();
    }

    _setup() {
        this._paths = null;
        this._info = info.getDefault();
        this._monitors = [];
        this._changedDelayHandlerId = 0;

        this._getInstallationsPaths().forEach(path => {
            const file = Gio.File.new_for_path(GLib.build_filenamev([path, 'app']));

            try {
                const monitor = file.monitor_directory(Gio.FileMonitorFlags.NONE, null);
                monitor.connect('changed', this._changedDelayed.bind(this));
                this._monitors.push(monitor);
            } catch (err) {
                logError(err);
            }
        });
    }

    _changedDelayed(monitor, file, other_file, event) {
        if (!TARGET_EVENTS.includes(event))
            return;

        if (this._changedDelayHandlerId !== 0)
            GLib.Source.remove(this._changedDelayHandlerId);

        this._changedDelayHandlerId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT, SIGNAL_DELAY, this._emitChanged.bind(this));
    }

    _emitChanged() {
        this.emit('changed');
        this._changedDelayHandlerId = 0;
        return GLib.SOURCE_REMOVE;
    }

    static _getSystemPath() {
        const systemPath = GLib.getenv('FLATPAK_SYSTEM_DIR');
        if (systemPath)
            return systemPath;

        return GLib.build_filenamev([
            GLib.DIR_SEPARATOR_S, 'var', 'lib', 'flatpak',
        ]);
    }

    _getUserPath() {
        const userPath = GLib.getenv('FLATPAK_USER_DIR');
        if (userPath)
            return userPath;

        let userDataDir = GLib.get_user_data_dir();
        if (this._info.getVersion() !== null)
            userDataDir = GLib.getenv('HOST_XDG_DATA_HOME');

        if (!userDataDir) {
            userDataDir = GLib.build_filenamev([
                GLib.get_home_dir(), '.local', 'share',
            ]);
        }

        return GLib.build_filenamev([userDataDir, 'flatpak']);
    }

    _getConfigPath() {
        let configPath = GLib.getenv('FLATPAK_CONFIG_DIR');
        if (configPath)
            return configPath;

        configPath = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'etc', 'flatpak']);
        if (this._info.getVersion() !== null) {
            configPath = GLib.build_filenamev([
                GLib.DIR_SEPARATOR_S, 'run', 'host', 'etc', 'flatpak',
            ]);
        }

        return configPath;
    }

    static _parseCustomInstallation(path) {
        const installations = [];

        const keyFile = new GLib.KeyFile();
        keyFile.load_from_file(path, GLib.KeyFileFlags.NONE);

        const [groups] = keyFile.get_groups();
        groups.forEach(group => {
            const installation = {};

            try {
                installation['path'] = keyFile.get_value(group, 'Path');
            } catch (err) {
                return;
            }

            try {
                installation['priority'] = keyFile.get_value(group, 'Priority');
            } catch (err) {
                installation['priority'] = 0;
            }

            installations.push(installation);
        });

        return installations;
    }

    _getCustomInstallationsPaths() {
        let installations = [];

        const configPath = GLib.build_filenamev([
            this._getConfigPath(),
            'installations.d',
        ]);

        if (GLib.access(configPath, 0) !== 0)
            return installations;

        const directory = Gio.File.new_for_path(configPath);
        const enumerator = directory.enumerate_children('*', Gio.FileQueryInfoFlags.NONE, null);
        let fileInfo = enumerator.next_file(null);

        while (fileInfo !== null) {
            const file = enumerator.get_child(fileInfo);
            installations = [
                ...installations,
                ...this.constructor._parseCustomInstallation(file.get_path()),
            ];
            fileInfo = enumerator.next_file(null);
        }

        return installations
            .sort((a, b) => b.priority - a.priority)
            .map(e => e.path);
    }

    _getInstallationsPaths() {
        if (this._paths !== null)
            return this._paths;

        /* Installation priority is handled by this list order */
        this._paths = this._getCustomInstallationsPaths();
        this._paths.unshift(this._getUserPath());
        this._paths.push(this.constructor._getSystemPath());

        return this._paths;
    }

    _getBundlePathForAppId(appId) {
        return this._getInstallationsPaths()
            .map(p => GLib.build_filenamev([p, 'app', appId, 'current', 'active']))
            .find(p => GLib.access(p, 0) === 0);
    }

    _getIconThemePathForAppId(appId) {
        return GLib.build_filenamev([
            this._getBundlePathForAppId(appId), 'export', 'share', 'icons',
        ]);
    }

    /* XXX this only covers cases that follow the flathub convention */
    static _isBaseApp(appId) {
        return appId.endsWith('.BaseApp');
    }

    _getApplicationsForPath(path) {
        const list = [];

        if (GLib.access(path, 0) !== 0)
            return list;

        const directory = Gio.File.new_for_path(path);
        const enumerator = directory.enumerate_children('*', Gio.FileQueryInfoFlags.NONE, null);
        let fileInfo = enumerator.next_file(null);

        while (fileInfo !== null) {
            const file = enumerator.get_child(fileInfo);
            const appId = GLib.path_get_basename(file.get_path());
            const activePath = GLib.build_filenamev([file.get_path(), 'current', 'active']);

            if (!this.constructor._isBaseApp(appId) && GLib.access(activePath, 0) === 0)
                list.push(appId);

            fileInfo = enumerator.next_file(null);
        }
        return list;
    }

    static _getApproximateNameForAppId(appId) {
        const name = appId.split('.').pop();
        return name.replace(/^\w/, c => c.toUpperCase());
    }

    getMetadataForAppId(appId) {
        const data = {
            runtime: _('Unknown'),
        };

        const group = 'Application';
        const path = this.getMetadataPathForAppId(appId);

        if (GLib.access(path, 0) !== 0)
            return data;

        const keyFile = new GLib.KeyFile();
        keyFile.load_from_file(path, 0);

        try {
            data.runtime = keyFile.get_value(group, 'runtime');
        } catch (err) {
            data.runtime = '';
        }

        return data;
    }

    getDesktopForAppData(appdata) {
        const desktop = {
            icon: 'application-x-executable-symbolic',
        };

        const path = GLib.build_filenamev([
            this._getBundlePathForAppId(appdata.appId),
            'export', 'share', 'applications', appdata.launchable,
        ]);

        const file = Gio.File.new_for_path(path);
        if (!file.query_exists(null))
            return desktop;

        const metadata = new AppStream.Metadata();
        try {
            metadata.parse_file(file, AppStream.FormatKind.DESKTOP_ENTRY);
        } catch (err) {
            return desktop;
        }

        const component = metadata.get_component();
        const icon = component.get_icon_stock();
        if (icon === null)
            return desktop;

        const iconName = icon.get_name();
        if (iconName !== null)
            desktop.icon = iconName;

        return desktop;
    }

    getAppDataForAppId(appId) {
        const appdata = {
            appId: appId,
            name: this.constructor._getApproximateNameForAppId(appId),
            author: _('Unknown'),
            version: _('Unknown'),
            date: _('Unknown'),
            launchable: `${appId}.desktop`,
        };

        const bundlePath = this._getBundlePathForAppId(appId);

        let path = GLib.build_filenamev([
            bundlePath, 'files', 'share', 'appdata', `${appId}.appdata.xml`,
        ]);

        if (!GLib.file_test(path, GLib.FileTest.EXISTS)) {
            path = GLib.build_filenamev([
                bundlePath, 'files', 'share', 'metainfo', `${appId}.metainfo.xml`,
            ]);

            if (!GLib.file_test(path, GLib.FileTest.EXISTS))
                return appdata;
        }

        const file = Gio.File.new_for_path(path);
        const metadata = new AppStream.Metadata();
        try {
            metadata.parse_file(file, AppStream.FormatKind.XML);
        } catch (err) {
            return appdata;
        }

        const component = metadata.get_component();

        if (component.get_name())
            appdata.name = component.get_name();

        const developer = component.get_developer();
        if (developer && developer.get_name())
            appdata.author = developer.get_name();

        const launchable = component.get_launchable(AppStream.LaunchableKind.DESKTOP_ID);
        if (launchable && launchable.get_entries())
            [appdata.launchable] = launchable.get_entries();

        const releaselist = component.get_releases_plain();
        if (!releaselist)
            return appdata;
        const [release] = releaselist.get_entries();
        if (!release)
            return appdata;

        if (release.get_version() !== null)
            appdata.version = `${release.get_version()}`;

        if (release.get_timestamp() !== null) {
            const ts = release.get_timestamp();
            const date = new Date(ts * 1000);
            appdata.date = date.toISOString().substring(0, 10);
        }

        return appdata;
    }

    getAll() {
        const installations = this._getInstallationsPaths();
        let applications = [];

        installations.forEach(path => {
            const app = GLib.build_filenamev([path, 'app']);
            applications = [...applications, ...this._getApplicationsForPath(app)];
        });

        const union = new Set(applications);
        const list = [...union];

        list.sort();

        return list.map(appId => {
            const appdata = this.getAppDataForAppId(appId);
            const desktop = this.getDesktopForAppData(appdata);

            return {
                appId: appId,
                appThemePath: this._getIconThemePathForAppId(appId),
                appName: appdata.name,
                appIconName: desktop.icon,
            };
        });
    }

    getMetadataPathForAppId(appId) {
        return GLib.build_filenamev([this._getBundlePathForAppId(appId), 'metadata']);
    }

    get userPath() {
        return this._getUserPath();
    }

    shutdown() {
        if (this._changedDelayHandlerId !== 0)
            GLib.Source.remove(this._changedDelayHandlerId);
        this._changedDelayHandlerId = 0;

        this._monitors.forEach(monitor => {
            monitor.cancel();
        });
        this._monitors = [];
    }

    reload() {
        this.shutdown();
        this._setup();
    }
});


var getDefault = (function() {
    let instance;
    return function() {
        if (typeof instance === 'undefined')
            instance = new FlatpakApplicationsModel();
        return instance;
    };
}());
