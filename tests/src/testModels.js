const {GLib} = imports.gi;

const {setup, update, hasOnly} = imports.utils;
setup();

const {FlatpakApplicationsModel} = imports.models.applications;
const {FlatpakInfoModel} = imports.models.info;
const {FlatpakPermissionsModel, DELAY} = imports.models.permissions;

const _totalPermissions = 26;

const _basicAppId = 'com.test.Basic';
const _oldAppId = 'com.test.Old';
const _reduceAppId = 'com.test.Reduce';
const _increaseAppId = 'com.test.Increase';
const _baseAppId = 'com.test.BaseApp';
const _negationAppId = 'com.test.Negation';
const _unsupportedAppId = 'com.test.Unsupported';
const _overridenAppId = 'com.test.Overriden';
const _extraAppId = 'com.test.Extra';
const _environmentAppId = 'com.test.Environment';

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
const _environmentOverride = GLib.build_filenamev([_overrides, _environmentAppId]);
const _key = 'filesystems';

const _flatpakConfig = GLib.build_filenamev(['..', 'tests', 'content', 'installations.d']);


describe('Model', function() {
    var applications, info, permissions;

    beforeAll(function() {
        GLib.unlink(_overridenOverride);
        GLib.mkdir_with_parents(_overrides, 0o755);
    });

    beforeEach(function() {
        applications = new FlatpakApplicationsModel();
        applications.systemPath = _system;
        applications.userPath = _none;

        info = new FlatpakInfoModel();
        info.path = _flatpakInfo;

        permissions = new FlatpakPermissionsModel();
        permissions.applications = applications;
        permissions.info = info;

        GLib.unlink(_basicOverride);
        GLib.unlink(_reduceOverride);
        GLib.unlink(_increaseOverride);
        GLib.unlink(_negationOverride);
        GLib.unlink(_unsupportedOverride);
        GLib.unlink(_environmentOverride);
    });

    it('loads applications', function() {
        const appIds = applications.getAll().map(a => a.appId);

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

        const appIds = applications.getAll().map(a => a.appId);
        expect(appIds).not.toContain(_baseAppId);
    });

    it('loads permissions', function() {
        permissions.appId = _basicAppId;

        expect(permissions.shared_network).toBe(true);
        expect(permissions.shared_ipc).toBe(true);
        expect(permissions.sockets_x11).toBe(true);
        expect(permissions.sockets_fallback_x11).toBe(true);
        expect(permissions.sockets_wayland).toBe(true);
        expect(permissions.sockets_pulseaudio).toBe(true);
        expect(permissions.sockets_system_bus).toBe(true);
        expect(permissions.sockets_session_bus).toBe(true);
        expect(permissions.sockets_ssh_auth).toBe(true);
        expect(permissions.sockets_pcsc).toBe(true);
        expect(permissions.sockets_cups).toBe(true);
        expect(permissions.devices_dri).toBe(true);
        expect(permissions.devices_kvm).toBe(true);
        expect(permissions.devices_shm).toBe(true);
        expect(permissions.devices_all).toBe(true);
        expect(permissions.features_bluetooth).toBe(true);
        expect(permissions.features_devel).toBe(true);
        expect(permissions.features_multiarch).toBe(true);
        expect(permissions.features_canbus).toBe(true);
        expect(permissions.filesystems_host).toBe(true);
        expect(permissions.filesystems_host_os).toBe(true);
        expect(permissions.filesystems_host_etc).toBe(true);
        expect(permissions.filesystems_home).toBe(true);
        expect(permissions.filesystems_other).toEqual('~/test');
        expect(permissions.persistent).toEqual('.test');
        expect(permissions.variables).toEqual('TEST=yes');
    });

    it('loads overrides', function() {
        applications.userPath = _user;
        permissions.appId = _basicAppId;

        expect(permissions.shared_network).toBe(false);
        expect(permissions.shared_ipc).toBe(false);
        expect(permissions.sockets_x11).toBe(false);
        expect(permissions.sockets_fallback_x11).toBe(false);
        expect(permissions.sockets_wayland).toBe(false);
        expect(permissions.sockets_pulseaudio).toBe(false);
        expect(permissions.sockets_system_bus).toBe(false);
        expect(permissions.sockets_session_bus).toBe(false);
        expect(permissions.sockets_ssh_auth).toBe(false);
        expect(permissions.sockets_pcsc).toBe(false);
        expect(permissions.sockets_cups).toBe(false);
        expect(permissions.devices_dri).toBe(false);
        expect(permissions.devices_kvm).toBe(false);
        expect(permissions.devices_shm).toBe(false);
        expect(permissions.devices_all).toBe(false);
        expect(permissions.features_bluetooth).toBe(false);
        expect(permissions.features_devel).toBe(false);
        expect(permissions.features_multiarch).toBe(false);
        expect(permissions.features_canbus).toBe(false);
        expect(permissions.filesystems_host).toBe(false);
        expect(permissions.filesystems_host_os).toBe(false);
        expect(permissions.filesystems_host_etc).toBe(false);
        expect(permissions.filesystems_home).toBe(false);
        expect(permissions.persistent).toEqual('.test;tset.');
        expect(permissions.variables).toEqual('TEST=no');
    });

    it('creates overrides when properties changed', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _overridenAppId;

        permissions.set_property('shared-network', false);
        permissions.set_property('sockets_x11', false);
        permissions.set_property('devices_dri', false);
        permissions.set_property('shared-network', false);
        permissions.set_property('features-bluetooth', false);
        permissions.set_property('filesystems-host', false);
        permissions.set_property('filesystems-other', '~/tset');
        permissions.set_property('persistent', 'tset.');
        permissions.set_property('variables', 'TEST=maybe');


        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_overridenOverride, 0)).toEqual(0);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('reloads previous overrides later on', function() {
        applications.userPath = _tmp;
        permissions.appId = _overridenAppId;

        expect(permissions.shared_network).toBe(false);
        expect(permissions.shared_ipc).toBe(true);
        expect(permissions.sockets_x11).toBe(false);
        expect(permissions.sockets_fallback_x11).toBe(true);
        expect(permissions.sockets_wayland).toBe(true);
        expect(permissions.sockets_pulseaudio).toBe(true);
        expect(permissions.sockets_system_bus).toBe(true);
        expect(permissions.sockets_session_bus).toBe(true);
        expect(permissions.sockets_ssh_auth).toBe(true);
        expect(permissions.sockets_cups).toBe(true);
        expect(permissions.devices_dri).toBe(false);
        expect(permissions.devices_all).toBe(true);
        expect(permissions.features_bluetooth).toBe(false);
        expect(permissions.features_devel).toBe(true);
        expect(permissions.features_multiarch).toBe(true);
        expect(permissions.filesystems_host).toBe(false);
        expect(permissions.filesystems_host_os).toBe(false);
        expect(permissions.filesystems_host_etc).toBe(false);
        expect(permissions.filesystems_home).toBe(true);
        expect(permissions.filesystems_other).toEqual('~/tset');
        expect(permissions.persistent).toEqual('tset.');
        expect(permissions.variables).toEqual('TEST=maybe');
    });

    it('resets overrides', function() {
        applications.userPath = _tmp;
        permissions.appId = _overridenAppId;

        permissions.reset();

        expect(GLib.access(_overridenOverride, 0)).toEqual(-1);
    });

    it('creates overrides only when properties values changed', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _overridenAppId;

        permissions.set_property('shared-network', false);
        permissions.set_property('shared-network', true);

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_overridenOverride, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('loads old filesystems overrides', function() {
        applications.userPath = _user;
        permissions.appId = _oldAppId;

        expect(permissions.filesystems_other).toEqual('xdg-pictures:ro');
    });

    it('reduces filesystems permission', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _reduceAppId;

        expect(permissions.filesystems_other).toEqual('xdg-downloads');

        permissions.set_property('filesystems-other', 'xdg-downloads:ro');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            const group = permissions.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_reduceOverride, group, _key, 'xdg-downloads:ro')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('increases filesystems permission', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _increaseAppId;

        expect(permissions.filesystems_other).toEqual('xdg-pictures:ro');

        permissions.set_property('filesystems-other', 'xdg-pictures:rw');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            const group = permissions.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_increaseOverride, group, _key, 'xdg-pictures:rw')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('increases filesystems permission (default)', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _increaseAppId;

        expect(permissions.filesystems_other).toEqual('xdg-pictures:ro');

        permissions.set_property('filesystems-other', 'xdg-pictures');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            const group = permissions.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_increaseOverride, group, _key, 'xdg-pictures')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles negated filesystems permission', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _negationAppId;

        expect(permissions.filesystems_other).toEqual('!~/negative;~/positive');

        permissions.set_property('filesystems-other', '!~/negative');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            const group = permissions.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_negationOverride, group, _key, '!~/positive')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles removing negated filesystems permission', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _negationAppId;

        expect(permissions.filesystems_other).toEqual('!~/negative;~/positive');

        permissions.set_property('filesystems-other', '~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            const group = permissions.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_negationOverride, group, _key, '~/negative')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles adding negated filesystems override (manually)', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _negationAppId;

        expect(permissions.filesystems_other).toEqual('!~/negative;~/positive');

        permissions.set_property('filesystems-other', '!~/negative;!~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            const group = permissions.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_negationOverride, group, _key, '!~/positive')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles removing negated filesystems override (manually)', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _negationAppId;

        expect(permissions.filesystems_other).toEqual('!~/negative;~/positive');

        permissions.set_property('filesystems-other', '~/negative;~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            const group = permissions.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_negationOverride, group, _key, '~/negative')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('ignores unsupported permissions', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _unsupportedAppId;

        expect(permissions.filesystems_other).toEqual('~/unsupported');

        permissions.set_property('filesystems-other', '');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            const group = permissions.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_unsupportedOverride, group, _key, '!~/unsupported')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals changes with overrides', function(done) {
        spyOn(permissions, 'emit');

        applications.userPath = _tmp;
        permissions.appId = _basicAppId;

        permissions.set_property('shared-network', false);

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(permissions.emit.calls.mostRecent().args).toEqual(['changed', true, false]);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals changes with no overrides', function() {
        spyOn(permissions, 'emit');

        applications.userPath = _tmp;
        permissions.appId = _basicAppId;

        permissions.reset();

        expect(permissions.emit.calls.mostRecent().args).toEqual(['changed', false, false]);
    });

    it('signals changes with unsupported overrides', function() {
        spyOn(permissions, 'emit');

        applications.userPath = _user;
        permissions.appId = _unsupportedAppId;

        expect(permissions.emit.calls.mostRecent().args).toEqual(['changed', true, true]);
    });

    it('signals changes without unsupported overrides', function() {
        spyOn(permissions, 'emit');

        applications.userPath = _tmp;
        permissions.appId = _unsupportedAppId;

        expect(permissions.emit.calls.mostRecent().args).toEqual(['changed', false, false]);
    });

    it('saves pending updates before selecting other application', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _basicAppId;

        expect(permissions.shared_network).toEqual(true);

        permissions.set_property('shared-network', false);

        permissions.appId = _unsupportedAppId;

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_basicOverride, 0)).toEqual(0);
            expect(GLib.access(_unsupportedOverride, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('saves pending updates before shutting down', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _basicAppId;

        expect(permissions.shared_network).toEqual(true);

        permissions.set_property('shared-network', false);

        permissions.shutdown();

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_basicOverride, 0)).toEqual(0);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('disables all permissions with old flatpak version', function() {
        info.path = _flatpakInfoOld;
        permissions.appId = _basicAppId;

        const total = permissions.getAll().filter(p => p.supported).length;

        expect(total).toEqual(0);
    });

    it('enables all permissions with new flatpak version', function() {
        info.path = _flatpakInfoNew;
        permissions.appId = _basicAppId;

        const total = permissions.getAll().filter(p => p.supported).length;

        expect(total).toEqual(_totalPermissions);
    });

    it('disables permissions with stable flatpak version', function() {
        permissions.appId = _basicAppId;

        const total = permissions.getAll().filter(p => p.supported).length;

        expect(total).toEqual(_totalPermissions - 6);
    });

    it('handles missing .flatpak-info', function() {
        info.path = _none;
        permissions.appId = _basicAppId;

        const total = permissions.getAll().filter(p => p.supported).length;

        expect(total).toEqual(_totalPermissions);
    });

    it('loads extra applications', function() {
        applications.configPath = _flatpakConfig;

        const appIds = applications.getAll().map(a => a.appId);
        expect(appIds).toContain(_extraAppId);
    });

    it('preserves installation priorities', function() {
        applications.userPath = _user;
        applications.configPath = _flatpakConfig;
        permissions.appId = _extraAppId;

        expect(permissions.shared_network).toBe(false);
        expect(permissions.shared_ipc).toBe(true);
    });

    it('add new environment variable', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _environmentAppId;

        expect(permissions.variables).toEqual('TEST=yes');

        permissions.set_property('variables', 'TEST=yes;TEST2=no');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_environmentOverride, 'Environment', 'TEST2', 'no')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('override original environment variable', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _environmentAppId;

        expect(permissions.variables).toEqual('TEST=yes');

        permissions.set_property('variables', 'TEST=no');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_environmentOverride, 'Environment', 'TEST', 'no')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('remove original environment variable', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _environmentAppId;

        expect(permissions.variables).toEqual('TEST=yes');

        permissions.set_property('variables', '');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(hasOnly(_environmentOverride, 'Environment', 'TEST', '')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles non-valid environment variable', function(done) {
        applications.userPath = _tmp;
        permissions.appId = _environmentAppId;

        expect(permissions.variables).toEqual('TEST=yes');

        permissions.set_property('variables', 'TEST=yes;TE ST=no');

        GLib.timeout_add(GLib.PRIORITY_HIGH, DELAY + 1, () => {
            expect(GLib.access(_environmentOverride, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });
});
