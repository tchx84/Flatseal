# Flatseal

Flatseal is a graphical utility to review and modify basic permissions from your [Flatpak](https://flatpak.org/) applications.

## Usage

Simply launch Flatseal and modify your applications permissions. Restart your application after making the changes. If anything goes wrong just press the reset button.

## Test it

```
$ git clone https://github.com/tchx84/Flatseal.git
$ cd Flatseal
$ flatpak-builder --force-clean --repo=repo build com.github.tchx84.Flatseal.json
$ flatpak build-bundle repo flatseal.flatpak com.github.tchx84.Flatseal
$ flatpak install flatseal.flatpak
```

**NOTE**: Or just build it with [Builder](https://flathub.org/apps/details/org.gnome.Builder)

## Contribute

If you are interested in contributing to this utility just send a pull request to [this](https://github.com/tchx84/Flatseal) repo.
