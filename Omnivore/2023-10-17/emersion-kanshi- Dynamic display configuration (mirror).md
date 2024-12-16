---
id: 613bcbec-6a14-11ee-ad85-1f45bb7ab0b7
title: "emersion/kanshi: Dynamic display configuration (mirror)"
tags:
  - linux
  - tools_to_use
  - hyprland
date: 2023-10-17 01:41:20
words_count: 180
state: COMPLETED
---

# emersion/kanshi: Dynamic display configuration (mirror) by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Dynamic display configuration (mirror). Contribute to emersion/kanshi development by creating an account on GitHub.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## [](#kanshi)[kanshi](https://wayland.emersion.fr/kanshi/)

> **Heads up!** This project has [moved to SourceHut](https://sr.ht/~emersion/kanshi/).

kanshi allows you to define output profiles that are automatically enabled and disabled on hotplug. For instance, this can be used to turn a laptop's internal screen off when docked.

This is a Wayland equivalent for tools like [autorandr](https://github.com/phillipberndt/autorandr). kanshi can be used on Wayland compositors supporting the wlr-output-management protocol.

Join the IRC channel: #emersion on Libera Chat.

## [Building](#building)

Dependencies:

* wayland-client
* scdoc (optional, for man pages)
* libvarlink (optional, for remote control functionality)

meson build
ninja -C build

## [Usage](#usage)

mkdir -p ~/.config/kanshi && touch ~/.config/kanshi/config
kanshi

## [Configuration file](#configuration-file)

Each output profile is delimited by brackets. It contains several `output`directives (whose syntax is similar to `sway-output(5)`). A profile will be enabled if all of the listed outputs are connected.

```routeros
profile {
	output LVDS-1 disable
	output "Some Company ASDF 4242" mode 1600x900 position 0,0
}

profile {
	output LVDS-1 enable scale 2
}

```

## [Contributing](#contributing)

The upstream repository can be found [on SourceHut](https://git.sr.ht/~emersion/kanshi). Open tickets [on the SourceHut tracker](https://todo.sr.ht/~emersion/kanshi), send patches[on the mailing list](https://lists.sr.ht/~emersion/public-inbox).

## [License](#license)

MIT



# links
[Read on Omnivore](https://omnivore.app/me/emersion-kanshi-dynamic-display-configuration-mirror-18b3aa6a10f)
[Read Original](https://github.com/emersion/kanshi)

<iframe src="https://github.com/emersion/kanshi"  width="800" height="500"></iframe>
