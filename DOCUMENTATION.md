# Documentation

## Flatseal permissions

This section indicates the permissions of Flatpak with better integration with Flatseal. It is based on the official [Sandbox Permissions Reference](https://docs.flatpak.org/en/latest/sandbox-permissions-reference.html).

Flatseal uses the `flatpak override` command. Every change the user does will make Flatseal run the `flatpak override` command to override the default permissions that the Flatpak program originally shipped with. All overridden permissions are located inside the `~/.local/share/flatpak/overrides` and `/var/lib/flatpak/overrides` directories. If you want to read more into `flatpak override`, you can look at the [`FLATPAK OVERRIDE(1)` manpage](https://manpages.debian.org/testing/flatpak/flatpak-override.1.en.html).

### Permissions

#### Share

List of subsystems shared with the host system.

Name | Permission(s) | Type | Description
--- | --- | --- | ---
Network | `--share=network` and `--unshare=network` | Toggle | Access the network (`--share=network`); do not access the network (`--unshare=network`).
[Inter-process communications](https://en.wikipedia.org/wiki/Inter-process_communication) | `--share=ipc` and `--unshare=ipc` | Toggle | Share IPC namespace with the host (`--share=ipc`); unshare IPC namespace with the host (`--unshare=ipc`).

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
