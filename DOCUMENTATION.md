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
Network | `--share=network` and `--unshare=network` | Toggle | Allow (`--share=network`) or prohibit (`--unshare=network`) access to the network.
[Inter-process communications](https://en.wikipedia.org/wiki/Inter-process_communication) | `--share=ipc` and `--unshare=ipc` | Toggle | Share (`--share=ipc`) or unshare (`--unshare=ipc`) IPC namespace with the host.

#### Socket

List of well-known sockets available in the sandbox.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
X11 windowing system | `--socket=x11` and `--nosocket=x11` | Toggle | Allow (`--socket=x11`) or prohibit (`--nosocket=x11`) access to the application to show windows using X11 (`--socket=x11`).
Wayland windowing system | `--socket=wayland` and `--nosocket=wayland` | Toggle | Allow (`--socket=wayland`) or prohibit (`--nosocket=wayland`) access to the application to show windows using Wayland.
Fallback to X11 windowing system | `--socket=fallback-x11` and `--nosocket=fallback-x11` | Toggle | Allow (`--socket=fallback-x11`) or prohibit (`--nosocket=fallback-x11`) access to the application to show windows using X11 if Wayland is not available. **This overrides `--socket=x11` when used.**
PulseAudio sound server | `--socket=pulseaudio` and `--nosocket=pulseaudio` | Toggle | Allow (`--socket=pulseaudio`) or prohibit (`--nosocket=pulseaudio`) the application to play sounds that use PulseAudio.
D-Bus session bus | `--socket=session-dbus` and `--nosocket=session-dbus` | Toggle | Allow access to the application to the entire session bus (`--socket=session-dbus`); prohibit access to the application to the entire session bus (`--nosocket=session-dbus`).
D-Bus system bus | `--socket=system-dbus` and `--nosocket=system-dbus` | Toggle | Allow (`--socket=session-dbus`) or prohibit (`--nosocket=session-dbus`) access to the application to the entire system bus.
Secure Shell agent | `--socket=ssh-auth` and `--nosocket=ssh-auth` | Toggle | Allow (`--socket=ssh-auth`) or prohibit (`--nosocket=ssh-auth`) access to the application to SSH authentications.
Smart cards | `--socket=pcsc` and `--nosocket=pcsc` | Toggle | Allow (`--socket=pcsc`) or prohibit (`--nosocket=pcsc`) access to the application to smart cards.
Printing system | `--socket=cups` and `--nosocket=cups` | Toggle | Allow (`--socket=cups`) or prohibit (`--nosocket=cups`) access to the application to printing systems.

#### Device

List of devices available in the sandbox.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
GPU acceleration | `--device=dri` and `--nodevice=dri` | Toggle | Allow (`--device=dri`) or prohibit (`--nodevice=dri`) access to the application to graphics direct rendering located at `/dev/dri`.
Virtualization | `--device=kvm` and `--nodevice=kvm` | Toggle | Allow (`--device=kvm`) or prohibit (`--nodevice=kvm`) access to the application to virtualization.
Shared memory | `--device=shm` and `--nodevice=shm` | Toggle | Allow (`--device=shm`) or prohibit (`--nodevice=shm`) access to the application to shared memory.
All devices | `--device=all` and `--nodevice=all` | Toggle | Allow (`--device=all`) or prohibit (`--nodevice=all`) access to the application to all devices.

#### Allow

List of features available to the application.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
Development syscalls | `--allow=devel` and `--disallow=devel` | Toggle | Allow (`--allow=devel`) or prohibit (`--disallow=devel`) access to the application to certain syscalls such as [`ptrace()`](https://en.wikipedia.org/wiki/Ptrace) and [`perf_event_open()`](https://en.wikipedia.org/wiki/Perf_(Linux)).
Programs from other architectures | `--allow=multiarch` and `--disallow=multiarch` | Toggle | Allow (`--allow=multiarch`) or prohibit (`--disallow=multiarch`) access to the application to execute programs for an [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) other than the one supported natively by the system.
Bluetooth | `--allow=bluetooth` and `--disallow=bluetooth` | Toggle | Allow (`--allow=bluetooth`) or prohibit (`--disallow=bluetooth`) access to the application to use bluetooth.
Controller Area Network bus | `--allow=canbus` and `--disallow=canbus` | Toggle | Allow (`--allow=canbus`) or prohibit (`--disallow=canbus`) access to the application to use canbus sockets. You must also have network access for this to work.

#### Filesystem

List of filesystem subsets available to the application.

Name | `flatpak override` equivalent | Type | Description
--- | --- | --- | ---
All filesystem files | `--filesystem=host` and `--nofilesystem=host` | Toggle | Allow (`--filesystem=host`) or prohibit (`--nofilesystem=host`) read-write access to the application to the whole filesystem. If it is allowed, the application has read-write access to every file and folder owned by you, the user. The rest will be read-only.
All system libraries, executables and static data | `--filesystem=host-os` and `--nofilesystem=host-os` | Toggle | Allow (`--filesystem=host-os`) or prohibit (`--nofilesystem=host-os`) read-write access to the application to system libraries located in `/usr`. Since this directory requires root access to write, the permission will be read-only.
All system configurations | `--filesystem=host-etc` and `--nofilesystem=host-etc` | Toggle | Allow (`--filesystem=host-etc`) or prohibit (`--nofilesystem=host-etc`) read-write access to the application to system configurations located in `/etc`. Since this directory requires root access to write, the permission will be read-only.
All user files | `--filesystem=home` and `--nofilesystem=home` | Toggle | Allow (`filesystem=home`) or prohibit (`--nofilesystem=home`) read-write access to the application to the user directory (`$HOME`).
Other files | `--filesystem=[PATH]`, `--filesystem=[PATH]:ro` and `--nofilesystem=[PATH]` | Input | Allow (`--filesystem=[PATH]`) or prohibit (`--nofilesystem=[PATH]`) read-write access to the application to the directory you desire. <br /> <br /> For example, you would put `~/games` if you want read-write access to `~/games`. If you want read-only (`ro`) access to `~/games`, then it will be `~/games:ro`.

#### Persistent

List of the homedir-relative paths created in the sandbox.

Name | `flatpak-override` equivalent | Type | Description
--- | --- | --- | ---
Files | `--persist=[PATH]` | Input | Allow only to the application to have access to the targeted directory while restricting other applications from accessing it. <br /> <br /> Starting from `$HOME`, the targeted directory will be remapped to the application's directory (`~/.var/app/$FLATPAK_APP_ID/[PATH]`) if it has no write access to the targeted directory. <br /> <br /> For example, persisting `.mozilla` will map `~/.mozilla` to `~/.var/app/org.mozilla.Firefox/.mozilla` if the Firefox Flatpak has no write access to `~/.mozilla`.

#### Environment

List of variables exported to the application.

Name | `flatpak-override` equivalent | Type | Description
--- | --- | --- | ---
Variables | `--env=[VAR]=[VALUE]` | Input | Set an environment variable in the application.

#### System Bus

List of well-known names on the system bus.

Name | `flatpak-override` equivalent | Type | Description
--- | --- | --- | ---
Talks | `--system-talk-name=[NAME]` | Input | Allow the application to talk to system services. <br /> <br /> For example, adding `org.freedesktop.Notifications` will allow the application to send notifications.
Owns | `--system-own-name=[NAME]` | Input | Allow the application to own system services under the given name.

#### Session Bus

List of well-known names on the session bus.

Name | `flatpak-override` equivalent | Type | Description
--- | --- | --- | ---
Talks | `--talk-name=[NAME]` | Input | Allow the application to talk to session services. <br /> <br /> For example, adding `org.freedesktop.Notifications` will allow the application to send notifications.
Owns | `--own-name=[NAME]` | Input | Allow the application to own session services under the given name.


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
