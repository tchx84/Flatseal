imports.gi.versions.Gtk = '3.0';

const {Gio, GLib, Gtk} = imports.gi;


function setup() {
    Gtk.init(null);

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
