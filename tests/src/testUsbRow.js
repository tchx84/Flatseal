/* eslint max-len: */

/* testUsbRow.js
 *
 * Copyright 2026 Malika Odeny Asman
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

const {FlatsealUsbRow, validity} = imports.widgets.usbRow;


describe('FlatsealUsbRow', function() {
    var row;

    beforeEach(function() {
        row = new FlatsealUsbRow();
    });

    it('starts empty', function() {
        expect(row.text).toEqual('');
    });

    it('processes device correctly', function() {
        const text = 'vnd:0123';
        row.text = text;

        expect(row.text).toEqual(text);
    });

    function _handles(description, device) {
        it(`handles ${description}`, function() {
            row.text = device;
            const context = row.get_style_context();

            expect(context.has_class(validity.VALID)).toBe(true);
            expect(context.has_class(validity.NOTVALID)).toBe(false);
        });
    }

    _handles('all devices', 'all');
    _handles('vendor id', 'vnd:0123');
    _handles('vendor id (uppercase hex)', 'vnd:ABCD');
    _handles('vendor id (mixed hex)', 'vnd:aAbB');
    _handles('class and subclass id', 'cls:ff:01');
    _handles('class and subclass id (uppercase)', 'cls:AB:CD');
    _handles('class and wildcard subclass', 'cls:ff:*');
    _handles('vendor + device compound', 'vnd:0123+dev:4567');
    _handles('vendor + class compound', 'vnd:0123+cls:ab:cd');
    _handles('device before vendor compound', 'dev:4567+vnd:0123');
    _handles('vendor + device + class compound', 'vnd:0123+dev:4567+cls:ff:01');

    function _catches(description, device) {
        it(`catches ${description}`, function() {
            row.text = device;
            const context = row.get_style_context();

            expect(context.has_class(validity.VALID)).toBe(false);
            expect(context.has_class(validity.NOTVALID)).toBe(true);
        });
    }

    _catches('empty string', '');
    _catches('negated all devices', '!all');
    _catches('negated vendor id', '!vnd:0123');
    _catches('negated device id', '!dev:1234');
    _catches('negated class id', '!cls:ff:01');
    _catches('negated vendor + device compound', '!vnd:0123+dev:4567');
    _catches('standalone device id', 'dev:1234');
    _catches('device + class without vendor', 'dev:0123+cls:ff:01');
    _catches('vendor id with 3 hex digits', 'vnd:012');
    _catches('vendor id with 5 hex digits', 'vnd:01234');
    _catches('class id without subclass', 'cls:ff');
    _catches('class id with 1 hex digit', 'cls:f');
    _catches('class id with 3 hex digits in class part', 'cls:fff:01');
    _catches('class id with 4 hex digits', 'cls:0123');
    _catches('non-hex vendor id', 'vnd:XXXX');
    _catches('unknown prefix', 'xyz:0123');
    _catches('trailing plus in compound', 'vnd:0123+');
    _catches('incomplete compound device', 'vnd:0123+dev:');
    _catches('partial vendor id', 'vnd:');
    _catches('double negation', '!!vnd:0123');
});
