/* testRestorablePathsViewer.js
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

const {FlatsealRestorablePathsViewer} = imports.widgets.restorablePathsViewer;
const {FlatsealPathRow} = imports.widgets.pathRow;
const {FlatsealOverrideStatus} = imports.models.overrideStatus;


describe('FlatsealRestorablePathsViewer', function() {
    var viewer;

    beforeEach(function() {
        viewer = new FlatsealRestorablePathsViewer(
            (v) => v.join(';'),
            (v) => v.split(';'),
            FlatsealPathRow,
        );
    });

    it('starts empty', function() {
        expect(viewer.text).toEqual('');
    });

    it('loads paths and their negations as removed rows', function() {
        viewer.text = '~/test:ro;~/other;!~/test';

        const rows = Array.from(viewer).reverse();
        expect(rows.length).toEqual(2);
        expect(rows[0].text).toEqual('~/test:ro');
        expect(rows[0].removed).toBe(true);
        expect(rows[1].text).toEqual('~/other');
        expect(rows[1].removed).toBe(false);
        expect(viewer.text).toEqual('~/test:ro;!~/test;~/other');
    });

    it('loads negated paths and their overrides as removed rows', function() {
        viewer.text = '!~/test;~/test';

        const rows = Array.from(viewer);
        expect(rows.length).toEqual(1);
        expect(rows[0].text).toEqual('!~/test');
        expect(rows[0].removed).toBe(true);
        expect(viewer.text).toEqual('!~/test;~/test');
    });

    it('does not change text while loading', function() {
        spyOn(viewer, 'notify').and.callThrough();
        viewer.text = 'host:ro;xdg-documents:ro;home:ro;!xdg-documents;!host';

        expect(viewer.notify.calls.count()).toEqual(1);
    });

    it('sets statuses of removed rows from their negations', function() {
        viewer.text = '~/test:ro;~/other;!~/test';
        viewer.status = [
            FlatsealOverrideStatus.ORIGINAL,
            FlatsealOverrideStatus.ORIGINAL,
            FlatsealOverrideStatus.USER,
        ].join(';');

        const rows = Array.from(viewer).reverse();
        expect(rows[0].status).toEqual(FlatsealOverrideStatus.USER);
        expect(rows[1].status).toEqual(FlatsealOverrideStatus.ORIGINAL);
    });

    it('adds negations of removed original paths', function() {
        viewer.text = '~/test:ro';
        viewer.status = FlatsealOverrideStatus.ORIGINAL;
        spyOn(viewer, 'notify').and.callThrough();
        viewer.get_first_child()._button.emit('clicked');

        expect(Array.from(viewer).length).toEqual(1);
        expect(viewer.text).toEqual('~/test:ro;!~/test');
        expect(viewer.notify).toHaveBeenCalledWith('text');
    });

    it('adds overrides of removed negated paths', function() {
        viewer.text = '!~/test';
        viewer.status = FlatsealOverrideStatus.ORIGINAL;
        viewer.get_first_child()._button.emit('clicked');

        expect(viewer.text).toEqual('!~/test;~/test');
    });

    it('restores removed paths', function() {
        viewer.text = '~/test:ro;!~/test';
        viewer.status = [FlatsealOverrideStatus.ORIGINAL, FlatsealOverrideStatus.USER].join(';');
        viewer.get_first_child()._restoreButton.emit('clicked');

        expect(viewer.get_first_child().removed).toBe(false);
        expect(viewer.text).toEqual('~/test:ro');
    });

    it('removes user paths', function() {
        viewer.text = '~/test;~/foo';
        viewer.status = [FlatsealOverrideStatus.ORIGINAL, FlatsealOverrideStatus.USER].join(';');
        viewer.get_first_child()._button.emit('clicked');

        expect(viewer.text).toEqual('~/test');
    });

    it('removes new paths', function() {
        viewer.text = '~/test';
        viewer.status = FlatsealOverrideStatus.ORIGINAL;
        viewer.add('');
        viewer.get_first_child().text = '~/foo';
        viewer.get_first_child()._button.emit('clicked');

        expect(viewer.text).toEqual('~/test');
    });

    it('sets statuses of removed rows while adding new paths', function() {
        viewer.text = '~/test:ro';
        viewer.status = FlatsealOverrideStatus.ORIGINAL;
        viewer.add('');
        Array.from(viewer).pop()._button.emit('clicked');
        viewer.status = [FlatsealOverrideStatus.ORIGINAL, FlatsealOverrideStatus.USER].join(';');

        expect(Array.from(viewer).pop().status).toEqual(FlatsealOverrideStatus.USER);
    });
});
