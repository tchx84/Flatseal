/* exported FlatsealDocsViewer */

/* docsViewer.js
 *
 * Copyright 2021 Martin Abente Lahaye
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

const {Gio, GLib, GObject, Handy, WebKit2} = imports.gi;
const {WebView} = imports.gi.WebKit2; // eslint-disable-line no-unused-vars

const MAX_RESULTS = 10;

var FlatsealDocsViewer = GObject.registerClass({
    GTypeName: 'FlatsealDocsViewer',
    Template: 'resource:///com/github/tchx84/Flatseal/widgets/docsViewer.ui',
    InternalChildren: [
        'webview',
        'backButton',
        'forwardButton',
        'previousButton',
        'nextButton',
        'searchButton',
        'searchBar',
        'searchEntry',
    ],
}, class FlatsealDocsViewer extends Handy.ApplicationWindow {
    _init(props) {
        super._init(props);
        this._setup();
    }

    _setup() {
        const path = GLib.build_filenamev([
            imports.package.datadir,
            'help',
            'C',
            'flatseal',
            'index.html',
        ]);

        this._webview.load_uri(`file://${path}`);

        /* Force it to use browser history with inner anchors */
        this._webview.connect('notify::uri', this._load_uri.bind(this));

        /* Use system web browser for external urls */
        this._webview.connect('decide-policy', this._load_external_uri.bind(this));

        /* Update navigation buttons on every history change */
        this._webview.connect_after('load-changed', this._update_navigation.bind(this));
        this._backButton.connect('clicked', this._go_back.bind(this));
        this._forwardButton.connect('clicked', this._go_forward.bind(this));

        this._searchBar.connect('notify::search-mode-enabled', this._enable_search.bind(this));
        this._previousButton.connect('clicked', this._search_previous.bind(this));
        this._nextButton.connect('clicked', this._search_next.bind(this));
        this._searchEntry.connect('search-changed', this._update_search.bind(this));

        this._searchButton.bind_property(
            'active',
            this._searchBar,
            'search-mode-enabled',
            GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE);

        this.maximize();
    }

    _load_uri() {
        this._webview.load_uri(this._webview.uri);
    }

    _load_external_uri(webview, decision, type) { // eslint-disable-line class-methods-use-this
        if (type !== WebKit2.PolicyDecisionType.NAVIGATION_ACTION)
            return false;

        const uri = decision.get_request().get_uri();

        if (!uri.startsWith('file')) {
            Gio.AppInfo.launch_default_for_uri(uri, null);
            decision.ignore();
            return true;
        }

        return false;
    }

    _update_navigation() {
        this._backButton.sensitive = this._webview.can_go_back();
        this._forwardButton.sensitive = this._webview.can_go_forward();
    }

    _go_back() {
        this._webview.go_back();
    }

    _go_forward() {
        this._webview.go_forward();
    }

    _enable_search() {
        if (this._searchBar.search_mode_enabled) {
            this._findController = this._webview.get_find_controller();
            this._searchEntry.grab_focus();
        } else {
            this._findController.search_finish();
        }
    }

    _search_previous() {
        this._findController.search_previous();
    }

    _search_next() {
        this._findController.search_next();
    }

    _update_search() {
        this._findController.search(
            this._searchEntry.text,
            WebKit2.FindOptions.CASE_INSENSITIVE | WebKit2.FindOptions.WRAP_AROUND,
            MAX_RESULTS);
    }
});
