/* exported FlatpakPermission getPermissionClass */

/* permissionValue.js
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

const {GObject} = imports.gi;

const {FlatsealOverrideStatus} = imports.models.overrideStatus;
const {FlatpakPortalsModel} = imports.models.portals;

const FLAGS = GObject.ParamFlags.READWRITE;

/* Groups everything known about a single permission. Only the value
 * can be changed by the user, the status is set by the permissions
 * model and is only meant to be displayed. */
var FlatpakPermission = GObject.registerClass({
    GTypeName: 'FlatpakPermission',
    Properties: {
        status: GObject.ParamSpec.string(
            'status', 'status', 'status',
            FLAGS, FlatsealOverrideStatus.ORIGINAL),
    },
}, class FlatpakPermission extends GObject.Object {});

const FlatpakBooleanPermission = GObject.registerClass({
    GTypeName: 'FlatpakBooleanPermission',
    Properties: {
        value: GObject.ParamSpec.boolean(
            'value', 'value', 'value',
            FLAGS, false),
    },
}, class FlatpakBooleanPermission extends FlatpakPermission {});

/* This permission is only used by models that support conditionals. */
const FlatpakConditionalPermission = GObject.registerClass({
    GTypeName: 'FlatpakConditionalPermission',
    Properties: {
        conditional: GObject.ParamSpec.string(
            'conditional', 'conditional', 'conditional',
            FLAGS, ''),
    },
}, class FlatpakConditionalPermission extends FlatpakBooleanPermission {});

const FlatpakStringPermission = GObject.registerClass({
    GTypeName: 'FlatpakStringPermission',
    Properties: {
        value: GObject.ParamSpec.string(
            'value', 'value', 'value',
            FLAGS, ''),
    },
}, class FlatpakStringPermission extends FlatpakPermission {});

const FlatpakPortalPermission = GObject.registerClass({
    GTypeName: 'FlatpakPortalPermission',
    Properties: {
        value: GObject.ParamSpec.int(
            'value', 'value', 'value',
            FLAGS,
            FlatpakPortalsModel.getMin(),
            FlatpakPortalsModel.getMax(),
            FlatpakPortalsModel.getDefault()),
    },
}, class FlatpakPortalPermission extends FlatpakPermission {});

/* Conditionals only apply to on/off permissions. */
function getPermissionClass(value, conditional) {
    if (typeof value === 'boolean' && conditional)
        return FlatpakConditionalPermission;
    if (typeof value === 'boolean')
        return FlatpakBooleanPermission;
    if (typeof value === 'string')
        return FlatpakStringPermission;
    if (typeof value === 'number')
        return FlatpakPortalPermission;
    return null;
}
