const {GLib} = imports.gi;

const {setup, update, has, hasOnly} = imports.utils;
setup();

const {FlatsealModel, DELAY, GROUP} = imports.model;

const _appId = 'com.test.Example';
const _oldAppId = 'com.test.Old';
const _reduceAppId = 'com.test.Reduce';
const _increaseAppId = 'com.test.Increase';
const _baseAppId = 'com.test.BaseApp';
const _negationAppId = 'com.test.Negation';
const _unsupportedAppId = 'com.test.Unsupported';

const _system = GLib.build_filenamev(['..', 'tests', 'content', 'system', 'flatpak']);
const _user = GLib.build_filenamev(['..', 'tests', 'content', 'user', 'flatpak']);
const _tmp = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'tmp']);
const _none = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'dev', 'null']);
const _overrides = GLib.build_filenamev([_tmp, 'overrides']);
const _override = GLib.build_filenamev([_overrides, _appId]);
const _oldOverride = GLib.build_filenamev([_overrides, _oldAppId]);
const _reduceOverride = GLib.build_filenamev([_overrides, _reduceAppId]);
const _increaseOverride = GLib.build_filenamev([_overrides, _increaseAppId]);
const _negationOverride = GLib.build_filenamev([_overrides, _negationAppId]);
const _unsupportedOverride = GLib.build_filenamev([_overrides, _unsupportedAppId]);
const _key = 'filesystems';


describe('Model', function() {
    var model;

    beforeAll(function() {
        GLib.unlink(_override);
        GLib.mkdir_with_parents(_overrides, 0o755);
    });

    beforeEach(function() {
        model = new FlatsealModel();
        model.setSystemInstallationPath(_system);
        model.setUserInstallationPath(_none);

        GLib.unlink(_oldOverride);
        GLib.unlink(_reduceOverride);
        GLib.unlink(_increaseOverride);
        GLib.unlink(_negationOverride);
        GLib.unlink(_unsupportedOverride);
    });

    it('loads applications', function() {
        expect(model.listApplications()).toContain(_appId);
        expect(model.listApplications()).toContain(_oldAppId);
        expect(model.listApplications()).toContain(_reduceAppId);
        expect(model.listApplications()).toContain(_increaseAppId);
    });

    it('ignores BaseApp bundles', function() {
        const path = GLib.build_filenamev([
            _system, 'app', _baseAppId, 'current', 'active', 'metadata',
        ]);

        expect(GLib.access(path, 0)).toEqual(0);
        expect(model.listApplications()).not.toContain(_baseAppId);
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

    it('reloads previous overrides later on', function() {
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

        model.resetPermissions();

        expect(GLib.access(_override, 0)).toEqual(-1);
    });

    it('creates overrides only when properties changed', function(done) {
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

    it('loads old filesystems overrides', function() {
        model.setUserInstallationPath(_user);
        model.setAppId(_oldAppId);

        expect(model.filesystems_custom).toEqual('xdg-pictures:ro');
    });

    it('reduces filesystems permission', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_reduceAppId);

        expect(model.filesystems_custom).toEqual('xdg-downloads');

        model.set_property('filesystems-custom', 'xdg-downloads:ro');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(has(_reduceOverride, GROUP, _key, 'xdg-downloads:ro')).toBeTruthy();
            expect(has(_reduceOverride, GROUP, _key, '!xdg-downloads')).not.toBeTruthy();
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('increases filesystems permission', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_increaseAppId);

        expect(model.filesystems_custom).toEqual('xdg-pictures:ro');

        model.set_property('filesystems-custom', 'xdg-pictures:rw');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(has(_increaseOverride, GROUP, _key, 'xdg-pictures:rw')).toBeTruthy();
            expect(has(_increaseOverride, GROUP, _key, '!xdg-pictures:ro')).not.toBeTruthy();
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('increases filesystems permission (default)', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_increaseAppId);

        expect(model.filesystems_custom).toEqual('xdg-pictures:ro');

        model.set_property('filesystems-custom', 'xdg-pictures');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(has(_increaseOverride, GROUP, _key, 'xdg-pictures')).toBeTruthy();
            expect(has(_increaseOverride, GROUP, _key, '!xdg-pictures:ro')).not.toBeTruthy();
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles negated filesystems permission', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_negationAppId);

        expect(model.filesystems_custom).toEqual('!~/negative;~/positive');

        model.set_property('filesystems-custom', '!~/negative');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(has(_negationOverride, GROUP, _key, '~/negative')).not.toBeTruthy();
            expect(has(_negationOverride, GROUP, _key, '!~/negative')).not.toBeTruthy();
            expect(has(_negationOverride, GROUP, _key, '!!~/negative')).not.toBeTruthy();
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles removing negated filesystems permission', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_negationAppId);

        expect(model.filesystems_custom).toEqual('!~/negative;~/positive');

        model.set_property('filesystems-custom', '~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(has(_negationOverride, GROUP, _key, '~/negative')).toBeTruthy();
            expect(has(_negationOverride, GROUP, _key, '!~/negative')).not.toBeTruthy();
            expect(has(_negationOverride, GROUP, _key, '!!~/negative')).not.toBeTruthy();
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles adding negated filesystems override (manually)', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_negationAppId);

        expect(model.filesystems_custom).toEqual('!~/negative;~/positive');

        model.set_property('filesystems-custom', '!~/negative;!~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(has(_negationOverride, GROUP, _key, '~/positive')).not.toBeTruthy();
            expect(has(_negationOverride, GROUP, _key, '!~/positive')).toBeTruthy();
            expect(has(_negationOverride, GROUP, _key, '!!~/postive')).not.toBeTruthy();
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles removing negated filesystems override (manually)', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_negationAppId);

        expect(model.filesystems_custom).toEqual('!~/negative;~/positive');

        model.set_property('filesystems-custom', '~/negative;~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(has(_negationOverride, GROUP, _key, '~/negative')).toBeTruthy();
            expect(has(_negationOverride, GROUP, _key, '!~/negative')).not.toBeTruthy();
            expect(has(_negationOverride, GROUP, _key, '!!~/negative')).not.toBeTruthy();
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('ignores unsupported permissions', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_unsupportedAppId);

        expect(model.filesystems_custom).toEqual('~/unsupported');

        model.set_property('filesystems-custom', '');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_unsupportedOverride, GROUP, _key, '!~/unsupported')).toBeTruthy();
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals changes with overrides', function(done) {
        spyOn(model, 'emit');

        model.setUserInstallationPath(_tmp);
        model.setAppId(_appId);
        model.set_property('shared-network', false);

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(model.emit).toHaveBeenCalledWith('changed', true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals changes with no overrides', function() {
        spyOn(model, 'emit');

        model.setUserInstallationPath(_tmp);
        model.setAppId(_appId);
        model.resetPermissions();

        expect(model.emit).toHaveBeenCalledWith('changed', false);
    });
});
