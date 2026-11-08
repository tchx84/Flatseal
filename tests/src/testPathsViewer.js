/* testPathsViewer.js
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

const {FlatsealPathsViewer} = imports.widgets.pathsViewer;
const {FlatsealPathRow} = imports.widgets.pathRow;
const {FlatsealOverrideStatus} = imports.models.overrideStatus;

const _paths = 'home;host;xdg-desktop';


describe('FlatsealPathsViewer', function() {
    var viewer;

    beforeEach(function() {
        viewer = new FlatsealPathsViewer(
            (v) => v.join(';'),
            (v) => v.split(';'),
            FlatsealPathRow,
        );
    });

    it('starts empty', function() {
        expect(viewer.text).toEqual('');
    });

    it('processes paths correctly', function() {
        viewer.text = _paths;
        expect(viewer.text).toEqual(_paths);
    });

    it('handles new paths', function() {
        viewer.text = _paths;
        viewer.add('~/Steam');
        expect(viewer.text).toEqual(`${_paths};~/Steam`);
    });

    it('resets paths', function() {
        viewer.add('');
        viewer.text = '';
        expect(viewer.text).toEqual('');
    });

    it('adds negation of original paths', function() {
        viewer.text = '~/test:ro';
        viewer.status = FlatsealOverrideStatus.ORIGINAL;
        viewer.get_first_child()._button.emit('clicked');

        expect(viewer.text).toEqual('~/test:ro;!~/test');
        expect(viewer.get_first_child().status).toEqual(FlatsealOverrideStatus.USER);
    });

    it('does not add the same negation twice', function() {
        viewer.text = '~/test:ro;!~/test';
        viewer.status = `${FlatsealOverrideStatus.ORIGINAL};${FlatsealOverrideStatus.USER}`;
        viewer.get_last_child()._button.emit('clicked');

        expect(viewer.text).toEqual('~/test:ro;!~/test');
    });

    it('removes negation of original paths', function() {
        viewer.text = '~/test:ro;!~/test';
        viewer.status = `${FlatsealOverrideStatus.ORIGINAL};${FlatsealOverrideStatus.USER}`;
        viewer.get_first_child()._button.emit('clicked');

        expect(viewer.text).toEqual('~/test:ro');
    });

    it('keeps status of loaded paths', function() {
        viewer.text = '~/test:ro;!~/test';
        viewer.status = `${FlatsealOverrideStatus.ORIGINAL};${FlatsealOverrideStatus.USER}`;

        expect(viewer.get_last_child().status).toEqual(FlatsealOverrideStatus.ORIGINAL);
        expect(viewer.get_first_child().status).toEqual(FlatsealOverrideStatus.USER);
    });
});
