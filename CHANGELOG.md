# Changelog

## [unreleased]
- Added disabling permissions not supported by the installed version of Flatpak.
- Added CAN bus permission.
- Added smart cards permission.
- Added virtualization permission.
- Added shared memory permission.
- Changed order of permissions to follow the same order as in Flatpak docs.
- Changed alignment of custom filesystems text to the left.

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
