# Documentation

## Flatseal permissions

This section indicates the permissions of Flatpak with better integration with Flatseal. It is based on the official [Sandbox Permissions Reference](https://docs.flatpak.org/en/latest/sandbox-permissions-reference.html).

Flatseal follows the same concept as `flatpak-override`: overriding the default permissions that the Flatpak program originally shipped with. Every change the user does will trigger Flatseal to output the overriden permissions in the `~/.local/share/flatpak/overrides` directory.

If you want to read more into Flatseal's permissions, you can look at the [Permissions section](#permissions).

If you want to read more into `flatpak override`, you can look at the [`flatpak-override` documentation](https://docs.flatpak.org/en/latest/flatpak-command-reference.html#flatpak-override).


### Permissions

#### Share

List of subsystems shared with the host system.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
Network | `--share=network` and `--unshare=network` | Toggle | Permit (`--share=network`) or prohibit (`--unshare=network`) access to the network.
[Inter-process communications](https://en.wikipedia.org/wiki/Inter-process_communication) | `--share=ipc` and `--unshare=ipc` | Toggle | Share (`--share=ipc`) or unshare (`--unshare=ipc`) IPC namespace with the host.

#### Socket

List of well-known sockets available in the sandbox.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
X11 windowing system | `--socket=x11` and `--nosocket=x11` | Toggle | Permit (`--socket=x11`) or prohibit (`--nosocket=x11`) access to the application to show windows using X11 (`--socket=x11`).
Wayland windowing system | `--socket=wayland` and `--nosocket=wayland` | Toggle | Permit (`--socket=wayland`) or prohibit (`--nosocket=wayland`) access to the application to show windows using Wayland.
Fallback to X11 windowing system | `--socket=fallback-x11` and `--nosocket=fallback-x11` | Toggle | Permit (`--socket=fallback-x11`) or prohibit (`--nosocket=fallback-x11`) access to the application to show windows using X11 if Wayland is not available. **This overrides `--socket=x11` when used.**
PulseAudio sound server | `--socket=pulseaudio` and `--nosocket=pulseaudio` | Toggle | Permit (`--socket=pulseaudio`) or prohibit (`--nosocket=pulseaudio`) the application to play sounds that use PulseAudio.
D-Bus session bus | `--socket=session-dbus` and `--nosocket=session-dbus` | Toggle | Permit access to the application to the entire session bus (`--socket=session-dbus`); prohibit access to the application to the entire session bus (`--nosocket=session-dbus`).
D-Bus system bus | `--socket=system-dbus` and `--nosocket=system-dbus` | Toggle | Permit (`--socket=session-dbus`) or prohibit (`--nosocket=session-dbus`) access to the application to the entire system bus.
Secure Shell agent | `--socket=ssh-auth` and `--nosocket=ssh-auth` | Toggle | Permit (`--socket=ssh-auth`) or prohibit (`--nosocket=ssh-auth`) access to the application to SSH authentications.
Smart cards | `--socket=pcsc` and `--nosocket=pcsc` | Toggle | Permit (`--socket=pcsc`) or prohibit (`--nosocket=pcsc`) access to the application to smart cards.
Printing system | `--socket=cups` and `--nosocket=cups` | Toggle | Permit (`--socket=cups`) or prohibit (`--nosocket=cups`) access to the application to printing systems.

#### Device

List of devices available in the sandbox.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
GPU acceleration | `--device=dri` and `--nodevice=dri` | Toggle | Permit (`--device=dri`) or prohibit (`--nodevice=dri`) access to the application to graphics direct rendering located at `/dev/dri`.
Virtualization | `--device=kvm` and `--nodevice=kvm` | Toggle | Permit (`--device=kvm`) or prohibit (`--nodevice=kvm`) access to the application to virtualization.
Shared memory | `--device=shm` and `--nodevice=shm` | Toggle | Permit (`--device=shm`) or prohibit (`--nodevice=shm`) access to the application to shared memory.
All devices | `--device=all` and `--nodevice=all` | Toggle | Permit (`--device=all`) or prohibit (`--nodevice=all`) access to the application to all devices.

#### Allow

List of features available to the application.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
Development syscalls | `--allow=devel` and `--disallow=devel` | Toggle | [NEEDS DESCRIPTION]
Programs from other architectures | `--allow=multiarch` and `--disallow=multiarch` | Toggle | [NEEDS DESCRIPTION]
Bluetooth | `--allow=bluetooth` and `--disallow=bluetooth` | Toggle | Permit (`--allow=bluetooth`) or prohibit (`--disallow=bluetooth`) access to the application to use bluetooth.
Controller Area Network bus | `--allow=canbus` and `--disallow=canbus` | Toggle | [NEEDS DESCRIPTION]

#### Filesystem

List of filesystem subsets available to the application.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
All filesystem files | `--filesystem=host` and `--nofilesystem=host` | Toggle | Permit (`--filesystem=host`) or prohibit (`--nofilesystem=host`) read-write access to the application to the whole filesystem. If it is permitted, the application has read-write access to every file and folder owned by you, the user. The rest will be read-only.
All system libraries, executables and static data | `--filesystem=host-os` and `--nofilesystem=host-os` | Toggle | Permit (`--filesystem=host-os`) or prohibit (`--nofilesystem=host-os`) read-write access to the application to system libraries located in `/usr`. Since this directory requires root access to write, the permission will be read-only.
All system configurations | `--filesystem=host-etc` and `--nofilesystem=host-etc` | Toggle | Permit (`--filesystem=host-etc`) or prohibit (`--nofilesystem=host-etc`) read-write access to the application to system configurations located in `/etc`. Since this directory requires root access to write, the permission will be read-only.
All user files | `--filesystem=home` and `--nofilesystem=home` | Toggle | Permit (`filesystem=home`) or prohibit (`--nofilesystem=home`) read-write access to the application to the user directory (`$HOME`).
Other files | `--filesystem=[PATH]`, `--filesystem=[PATH]:ro` and `--nofilesystem=[PATH]` | Input | Permit (`--filesystem=[PATH]`) or prohibit `--nofilesystem=[PATH]` read-write access to the application to the directory you desire, for example in Flatseal, you would put `~/games` (`--filesystem=~/games` using `flatpak override`) in the box if you want read-write access to `~/games`. If you want read-only access (`ro`), then you want append `:ro`, for example in Flatseal, you would put `~/games:ro` (`--filesystem=~/games:ro` using `flatpak override`) if you want read-only access to `~/games`.


## Tips and Tricks

### Manually reset Flatseal permissions

If permissions are removed and is no longer possible to reset, run the following command from the terminal and re-start Flatseal:

```
$ rm ~/.local/share/flatpak/overrides/com.github.tchx84.Flatseal
```

### Translations

Add a new language and update translations:

```
$ echo "es" >> po/LINGUAS
$ ninja flatseal-pot
$ ninja flatseal-update-po
```

To test the translation language:

```
$ flatpak config --set extra-languages es
$ flatpak update org.gnome.Platform
$ LC_ALL=es_PY.UTF-8 flatpak run com.github.tchx84.Flatseal
```

### Enable custom installations

To enable a custom installation, e.g, `/xusr/custom/flatpak`.

#### Flatpak 1.7.1 or newer:

1. Launch Flatseal and select it to edit its own permissions.
2. Enable `host-etc`, or type in `host-etc:ro` in the other option.
3. Type in the custom installation path, e.g, `/xusr/custom/flatpak:ro`.
4. Restart Flatseal.

#### All versions

1. Launch Flatseal and select it to edit its own permissions.
2. Enable `host`, or type in `host:ro` in the other option.
3. Restart Flatseal.

**NOTE**: To find these installations, Flatseal needs access to `/etc/flatpak/installations.d`. Before Flatpak 1.7.1, accessing the host `/etc` required the `host` permission, which was an all-or-nothing situation. By default, Flatseal will have minimal permissions, so it's up to the user to decide to enable this feature.
