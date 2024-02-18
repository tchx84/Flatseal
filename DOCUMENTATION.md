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
	- [Portals](#portals)
- [Tips and Tricks](#tips-and-tricks)
	- [Manually Reset Flatseal Permissions](#manually-reset-flatseal-permissions)
	- [Add New Translations](#add-new-translations)
	- [Enable Custom Installations](#enable-custom-installations)
	- [Use Custom FLATPAK_USER_DIR](#use-custom-flatpak_user_dir)

## Permissions

This is the list of permissions supported by Flatseal. These descriptions are based on Flatpak's [official documentation](https://docs.flatpak.org/en/latest/sandbox-permissions.html) and extended with examples and references to make it easier for newcomers to understand.

To summarize it, Flatpak provides two different permissions models: static and dynamic

Static refers to the permissions set by the developers when applications are built. Static permissions are holes in the sandbox, e.g. an application built with `--filesystem=home` can access _all_ user personal files. The benefit of this model is that developers can support Flatpak without any change in their applications code.

Both Flatseal and `flatpak override` command-line tool, use the overrides backend to manage static permissions.

Dynamic refers to the permissions granted by the users when applications run. Dynamic permissions rely on resource providers called [Portals](https://github.com/flatpak/flatpak/wiki/Portals) and can require user confirmation, e.g. users can grant access to _one_ specific file thanks to the `org.freedesktop.portal.FileChooser` portal. The benefit of this model is that users don't need to trust applications with more resources than is strictly needed.

Both Flatseal and `flatpak permissions` command-line tool, use the `org.freedesktop.impl.portal.PermissionStore` service to manage dynamic permissions.

### Share

Name | Type | Description | `flatpak override` Equivalent
--- | --- | --- | ---
Network | Toggle | Allow the application to have access to the network. <br /> <br /> For example, if it's disabled for Firefox, it will no longer be possible to browse the internet with this application. | `--share=network` and `--unshare=network`
[Inter-process communications](https://en.wikipedia.org/wiki/Inter-process_communication) | Toggle | Share IPC namespace with the host. <br /> <br /> This is required by X11 due to it depending on IPC. | `--share=ipc` and `--unshare=ipc`

### Socket

Name | Type | Description | `flatpak override` Equivalent
--- | --- | --- | ---
X11 Windowing System | Toggle | Allow the application to open in an X11 window. <br /> <br /> Most applications use X11 for historical reasons, but is considered less secure. | `--socket=x11` and `--nosocket=x11`
Wayland Windowing System | Toggle | Allow the application to open in a Wayland window. <br /> <br /> Many applications do not use Wayland as it is a newer display protocol unlike X11, and is considered more secure, but either some applications require extra steps to use it (see [environment variables](#environment) example for Firefox), or do not support Wayland at all. | `--socket=wayland` and `--nosocket=wayland`
Fallback to X11 Windowing System | Toggle | Allow the application to open in an X11 window when Wayland is not available. This overrides the X11 windowing system option when enabled. | `--socket=fallback-x11` and `--nosocket=fallback-x11`
PulseAudio Sound Server | Toggle | Allow the application to play sounds or get access to the microphone when using PulseAudio. <br /> <br /> For example, if it's disabled for Rhythmbox, it will no longer be possible to listen to the music with this application. | `--socket=pulseaudio` and `--nosocket=pulseaudio`
D-Bus Session Bus | Toggle | Allow the application to have access to the entire session bus. | `--socket=session-dbus` and `--nosocket=session-dbus`
D-Bus System Bus | Toggle | Allow the application to have access to the entire system bus. | `--socket=system-dbus` and `--nosocket=system-dbus`
Secure Shell Agent | Toggle | Allow the application to use SSH authentications. | `--socket=ssh-auth` and `--nosocket=ssh-auth`
[Smart Cards](https://wiki.debian.org/Smartcards) | Toggle | Allow the application to use smart cards. | `--socket=pcsc` and `--nosocket=pcsc`
Printing System | Toggle | Allow the application to use printing systems. <br /> <br /> For example, if it's disabled for LibreOffice, it will no longer be possible to print documents with this application. | `--socket=cups` and `--nosocket=cups`
GPG-Agent Directories | Toggle | Allow the application to access GPG-Agent directories. | `--socket=gpg-agent` and `--nosocket=gpg-agent`

### Device

Name | Type | Description | `flatpak override` Equivalent
--- | --- | --- | ---
GPU Acceleration | Toggle | Allow the application to access the graphics direct rendering to take advantage of GPU acceleration. | `--device=dri` and `--nodevice=dri`
Input Devices | Toggle | Allow input device access. <br /> <br /> Note that raw and virtual input devices could still require [All devices](#device) | `--device=input` and `--nodevice=input`
Virtualization | Toggle | Allow the application to support virtualization. | `--device=kvm` and `--nodevice=kvm`
Shared Memory | Toggle | Allow the application to access shared memory. | `--device=shm` and `--nodevice=shm`
All Devices | Toggle | Allow the application to access all devices, such as webcam and external devices. <br /> <br /> For example, if it's disabled for Element, it will no longer be possible to do video calls with this application. | `--device=all` and `--nodevice=all`

### Allow

Name | Type | Description | `flatpak override` Equivalent
--- | --- | --- | ---
Development Syscalls | Toggle | Allow the application to access to certain syscalls, such as [`ptrace()`](https://en.wikipedia.org/wiki/Ptrace) and [`perf_event_open()`](https://en.wikipedia.org/wiki/Perf_(Linux)). | `--allow=devel` and `--disallow=devel`
Programs From Other Architectures | Toggle | Allow the application to execute programs for an [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) other than the one supported natively by the system. | `--allow=multiarch` and `--disallow=multiarch`
Bluetooth | Toggle | Allow the application to use Bluetooth. | `--allow=bluetooth` and `--disallow=bluetooth`
Controller Area Network Bus | Toggle | Allow the application to use canbus sockets. You must also have [network access](#share) for this to work. | `--allow=canbus` and `--disallow=canbus`
Application Shared Memory | Toggle | Allow the application to share its /dev/shm between instances of the same $FLATPAK_APP_ID. Introduced specifically for the Steam flatpak, to share its /dev/shm with sub-sandboxed games. | `--allow=per-app-dev-shm` and `--disallow=per-app-dev-shm`.

### Filesystem

Name | Type | Description | `flatpak override` Equivalent
--- | --- | --- | ---
All Filesystem Files | Toggle | Allow read-write access to the whole filesystem. Everything that isn't writeable by the user will be read-only | `--filesystem=host` and `--nofilesystem=host`
All System Libraries, Executables and Static Data | Toggle | Allow read-write access to system libraries located in `/usr`. Since this directory requires root access to write, the permission will be read-only. | `--filesystem=host-os` and `--nofilesystem=host-os`
All System Configurations | Toggle | Allow read-write access to system configurations located in `/etc`. Since this directory requires root access to write, the permission will be read-only. | `--filesystem=host-etc` and `--nofilesystem=host-etc`
All User Files | Toggle | Allow read-write access to the user directory (`$HOME` or `~/`). | `--filesystem=home` and `--nofilesystem=home`
Other Files | Input | Allow read-write access to the directory you desire. <br /> <br /> For example, you would put `~/games` if you want read-write access to `~/games`. If you want read-only access to `~/games`, then you would put `~/games:ro`. | `--filesystem=[PATH]`, `--filesystem=[PATH]:ro` and `--nofilesystem=[PATH]`

### Persistent

Name | Type | Description | `flatpak-override` Equivalent
--- | --- | --- | ---
Files | Input | Allow the application to access the targeted directory while restricting other applications from accessing it. <br /> <br /> Starting from the user directory (`$HOME` or `~/`), the targeted directory will be remapped to the application's directory (`~/.var/app/$FLATPAK_APP_ID/[PATH]`) if it has no write access to the targeted directory. <br /> <br /> For example, persisting `.mozilla` will map `~/.mozilla` to `~/.var/app/org.mozilla.Firefox/.mozilla`. <br /> <br /> This is also a technique used to declutter the user directory, as it prevents the application from writing to `~/`. | `--persist=[PATH]`

### Environment

Name | Type | Description | `flatpak override` Equivalent
--- | --- | --- | ---
Variables | Input | Set an environment variable in the application to make the variable available to application when it runs. <br /> <br /> For example, adding `MOZ_ENABLE_WAYLAND=1` for Firefox to enable the Wayland back-end. | `--env=[VAR]=[VALUE]`

### System Bus

Name | Type | Description | `flatpak override` Equivalent
--- | --- | --- | ---
Talks | Input | Allow the application to talk to system services. <br /> <br /> For example, adding `org.freedesktop.Accounts` will allow the application to access users login history. | `--system-talk-name=[NAME]`
Owns | Input | Allow the application to own system services under the given name. | `--system-own-name=[NAME]`

### Session Bus

Name | Type | Description | `flatpak override` Equivalent
--- | --- | --- | ---
Talks | Input | Allow the application to talk to session services. <br /> <br /> For example, adding `org.freedesktop.Notifications` will allow the application to send notifications. | `--talk-name=[NAME]`
Owns | Input | Allow the application to own session services under the given name. | `--own-name=[NAME]`

### Portals

Name | Type | Description | Portal
--- | --- | --- | ---
Background | Toggle | Allow the application to run in the background. | `org.freedesktop.portal.Background`
Notifications | Toggle | Allow the application to send notifications. | `org.freedesktop.portal.Notification`
Microphone | Toggle | Allow the application to listen to your microphone. | `org.freedesktop.portal.Device`
Speakers | Toggle | Allow the application to play sounds to your speakers. | `org.freedesktop.portal.Device`
Camera | Toggle | Allow the application to record videos with your camera. | `org.freedesktop.portal.Device`
Location | Toggle | Allow the application to access your location data. | `org.freedesktop.portal.Location`

## Tips and Tricks

### Manually Reset Flatseal Permissions

If permissions are removed and is no longer possible to reset, run the following command from the terminal and re-start Flatseal:

```
$ rm ~/.local/share/flatpak/overrides/com.github.tchx84.Flatseal
```

### Add New Translations

Add a new language and update translations:

```
$ git clone https://github.com/tchx84/Flatseal.git
$ cd Flatseal
$ echo "es" >> po/LINGUAS # es for Spanish
$ meson _translate && cd _translate
$ ninja flatseal-pot
$ ninja flatseal-update-po
$ gedit ../po/es.po # translate the strings to Spanish
```

To test the translation language:

```
$ flatpak config --set languages es
$ flatpak update org.gnome.Platform
$ LC_ALL=es_PY.UTF-8 flatpak run com.github.tchx84.Flatseal
```

### Enable Custom Installations

To enable a custom installation, e.g, `/xusr/custom/flatpak`.

#### Flatpak 1.7.1 or Newer

1. Launch Flatseal and select it to edit its own permissions.
2. Enable `host-etc`, or type in `host-etc:ro` in the other option.
3. Type in the custom installation path, e.g, `/xusr/custom/flatpak:ro`.
4. Restart Flatseal.

#### All Versions

1. Launch Flatseal and select it to edit its own permissions.
2. Enable `host`, or type in `host:ro` in the other option.
3. Restart Flatseal.

**NOTE**: To find these installations, Flatseal needs access to `/etc/flatpak/installations.d`. Before Flatpak 1.7.1, accessing the host `/etc` required the `host` permission, which was an all-or-nothing situation. By default, Flatseal will have minimal permissions, so it's up to the user to decide to enable this feature.

### Use Custom FLATPAK_USER_DIR

To use a custom `FLATPAK_USER_DIR`, e.g. `/var/home/user/.flatpak`.

```
flatpak --user override --filesystem=/var/home/user/.flatpak --env=FLATPAK_USER_DIR=/var/home/user/.flatpak com.github.tchx84.Flatseal
```

**NOTE**: By default, `FLATPAK_USER_DIR` is not accessible from within the Flatpak sandbox, and Flatseal has no access to custom directories. Therefore, these overrides are needed.
