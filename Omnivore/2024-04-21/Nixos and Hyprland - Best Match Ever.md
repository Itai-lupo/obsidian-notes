---
id: 423e50c8-ae37-4c27-8bf6-5c03600a2213
title: Nixos and Hyprland - Best Match Ever
author: Vimjoyer
tags:
  - hyprland
  - linux
  - nixos
date: 2024-04-21 00:10:35
date_published: 2023-07-19 03:00:00
words_count: 1697
state: INBOX
---

# Nixos and Hyprland - Best Match Ever by Vimjoyer
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Some errors from video (not too bad):
At 2:38 alternative to "dunst" is "mako"!!!
pkgs.wl-clipboard, not pkgs.wl-copy

# Enabling hyprlnd on NixOS
programs.hyprland = {
  enable = true;
  nvidiaPatches = true;
  xwayland.enable = true;
};

environment.sessionVariables = {
  # If your cursor becomes invisible
  WLR_NO_HARDWARE_CURSORS = "1";
  # Hint electron apps to use wayland
  NIXOS_OZONE_WL = "1";
};

hardware = {
    # Opengl
    opengl.enable = true;

    # Most wayland compositors need this
    nvidia.modesetting.enable = true;
};

# waybar
(pkgs.waybar.overrideAttrs (oldAttrs: {
    mesonFlags = oldAttrs.mesonFlags ++ [ "-Dexperimental=true" ];
  })
)

# XDG portal
xdg.portal.enable = true;
xdg.portal.extraPortals = [ pkgs.xdg-desktop-portal-gtk ];

# Enable sound with pipewire.
sound.enable = true;
security.rtkit.enable = true;
services.pipewire = {
  enable = true;
  alsa.enable = true;
  alsa.support32Bit = true;
  pulse.enable = true;
  jack.enable = true;
};

# rofi keybind
bind = $mainMod, S, exec, rofi -show drun -show-icons


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Nixos and Hyprland - Best Match Ever](https://www.youtube.com/watch?v=61wGzIv12Ds)

By [Vimjoyer](https://www.youtube.com/@vimjoyer)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-61-w-gz-iv-12-ds-18efd58be6e)
[Read Original](https://www.youtube.com/watch?v=61wGzIv12Ds)

<iframe src="https://www.youtube.com/watch?v=61wGzIv12Ds"  width="800" height="500"></iframe>
