---
id: f8b80784-6d10-11ee-8f3a-f77038e5c74d
title: "lewis6991/gitsigns.nvim: Git integration for buffers"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:16:55
date_published: 2022-09-01 03:00:00
words_count: 1145
state: INBOX
---

# lewis6991/gitsigns.nvim: Git integration for buffers by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Git integration for buffers. Contribute to lewis6991/gitsigns.nvim development by creating an account on GitHub.


# content

## [gitsigns.nvim](#gitsignsnvim)

[![CI](https://proxy-prod.omnivore-image-cache.app/0x0,svK9wtul8gmZ_vZXnUvy5fsWvX0dpzmZjy26UCyV5XNY/https://github.com/lewis6991/gitsigns.nvim/workflows/CI/badge.svg?branch=main)](https://github.com/lewis6991/gitsigns.nvim/actions?query=workflow%3ACI) [![Version](https://proxy-prod.omnivore-image-cache.app/0x0,sMP-sTLzgqsfU3CNkRn1ebxkxgfz7Mfp4bzzFAucOzJ4/https://camo.githubusercontent.com/ef9a95c7ac4d08d2763d96411ebad538b791a956222505b196f62b97f6f6baa3/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f762f72656c656173652f6c65776973363939312f6769747369676e732e6e76696d)](https://github.com/lewis6991/gitsigns.nvim/releases) [![License: MIT](https://proxy-prod.omnivore-image-cache.app/0x0,siXUHpNrQvvpxFnm6zbMq8zyAQtiip5_TM6KjJdBo9gU/https://camo.githubusercontent.com/78f47a09877ba9d28da1887a93e5c3bc2efb309c1e910eb21135becd2998238a/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c6963656e73652d4d49542d79656c6c6f772e737667)](https://opensource.org/licenses/MIT) [![Gitter](https://proxy-prod.omnivore-image-cache.app/0x0,srKdyGinUGXDQxj-JwlczLu9S9HCGOQJZCbCI9DVONMM/https://camo.githubusercontent.com/c1b843e76ad4fa78acc0d8bdb359d4926a6f20d02047e6c5e53aea389dd3752f/68747470733a2f2f6261646765732e6769747465722e696d2f6769747369676e732d6e76696d2f636f6d6d756e6974792e737667)](https://gitter.im/gitsigns-nvim/community?utm%5Fsource=badge&utm%5Fmedium=badge&utm%5Fcampaign=pr-badge)

Super fast git decorations implemented purely in Lua.

## [Preview](#preview)

| Hunk Actions                                                                                                                                                                                                                                                   | Line Blame                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![](https://proxy-prod.omnivore-image-cache.app/0x0,sjvGw02A789g_-ZIEUDUdKh5VfPaVwxxFKfGi5XZDKyI/https://raw.githubusercontent.com/lewis6991/media/main/gitsigns_actions.gif)](https://raw.githubusercontent.com/lewis6991/media/main/gitsigns%5Factions.gif) | [![](https://proxy-prod.omnivore-image-cache.app/0x0,snqJRXW9KF4eL4VuZqVNCWAo8UpFyBwcIu8DtfL3lfzg/https://raw.githubusercontent.com/lewis6991/media/main/gitsigns_blame.gif)](https://raw.githubusercontent.com/lewis6991/media/main/gitsigns%5Fblame.gif) |

## [Features](#features)

* Signs for added, removed, and changed lines
* Asynchronous using [luv](https://github.com/luvit/luv/blob/master/docs.md)
* Navigation between hunks
* Stage hunks (with undo)
* Preview diffs of hunks (with word diff)
* Customizable (signs, highlights, mappings, etc)
* Status bar integration
* Git blame a specific line using virtual text.
* Hunk text object
* Automatically follow files moved in the index.
* Live intra-line word diff
* Ability to display deleted/changed lines via virtual lines.
* Support for [yadm](https://yadm.io/)
* Support for detached working trees.

## [Requirements](#requirements)

* Neovim \>= 0.8.0  
**Note:** If your version of Neovim is too old, then you can use a past [release](https://github.com/lewis6991/gitsigns.nvim/releases).  
**Note:** If you are running a development version of Neovim (aka `master`), then breakage may occur if your build is behind latest.
* Newish version of git. Older versions may not work with some features.

## [Installation & Usage](#installation--usage)

Install using your package manager of choice.

For recommended setup with all batteries included:

require('gitsigns').setup()

Configuration can be passed to the setup function. Here is an example with most of the default settings:

require('gitsigns').setup {
  signs = {
    add          = { text = '│' },
    change       = { text = '│' },
    delete       = { text = '_' },
    topdelete    = { text = '‾' },
    changedelete = { text = '~' },
    untracked    = { text = '┆' },
  },
  signcolumn = true,  -- Toggle with `:Gitsigns toggle_signs`
  numhl      = false, -- Toggle with `:Gitsigns toggle_numhl`
  linehl     = false, -- Toggle with `:Gitsigns toggle_linehl`
  word_diff  = false, -- Toggle with `:Gitsigns toggle_word_diff`
  watch_gitdir = {
    follow_files = true
  },
  attach_to_untracked = true,
  current_line_blame = false, -- Toggle with `:Gitsigns toggle_current_line_blame`
  current_line_blame_opts = {
    virt_text = true,
    virt_text_pos = 'eol', -- 'eol' | 'overlay' | 'right_align'
    delay = 1000,
    ignore_whitespace = false,
  },
  current_line_blame_formatter = '\<author\>, \<author_time:%Y-%m-%d\> - \<summary\>',
  sign_priority = 6,
  update_debounce = 100,
  status_formatter = nil, -- Use default
  max_file_length = 40000, -- Disable if file is longer than this (in lines)
  preview_config = {
    -- Options passed to nvim_open_win
    border = 'single',
    style = 'minimal',
    relative = 'cursor',
    row = 0,
    col = 1
  },
  yadm = {
    enable = false
  },
}

For information on configuring Neovim via lua please see [nvim-lua-guide](https://github.com/nanotee/nvim-lua-guide).

### [Keymaps](#keymaps)

Gitsigns provides an `on_attach` callback which can be used to setup buffer mappings.

Here is a suggested example:

require('gitsigns').setup{
  ...
  on_attach = function(bufnr)
    local gs = package.loaded.gitsigns

    local function map(mode, l, r, opts)
      opts = opts or {}
      opts.buffer = bufnr
      vim.keymap.set(mode, l, r, opts)
    end

    -- Navigation
    map('n', ']c', function()
      if vim.wo.diff then return ']c' end
      vim.schedule(function() gs.next_hunk() end)
      return '\<Ignore\>'
    end, {expr=true})

    map('n', '[c', function()
      if vim.wo.diff then return '[c' end
      vim.schedule(function() gs.prev_hunk() end)
      return '\<Ignore\>'
    end, {expr=true})

    -- Actions
    map('n', '\<leader\>hs', gs.stage_hunk)
    map('n', '\<leader\>hr', gs.reset_hunk)
    map('v', '\<leader\>hs', function() gs.stage_hunk {vim.fn.line('.'), vim.fn.line('v')} end)
    map('v', '\<leader\>hr', function() gs.reset_hunk {vim.fn.line('.'), vim.fn.line('v')} end)
    map('n', '\<leader\>hS', gs.stage_buffer)
    map('n', '\<leader\>hu', gs.undo_stage_hunk)
    map('n', '\<leader\>hR', gs.reset_buffer)
    map('n', '\<leader\>hp', gs.preview_hunk)
    map('n', '\<leader\>hb', function() gs.blame_line{full=true} end)
    map('n', '\<leader\>tb', gs.toggle_current_line_blame)
    map('n', '\<leader\>hd', gs.diffthis)
    map('n', '\<leader\>hD', function() gs.diffthis('~') end)
    map('n', '\<leader\>td', gs.toggle_deleted)

    -- Text object
    map({'o', 'x'}, 'ih', ':\<C-U\>Gitsigns select_hunk\<CR\>')
  end
}

Note this requires Neovim v0.7 which introduces `vim.keymap.set`. If you are using Neovim with version prior to v0.7 then use the following:

Click to expand 

require('gitsigns').setup {
  ...
  on_attach = function(bufnr)
    local function map(mode, lhs, rhs, opts)
        opts = vim.tbl_extend('force', {noremap = true, silent = true}, opts or {})
        vim.api.nvim_buf_set_keymap(bufnr, mode, lhs, rhs, opts)
    end

    -- Navigation
    map('n', ']c', "&diff ? ']c' : '\<cmd\>Gitsigns next_hunk\<CR\>'", {expr=true})
    map('n', '[c', "&diff ? '[c' : '\<cmd\>Gitsigns prev_hunk\<CR\>'", {expr=true})

    -- Actions
    map('n', '\<leader\>hs', ':Gitsigns stage_hunk\<CR\>')
    map('v', '\<leader\>hs', ':Gitsigns stage_hunk\<CR\>')
    map('n', '\<leader\>hr', ':Gitsigns reset_hunk\<CR\>')
    map('v', '\<leader\>hr', ':Gitsigns reset_hunk\<CR\>')
    map('n', '\<leader\>hS', '\<cmd\>Gitsigns stage_buffer\<CR\>')
    map('n', '\<leader\>hu', '\<cmd\>Gitsigns undo_stage_hunk\<CR\>')
    map('n', '\<leader\>hR', '\<cmd\>Gitsigns reset_buffer\<CR\>')
    map('n', '\<leader\>hp', '\<cmd\>Gitsigns preview_hunk\<CR\>')
    map('n', '\<leader\>hb', '\<cmd\>lua require"gitsigns".blame_line{full=true}\<CR\>')
    map('n', '\<leader\>tb', '\<cmd\>Gitsigns toggle_current_line_blame\<CR\>')
    map('n', '\<leader\>hd', '\<cmd\>Gitsigns diffthis\<CR\>')
    map('n', '\<leader\>hD', '\<cmd\>lua require"gitsigns".diffthis("~")\<CR\>')
    map('n', '\<leader\>td', '\<cmd\>Gitsigns toggle_deleted\<CR\>')

    -- Text object
    map('o', 'ih', ':\<C-U\>Gitsigns select_hunk\<CR\>')
    map('x', 'ih', ':\<C-U\>Gitsigns select_hunk\<CR\>')
  end
}

## [Non-Goals](#non-goals)

### [Implement every feature in ](#implement-every-feature-in-vim-fugitive)[vim-fugitive](https://github.com/tpope/vim-fugitive)

This plugin is actively developed and by one of the most well regarded vim plugin developers. Gitsigns will only implement features of this plugin if: it is simple, or, the technologies leveraged by Gitsigns (LuaJIT, Libuv, Neovim's API, etc) can provide a better experience.

### [Support for other VCS](#support-for-other-vcs)

There aren't any active developers of this plugin who use other kinds of VCS, so adding support for them isn't feasible. However a well written PR with a commitment of future support could change this.

## [Status Line](#status-line)

Use `b:gitsigns_status` or `b:gitsigns_status_dict`. `b:gitsigns_status` is formatted using `config.status_formatter`. `b:gitsigns_status_dict` is a dictionary with the keys `added`, `removed`, `changed` and `head`.

Example:

set statusline+=%{get(b:,'gitsigns_status','')}

For the current branch use the variable `b:gitsigns_head`.

## [Comparison with ](#comparison-with-vim-gitgutter)[vim-gitgutter](https://github.com/airblade/vim-gitgutter)

| Feature                                                  | gitsigns.nvim | vim-gitgutter                                                        | Note                                                                                                                                                                               |
| -------------------------------------------------------- | ------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shows signs for added, modified, and removed lines       | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Asynchronous                                             | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Runs diffs in-process (no IO or pipes)                   | ✅ \*          | \* Via [lua](https://github.com/neovim/neovim/pull/14536) or FFI.    |                                                                                                                                                                                    |
| Supports Nvim's diff-linematch                           | ✅ \*          | \* Via [diff-linematch](https://github.com/neovim/neovim/pull/14537) |                                                                                                                                                                                    |
| Only adds signs for drawn lines                          | ✅ \*          | \* Via Neovims decoration API                                        |                                                                                                                                                                                    |
| Updates immediately                                      | ✅             | \*                                                                   | \* Triggered on CursorHold                                                                                                                                                         |
| Ensures signs are always up to date                      | ✅ \*          | \* Watches the git dir to do so                                      |                                                                                                                                                                                    |
| Never saves the buffer                                   | ✅             | ✅ ❗ \*                                                               | \* Writes [buffer](https://github.com/airblade/vim-gitgutter/blob/0f98634b92da9a35580b618c11a6d2adc42d9f90/autoload/gitgutter/diff.vim#L106) (and index) to short lived temp files |
| Quick jumping between hunks                              | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Stage/reset/preview individual hunks                     | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Preview hunks directly in the buffer (inline)            | ✅ \*          | \* Via preview\_hunk\_inline                                         |                                                                                                                                                                                    |
| Stage/reset hunks in range/selection                     | ✅             | ✅ ❗ \*                                                               | \* Only stage                                                                                                                                                                      |
| Stage/reset all hunks in buffer                          | ✅             |                                                                      |                                                                                                                                                                                    |
| Undo staged hunks                                        | ✅             |                                                                      |                                                                                                                                                                                    |
| Word diff in buffer                                      | ✅             |                                                                      |                                                                                                                                                                                    |
| Word diff in hunk preview                                | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Show deleted/changes lines directly in buffer            | ✅ \*          | \* Via [virtual lines](https://github.com/neovim/neovim/pull/15351)  |                                                                                                                                                                                    |
| Stage partial hunks                                      | ✅             |                                                                      |                                                                                                                                                                                    |
| Hunk text object                                         | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Diff against index or any commit                         | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Folding of unchanged text                                | ✅             |                                                                      |                                                                                                                                                                                    |
| Fold text showing whether folded lines have been changed | ✅             |                                                                      |                                                                                                                                                                                    |
| Load hunk locations into the quickfix or location list   | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Optional line highlighting                               | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Optional line number highlighting                        | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Optional counts on signs                                 | ✅             |                                                                      |                                                                                                                                                                                    |
| Customizable signs and mappings                          | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Customizable extra diff arguments                        | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Can be toggled globally or per buffer                    | ✅ \*          | ✅                                                                    | \* Through the detach/attach functions                                                                                                                                             |
| Statusline integration                                   | ✅             | ✅                                                                    |                                                                                                                                                                                    |
| Works with [yadm](https://yadm.io/)                      | ✅             |                                                                      |                                                                                                                                                                                    |
| Live blame in buffer (using virtual text)                | ✅             |                                                                      |                                                                                                                                                                                    |
| Blame preview                                            | ✅             |                                                                      |                                                                                                                                                                                    |
| Automatically follows open files moved with git mv       | ✅             |                                                                      |                                                                                                                                                                                    |
| CLI with completion                                      | ✅             | \*                                                                   | \* Provides individual commands for some actions                                                                                                                                   |
| Open diffview with any revision/commit                   | ✅             |                                                                      |                                                                                                                                                                                    |

## [Integrations](#integrations)

### [](#vim-fugitive)[vim-fugitive](https://github.com/tpope/vim-fugitive)

When viewing revisions of a file (via `:0Gclog` for example), Gitsigns will attach to the fugitive buffer with the base set to the commit immediately before the commit of that revision. This means the signs placed in the buffer reflect the changes introduced by that revision of the file.

### [](#troublenvim)[trouble.nvim](https://github.com/folke/trouble.nvim)

If installed and enabled (via `config.trouble`; defaults to true if installed), `:Gitsigns setqflist` or `:Gitsigns seqloclist` will open Trouble instead of Neovim's built-in quickfix or location list windows.

### [](#lspsaganvim)[lspsaga.nvim](https://github.com/glepnir/lspsaga.nvim)

If you are using lspsaga.nvim you can config `code_action.extend_gitsigns` (default is false) to show the gitsigns action in lspsaga codeaction.

## [Similar plugins](#similar-plugins)

* [coc-git](https://github.com/neoclide/coc-git)
* [vim-gitgutter](https://github.com/airblade/vim-gitgutter)
* [vim-signify](https://github.com/mhinz/vim-signify)



# links
[Read on Omnivore](https://omnivore.app/me/lewis-6991-gitsigns-nvim-git-integration-for-buffers-18b3ea3f89c)
[Read Original](https://github.com/lewis6991/gitsigns.nvim)

<iframe src="https://github.com/lewis6991/gitsigns.nvim"  width="800" height="500"></iframe>
