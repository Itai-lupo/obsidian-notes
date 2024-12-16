---
id: 5accfc8e-6d0e-11ee-b2b1-ab9d24af3569
title: "riodelphino/cheat.nvim: Quick cheatsheet viewer plugin for nvim."
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 19:58:16
words_count: 363
state: INBOX
---

# riodelphino/cheat.nvim: Quick cheatsheet viewer plugin for nvim. by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Quick cheatsheet viewer plugin for nvim. Contribute to riodelphino/cheat.nvim development by creating an account on GitHub.


# content

## [cheat.nvim](#cheatnvim)

Quick & Usefull cheatsheet viewer plugin for nvim.

Inspired by [vim-cheatsheet](https://github.com/reireias/vim-cheatsheet)

## [Showcase](#showcase)

### [Show cheatsheets by user commands.](#show-cheatsheets-by-user-commands)

`:Cheat` or `:Cheat {cheat_name}`

capture01.mov 

### [Show cheatsheets by keymaps.](#show-cheatsheets-by-keymaps)

`\<leader\>ch` or `\<leader\>cn` or `\<leader\>ct`

capture02.mov 

## [Functions](#functions)

Both functions are available.

1. Show 'filetype-specific' cheatsheet automatically, with the same 'one' keymap.  
ex.) `\<leader\>ch` or `:Cheat`
2. Show 'commonly-used' cheatsheet, by each keymaps.  
ex.) `\<leader\>cn` or `:Cheat nvim` \--\> nvim's cheatsheet  
ex.) `\<leader\>ct` or `:Cheat tmux` \--\> tmux's cheatsheet

## [Install](#install)

Packer

use { "riodelphino/cheat.nvim" }

## [Setup](#setup)

require('cheat').setup {}

## [Usage](#usage)

| Command              | Description                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| :Cheat               | Show the cheatsheet depending on current buf's filetype,with the style set in config.window.default\_style. |
| :Cheat {cheat\_name} | Same with :Cheat, but show the specific cheatsheet.                                                         |
| ~~:CheatFloat~~      | Same with :Cheat, but with float style. (Sorry, not implemented now.)                                       |
| ~~:CheatHSplit~~     | Same with :Cheat, but with horizontal split style. (Sorry, not implemented now.)                            |
| ~~:CheatVSplit~~     | Same with :Cheat, but with vertical split style. (Sorry, not implemented now.)                              |

## [Default keymaps](#default-keymaps)

| Keymap     | Function                                                      |
| ---------- | ------------------------------------------------------------- |
| \<leader\>ch | Show the cheatsheet delepending on current buf's file pattern |
| \<leader\>cn | Show the nvim's cheatsheet (cheat-nvim.md)                    |
| \<leader\>ct | Show the tmux's cheatsheet (cheat-tmux.md)                    |
| q          | Close cheatsheet.                                             |

## [Config](#config)

Default configs.

rquire('cheat').setup {
   debug = false, -- show debug msg (just for me)
   readonly = true, -- 'false' for editable.
   window = {
      default_style = "float",     -- "vsplit", "hsplit" -- Choose display style. (Now only 'float' works.)
      vsplit = { height = { size = 20 } },
      hsplit = { width = { size = 40 } },
      float = {
         width = {
            ratio = 0.8,
         },
         height = {
            ratio = 0.9,
         },
         signcolumn = false, -- 'false' for simple display style.
      },
   },
   file = {
      dir = "~/.config/nvim/cheat", -- Directory where the cheatsheets are placed.
      prefix = "cheat-", -- Cheatsheet file prefix.
      ext = ".md", -- Cheatsheet extension.
   },
   keymaps = {
      ["\<leader\>ch"] = ":Cheat", -- Show the cheatsheet depending on filetype.
      ["\<leader\>cn"] = ":Cheat nvim", -- Show "cheat-nvim.md"
      ["\<leader\>ct"] = ":Cheat tmux", -- Show "cheat-tmux.md"
      -- Add more keymaps & cheatsheets here.
   },
   cheatsheets = {
      filetypes = { -- Open the specific cheatsheet by file pattern.
         lua = { "*.lua" },
         vim = { "*.vim", "*.vifmrc" }, -- The key 'vim' is the surfix of filename. ex.) cheat-vim.md
         js = { "*.js", "*.mjs" },
         css = { "*.css", "*.scss", "*.sass" },  -- Multiple filetypes are allowed.
         md = { "*.md" },
         php = { "*.php" },
         html = { "*.html" },
         -- Add more filetypes settings here.
      },
   },
}

## [TODO](#todo)

* window.default\_style = "vsplit"
* window.default\_style = "hsplit"
* window.vsplit.signcolumn
* window.vsplit.signcolumn
* Logging (now just print()...)

## [Lisence](#lisence)

MIT



# links
[Read on Omnivore](https://omnivore.app/me/riodelphino-cheat-nvim-quick-cheatsheet-viewer-plugin-for-nvim-18b3e92e768)
[Read Original](https://github.com/riodelphino/cheat.nvim)

<iframe src="https://github.com/riodelphino/cheat.nvim"  width="800" height="500"></iframe>
