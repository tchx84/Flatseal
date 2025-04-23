# Changelog

## [unreleased]

- Added Persian translation.
- Added Arabic translation.
- Fixed Norwegian Bokmål translation.
- Fixed French translation.
- Fixed Bulgarian translation.
- Changed to GNOME 48 runtime for stability.

## [2.3.0] - 2024-09-30

- Added support for the new inherit-wayland-socket permission.
- Added Hindi translation.
- Changed to AppStream 1.0.
- Changed to GNOME 47 runtime for stability.

## [2.2.0] - 2024-04-18

* Added Greek translation.
* Fixed parsing environment variables with certain characters.
* Fixed filesystem permissions still showing up after being removed globally.
* Fixed filesystem permissions not showing up after redundantly added globally.
* Changed adaptive behavior to mimic GNOME Settings.
* Changed navigation experience to mimic GNOME Settings.
* Changed to Adw.AboutDialog for better adaptive behavior.

## [2.1.2] - 2024-03-26

- Added brand colors to appdata.
- Fixed appdata to pass new Flathub checks.
- Fixed Hungarian translation.
- Changed to GNOME 46 runtime for stability.

## [2.1.1] - 2024-02-06

- Fixed crashes on some Ubuntu systems due to missing file monitor support.
- Fixed falling back to appdata file when metainfo file is missing.
- Fixed not being able to remove persist global overrides.
- Fixed Russian translation.
- Fixed French translation.

## [2.1.0] - 2023-09-28

- Fixed validations for the persist section, e.g. to prevent line breaks.
- Fixed handling of broken overrides files.
- Fixed Italian translation.
- Fixed German translation.
- Added Norwegian Bokmål translation.
- Added support for the new input permission.
- Added save and restore selected application.
- Added detection of applications installs and uninstalls.
- Added detection of external changes to permissions, e.g. using flatpak-override.
- Changed to Libadwaita 1.4 for visual refinements and better performance.
- Changed to GNOME 45 runtime for stability.

## [2.0.2] - 2023-07-07

- Fixed GNOME Software not showing the application icon.
- Added Ukrainian translation.

## [2.0.1] - 2023-05-04

- Fixed window bouncing between folded and unfolded mode.
- Fixed styling of applications list rows.

## [2.0.0] - 2023-04-27

- Fixed re-enabling show-details button when GNOME Software is unavailable.
- Fixed Tamil mnemonics translation.
- Fixed validations for other-files section, e.g. to allow trailing slashes.
- Added popover for XDG paths suggestions.
- Added type-to-search for applications.
- Changed to GTK 4 and Libadwaita.
- Changed to GNOME 44 runtime for stability.

## [1.8.1] - 2022-10-15

- Fixed tooltips on unsupported permissions rows.
- Fixed weird interactions with filesystem reset mode.
- Fixed French translation.
- Fixed Chinese (China) translation.
- Added support for new gpg-agent permission.
- Added Hebrew translation.
- Added Tamil translation.
- Changed Flatpak icon to the latest version.
- Changed globally overridden status icon to use a different color.
- Changed environment variables validation to allow spaces.
- Changed to GNOME-runtime AppStreamGlib installation.
- Changed to GNOME 43 runtime for stability.

## [1.8.0] - 2022-05-30

- Fixed issues with forbidden modes on removed filesystem permissions.
- Fixed a few typos in offline documentation.
- Fixed creation of overrides directory on non-Flatpak distributions.
- Fixed Polish translation.
- Added Bulgarian translation.
- Added Danish translation.
- Added Chinese (China) translation.
- Added support for system color schemes.
- Added support for taking global overrides into account.
- Added support for editing global overrides.
- Added support for highlighting overridden permissions.
- Changed shortcuts window to be modal.
- Changed documentation window to be modal.
- Changed meson to 0.59.
- Changed to GNOME 42 runtime for stability.

## [1.7.5] - 2021-11-19

- Fixed Russian translation.
- Fixed icons to look sharper.
- Fixed loading originally-negated permissions.
- Fixed instances of undefined overrides.
- Added Turkish translation.
- Added French translation.
- Added support for keyboard navigation.
- Added support for per-app-dev-shm permission.
- Added support for negated filesystem permissions.
- Changed more custom widgets for libhandy widgets.
- Changed to sorting applications by name.
- Changed to GNOME 41 runtime for stability.

## [1.7.4] - 2021-06-11

- Fixed crash on Arch due to broken permission store.
- Added Catalan translation.
- Added Russian translation.
- Added keywords to find this app more easily using desktop search.

## [1.7.3] - 2021-05-26

- Fixed a few JS-usage and code-style issues.
- Fixed variables overrides not handling properly RUST-related exports.
- Fixed paths overrides mistakenly warning about directory names with spaces.
- Added a way to unset individual portal permissions.
- Added support to save and restore the main window state.
- Changed to the GNOME-runtime libhandy installation.

## [1.7.2] - 2021-05-12

- Fixed crash when partial tables are present on the permission store.

## [1.7.1] - 2021-05-08

