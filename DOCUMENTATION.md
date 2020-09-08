# Documentation

## Flatseal permissions

This section indicates the permissions of Flatpak with better integration with Flatseal. It is based on the official [Sandbox Permissions Reference](https://docs.flatpak.org/en/latest/sandbox-permissions-reference.html).

Flatseal follows the same concept as `flatpak-override`: overriding the default permissions that the Flatpak program originally shipped with. Every change the user does will trigger Flatseal to output the overriden permissions in the `~/.local/share/flatpak/overrides` directory.

If you want to read more into Flatseal's permissions, you can look at the [Permissions section](#permissions).

If you want to read more into `flatpak override`, you can look at the [`FLATPAK OVERRIDE(1)` manpage](https://manpages.debian.org/testing/flatpak/flatpak-override.1.en.html).

### Permissions

#### Share

List of subsystems shared with the host system.

Name | Permission(s) | Type | Description
--- | --- | --- | ---
Network | `--share=network` and `--unshare=network` | Toggle | Permit access to the network (`--share=network`); prohibit access to the network (`--unshare=network`).
[Inter-process communications](https://en.wikipedia.org/wiki/Inter-process_communication) | `--share=ipc` and `--unshare=ipc` | Toggle | Share IPC namespace with the host (`--share=ipc`); unshare IPC namespace with the host (`--unshare=ipc`).

#### Socket

List of well-known sockets available in the sandbox.

Name | Permission(s) | Type | Description
--- | --- | --- | ---
X11 windowing system | `--socket=x11` and `--nosocket=x11` | Toggle | Permit access to the application to show windows using X11 (`--socket=x11`); prohibit access to the application from showing windows using X11 (`--nosocket=x11`).
Wayland windowing system | `--socket=wayland` and `--nosocket=wayland` | Toggle | Permit access to the application to show windows using Wayland (`--socket=wayland`); prohibit access to the application from showing windows using Wayland (`--nosocket=wayland`).
Fallback to X11 windowing system | `--socket=fallback-x11` and `--nosocket=fallback-x11` | Toggle | Permit access to the application to show windows using X11 if Wayland is not available, this overrides `--socket=x11` when used.
PulseAudio sound server | `--socket=pulseaudio` and `--nosocket=pulseaudio` | Toggle | Permit the application to play sounds that use PulseAudio (`--socket=pulseaudio`); prohibit the application from playing sounds that use PulseAudio (`--nosocket=pulseaudio`).
D-Bus session bus | `--socket=session-dbus` and `--nosocket=session-dbus` | Toggle | Permit access to the application to the entire session bus (`--socket=session-dbus`); prohibit access to the application to the entire session bus (`--nosocket=session-dbus`).
D-Bus system bus | `--socket=system-dbus` and `--nosocket=system-dbus` | Toggle | Permit access to the application to the entire system bus (`--socket=session-dbus`); prohibit access to the application to the entire system bus (`--nosocket=session-dbus`).
Secure Shell agent | `--socket=ssh-auth` and `--nosocket=ssh-auth` | Toggle | Permit access to the application to SSH authentications (`--socket=ssh-auth`); prohibit access to the application to SSH authentications (`--nosocket=ssh-auth`).
Smart cards | `--socket=pcsc` and `--nosocket=pcsc` | Toggle | Permit access to the application to smart cards (`--socket=pcsc`); prohibit access to the application to smart cards (`--nosocket=pcsc`).
Printing system | `--socket=cups` and `--nosocket=cups` | Toggle | Permit access to the application to printing systems (`--socket=cups`); prohibit access to the application to printing systems (`--nosocket=cups`).

#### Device

List of devices available in the sandbox.

Name | Permission(s) | Type | Description
--- | --- | --- | ---
GPU acceleration | `--device=dri` and `--nodevice=dri` | Toggle | Permit access to the application to graphics direct rendering located at `/dev/dri` (`--device=dri`); prohibit access to the application to graphics direct rendering (`--nodevice=dri`).
Virtualization | `--device=kvm` and `--nodevice=kvm` | Toggle | Permit access to the application to virtualization (`--device=kvm`); prohibit access to the application to virtualization (`--nodevice=kvm`).
Shared memory | `--device=shm` and `--nodevice=shm` | Toggle | Permit access to the application to shared memory (`--device=shm`); prohibit access to the application to shared memory (`--nodevice=shm`).
All devices | `--device=all` and `--nodevice=all` | Toggle | Permit access to the application to all devices (`--device=all`); prohibit access to the application to all devices (`--nodevice=all`).

#### Allow

List of features available to the application.

Name | Permission(s) | Type | Description
--- | --- | --- | ---
Development syscalls | `--allow=devel` and `--disallow=devel` | Toggle | [NEEDS DESCRIPTION]
Programs from other architectures | `--allow=multiarch` and `--disallow=multiarch` | Toggle | [NEEDS DESCRIPTION]
Bluetooth | `--allow=bluetooth` and `--disallow=bluetooth` | Toggle | Permit access to use bluetooth (`--allow=bluetooth`); prohibit access to use bluetooth (`--disallow=bluetooth`).
Controller Area Network bus | `--allow=canbus` and `--disallow=canbus` | Toggle | [NEEDS DESCRIPTION]

#### Filesystem

List of filesystem subsets available to the application.

Name | Permission(s) | Type | Description
--- | --- | --- | ---
All filesystem files | `--filesystem=host` and `--nofilesystem=host` | Toggle | Permit read-write access to the application to the whole filesystem (excluding directories or files owned by other groups) (`--filesystem=host`); prohibit read-write acess to the application to the whole filesystem (`--nofilesystem=host`). 
All system libraries, executables and static data | `--filesystem=host-os` and `--nofilesystem=host-os` | Toggle | [NEEDS DESCRIPTION]
All system configurations | `--filesystem=host-etc` and `--nofilesystem=host-etc` | Toggle | [NEEDS DESCRIPTION]
All user files | `--filesystem=home` and `--nofilesystem=home` | Toggle | Permit read-write access to the application to the user directory (`$HOME`) (`filesystem=home`); prohibit read-write access to the application to the user directory (`$HOME`) (`--nofilesystem=home`). 
Other files | `--filesystem=[DIRECTORY]`, `--filesystem=[DIRECTORY]:ro` and `--nofilesystem=[DIRECTORY]` | Input | [NEEDS DESCRIPTION]


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
