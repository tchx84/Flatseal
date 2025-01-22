/* exported FlatsealApplication */
/* eslint class-methods-use-this: */

/* application.js
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

const {GObject, Gtk, Gio, GLib, Adw} = imports.gi;

const {FlatsealWindow} = imports.widgets.window;
const {showAboutDialog} = imports.widgets.aboutDialog;
const {FlatsealDocsViewer} = imports.widgets.docsViewer;
const {FlatsealShortcutsWindow} = imports.widgets.shortcutsWindow;

var FlatsealApplication = GObject.registerClass({
    GTypeName: 'FlatsealApplication',
}, class FlatsealApplication extends Adw.Application {
    _init() {
        super._init({
            application_id: 'com.github.tchx84.Flatseal',
            flags: Gio.ApplicationFlags.HANDLES_COMMAND_LINE,
            resource_base_path: '/com/github/tchx84/Flatseal/',
        });

        this._window = null;

        this.add_main_option(
            'show-app',
            null,
            GLib.OptionFlags.NONE,
            GLib.OptionArg.STRING,
            'A custom flag for my app',
            null);

        this.connect("command-line", this._cliArgHandler.bind(this));
    }

    _cliArgHandler(_app, gCommandLine) {
        this.vfunc_activate();
        try {
            const options = gCommandLine.get_options_dict();
            if (options.contains('show-app')) {
                const appId = options.lookup_value("show-app", null).get_string()[0];
                return this._window.showAppId(appId);
            }
        } catch (error) {
            logError(error);
            return 1;
        }
        return 0;
    }

    _displayHelp() {
        const launcher = new Gtk.UriLauncher();
        launcher.uri = 'https://github.com/tchx84/flatseal';
        launcher.launch(this._window, null, this._doDisplayHelp);
    }

    _doDisplayHelp(launcher, res) {
        try {
            launcher.launch_finish(res);
        } catch (err) {
            logError(err);
        }
    }

    _displayDocumentation() {
        const viewer = new FlatsealDocsViewer(this._window);
        viewer.present();
    }

    _displayAbout() {
        showAboutDialog(this._window);
    }

    _displayShortcuts() {
        const dialog = new FlatsealShortcutsWindow({transient_for: this._window});
        dialog.present();
    }

    _quit() {
        this._window._shutdown();
        this.quit();
    }

    _setupActions() {
        const help_action = new Gio.SimpleAction({name: 'help', state: null});
        help_action.connect('activate', this._displayHelp.bind(this));

        const documentation_action = new Gio.SimpleAction({name: 'documentation', state: null});
        documentation_action.connect('activate', this._displayDocumentation.bind(this));

        const shortcuts_action = new Gio.SimpleAction({name: 'shortcuts', state: null});
        shortcuts_action.connect('activate', this._displayShortcuts.bind(this));

        const about_action = new Gio.SimpleAction({name: 'about', state: null});
        about_action.connect('activate', this._displayAbout.bind(this));

        const quit_action = new Gio.SimpleAction({name: 'quit', state: null});
        quit_action.connect('activate', this._quit.bind(this));

        this.add_action(help_action);
        this.add_action(documentation_action);
        this.add_action(shortcuts_action);
        this.add_action(about_action);
        this.add_action(quit_action);

        this.set_accels_for_action('app.documentation', ['F1']);
        this.set_accels_for_action('app.shortcuts', ['<Control>question']);
        this.set_accels_for_action('app.quit', ['<Control>q']);
        this.set_accels_for_action('window.close', ['<Control>w']);
    }

    vfunc_activate() {
        if (this._window === null)
            this._window = new FlatsealWindow(this);

        this._window.present();
    }

    vfunc_startup() {
        super.vfunc_startup();
        this._setupActions();
    }
});
