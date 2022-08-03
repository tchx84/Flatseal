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

const {GObject, Gtk, Gdk, Gio, Adw} = imports.gi;

const {FlatsealWindow} = imports.widgets.window;
const {FlatsealAboutDialog} = imports.widgets.aboutDialog;
const {FlatsealDocsViewer} = imports.widgets.docsViewer;
const {FlatsealShortcutsWindow} = imports.widgets.shortcutsWindow;

var FlatsealApplication = GObject.registerClass({
    GTypeName: 'FlatsealApplication',
}, class FlatsealApplication extends Gtk.Application {
    _init() {
        super._init({
            application_id: 'com.github.tchx84.Flatseal',
            flags: Gio.ApplicationFlags.FLAGS_NONE,
        });

        this._window = null;
    }

    _displayHelp() {
        Gio.AppInfo.launch_default_for_uri('https://github.com/tchx84/flatseal', null);
    }

    _displayDocumentation() {
        const viewer = new FlatsealDocsViewer(this._window);
        viewer.present();
    }

    _displayAbout() {
        const dialog = new FlatsealAboutDialog({transient_for: this._window, modal: true});
        dialog.present();
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
        this.set_accels_for_action('app.shortcuts', ['<Primary>question']);
        this.set_accels_for_action('app.quit', ['<Primary>q']);
    }

    vfunc_activate() {
        if (this._window === null)
            this._window = new FlatsealWindow(this);

        this._window.present();
    }

    vfunc_startup() {
        super.vfunc_startup();
        Adw.init();
        this._setupActions();
    }
});
