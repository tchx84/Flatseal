const {setup} = imports.utils;
setup();

const {FlatsealPathsViewer} = imports.pathsViewer;

const _paths = 'home;host;xdg-desktop';


describe('FlatsealPathsViewer', function() {
    var viewer;

    beforeEach(function() {
        viewer = new FlatsealPathsViewer();
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
});
