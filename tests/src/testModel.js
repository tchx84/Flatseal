const {GLib} = imports.gi;

const {setup, update} = imports.utils;
setup();

const {FlatsealModel, DELAY} = imports.model;

const _appId = 'com.test.Example';
const _system = GLib.build_filenamev(['..', 'tests', 'content', 'system', 'flatpak']);
const _user = GLib.build_filenamev(['..', 'tests', 'content', 'user', 'flatpak']);
const _tmp = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'tmp']);
const _none = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'dev', 'null']);
const _override = GLib.build_filenamev([_tmp, 'overrides', _appId]);


describe('Model', function() {
    var model;

    beforeAll(function() {
        GLib.unlink(_override);
        GLib.mkdir_with_parents(GLib.path_get_dirname(_override), 448);
    });

    beforeEach(function() {
        model = new FlatsealModel();
        model.setSystemInstallationPath(_system);
        model.setUserInstallationPath(_none);
    });

    it('loads applications', function() {
        expect(model.listApplications()).toContain(_appId);
    });

    it('loads permissions', function() {
        model.setAppId(_appId);

        expect(model.shared_network).toBeTruthy();
        expect(model.shared_ipc).toBeTruthy();
        expect(model.sockets_x11).toBeTruthy();
        expect(model.sockets_fallback_x11).toBeTruthy();
        expect(model.sockets_wayland).toBeTruthy();
        expect(model.sockets_pulseaudio).toBeTruthy();
        expect(model.sockets_system_bus).toBeTruthy();
        expect(model.sockets_session_bus).toBeTruthy();
        expect(model.sockets_ssh_auth).toBeTruthy();
        expect(model.sockets_cups).toBeTruthy();
        expect(model.devices_dri).toBeTruthy();
        expect(model.devices_all).toBeTruthy();
        expect(model.features_bluetooth).toBeTruthy();
        expect(model.features_devel).toBeTruthy();
        expect(model.features_multiarch).toBeTruthy();
        expect(model.filesystems_host).toBeTruthy();
        expect(model.filesystems_home).toBeTruthy();
        expect(model.filesystems_custom).toEqual('~/test');
    });

    it('loads overrides', function() {
        model.setUserInstallationPath(_user);
        model.setAppId(_appId);

        expect(model.shared_network).not.toBeTruthy();
        expect(model.shared_ipc).not.toBeTruthy();
        expect(model.sockets_x11).not.toBeTruthy();
        expect(model.sockets_fallback_x11).not.toBeTruthy();
        expect(model.sockets_wayland).not.toBeTruthy();
        expect(model.sockets_pulseaudio).not.toBeTruthy();
        expect(model.sockets_system_bus).not.toBeTruthy();
        expect(model.sockets_session_bus).not.toBeTruthy();
        expect(model.sockets_ssh_auth).not.toBeTruthy();
        expect(model.sockets_cups).not.toBeTruthy();
        expect(model.devices_dri).not.toBeTruthy();
        expect(model.devices_all).not.toBeTruthy();
        expect(model.features_bluetooth).not.toBeTruthy();
        expect(model.features_devel).not.toBeTruthy();
        expect(model.features_multiarch).not.toBeTruthy();
        expect(model.filesystems_host).not.toBeTruthy();
        expect(model.filesystems_home).not.toBeTruthy();
        expect(model.filesystems_custom).toEqual('');
    });

    it('creates overrides when properties changed', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_appId);

        model.set_property('shared-network', false);
        model.set_property('sockets_x11', false);
        model.set_property('devices_dri', false);
        model.set_property('shared-network', false);
        model.set_property('features-bluetooth', false);
        model.set_property('filesystems-host', false);
        model.set_property('filesystems-custom', '~/tset');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_override, 0)).toEqual(0);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('reloads overrides later on', function() {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_appId);

        expect(model.shared_network).not.toBeTruthy();
        expect(model.shared_ipc).toBeTruthy();
        expect(model.sockets_x11).not.toBeTruthy();
        expect(model.sockets_fallback_x11).toBeTruthy();
        expect(model.sockets_wayland).toBeTruthy();
        expect(model.sockets_pulseaudio).toBeTruthy();
        expect(model.sockets_system_bus).toBeTruthy();
        expect(model.sockets_session_bus).toBeTruthy();
        expect(model.sockets_ssh_auth).toBeTruthy();
        expect(model.sockets_cups).toBeTruthy();
        expect(model.devices_dri).not.toBeTruthy();
        expect(model.devices_all).toBeTruthy();
        expect(model.features_bluetooth).not.toBeTruthy();
        expect(model.features_devel).toBeTruthy();
        expect(model.features_multiarch).toBeTruthy();
        expect(model.filesystems_host).not.toBeTruthy();
        expect(model.filesystems_home).toBeTruthy();
        expect(model.filesystems_custom).toEqual('~/tset');
    });

    it('resets overrides', function() {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_appId);

        model.resetPermissionsForAppId(_appId);

        expect(GLib.access(_override, 0)).toEqual(-1);
    });

    it('creates overrides only when properties changed', function() {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_appId);

        model.set_property('shared-network', true);
        model.set_property('sockets_x11', true);
        model.set_property('devices_dri', true);
        model.set_property('shared-network', true);
        model.set_property('features-bluetooth', true);
        model.set_property('filesystems-host', true);
        model.set_property('filesystems-custom', '~/test');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_override, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });
});
