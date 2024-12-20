---
id: ffb22adf-29ae-4828-b107-025895102514
title: "liuchengxu/vista.vim: :cactus: Viewer & Finder for LSP symbols and tags"
tags:
  - tools_to_use
  - nvim
  - text_editors
date: 2024-04-05 20:22:50
words_count: 1208
state: READING
---

# liuchengxu/vista.vim: :cactus: Viewer & Finder for LSP symbols and tags by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> :cactus: Viewer & Finder for LSP symbols and tags. Contribute to liuchengxu/vista.vim development by creating an account on GitHub.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## Vista.vim

[](#vistavim)

[![CI](https://proxy-prod.omnivore-image-cache.app/0x0,sJZKAJ2n6A-XUquNpu07b6WS50Yrl7TIksfpmhctDcBE/https://github.com/liuchengxu/vista.vim/workflows/ci/badge.svg)](https://github.com/liuchengxu/vista.vim/actions?workflow=ci)

View and search LSP symbols, tags in Vim/NeoVim.

[![](https://proxy-prod.omnivore-image-cache.app/0x0,sgeaZMi9CQay01zeMlvY1UJkBR6U54PqphWLVLInRsqg/https://user-images.githubusercontent.com/8850248/56469894-14d40780-6472-11e9-802f-729ac53bd4d5.gif)](https://user-images.githubusercontent.com/8850248/56469894-14d40780-6472-11e9-802f-729ac53bd4d5.gif) 

Vista ctags

[\>>>> More screenshots](https://github.com/liuchengxu/vista.vim/issues/257)

**caveat: There is a major flaw about the tree view renderer of ctags at the moment, see [#320](https://github.com/liuchengxu/vista.vim/issues/320) for more details.**

## Table Of Contents

[](#table-of-contents)

* [Introduction](#introduction)
* [Features](#features)
* [Requirement](#requirement)
* [Installation](#installation)  
   * [Plugin Manager](#plugin-manager)  
   * [Package management](#package-management)  
         * [Vim 8](#vim-8)  
         * [NeoVim](#neovim)
* [Usage](#usage)  
   * [Show the nearest method/function in the statusline](#show-the-nearest-methodfunction-in-the-statusline)  
         * [lightline.vim](#lightlinevim)  
   * [Commands](#commands)  
   * [Options](#options)  
   * [Other tips](#other-tips)  
         * [Compile ctags with JSON format support](#compile-ctags-with-json-format-support)
* [Contributing](#contributing)
* [License](#license)

## Introduction

[](#introduction)

I initially started [vista.vim](https://github.com/liuchengxu/vista.vim) with an intention of replacing [tagbar](https://github.com/majutsushi/tagbar) as it seemingly doesn't have a plan to support the promising [Language Server Protocol](https://github.com/Microsoft/language-server-protocol) and async processing.

In addition to being a tags viewer, vista.vim can also be a symbol navigator similar to [ctrlp-funky](https://github.com/tacahiroy/ctrlp-funky). Last but not least, one important goal of [vista.vim](https://github.com/liuchengxu/vista.vim) is to support LSP symbols, which understands the semantics instead of the regex only.

## Features

[](#features)

* View tags and LSP symbols in a sidebar.  
   * [universal-ctags](https://github.com/universal-ctags/ctags)  
   * [ale](https://github.com/w0rp/ale)  
   * [vim-lsp](https://github.com/prabirshrestha/vim-lsp)  
   * [coc.nvim](https://github.com/neoclide/coc.nvim)  
   * [LanguageClient-neovim](https://github.com/autozimu/LanguageClient-neovim)  
   * [vim-lsc](https://github.com/natebosch/vim-lsc)  
   * [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)
* Finder for tags and LSP symbols.  
   * [fzf](https://github.com/junegunn/fzf)  
   * [skim](https://github.com/lotabout/skim)  
   * [vim-clap](https://github.com/liuchengxu/vim-clap)
* Nested display for ctags, list display for LSP symbols.
* Highlight the nearby tag in the vista sidebar.
* Builtin support for displaying markdown's TOC.
* Update automatically when switching between buffers.
* Jump to the tag/symbol from vista sidebar with a blink.
* Update asynchonously in the background when `+job` avaliable.
* Find the nearest method or function to the cursor, which could be integrated into the statusline.
* Display decent detailed symbol info in cmdline, also supports previewing the tag via neovim's floating window.

Notes:

* Exuberant Ctags is unsupported, ensure you are using [universal-ctags](https://github.com/universal-ctags/ctags).
* The feature of finder in vista.vim `:Vista finder [EXECUTIVE]` is a bit like `:BTags` or `:Tags` in [fzf.vim](https://github.com/junegunn/fzf.vim), `:CocList` in [coc.nvim](https://github.com/neoclide/coc.nvim), `:LeaderfBufTag` in [leaderf.vim](https://github.com/Yggdroot/LeaderF), etc. You can choose whatever you like.
* ~~Due to limitations of the Language Server Protocol, a tree view of nested tags is currently only available for the ctags executive. Other executives will have symbols grouped by modules, classes, functions and variables~~. The tree view support for LSP executives are limited at present, and only `:Vista coc` provider is supported.

## Requirement

[](#requirement)

I don't know the mimimal supported version. But if you only care about the ctags related feature, vim 7.4.1154+ should be enough. If you want to ctags to run asynchonously, Vim 8.0.27+ should be enough.

Otherwise, if you want to try any LSP related features, then you certainly need some plugins to retrive the LSP symbols, e.g., [coc.nvim](https://github.com/neoclide/coc.nvim). When you have these LSP plugins set up, vista.vim should be ok to go as well.

In addition, if you want to search the symbols via [fzf](https://github.com/junegunn/fzf), you will have to install it first. Note that fzf 0.22.0 or above is required.

## Installation

[](#installation)

### Plugin Manager

[](#plugin-manager)

* [vim-plug](https://github.com/junegunn/vim-plug)  
Plug 'liuchengxu/vista.vim'

For other plugin managers please follow their instructions accordingly.

### Package management

[](#package-management)

#### Vim 8

[](#vim-8)

$ mkdir -p ~/.vim/pack/git-plugins/start
$ git clone https://github.com/liuchengxu/vista.vim.git --depth=1 ~/.vim/pack/git-plugins/start/vista.vim

#### NeoVim

[](#neovim)

$ mkdir -p ~/.local/share/nvim/site/pack/git-plugins/start
$ git clone https://github.com/liuchengxu/vista.vim.git --depth=1 ~/.local/share/nvim/site/pack/git-plugins/start/vista.vim

## Usage

[](#usage)

### Show the nearest method/function in the statusline

[](#show-the-nearest-methodfunction-in-the-statusline)

Note: This is only supported for ctags and coc executive for now.

You can do the following to show the nearest method/function in your statusline:

function! NearestMethodOrFunction() abort
  return get(b:, 'vista_nearest_method_or_function', '')
endfunction

set statusline+=%{NearestMethodOrFunction()}

" By default vista.vim never run if you don't call it explicitly.
"
" If you want to show the nearest function in your statusline automatically,
" you can add the following line to your vimrc
autocmd VimEnter * call vista#RunForNearestMethodOrFunction()

Also refer to [liuchengxu/eleline#18](https://github.com/liuchengxu/eleline.vim/pull/18).

[![](https://proxy-prod.omnivore-image-cache.app/0x0,sFmSXQGQvQlYcpSXBLLDve21whcyoycAgd6fm54ctOXY/https://user-images.githubusercontent.com/8850248/55477900-da363680-564c-11e9-8e71-845260f3d44b.png)](https://user-images.githubusercontent.com/8850248/55477900-da363680-564c-11e9-8e71-845260f3d44b.png) 

let g:lightline = {
      \ 'colorscheme': 'wombat',
      \ 'active': {
      \   'left': [ [ 'mode', 'paste' ],
      \             [ 'readonly', 'filename', 'modified', 'method' ] ]
      \ },
      \ 'component_function': {
      \   'method': 'NearestMethodOrFunction'
      \ },
      \ }

### Commands

[](#commands)

| Command | Description                                             |
| ------- | ------------------------------------------------------- |
| Vista   | Open/Close vista window for viewing tags or LSP symbols |
| Vista!  | Close vista view window if already opened               |
| Vista!! | Toggle vista view window                                |

`:Vista [EXECUTIVE]`: open vista window powered by EXECUTIVE.

`:Vista finder [EXECUTIVE]`: search tags/symbols generated from EXECUTIVE.

See `:help vista-commands` for more information.

### Options

[](#options)

" How each level is indented and what to prepend.
" This could make the display more compact or more spacious.
" e.g., more compact: ["▸ ", ""]
" Note: this option only works for the kind renderer, not the tree renderer.
let g:vista_icon_indent = ["╰─▸ ", "├─▸ "]

" Executive used when opening vista sidebar without specifying it.
" See all the avaliable executives via `:echo g:vista#executives`.
let g:vista_default_executive = 'ctags'

" Set the executive for some filetypes explicitly. Use the explicit executive
" instead of the default one for these filetypes when using `:Vista` without
" specifying the executive.
let g:vista_executive_for = {
  \ 'cpp': 'vim_lsp',
  \ 'php': 'vim_lsp',
  \ }

" Declare the command including the executable and options used to generate ctags output
" for some certain filetypes.The file path will be appened to your custom command.
" For example:
let g:vista_ctags_cmd = {
      \ 'haskell': 'hasktags -x -o - -c',
      \ }

" To enable fzf's preview window set g:vista_fzf_preview.
" The elements of g:vista_fzf_preview will be passed as arguments to fzf#vim#with_preview()
" For example:
let g:vista_fzf_preview = ['right:50%']

" Ensure you have installed some decent font to show these pretty symbols, then you can enable icon for the kind.
let g:vista#renderer#enable_icon = 1

" The default icons can't be suitable for all the filetypes, you can extend it as you wish.
let g:vista#renderer#icons = {
\   "function": "\uf794",
\   "variable": "\uf71b",
\  }

[![](https://proxy-prod.omnivore-image-cache.app/0x0,s6gEsUGkDzeo9GNTspe29vRv3-hf7eGWgTcVO0uIV22k/https://user-images.githubusercontent.com/8850248/55805524-2b449f80-5b11-11e9-85d4-018c305a5ecb.png)](https://user-images.githubusercontent.com/8850248/55805524-2b449f80-5b11-11e9-85d4-018c305a5ecb.png) 

See `:help vista-options` for more information.

### Other tips

[](#other-tips)

The ctags provided by the OS distribution may present issues, such as the ones described in #467\. It is strongly recommended to use the newer version of ctags. The nightly build of ctags can be obtained from <https://github.com/universal-ctags/ctags-nightly-build/releases>. Alternatively, you can compile it yourself if you prefer.

#### Compile ctags with JSON format support

[](#compile-ctags-with-json-format-support)

First of all, check if your [universal-ctags](https://github.com/universal-ctags/ctags) supports JSON format via `ctags --list-features`. If not, I recommend you to install ctags with JSON format support that would make vista's parser easier and more reliable. And we are able to reduce some overhead in JSON mode by [disabling the fixed fields](https://github.com/universal-ctags/ctags/pull/2080).

The JSON support for ctags is avaliable if u-ctags is linked to libjansson when compiling.

* macOS, [included by default since February 23 2021](https://github.com/universal-ctags/homebrew-universal-ctags/commit/82db2cf9cb0cdecf62ca9405e767ec025b5ba8ed)  
$ brew tap universal-ctags/universal-ctags  
$ brew install --HEAD universal-ctags/universal-ctags/universal-ctags
* Ubuntu  
# install libjansson first  
$ sudo apt-get install libjansson-dev  
# then compile and install universal-ctags.  
#  
# NOTE: Don't use `sudo apt install ctags`, which will install exuberant-ctags and it's not guaranteed to work with vista.vim.  
#  
$ git clone https://github.com/universal-ctags/ctags.git --depth=1  
$ cd ctags  
$ ./autogen.sh  
$ ./configure  
$ make  
$ sudo make install
* Fedora  
$ sudo dnf install jansson-devel autoconf automake  
$ git clone https://github.com/universal-ctags/ctags.git --depth=1  
$ cd ctags  
$ ./autogen.sh  
$ ./configure  
$ make  
$ sudo make install

Refer to [Compiling and Installing Jansson](https://jansson.readthedocs.io/en/latest/gettingstarted.html#compiling-and-installing-jansson) as well.

## Contributing

[](#contributing)

Vista.vim is still in beta, please [file an issue](https://github.com/liuchengxu/vista.vim/issues/new) if you run into any trouble or have any sugguestions.

## License

[](#license)

MIT

Copyright (c) 2019 Liu-Cheng Xu



# links
[Read on Omnivore](https://omnivore.app/me/liuchengxu-vista-vim-cactus-viewer-finder-for-lsp-symbols-and-ta-18eaf48d55b)
[Read Original](https://github.com/liuchengxu/vista.vim)

<iframe src="https://github.com/liuchengxu/vista.vim"  width="800" height="500"></iframe>
