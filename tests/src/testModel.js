const {GLib} = imports.gi;

const {setup, update, hasOnly} = imports.utils;
setup();

const {FlatsealModel, DELAY, GROUP} = imports.model;

const _totalPermissions = 24;

const _basicAppId = 'com.test.Basic';
const _oldAppId = 'com.test.Old';
const _reduceAppId = 'com.test.Reduce';
const _increaseAppId = 'com.test.Increase';
const _baseAppId = 'com.test.BaseApp';
const _negationAppId = 'com.test.Negation';
const _unsupportedAppId = 'com.test.Unsupported';
const _overridenAppId = 'com.test.Overriden';
const _extraAppId = 'com.test.Extra';

const _flatpakInfo = GLib.build_filenamev(['..', 'tests', 'content', '.flatpak-info']);
const _flatpakInfoOld = GLib.build_filenamev(['..', 'tests', 'content', '.flatpak-info.old']);
const _flatpakInfoNew = GLib.build_filenamev(['..', 'tests', 'content', '.flatpak-info.new']);

const _system = GLib.build_filenamev(['..', 'tests', 'content', 'system', 'flatpak']);
const _user = GLib.build_filenamev(['..', 'tests', 'content', 'user', 'flatpak']);
const _tmp = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'tmp']);
const _none = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'dev', 'null']);
const _overrides = GLib.build_filenamev([_tmp, 'overrides']);
const _basicOverride = GLib.build_filenamev([_overrides, _basicAppId]);
const _reduceOverride = GLib.build_filenamev([_overrides, _reduceAppId]);
const _increaseOverride = GLib.build_filenamev([_overrides, _increaseAppId]);
const _negationOverride = GLib.build_filenamev([_overrides, _negationAppId]);
const _unsupportedOverride = GLib.build_filenamev([_overrides, _unsupportedAppId]);
const _overridenOverride = GLib.build_filenamev([_overrides, _overridenAppId]);
const _key = 'filesystems';

const _flatpakConfig = GLib.build_filenamev(['..', 'tests', 'content', 'installations.d']);


