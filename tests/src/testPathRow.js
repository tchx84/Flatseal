/* eslint max-len: */

/* testPathRow.js
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

const {setup} = imports.utils;
setup();

const {FlatsealPathRow, mode, validity} = imports.widgets.pathRow;


describe('FlatsealPathRow', function() {
    var row;

    beforeEach(function() {
        row = new FlatsealPathRow();
    });

    it('starts empty', function() {
        expect(row.text).toEqual('');
    });

    it('processes path correctly', function() {
        const text = 'home:ro';
        row.text = text;

        expect(row.text).toEqual(text);
    });

    it('sets ready-only style class', function() {
        row.text = 'home:ro';
        const context = row.get_style_context();

        expect(context.has_class(mode.READONLY)).toBe(true);
        expect(context.has_class(mode.READWRITE)).toBe(false);
        expect(context.has_class(mode.CREATE)).toBe(false);
    });

    it('sets ready-write style class', function() {
        row.text = 'home:rw';
        const context = row.get_style_context();

        expect(context.has_class(mode.READONLY)).toBe(false);
        expect(context.has_class(mode.READWRITE)).toBe(true);
        expect(context.has_class(mode.CREATE)).toBe(false);
    });

    it('sets ready-write style class (default)', function() {
        row.text = 'home';
        const context = row.get_style_context();

        expect(context.has_class(mode.READONLY)).toBe(false);
        expect(context.has_class(mode.READWRITE)).toBe(true);
        expect(context.has_class(mode.CREATE)).toBe(false);
    });

    it('sets create style class', function() {
        row.text = 'home:create';
        const context = row.get_style_context();

        expect(context.has_class(mode.READONLY)).toBe(false);
        expect(context.has_class(mode.READWRITE)).toBe(false);
        expect(context.has_class(mode.CREATE)).toBe(true);
    });

    function _handles(description, path, _mode) {
        it(`handles ${description} paths (${_mode ? _mode : 'default'})`, function() {
            row.text = `${path}${_mode}`;
            const context = row.get_style_context();

            expect(context.has_class(validity.VALID)).toBe(true);
            expect(context.has_class(validity.NOTVALID)).toBe(false);
        });
    }
    _handles('absolute', '/home/.test', '');
    _handles('absolute', '/home/.test', ':ro');
    _handles('absolute', '/home/.test', ':rw');
    _handles('absolute', '/home/.test', ':create');
    _handles('relative', '~/.test', '');
    _handles('relative', '~/.test', ':ro');
    _handles('relative', '~/.test', ':rw');
    _handles('relative', '~/.test', ':create');
    _handles('relative', '~/.local/share/Folder/Games/common/Console Classics/uncompressed GAMEs/Old_Game_wVersion3.bin', ':ro');
    _handles('relative', '!~/.TelegramDesktop', '');
    _handles('token-based', 'home/.test', '');
    _handles('token-based', 'home/.test', ':ro');
    _handles('token-based', 'home/.test', ':rw');
    _handles('token-based', 'home/.test', ':create');
    _handles('token-based', 'xdg-download/Telegram Desktop:create', '');
    _handles('token-based', '!xdg-download', '');
    _handles('token-based', '!xdg-download', ':reset');

    function _catches(description, path, _mode) {
        it(`catches ${description} paths (${_mode ? _mode : 'default'})`, function() {
            row.text = `${path}${_mode}`;
            const context = row.get_style_context();

            expect(context.has_class(validity.VALID)).toBe(false);
            expect(context.has_class(validity.NOTVALID)).toBe(true);
        });
    }

    _catches('not-valid absolute', '/', '');
    _catches('not-valid relative', '~/', '');
    _catches('not-valid absolute', '/home/ .test ', '');
    _catches('not-valid relative', '~/ .test ', '');
    _catches('not-valid token-based', 'home ', ':ro');
    _catches('not-valid token-based', 'home/', '');
    _catches('not-valid token-based', 'home-non-valid', '');
    _catches('not-valid token-based', 'jome/.test ', '');
    _catches('not-valid mode', 'home', ':');
    _catches('not-valid mode', 'home', ':not');
    _catches('not-valid negation', '!!~/.TelegramDesktop', '');
    _catches('not-valid negation', '!~/.TelegramDesktop', ':');
    _catches('not-valid negation', '!~/.TelegramDesktop', ':ro');
});
