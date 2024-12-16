---
id: 6254620a-6d16-11ee-b7a7-df7f970e3776
title: VonHeikemen/lsp-zero.nvim at v2.x
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:55:39
date_published: 2023-09-20 03:00:00
words_count: 1698
state: INBOX
---

# VonHeikemen/lsp-zero.nvim at v2.x by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A starting point to setup some lsp related features in neovim. - VonHeikemen/lsp-zero.nvim at v2.x


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## [LSP Zero](#lsp-zero)

The purpose of this plugin is to bundle all the "boilerplate code" necessary to have [nvim-cmp](https://github.com/hrsh7th/nvim-cmp) (a popular autocompletion plugin) and [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) working together. And if you opt in, it can use [mason.nvim](https://github.com/williamboman/mason.nvim) to let you install language servers from inside neovim.

If you have any question about a feature or configuration feel free to open a new [discussion](https://github.com/VonHeikemen/lsp-zero.nvim/discussions) in this repository. Or join the chat [#lsp-zero-nvim:matrix.org](https://matrix.to/#/#lsp-zero-nvim:matrix.org).

## [Announcement](#announcement)

[lsp-zero version 3](https://github.com/VonHeikemen/lsp-zero.nvim/tree/v3.x) is now available, the branch `v3.x` has been created. Note that `v2.x` is still the default, so the documentation here is still from version 2\. `v3.x` will become the default on `september 20`.

If you are using v2.x and wish to upgrade, read this:

* [Migrate from v2.x to v3.x](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v3.x/doc/md/guides/migrate-from-v2-branch.md)

## [How to get started](#how-to-get-started)

First, make sure you have Neovim v0.8 or greater. If you are using Neovim v0.7.2 or lower you will need to download [lsp-zero v1.x](https://github.com/VonHeikemen/lsp-zero.nvim/tree/v1.x).

If you are new to neovim and you don't have a configuration file (`init.lua`) follow this [step by step tutorial](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/tutorial.md).

If you know how to configure neovim go to [Quickstart (for the impatient)](#quickstart-for-the-impatient).

Also consider [you might not need lsp-zero](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#you-might-not-need-lsp-zero).

## [Documentation](#documentation)

* LSP  
   * [Introduction](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#introduction)  
   * [Commands](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#commands)  
   * [Creating new keybindings](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#creating-new-keybindings)  
   * [Disable keybindings](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#disable-keybindings)  
   * [Install new language servers](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#install-new-language-servers)  
   * [Configure language servers](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#configure-language-servers)  
   * [Disable semantic highlights](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#disable-semantic-highlights)  
   * [Disable a language server](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#disable-a-language-server)  
   * [Custom servers](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#custom-servers)  
   * [Enable Format on save](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#enable-format-on-save)  
   * [Format buffer using a keybinding](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#format-buffer-using-a-keybinding)  
   * [Troubleshooting](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#troubleshooting)  
   * [Diagnostics (a.k.a. error messages, warnings, etc.)](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#diagnostics)  
   * [Use icons in the sign column](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#use-icons-in-the-sign-column)  
   * [Language servers and mason.nvim](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#language-servers-and-masonnvim)
* Autocompletion  
   * [Introduction](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#introduction)  
   * [Preset settings](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#preset-settings)  
   * [Recommended sources](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#recommended-sources)  
   * [Keybindings](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#keybindings)  
   * [Use Enter to confirm completion](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#use-enter-to-confirm-completion)  
   * [Adding a source](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#adding-a-source)  
   * [Add an external collection of snippets](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#add-an-external-collection-of-snippets)  
   * [Preselect first item](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#preselect-first-item)  
   * [Basic completions for Neovim's lua api](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#basic-completions-for-neovims-lua-api)  
   * [Enable "Super Tab"](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#enable-super-tab)  
   * [Regular tab complete](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#regular-tab-complete)  
   * [Invoke completion menu manually](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#invoke-completion-menu-manually)  
   * [Adding borders to completion menu](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#adding-borders-to-completion-menu)  
   * [Change formatting of completion item](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#change-formatting-of-completion-item)  
   * [lsp-kind](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#lsp-kind)
* Reference and guides  
   * [API Reference](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md)  
   * [Tutorial: Step by step setup from scratch](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/tutorial.md)  
   * [Migrate from v1.x branch](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/migrate-from-v1-branch.md)  
   * [lsp-zero under the hood](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/under-the-hood.md)  
   * [You might not need lsp-zero](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/lsp.md#you-might-not-need-lsp-zero)  
   * [Lazy loading with lazy.nvim](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/lazy-loading-with-lazy-nvim.md)  
   * [Integrate with null-ls](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/integrate-with-null-ls.md)  
   * [Enable folds with nvim-ufo](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/quick-recipes.md#enable-folds-with-nvim-ufo)  
   * [Enable inlay hints with lsp-inlayhints.nvim](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/quick-recipes.md#enable-inlay-hints-with-lsp-inlayhintsnvim)  
   * [Setup copilot.lua + nvim-cmp](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/setup-copilot-lua-plus-nvim-cmp.md#setup-copilotlua--nvim-cmp)  
   * [Setup with nvim-navic](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/quick-recipes.md#setup-with-nvim-navic)  
   * [Setup with rust-tools](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/quick-recipes.md#setup-with-rust-tools)  
   * [Setup with typescript.nvim](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/quick-recipes.md#setup-with-typescriptnvim)  
   * [Setup with flutter-tools](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/quick-recipes.md#setup-with-flutter-tools)  
   * [Setup with nvim-jdtls](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/setup-with-nvim-jdtls.md)  
   * [Setup with nvim-metals](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/quick-recipes.md#setup-with-nvim-metals)  
   * [Setup with haskell-tools](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/guides/quick-recipes.md#setup-with-haskell-tools)

## [Quickstart (for the impatient)](#quickstart-for-the-impatient)

This section will teach you how to create a basic configuration for autocompletion and the LSP client.

If you know your way around neovim and how to configure it, take a look at this examples:

* [Lua template configuration](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/configuration-templates.md#lua-template)
* [Vimscript template configuration](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/configuration-templates.md#vimscript-template)

### [Requirements for language servers](#requirements-for-language-servers)

I suggest you read the [requirements of mason.nvim](https://github.com/williamboman/mason.nvim#requirements).

Make sure you have at least the minimum requirements listed in `unix systems` or `windows`.

### [Installing](#installing)

Use your favorite plugin manager to install this plugin and all its lua dependencies.

Expand lazy.nvim snippet: 

{
  'VonHeikemen/lsp-zero.nvim',
  branch = 'v2.x',
  dependencies = {
    -- LSP Support
    {'neovim/nvim-lspconfig'},             -- Required
    {'williamboman/mason.nvim'},           -- Optional
    {'williamboman/mason-lspconfig.nvim'}, -- Optional

    -- Autocompletion
    {'hrsh7th/nvim-cmp'},     -- Required
    {'hrsh7th/cmp-nvim-lsp'}, -- Required
    {'L3MON4D3/LuaSnip'},     -- Required
  }
}

Expand packer.nvim snippet: 

use {
  'VonHeikemen/lsp-zero.nvim',
  branch = 'v2.x',
  requires = {
    -- LSP Support
    {'neovim/nvim-lspconfig'},             -- Required
    {'williamboman/mason.nvim'},           -- Optional
    {'williamboman/mason-lspconfig.nvim'}, -- Optional

    -- Autocompletion
    {'hrsh7th/nvim-cmp'},     -- Required
    {'hrsh7th/cmp-nvim-lsp'}, -- Required
    {'L3MON4D3/LuaSnip'},     -- Required
  }
}

Expand paq.nvim snippet: 

{'VonHeikemen/lsp-zero.nvim', branch = 'v2.x'};

-- LSP Support
{'neovim/nvim-lspconfig'};             -- Required
{'williamboman/mason.nvim'};           -- Optional
{'williamboman/mason-lspconfig.nvim'}; -- Optional

-- Autocompletion
{'hrsh7th/nvim-cmp'};     -- Required
{'hrsh7th/cmp-nvim-lsp'}; -- Required
{'L3MON4D3/LuaSnip'};     -- Required

Expand vim-plug snippet: 

" LSP Support
Plug 'neovim/nvim-lspconfig'             " Required
Plug 'williamboman/mason.nvim',          " Optional
Plug 'williamboman/mason-lspconfig.nvim' " Optional

" Autocompletion
Plug 'hrsh7th/nvim-cmp'     " Required
Plug 'hrsh7th/cmp-nvim-lsp' " Required
Plug 'L3MON4D3/LuaSnip'     " Required

Plug 'VonHeikemen/lsp-zero.nvim', {'branch': 'v2.x'}

When using vimscript you can wrap lua code in `lua <<EOF ... EOF`.

" Don't copy this example
lua <<EOF
print('this an example code')
print('written in lua')
EOF

### [Usage](#usage)

Inside your configuration file add this piece of lua code.

local lsp = require('lsp-zero').preset({})

lsp.on_attach(function(client, bufnr)
  -- see :help lsp-zero-keybindings
  -- to learn the available actions
  lsp.default_keymaps({buffer = bufnr})
end)

-- (Optional) Configure lua language server for neovim
require('lspconfig').lua_ls.setup(lsp.nvim_lua_ls())

lsp.setup()

If you want to install a language server for a particular file type use the command `:LspInstall`. And when the installation is done restart neovim.

If you don't install `mason.nvim` then you'll need to list the LSP servers you have installed using [.setup\_servers()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#configurename-opts).

> Note: if you use NixOS don't install mason.nvim

local lsp = require('lsp-zero').preset({})

lsp.on_attach(function(client, bufnr)
  -- see :help lsp-zero-keybindings
  -- to learn the available actions
  lsp.default_keymaps({buffer = bufnr})
end)

-- When you don't have mason.nvim installed
-- You'll need to list the servers installed in your system
lsp.setup_servers({'tsserver', 'eslint'})

-- (Optional) Configure lua language server for neovim
require('lspconfig').lua_ls.setup(lsp.nvim_lua_ls())

lsp.setup()

## [Language servers](#language-servers)

Here are some things you need to know:

* The configuration for the language servers are provided by [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig).
* lsp-zero will create keybindings, commands, and will integrate nvim-cmp (the autocompletion plugin) with lspconfig if possible. You need to require lsp-zero before lspconfig for this to work.
* Even though lsp-zero calls [mason.nvim](https://github.com/williamboman/mason.nvim) under the hood it only configures LSP servers. Other tools like formatters, linters or debuggers are not configured by lsp-zero.
* If you need to configure a language server use `lspconfig`.

### [Keybindings](#keybindings)

When a language server gets attached to a buffer you gain access to some keybindings and commands. All of these shortcuts are bound to built-in functions, so you can get more details using the `:help` command.

* `K`: Displays hover information about the symbol under the cursor in a floating window. See [:help vim.lsp.buf.hover()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.hover%28%29).
* `gd`: Jumps to the definition of the symbol under the cursor. See [:help vim.lsp.buf.definition()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.definition%28%29).
* `gD`: Jumps to the declaration of the symbol under the cursor. Some servers don't implement this feature. See [:help vim.lsp.buf.declaration()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.declaration%28%29).
* `gi`: Lists all the implementations for the symbol under the cursor in the quickfix window. See [:help vim.lsp.buf.implementation()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.implementation%28%29).
* `go`: Jumps to the definition of the type of the symbol under the cursor. See [:help vim.lsp.buf.type\_definition()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.type%5Fdefinition%28%29).
* `gr`: Lists all the references to the symbol under the cursor in the quickfix window. See [:help vim.lsp.buf.references()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.references%28%29).
* `gs`: Displays signature information about the symbol under the cursor in a floating window. See [:help vim.lsp.buf.signature\_help()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.signature%5Fhelp%28%29). If a mapping already exists for this key this function is not bound.
* `<F2>`: Renames all references to the symbol under the cursor. See [:help vim.lsp.buf.rename()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.rename%28%29).
* `<F3>`: Format code in current buffer. See [:help vim.lsp.buf.format()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.format%28%29).
* `<F4>`: Selects a code action available at the current cursor position. See [:help vim.lsp.buf.code\_action()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf.code%5Faction%28%29).
* `gl`: Show diagnostics in a floating window. See [:help vim.diagnostic.open\_float()](https://neovim.io/doc/user/diagnostic.html#vim.diagnostic.open%5Ffloat%28%29).
* `[d`: Move to the previous diagnostic in the current buffer. See [:help vim.diagnostic.goto\_prev()](https://neovim.io/doc/user/diagnostic.html#vim.diagnostic.goto%5Fprev%28%29).
* `]d`: Move to the next diagnostic. See [:help vim.diagnostic.goto\_next()](https://neovim.io/doc/user/diagnostic.html#vim.diagnostic.goto%5Fnext%28%29).

By default lsp-zero will not create a keybinding if its "taken". This means if you already use one of these in your config, or some other plugins uses it ([which-key](https://github.com/folke/which-key.nvim) might be one), then lsp-zero's bindings will not work.

You can force lsp-zero's bindings by adding `preserve_mappings = false` to [.default\_keymaps()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#default%5Fkeymapsopts).

local lsp = require('lsp-zero').preset({})

lsp.on_attach(function(client, bufnr)
  lsp.default_keymaps({
    buffer = bufnr,
    preserve_mappings = false
  })
end)

--- .....

### [Troubleshooting](#troubleshooting)

If you are having problems with a language server I recommend that you reduce your config to a minimal and check the logs of the LSP server.

What do I mean with minimal? Configure the language server using just `lspconfig` and increase the log level. Then you can test the language server and inspect the log file using the command `:LspLog`.

Here is an example test with `tsserver`.

vim.lsp.set_log_level('debug')

local lsp_zero = require('lsp-zero')
local lsp_capabilities = require('cmp_nvim_lsp').default_capabilities()

local cmp = require('cmp')

cmp.setup({
  sources = {
    {name = 'nvim_lsp'}
  },
  mapping = cmp.mapping.preset.insert({
    ['<C-Space>'] = cmp.mapping.complete(),
  }),
  snippet = {
    expand = function(args)
      require('luasnip').lsp_expand(args.body)
    end,
  },
})

require('lspconfig').tsserver.setup({
  capabilities = lsp_capabilities,
  on_attach = function(client, bufnr)
    lsp_zero.default_keymaps({buffer = bufnr})
  end,
})

## [Autocomplete](#autocomplete)

The plugin responsible for autocompletion is [nvim-cmp](https://github.com/hrsh7th/nvim-cmp). The default preset (which is called [minimal](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#minimal)) will only add the minimum required to integrate lspconfig, nvim-cmp and [luasnip](https://github.com/L3MON4D3/LuaSnip).

### [Keybindings](#keybindings-1)

The default keybindings in lsp-zero are meant to emulate Neovim's default whenever possible.

* `<Ctrl-y>`: Confirms selection.
* `<Ctrl-e>`: Cancel completion.
* `<Down>`: Navigate to the next item on the list.
* `<Up>`: Navigate to previous item on the list.
* `<Ctrl-n>`: If the completion menu is visible, go to the next item. Else, trigger completion menu.
* `<Ctrl-p>`: If the completion menu is visible, go to the previous item. Else, trigger completion menu.
* `<Ctrl-d>`: Scroll down the documentation window.
* `<Ctrl-u>`: Scroll up the documentation window.

To add more keybindings I recommend you use [nvim-cmp](https://github.com/hrsh7th/nvim-cmp) directly.

Here is an example configuration.

local lsp = require('lsp-zero').preset({})

lsp.on_attach(function(client, bufnr)
  -- see :help lsp-zero-keybindings
  -- to learn the available actions
  lsp.default_keymaps({buffer = bufnr})
end)

lsp.setup()

-- You need to setup `cmp` after lsp-zero
local cmp = require('cmp')
local cmp_action = require('lsp-zero').cmp_action()

cmp.setup({
  mapping = {
    -- `Enter` key to confirm completion
    ['<CR>'] = cmp.mapping.confirm({select = false}),

    -- Ctrl+Space to trigger completion menu
    ['<C-Space>'] = cmp.mapping.complete(),

    -- Navigate between snippet placeholder
    ['<C-f>'] = cmp_action.luasnip_jump_forward(),
    ['<C-b>'] = cmp_action.luasnip_jump_backward(),
  }
})

## [Breaking changes](#breaking-changes)

* `sign_icons` was removed. If you want the icons you can configure them using [.set\_sign\_icons()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#set%5Fsign%5Ficonsopts).
* `force_setup` option of [.configure()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#configurename-opts) was removed. lsp-zero will configure the server even if is not installed.
* `force` option of [.setup\_servers()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#configurename-opts) was removed. lsp-zero will configure all the servers listed even if they are not installed.
* The preset `per-project` was removed in favor of the function [.store\_config()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#store%5Fconfigname-opts).
* `suggest_lsp_servers` was removed. The suggestions are still available (they are a feature of [mason-lspconfig](https://github.com/williamboman/mason-lspconfig.nvim)), they can be triggered manually using the command `:LspInstall`.
* `cmp_capabilities` was removed. The features it enables will be configured automatically if [cmp-nvim-lsp](https://github.com/hrsh7th/cmp-nvim-lsp) is installed.
* luasnip loaders need to be called manually by the user. See [luasnip documention for details](https://github.com/L3MON4D3/LuaSnip#add-snippets). If you are using `friendly-snippets` you'll want to add the one that says "from\_vscode". In the autocomplete documentation you can find an [example configuration](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#add-an-external-collection-of-snippets).

## [Future Changes/Deprecation notice](#future-changesdeprecation-notice)

Settings and functions that will change in the new `v3.x` branch.

Version 3 will become the default branch on .

### [Preset settings](#preset-settings)

I would like to get rid of named preset in the future. It's better if you use the default preset, the [minimal](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#minimal). I would advice against using the one called "recommended". Just add your settings using the [.preset()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#presetopts) function.

* `set_lsp_keymaps` will be removed in favor of [.default\_keymaps()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#default%5Fkeymapsopts).
* `manage_nvim_cmp` will be removed in favor of [.extend\_cmp()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#extend%5Fcmpopts).
* `setup_servers_on_start` will be removed. LSP servers will need to be listed explicitly using [.setup\_servers()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#configurename-opts).
* `call_servers` will be removed in favor of a explicit setup.
* `configure_diagnostics` will be removed.

### [Functions](#functions)

* [.set\_preferences()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#set%5Fpreferencesopts) will be removed in favor of overriding option directly in [.preset](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#presetname).
* [.setup\_nvim\_cmp()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#setup%5Fnvim%5Fcmpopts) will be removed. Use the `cmp` module to customize nvim-cmp.
* [.setup\_servers()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#setup%5Fserverslist) will no longer take an options argument. It'll only be a convenient way to initialize a list of servers.
* [.default.diagnostics()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#defaultsdiagnosticsopts) will be removed. Diagnostic config has been reduced, only `severity_sort` and borders are enabled. There is no need for this anymore.
* [.defaults.cmp\_sources()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#defaultscmp%5Fsources) will be removed. Sources for nvim-cmp will be handled by the user.
* [.defaults.cmp\_mappings()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#defaultscmp%5Fmappingsopts) will be removed. In the future only the defaults that align with Neovim's behavior will be configured. lsp-zero default functions for nvim-cmp will have to be added manually by the user.
* [.nvim\_workspace()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#nvim%5Fworkspaceopts) will be removed. Use [.nvim\_lua\_ls()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#nvim%5Flua%5Flsopts) to get the config and then use [.configure()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#configurename-opts) to setup the server.
* [.defaults.nvim\_workspace()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#defaultsnvim%5Fworkspace) will be replaced by [.nvim\_lua\_ls()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#nvim%5Flua%5Flsopts).
* [.ensure\_installed()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#ensure%5Finstalledlist) will be removed. Use the module `mason-lspconfig` to install LSP servers.
* [.setup()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#setup) will be removed.
* [.new\_server()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#new%5Fserveropts) will be renamed to `.new_client()`.

## [FAQ](#faq)

### [How do I get rid warnings in my neovim lua config?](#how-do-i-get-rid-warnings-in-my-neovim-lua-config)

lsp-zero has a function that will configure the lua language server for you: [.nvim\_lua\_ls()](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/api-reference.md#nvim%5Flua%5Flsopts)

### [Can I use the Enter key to confirm completion item?](#can-i-use-the-enter-key-to-confirm-completion-item)

Yes, you can. You can find the details in the autocomplete documentation: [Enter key to confirm completion](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#use-enter-to-confirm-completion).

### [My luasnip snippet don't show up in completion menu. How do I get them back?](#my-luasnip-snippet-dont-show-up-in-completion-menu-how-do-i-get-them-back)

If you have this problem I assume you are migrating from the `v1.x` branch. What you have to do is add the luasnip source in nvim-cmp, then call the correct luasnip loader. You can find more details of this in the [documentation for autocompletion](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v2.x/doc/md/autocomplete.md#add-an-external-collection-of-snippets).

## [Support](#support)

If you find this tool useful and want to support my efforts, [buy me a coffee ☕](https://www.buymeacoffee.com/vonheikemen).

[![buy me a coffee](https://proxy-prod.omnivore-image-cache.app/0x0,sQ1TN9CUwQQzA5obAsg5soc9yHMMCnvpVhODwJ8LXIWs/https://camo.githubusercontent.com/f136413d8b691853620a2270b381859bf7fcfbbdadd70836cdca8837c4b28594/68747470733a2f2f7265732e636c6f7564696e6172792e636f6d2f766f6e6865696b656d656e2f696d6167652f75706c6f61642f76313631383436363532322f6275792d6d652d636f666665655f616830757a682e706e67)](https://www.buymeacoffee.com/vonheikemen)



# links
[Read on Omnivore](https://omnivore.app/me/von-heikemen-lsp-zero-nvim-at-v-2-x-18b3ec77154)
[Read Original](https://github.com/VonHeikemen/lsp-zero.nvim/tree/v2.x)

<iframe src="https://github.com/VonHeikemen/lsp-zero.nvim/tree/v2.x"  width="800" height="500"></iframe>
