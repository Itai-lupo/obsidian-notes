---
id: 0c6109d0-6c75-11ee-abc0-3f3a61e95cb6
title: "[NOOB] Can it do multimonitor for laptops that will remember different monitors when I plug them in? : r/hyprland"
author: quembethembe
tags:
  - linux
  - hyprland
date: 2023-10-17 01:40:56
date_published: 2023-04-25 19:23:42
words_count: 373
state: INBOX
---

# [NOOB] Can it do multimonitor for laptops that will remember different monitors when I plug them in? : r/hyprland by quembethembe
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> I just spent some time creating kanshi config and a script to handle this.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
 I just spent some time creating kanshi config and a script to handle this.

 I'll post here in case anyone else in interested.

 Kanshi configuration. I run kanshi with an `exec-once` in the hyprland.conf.

~/.config/kanshi/config

profile 4k_DOCK {
    output "BNQ BenQ EW3280U S2M03886019" mode 3840x2160 position 0,0
    output "Dell Inc. DELL U2715H GH85D81T14FL" mode 2560x1440 position 3840,0 transform 90
    exec ~/bin/hypr_multi_monitor.sh
    exec notify-send "Switching to 4K Dock" -u normal
}

profile LAPTOP_ONLY {
    output 'AU Optronics 0x5B2D Unknown' mode 1920x1080 position 0,0
    exec ~/bin/hypr_multi_monitor.sh
    exec notify-send "Switching to Laptop only" -u normal
}

profile WIDESCREEN_DOCK {
    output "LG Electronics LG ULTRAWIDE 0x00009C51" mode 3440x1440 position 0,0
    output 'AU Optronics 0x5B2D Unknown' mode 1920x1080 position 3440,0
    exec ~/bin/hypr_multi_monitor.sh
    exec notify-send "Switching to Widescreen Dock" -u normal
}

 Here's the script `execd` by `kanshi` when it detects a specific monitor combination.

 Personally, I like left monitor to be the "master", but you can change this. I prefer workspaces 1 to 5 on left, and others on right.

#!/bin/bash
# Maintain 10 workspaces across multiple monitors

# What's supposed to be where...
left=('BNQ BenQ EW3280U S2M03886019 (HDMI-A-1)' 'LG Electronics LG ULTRAWIDE 0x00009C51 (DP-2)')
right=('Dell Inc. DELL U2715H GH85D81T14FL (DP-1)' 'AU Optronics 0x5B2D (eDP-1)')

# gather monitor count
monitor_count=$(hyprctl monitors -j | jq '. | length')

# Let's reset everything
hyprctl reload &>/dev/null

# Function to apply the settings
function apply_config() {
    local workspace="$1"
    local id="$2"
    local monitor="$3"
    local desc="$4"
    echo "Workspace $workspace on $id: $monitor, $desc"
    hyprctl keyword wsbind "$workspace","$monitor" &> /dev/null
    hyprctl dispatch moveworkspacetomonitor "$workspace" "$monitor" &> /dev/null
}
# Loop over available monitors. Check if the monitor is in configured as left
# or right
# Luckily, each environment I use has a different pair of monitors, so we don't
# need sophistication here.
echo "Found $monitor_count monitors"
hyprctl monitors -j | jq -r '.[] | "\(.id)|\(.name)|\(.description)"' | while IFS=\| read -r monitor_id monitor_name monitor_desc;
do
    if [[ ${left[*]} =~ ${monitor_name} ]] ;
    then
        for ((i = 1; i <= 5; i++)); do
            apply_config "$i" "$monitor_id" "$monitor_name" "$monitor_desc"
        done
        hyprctl keyword workspace "$monitor_name" > /dev/null
    elif [[ ${right[*]} =~ ${monitor_name} ]] ;
    then
        for ((i = 6; i <= 10; i++)); do
            apply_config "$i" "$monitor_id" "$monitor_name" "$monitor_desc"
        done
    fi
done



# links
[Read on Omnivore](https://omnivore.app/me/noob-can-it-do-multimonitor-for-laptops-that-will-remember-diffe-18b3aa64350)
[Read Original](https://www.reddit.com/r/hyprland/comments/12bv4ps/comment/jho4gko)

<iframe src="https://www.reddit.com/r/hyprland/comments/12bv4ps/comment/jho4gko"  width="800" height="500"></iframe>