- Fixed crashing at startup on Gentoo.
- Fixed styling for the no applications found message.
- Added Ctrl+F accelerator for activating search.
- Changed reset behavior to forget portals decisions.

## [1.7.0] - 2021-04-22

- Added initial support for portal permissions.
- Added offline documentation.
- Fixed show-details button freezing the application.
- Changed applications search option to be toggleable.
- Changed UI to better utilize libhandy's widgets.
- Changed to libhandy 1.2.1 for smoother transitions.
- Changed to GNOME 40 runtime for stability.

## [1.6.8] - 2021-01-30

- Fixed searching by application name and not only by app id.
- Fixed application freezing due to malformed regex.

## [1.6.7] - 2021-01-16

- Fixed window close-button not visible in applications page, when folded.
- Added Polish translation by @Garbulix.

## [1.6.6] - 2021-01-01

- Fixed main title so that it doesn't display the selected app name.
- Fixed issue with removed environment variables still showing up.
- Fixed Czech translation.
- Added more examples to the documentation.
- Changed shared memory description to not mention JACK anymore.

## [1.6.5] - 2020-11-28

- Fixed main window jumping sizes at launch in mobile mode.
- Fixed regression for properly showing the close button to the left corner.
- Fixed sandbox detection for old Flatpak versions.

## [1.6.4] - 2020-11-14

- Added latest contributors to credits.
- Added metadata needed by Phosh.
- Added support for directory variables, e.g. FLATPAK_USER_DIR.
- Added link to Flatseal specific documentation.
- Fixed border colors in dark mode.
- Fixed default applications icon on high-DPI.
- Changed to latest libhandy.

## [1.6.3] - 2020-10-12

- Added support for changing user-installation directory with XDG_DATA_HOME.
- Added support for undo reset.
- Fixed Leaflet geddan-meme effect when resizing window.
- Fixed starting at permissions page in compact mode.
- Fixed failing to start when session-bus is missing.
- Changed spacing between menu items to improve touchscreen ergonomics.
- Changed to latest versions of all libraries and runtimes.

## [1.6.2] - 2020-08-28

- Fixed crash on possibly malformed desktop files.

## [1.6.1] - 2020-08-07

- Changed group names to mimic permissions names, e.g. "allow" instead of "features".
- Fixed crashing when multiple libhandy versions available.
- Fixed missing icons for some applications, e.g. LibreOffice.
- Fixed enabling header bar buttons when no applications found.
- Added support for session and system bus overrides.

## [1.6.0] - 2020-06-25

- Added Swedish translation.
- Added showing applications basic information.
- Added showing details button to re-direct the user to a software manager application page.
- Added support for environment variables overrides.
- Added support for persistent overrides.
- Fixed handling unsupported permissions, so flatpak-override CLI can be used in parallel.
- Changed reset button layout in mobile mode, for improved ergonomics.

## [1.5.3] - 2020-05-02

- Added Indonesian translation.
- Added support for custom installations paths.
- Added TIPSANDTRICKS.md with common tricks.

## [1.5.2] - 2020-04-04

- Added host-os and host-etc filesystems permissions.
- Fixed clearing the custom filesystems viewer when no custom files.
- Fixed properly showing the close button to the left corner.

## [1.5.1] - 2020-03-21

- Changed using the term "other" instead of "custom".
- Fixed displaying the real application name.
- Fixed visually-annoying borders around permissions view.
- Fixed segfault on aarch64 by bumping runtime version to 3.36.

## [1.5.0] - 2020-03-07
- Added disabling permissions not supported by the installed version of Flatpak.
- Added CAN bus permission.
- Added smart cards permission.
- Added virtualization permission.
- Added shared memory permission.
- Added displaying human-readable description for filesystem permissions.
- Added validating filesystem permission paths.
- Added grouping permissions as per existent Flatpak-defined groups.
- Changed order of permissions to follow the same order as in Flatpak docs.
- Changed alignment of custom filesystems text to the left.
- Fix contrast in applications icons.

## [1.4.2] - 2020-02-21
- Added disabling reset button when no permissions changed.
- Added new icon from J.P. MacDonald and Tobias Bernard.
- Fixed saving pending changes when selecting apps or shutting the app down very quickly.
- Fixed hiding meaningful section of the app id in mobile mode headerbar title.
- Fixed not being able to close the about-me dialog when the close button is forcibly shown.
- Fixed font relative sizes not being preserved in custom themes.

## [1.4.1] - 2020-02-15
- Fixed handling negated filesystems permissions.
- Fixed unintended Spanish translation.

## [1.4.0] - 2020-02-14
- Added Hungarian, Dutch and Italian translations by the community.
- Added new editor for custom filesystems permissions.
- Added autocompletion for xdg directories in custom filesystems permissions.
- Added menu entry for permissions documentation.
- Added specific tests for filesystems permissions.
- Added tests for new custom widgets.
- Fixed window size in mobile mode.
- Fixed modifying existing filesystems permissions.
- Fixed test for detecting no changes condition.
- Fixed showing BaseApp bundles.
