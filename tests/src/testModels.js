/* testModels.js
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

const {Gio, GLib} = imports.gi;

const {
    setup,
    update,
    has,
    hasOnly,
    hasInTotal,
    startService,
    waitForService,
    stopService,
    partialService,
    getValueFromService,
} = imports.utils;

setup();

const _totalPermissions = 41;

const _basicAppId = 'com.test.Basic';
const _basicNegatedAppId = 'com.test.BasicNegated';
const _oldAppId = 'com.test.Old';
const _reduceAppId = 'com.test.Reduce';
const _increaseAppId = 'com.test.Increase';
const _baseAppId = 'com.test.BaseApp';
const _negationAppId = 'com.test.Negation';
const _unsupportedAppId = 'com.test.Unsupported';
const _overridenAppId = 'com.test.Overriden';
const _extraAppId = 'com.test.Extra';
const _environmentAppId = 'com.test.Environment';
const _busAppId = 'com.test.Bus';
const _variablesAppId = 'com.test.Variables';
const _trailingSemicolonId = 'com.test.TrailingSemicolon';
const _filesystemWithMode = 'com.test.FilesystemWithMode';
const _resetModeId = 'com.test.ResetMode';
const _globalAppId = 'com.test.Global';
const _globalRestoredAppId = 'com.test.GlobalRestored';
const _statusesAppId = 'com.test.Statuses';
const _malformedAppId = 'com.test.Malformed';

const _flatpakInfo = GLib.build_filenamev(['..', 'tests', 'content', '.flatpak-info']);
const _flatpakInfoOld = GLib.build_filenamev(['..', 'tests', 'content', '.flatpak-info.old']);
const _flatpakInfoNew = GLib.build_filenamev(['..', 'tests', 'content', '.flatpak-info.new']);

const _system = GLib.build_filenamev(['..', 'tests', 'content', 'system', 'flatpak']);
const _user = GLib.build_filenamev(['..', 'tests', 'content', 'user', 'flatpak']);
const _global = GLib.build_filenamev(['..', 'tests', 'content', 'global', 'flatpak']);
const _globalNegated = GLib.build_filenamev(['..', 'tests', 'content', 'globalNegated', 'flatpak']);
const _globalResetMode = GLib.build_filenamev(['..', 'tests', 'content', 'globalResetMode', 'flatpak']);
const _statuses = GLib.build_filenamev(['..', 'tests', 'content', 'statuses', 'flatpak']);
const _tmp = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'tmp']);
const _none = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'dev', 'null']);
const _overrides = GLib.build_filenamev([_tmp, 'overrides']);
const _globalOverride = GLib.build_filenamev([_overrides, 'global']);
const _globalNegatedOverride = GLib.build_filenamev([_globalNegated, 'overrides', 'global']);
const _globalResetModeOverride = GLib.build_filenamev([_globalResetMode, 'overrides', 'global']);
const _basicOverride = GLib.build_filenamev([_overrides, _basicAppId]);
const _reduceOverride = GLib.build_filenamev([_overrides, _reduceAppId]);
const _increaseOverride = GLib.build_filenamev([_overrides, _increaseAppId]);
const _negationOverride = GLib.build_filenamev([_overrides, _negationAppId]);
const _unsupportedOverride = GLib.build_filenamev([_overrides, _unsupportedAppId]);
const _overridenOverride = GLib.build_filenamev([_overrides, _overridenAppId]);
const _environmentOverride = GLib.build_filenamev([_overrides, _environmentAppId]);
const _busOverride = GLib.build_filenamev([_overrides, _busAppId]);
const _filesystemWithModeOverride = GLib.build_filenamev([_overrides, _filesystemWithMode]);
const _resetModeOverride = GLib.build_filenamev([_overrides, _resetModeId]);
const _globalWithGlobalOverride = GLib.build_filenamev([_global, 'overrides', _globalAppId]);

const _sessionGroup = 'Session Bus Policy';
const _key = 'filesystems';

const _flatpakConfig = GLib.build_filenamev(['..', 'tests', 'content']);


describe('Model', function() {
    var delay, permissionsDefault, applicationsDefault, infoDefault, portalsDefault, portalState;

    beforeAll(function() {
        startService();
        waitForService();

        const {applications, info, permissions, portals} = imports.models;

        infoDefault = info.getDefault();
        portalsDefault = portals.getDefault();
        applicationsDefault = applications.getDefault();
        permissionsDefault = permissions.getDefault();

        delay = permissions.DELAY;
        portalState = portals.FlatpakPortalState;

        GLib.unlink(_overridenOverride);
        GLib.mkdir_with_parents(_overrides, 0o755);
    });

    afterAll(function() {
        stopService();
    });

    beforeEach(function() {
        GLib.setenv('FLATPAK_SYSTEM_DIR', _system, true);
        GLib.setenv('FLATPAK_USER_DIR', _none, true);
        GLib.setenv('FLATPAK_INFO_PATH', _flatpakInfo, true);

        infoDefault.reload();
        portalsDefault.reload();
        applicationsDefault.reload();
        permissionsDefault.reload();

        GLib.unlink(_basicOverride);
        GLib.unlink(_reduceOverride);
        GLib.unlink(_increaseOverride);
        GLib.unlink(_negationOverride);
        GLib.unlink(_unsupportedOverride);
        GLib.unlink(_environmentOverride);
        GLib.unlink(_busOverride);
        GLib.unlink(_filesystemWithModeOverride);
        GLib.unlink(_resetModeOverride);
        GLib.unlink(_globalWithGlobalOverride);
        GLib.unlink(_globalOverride);
    });

    it('loads applications', function() {
        const appIds = applicationsDefault.getAll().map(a => a.appId);

        expect(appIds).toContain(_basicAppId);
        expect(appIds).toContain(_basicNegatedAppId);
        expect(appIds).toContain(_oldAppId);
        expect(appIds).toContain(_reduceAppId);
        expect(appIds).toContain(_increaseAppId);
        expect(appIds).toContain(_negationAppId);
        expect(appIds).toContain(_unsupportedAppId);
        expect(appIds).toContain(_trailingSemicolonId);
        expect(appIds).toContain(_filesystemWithMode);
        expect(appIds).toContain(_resetModeId);
    });

    it('ignores BaseApp bundles', function() {
        const path = GLib.build_filenamev([
            _system, 'app', _baseAppId, 'current', 'active', 'metadata',
        ]);

        expect(GLib.access(path, 0)).toEqual(0);

        const appIds = applicationsDefault.getAll().map(a => a.appId);
        expect(appIds).not.toContain(_baseAppId);
    });

    it('loads permissions', function() {
        permissionsDefault.appId = _basicAppId;

        expect(permissionsDefault.shared_network).toBe(true);
        expect(permissionsDefault.shared_ipc).toBe(true);
        expect(permissionsDefault.sockets_x11).toBe(true);
        expect(permissionsDefault.sockets_fallback_x11).toBe(true);
        expect(permissionsDefault.sockets_wayland).toBe(true);
        expect(permissionsDefault.sockets_pulseaudio).toBe(true);
        expect(permissionsDefault.sockets_system_bus).toBe(true);
        expect(permissionsDefault.sockets_session_bus).toBe(true);
        expect(permissionsDefault.sockets_ssh_auth).toBe(true);
        expect(permissionsDefault.sockets_pcsc).toBe(true);
        expect(permissionsDefault.sockets_cups).toBe(true);
        expect(permissionsDefault.sockets_gpg_agent).toBe(true);
        expect(permissionsDefault.sockets_inherit_wayland_socket).toBe(true);
        expect(permissionsDefault.devices_dri).toBe(true);
        expect(permissionsDefault.devices_input).toBe(true);
        expect(permissionsDefault.devices_kvm).toBe(true);
        expect(permissionsDefault.devices_shm).toBe(true);
        expect(permissionsDefault.devices_usb).toBe(true);
        expect(permissionsDefault.devices_all).toBe(true);
        expect(permissionsDefault.features_bluetooth).toBe(true);
        expect(permissionsDefault.features_devel).toBe(true);
        expect(permissionsDefault.features_multiarch).toBe(true);
        expect(permissionsDefault.features_canbus).toBe(true);
        expect(permissionsDefault.features_per_app_dev_shm).toBe(true);
        expect(permissionsDefault.filesystems_host).toBe(true);
        expect(permissionsDefault.filesystems_host_os).toBe(true);
        expect(permissionsDefault.filesystems_host_etc).toBe(true);
        expect(permissionsDefault.filesystems_home).toBe(true);
        expect(permissionsDefault.filesystems_other).toEqual('~/test');
        expect(permissionsDefault.session_talk).toEqual('org.test.Service-1');
        expect(permissionsDefault.session_own).toEqual('org.test.Service-2');
        expect(permissionsDefault.system_talk).toEqual('org.test.Service-3');
        expect(permissionsDefault.system_own).toEqual('org.test.Service-4');
        expect(permissionsDefault.persistent).toEqual('.test');
        expect(permissionsDefault.variables).toEqual('TEST=yes');
    });

    it('loads overrides', function() {
        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _basicAppId;

        expect(permissionsDefault.shared_network).toBe(false);
        expect(permissionsDefault.shared_ipc).toBe(false);
        expect(permissionsDefault.sockets_x11).toBe(false);
        expect(permissionsDefault.sockets_fallback_x11).toBe(false);
        expect(permissionsDefault.sockets_wayland).toBe(false);
        expect(permissionsDefault.sockets_pulseaudio).toBe(false);
        expect(permissionsDefault.sockets_system_bus).toBe(false);
        expect(permissionsDefault.sockets_session_bus).toBe(false);
        expect(permissionsDefault.sockets_ssh_auth).toBe(false);
        expect(permissionsDefault.sockets_pcsc).toBe(false);
        expect(permissionsDefault.sockets_cups).toBe(false);
        expect(permissionsDefault.sockets_gpg_agent).toBe(false);
        expect(permissionsDefault.sockets_inherit_wayland_socket).toBe(false);
        expect(permissionsDefault.devices_dri).toBe(false);
        expect(permissionsDefault.devices_input).toBe(false);
        expect(permissionsDefault.devices_kvm).toBe(false);
        expect(permissionsDefault.devices_shm).toBe(false);
        expect(permissionsDefault.devices_usb).toBe(false);
        expect(permissionsDefault.devices_all).toBe(false);
        expect(permissionsDefault.features_bluetooth).toBe(false);
        expect(permissionsDefault.features_devel).toBe(false);
        expect(permissionsDefault.features_multiarch).toBe(false);
        expect(permissionsDefault.features_canbus).toBe(false);
        expect(permissionsDefault.features_per_app_dev_shm).toBe(false);
        expect(permissionsDefault.filesystems_host).toBe(false);
        expect(permissionsDefault.filesystems_host_os).toBe(false);
        expect(permissionsDefault.filesystems_host_etc).toBe(false);
        expect(permissionsDefault.filesystems_home).toBe(false);
        expect(permissionsDefault.session_talk).toEqual('');
        expect(permissionsDefault.session_own).toEqual('');
        expect(permissionsDefault.system_talk).toEqual('');
        expect(permissionsDefault.system_own).toEqual('');
        expect(permissionsDefault.persistent).toEqual('.test;tset.');
        expect(permissionsDefault.variables).toEqual('TEST=no');
    });

    it('loads negated permissions', function() {
        permissionsDefault.appId = _basicNegatedAppId;

        expect(permissionsDefault.shared_network).toBe(false);
        expect(permissionsDefault.shared_ipc).toBe(false);
        expect(permissionsDefault.sockets_x11).toBe(false);
        expect(permissionsDefault.sockets_fallback_x11).toBe(false);
        expect(permissionsDefault.sockets_wayland).toBe(false);
        expect(permissionsDefault.sockets_pulseaudio).toBe(false);
        expect(permissionsDefault.sockets_system_bus).toBe(false);
        expect(permissionsDefault.sockets_session_bus).toBe(false);
        expect(permissionsDefault.sockets_ssh_auth).toBe(false);
        expect(permissionsDefault.sockets_pcsc).toBe(false);
        expect(permissionsDefault.sockets_cups).toBe(false);
        expect(permissionsDefault.sockets_gpg_agent).toBe(false);
        expect(permissionsDefault.sockets_inherit_wayland_socket).toBe(false);
        expect(permissionsDefault.devices_dri).toBe(false);
        expect(permissionsDefault.devices_input).toBe(false);
        expect(permissionsDefault.devices_kvm).toBe(false);
        expect(permissionsDefault.devices_shm).toBe(false);
        expect(permissionsDefault.devices_usb).toBe(false);
        expect(permissionsDefault.devices_all).toBe(false);
        expect(permissionsDefault.features_bluetooth).toBe(false);
        expect(permissionsDefault.features_devel).toBe(false);
        expect(permissionsDefault.features_multiarch).toBe(false);
        expect(permissionsDefault.features_canbus).toBe(false);
        expect(permissionsDefault.features_per_app_dev_shm).toBe(false);
        expect(permissionsDefault.filesystems_host).toBe(false);
        expect(permissionsDefault.filesystems_host_os).toBe(false);
        expect(permissionsDefault.filesystems_host_etc).toBe(false);
        expect(permissionsDefault.filesystems_home).toBe(false);
        expect(permissionsDefault.filesystems_other).toEqual('!~/test');
        expect(permissionsDefault.session_talk).toEqual('');
        expect(permissionsDefault.session_own).toEqual('');
        expect(permissionsDefault.system_talk).toEqual('');
        expect(permissionsDefault.system_own).toEqual('');
        expect(permissionsDefault.persistent).toEqual('tset.');
        expect(permissionsDefault.variables).toEqual('TEST=no');
    });

    it('loads negated overrides', function() {
        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _basicNegatedAppId;

        expect(permissionsDefault.shared_network).toBe(true);
        expect(permissionsDefault.shared_ipc).toBe(true);
        expect(permissionsDefault.sockets_x11).toBe(true);
        expect(permissionsDefault.sockets_fallback_x11).toBe(true);
        expect(permissionsDefault.sockets_wayland).toBe(true);
        expect(permissionsDefault.sockets_pulseaudio).toBe(true);
        expect(permissionsDefault.sockets_system_bus).toBe(true);
        expect(permissionsDefault.sockets_session_bus).toBe(true);
        expect(permissionsDefault.sockets_ssh_auth).toBe(true);
        expect(permissionsDefault.sockets_pcsc).toBe(true);
        expect(permissionsDefault.sockets_cups).toBe(true);
        expect(permissionsDefault.sockets_gpg_agent).toBe(true);
        expect(permissionsDefault.sockets_inherit_wayland_socket).toBe(true);
        expect(permissionsDefault.devices_dri).toBe(true);
        expect(permissionsDefault.devices_input).toBe(true);
        expect(permissionsDefault.devices_kvm).toBe(true);
        expect(permissionsDefault.devices_shm).toBe(true);
        expect(permissionsDefault.devices_usb).toBe(true);
        expect(permissionsDefault.devices_all).toBe(true);
        expect(permissionsDefault.features_bluetooth).toBe(true);
        expect(permissionsDefault.features_devel).toBe(true);
        expect(permissionsDefault.features_multiarch).toBe(true);
        expect(permissionsDefault.features_canbus).toBe(true);
        expect(permissionsDefault.features_per_app_dev_shm).toBe(true);
        expect(permissionsDefault.filesystems_host).toBe(true);
        expect(permissionsDefault.filesystems_host_os).toBe(true);
        expect(permissionsDefault.filesystems_host_etc).toBe(true);
        expect(permissionsDefault.filesystems_home).toBe(true);
        expect(permissionsDefault.filesystems_other).toEqual('');
        expect(permissionsDefault.session_talk).toEqual('org.test.Service-1');
        expect(permissionsDefault.session_own).toEqual('org.test.Service-2');
        expect(permissionsDefault.system_talk).toEqual('org.test.Service-3');
        expect(permissionsDefault.system_own).toEqual('org.test.Service-4');
        expect(permissionsDefault.persistent).toEqual('tset.;.test');
        expect(permissionsDefault.variables).toEqual('TEST=yes');
    });

    it('creates overrides when properties changed', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _overridenAppId;

        permissionsDefault.set_property('shared-network', false);
        permissionsDefault.set_property('sockets_x11', false);
        permissionsDefault.set_property('devices_dri', false);
        permissionsDefault.set_property('shared-network', false);
        permissionsDefault.set_property('features-bluetooth', false);
        permissionsDefault.set_property('filesystems-host', false);
        permissionsDefault.set_property('filesystems-other', '~/tset');
        permissionsDefault.set_property('session_talk', 'org.test.Service-3');
        permissionsDefault.set_property('session_own', 'org.test.Service-4');
        permissionsDefault.set_property('system_talk', 'org.test.Service-5');
        permissionsDefault.set_property('system_own', 'org.test.Service-6');
        permissionsDefault.set_property('persistent', 'tset.');
        permissionsDefault.set_property('variables', 'TEST=maybe');


        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(GLib.access(_overridenOverride, 0)).toEqual(0);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('reloads previous overrides later on', function() {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _overridenAppId;

        expect(permissionsDefault.shared_network).toBe(false);
        expect(permissionsDefault.shared_ipc).toBe(true);
        expect(permissionsDefault.sockets_x11).toBe(false);
        expect(permissionsDefault.sockets_fallback_x11).toBe(true);
        expect(permissionsDefault.sockets_wayland).toBe(true);
        expect(permissionsDefault.sockets_pulseaudio).toBe(true);
        expect(permissionsDefault.sockets_system_bus).toBe(true);
        expect(permissionsDefault.sockets_session_bus).toBe(true);
        expect(permissionsDefault.sockets_ssh_auth).toBe(true);
        expect(permissionsDefault.sockets_cups).toBe(true);
        expect(permissionsDefault.sockets_gpg_agent).toBe(true);
        expect(permissionsDefault.sockets_inherit_wayland_socket).toBe(true);
        expect(permissionsDefault.devices_dri).toBe(false);
        expect(permissionsDefault.devices_all).toBe(true);
        expect(permissionsDefault.features_bluetooth).toBe(false);
        expect(permissionsDefault.features_devel).toBe(true);
        expect(permissionsDefault.features_multiarch).toBe(true);
        expect(permissionsDefault.filesystems_host).toBe(false);
        expect(permissionsDefault.filesystems_host_os).toBe(false);
        expect(permissionsDefault.filesystems_host_etc).toBe(false);
        expect(permissionsDefault.filesystems_home).toBe(true);
        expect(permissionsDefault.filesystems_other).toEqual('~/tset');
        expect(permissionsDefault.session_talk).toEqual('org.test.Service-3');
        expect(permissionsDefault.session_own).toEqual('org.test.Service-4');
        expect(permissionsDefault.system_talk).toEqual('org.test.Service-5');
        expect(permissionsDefault.system_own).toEqual('org.test.Service-6');
        expect(permissionsDefault.persistent).toEqual('tset.');
        expect(permissionsDefault.variables).toEqual('TEST=maybe');
    });

    it('resets overrides', function() {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _overridenAppId;

        permissionsDefault.reset();

        expect(GLib.access(_overridenOverride, 0)).toEqual(-1);
    });

    it('creates overrides when properties values changed', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _overridenAppId;

        permissionsDefault.set_property('shared-network', false);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(GLib.access(_overridenOverride, 0)).toEqual(0);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('removes overrides when properties values restore', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _overridenAppId;

        permissionsDefault.set_property('shared-network', true);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(GLib.access(_overridenOverride, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('loads old filesystems overrides', function() {
        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _oldAppId;

        expect(permissionsDefault.filesystems_other).toEqual('xdg-pictures:ro');
    });

    it('reduces filesystems permission', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _reduceAppId;

        expect(permissionsDefault.filesystems_other).toEqual('xdg-downloads');

        permissionsDefault.set_property('filesystems-other', 'xdg-downloads:ro');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_reduceOverride, group, _key, 'xdg-downloads:ro')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('increases filesystems permission', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _increaseAppId;

        expect(permissionsDefault.filesystems_other).toEqual('xdg-pictures:ro');

        permissionsDefault.set_property('filesystems-other', 'xdg-pictures:rw');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_increaseOverride, group, _key, 'xdg-pictures:rw')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('increases filesystems permission (default)', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _increaseAppId;

        expect(permissionsDefault.filesystems_other).toEqual('xdg-pictures:ro');

        permissionsDefault.set_property('filesystems-other', 'xdg-pictures');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_increaseOverride, group, _key, 'xdg-pictures')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles negated filesystems permission', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _negationAppId;

        expect(permissionsDefault.filesystems_other).toEqual('!~/negative;~/positive');

        permissionsDefault.set_property('filesystems-other', '!~/negative');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_negationOverride, group, _key, '!~/positive')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles removing negated filesystems permission', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _negationAppId;

        expect(permissionsDefault.filesystems_other).toEqual('!~/negative;~/positive');

        permissionsDefault.set_property('filesystems-other', '~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_negationOverride, group, _key, '~/negative')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles adding negated filesystems override (manually)', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _negationAppId;

        expect(permissionsDefault.filesystems_other).toEqual('!~/negative;~/positive');

        permissionsDefault.set_property('filesystems-other', '!~/negative;!~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_negationOverride, group, _key, '!~/positive')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles removing negated filesystems override (manually)', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _negationAppId;

        expect(permissionsDefault.filesystems_other).toEqual('!~/negative;~/positive');

        permissionsDefault.set_property('filesystems-other', '~/negative;~/positive');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_negationOverride, group, _key, '~/negative')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('ignores unsupported permissions', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _unsupportedAppId;

        expect(permissionsDefault.filesystems_other).toEqual('~/unsupported');

        permissionsDefault.set_property('filesystems-other', '');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(hasOnly(_unsupportedOverride, group, _key, '!~/unsupported')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('preserves unsupported permissions', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _unsupportedAppId;

        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.set_property('filesystems-other', '');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_unsupportedOverride, 'Context', 'unsupported', 'always')).toBe(true);
            expect(has(_unsupportedOverride, 'Context', 'unsupported', 'undefined')).toBe(false);
            expect(has(_unsupportedOverride, 'Context', 'unsupported', 'null')).toBe(false);

            expect(has(_unsupportedOverride, 'Context', 'shared', 'unsupported')).toBe(true);
            expect(has(_unsupportedOverride, 'Context', 'shared', 'undefined')).toBe(false);
            expect(has(_unsupportedOverride, 'Context', 'shared', 'null')).toBe(false);

            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals changes with overrides', function(done) {
        spyOn(permissionsDefault, 'emit');

        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _basicAppId;

        permissionsDefault.set_property('shared-network', false);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(permissionsDefault.emit.calls.mostRecent().args).toEqual(['changed', true, false]);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals changes with no overrides', function() {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _basicAppId;

        spyOn(permissionsDefault, 'emit');

        permissionsDefault.reset();

        expect(permissionsDefault.emit.calls.first().args).toEqual(['changed', false, false]);
        expect(permissionsDefault.emit.calls.count()).toEqual(2); // including reset signal
    });

    it('signals changes with unsupported overrides', function() {
        spyOn(permissionsDefault, 'emit');

        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _unsupportedAppId;

        expect(permissionsDefault.emit.calls.mostRecent().args).toEqual(['changed', true, true]);
    });

    it('signals changes without unsupported overrides', function() {
        spyOn(permissionsDefault, 'emit');

        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _unsupportedAppId;

        expect(permissionsDefault.emit.calls.mostRecent().args).toEqual(['changed', false, false]);
    });

    it('saves pending updates before selecting other application', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _basicAppId;

        expect(permissionsDefault.shared_network).toEqual(true);

        permissionsDefault.set_property('shared-network', false);

        permissionsDefault.appId = _unsupportedAppId;

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(GLib.access(_basicOverride, 0)).toEqual(0);
            expect(GLib.access(_unsupportedOverride, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('saves pending updates before shutting down', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _basicAppId;

        expect(permissionsDefault.shared_network).toEqual(true);

        permissionsDefault.set_property('shared-network', false);

        permissionsDefault.shutdown();

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(GLib.access(_basicOverride, 0)).toEqual(0);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('disables all permissions with old flatpak version', function() {
        GLib.setenv('FLATPAK_INFO_PATH', _flatpakInfoOld, true);
        infoDefault.reload();
        portalsDefault.reload();
        permissionsDefault.appId = _basicAppId;

        const total = permissionsDefault.getAll().filter(p => p.supported).length;

        expect(total).toEqual(0);
    });

    it('enables all permissions with new flatpak version', function() {
        GLib.setenv('FLATPAK_INFO_PATH', _flatpakInfoNew, true);
        infoDefault.reload();
        portalsDefault.reload();
        permissionsDefault.appId = _basicAppId;

        const total = permissionsDefault.getAll().filter(p => p.supported).length;

        expect(total).toEqual(_totalPermissions);
    });

    it('disables permissions with stable flatpak version', function() {
        infoDefault.reload();
        portalsDefault.reload();
        permissionsDefault.appId = _basicAppId;

        const total = permissionsDefault.getAll().filter(p => p.supported).length;

        expect(total).toEqual(_totalPermissions - 11);
    });

    it('handles missing .flatpak-info', function() {
        GLib.setenv('FLATPAK_INFO_PATH', _none, true);
        infoDefault.reload();
        portalsDefault.reload();
        permissionsDefault.appId = _basicAppId;

        const total = permissionsDefault.getAll().filter(p => p.supported).length;

        expect(total).toEqual(_totalPermissions);
    });

    it('loads extra applications', function() {
        GLib.setenv('FLATPAK_CONFIG_DIR', _flatpakConfig, true);
        applicationsDefault.reload();

        const appIds = applicationsDefault.getAll().map(a => a.appId);
        expect(appIds).toContain(_extraAppId);
    });

    it('preserves installation priorities', function() {
        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        GLib.setenv('FLATPAK_CONFIG_DIR', _flatpakConfig, true);
        applicationsDefault.reload();

        permissionsDefault.appId = _extraAppId;

        expect(permissionsDefault.shared_network).toBe(false);
        expect(permissionsDefault.shared_ipc).toBe(true);
    });

    it('add new environment variable', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _environmentAppId;

        expect(permissionsDefault.variables).toEqual('TEST=yes');

        permissionsDefault.set_property('variables', 'TEST=yes;TEST2=no');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(hasOnly(_environmentOverride, 'Environment', 'TEST2', 'no')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('override original environment variable', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _environmentAppId;

        expect(permissionsDefault.variables).toEqual('TEST=yes');

        permissionsDefault.set_property('variables', 'TEST=no');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(hasOnly(_environmentOverride, 'Environment', 'TEST', 'no')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('remove original environment variable', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _environmentAppId;

        expect(permissionsDefault.variables).toEqual('TEST=yes');

        permissionsDefault.set_property('variables', '');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(hasOnly(_environmentOverride, 'Environment', 'TEST', '')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles re-loading removed variables', function() {
        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _variablesAppId;

        expect(permissionsDefault.variables).toEqual('');
    });

    it('handles non-valid environment variable', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _environmentAppId;

        expect(permissionsDefault.variables).toEqual('TEST=yes');

        permissionsDefault.set_property('variables', 'TEST=yes;TE ST=no');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(GLib.access(_environmentOverride, 0)).toEqual(-1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles RUST debug export environment variables', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _environmentAppId;

        expect(permissionsDefault.variables).toEqual('TEST=yes');

        permissionsDefault.set_property('variables', 'TEST=yes=no');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(hasOnly(_environmentOverride, 'Environment', 'TEST', 'yes=no')).toBe(true);

            permissionsDefault.appId = _environmentAppId;
            expect(permissionsDefault.variables).toEqual('TEST=yes=no');

            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });


    it('handles environment variables with semicolons', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _environmentAppId;

        expect(permissionsDefault.variables).toEqual('TEST=yes');

        permissionsDefault.set_property('variables', 'TEST=yes;no');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            permissionsDefault.appId = _environmentAppId;
            expect(permissionsDefault.variables).toEqual('TEST=yes;no');

            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('Add new well-known names', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _busAppId;

        expect(permissionsDefault.session_talk).toEqual('org.test.Service-1');
        expect(permissionsDefault.session_own).toEqual('org.test.Service-2');

        permissionsDefault.set_property('session-talk', 'org.test.Service-1;org.test.Service-3');
        permissionsDefault.set_property('session-own', 'org.test.Service-2;org.test.Service-4');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_busOverride, _sessionGroup, 'org.test.Service-1', 'talk')).toBe(false);
            expect(has(_busOverride, _sessionGroup, 'org.test.Service-2', 'own')).toBe(false);
            expect(has(_busOverride, _sessionGroup, 'org.test.Service-3', 'talk')).toBe(true);
            expect(has(_busOverride, _sessionGroup, 'org.test.Service-4', 'own')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('Remove well-known names', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _busAppId;

        expect(permissionsDefault.session_talk).toEqual('org.test.Service-1');
        expect(permissionsDefault.session_own).toEqual('org.test.Service-2');

        permissionsDefault.set_property('session-talk', '');
        permissionsDefault.set_property('session-own', '');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_busOverride, _sessionGroup, 'org.test.Service-1', 'none')).toBe(true);
            expect(has(_busOverride, _sessionGroup, 'org.test.Service-2', 'none')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('Modify well-known names', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _busAppId;

        expect(permissionsDefault.session_talk).toEqual('org.test.Service-1');
        expect(permissionsDefault.session_own).toEqual('org.test.Service-2');

        permissionsDefault.set_property('session-talk', 'org.test.Service-2');
        permissionsDefault.set_property('session-own', 'org.test.Service-1');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_busOverride, _sessionGroup, 'org.test.Service-1', 'own')).toBe(true);
            expect(has(_busOverride, _sessionGroup, 'org.test.Service-2', 'talk')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('signals reset when done explicitly', function() {
        spyOn(permissionsDefault, 'emit');

        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _basicAppId;

        permissionsDefault.reset();

        expect(permissionsDefault.emit.calls.mostRecent().args).toEqual(['reset']);
    });

    it('restores overrides when undo', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _basicAppId;

        expect(permissionsDefault.shared_network).toEqual(true);
        permissionsDefault.set_property('shared_network', false);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(permissionsDefault.shared_network).toBe(false);

            permissionsDefault.reset();
            expect(permissionsDefault.shared_network).toBe(true);

            permissionsDefault.undo();
            expect(permissionsDefault.shared_network).toBe(false);

            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles portals permissions', function(done) {
        permissionsDefault.appId = _basicAppId;

        expect(permissionsDefault.portals_background).toBe(portalState.UNSET);
        permissionsDefault.set_property('portals_background', portalState.ALLOWED);

        expect(permissionsDefault.portals_notification).toBe(portalState.UNSET);
        permissionsDefault.set_property('portals_notification', portalState.ALLOWED);

        expect(permissionsDefault.portals_microphone).toBe(portalState.UNSET);
        permissionsDefault.set_property('portals_microphone', portalState.ALLOWED);

        expect(permissionsDefault.portals_speakers).toBe(portalState.UNSET);
        permissionsDefault.set_property('portals_speakers', portalState.ALLOWED);

        expect(permissionsDefault.portals_camera).toBe(portalState.UNSET);
        permissionsDefault.set_property('portals_camera', portalState.ALLOWED);

        expect(permissionsDefault.portals_location).toBe(portalState.UNSET);
        permissionsDefault.set_property('portals_location', portalState.ALLOWED);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(getValueFromService('background', 'background', 'yes', _basicAppId)).toBe(true);
            expect(getValueFromService('notifications', 'notification', 'yes', _basicAppId)).toBe(true);
            expect(getValueFromService('devices', 'microphone', 'yes', _basicAppId)).toBe(true);
            expect(getValueFromService('devices', 'speakers', 'yes', _basicAppId)).toBe(true);
            expect(getValueFromService('devices', 'camera', 'yes', _basicAppId)).toBe(true);
            expect(getValueFromService('location', 'location', 'EXACT', _basicAppId)).toBe(true);

            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('resets portals permissions', function() {
        permissionsDefault.appId = _basicAppId;

        permissionsDefault.reset();

        expect(getValueFromService('background', 'background', null, _basicAppId)).toBe(true);
        expect(getValueFromService('notifications', 'notification', null, _basicAppId)).toBe(true);
        expect(getValueFromService('devices', 'microphone', null, _basicAppId)).toBe(true);
        expect(getValueFromService('devices', 'speakers', null, _basicAppId)).toBe(true);
        expect(getValueFromService('devices', 'camera', null, _basicAppId)).toBe(true);
        expect(getValueFromService('location', 'location', null, _basicAppId)).toBe(true);
    });


    it('restores portals permissions when undo', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _overridenAppId;

        expect(permissionsDefault.portals_background).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_notification).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_microphone).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_speakers).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_camera).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_location).toBe(portalState.UNSET);

        permissionsDefault.set_property('portals_notification', portalState.ALLOWED);
        permissionsDefault.set_property('portals_background', portalState.ALLOWED);
        permissionsDefault.set_property('portals_microphone', portalState.ALLOWED);
        permissionsDefault.set_property('portals_speakers', portalState.ALLOWED);
        permissionsDefault.set_property('portals_camera', portalState.ALLOWED);
        permissionsDefault.set_property('portals_location', portalState.ALLOWED);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(getValueFromService('background', 'background', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('notifications', 'notification', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'microphone', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'speakers', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'camera', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('location', 'location', 'EXACT', _overridenAppId)).toBe(true);

            permissionsDefault.reset();

            expect(getValueFromService('background', 'background', null, _overridenAppId)).toBe(true);
            expect(getValueFromService('notifications', 'notification', null, _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'microphone', null, _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'speakers', null, _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'camera', null, _overridenAppId)).toBe(true);
            expect(getValueFromService('location', 'location', null, _overridenAppId)).toBe(true);

            permissionsDefault.undo();

            expect(getValueFromService('background', 'background', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('notifications', 'notification', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'microphone', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'speakers', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('devices', 'camera', 'yes', _overridenAppId)).toBe(true);
            expect(getValueFromService('location', 'location', 'EXACT', _overridenAppId)).toBe(true);

            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('does not write to the store unnecessarily', function() {
        permissionsDefault.appId = _reduceAppId;

        expect(permissionsDefault.portals_background).toBe(portalState.UNSET);
        expect(getValueFromService('background', 'background', null, _reduceAppId)).toBe(true);
    });

    it('handles portals with partial tables on permission store', function() {
        partialService();

        GLib.setenv('FLATPAK_INFO_PATH', _flatpakInfoNew, true);
        infoDefault.reload();
        portalsDefault.reload();
        permissionsDefault.appId = _basicAppId;

        const total = permissionsDefault.getAll().filter(p => p.supported).length;

        expect(total).toEqual(_totalPermissions - 1);

        expect(permissionsDefault.portals_background).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_notification).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_microphone).toBe(portalState.UNSUPPORTED);
        expect(permissionsDefault.portals_speakers).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_camera).toBe(portalState.UNSET);
        expect(permissionsDefault.portals_location).toBe(portalState.UNSET);
    });

    it('handles writing to missing pair on permission store', function(done) {
        permissionsDefault.appId = _basicAppId;

        expect(permissionsDefault.portals_microphone).toBe(portalState.UNSUPPORTED);
        permissionsDefault.set_property('portals_microphone', portalState.ALLOWED);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(getValueFromService('devices', 'microphone', null, _basicAppId)).toBe(true);

            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles portals without permission store', function() {
        stopService();

        GLib.setenv('FLATPAK_INFO_PATH', _flatpakInfoNew, true);
        infoDefault.reload();
        portalsDefault.reload();
        permissionsDefault.appId = _basicAppId;

        const total = permissionsDefault.getAll().filter(p => p.supported).length;

        expect(total).toEqual(_totalPermissions - 6);

        expect(permissionsDefault.portals_background).toBe(portalState.UNSUPPORTED);
        expect(permissionsDefault.portals_notification).toBe(portalState.UNSUPPORTED);
        expect(permissionsDefault.portals_microphone).toBe(portalState.UNSUPPORTED);
        expect(permissionsDefault.portals_speakers).toBe(portalState.UNSUPPORTED);
        expect(permissionsDefault.portals_camera).toBe(portalState.UNSUPPORTED);
        expect(permissionsDefault.portals_location).toBe(portalState.UNSUPPORTED);
    });

    it('handles trailing semicolons', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _trailingSemicolonId;

        expect(permissionsDefault.shared_network).toBe(true);
        expect(permissionsDefault.shared_network).toBe(true);
        expect(permissionsDefault.variables).toEqual('TEST=;');

        /* force change to verify that there ins't unsupported permissions */
        spyOn(permissionsDefault, 'emit');
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.set_property('shared-network', false);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(permissionsDefault.emit.calls.mostRecent().args).toEqual(['changed', true, false]);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles loading filesystems with mode', function() {
        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _filesystemWithMode;

        expect(permissionsDefault.filesystems_other).toEqual('home:ro');
    });

    it('handles overriding filesystems with mode', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _filesystemWithMode;

        expect(permissionsDefault.filesystems_other).toEqual('host:ro;xdg-documents:ro;home:ro');
        permissionsDefault.set_property('filesystems-other', 'home:ro');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('filesystems-other');
            expect(has(_filesystemWithModeOverride, group, _key, '!host')).toBe(true);
            expect(has(_filesystemWithModeOverride, group, _key, '!xdg-documents')).toBe(true);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('loads global overrides', function() {
        GLib.setenv('FLATPAK_USER_DIR', _global, true);
        permissionsDefault.appId = _globalAppId;

        expect(permissionsDefault.sockets_x11).toBe(false);
        expect(permissionsDefault.sockets_wayland).toBe(true);
        expect(permissionsDefault.sockets_cups).toBe(true);
        expect(permissionsDefault.variables).toEqual('TEST1=global;TEST2=original;TEST3=global');
        expect(permissionsDefault.persistent).toEqual('.test1;.test2');
        expect(permissionsDefault.filesystems_other).toEqual('~/test2;~/test3');
        expect(permissionsDefault.session_talk).toEqual('org.test.Service-3');
        expect(permissionsDefault.session_own).toEqual('org.test.Service-2');
    });

    it('handles overriding apps already globally overridden', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _global, true);
        permissionsDefault.appId = _globalAppId;

        expect(permissionsDefault.sockets_x11).toBe(false);
        permissionsDefault.set_property('sockets-x11', true);

        expect(permissionsDefault.sockets_wayland).toBe(true);
        permissionsDefault.set_property('sockets-wayland', false);

        expect(permissionsDefault.sockets_cups).toBe(true);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = permissionsDefault.constructor.getGroupForProperty('sockets-x11');
            expect(has(_globalWithGlobalOverride, group, 'sockets', 'x11')).toBe(true);
            expect(has(_globalWithGlobalOverride, group, 'sockets', '!wayland')).toBe(true);
            expect(hasInTotal(_globalWithGlobalOverride)).toEqual(2);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles variables already globally overridden', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _global, true);
        permissionsDefault.appId = _globalAppId;

        expect(permissionsDefault.variables).toEqual('TEST1=global;TEST2=original;TEST3=global');
        permissionsDefault.set_property('variables', 'TEST2=override;TEST3=global;TEST4=override');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_globalWithGlobalOverride, 'Environment', 'TEST1', '')).toBe(true);
            expect(has(_globalWithGlobalOverride, 'Environment', 'TEST2', 'override')).toBe(true);
            expect(has(_globalWithGlobalOverride, 'Environment', 'TEST4', 'override')).toBe(true);
            expect(hasInTotal(_globalWithGlobalOverride)).toEqual(3);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles persistent path already globally overridden', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _global, true);
        permissionsDefault.appId = _globalAppId;

        expect(permissionsDefault.persistent).toEqual('.test1;.test2');
        permissionsDefault.set_property('persistent', '.test1;.test2;.test3');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_globalWithGlobalOverride, 'Context', 'persistent', '.test3')).toBe(true);
            expect(hasInTotal(_globalWithGlobalOverride)).toEqual(1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles filesystem path already globally overridden', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _global, true);
        permissionsDefault.appId = _globalAppId;

        expect(permissionsDefault.filesystems_other).toEqual('~/test2;~/test3');
        permissionsDefault.set_property('filesystems_other', '~/test4');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_globalWithGlobalOverride, 'Context', 'filesystems', '!~/test2')).toBe(true);
            expect(has(_globalWithGlobalOverride, 'Context', 'filesystems', '!~/test3')).toBe(true);
            expect(has(_globalWithGlobalOverride, 'Context', 'filesystems', '~/test4')).toBe(true);
            expect(hasInTotal(_globalWithGlobalOverride)).toEqual(3);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles well-known names already globally overridden', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _global, true);
        permissionsDefault.appId = _globalAppId;

        expect(permissionsDefault.session_talk).toEqual('org.test.Service-3');
        permissionsDefault.set_property('session_talk', 'org.test.Service-4');

        expect(permissionsDefault.session_own).toEqual('org.test.Service-2');
        permissionsDefault.set_property('session_own', 'org.test.Service-5');


        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            const group = 'Session Bus Policy';
            expect(has(_globalWithGlobalOverride, group, 'org.test.Service-3', 'none')).toBe(true);
            expect(has(_globalWithGlobalOverride, group, 'org.test.Service-4', 'talk')).toBe(true);
            expect(has(_globalWithGlobalOverride, group, 'org.test.Service-2', 'none')).toBe(true);
            expect(has(_globalWithGlobalOverride, group, 'org.test.Service-5', 'own')).toBe(true);
            expect(hasInTotal(_globalWithGlobalOverride)).toEqual(4);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('restores all overriden global overrides', function() {
        GLib.setenv('FLATPAK_USER_DIR', _global, true);
        permissionsDefault.appId = _globalRestoredAppId;

        expect(permissionsDefault.sockets_x11).toBe(true);
        expect(permissionsDefault.sockets_wayland).toBe(false);
        expect(permissionsDefault.sockets_cups).toBe(true);
        expect(permissionsDefault.variables).toEqual('TEST2=override;TEST3=global;TEST4=override');
        expect(permissionsDefault.persistent).toEqual('.test1;.test2;.test3');
        expect(permissionsDefault.filesystems_other).toEqual('~/test4');
        expect(permissionsDefault.session_talk).toEqual('org.test.Service-4');
        expect(permissionsDefault.session_own).toEqual('org.test.Service-5');
    });

    it('sets proper override statuses', function() {
        GLib.setenv('FLATPAK_USER_DIR', _statuses, true);
        permissionsDefault.appId = _statusesAppId;

        expect(permissionsDefault.sockets_cups_status).toEqual('original');
        expect(permissionsDefault.sockets_wayland_status).toEqual('global');
        expect(permissionsDefault.sockets_x11_status).toEqual('user');
        expect(permissionsDefault.variables_status).toEqual('original;global;user');
        expect(permissionsDefault.persistent_status).toEqual('original;global;user');
        expect(permissionsDefault.filesystems_other_status).toEqual('original;global;user');
        expect(permissionsDefault.session_talk_status).toEqual('original;global;user');
        expect(permissionsDefault.session_own_status).toEqual('original;global;user');
    });

    it('handles writting global overridden', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = 'global';

        expect(permissionsDefault.sockets_x11).toBe(false);
        permissionsDefault.set_property('sockets-x11', true);

        expect(permissionsDefault.variables).toEqual('');
        permissionsDefault.set_property('variables', 'TEST=override');

        expect(permissionsDefault.persistent).toEqual('');
        permissionsDefault.set_property('persistent', '.test');

        expect(permissionsDefault.filesystems_other).toEqual('');
        permissionsDefault.set_property('filesystems_other', '~/test');

        expect(permissionsDefault.session_talk).toEqual('');
        permissionsDefault.set_property('session_talk', 'org.test.Talk');

        expect(permissionsDefault.session_own).toEqual('');
        permissionsDefault.set_property('session_own', 'org.test.Own');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_globalOverride, 'Context', 'sockets', 'x11')).toBe(true);
            expect(has(_globalOverride, 'Environment', 'TEST', 'override')).toBe(true);
            expect(has(_globalOverride, 'Context', 'persistent', '.test')).toBe(true);
            expect(has(_globalOverride, 'Context', 'filesystems', '~/test')).toBe(true);
            expect(has(_globalOverride, 'Session Bus Policy', 'org.test.Talk', 'talk')).toBe(true);
            expect(has(_globalOverride, 'Session Bus Policy', 'org.test.Own', 'own')).toBe(true);
            expect(hasInTotal(_globalOverride)).toEqual(6);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('preserves negated global overridden', function(done) {
        const source = Gio.File.new_for_path(_globalNegatedOverride);
        const destination = Gio.File.new_for_path(_globalOverride);
        source.copy(destination, Gio.FileCopyFlags.NONE, null, null);

        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = 'global';

        expect(permissionsDefault.sockets_x11).toBe(false);
        expect(permissionsDefault.filesystems_other).toEqual('!~/test');
        expect(permissionsDefault.variables).toEqual('');
        expect(permissionsDefault.session_talk).toEqual('');
        expect(permissionsDefault.session_own).toEqual('');

        permissionsDefault.set_property('shared-network', true);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_globalOverride, 'Context', 'shared', 'unsupported')).toBe(true);
            expect(has(_globalOverride, 'Context', 'shared', 'network')).toBe(true);
            expect(has(_globalOverride, 'Context', 'sockets', '!x11')).toBe(true);
            expect(has(_globalOverride, 'Context', 'filesystems', '!~/test')).toBe(true);
            expect(has(_globalOverride, 'Environment', 'TEST', '')).toBe(true);
            expect(has(_globalOverride, 'Session Bus Policy', 'org.test.Test', 'none')).toBe(true);
            expect(hasInTotal(_globalOverride)).toEqual(6);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles weird interactions with reset mode', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _resetModeId;

        expect(permissionsDefault.filesystems_host).toBe(true);
        expect(permissionsDefault.filesystems_other).toEqual('');
        permissionsDefault.set_property('filesystems_other', '!host:reset');

        expect(permissionsDefault.sockets_x11).toBe(false);
        permissionsDefault.set_property('sockets_x11', true);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_resetModeOverride, 'Context', 'sockets', 'x11')).toBe(true);
            expect(has(_resetModeOverride, 'Context', 'filesystems', '!host:reset')).toBe(true);
            expect(hasInTotal(_resetModeOverride)).toEqual(2);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles weird interactions with global reset mode', function(done) {
        const source = Gio.File.new_for_path(_globalResetModeOverride);
        const destination = Gio.File.new_for_path(_globalOverride);
        source.copy(destination, Gio.FileCopyFlags.NONE, null, null);

        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);
        permissionsDefault.appId = _resetModeId;

        expect(permissionsDefault.filesystems_host).toBe(true);
        expect(permissionsDefault.filesystems_other).toEqual('!host:reset');

        expect(permissionsDefault.sockets_x11).toBe(false);
        permissionsDefault.set_property('sockets_x11', true);

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            expect(has(_resetModeOverride, 'Context', 'sockets', 'x11')).toBe(true);
            expect(hasInTotal(_resetModeOverride)).toEqual(1);
            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles global overrides that negate filesystems with mode', function(done) {
        GLib.setenv('FLATPAK_USER_DIR', _tmp, true);

        permissionsDefault.appId = _filesystemWithMode;
        expect(permissionsDefault.filesystems_other).toEqual('host:ro;xdg-documents:ro;home:ro');

        permissionsDefault.appId = 'global';
        expect(permissionsDefault.filesystems_other).toEqual('');
        permissionsDefault.set_property('filesystems_other', '!host');

        GLib.timeout_add(GLib.PRIORITY_HIGH, delay + 1, () => {
            permissionsDefault.appId = _filesystemWithMode;
            expect(permissionsDefault.filesystems_other).toEqual('xdg-documents:ro;home:ro');

            done();
            return GLib.SOURCE_REMOVE;
        });

        update();
    });

    it('handles malformed overrides', function() {
        spyOn(permissionsDefault, 'emit');

        GLib.setenv('FLATPAK_USER_DIR', _user, true);
        permissionsDefault.appId = _malformedAppId;

        expect(permissionsDefault.emit.calls.first().args).toEqual(['failed']);
    });
});