describe('Model', function() {
    var model;

    beforeAll(function() {
        GLib.unlink(_overridenOverride);
        GLib.mkdir_with_parents(_overrides, 0o755);
    });

    beforeEach(function() {
        model = new FlatsealModel();
        model.setFlatpakInfoPath(_flatpakInfo);
        model.setSystemInstallationPath(_system);
        model.setUserInstallationPath(_none);

        GLib.unlink(_basicOverride);
        GLib.unlink(_reduceOverride);
        GLib.unlink(_increaseOverride);
        GLib.unlink(_negationOverride);
        GLib.unlink(_unsupportedOverride);
    });

    it('loads applications', function() {
        const appIds = model.listApplications().map(a => a.appId);

        expect(appIds).toContain(_basicAppId);
        expect(appIds).toContain(_oldAppId);
        expect(appIds).toContain(_reduceAppId);
        expect(appIds).toContain(_increaseAppId);
        expect(appIds).toContain(_negationAppId);
        expect(appIds).toContain(_unsupportedAppId);
    });

    it('ignores BaseApp bundles', function() {
        const path = GLib.build_filenamev([
            _system, 'app', _baseAppId, 'current', 'active', 'metadata',
        ]);

        expect(GLib.access(path, 0)).toEqual(0);

        const appIds = model.listApplications().map(a => a.appId);
        expect(appIds).not.toContain(_baseAppId);
    });

    it('loads permissions', function() {
        model.setAppId(_basicAppId);

        expect(model.shared_network).toBe(true);
        expect(model.shared_ipc).toBe(true);
        expect(model.sockets_x11).toBe(true);
        expect(model.sockets_fallback_x11).toBe(true);
        expect(model.sockets_wayland).toBe(true);
        expect(model.sockets_pulseaudio).toBe(true);
        expect(model.sockets_system_bus).toBe(true);
        expect(model.sockets_session_bus).toBe(true);
        expect(model.sockets_ssh_auth).toBe(true);
        expect(model.sockets_pcsc).toBe(true);
        expect(model.sockets_cups).toBe(true);
        expect(model.devices_dri).toBe(true);
        expect(model.devices_kvm).toBe(true);
        expect(model.devices_shm).toBe(true);
        expect(model.devices_all).toBe(true);
        expect(model.features_bluetooth).toBe(true);
        expect(model.features_devel).toBe(true);
        expect(model.features_multiarch).toBe(true);
        expect(model.features_canbus).toBe(true);
        expect(model.filesystems_host).toBe(true);
        expect(model.filesystems_host_os).toBe(true);
        expect(model.filesystems_host_etc).toBe(true);
        expect(model.filesystems_home).toBe(true);
        expect(model.filesystems_other).toEqual('~/test');
    });

    it('loads overrides', function() {
        model.setUserInstallationPath(_user);
        model.setAppId(_basicAppId);

        expect(model.shared_network).toBe(false);
        expect(model.shared_ipc).toBe(false);
        expect(model.sockets_x11).toBe(false);
        expect(model.sockets_fallback_x11).toBe(false);
        expect(model.sockets_wayland).toBe(false);
        expect(model.sockets_pulseaudio).toBe(false);
        expect(model.sockets_system_bus).toBe(false);
        expect(model.sockets_session_bus).toBe(false);
        expect(model.sockets_ssh_auth).toBe(false);
        expect(model.sockets_pcsc).toBe(false);
        expect(model.sockets_cups).toBe(false);
        expect(model.devices_dri).toBe(false);
        expect(model.devices_kvm).toBe(false);
        expect(model.devices_shm).toBe(false);
        expect(model.devices_all).toBe(false);
        expect(model.features_bluetooth).toBe(false);
        expect(model.features_devel).toBe(false);
        expect(model.features_multiarch).toBe(false);
        expect(model.features_canbus).toBe(false);
        expect(model.filesystems_host).toBe(false);
        expect(model.filesystems_host_os).toBe(false);
        expect(model.filesystems_host_etc).toBe(false);
        expect(model.filesystems_home).toBe(false);
        expect(model.filesystems_other).toEqual('');
    });

    it('creates overrides when properties changed', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_overridenAppId);

        model.set_property('shared-network', false);
        model.set_property('sockets_x11', false);
        model.set_property('devices_dri', false);
        model.set_property('shared-network', false);
        model.set_property('features-bluetooth', false);
        model.set_property('filesystems-host', false);
        model.set_property('filesystems-other', '~/tset');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_overridenOverride, 0)).toEqual(0);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('reloads previous overrides later on', function() {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_overridenAppId);

        expect(model.shared_network).toBe(false);
        expect(model.shared_ipc).toBe(true);
        expect(model.sockets_x11).toBe(false);
        expect(model.sockets_fallback_x11).toBe(true);
        expect(model.sockets_wayland).toBe(true);
        expect(model.sockets_pulseaudio).toBe(true);
        expect(model.sockets_system_bus).toBe(true);
        expect(model.sockets_session_bus).toBe(true);
        expect(model.sockets_ssh_auth).toBe(true);
        expect(model.sockets_cups).toBe(true);
        expect(model.devices_dri).toBe(false);
        expect(model.devices_all).toBe(true);
        expect(model.features_bluetooth).toBe(false);
        expect(model.features_devel).toBe(true);
        expect(model.features_multiarch).toBe(true);
        expect(model.filesystems_host).toBe(false);
        expect(model.filesystems_host_os).toBe(false);
        expect(model.filesystems_host_etc).toBe(false);
        expect(model.filesystems_home).toBe(true);
        expect(model.filesystems_other).toEqual('~/tset');
    });

    it('resets overrides', function() {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_overridenAppId);

        model.resetPermissions();

        expect(GLib.access(_overridenOverride, 0)).toEqual(-1);
    });

    it('creates overrides only when properties values changed', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_overridenAppId);

        model.set_property('shared-network', false);
        model.set_property('shared-network', true);

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_overridenOverride, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('loads old filesystems overrides', function() {
        model.setUserInstallationPath(_user);
        model.setAppId(_oldAppId);

        expect(model.filesystems_other).toEqual('xdg-pictures:ro');
    });

    it('reduces filesystems permission', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_reduceAppId);

        expect(model.filesystems_other).toEqual('xdg-downloads');

        model.set_property('filesystems-other', 'xdg-downloads:ro');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_reduceOverride, GROUP, _key, 'xdg-downloads:ro')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('increases filesystems permission', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_increaseAppId);

        expect(model.filesystems_other).toEqual('xdg-pictures:ro');

        model.set_property('filesystems-other', 'xdg-pictures:rw');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_increaseOverride, GROUP, _key, 'xdg-pictures:rw')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('increases filesystems permission (default)', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_increaseAppId);

        expect(model.filesystems_other).toEqual('xdg-pictures:ro');

        model.set_property('filesystems-other', 'xdg-pictures');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_increaseOverride, GROUP, _key, 'xdg-pictures')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles negated filesystems permission', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_negationAppId);

        expect(model.filesystems_other).toEqual('!~/negative;~/positive');

        model.set_property('filesystems-other', '!~/negative');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_negationOverride, GROUP, _key, '!~/positive')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles removing negated filesystems permission', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_negationAppId);

        expect(model.filesystems_other).toEqual('!~/negative;~/positive');

        model.set_property('filesystems-other', '~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_negationOverride, GROUP, _key, '~/negative')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles adding negated filesystems override (manually)', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_negationAppId);

        expect(model.filesystems_other).toEqual('!~/negative;~/positive');

        model.set_property('filesystems-other', '!~/negative;!~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_negationOverride, GROUP, _key, '!~/positive')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles removing negated filesystems override (manually)', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_negationAppId);

        expect(model.filesystems_other).toEqual('!~/negative;~/positive');

        model.set_property('filesystems-other', '~/negative;~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_negationOverride, GROUP, _key, '~/negative')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('ignores unsupported permissions', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_unsupportedAppId);

        expect(model.filesystems_other).toEqual('~/unsupported');

        model.set_property('filesystems-other', '');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_unsupportedOverride, GROUP, _key, '!~/unsupported')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals changes with overrides', function(done) {
        spyOn(model, 'emit');

        model.setUserInstallationPath(_tmp);
        model.setAppId(_basicAppId);

        model.set_property('shared-network', false);

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(model.emit.calls.mostRecent().args).toEqual(['changed', true]);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals changes with no overrides', function() {
        spyOn(model, 'emit');

        model.setUserInstallationPath(_tmp);
        model.setAppId(_basicAppId);

        model.resetPermissions();

        expect(model.emit.calls.mostRecent().args).toEqual(['changed', false]);
    });

    it('saves pending updates before selecting other application', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_basicAppId);

        expect(model.shared_network).toEqual(true);

        model.set_property('shared-network', false);

        model.setAppId(_unsupportedAppId);

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_basicOverride, 0)).toEqual(0);
            expect(GLib.access(_unsupportedOverride, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('saves pending updates before shutting down', function(done) {
        model.setUserInstallationPath(_tmp);
        model.setAppId(_basicAppId);

        expect(model.shared_network).toEqual(true);

        model.set_property('shared-network', false);

        model.shutdown();

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_basicOverride, 0)).toEqual(0);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('disables all permissions with old flatpak version', function() {
        model.setFlatpakInfoPath(_flatpakInfoOld);
        model.setAppId(_basicAppId);

        const permissions = model.listPermissions().filter(p => p.supported);

        expect(permissions.length).toEqual(0);
    });

    it('enables all permissions with new flatpak version', function() {
        model.setFlatpakInfoPath(_flatpakInfoNew);
        model.setAppId(_basicAppId);

        const permissions = model.listPermissions().filter(p => p.supported);

        expect(permissions.length).toEqual(_totalPermissions);
    });

    it('disables permissions with stable flatpak version', function() {
        model.setAppId(_basicAppId);

        const permissions = model.listPermissions().filter(p => p.supported);

        expect(permissions.length).toEqual(_totalPermissions - 6);
    });

    it('handles missing .flatpak-info', function() {
        model.setFlatpakInfoPath(_none);
        model.setAppId(_basicAppId);

        const permissions = model.listPermissions().filter(p => p.supported);

        expect(permissions.length).toEqual(_totalPermissions);
    });

    it('loads extra applications', function() {
        model.setFlatpakConfigPath(_flatpakConfig);

        const appIds = model.listApplications().map(a => a.appId);
        expect(appIds).toContain(_extraAppId);
    });

    it('preserves installation priorities', function() {
        model.setUserInstallationPath(_user);
        model.setFlatpakConfigPath(_flatpakConfig);
        model.setAppId(_extraAppId);

        expect(model.shared_network).toBe(false);
        expect(model.shared_ipc).toBe(true);
    });
});
