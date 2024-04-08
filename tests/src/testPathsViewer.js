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
});
