---
id: e14f7d3e-6d10-11ee-8429-f32f4d38053c
title: "nvim-telescope/telescope.nvim: Find, Filter, Preview, Pick. All lua, all the time."
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:16:16
words_count: 2843
state: INBOX
---

# nvim-telescope/telescope.nvim: Find, Filter, Preview, Pick. All lua, all the time. by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Find, Filter, Preview, Pick. All lua, all the time. - nvim-telescope/telescope.nvim: Find, Filter, Preview, Pick. All lua, all the time.


# content

## [telescope.nvim](#telescopenvim)

[![Gitter](https://proxy-prod.omnivore-image-cache.app/0x0,s_NJEnqLl4eGEgiBWLvO97GsDPQzQT_csACqioPSA4g0/https://camo.githubusercontent.com/4d4076074916c95153c5e077022708a86c6bd923cba2c8ce15b35ff938761892/68747470733a2f2f6261646765732e6769747465722e696d2f6e76696d2d74656c6573636f70652f636f6d6d756e6974792e737667)](https://gitter.im/nvim-telescope/community?utm%5Fsource=badge&utm%5Fmedium=badge&utm%5Fcampaign=pr-badge) [![LuaRocks](https://proxy-prod.omnivore-image-cache.app/0x0,sa6ADaNhKIW38DtDMfWwykY-Y99XmBmgbNAfS5F501g8/https://camo.githubusercontent.com/3f198fce1c0037b55a36f676d2c5b24f71716fac3afa4450b082705472adf92c/68747470733a2f2f696d672e736869656c64732e696f2f6c7561726f636b732f762f436f6e6e69323436312f74656c6573636f70652e6e76696d3f6c6f676f3d6c756126636f6c6f723d707572706c65)](https://luarocks.org/modules/Conni2461/telescope.nvim)

Gaze deeply into unknown regions using the power of the moon.

## [What Is Telescope?](#what-is-telescope)

`telescope.nvim` is a highly extendable fuzzy finder over lists. Built on the latest awesome features from `neovim` core. Telescope is centered around modularity, allowing for easy customization.

Community driven builtin [pickers](#pickers), [sorters](#sorters) and[previewers](#previewers).

[![Preview](https://proxy-prod.omnivore-image-cache.app/0x0,sGEaeSf29HPQqZL8tgHJGJHt5heo4fJCT254iwQu5mWY/https://camo.githubusercontent.com/3d59e34d1f406890adf620546d3d97017ce0aacda034b1788c66fa872f192134/68747470733a2f2f692e696d6775722e636f6d2f5454546a6136742e676966)](https://camo.githubusercontent.com/3d59e34d1f406890adf620546d3d97017ce0aacda034b1788c66fa872f192134/68747470733a2f2f692e696d6775722e636f6d2f5454546a6136742e676966) For more showcases of Telescope, please visit the [Showcase section](https://github.com/nvim-telescope/telescope.nvim/wiki/Showcase) in the Telescope Wiki

## [Telescope Table of Contents](#telescope-table-of-contents)

* [Getting Started](#getting-started)
* [Usage](#usage)
* [Customization](#customization)
* [Default Mappings](#default-mappings)
* [Pickers](#pickers)
* [Previewers](#previewers)
* [Sorters](#sorters)
* [Layout](#layout-display)
* [Themes](#themes)
* [Commands](#vim-commands)
* [Autocmds](#autocmds)
* [Extensions](#extensions)
* [API](#api)
* [Media](#media)
* [Contributing](#contributing)
* [Changelog](https://github.com/nvim-telescope/telescope.nvim/blob/master/doc/telescope%5Fchangelog.txt)

## [Getting Started](#getting-started)

This section should guide you to run your first builtin pickers.

[Neovim (v0.9.0)](https://github.com/neovim/neovim/releases/tag/v0.9.0) or the latest neovim nightly commit is required for `telescope.nvim` to work. The neovim version also needs to be compiled with LuaJIT, we currently do not support Lua5.1 because of some ongoing issues.

### [Required dependencies](#required-dependencies)

* [nvim-lua/plenary.nvim](https://github.com/nvim-lua/plenary.nvim) is required.

### [Suggested dependencies](#suggested-dependencies)

* [BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep) is required for`live_grep` and `grep_string` and is the first priority for `find_files`.

We also suggest you install one native telescope sorter to significantly improve sorting performance. Take a look at either[telescope-fzf-native.nvim](https://github.com/nvim-telescope/telescope-fzf-native.nvim)or[telescope-fzy-native.nvim](https://github.com/nvim-telescope/telescope-fzy-native.nvim). For more information and a performance benchmark take a look at the[Extensions](https://github.com/nvim-telescope/telescope.nvim/wiki/Extensions)wiki.

### [Optional dependencies](#optional-dependencies)

* [sharkdp/fd](https://github.com/sharkdp/fd) (finder)
* [nvim-treesitter/nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) (finder/preview)
* [neovim LSP](https://neovim.io/doc/user/lsp.html) (picker)
* [devicons](https://github.com/nvim-tree/nvim-web-devicons) (icons)

### [Installation](#installation)

It is suggested to either use the latest release[tag](https://github.com/nvim-telescope/telescope.nvim/tags) or our release branch (which will get consistent updates)[0.1.x](https://github.com/nvim-telescope/telescope.nvim/tree/0.1.x).

It is not suggested to run latest master.

Using [vim-plug](https://github.com/junegunn/vim-plug)

Plug 'nvim-lua/plenary.nvim'
Plug 'nvim-telescope/telescope.nvim', { 'tag': '0.1.4' }
" or                                , { 'branch': '0.1.x' }

Using [dein](https://github.com/Shougo/dein.vim)

call dein#add('nvim-lua/plenary.nvim')
call dein#add('nvim-telescope/telescope.nvim', { 'rev': '0.1.4' })
" or                                         , { 'rev': '0.1.x' })

Using [packer.nvim](https://github.com/wbthomason/packer.nvim)

use {
  'nvim-telescope/telescope.nvim', tag = '0.1.4',
-- or                            , branch = '0.1.x',
  requires = { {'nvim-lua/plenary.nvim'} }
}

Using [lazy.nvim](https://github.com/folke/lazy.nvim)

-- init.lua:
    {
    'nvim-telescope/telescope.nvim', tag = '0.1.4',
-- or                              , branch = '0.1.x',
      dependencies = { 'nvim-lua/plenary.nvim' }
    }

-- plugins/telescope.lua:
return {
    'nvim-telescope/telescope.nvim', tag = '0.1.4',
-- or                              , branch = '0.1.x',
      dependencies = { 'nvim-lua/plenary.nvim' }
    }

### [checkhealth](#checkhealth)

Make sure you call `:checkhealth telescope` after installing telescope to ensure everything is set up correctly.

After this setup you can continue reading here or switch to `:help telescope`to get an understanding of how to use Telescope and how to configure it.

## [Usage](#usage)

Try the command `:Telescope find_files\<cr\>`to see if `telescope.nvim` is installed correctly.

Using VimL:

" Find files using Telescope command-line sugar.
nnoremap \<leader\>ff \<cmd\>Telescope find_files\<cr\>
nnoremap \<leader\>fg \<cmd\>Telescope live_grep\<cr\>
nnoremap \<leader\>fb \<cmd\>Telescope buffers\<cr\>
nnoremap \<leader\>fh \<cmd\>Telescope help_tags\<cr\>

" Using Lua functions
nnoremap \<leader\>ff \<cmd\>lua require('telescope.builtin').find_files()\<cr\>
nnoremap \<leader\>fg \<cmd\>lua require('telescope.builtin').live_grep()\<cr\>
nnoremap \<leader\>fb \<cmd\>lua require('telescope.builtin').buffers()\<cr\>
nnoremap \<leader\>fh \<cmd\>lua require('telescope.builtin').help_tags()\<cr\>

Using Lua:

local builtin = require('telescope.builtin')
vim.keymap.set('n', '\<leader\>ff', builtin.find_files, {})
vim.keymap.set('n', '\<leader\>fg', builtin.live_grep, {})
vim.keymap.set('n', '\<leader\>fb', builtin.buffers, {})
vim.keymap.set('n', '\<leader\>fh', builtin.help_tags, {})

See [builtin pickers](#pickers) for a list of all builtin functions.

## [Customization](#customization)

This section should help you explore available options to configure and customize your `telescope.nvim`.

Unlike most vim plugins, `telescope.nvim` can be customized by either applying customizations globally, or individually per picker.

* **Global Customization** affecting all pickers can be done through the main`setup()` method (see defaults below)
* **Individual Customization** affecting a single picker by passing `opts` to builtin pickers (e.g. `builtin.find_files(opts)`) see[Configuration recipes](https://github.com/nvim-telescope/telescope.nvim/wiki/Configuration-Recipes)wiki page for ideas.

### [Telescope setup structure](#telescope-setup-structure)

require('telescope').setup{
  defaults = {
    -- Default configuration for telescope goes here:
    -- config_key = value,
    mappings = {
      i = {
        -- map actions.which_key to \<C-h\> (default: \<C-/\>)
        -- actions.which_key shows the mappings for your picker,
        -- e.g. git_{create, delete, ...}_branch for the git_branches picker
        ["\<C-h\>"] = "which_key"
      }
    }
  },
  pickers = {
    -- Default configuration for builtin pickers goes here:
    -- picker_name = {
    --   picker_config_key = value,
    --   ...
    -- }
    -- Now the picker_config_key will be applied every time you call this
    -- builtin picker
  },
  extensions = {
    -- Your extension configuration goes here:
    -- extension_name = {
    --   extension_config_key = value,
    -- }
    -- please take a look at the readme of the extension you want to configure
  }
}

To look at what default configuration options exist please read: `:help telescope.setup()`. For picker specific `opts` please read: `:help telescope.builtin`.

To embed the above code snippet in a `.vim` file (for example in `after/plugin/telescope.nvim.vim`), wrap it in `lua \<\< EOF code-snippet EOF`:

lua \<\< EOF
require('telescope').setup{
  -- ...
}
EOF

## [Default Mappings](#default-mappings)

Mappings are fully customizable. Many familiar mapping patterns are set up as defaults.

| Mappings       | Action                                               |
| -------------- | ---------------------------------------------------- |
| \<C-n\\>/\<Down\\> | Next item                                            |
| \<C-p\\>/\<Up\\>   | Previous item                                        |
| j/k            | Next/previous (in normal mode)                       |
| H/M/L          | Select High/Middle/Low (in normal mode)              |
| gg/G           | Select the first/last item (in normal mode)          |
| \<CR\\>          | Confirm selection                                    |
| \<C-x\>          | Go to file selection as a split                      |
| \<C-v\>          | Go to file selection as a vsplit                     |
| \<C-t\>          | Go to a file in a new tab                            |
| \<C-u\>          | Scroll up in preview window                          |
| \<C-d\>          | Scroll down in preview window                        |
| \<C-f\>          | Scroll left in preview window                        |
| \<C-k\>          | Scroll right in preview window                       |
| \<M-f\>          | Scroll left in results window                        |
| \<M-k\>          | Scroll right in results window                       |
| \<C-/\>          | Show mappings for picker actions (insert mode)       |
| ?              | Show mappings for picker actions (normal mode)       |
| \<C-c\>          | Close telescope (insert mode)                        |
| \<Esc\>          | Close telescope (in normal mode)                     |
| \<Tab\>          | Toggle selection and move to next selection          |
| \<S-Tab\>        | Toggle selection and move to prev selection          |
| \<C-q\>          | Send all items not filtered to quickfixlist (qflist) |
| \<M-q\>          | Send all selected items to qflist                    |

To see the full list of mappings, check out `lua/telescope/mappings.lua` and the`default_mappings` table.

**Tip**: you can use `\<C-/\>` and `?` in insert and normal mode, respectively, to show the actions mapped to your picker.

Much like [builtin pickers](#pickers), there are a number of[actions](https://github.com/nvim-telescope/telescope.nvim/blob/master/lua/telescope/actions/init.lua)you can pick from to remap your telescope buffer mappings, or create a new custom action:

-- Built-in actions
local transform_mod = require('telescope.actions.mt').transform_mod

-- or create your custom action
local my_cool_custom_action = transform_mod({
  x = function(prompt_bufnr)
    print("This function ran after another action. Prompt_bufnr: " .. prompt_bufnr)
    -- Enter your function logic here. You can take inspiration from lua/telescope/actions.lua
  end,
})

To remap telescope mappings, please read `:help telescope.defaults.mappings`. To do picker specific mappings, its suggested to do this with the `pickers`table in `telescope.setup`. Each picker accepts a `mappings` table like its explained in `:help telescope.defaults.mappings`.

## [Pickers](#pickers)

Built-in functions. Ready to be bound to any key you like.

:lua require'telescope.builtin'.planets{}

:nnoremap \<Leader\>pp :lua require'telescope.builtin'.planets{}

### [File Pickers](#file-pickers)

| Functions            | Description                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| builtin.find\_files  | Lists files in your current working directory, respects .gitignore                                                                                                       |
| builtin.git\_files   | Fuzzy search through the output of git ls\-files command, respects .gitignore                                                                                            |
| builtin.grep\_string | Searches for the string under your cursor or selection in your current working directory                                                                                 |
| builtin.live\_grep   | Search for a string in your current working directory and get results live as you type, respects .gitignore. (Requires [ripgrep](https://github.com/BurntSushi/ripgrep)) |

### [Vim Pickers](#vim-pickers)

| Functions                            | Description                                                                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| builtin.buffers                      | Lists open buffers in current neovim instance                                                                                                               |
| builtin.oldfiles                     | Lists previously open files                                                                                                                                 |
| builtin.commands                     | Lists available plugin/user commands and runs them on \<cr\>                                                                                                  |
| builtin.tags                         | Lists tags in current directory with tag location file preview (users are required to run ctags -R to generate tags or update when introducing new changes) |
| builtin.command\_history             | Lists commands that were executed recently, and reruns them on \<cr\>                                                                                         |
| builtin.search\_history              | Lists searches that were executed recently, and reruns them on \<cr\>                                                                                         |
| builtin.help\_tags                   | Lists available help tags and opens a new window with the relevant help info on \<cr\>                                                                        |
| builtin.man\_pages                   | Lists manpage entries, opens them in a help window on \<cr\>                                                                                                  |
| builtin.marks                        | Lists vim marks and their value                                                                                                                             |
| builtin.colorscheme                  | Lists available colorschemes and applies them on \<cr\>                                                                                                       |
| builtin.quickfix                     | Lists items in the quickfix list                                                                                                                            |
| builtin.quickfixhistory              | Lists all quickfix lists in your history and open them with builtin.quickfix or quickfix window                                                             |
| builtin.loclist                      | Lists items from the current window's location list                                                                                                         |
| builtin.jumplist                     | Lists Jump List entries                                                                                                                                     |
| builtin.vim\_options                 | Lists vim options, allows you to edit the current value on \<cr\>                                                                                             |
| builtin.registers                    | Lists vim registers, pastes the contents of the register on \<cr\>                                                                                            |
| builtin.autocommands                 | Lists vim autocommands and goes to their declaration on \<cr\>                                                                                                |
| builtin.spell\_suggest               | Lists spelling suggestions for the current word under the cursor, replaces word with selected suggestion on \<cr\>                                            |
| builtin.keymaps                      | Lists normal mode keymappings                                                                                                                               |
| builtin.filetypes                    | Lists all available filetypes                                                                                                                               |
| builtin.highlights                   | Lists all available highlights                                                                                                                              |
| builtin.current\_buffer\_fuzzy\_find | Live fuzzy search inside of the currently open buffer                                                                                                       |
| builtin.current\_buffer\_tags        | Lists all of the tags for the currently open buffer, with a preview                                                                                         |
| builtin.resume                       | Lists the results incl. multi-selections of the previous picker                                                                                             |
| builtin.pickers                      | Lists the previous pickers incl. multi-selections (see :h telescope.defaults.cache\_picker)                                                                 |

### [Neovim LSP Pickers](#neovim-lsp-pickers)

| Functions                                | Description                                                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| builtin.lsp\_references                  | Lists LSP references for word under the cursor                                                                             |
| builtin.lsp\_incoming\_calls             | Lists LSP incoming calls for word under the cursor                                                                         |
| builtin.lsp\_outgoing\_calls             | Lists LSP outgoing calls for word under the cursor                                                                         |
| builtin.lsp\_document\_symbols           | Lists LSP document symbols in the current buffer                                                                           |
| builtin.lsp\_workspace\_symbols          | Lists LSP document symbols in the current workspace                                                                        |
| builtin.lsp\_dynamic\_workspace\_symbols | Dynamically Lists LSP for all workspace symbols                                                                            |
| builtin.diagnostics                      | Lists Diagnostics for all open buffers or a specific buffer. Use option bufnr\=0 for current buffer.                       |
| builtin.lsp\_implementations             | Goto the implementation of the word under the cursor if there's only one, otherwise show all options in Telescope          |
| builtin.lsp\_definitions                 | Goto the definition of the word under the cursor, if there's only one, otherwise show all options in Telescope             |
| builtin.lsp\_type\_definitions           | Goto the definition of the type of the word under the cursor, if there's only one, otherwise show all options in Telescope |

### [Git Pickers](#git-pickers)

| Functions                    | Description                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| builtin.git\_commits         | Lists git commits with diff preview, checkout action \<cr\>, reset mixed \<C-r\>m, reset soft \<C-r\>s and reset hard \<C-r\>h                                                                  |
| builtin.git\_bcommits        | Lists buffer's git commits with diff preview and checks them out on \<cr\>                                                                                                                |
| builtin.git\_bcommits\_range | Lists buffer's git commits in a range of lines. Use options from and to to specify the range. In visual mode, lists commits for the selected lines                                      |
| builtin.git\_branches        | Lists all branches with log preview, checkout action \<cr\>, track action \<C-t\>, rebase action\<C-r\>, create action \<C-a\>, switch action \<C-s\>, delete action \<C-d\> and merge action \<C-y\> |
| builtin.git\_status          | Lists current changes per file with diff preview and add action. (Multi-selection still WIP)                                                                                            |
| builtin.git\_stash           | Lists stash items in current repository with ability to apply them on \<cr\>                                                                                                              |

### [Treesitter Picker](#treesitter-picker)

| Functions          | Description                                       |
| ------------------ | ------------------------------------------------- |
| builtin.treesitter | Lists Function names, variables, from Treesitter! |

### [Lists Picker](#lists-picker)

| Functions        | Description                                                                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| builtin.planets  | Use the telescope...                                                                                                                                                                     |
| builtin.builtin  | Lists Built-in pickers and run them on \<cr\>.                                                                                                                                             |
| builtin.reloader | Lists Lua modules and reload them on \<cr\>.                                                                                                                                               |
| builtin.symbols  | Lists symbols inside a file data/telescope-sources/\*.json found in your rtp. More info and symbol sources can be found [here](https://github.com/nvim-telescope/telescope-symbols.nvim) |

## [Previewers](#previewers)

| Previewers                          | Description                                              |
| ----------------------------------- | -------------------------------------------------------- |
| previewers.vim\_buffer\_cat.new     | Default previewer for files. Uses vim buffers            |
| previewers.vim\_buffer\_vimgrep.new | Default previewer for grep and similar. Uses vim buffers |
| previewers.vim\_buffer\_qflist.new  | Default previewer for qflist. Uses vim buffers           |
| previewers.cat.new                  | Terminal previewer for files. Uses cat/bat               |
| previewers.vimgrep.new              | Terminal previewer for grep and similar. Uses cat/bat    |
| previewers.qflist.new               | Terminal previewer for qflist. Uses cat/bat              |

The default previewers are from now on `vim_buffer_` previewers. They use vim buffers for displaying files and use tree-sitter or regex for file highlighting.

These previewers are using `vim.filetype` to guess the filetype for the selected file. The guessing is done by inspecting the filename, the head of the file(shebang) and the tail of the file (modeline). If you have trouble with filetype detection you should read `:help vim.filetype`.

We need to do it manually because we can't determine the filetype in the traditional way: We don't do `bufload` and instead read the file asynchronously with `vim.loop.fs_` and attach only a highlighter; otherwise the speed of the previewer would slow down considerably.

If you want to configure the `vim_buffer_` previewer (e.g. you want the line to wrap), do this:

vim.api.nvim_create_autocmd("User", {
  pattern = "TelescopePreviewerLoaded",
  callback = function(args)
    if args.data.filetype ~= "help" then
      vim.wo.number = true
    elseif args.data.bufname:match("*.csv") then
      vim.wo.wrap = false
    end
  end,
})

A data field is passed to the callback, which contains the filetype and the buffer name.

{
  title: string, # preview window title
  filetype: string,
  bufname: string,
}

## [Sorters](#sorters)

| Sorters                             | Description                                                     |
| ----------------------------------- | --------------------------------------------------------------- |
| sorters.get\_fuzzy\_file            | Telescope's default sorter for files                            |
| sorters.get\_generic\_fuzzy\_sorter | Telescope's default sorter for everything else                  |
| sorters.get\_levenshtein\_sorter    | Using Levenshtein distance algorithm (don't use :D)             |
| sorters.get\_fzy\_sorter            | Using fzy algorithm                                             |
| sorters.fuzzy\_with\_index\_bias    | Used to list stuff with consideration to when the item is added |

A `Sorter` is called by the `Picker` on each item returned by the `Finder`. It returns a number, which is equivalent to the "distance" between the current`prompt` and the `entry` returned by a `finder`.

## [Layout (display)](#layout-display)

Layout can be configured by choosing a specific `layout_strategy` and specifying a particular `layout_config` for that strategy. For more details on available strategies and configuration options, see `:help telescope.layout`.

Some options for configuring sizes in layouts are "resolvable". This means that they can take different forms, and will be interpreted differently according to which form they take. For example, if we wanted to set the `width` of a picker using the `vertical`layout strategy to 50% of the screen width, we would specify that width as `0.5`, but if we wanted to specify the `width` to be exactly 80 characters wide, we would specify it as `80`. For more details on resolving sizes, see `:help telescope.resolve`.

As an example, if we wanted to specify the layout strategy and width, but only for this instance, we could do something like:

```routeros
:lua require('telescope.builtin').find_files({layout_strategy='vertical',layout_config={width=0.5}})

```

If we wanted to change the width for every time we use the `vertical`layout strategy, we could add the following to our `setup()` call:

require('telescope').setup({
  defaults = {
    layout_config = {
      vertical = { width = 0.5 }
      -- other layout configuration here
    },
    -- other defaults configuration here
  },
  -- other configuration values here
})

## [Themes](#themes)

Common groups of settings can be set up to allow for themes. We have some built in themes but are looking for more cool options.

[![dropdown](https://proxy-prod.omnivore-image-cache.app/0x0,sFcCqvopRg1EisQtVO6UNu6Qop67hfa49tta4IluWoqg/https://camo.githubusercontent.com/cc512a0d4de37b42a4a6ecbc7eaaf35b0e516ad87ef5a0f182b04f3e7515fc49/68747470733a2f2f692e696d6775722e636f6d2f536f72416358762e706e67)](https://camo.githubusercontent.com/cc512a0d4de37b42a4a6ecbc7eaaf35b0e516ad87ef5a0f182b04f3e7515fc49/68747470733a2f2f692e696d6775722e636f6d2f536f72416358762e706e67)

| Themes               | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| themes.get\_dropdown | A list like centered list. [dropdown](https://i.imgur.com/SorAcXv.png)                      |
| themes.get\_cursor   | [A cursor relative list.](https://github.com/nvim-telescope/telescope.nvim/pull/878)        |
| themes.get\_ivy      | Bottom panel overlay. [Ivy #771](https://github.com/nvim-telescope/telescope.nvim/pull/771) |

To use a theme, simply append it to a builtin function:

nnoremap \<Leader\>f :lua require'telescope.builtin'.find_files(require('telescope.themes').get_dropdown({}))\<cr\>
" Change an option
nnoremap \<Leader\>f :lua require'telescope.builtin'.find_files(require('telescope.themes').get_dropdown({ winblend = 10 }))\<cr\>

Or use with a command:

Telescope find_files theme=dropdown

Or you can configure it in the pickers table in `telescope.setup`:

require('telescope').setup{
  defaults = {
    -- ...
  },
  pickers = {
    find_files = {
      theme = "dropdown",
    }
  },
  extensions = {
    -- ...
  }
}

Themes should work with every `telescope.builtin` function. If you wish to make a theme, check out `lua/telescope/themes.lua`.

## [Vim Commands](#vim-commands)

All `telescope.nvim` functions are wrapped in `vim` commands for easy access, tab completions and setting options.

" Show all builtin pickers
:Telescope

" Tab completion
:Telescope |\<tab\>
:Telescope find_files

" Setting options
:Telescope find_files prompt_prefix=🔍

" If the option accepts a Lua table as its value, you can use, to connect each
" command string, e.g.: find_command, vimgrep_arguments are both options that
" accept a Lua table as a value. So, you can configure them on the command line
"like so:
:Telescope find_files find_command=rg,--ignore,--hidden,--files prompt_prefix=🔍

for more information and how to realize more complex commands please read`:help telescope.command`.

## [Autocmds](#autocmds)

Telescope user autocmds:

| Event                         | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| User TelescopeFindPre         | Do it before Telescope creates all the floating windows |
| User TelescopePreviewerLoaded | Do it after Telescope previewer window is created       |
| User TelescopeResumePost      | Do it after Telescope resume action is fully completed  |

## [Extensions](#extensions)

Telescope provides the capabilities to create & register extensions, which improves telescope in a variety of ways.

Some extensions provide integration with external tools, outside of the scope of`builtins`. Others provide performance enhancements by using compiled C and interfacing directly with Lua over LuaJIT's FFI library.

A list of community extensions can be found in the[Extensions](https://github.com/nvim-telescope/telescope.nvim/wiki/Extensions)wiki. Always read the README of the extension you want to install, but here is a general overview of how most extensions work.

### [Loading extensions](#loading-extensions)

To load an extension, use the `load_extension` function as shown in the example below:

-- This will load fzy_native and have it override the default file sorter
require('telescope').load_extension('fzy_native')

You may skip explicitly loading extensions (they will then be lazy-loaded), but tab completions will not be available right away.

### [Accessing pickers from extensions](#accessing-pickers-from-extensions)

Pickers from extensions are added to the `:Telescope` command under their respective name. For example:

" Run the `configurations` picker from nvim-dap
:Telescope dap configurations

They can also be called directly from Lua:

-- Run the `configurations` picker from nvim-dap
require('telescope').extensions.dap.configurations()

## [API](#api)

For writing your own picker and for information about the API please read the[Developers Documentation](https://github.com/nvim-telescope/telescope.nvim/blob/master/developers.md).

## [Media](#media)

* [What is Telescope? (Video)](https://www.twitch.tv/teej%5Fdv/clip/RichDistinctPlumberPastaThat)
* [More advanced configuration (Video)](https://www.twitch.tv/videos/756229115)
* [telescope.nvim 0.1 reflection (Video)](https://www.youtube.com/watch?v=3WEAjCXFiiM)
* [Why Telescope? (Video)](https://www.youtube.com/watch?v=8SqFt5h2Lsg)
* [Telescope and Nvim 0.5 Intro (Video)](https://www.youtube.com/watch?v=guxLXcG1kzQ)

## [Contributing](#contributing)

All contributions are welcome! Just open a pull request. Please read [CONTRIBUTING.md](https://github.com/nvim-telescope/telescope.nvim/blob/master/CONTRIBUTING.md)

## [Related Projects](#related-projects)

* [fzf.vim](https://github.com/junegunn/fzf.vim)
* [denite.nvim](https://github.com/Shougo/denite.nvim)
* [vim-clap](https://github.com/liuchengxu/vim-clap)



# links
[Read on Omnivore](https://omnivore.app/me/nvim-telescope-telescope-nvim-find-filter-preview-pick-all-lua-a-18b3ea35f02)
[Read Original](https://github.com/nvim-telescope/telescope.nvim)

<iframe src="https://github.com/nvim-telescope/telescope.nvim"  width="800" height="500"></iframe>
