/* exported setup update has hasOnly hasInTotal startService
   stopService getValueFromService waitForService partialService */
/* eslint no-extend-native: */

/* utils.js
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

imports.gi.versions.Gtk = '3.0';

const {gettext} = imports;

const {Gio, GLib, Gtk} = imports.gi;


const TestPermissionStoreIface = `
<node xmlns:doc="http://www.freedesktop.org/dbus/1.0/doc.dtd">
    <interface name="org.freedesktop.impl.portal.PermissionStore">
        <method name="testPartialTable">
        </method>
    </interface>
</node>
`;


function setup() {
    Gtk.init(null);

    /* XXX this shouldn't be needed */
    const {format} = imports;
    String.prototype.format = format.format;

    window._ = gettext.gettext;

    const src = GLib.build_filenamev([
        GLib.get_current_dir(),
        'src',
        'com.github.tchx84.Flatseal.src.gresource',
    ]);

    const data = GLib.build_filenamev([
        GLib.get_current_dir(),
        'src',
        'com.github.tchx84.Flatseal.data.gresource',
    ]);

    Gio.Resource.load(src)._register();
    Gio.Resource.load(data)._register();

    imports.searchPath.unshift('resource:///com/github/tchx84/Flatseal/js');
}


function update() {
    while (Gtk.events_pending())
        Gtk.main_iteration();
}


function has(path, group, key, value) {
    const keyFile = new GLib.KeyFile();
    keyFile.load_from_file(path, 0);

    const [keys] = keyFile.get_keys(group);
    if (!keys.includes(key))
        return false;

    const values = keyFile.get_value(group, key);
    return values.split(';').indexOf(value) !== -1;
}


function hasOnly(path, group, key, value) {
    const keyFile = new GLib.KeyFile();
    keyFile.load_from_file(path, 0);

    const [keys] = keyFile.get_keys(group);
    const values = keyFile.get_value(group, key);
    const list = values.split(';');

    return keys.length === 1 && list.length === 1 && list.indexOf(value) !== -1;
}


function hasInTotal(path) {
    let count = 0;

    const keyFile = new GLib.KeyFile();
    keyFile.load_from_file(path, 0);

    const [groups] = keyFile.get_groups();

    groups.forEach(group => {
        const [keys] = keyFile.get_keys(group);

        keys.forEach(key => {
            const values = keyFile.get_value(group, key);
            count += values.split(';').length;
        });
    });

    return count;
}


function startService() {
    GLib.setenv(
        'FLATSEAL_PORTAL_BUS_NAME',
        'com.github.tchx84.Flatseal.PermissionStore',
        true);
    const service = GLib.build_filenamev([
        '..',
        'tests',
        'service.js',
    ]);
    window.service = Gio.Subprocess.new(['gjs', service], null);
}


function stopService() {
    window.service.force_exit();
}


function getValueFromService(table, id, allowed, appId) {
    const {PermissionsIface} = imports.models.portals;
    const Proxy = Gio.DBusProxy.makeProxyWrapper(PermissionsIface);

    const proxy = new Proxy(
        Gio.DBus.session,
        GLib.getenv('FLATSEAL_PORTAL_BUS_NAME'),
        '/org/freedesktop/impl/portal/PermissionStore');

    let appIds;
    try {
        [appIds] = proxy.LookupSync(table, id);
    } catch (err) {
        appIds = null;
    }

    // check if no entry in the permission store
    if (allowed === null && (appIds === null || !(appId in appIds)))
        return true;

    const value = appId in appIds && appIds[appId][0] === allowed;
    return value;
}

function waitForService() {
    const {PermissionsIface} = imports.models.portals;
    var version = null;

    do {
        GLib.usleep(1000000);

        const Proxy = Gio.DBusProxy.makeProxyWrapper(PermissionsIface);
        const proxy = new Proxy(
            Gio.DBus.session,
            GLib.getenv('FLATSEAL_PORTAL_BUS_NAME'),
            '/org/freedesktop/impl/portal/PermissionStore');
        version = proxy.version; // eslint-disable-line prefer-destructuring
    } while (version === null);
}

function partialService() {
    const Proxy = Gio.DBusProxy.makeProxyWrapper(TestPermissionStoreIface);

    const proxy = new Proxy(
        Gio.DBus.session,
        GLib.getenv('FLATSEAL_PORTAL_BUS_NAME'),
        '/org/freedesktop/impl/portal/PermissionStore');

    proxy.testPartialTableSync();
}
