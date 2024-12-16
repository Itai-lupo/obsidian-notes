---
id: d1be946e-6c74-11ee-b001-c765ed2d797c
title: "gasech/hyprland-dots: 🌌 Hyprland Dotfiles"
tags:
  - linux
  - tools_to_use
  - hyprland
date: 2023-10-17 01:39:08
words_count: 657
state: INBOX
---

# gasech/hyprland-dots: 🌌 Hyprland Dotfiles by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> 🌌 Hyprland Dotfiles. Contribute to gasech/hyprland-dots development by creating an account on GitHub.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[![Screenshot 1](https://proxy-prod.omnivore-image-cache.app/0x0,sRdjdBvwrr03yoMTgcZyfH-8gJ0wmJ5UeRA_Veq7tYXk/https://raw.githubusercontent.com/gasech/hyprland-dots/main/assets/screenshot1.png)](https://raw.githubusercontent.com/gasech/hyprland-dots/main/assets/screenshot1.png) [![Screenshot 2](https://proxy-prod.omnivore-image-cache.app/0x0,sbJSIPU_LZSvLWMasdSMJGnN3jjoBxCPhxlqjJ9f3AzY/https://raw.githubusercontent.com/gasech/hyprland-dots/main/assets/screenshot2.png)](https://raw.githubusercontent.com/gasech/hyprland-dots/main/assets/screenshot2.png) [![Screenshot 3](https://proxy-prod.omnivore-image-cache.app/0x0,swfmRCat5K3_I6I9LllZWA_CaxfV98R5PrOUJextD35g/https://raw.githubusercontent.com/gasech/hyprland-dots/main/assets/screenshot3.png)](https://raw.githubusercontent.com/gasech/hyprland-dots/main/assets/screenshot3.png)

## [Sections](#sections)

