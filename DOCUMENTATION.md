# Documentation

## Flatseal permissions

This section indicates the permissions of Flatpak with better integration with Flatseal. It is based on the official [Sandbox Permissions Reference](https://docs.flatpak.org/en/latest/sandbox-permissions-reference.html).

Flatseal uses the `flatpak override` command. Every change the user does will make Flatseal run the `flatpak override` command to override the default permissions that the Flatpak program originally shipped with. All overridden permissions are located inside the `~/.local/share/flatpak/overrides` and `/var/lib/flatpak/overrides` directories. If you want to read more into `flatpak override`, you can look at the [`FLATPAK OVERRIDE(1)` manpage](https://manpages.debian.org/testing/flatpak/flatpak-override.1.en.html).
