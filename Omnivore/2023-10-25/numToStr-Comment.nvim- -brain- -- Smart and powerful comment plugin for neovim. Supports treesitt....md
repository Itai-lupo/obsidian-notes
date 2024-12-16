---
id: 86c8d55a-dd8b-409b-8da2-67a7bdb27bf7
title: "numToStr/Comment.nvim: :brain: // Smart and powerful comment plugin for neovim. Supports treesitter, dot repeat, left-right/up-down motions, hooks, and more"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-25 00:51:32
words_count: 1376
state: INBOX
---

# numToStr/Comment.nvim: :brain: // Smart and powerful comment plugin for neovim. Supports treesitter, dot repeat, left-right/up-down motions, hooks, and more by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> :brain: :muscle: // Smart and powerful comment plugin for neovim. Supports treesitter, dot repeat, left-right/up-down motions, hooks, and more - numToStr/Comment.nvim: :brain: // Smart and powerful...


# content

## [// Comment.nvim ](#-commentnvim-)

⚡ Smart and Powerful commenting plugin for neovim ⚡

[![Comment.nvim](https://proxy-prod.omnivore-image-cache.app/0x0,sjdmmz49Rnr6nXpmUgclvEov9uYZAn0DklX4JM6ZS82I/https://user-images.githubusercontent.com/42532967/136532939-926a8350-84b7-4e78-b045-fe21b5947388.gif "Commenting go brrrr")](https://user-images.githubusercontent.com/42532967/136532939-926a8350-84b7-4e78-b045-fe21b5947388.gif) 

### [✨ Features](#-features)

* Supports treesitter. [Read more](#treesitter)
* Supports `commentstring`. Read `:h comment.commentstring`
* Supports line (`//`) and block (`/* */`) comments
* Dot (`.`) repeat support for `gcc`, `gbc` and friends
* Count support for `[count]gcc` and `[count]gbc`
* Left-right (`gcw` `gc$`) and Up-Down (`gc2j` `gc4k`) motions
* Use with text-objects (`gci{` `gbat`)
* Supports pre and post hooks
* Ignore certain lines, powered by Lua regex

### [🚀 Installation](#-installation)

* With [lazy.nvim](https://github.com/folke/lazy.nvim)

-- add this to your lua/plugins.lua, lua/plugins/init.lua,  or the file you keep your other plugins:
{
    'numToStr/Comment.nvim',
    opts = {
        -- add any options here
    },
    lazy = false,
}

* With [packer.nvim](https://github.com/wbthomason/packer.nvim)

use {
    'numToStr/Comment.nvim',
    config = function()
        require('Comment').setup()
    end
}

* With [vim-plug](https://github.com/junegunn/vim-plug)

Plug 'numToStr/Comment.nvim'

" Somewhere after plug#end()
lua require('Comment').setup()

### [📖 Getting Help](#-getting-help)

`Comment.nvim` provides help docs which can be accessed by running `:help comment-nvim`

### [⚒️ Setup](#️-setup)

First you need to call the `setup()` method to create the default mappings.

\> **Note** \- If you are facing **Keybindings are mapped but they are not working** issue then please try [this](https://github.com/numToStr/Comment.nvim/issues/115#issuecomment-1032290098)

* Lua

require('Comment').setup()

* VimL

lua \<\< EOF
require('Comment').setup()
EOF

#### [Configuration (optional)](#configuration-optional)

Following are the **default** config for the [setup()](#setup). If you want to override, just modify the option that you want then it will be merged with the default config. Read `:h comment.config` for more info.

{
    ---Add a space b/w comment and the line
    padding = true,
    ---Whether the cursor should stay at its position
    sticky = true,
    ---Lines to be ignored while (un)comment
    ignore = nil,
    ---LHS of toggle mappings in NORMAL mode
    toggler = {
        ---Line-comment toggle keymap
        line = 'gcc',
        ---Block-comment toggle keymap
        block = 'gbc',
    },
    ---LHS of operator-pending mappings in NORMAL and VISUAL mode
    opleader = {
        ---Line-comment keymap
        line = 'gc',
        ---Block-comment keymap
        block = 'gb',
    },
    ---LHS of extra mappings
    extra = {
        ---Add comment on the line above
        above = 'gcO',
        ---Add comment on the line below
        below = 'gco',
        ---Add comment at the end of line
        eol = 'gcA',
    },
    ---Enable keybindings
    ---NOTE: If given `false` then the plugin won't create any mappings
    mappings = {
        ---Operator-pending mapping; `gcc` `gbc` `gc[count]{motion}` `gb[count]{motion}`
        basic = true,
        ---Extra mapping; `gco`, `gcO`, `gcA`
        extra = true,
    },
    ---Function to call before (un)comment
    pre_hook = nil,
    ---Function to call after (un)comment
    post_hook = nil,
}

### [🔥 Usage](#-usage)

When you call [setup()](#setup) method, `Comment.nvim` sets up some basic mapping which can be used in NORMAL and VISUAL mode to get you started with the pleasure of commenting stuff out.

#### [Basic mappings](#basic-mappings)

These mappings are enabled by default. (config: `mappings.basic`)

* NORMAL mode

`gcc` - Toggles the current line using linewise comment
`gbc` - Toggles the current line using blockwise comment
`[count]gcc` - Toggles the number of line given as a prefix-count using linewise
`[count]gbc` - Toggles the number of line given as a prefix-count using blockwise
`gc[count]{motion}` - (Op-pending) Toggles the region using linewise comment
`gb[count]{motion}` - (Op-pending) Toggles the region using blockwise comment

* VISUAL mode

`gc` - Toggles the region using linewise comment
`gb` - Toggles the region using blockwise comment

#### [Extra mappings](#extra-mappings)

These mappings are enabled by default. (config: `mappings.extra`)

* NORMAL mode

`gco` - Insert comment to the next line and enters INSERT mode
`gcO` - Insert comment to the previous line and enters INSERT mode
`gcA` - Insert comment to end of the current line and enters INSERT mode

##### [Examples](#examples)

# Linewise

`gcw` - Toggle from the current cursor position to the next word
`gc$` - Toggle from the current cursor position to the end of line
`gc}` - Toggle until the next blank line
`gc5j` - Toggle 5 lines after the current cursor position
`gc8k` - Toggle 8 lines before the current cursor position
`gcip` - Toggle inside of paragraph
`gca}` - Toggle around curly brackets

# Blockwise

`gb2}` - Toggle until the 2 next blank line
`gbaf` - Toggle comment around a function (w/ LSP/treesitter support)
`gbac` - Toggle comment around a class (w/ LSP/treesitter support)

### [🌳 Treesitter](#-treesitter)

This plugin has native **treesitter** support for calculating `commentstring` which works for multiple (injected/embedded) languages like Vue or Markdown. But due to the nature of the parsed tree, this implementation has some known limitations.

1. No `jsx/tsx` support. Its implementation was quite complicated.
2. Invalid comment on the region where one language ends and the other starts. [Read more](https://github.com/numToStr/Comment.nvim/pull/62#issuecomment-972790418)
3. Unexpected comment on a line with multiple languages. [#144](https://github.com/numToStr/Comment.nvim/issues/144)

For advance use cases, use [nvim-ts-context-commentstring](https://github.com/JoosepAlviste/nvim-ts-context-commentstring). See [pre\_hook](#pre-hook) section for the integration.

\> **Note** \- This plugin does not depend on [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) however it is recommended in order to easily install tree-sitter parsers.

### [🎣 Hooks](#-hooks)

There are two hook methods i.e `pre_hook` and `post_hook` which are called before comment and after comment respectively. Both should be provided during [setup()](#setup).

* `pre_hook` \- Called with a `ctx` argument (Read `:h comment.utils.CommentCtx`) before (un)comment. Can optionally return a `commentstring` to be used for (un)commenting.

{
    pre_hook = function(ctx)
        if ctx.range.srow == ctx.range.erow then
            -- do something with the current line
        else
            -- do something with lines range
        end
    end,
}

You can also integrate [nvim-ts-context-commentstring](https://github.com/JoosepAlviste/nvim-ts-context-commentstring#commentnvim) using `pre_hook` to easily comment `tsx/jsx` files.

\> **Note** \- `Comment.nvim` already supports [treesitter](#treesitter) out-of-the-box for all the languages except `tsx/jsx`.

{
    pre_hook = require('ts_context_commentstring.integrations.comment_nvim').create_pre_hook(),
}

* `post_hook` \- This method is called after (un)commenting. It receives the same `ctx` (Read `:h comment.utils.CommentCtx`) argument as [pre\_hook](#pre%5Fhook).

{
    post_hook = function(ctx)
        if ctx.range.srow == ctx.range.erow then
            -- do something with the current line
        else
            -- do something with lines range
        end
    end,
}

The `post_hook` can be implemented to cover some niche use cases like the following:

* Using newlines instead of padding e.g. for commenting out code in C with `#if 0`. See an example [here](https://github.com/numToStr/Comment.nvim/issues/38#issuecomment-945082507).
* Duplicating the commented block (using `pre_hook`) and moving the cursor to the next block (using `post_hook`). See [this](https://github.com/numToStr/Comment.nvim/issues/70).

\> NOTE: When pressing `gc`, `gb` and friends, `cmode` (Comment mode) inside `pre_hook` will always be toggle because when pre-hook is called, in that moment we don't know whether `gc` or `gb` will comment or uncomment the lines. But luckily, we do know this before `post_hook` and this will always receive either comment or uncomment status

### [🚫 Ignoring lines](#-ignoring-lines)

You can use `ignore` to ignore certain lines during comment/uncomment. It can takes lua regex string or a function that returns a regex string and should be provided during [setup()](#setup).

\> NOTE: Ignore only works when with linewise comment. This is by design. As ignoring lines in block comments doesn't make that much sense.

* With `string`

-- ignores empty lines
ignore = '^$'

-- ignores line that starts with `local` (excluding any leading whitespace)
ignore = '^(%s*)local'

-- ignores any lines similar to arrow function
ignore = '^const(.*)=(%s?)%((.*)%)(%s?)=\>'

* With `function`

{
    ignore = function()
        -- Only ignore empty lines for lua files
        if vim.bo.filetype == 'lua' then
            return '^$'
        end
    end,
}

### [🗨️ Filetypes + Languages](#️-filetypes--languages)

Most languages/filetypes have native support for comments via `commentstring` but there might be a filetype that is not supported. There are two ways to enable commenting for unsupported filetypes:

1. You can set `commentstring` for that particular filetype like the following. Read `:h commentstring` for more info.

vim.bo.commentstring = '//%s'

-- or
vim.api.nvim_command('set commentstring=//%s')

1. You can also use this plugin interface to store both line and block commentstring for the filetype. You can treat this as a more powerful version of the `commentstring`. Read `:h comment.ft` for more info.

local ft = require('Comment.ft')

-- 1. Using set function

ft
 -- Set only line comment
 .set('yaml', '#%s')
 -- Or set both line and block commentstring
 .set('javascript', {'//%s', '/*%s*/'})

-- 2. Metatable magic

ft.javascript = {'//%s', '/*%s*/'}
ft.yaml = '#%s'

-- Multiple filetypes
ft({'go', 'rust'}, ft.get('c'))
ft({'toml', 'graphql'}, '#%s')

\> PR(s) are welcome to add more commentstring inside the plugin

### [🤝 Contributing](#-contributing)

There are multiple ways to contribute reporting/fixing bugs, feature requests. You can also submit commentstring to this plugin by updating [ft.lua](https://github.com/numToStr/Comment.nvim/blob/master/lua/Comment/ft.lua) and sending PR.

### [📺 Videos](#-videos)

* [TakeTuesday E02: Comment.nvim](https://www.youtube.com/watch?v=-InmtHhk2qM) by [TJ DeVries](https://github.com/tjdevries)

### [💐 Credits](#-credits)

* [tcomment](https://github.com/tomtom/tcomment%5Fvim) \- To be with me forever and motivated me to write this.
* [nvim-comment](https://github.com/terrortylor/nvim-comment) \- Little and less powerful cousin. Also I took some code from it.
* [kommentary](https://github.com/b3nj5m1n/kommentary) \- Nicely done plugin but lacks some features. But it helped me to design this plugin.

### [🚗 Roadmap](#-roadmap)

* Doc comment i.e `/**%s*/` (js), `///%s` (rust)
* Header comment

----------------------
-- This is a header --
----------------------



# links
[Read on Omnivore](https://omnivore.app/me/num-to-str-comment-nvim-brain-smart-and-powerful-comment-plugin--18b63abe8be)
[Read Original](https://github.com/numToStr/Comment.nvim)

<iframe src="https://github.com/numToStr/Comment.nvim"  width="800" height="500"></iframe>
