# Documentation

## Table of contents

- [Permissions](#permissions)
	- [Share](#share)
	- [Socket](#socket)
	- [Device](#device)
	- [Allow](#allow)
	- [Filesystem](#filesystem)
	- [Persistent](#persistent)
	- [Environment](#environment)
	- [System Bus](#system-bus)
	- [Session Bus](#system-bus)
- [Tips and Tricks](#tips-and-tricks)
	- [Manually reset Flatseal permissions](#manually-reset-flatseal-permissions)
	- [Add new translations](#add-new-translations)
	- [Enable custom installations](#enable-custom-installations)
	- [Use custom FLATPAK_USER_DIR](#use-custom-flatpak_user_dir)

## Permissions

This is the list of permissions supported by Flatseal. These descriptions are based on Flatpak's [official documentation](https://docs.flatpak.org/en/latest/sandbox-permissions-reference.html) and extended with examples and references to make it easier for newcomers to understand.

Both Flatseal and `flatpak override` command-line tool, use the same overrides backend e.g. both write to `~/.local/share/flatpak/overrides`. A `flatpak override` equivalent column is added for those experienced with this tool.

### Share

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Network | Toggle | Allow the application to have access to the network. <br /> <br /> For example, if it's disabled for Firefox, it will no longer be possible to browse the internet with this application. | `--share=network` and `--unshare=network`
[Inter-process communications](https://en.wikipedia.org/wiki/Inter-process_communication) | Toggle | Share IPC namespace with the host. <br /> <br /> This is required by X11 due to it depending on IPC. | `--share=ipc` and `--unshare=ipc`

### Socket

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
X11 windowing system | Toggle | Allow the application to open in an X11 window. <br /> <br /> Most applications use X11 for historical reasons, but is considered less secure. | `--socket=x11` and `--nosocket=x11`
Wayland windowing system | Toggle | Allow the application to open in a Wayland window. <br /> <br /> Many applications do not use Wayland as it is a newer display protocol unlike X11, and is considered more secure, but either some applications require extra steps to use it (see [environment variables](#environment) example for Firefox), or do not support Wayland at all. | `--socket=wayland` and `--nosocket=wayland`
Fallback to X11 windowing system | Toggle | Allow the application to open in an X11 window when Wayland is not available. This overrides the X11 windowing system option when enabled. | `--socket=fallback-x11` and `--nosocket=fallback-x11`
PulseAudio sound server | Toggle | Allow the application to play sounds when using PulseAudio. | `--socket=pulseaudio` and `--nosocket=pulseaudio`
D-Bus session bus | Toggle | Allow the application to have access to the entire session bus. | `--socket=session-dbus` and `--nosocket=session-dbus`
D-Bus system bus | Toggle | Allow the application to have access to the entire system bus. | `--socket=system-dbus` and `--nosocket=system-dbus`
Secure Shell agent | Toggle | Allow the application to use SSH authentications. | `--socket=ssh-auth` and `--nosocket=ssh-auth`
[Smart cards](https://wiki.debian.org/Smartcards) | Toggle | Allow the application to use smart cards. | `--socket=pcsc` and `--nosocket=pcsc`
Printing system | Toggle | Allow the application to use printing systems. <br /> <br /> For example, if it's disabled for Firefox, it will no longer possible to browse the internet with this application. | `--socket=cups` and `--nosocket=cups`

### Device

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
GPU acceleration | Toggle | Allow the application to access the graphics direct rendering to take advantage of GPU acceleration. | `--device=dri` and `--nodevice=dri`
Virtualization | Toggle | Allow the application to support virtualization. | `--device=kvm` and `--nodevice=kvm`
Shared memory | Toggle | Allow the application to access shared memory. | `--device=shm` and `--nodevice=shm`
All devices | Toggle | Allow the application to access to all devices, such as webcam and external devices. | `--device=all` and `--nodevice=all`

### Allow

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Development syscalls | Toggle | Allow the application to access to certain syscalls, such as [`ptrace()`](https://en.wikipedia.org/wiki/Ptrace) and [`perf_event_open()`](https://en.wikipedia.org/wiki/Perf_(Linux)). | `--allow=devel` and `--disallow=devel`
Programs from other architectures | Toggle | Allow the application to execute programs for an [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) other than the one supported natively by the system. | `--allow=multiarch` and `--disallow=multiarch`
Bluetooth | Toggle | Allow the application to use Bluetooth. | `--allow=bluetooth` and `--disallow=bluetooth`
Controller Area Network bus | Toggle | Allow the application to use canbus sockets. You must also have [network access](#share) for this to work. | `--allow=canbus` and `--disallow=canbus`

### Filesystem

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
All filesystem files | Toggle | Allow read-write access to the whole filesystem. Everything that isn't writeable by the user will be read-only | `--filesystem=host` and `--nofilesystem=host`
All system libraries, executables and static data | Toggle | Allow read-write access to system libraries located in `/usr`. Since this directory requires root access to write, the permission will be read-only. | `--filesystem=host-os` and `--nofilesystem=host-os`
All system configurations | Toggle | Allow read-write access to system configurations located in `/etc`. Since this directory requires root access to write, the permission will be read-only. | `--filesystem=host-etc` and `--nofilesystem=host-etc`
All user files | Toggle | Allow read-write access to the user directory (`$HOME` or `~/`). | `--filesystem=home` and `--nofilesystem=home`
Other files | Input | Allow read-write access to the directory you desire. <br /> <br /> For example, you would put `~/games` if you want read-write access to `~/games`. If you want read-only access to `~/games`, then you would put `~/games:ro`. | `--filesystem=[PATH]`, `--filesystem=[PATH]:ro` and `--nofilesystem=[PATH]`

### Persistent

Name | Type | Description | `flatpak-override` equivalent
--- | --- | --- | ---
Files | Input | Allow the application to only to access to the targeted directory while restricting other applications from accessing it. <br /> <br /> Starting from the user directory (`$HOME` or `~/`), the targeted directory will be remapped to the application's directory (`~/.var/app/$FLATPAK_APP_ID/[PATH]`) if it has no write access to the targeted directory. <br /> <br /> For example, persisting `.mozilla` will map `~/.mozilla` to `~/.var/app/org.mozilla.Firefox/.mozilla`. <br /> <br /> This is also a technique used to declutter the user directory, as it prevents the application from writing to `~/`. | `--persist=[PATH]`

### Environment

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Variables | Input | Set an environment variable in the application to make the variable available to application when it runs. <br /> <br /> For example, adding `MOZ_ENABLE_WAYLAND=1` for Firefox to enable the Wayland back-end. | `--env=[VAR]=[VALUE]`

### System Bus

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Talks | Input | Allow the application to talk to system services. <br /> <br /> For example, adding `org.freedesktop.Accounts` will allow the application to access users login history. | `--system-talk-name=[NAME]`
Owns | Input | Allow the application to own system services under the given name. | `--system-own-name=[NAME]`

### Session Bus

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Talks | Input | Allow the application to talk to session services. <br /> <br /> For example, adding `org.freedesktop.Notifications` will allow the application to send notifications. | `--talk-name=[NAME]`
Owns | Input | Allow the application to own session services under the given name. | `--own-name=[NAME]`

## Tips and Tricks

### Manually reset Flatseal permissions

If permissions are removed and is no longer possible to reset, run the following command from the terminal and re-start Flatseal:

```
$ rm ~/.local/share/flatpak/overrides/com.github.tchx84.Flatseal
```

### Add new translations

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

#### Flatpak 1.7.1 or newer

1. Launch Flatseal and select it to edit its own permissions.
2. Enable `host-etc`, or type in `host-etc:ro` in the other option.
3. Type in the custom installation path, e.g, `/xusr/custom/flatpak:ro`.
4. Restart Flatseal.

#### All versions

1. Launch Flatseal and select it to edit its own permissions.
2. Enable `host`, or type in `host:ro` in the other option.
3. Restart Flatseal.

**NOTE**: To find these installations, Flatseal needs access to `/etc/flatpak/installations.d`. Before Flatpak 1.7.1, accessing the host `/etc` required the `host` permission, which was an all-or-nothing situation. By default, Flatseal will have minimal permissions, so it's up to the user to decide to enable this feature.

### Use custom FLATPAK_USER_DIR

To use a custom `FLATPAK_USER_DIR`, e.g. `/var/home/user/.flatpak`.

```
flatpak --user override --filesystem=/var/home/user/.flatpak --env=FLATPAK_USER_DIR=/var/home/user/.flatpak com.github.tchx84.Flatseal
```

**NOTE**: By default, `FLATPAK_USER_DIR` is not accessible from within the Flatpak sandbox, and Flatseal has no access to custom directories. Therefore, these overrides are needed.
