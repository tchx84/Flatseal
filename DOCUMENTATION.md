# Documentation

## Flatseal permissions

This section indicates the permissions of Flatpak with better integration with Flatseal. It is based on the official [Sandbox Permissions Reference](https://docs.flatpak.org/en/latest/sandbox-permissions-reference.html).

Flatseal follows the same concept as `flatpak-override`: overriding the default permissions that the Flatpak program originally shipped with. Every change the user does will trigger Flatseal to output the overriden permissions in the `~/.local/share/flatpak/overrides` directory.

If you want to read more into Flatseal's permissions, you can look at the [Permissions section](#permissions).

If you want to read more into `flatpak override`, you can look at the [`flatpak-override` documentation](https://docs.flatpak.org/en/latest/flatpak-command-reference.html#flatpak-override).


### Permissions

#### Share

List of subsystems shared with the host system.

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Network | Toggle | Allow or prohibit access to the network. | `--share=network` and `--unshare=network`
[Inter-process communications](https://en.wikipedia.org/wiki/Inter-process_communication) | Toggle | Share or unshare IPC namespace with the host. | `--share=ipc` and `--unshare=ipc`

#### Socket

List of well-known sockets available in the sandbox.

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
X11 windowing system | Toggle | Allow or prohibit access to the application to show windows using X11. | `--socket=x11` and `--nosocket=x11`
Wayland windowing system | Toggle | Allow or prohibit access to the application to show windows using Wayland. | `--socket=wayland` and `--nosocket=wayland`
Fallback to X11 windowing system | Toggle | Allow or prohibit access to the application to show windows using X11 if Wayland is not available. **This overrides `--socket=x11` when used.** | `--socket=fallback-x11` and `--nosocket=fallback-x11`
PulseAudio sound server | Toggle | Allow or prohibit the application to play sounds that use PulseAudio. | `--socket=pulseaudio` and `--nosocket=pulseaudio`
D-Bus session bus | Toggle | Allow or prohibit access to the application to the entire session bus. | `--socket=session-dbus` and `--nosocket=session-dbus`
D-Bus system bus | Toggle | Allow or prohibit access to the application to the entire system bus. | `--socket=system-dbus` and `--nosocket=system-dbus`
Secure Shell agent | Toggle | Allow or prohibit access to the application to SSH authentications. | `--socket=ssh-auth` and `--nosocket=ssh-auth`
Smart cards | Toggle | Allow or prohibit access to the application to smart cards. | `--socket=pcsc` and `--nosocket=pcsc`
Printing system | Toggle | Allow or prohibit access to the application to printing systems. | `--socket=cups` and `--nosocket=cups`

#### Device

List of devices available in the sandbox.

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
GPU acceleration | Toggle | Allow or prohibit access to the application to graphics direct rendering located at `/dev/dri`. | `--device=dri` and `--nodevice=dri`
Virtualization | Toggle | Allow or prohibit access to the application to virtualization. | `--device=kvm` and `--nodevice=kvm`
Shared memory | Toggle | Allow or prohibit access to the application to shared memory. | `--device=shm` and `--nodevice=shm`
All devices | Toggle | Allow or prohibit access to the application to all devices. | `--device=all` and `--nodevice=all`

#### Allow

List of features available to the application.

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Development syscalls | Toggle | Allow or prohibit access to the application to certain syscalls such as [`ptrace()`](https://en.wikipedia.org/wiki/Ptrace) and [`perf_event_open()`](https://en.wikipedia.org/wiki/Perf_(Linux)). | `--allow=devel` and `--disallow=devel`
Programs from other architectures | Toggle | Allow or prohibit access to the application to execute programs for an [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) other than the one supported natively by the system. | `--allow=multiarch` and `--disallow=multiarch`
Bluetooth | Toggle | Allow or prohibit access to the application to use bluetooth. | `--allow=bluetooth` and `--disallow=bluetooth`
Controller Area Network bus | Toggle | Allow or prohibit access to the application to use canbus sockets. You must also have network access for this to work. | `--allow=canbus` and `--disallow=canbus`

#### Filesystem

List of filesystem subsets available to the application.

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
All filesystem files | Toggle | Allow or prohibit read-write access to the application to the whole filesystem. If it is allowed, the application has read-write access to every file and folder owned by you, the user. The rest will be read-only. | `--filesystem=host` and `--nofilesystem=host`
All system libraries, executables and static data | Toggle | Allow or prohibit read-write access to the application to system libraries located in `/usr`. Since this directory requires root access to write, the permission will be read-only. | `--filesystem=host-os` and `--nofilesystem=host-os`
All system configurations | Toggle | Allow or prohibit read-write access to the application to system configurations located in `/etc`. Since this directory requires root access to write, the permission will be read-only. | `--filesystem=host-etc` and `--nofilesystem=host-etc`
All user files | Toggle | Allow or prohibit read-write access to the application to the user directory (`$HOME`). | `--filesystem=home` and `--nofilesystem=home`
Other files | Input | Allow or prohibit read-write access to the application to the directory you desire. <br /> <br /> For example, you would put `~/games` if you want read-write access to `~/games`. If you want read-only (`ro`) access to `~/games`, then it will be `~/games:ro`. | `--filesystem=[PATH]`, `--filesystem=[PATH]:ro` and `--nofilesystem=[PATH]`

#### Persistent

List of the homedir-relative paths created in the sandbox.

Name | Type | Description | `flatpak-override` equivalent
--- | --- | --- | ---
Files | Input | Allow only to the application to have access to the targeted directory while restricting other applications from accessing it. <br /> <br /> Starting from `$HOME`, the targeted directory will be remapped to the application's directory (`~/.var/app/$FLATPAK_APP_ID/[PATH]`) if it has no write access to the targeted directory. <br /> <br /> For example, persisting `.mozilla` will map `~/.mozilla` to `~/.var/app/org.mozilla.Firefox/.mozilla` if the Firefox Flatpak has no write access to `~/.mozilla`. | `--persist=[PATH]`

#### Environment

List of variables exported to the application.

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Variables | Input | Set an environment variable in the application. | `--env=[VAR]=[VALUE]`

#### System Bus

List of well-known names on the system bus.

Name | Type | Description | `flatpak override` equivalent
--- | --- | --- | ---
Talks | Input | Allow the application to talk to system services. <br /> <br /> For example, adding `org.freedesktop.Notifications` will allow the application to send notifications. | `--system-talk-name=[NAME]`
Owns | Input | Allow the application to own system services under the given name. | `--system-own-name=[NAME]`

#### Session Bus

List of well-known names on the session bus.

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
