---
id: 6ca8c3a6-6d0f-11ee-8616-8f84dda8fe1d
title: "ldelossa/litee.nvim: A framework for building Neovim plugins"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:05:50
words_count: 283
state: INBOX
---

# ldelossa/litee.nvim: A framework for building Neovim plugins by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A framework for building Neovim plugins. Contribute to ldelossa/litee.nvim development by creating an account on GitHub.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
```asciidoc
██╗     ██╗████████╗███████╗███████╗   ███╗   ██╗██╗   ██╗██╗███╗   ███╗
██║     ██║╚══██╔══╝██╔════╝██╔════╝   ████╗  ██║██║   ██║██║████╗ ████║ Lightweight
██║     ██║   ██║   █████╗  █████╗     ██╔██╗ ██║██║   ██║██║██╔████╔██║ Integrated
██║     ██║   ██║   ██╔══╝  ██╔══╝     ██║╚██╗██║╚██╗ ██╔╝██║██║╚██╔╝██║ Text
███████╗██║   ██║   ███████╗███████╗██╗██║ ╚████║ ╚████╔╝ ██║██║ ╚═╝ ██║ Editing
╚══════╝╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝╚═╝     ╚═╝ Environment
====================================================================================

```

[![litee screenshot](https://proxy-prod.omnivore-image-cache.app/0x0,sByqV7j9-vioJcGar2K4x61nVjr6K1nNown7zPFVgA8o/https://github.com/ldelossa/litee.nvim/raw/main/contrib/litee-screenshot.png)](https://github.com/ldelossa/litee.nvim/blob/main/contrib/litee-screenshot.png)

## [litee.nvim](#liteenvim)

Litee.nvim (pronounced lite) is a library for building "IDE-lite" experiences in Neovim.

By utilizing the "litee" library plugin authors can achieve a consistent experience across separate plugins.

There are several official litee plugins which can act as a reference for implementing additional.

## [Calltree](#calltree)

<https://github.com/ldelossa/litee-calltree.nvim>

Analogous to VSCode's "Call Hierarchy" tool, this plugin exposes an explorable tree of incoming or outgoing calls for a given symbol.

Unlike other Neovim plugins, the tree can be expanded and collapsed to discover "callers-of-callers" and "callees-of-callees" until you hit a leaf.

## [Symboltree](#symboltree)

<https://github.com/ldelossa/litee-symboltree.nvim>

Analogous to VSCode's "Outline" tool, this plugin exposes a live tree of document symbols for the current file.

The tree is updated as you move around and change files.

## [Filetree](#filetree)

<https://github.com/ldelossa/litee-filetree.nvim>

Analogous to VSCode's "Explorer", this plugin exposes a full feature file explorer which supports recursive copies, recursive moves, and proper renaming of a file (more on this in the appropriate section).

## [Bookmarks](#bookmarks)

<https://github.com/ldelossa/litee-bookmarks.nvim>

This plugin exposes a way to create Bookmarks, pinnable areas of important code, and organize them into one or more Notebooks.

Notebooks allow you to open and close sets of Bookmarks depending on what you're working on that day.

## [Usage](#usage)

litee.nvim is a library which other plugins can important and use.

The library has it's own configuration and setup function which can be viewed in the `doc.txt`.

An example of configuring the library is below:

```nix
require('litee.lib').setup({
    tree = {
        icon_set = "codicons"
    },
    panel = {
        orientation = "left",
        panel_size  = 30
    }
})

```



# links
[Read on Omnivore](https://omnivore.app/me/ldelossa-litee-nvim-a-framework-for-building-neovim-plugins-18b3e99d4c6)
[Read Original](https://github.com/ldelossa/litee.nvim)

<iframe src="https://github.com/ldelossa/litee.nvim"  width="800" height="500"></iframe>