* [Requirements](#requirements)
* [Installation Guide](#installation-guide)  
   * [Yay (AUR Helper)](#yay-%28aur-helper%29)  
   * [Hyprland and Dependencies](#hyprland-and-dependencies)  
   * [Packages](#packages)  
   * [Zsh shell with Zap](#zsh-shell-with-zap)  
   * [Copying config with Stow](#copying-config-with-stow)  
   * [Downloading a Nerd Font](#downloading-a-nerd-font)  
   * [GTK-XFCE Theme and Icons](#gtk-xfce-theme-and-icons)
* [Credits](#credits)

## [Requirements](#requirements)

* Fresh installed Arch Linux
* Archinstall with Sway Profile and Pipewire

> Pipewire is required, screen sharing won't work without it.

## [Installation Guide](#installation-guide)

Warning

This installation guide is for my future self. Some steps might not be completed, updated or even tested. Proceed if you know what you are doing.

### [Yay (AUR Helper)](#yay-aur-helper)

This part is optional, you can use pacman or paru, I like yay.

pacman -S --needed git base-devel
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
# delete yay files after the completion (optional) 
cd .. && rm -rf yay

### [Hyprland and Dependencies](#hyprland-and-dependencies)

This installation is going to take a while depending on your system.

| Type               | Package(s)                      |
| ------------------ | ------------------------------- |
| Hyprland + Wayland | hyprland-git                    |
| QT Wayland Support | qt5-wayland qt6-wayland         |
| Status Bar         | waybar-hyprland-git             |
| Wallpaper          | swagbg                          |
| XDG Desktop Portal | xdg-desktop-portal-hyprland-git |

yay -S hyprland-git qt5-wayland qt6-wayland waybar swaybg xdg-desktop-portal-hyprland-git

If you are not using a NVIDIA GPU, please delete the lines 9 to 13 in `hypr/.config/hypr/hyprland.conf`

```basic
9  - | env = LIBVA_DRIVER_NAME, nvidia
10 - │ env = XDG_SESSION_TYPE, wayland
11 - │ env = __GL_GSYNC_ALLOWED, 0
12 - │ env = __GLX_VENDOR_LIBRARY_NAME, nvidia
13 - │ env = GBM_BACKEND, nvidia-drm

```

Now execute Hyprland in tty with `Hyprland`, exit Hyprland by pressing `Super + SHIFT + Q` or open kitty with `Super + Return`

### [Packages](#packages)

| Type                 | Package(s)                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| Audio                | pamixer pavucontrol pipewire-pulse                                                                  |
| Browser              | firefox                                                                                             |
| Authentication Agent | polkit-kde-agent                                                                                    |
| Launcher             | wofi                                                                                                |
| File Manager         | ffmpegthumbnailer file-roller gvfs thunar thunar-archive-plugin                                     |
| Notifications        | dunst                                                                                               |
| Misc                 | bat btop feh mpv newsboat nm-connection-editor noto-fonts-emoji tldr stow wl-clipboard unzip yt-dlp |
| Terminal Emulator    | kitty exa zsh                                                                                       |
| Screenshotting       | grimblast-git                                                                                       |
| Screen Lock          | swaylock-effects wlogout                                                                            |

If you are interested in alternatives for some of these programs, you can go to [awesome-hyprland](https://github.com/hyprland-community/awesome-hyprland) list.

yay -S bat btop dunst exa feh ffmpegthumbnailer file-roller firefox grimblast-git gvfs kitty mpv newsboat nm-connection-editor noto-fonts-emoji pamixer pavucontrol pipewire-pulse polkit-kde-agent stow swaylock-effects thunar thunar-archive-plugin wlogout tldr unzip wl-clipboard wofi yt-dlp zsh 

### [Zsh shell with Zap](#zsh-shell-with-zap)

I like using zsh with zap because it's simple and fast to setup everything.

# set zsh as default shell
chsh -s $(which zsh)

# restart terminal then use 
zsh <(curl -s https://raw.githubusercontent.com/zap-zsh/zap/master/install.zsh)

### [Copying config with Stow](#copying-config-with-stow)

Stow is a nice way of creating symlinks (Symbolic Links) according to the tree of the target, so you can use stow to quickly copy any config.

# delete kitty and hypr autogenerated config (make sure to leave hyprland before doing this)
cd .config
rm -r hypr kitty

# make sure you are in home directory before cloning this repo
cd ~ 

git clone https://github.com/gasech/hyprland-dots.git
cd hyprland-dots 

# stows only zsh
stow zsh 

# multiple stow 
stow kitty newsboat 

# stows anything that is in a folder (ignores README.md)
stow */ 

### [Downloading a Nerd Font](#downloading-a-nerd-font)

Nerd fonts allows you to have nice unicode icons and they look really nice, I personally use CascadiaCode:

mkdir -p $HOME/Downloads/nerdfonts/
cd $HOME/Downloads/
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v2.3.1/CascadiaCode.zip
unzip '*.zip' -d $HOME/Downloads/nerdfonts/
rm -rf *.zip
sudo cp -R $HOME/Downloads/nerdfonts/ /usr/share/fonts/

### [GTK-XFCE Theme and Icons](#gtk-xfce-theme-and-icons)

You can use `nwg-look` and `xfce4-settings` to apply the theme and icons.

cd ~/Downloads
git clone https://github.com/Fausto-Korpsvart/Tokyo-Night-GTK-Theme.git

# Installs theme
sudo cp -r Tokyo-Night-GTK-Theme/themes/Tokyonight-Dark-BL-LB /usr/share/themes/
# Installs icons
sudo cp -r Tokyo-Night-GTK-Theme/icons/Tokyonight-Dark /usr/share/icons/

# Deletes folder
rm -r Tokyo-Night-GTK-Theme/

## [Credits](#credits)

* [linuxmobile's hyprland dotfiles](https://github.com/linuxmobile/hyprland-dots)
* [Chris Titus Tech's hyprland dotfiles](https://github.com/ChrisTitusTech/hyprland-titus/)



# links
[Read on Omnivore](https://omnivore.app/me/gasech-hyprland-dots-hyprland-dotfiles-18b3aa49cbd)
[Read Original](https://github.com/gasech/hyprland-dots/tree/main)

<iframe src="https://github.com/gasech/hyprland-dots/tree/main"  width="800" height="500"></iframe>
