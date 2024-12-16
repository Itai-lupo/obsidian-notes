---
id: 16ec547f-f213-41eb-8d01-96c6480ca344
title: "lukas-reineke/indent-blankline.nvim: Indent guides for Neovim"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-11-06 00:18:50
words_count: 420
state: INBOX
---

# lukas-reineke/indent-blankline.nvim: Indent guides for Neovim by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Indent guides  for Neovim. Contribute to lukas-reineke/indent-blankline.nvim development by creating an account on GitHub.


# content

## [Indent Blankline](#indent-blankline)

This plugin adds indentation guides to Neovim. It uses Neovim's virtual text feature and **no conceal**

To start using indent-blankline, call the `ibl.setup()` function.

This plugin requires the latest stable version of Neovim.

## [Install](#install)

Use your favourite plugin manager to install.

For [lazy.nvim](https://github.com/folke/lazy.nvim):

{ "lukas-reineke/indent-blankline.nvim", main = "ibl", opts = {} }

For [pckr.nvim](https://github.com/lewis6991/pckr.nvim):

use "lukas-reineke/indent-blankline.nvim"

## [Setup](#setup)

To initialize and configure indent-blankline, run the `setup` function.

Optionally, you can pass a configuration table to the setup function. For all available options, take a look at `:help ibl.config`.

## [Screenshots](#screenshots)

### [Simple](#simple)

[![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,so3eXkpacK9LigMl1frDBWrrP8DpYDl6FOOltYlq0eG8/https://user-images.githubusercontent.com/12900252/265403571-69ca7bb2-e294-4437-818b-8b47e63244b3.png)](https://user-images.githubusercontent.com/12900252/265403571-69ca7bb2-e294-4437-818b-8b47e63244b3.png) 

### [Scope](#scope)

Scope requires treesitter to be set up.

[![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,sFcVnfwBoBp9SlNLV1sKmYvsPSwp4MvsTTYGVGTKFJKk/https://user-images.githubusercontent.com/12900252/265403827-a9d2426f-56a4-44bd-8bb5-2a3c5f5ca384.png)](https://user-images.githubusercontent.com/12900252/265403827-a9d2426f-56a4-44bd-8bb5-2a3c5f5ca384.png) 

The scope is _not_ the current indentation level! Instead, it is the indentation level where variables or functions are accessible, as in [Wikipedia Scope (Computer Science)](https://en.wikipedia.org/wiki/Scope%5F%28computer%5Fscience%29). This depends on the language you are writing. For more information, see `:help ibl.config.scope`.

The start and end of scope uses underline, so to achieve the best result you might need to tweak the underline position. In Kitty terminal for example you can do that with [modify\_font](https://sw.kovidgoyal.net/kitty/conf/#opt-kitty.modify%5Ffont)

### [Mixed indentation](#mixed-indentation)

[![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,s8xJ75EsKm-FOL05Fl0ZT6OkA-76EZyfAgimg7T_YNus/https://user-images.githubusercontent.com/12900252/265404807-64a1a3c6-74e6-4183-901d-ad94c1edc59c.png)](https://user-images.githubusercontent.com/12900252/265404807-64a1a3c6-74e6-4183-901d-ad94c1edc59c.png) 

### [Multiple indent colors](#multiple-indent-colors)

local highlight = {
    "RainbowRed",
    "RainbowYellow",
    "RainbowBlue",
    "RainbowOrange",
    "RainbowGreen",
    "RainbowViolet",
    "RainbowCyan",
}

local hooks = require "ibl.hooks"
-- create the highlight groups in the highlight setup hook, so they are reset
-- every time the colorscheme changes
hooks.register(hooks.type.HIGHLIGHT_SETUP, function()
    vim.api.nvim_set_hl(0, "RainbowRed", { fg = "#E06C75" })
    vim.api.nvim_set_hl(0, "RainbowYellow", { fg = "#E5C07B" })
    vim.api.nvim_set_hl(0, "RainbowBlue", { fg = "#61AFEF" })
    vim.api.nvim_set_hl(0, "RainbowOrange", { fg = "#D19A66" })
    vim.api.nvim_set_hl(0, "RainbowGreen", { fg = "#98C379" })
    vim.api.nvim_set_hl(0, "RainbowViolet", { fg = "#C678DD" })
    vim.api.nvim_set_hl(0, "RainbowCyan", { fg = "#56B6C2" })
end)

require("ibl").setup { indent = { highlight = highlight } }

[![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,sjthoJRThw-gNs6LIN6Ov5AwdXEajm-LhqQlYDYhGgB8/https://user-images.githubusercontent.com/12900252/265404414-78fd962a-67fa-4ddf-8924-780256dfd118.png)](https://user-images.githubusercontent.com/12900252/265404414-78fd962a-67fa-4ddf-8924-780256dfd118.png) 

### [Background color indentation guides](#background-color-indentation-guides)

local highlight = {
    "CursorColumn",
    "Whitespace",
}
require("ibl").setup {
    indent = { highlight = highlight, char = "" },
    whitespace = {
        highlight = highlight,
        remove_blankline_trail = false,
    },
    scope = { enabled = false },
}

[![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,sQpcTUdOrlDHyunxX8h8npu0u7v_sM2IB7dVGez9hIo4/https://user-images.githubusercontent.com/12900252/265404984-35d70992-4482-4577-b1e1-28fda23b2b2d.png)](https://user-images.githubusercontent.com/12900252/265404984-35d70992-4482-4577-b1e1-28fda23b2b2d.png) 

### [rainbow-delimiters.nvim integration](#rainbow-delimitersnvim-integration)

[rainbow-delimiters.nvim](https://gitlab.com/HiPhish/rainbow-delimiters.nvim)

local highlight = {
    "RainbowRed",
    "RainbowYellow",
    "RainbowBlue",
    "RainbowOrange",
    "RainbowGreen",
    "RainbowViolet",
    "RainbowCyan",
}
local hooks = require "ibl.hooks"
-- create the highlight groups in the highlight setup hook, so they are reset
-- every time the colorscheme changes
hooks.register(hooks.type.HIGHLIGHT_SETUP, function()
    vim.api.nvim_set_hl(0, "RainbowRed", { fg = "#E06C75" })
    vim.api.nvim_set_hl(0, "RainbowYellow", { fg = "#E5C07B" })
    vim.api.nvim_set_hl(0, "RainbowBlue", { fg = "#61AFEF" })
    vim.api.nvim_set_hl(0, "RainbowOrange", { fg = "#D19A66" })
    vim.api.nvim_set_hl(0, "RainbowGreen", { fg = "#98C379" })
    vim.api.nvim_set_hl(0, "RainbowViolet", { fg = "#C678DD" })
    vim.api.nvim_set_hl(0, "RainbowCyan", { fg = "#56B6C2" })
end)

vim.g.rainbow_delimiters = { highlight = highlight }
require("ibl").setup { scope = { highlight = highlight } }

hooks.register(hooks.type.SCOPE_HIGHLIGHT, hooks.builtin.scope_highlight_from_extmark)

[![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,s6Et1keRZ3iGm551u2Y7pYbo6vb4-j9PQ8fZB5ccFN98/https://user-images.githubusercontent.com/12900252/265403990-67707d8e-57d3-411c-8418-77908d8babd9.png)](https://user-images.githubusercontent.com/12900252/265403990-67707d8e-57d3-411c-8418-77908d8babd9.png) 



# links
[Read on Omnivore](https://omnivore.app/me/lukas-reineke-indent-blankline-nvim-indent-guides-for-neovim-18ba1913568)
[Read Original](https://github.com/lukas-reineke/indent-blankline.nvim)

<iframe src="https://github.com/lukas-reineke/indent-blankline.nvim"  width="800" height="500"></iframe>
