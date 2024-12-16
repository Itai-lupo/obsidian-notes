---
id: 3f868377-aac4-40b7-82e3-187499ce39fd
title: "mfussenegger/nvim-dap: Debug Adapter Protocol client implementation for Neovim"
tags:
  - nvim
  - text_editors
  - tools_to_use
date: 2024-01-09 23:28:42
words_count: 603
state: INBOX
---

# mfussenegger/nvim-dap: Debug Adapter Protocol client implementation for Neovim by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Debug Adapter Protocol client implementation for Neovim - mfussenegger/nvim-dap: Debug Adapter Protocol client implementation for Neovim


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## DAP (Debug Adapter Protocol)

`nvim-dap` is a Debug Adapter Protocol client implementation for [Neovim](https://neovim.io/).`nvim-dap` allows you to:

* Launch an application to debug
* Attach to running applications and debug them
* Set breakpoints and step through code
* Inspect the state of the application

[![demo](https://proxy-prod.omnivore-image-cache.app/0x0,sAYAVXunbql1O7UP3do4Jdo9XH3eoDjrmgB3ILXu6jPI/https://user-images.githubusercontent.com/38700/124292938-669a7100-db56-11eb-93b8-77b66994fc8a.gif)](https://user-images.githubusercontent.com/38700/124292938-669a7100-db56-11eb-93b8-77b66994fc8a.gif) 

## Installation

[![LuaRocks](https://proxy-prod.omnivore-image-cache.app/0x0,shRHzK0ULAtWmSIFs_yDjxLt7vKttajIOslaJdAWV79c/https://camo.githubusercontent.com/32b7daa5b31038f0217442033a5603d6d04404876c1ca231afff75f893d09e9a/68747470733a2f2f696d672e736869656c64732e696f2f6c7561726f636b732f762f6d66757373656e65676765722f6e76696d2d6461703f6c6f676f3d6c756126636f6c6f723d707572706c65)](https://luarocks.org/modules/mfussenegger/nvim-dap)

* Install nvim-dap like any other Neovim plugin:  
   * `git clone https://github.com/mfussenegger/nvim-dap.git ~/.config/nvim/pack/plugins/start/nvim-dap`  
   * Or with [vim-plug](https://github.com/junegunn/vim-plug): `Plug 'mfussenegger/nvim-dap'`  
   * Or with [packer.nvim](https://github.com/wbthomason/packer.nvim): `use 'mfussenegger/nvim-dap'`
* Generate the documentation for nvim-dap using `:helptags ALL` or`:helptags <PATH-TO-PLUGIN/doc/>`

Supported Neovim versions:

* Latest nightly
* 0.9.x (Recommended)
* 0.8.3

You'll need to install and configure a debug adapter per language. See

* [:help dap.txt](https://github.com/mfussenegger/nvim-dap/blob/master/doc/dap.txt)
* the [Debug-Adapter Installation](https://github.com/mfussenegger/nvim-dap/wiki/Debug-Adapter-installation) wiki
* `:help dap-adapter`
* `:help dap-configuration`

## Usage

A typical debug flow consists of:

* Setting breakpoints via `:lua require'dap'.toggle_breakpoint()`.
* Launching debug sessions and resuming execution via `:lua require'dap'.continue()`.
* Stepping through code via `:lua require'dap'.step_over()` and `:lua require'dap'.step_into()`.
* Inspecting the state via the built-in REPL: `:lua require'dap'.repl.open()`or using the widget UI (`:help dap-widgets`)

See [:help dap.txt](https://github.com/mfussenegger/nvim-dap/blob/master/doc/dap.txt), `:help dap-mapping` and `:help dap-api`.

## Supported languages

In theory all of the languages for which a debug adapter exists should be supported.

* [Available debug adapters](https://microsoft.github.io/debug-adapter-protocol/implementors/adapters/)
* [nvim-dap Debug-Adapter Installation & Configuration](https://github.com/mfussenegger/nvim-dap/wiki/Debug-Adapter-installation)

The Wiki is community maintained. If you got an adapter working that isn't listed yet, please extend the Wiki.

Some debug adapters have [language specific extensions](https://github.com/mfussenegger/nvim-dap/wiki/Extensions#language-specific-extensions). Using them over a manual configuration is recommended, as they're usually better maintained.

If the instructions in the wiki for a debug adapter are not working, consider that debug adapters may have made changes since the instructions were written. You may want to read the release notes of the debug adapters or try with an older version. Please update the wiki if you discover outdated examples.

## Goals

* Have a basic debugger in Neovim.
* Extensibility and double as a DAP client library. This allows other plugins to extend the debugging experience. Either by improving the UI or by making it easier to debug parts of an application.  
   * Examples of UI/UX extensions are [nvim-dap-virtual-text](https://github.com/theHamsta/nvim-dap-virtual-text) and [nvim-dap-ui](https://github.com/rcarriga/nvim-dap-ui)  
   * Examples for language specific extensions include [nvim-jdtls](https://github.com/mfussenegger/nvim-jdtls) and [nvim-dap-python](https://github.com/mfussenegger/nvim-dap-python)

## Extensions

All known extensions are listed in the [Wiki](https://github.com/mfussenegger/nvim-dap/wiki/Extensions). The wiki is community maintained. Please add new extensions if you built one or if you discovered one that's not listed.

## Non-Goals

* Debug adapter installations are out of scope. It's not the business of an editor plugin to re-invent a package manager. Use your system package manager. Use Nix. Use Ansible.
* [nvim-dapconfig](https://github.com/nvim-lua/wishlist/issues/37#issuecomment-1023363686)
* Vim support. It's not going to happen. Use [vimspector](https://github.com/puremourning/vimspector) instead.

## Alternatives

* [vimspector](https://github.com/puremourning/vimspector)

## Contributing

Contributions are welcome:

* Give concrete feedback about usability.
* Triage issues. Many of the problems people encounter are debug adapter specific.
* Improve upstream debug adapter documentation to make them more editor agnostic.
* Improve the Wiki. But please refrain from turning it into comprehensive debug adapter documentation that should go upstream.
* Write extensions.

Before making direct code contributions, please create a discussion or issue to clarify whether the change is in scope of the nvim-dap core.

Please keep pull requests focused and don't change multiple things at the same time.

## Features

* launch debug adapter
* attach to debug adapter
* toggle breakpoints
* breakpoints with conditions
* logpoints
* set exception breakpoints
* step over, step into, step out
* step back, reverse continue
* Goto
* restart
* stop
* pause
* evaluate expressions
* REPL (incl. commands to show threads, frames and scopes)



# links
[Read on Omnivore](https://omnivore.app/me/mfussenegger-nvim-dap-debug-adapter-protocol-client-implementati-18cf020ad70)
[Read Original](https://github.com/mfussenegger/nvim-dap)

<iframe src="https://github.com/mfussenegger/nvim-dap"  width="800" height="500"></iframe>
