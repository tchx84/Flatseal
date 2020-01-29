# Flatseal

<img height="100" src="https://github.com/tchx84/Flatseal/blob/test/data/com.github.tchx84.Flatseal.svg">

Flatseal is a graphical utility to review and modify basic permissions from your [Flatpak](https://flatpak.org/) applications.

## Usage

Simply launch Flatseal and modify your applications permissions. Restart your application after making the changes. If anything goes wrong just press the reset button.

## Get it

[<img width="240" src="https://flathub.org/assets/badges/flathub-badge-i-en.png">](https://flathub.org/apps/details/com.github.tchx84.Flatseal)

## Build it yourself

```
$ git clone https://github.com/tchx84/Flatseal.git
$ cd Flatseal
$ flatpak-builder --force-clean --repo=repo build com.github.tchx84.Flatseal.json
$ flatpak build-bundle repo flatseal.flatpak com.github.tchx84.Flatseal
$ flatpak install flatseal.flatpak
```

Or just use [Builder](https://flathub.org/apps/details/org.gnome.Builder)

## Contribute

If you are interested in contributing to this utility just send a pull request to [this](https://github.com/tchx84/Flatseal) repo.
