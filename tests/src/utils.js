imports.gi.versions.Gtk = '3.0';

const {gettext} = imports;

const {Gio, GLib, Gtk} = imports.gi;


function setup() {
    Gtk.init(null);

    /* XXX this shouldn't be needed */
    const format = imports.format;
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


function getValueFromService(table, id, appId) {
    const {PermissionsIface} = imports.models.portals;
    const Proxy = Gio.DBusProxy.makeProxyWrapper(PermissionsIface);

    const proxy = new Proxy(
        Gio.DBus.session,
        GLib.getenv('FLATSEAL_PORTAL_BUS_NAME'),
        '/org/freedesktop/impl/portal/PermissionStore');

    const [appIds] = proxy.LookupSync(table, id);
    const value = appId in appIds && appIds[appId][0] === 'yes';

    return value;
}
