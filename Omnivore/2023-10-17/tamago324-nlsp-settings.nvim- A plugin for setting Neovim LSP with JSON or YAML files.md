---
id: 60b84614-6d0c-11ee-8c24-8775a920ef19
title: "tamago324/nlsp-settings.nvim: A plugin for setting Neovim LSP with JSON or YAML files"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 19:44:02
words_count: 444
state: INBOX
---

# tamago324/nlsp-settings.nvim: A plugin for setting Neovim LSP with JSON or YAML files by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A plugin for setting Neovim LSP with JSON or YAML files - tamago324/nlsp-settings.nvim: A plugin for setting Neovim LSP with JSON or YAML files


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## [nlsp-settings.nvim](#nlsp-settingsnvim)

[![gen_schemas](https://proxy-prod.omnivore-image-cache.app/0x0,sWCQbGpD2CngRxDFZERDib5pNT2Isxc0rnINVFntW_CE/https://github.com/tamago324/nlsp-settings.nvim/actions/workflows/gen_schemas.yml/badge.svg)](https://github.com/tamago324/nlsp-settings.nvim/actions/workflows/gen%5Fschemas.yml)

A plugin to configure Neovim LSP using json/yaml files like `coc-settings.json`.

[![sumneko_lua_completion.gif](https://proxy-prod.omnivore-image-cache.app/0x0,szwsuFfYGnscBw7M-Ipt2pYHbBNeraBq8EECS-lGL7JI/https://github.com/tamago324/images/raw/master/nlsp-settings.nvim/sumneko_lua_completion.gif)](https://github.com/tamago324/images/blob/master/nlsp-settings.nvim/sumneko%5Flua%5Fcompletion.gif) 

Using `nlsp-settings.nvim` and [lspconfig](https://github.com/neovim/nvim-lspconfig/) and [jsonls](https://github.com/vscode-langservers/vscode-json-languageserver/) and [nvim-compe](https://github.com/hrsh7th/nvim-compe/) and [vim-vsnip](https://github.com/hrsh7th/vim-vsnip/)

Using `nlsp-settings.nvim`, you can write some of the `settings` to be passed to `lspconfig.xxx.setup()` in a json file. You can also use it with [jsonls](https://github.com/vscode-langservers/vscode-json-languageserver) to complete the configuration values.

## [Requirements](#requirements)

* Neovim
* [neovim/nvim-lspconfig](https://github.com/neovim/nvim-lspconfig/)

## [Installation](#installation)

Plug 'neovim/nvim-lspconfig'
Plug 'tamago324/nlsp-settings.nvim'

" Recommend
Plug 'williamboman/nvim-lsp-installer'

" Optional
Plug 'rcarriga/nvim-notify'

## [Getting Started](#getting-started)

### [Step1\. Install jsonls with nvim-lsp-installer](#step1-install-jsonls-with-nvim-lsp-installer)

### [Step2\. Setup LSP servers](#step2-setup-lsp-servers)

Example: Completion using omnifunc

local lsp_installer = require('nvim-lsp-installer')
local lspconfig = require("lspconfig")
local nlspsettings = require("nlspsettings")

nlspsettings.setup({
  config_home = vim.fn.stdpath('config') .. '/nlsp-settings',
  local_settings_dir = ".nlsp-settings",
  local_settings_root_markers_fallback = { '.git' },
  append_default_schemas = true,
  loader = 'json'
})

function on_attach(client, bufnr)
  local function buf_set_option(...) vim.api.nvim_buf_set_option(bufnr, ...) end
  buf_set_option('omnifunc', 'v:lua.vim.lsp.omnifunc')
end

local global_capabilities = vim.lsp.protocol.make_client_capabilities()
global_capabilities.textDocument.completion.completionItem.snippetSupport = true

lspconfig.util.default_config = vim.tbl_extend("force", lspconfig.util.default_config, {
  capabilities = global_capabilities,
})

lsp_installer.on_server_ready(function(server)
  server:setup({
    on_attach = on_attach
  })
end)

TODO: その他の設定は doc を参照

### [Step3\. Write settings](#step3-write-settings)

Execute `:LspSettings sumneko_lua`.  
`sumneko_lua.json` will be created under the directory set in `config_home`. Type `<C-x><C-o>`. You should now have jsonls completion enabled.

## [Usage](#usage)

### [LspSettings command](#lspsettings-command)

* `:LspSettings [server_name]`: Open the global settings file for the specified `{server_name}`.
* `:LspSettings buffer`: Open the global settings file that matches the current buffer.
* `:LspSettings local [server_name]`: Open the local settings file of the specified `{server_name}` corresponding to the cwd.
* `:LspSettings local buffer` or `LspSettings buffer local`: Open the local settings file of the server corresponding to the current buffer.
* `:LspSettings update [server_name]`: Update the setting values for the specified `{server_name}`.

For a list of language servers that have JSON Schema, see [here](https://github.com/tamago324/nlsp-settings.nvim/blob/main/schemas/README.md).

### [Settings files for each project](#settings-files-for-each-project)

You can create a settings file for each project with the following command.

* `:LspSettings local [server_name]`.
* `:LspSettings update [server_name]`

The settings file will be created in `{project_path}/.nlsp-settings/{server_name}.json`.

### [Combine with Lua configuration](#combine-with-lua-configuration)

It is still possible to write `settings` in lua. However, if you have the same key, the value in the JSON file will take precedence.

Example) Write sumneko\_lua settings in Lua

local server_opts = {}

-- lua
server_opts.sumneko_lua = {
  settings = {
    Lua = {
      workspace = {
        library = {
          [vim.fn.expand("$VIMRUNTIME/lua")] = true,
          [vim.fn.stdpath("config") .. '/lua'] = true,
        }
      }
    }
  }
}

local common_setup_opts = {
  -- on_attach = on_attach,
  -- capabilities = require('cmp_nvim_lsp').update_capabilities(
  --   vim.lsp.protocol.make_client_capabilities()
  -- )
}

lsp_installer.on_server_ready(function(server)
  local opts = vim.deepcopy(common_setup_opts)
  if server_opts[server.name] then
      opts = vim.tbl_deep_extend('force', opts, server_opts[server.name])
  end
  server:setup(opts)
end)

## [Contributing](#contributing)

* All contributions are welcome.

## [License](#license)

MIT



# links
[Read on Omnivore](https://omnivore.app/me/tamago-324-nlsp-settings-nvim-a-plugin-for-setting-neovim-lsp-wi-18b3e85dda9)
[Read Original](https://github.com/tamago324/nlsp-settings.nvim)

<iframe src="https://github.com/tamago324/nlsp-settings.nvim"  width="800" height="500"></iframe>
