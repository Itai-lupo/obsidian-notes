---
id: ad2bdbf0-6d16-11ee-a4b2-6fa60b4e00d1
title: "nvim-treesitter/nvim-treesitter: Nvim Treesitter configurations and abstraction layer"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:57:45
words_count: 3855
state: INBOX
---

# nvim-treesitter/nvim-treesitter: Nvim Treesitter configurations and abstraction layer by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Nvim Treesitter configurations and abstraction layer - nvim-treesitter/nvim-treesitter: Nvim Treesitter configurations and abstraction layer


# content

The goal of `nvim-treesitter` is both to provide a simple and easy way to use the interface for [tree-sitter](https://github.com/tree-sitter/tree-sitter) in Neovim and to provide some basic functionality such as highlighting based on it:

[![example-cpp](https://proxy-prod.omnivore-image-cache.app/0x0,sjEDrFFGsUGHGMT3fTQeYHEFwOntvEh9U0PvD3Rd9poQ/https://user-images.githubusercontent.com/2361214/202753610-e923bf4e-e88f-494b-bb1e-d22a7688446f.png)](https://user-images.githubusercontent.com/2361214/202753610-e923bf4e-e88f-494b-bb1e-d22a7688446f.png)

Traditional highlighting (left) vs Treesitter-based highlighting (right). More examples can be found in [our gallery](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Gallery).

**Warning: Treesitter and nvim-treesitter highlighting are an experimental feature of Neovim. Please consider the experience with this plug-in as experimental until Tree-Sitter support in Neovim is stable! We recommend using the nightly builds of Neovim if possible. You can find the current roadmap [here](https://github.com/nvim-treesitter/nvim-treesitter/projects/1). The roadmap and all features of this plugin are open to change, and any suggestion will be highly appreciated!**

Nvim-treesitter is based on three interlocking features: [**language parsers**](#language-parsers), [**queries**](#adding-queries), and [**modules**](#available-modules), where _modules_ provide features – e.g., highlighting – based on _queries_ for syntax objects extracted from a given buffer by _language parsers_. Users will generally only need to interact with parsers and modules as explained in the next section. For more detailed information on setting these up, see ["Advanced setup"](#advanced-setup).

---

### [Table of contents](#table-of-contents)

* [Quickstart](#quickstart)
* [Supported languages](#supported-languages)
* [Available modules](#available-modules)
* [Advanced setup](#advanced-setup)
* [Extra features](#extra-features)
* [Troubleshooting](#troubleshooting)

---

## [Quickstart](#quickstart)

## [Requirements](#requirements)

* **Neovim 0.9.1** or later ([nightly](https://github.com/neovim/neovim#install-from-source) recommended)
* `tar` and `curl` in your path (or alternatively `git`)
* A C compiler in your path and libstdc++ installed ([Windows users please read this!](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Windows-support)).

## [Installation](#installation)

You can install `nvim-treesitter` with your favorite package manager (or using the native `package` feature of vim, see `:h packages`).

**NOTE: This plugin is only guaranteed to work with specific versions of language parsers** (as specified in the `lockfile.json`). **When upgrading the plugin, you must make sure that all installed parsers are updated to the latest version** via `:TSUpdate`. It is strongly recommended to automate this; e.g., if you are using [vim-plug](https://github.com/junegunn/vim-plug), put this in your `init.vim` file:

Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}

For other plugin managers such as `packer.nvim`, see this [Installation page from the wiki](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Installation) (Note that this page is community maintained).

## [Language parsers](#language-parsers)

Treesitter uses a different _parser_ for every language, which needs to be generated via `tree-sitter-cli` from a `grammar.js` file, then compiled to a `.so` library that needs to be placed in neovim's `runtimepath` (typically under `parser/{language}.so`). To simplify this, `nvim-treesitter` provides commands to automate this process. If the language is already [supported by nvim-treesitter](#supported-languages), you can install it with

:TSInstall \<language_to_install\>

This command supports tab expansion. You can also get a list of all available languages and their installation status with `:TSInstallInfo`. Parsers not on this list can be added manually by following the steps described under ["Adding parsers"](#adding-parsers) below.

To make sure a parser is at the latest compatible version (as specified in `nvim-treesitter`'s `lockfile.json`), use `:TSUpdate {language}`. To update all parsers unconditionally, use `:TSUpdate all` or just `:TSUpdate`.

## [Modules](#modules)

Each module provides a distinct tree-sitter-based feature such as [highlighting](#highlight), [indentation](#indentation), or [folding](#folding); see [:h nvim-treesitter-modules](https://github.com/nvim-treesitter/nvim-treesitter/blob/master/doc/nvim-treesitter.txt) or ["Available modules"](#available-modules) below for a list of modules and their options.

Following examples assume that you are configuring neovim with lua. If you are using vimscript, see `:h lua-heredoc`. All modules are disabled by default and need to be activated explicitly in your `init.lua`, e.g., via

require'nvim-treesitter.configs'.setup {
  -- A list of parser names, or "all" (the five listed parsers should always be installed)
  ensure_installed = { "c", "lua", "vim", "vimdoc", "query" },

  -- Install parsers synchronously (only applied to `ensure_installed`)
  sync_install = false,

  -- Automatically install missing parsers when entering buffer
  -- Recommendation: set to false if you don't have `tree-sitter` CLI installed locally
  auto_install = true,

  -- List of parsers to ignore installing (or "all")
  ignore_install = { "javascript" },

  ---- If you need to change the installation directory of the parsers (see -\> Advanced Setup)
  -- parser_install_dir = "/some/path/to/store/parsers", -- Remember to run vim.opt.runtimepath:append("/some/path/to/store/parsers")!

  highlight = {
    enable = true,

    -- NOTE: these are the names of the parsers and not the filetype. (for example if you want to
    -- disable highlighting for the `tex` filetype, you need to include `latex` in this list as this is
    -- the name of the parser)
    -- list of language that will be disabled
    disable = { "c", "rust" },
    -- Or use a function for more flexibility, e.g. to disable slow treesitter highlight for large files
    disable = function(lang, buf)
        local max_filesize = 100 * 1024 -- 100 KB
        local ok, stats = pcall(vim.loop.fs_stat, vim.api.nvim_buf_get_name(buf))
        if ok and stats and stats.size \> max_filesize then
            return true
        end
    end,

    -- Setting this to true will run `:h syntax` and tree-sitter at the same time.
    -- Set this to `true` if you depend on 'syntax' being enabled (like for indentation).
    -- Using this option may slow down your editor, and you may see some duplicate highlights.
    -- Instead of true it can also be a list of languages
    additional_vim_regex_highlighting = false,
  },
}

Each module can also be enabled or disabled interactively through the following commands:

:TSBufEnable {module} " enable module on current buffer
:TSBufDisable {module} " disable module on current buffer
:TSEnable {module} [{ft}] " enable module on every buffer. If filetype is specified, enable only for this filetype.
:TSDisable {module} [{ft}] " disable module on every buffer. If filetype is specified, disable only for this filetype.
:TSModuleInfo [{module}] " list information about modules state for each filetype

Check [:h nvim-treesitter-commands](https://github.com/nvim-treesitter/nvim-treesitter/blob/master/doc/nvim-treesitter.txt) for a list of all available commands. It may be necessary to reload the buffer (e.g., via `:e`) after enabling a module interactively.

## [Supported languages](#supported-languages)

For `nvim-treesitter` to support a specific feature for a specific language requires both a parser for that language and an appropriate language-specific query file for that feature.

The following is a list of languages for which a parser can be installed through `:TSInstall`; a checked box means that `nvim-treesitter` also contains queries at least for the `highlight` module.

Experimental parsers are parsers that have a maintainer but are not stable enough for daily use yet.

We are looking for maintainers to add more parsers and to write query files for their languages. Check our [tracking issue](https://github.com/nvim-treesitter/nvim-treesitter/issues/2282) for open language requests.

* [ada](https://github.com/briot/tree-sitter-ada) (maintained by @briot)
* [agda](https://github.com/tree-sitter/tree-sitter-agda) (maintained by @Decodetalkers)
* [apex](https://github.com/aheber/tree-sitter-sfapex) (maintained by @aheber)
* [arduino](https://github.com/ObserverOfTime/tree-sitter-arduino) (maintained by @ObserverOfTime)
* [astro](https://github.com/virchau13/tree-sitter-astro) (maintained by @virchau13)
* [authzed](https://github.com/mleonidas/tree-sitter-authzed) (maintained by @mattpolzin)
* [awk](https://github.com/Beaglefoot/tree-sitter-awk)
* [bash](https://github.com/tree-sitter/tree-sitter-bash) (maintained by @TravonteD)
* [bass](https://github.com/amaanq/tree-sitter-bass) (maintained by @amaanq)
* [beancount](https://github.com/polarmutex/tree-sitter-beancount) (maintained by @polarmutex)
* [bibtex](https://github.com/latex-lsp/tree-sitter-bibtex) (maintained by @theHamsta, @clason)
* [bicep](https://github.com/amaanq/tree-sitter-bicep) (maintained by @amaanq)
* [bitbake](https://github.com/amaanq/tree-sitter-bitbake) (maintained by @amaanq)
* [blueprint](https://gitlab.com/gabmus/tree-sitter-blueprint.git) (experimental, maintained by @gabmus)
* [c](https://github.com/tree-sitter/tree-sitter-c) (maintained by @amaanq)
* [c\_sharp](https://github.com/tree-sitter/tree-sitter-c-sharp) (maintained by @Luxed)
* [cairo](https://github.com/amaanq/tree-sitter-cairo) (maintained by @amaanq)
* [capnp](https://github.com/amaanq/tree-sitter-capnp) (maintained by @amaanq)
* [chatito](https://github.com/ObserverOfTime/tree-sitter-chatito) (maintained by @ObserverOfTime)
* [clojure](https://github.com/sogaiu/tree-sitter-clojure) (maintained by @NoahTheDuke)
* [cmake](https://github.com/uyha/tree-sitter-cmake) (maintained by @uyha)
* [comment](https://github.com/stsewd/tree-sitter-comment) (maintained by @stsewd)
* [commonlisp](https://github.com/theHamsta/tree-sitter-commonlisp) (maintained by @theHamsta)
* [cooklang](https://github.com/addcninblue/tree-sitter-cooklang) (maintained by @addcninblue)
* [corn](https://github.com/jakestanger/tree-sitter-corn) (maintained by @jakestanger)
* [cpon](https://github.com/amaanq/tree-sitter-cpon) (maintained by @amaanq)
* [cpp](https://github.com/tree-sitter/tree-sitter-cpp) (maintained by @theHamsta)
* [css](https://github.com/tree-sitter/tree-sitter-css) (maintained by @TravonteD)
* [csv](https://github.com/amaanq/tree-sitter-csv) (maintained by @amaanq)
* [cuda](https://github.com/theHamsta/tree-sitter-cuda) (maintained by @theHamsta)
* [cue](https://github.com/eonpatapon/tree-sitter-cue) (maintained by @amaanq)
* [d](https://github.com/CyberShadow/tree-sitter-d) (experimental, maintained by @nawordar)
* [dart](https://github.com/UserNobody14/tree-sitter-dart) (maintained by @akinsho)
* [devicetree](https://github.com/joelspadin/tree-sitter-devicetree) (maintained by @jedrzejboczar)
* [dhall](https://github.com/jbellerb/tree-sitter-dhall) (maintained by @amaanq)
* [diff](https://github.com/the-mikedavis/tree-sitter-diff) (maintained by @gbprod)
* [dockerfile](https://github.com/camdencheek/tree-sitter-dockerfile) (maintained by @camdencheek)
* [dot](https://github.com/rydesun/tree-sitter-dot) (maintained by @rydesun)
* [doxygen](https://github.com/amaanq/tree-sitter-doxygen) (maintained by @amaanq)
* [dtd](https://github.com/ObserverOfTime/tree-sitter-xml) (maintained by @ObserverOfTime)
* [ebnf](https://github.com/RubixDev/ebnf) (experimental, maintained by @RubixDev)
* [eds](https://github.com/uyha/tree-sitter-eds) (maintained by @uyha)
* [eex](https://github.com/connorlay/tree-sitter-eex) (maintained by @connorlay)
* [elixir](https://github.com/elixir-lang/tree-sitter-elixir) (maintained by @connorlay)
* [elm](https://github.com/elm-tooling/tree-sitter-elm) (maintained by @zweimach)
* [elsa](https://github.com/glapa-grossklag/tree-sitter-elsa) (maintained by @glapa-grossklag, @amaanq)
* [elvish](https://github.com/elves/tree-sitter-elvish) (maintained by @elves)
* [embedded\_template](https://github.com/tree-sitter/tree-sitter-embedded-template)
* [erlang](https://github.com/WhatsApp/tree-sitter-erlang) (maintained by @filmor)
* [fennel](https://github.com/travonted/tree-sitter-fennel) (maintained by @TravonteD)
* [firrtl](https://github.com/amaanq/tree-sitter-firrtl) (maintained by @amaanq)
* [fish](https://github.com/ram02z/tree-sitter-fish) (maintained by @ram02z)
* [foam](https://github.com/FoamScience/tree-sitter-foam) (experimental, maintained by @FoamScience)
* [forth](https://github.com/AlexanderBrevig/tree-sitter-forth) (maintained by @amaanq)
* [fortran](https://github.com/stadelmanma/tree-sitter-fortran) (maintained by @amaanq)
* [fsh](https://github.com/mgramigna/tree-sitter-fsh) (maintained by @mgramigna)
* [func](https://github.com/amaanq/tree-sitter-func) (maintained by @amaanq)
* [fusion](https://gitlab.com/jirgn/tree-sitter-fusion.git) (maintained by @jirgn)
* [Godot (gdscript)](https://github.com/PrestonKnopp/tree-sitter-gdscript) (maintained by @PrestonKnopp)
* [git\_config](https://github.com/the-mikedavis/tree-sitter-git-config) (maintained by @amaanq)
* [git\_rebase](https://github.com/the-mikedavis/tree-sitter-git-rebase) (maintained by @gbprod)
* [gitattributes](https://github.com/ObserverOfTime/tree-sitter-gitattributes) (maintained by @ObserverOfTime)
* [gitcommit](https://github.com/gbprod/tree-sitter-gitcommit) (maintained by @gbprod)
* [gitignore](https://github.com/shunsambongi/tree-sitter-gitignore) (maintained by @theHamsta)
* [gleam](https://github.com/gleam-lang/tree-sitter-gleam) (maintained by @amaanq)
* [Glimmer and Ember](https://github.com/alexlafroscia/tree-sitter-glimmer) (maintained by @NullVoxPopuli)
* [glsl](https://github.com/theHamsta/tree-sitter-glsl) (maintained by @theHamsta)
* [go](https://github.com/tree-sitter/tree-sitter-go) (maintained by @theHamsta, @WinWisely268)
* [Godot Resources (gdresource)](https://github.com/PrestonKnopp/tree-sitter-godot-resource) (maintained by @pierpo)
* [gomod](https://github.com/camdencheek/tree-sitter-go-mod) (maintained by @camdencheek)
* [gosum](https://github.com/amaanq/tree-sitter-go-sum) (maintained by @amaanq)
* [gowork](https://github.com/omertuc/tree-sitter-go-work) (maintained by @omertuc)
* [gpg](https://github.com/ObserverOfTime/tree-sitter-gpg-config) (maintained by @ObserverOfTime)
* [graphql](https://github.com/bkegley/tree-sitter-graphql) (maintained by @bkegley)
* [groovy](https://github.com/Decodetalkers/tree-sitter-groovy) (maintained by @Decodetalkers)
* [gstlaunch](https://github.com/theHamsta/tree-sitter-gstlaunch) (maintained by @theHamsta)
* [hack](https://github.com/slackhq/tree-sitter-hack)
* [hare](https://github.com/amaanq/tree-sitter-hare) (maintained by @amaanq)
* [haskell](https://github.com/tree-sitter/tree-sitter-haskell) (maintained by @mrcjkb)
* [haskell\_persistent](https://github.com/MercuryTechnologies/tree-sitter-haskell-persistent) (maintained by @lykahb)
* [hcl](https://github.com/MichaHoffmann/tree-sitter-hcl) (maintained by @MichaHoffmann)
* [heex](https://github.com/connorlay/tree-sitter-heex) (maintained by @connorlay)
* [hjson](https://github.com/winston0410/tree-sitter-hjson) (maintained by @winston0410)
* [hlsl](https://github.com/theHamsta/tree-sitter-hlsl) (maintained by @theHamsta)
* [hocon](https://github.com/antosha417/tree-sitter-hocon) (maintained by @antosha417)
* [hoon](https://github.com/urbit-pilled/tree-sitter-hoon) (experimental, maintained by @urbit-pilled)
* [html](https://github.com/tree-sitter/tree-sitter-html) (maintained by @TravonteD)
* [htmldjango](https://github.com/interdependence/tree-sitter-htmldjango) (experimental, maintained by @ObserverOfTime)
* [http](https://github.com/rest-nvim/tree-sitter-http) (maintained by @amaanq)
* [hurl](https://github.com/pfeiferj/tree-sitter-hurl) (maintained by @pfeiferj)
* [ini](https://github.com/justinmk/tree-sitter-ini) (experimental, maintained by @theHamsta)
* [ispc](https://github.com/fab4100/tree-sitter-ispc) (maintained by @fab4100)
* [janet\_simple](https://github.com/sogaiu/tree-sitter-janet-simple) (maintained by @sogaiu)
* [java](https://github.com/tree-sitter/tree-sitter-java) (maintained by @p00f)
* [javascript](https://github.com/tree-sitter/tree-sitter-javascript) (maintained by @steelsojka)
* [jq](https://github.com/flurie/tree-sitter-jq) (maintained by @ObserverOfTime)
* [jsdoc](https://github.com/tree-sitter/tree-sitter-jsdoc) (maintained by @steelsojka)
* [json](https://github.com/tree-sitter/tree-sitter-json) (maintained by @steelsojka)
* [json5](https://github.com/Joakker/tree-sitter-json5) (maintained by @Joakker)
* [JSON with comments](https://gitlab.com/WhyNotHugo/tree-sitter-jsonc.git) (maintained by @WhyNotHugo)
* [jsonnet](https://github.com/sourcegraph/tree-sitter-jsonnet) (maintained by @nawordar)
* [julia](https://github.com/tree-sitter/tree-sitter-julia) (maintained by @theHamsta)
* [kconfig](https://github.com/amaanq/tree-sitter-kconfig) (maintained by @amaanq)
* [kdl](https://github.com/amaanq/tree-sitter-kdl) (maintained by @amaanq)
* [kotlin](https://github.com/fwcd/tree-sitter-kotlin) (maintained by @SalBakraa)
* [lalrpop](https://github.com/traxys/tree-sitter-lalrpop) (maintained by @traxys)
* [latex](https://github.com/latex-lsp/tree-sitter-latex) (maintained by @theHamsta, @clason)
* [ledger](https://github.com/cbarrete/tree-sitter-ledger) (maintained by @cbarrete)
* [liquidsoap](https://github.com/savonet/tree-sitter-liquidsoap) (maintained by @toots)
* [llvm](https://github.com/benwilliamgraham/tree-sitter-llvm) (maintained by @benwilliamgraham)
* [lua](https://github.com/MunifTanjim/tree-sitter-lua) (maintained by @muniftanjim)
* [luadoc](https://github.com/amaanq/tree-sitter-luadoc) (maintained by @amaanq)
* [lua patterns](https://github.com/amaanq/tree-sitter-luap) (maintained by @amaanq)
* [luau](https://github.com/amaanq/tree-sitter-luau) (maintained by @amaanq)
* [m68k](https://github.com/grahambates/tree-sitter-m68k) (maintained by @grahambates)
* [make](https://github.com/alemuller/tree-sitter-make) (maintained by @lewis6991)
* [markdown (basic highlighting)](https://github.com/MDeiml/tree-sitter-markdown) (experimental, maintained by @MDeiml)
* [markdown\_inline (needed for full highlighting)](https://github.com/MDeiml/tree-sitter-markdown) (experimental, maintained by @MDeiml)
* [matlab](https://github.com/acristoffers/tree-sitter-matlab) (maintained by @acristoffers)
* [menhir](https://github.com/Kerl13/tree-sitter-menhir) (maintained by @Kerl13)
* [mermaid](https://github.com/monaqa/tree-sitter-mermaid) (experimental)
* [meson](https://github.com/Decodetalkers/tree-sitter-meson) (maintained by @Decodetalkers)
* [mlir](https://github.com/artagnon/tree-sitter-mlir) (experimental, maintained by @artagnon)
* [nasm](https://github.com/naclsn/tree-sitter-nasm) (maintained by @ObserverOfTime)
* [nickel](https://github.com/nickel-lang/tree-sitter-nickel)
* [ninja](https://github.com/alemuller/tree-sitter-ninja) (maintained by @alemuller)
* [nix](https://github.com/cstrahan/tree-sitter-nix) (maintained by @leo60228)
* [norg](https://github.com/nvim-neorg/tree-sitter-norg) (maintained by @JoeyGrajciar, @vhyrro)
* [nqc](https://github.com/amaanq/tree-sitter-nqc) (maintained by @amaanq)
* [objc](https://github.com/amaanq/tree-sitter-objc) (maintained by @amaanq)
* [ocaml](https://github.com/tree-sitter/tree-sitter-ocaml) (maintained by @undu)
* [ocaml\_interface](https://github.com/tree-sitter/tree-sitter-ocaml) (maintained by @undu)
* [ocamllex](https://github.com/atom-ocaml/tree-sitter-ocamllex) (maintained by @undu)
* [odin](https://github.com/amaanq/tree-sitter-odin) (maintained by @amaanq)
* [org](https://github.com/milisims/tree-sitter-org)
* [pascal](https://github.com/Isopod/tree-sitter-pascal.git) (maintained by @Isopod)
* [passwd](https://github.com/ath3/tree-sitter-passwd) (maintained by @amaanq)
* [pem](https://github.com/ObserverOfTime/tree-sitter-pem) (maintained by @ObserverOfTime)
* [perl](https://github.com/ganezdragon/tree-sitter-perl) (maintained by @lcrownover)
* [php](https://github.com/tree-sitter/tree-sitter-php) (maintained by @tk-shirasaka)
* [phpdoc](https://github.com/claytonrcarter/tree-sitter-phpdoc) (experimental, maintained by @mikehaertl)
* [pioasm](https://github.com/leo60228/tree-sitter-pioasm) (maintained by @leo60228)
* [po](https://github.com/erasin/tree-sitter-po) (maintained by @amaanq)
* [Path of Exile item filter](https://github.com/ObserverOfTime/tree-sitter-poe-filter) (experimental, maintained by @ObserverOfTime)
* [pony](https://github.com/amaanq/tree-sitter-pony) (maintained by @amaanq, @mfelsche)
* [prisma](https://github.com/victorhqc/tree-sitter-prisma) (maintained by @elianiva)
* [promql](https://github.com/MichaHoffmann/tree-sitter-promql) (maintained by @MichaHoffmann)
* [proto](https://github.com/treywood/tree-sitter-proto) (maintained by @treywood)
* [prql](https://github.com/PRQL/tree-sitter-prql) (maintained by @matthias-Q)
* [psv](https://github.com/amaanq/tree-sitter-csv) (maintained by @amaanq)
* [pug](https://github.com/zealot128/tree-sitter-pug) (experimental, maintained by @zealot128)
* [puppet](https://github.com/amaanq/tree-sitter-puppet) (maintained by @amaanq)
* [PyPA manifest](https://github.com/ObserverOfTime/tree-sitter-pymanifest) (maintained by @ObserverOfTime)
* [python](https://github.com/tree-sitter/tree-sitter-python) (maintained by @stsewd, @theHamsta)
* [ql](https://github.com/tree-sitter/tree-sitter-ql) (maintained by @pwntester)
* [qmldir](https://github.com/Decodetalkers/tree-sitter-qmldir) (maintained by @amaanq)
* [qmljs](https://github.com/yuja/tree-sitter-qmljs) (maintained by @Decodetalkers)
* [Tree-Sitter query language](https://github.com/nvim-treesitter/tree-sitter-query) (maintained by @steelsojka)
* [r](https://github.com/r-lib/tree-sitter-r) (maintained by @echasnovski)
* [racket](https://github.com/6cdh/tree-sitter-racket)
* [rasi](https://github.com/Fymyte/tree-sitter-rasi) (maintained by @Fymyte)
* [re2c](https://github.com/amaanq/tree-sitter-re2c) (maintained by @amaanq)
* [regex](https://github.com/tree-sitter/tree-sitter-regex) (maintained by @theHamsta)
* [rego](https://github.com/FallenAngel97/tree-sitter-rego) (maintained by @FallenAngel97)
* [pip requirements](https://github.com/ObserverOfTime/tree-sitter-requirements) (maintained by @ObserverOfTime)
* [rnoweb](https://github.com/bamonroe/tree-sitter-rnoweb) (maintained by @bamonroe)
* [robot](https://github.com/Hubro/tree-sitter-robot) (experimental, maintained by @ema2159)
* [ron](https://github.com/amaanq/tree-sitter-ron) (maintained by @amaanq)
* [rst](https://github.com/stsewd/tree-sitter-rst) (maintained by @stsewd)
* [ruby](https://github.com/tree-sitter/tree-sitter-ruby) (maintained by @TravonteD)
* [rust](https://github.com/tree-sitter/tree-sitter-rust) (maintained by @amaanq)
* [scala](https://github.com/tree-sitter/tree-sitter-scala) (maintained by @stevanmilic)
* [scfg](https://git.sr.ht/~rockorager/tree-sitter-scfg) (maintained by @WhyNotHugo)
* [scheme](https://github.com/6cdh/tree-sitter-scheme)
* [scss](https://github.com/serenadeai/tree-sitter-scss) (maintained by @elianiva)
* [slint](https://github.com/jrmoulton/tree-sitter-slint) (experimental, maintained by @jrmoulton)
* [smali](https://git.sr.ht/~yotam/tree-sitter-smali) (maintained by @amaanq)
* [smithy](https://github.com/indoorvivants/tree-sitter-smithy) (maintained by @amaanq, @keynmol)
* [snakemake](https://github.com/osthomas/tree-sitter-snakemake) (experimental)
* [solidity](https://github.com/JoranHonig/tree-sitter-solidity) (maintained by @amaanq)
* [soql](https://github.com/aheber/tree-sitter-sfapex) (maintained by @aheber)
* [sosl](https://github.com/aheber/tree-sitter-sfapex) (maintained by @aheber)
* [sparql](https://github.com/BonaBeavis/tree-sitter-sparql) (maintained by @BonaBeavis)
* [sql](https://github.com/derekstride/tree-sitter-sql) (maintained by @derekstride)
* [squirrel](https://github.com/amaanq/tree-sitter-squirrel) (maintained by @amaanq)
* [ssh\_config](https://github.com/ObserverOfTime/tree-sitter-ssh-config) (maintained by @ObserverOfTime)
* [starlark](https://github.com/amaanq/tree-sitter-starlark) (maintained by @amaanq)
* [strace](https://github.com/sigmaSd/tree-sitter-strace) (maintained by @amaanq)
* [supercollider](https://github.com/madskjeldgaard/tree-sitter-supercollider) (maintained by @madskjeldgaard)
* [surface](https://github.com/connorlay/tree-sitter-surface) (maintained by @connorlay)
* [svelte](https://github.com/Himujjal/tree-sitter-svelte) (maintained by @elianiva)
* [swift](https://github.com/alex-pinkus/tree-sitter-swift) (maintained by @alex-pinkus)
* [sxhkdrc](https://github.com/RaafatTurki/tree-sitter-sxhkdrc) (maintained by @RaafatTurki)
* [systemtap](https://github.com/ok-ryoko/tree-sitter-systemtap) (maintained by @ok-ryoko)
* [t32](https://gitlab.com/xasc/tree-sitter-t32.git) (maintained by @xasc)
* [tablegen](https://github.com/amaanq/tree-sitter-tablegen) (maintained by @amaanq)
* [teal](https://github.com/euclidianAce/tree-sitter-teal) (maintained by @euclidianAce)
* [terraform](https://github.com/MichaHoffmann/tree-sitter-hcl) (maintained by @MichaHoffmann)
* [textproto](https://github.com/PorterAtGoogle/tree-sitter-textproto) (maintained by @Porter)
* [thrift](https://github.com/duskmoon314/tree-sitter-thrift) (maintained by @amaanq, @duskmoon314)
* [tiger](https://github.com/ambroisie/tree-sitter-tiger) (maintained by @ambroisie)
* [tlaplus](https://github.com/tlaplus-community/tree-sitter-tlaplus) (maintained by @ahelwer, @susliko)
* [todotxt](https://github.com/arnarg/tree-sitter-todotxt.git) (experimental, maintained by @arnarg)
* [toml](https://github.com/ikatyang/tree-sitter-toml) (maintained by @tk-shirasaka)
* [tsv](https://github.com/amaanq/tree-sitter-csv) (maintained by @amaanq)
* [tsx](https://github.com/tree-sitter/tree-sitter-typescript) (maintained by @steelsojka)
* [turtle](https://github.com/BonaBeavis/tree-sitter-turtle) (maintained by @BonaBeavis)
* [twig](https://github.com/gbprod/tree-sitter-twig) (maintained by @gbprod)
* [typescript](https://github.com/tree-sitter/tree-sitter-typescript) (maintained by @steelsojka)
* [ungrammar](https://github.com/Philipp-M/tree-sitter-ungrammar) (maintained by @Philipp-M, @amaanq)
* [unison](https://github.com/kylegoetz/tree-sitter-unison) (maintained by @tapegram)
* [usd](https://github.com/ColinKennedy/tree-sitter-usd) (maintained by @ColinKennedy)
* [uxn tal](https://github.com/amaanq/tree-sitter-uxntal) (maintained by @amaanq)
* [v](https://github.com/v-analyzer/v-analyzer) (maintained by @kkharji, @amaanq)
* [vala](https://github.com/vala-lang/tree-sitter-vala) (maintained by @Prince781)
* [verilog](https://github.com/tree-sitter/tree-sitter-verilog) (maintained by @zegervdv)
* [vhs](https://github.com/charmbracelet/tree-sitter-vhs) (maintained by @caarlos0)
* [vim](https://github.com/neovim/tree-sitter-vim) (maintained by @clason)
* [vimdoc](https://github.com/neovim/tree-sitter-vimdoc) (maintained by @clason)
* [vue](https://github.com/ikatyang/tree-sitter-vue) (maintained by @WhyNotHugo)
* [wgsl](https://github.com/szebniok/tree-sitter-wgsl) (maintained by @szebniok)
* [wgsl\_bevy](https://github.com/theHamsta/tree-sitter-wgsl-bevy) (maintained by @theHamsta)
* [wing](https://github.com/winglang/wing) (experimental, maintained by @gshpychka)
* [xml](https://github.com/ObserverOfTime/tree-sitter-xml) (maintained by @ObserverOfTime)
* [yaml](https://github.com/ikatyang/tree-sitter-yaml) (maintained by @stsewd)
* [yang](https://github.com/Hubro/tree-sitter-yang) (maintained by @Hubro)
* [yuck](https://github.com/Philipp-M/tree-sitter-yuck) (maintained by @Philipp-M, @amaanq)
* [zig](https://github.com/maxxnino/tree-sitter-zig) (maintained by @maxxnino)

For related information on the supported languages, including related plugins, see [this wiki page](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Supported-Languages-Information).

## [Available modules](#available-modules)

Modules provide the top-level features of `nvim-treesitter`. The following is a list of modules included in `nvim-treesitter` and their configuration via `init.lua` (where multiple modules can be combined in a single call to `setup`). Note that not all modules work for all languages (depending on the queries available for them). Additional modules can be provided as [external plugins](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Extra-modules-and-plugins).

#### [Highlight](#highlight)

Consistent syntax highlighting.

require'nvim-treesitter.configs'.setup {
  highlight = {
    enable = true,
    -- Setting this to true will run `:h syntax` and tree-sitter at the same time.
    -- Set this to `true` if you depend on 'syntax' being enabled (like for indentation).
    -- Using this option may slow down your editor, and you may see some duplicate highlights.
    -- Instead of true it can also be a list of languages
    additional_vim_regex_highlighting = false,
  },
}

To customize the syntax highlighting of a capture, simply define or link a highlight group of the same name:

-- Highlight the @foo.bar capture group with the "Identifier" highlight group
vim.api.nvim_set_hl(0, "@foo.bar", { link = "Identifier" })

For a language-specific highlight, append the name of the language:

-- Highlight @foo.bar as "Identifier" only in Lua files
vim.api.nvim_set_hl(0, "@foo.bar.lua", { link = "Identifier" })

See `:h treesitter-highlight-groups` for details.

#### [Incremental selection](#incremental-selection)

Incremental selection based on the named nodes from the grammar.

require'nvim-treesitter.configs'.setup {
  incremental_selection = {
    enable = true,
    keymaps = {
      init_selection = "gnn", -- set to `false` to disable one of the mappings
      node_incremental = "grn",
      scope_incremental = "grc",
      node_decremental = "grm",
    },
  },
}

#### [Indentation](#indentation)

Indentation based on treesitter for the `=` operator.**NOTE: This is an experimental feature**.

require'nvim-treesitter.configs'.setup {
  indent = {
    enable = true
  }
}

#### [Folding](#folding)

Tree-sitter based folding. _(Technically not a module because it's per windows and not per buffer.)_

set foldmethod=expr
set foldexpr=nvim_treesitter#foldexpr()
set nofoldenable                     " Disable folding at startup.

This will respect your `foldminlines` and `foldnestmax` settings.

## [Advanced setup](#advanced-setup)

## [Changing the parser install directory](#changing-the-parser-install-directory)

If you want to install the parsers to a custom directory you can specify this directory with `parser_install_dir` option in that is passed to `setup`.`nvim-treesitter` will then install the parser files into this directory.

This directory must be writeable and must be explicitly added to the`runtimepath`. For example:

  vim.opt.runtimepath:append("/some/path/to/store/parsers")

  require'nvim-treesitter.configs'.setup {
    parser_install_dir = "/some/path/to/store/parsers",

    ...

  }

If this option is not included in the setup options, or is explicitly set to`nil` then the default install directories will be used. If this value is set the default directories will be ignored.

Bear in mind that any parser installed into a parser folder on the runtime path will still be considered installed. (For example if "\~/.local/share/nvim/site/parser/c.so" exists then the "c" parser will be considered installed, even though it is not in `parser_install_dir`)

The default paths are:

1. first the package folder. Where `nvim-treesitter` is installed.
2. second the site directory. This is the "site" subdirectory of `stdpath("data")`.

## [Adding parsers](#adding-parsers)

If you have a parser that is not on the list of supported languages (either as a repository on Github or in a local directory), you can add it manually for use by `nvim-treesitter` as follows:

1. Clone the repository or [create a new project](https://tree-sitter.github.io/tree-sitter/creating-parsers#project-setup) in, say, `~/projects/tree-sitter-zimbu`. Make sure that the `tree-sitter-cli` executable is installed and in your path; see \<https://tree-sitter.github.io/tree-sitter/creating-parsers#installation\> for installation instructions.
2. Run `tree-sitter generate` in this directory (followed by `tree-sitter test` for good measure).
3. Add the following snippet to your `init.lua`:

local parser_config = require "nvim-treesitter.parsers".get_parser_configs()
parser_config.zimbu = {
  install_info = {
    url = "~/projects/tree-sitter-zimbu", -- local path or git repo
    files = {"src/parser.c"}, -- note that some parsers also require src/scanner.c or src/scanner.cc
    -- optional entries:
    branch = "main", -- default branch in case of git repo if different from master
    generate_requires_npm = false, -- if stand-alone parser without npm dependencies
    requires_generate_from_grammar = false, -- if folder contains pre-generated src/parser.c
  },
  filetype = "zu", -- if filetype does not match the parser name
}

If you wish to set a specific parser for a filetype, you should use `vim.treesitter.language.register()`:

vim.treesitter.language.register('python', 'someft')  -- the someft filetype will use the python parser and queries.

Note this requires Nvim v0.9.

1. Start `nvim` and `:TSInstall zimbu`.

You can also skip step 2 and use `:TSInstallFromGrammar zimbu` to install directly from a `grammar.js` in the top-level directory specified by `url`. Once the parser is installed, you can update it (from the latest revision of the `main` branch if `url` is a Github repository) with `:TSUpdate zimbu`.

Note that neither `:TSInstall` nor `:TSInstallFromGrammar` copy query files from the grammar repository. If you want your installed grammar to be useful, you must manually [add query files](#adding-queries) to your local nvim-treesitter installation. Note also that module functionality is only triggered if your language's filetype is correctly identified. If Neovim does not detect your language's filetype by default, you can use [Neovim's vim.filetype.add()](https://neovim.io/doc/user/lua.html#vim.filetype.add%28%29) to add a custom detection rule.

If you use a git repository for your parser and want to use a specific version, you can set the `revision` key in the `install_info` table for you parser config.

## [Adding queries](#adding-queries)

Queries are what `nvim-treesitter` uses to extract information from the syntax tree; they are located in the `queries/{language}/*` runtime directories (see `:h rtp`), like the `queries` folder of this plugin, e.g. `queries/{language}/{locals,highlights,textobjects}.scm`. Other modules may require additional queries such as `folding.scm`. You can find a list of all supported capture names in [CONTRIBUTING.md](https://github.com/nvim-treesitter/nvim-treesitter/blob/master/CONTRIBUTING.md#parser-configurations).

All queries found in the runtime directories will be combined. By convention, if you want to write a query, use the `queries/` directory, but if you want to extend a query use the `after/queries/` directory.

If you want to completely override a query, you can use `:h set_query()`. For example, to override the `injections` queries from `c` with your own:

require("vim.treesitter.query").set_query("c", "injections", "(comment) @comment")

Note: when using `set_query`, all queries in the runtime directories will be ignored.

## [Adding modules](#adding-modules)

If you wish you write your own module, you need to support

* tree-sitter language detection support;
* attaching and detaching to buffers;
* all nvim-treesitter commands.

At the top level, you can use the `define_modules` function to define one or more modules or module groups:

require'nvim-treesitter'.define_modules {
  my_cool_plugin = {
    attach = function(bufnr, lang)
      -- Do cool stuff here
    end,
    detach = function(bufnr)
      -- Undo cool stuff here
    end,
    is_supported = function(lang)
      -- Check if the language is supported
    end
  }
}

with the following properties:

* `module_path` specifies a require path (string) that exports a module with an `attach` and `detach` function. This is not required if the functions are on this definition.
* `enable` determines if the module is enabled by default. This is usually overridden by the user.
* `disable` takes a list of languages that this module is disabled for. This is usually overridden by the user.
* `is_supported` takes a function that takes a language and determines if this module supports that language.
* `attach` takes a function that attaches to a buffer. This is required if `module_path` is not provided.
* `detach` takes a function that detaches from a buffer. This is required if `module_path` is not provided.

## [Extra features](#extra-features)

### [Statusline indicator](#statusline-indicator)

echo nvim_treesitter#statusline(90)  " 90 can be any length
module-\>expression_statement-\>call-\>identifier

### [Utilities](#utilities)

You can get some utility functions with

local ts_utils = require 'nvim-treesitter.ts_utils'

Check [:h nvim-treesitter-utils](https://github.com/nvim-treesitter/nvim-treesitter/blob/master/doc/nvim-treesitter.txt) for more information.

## [Troubleshooting](#troubleshooting)

Before doing anything, make sure you have the latest version of this plugin and run `:checkhealth nvim-treesitter`. It can also help to update the parsers via `:TSUpdate`.

#### [Feature X does not work for {language}...](#feature-x-does-not-work-for-language)

First, check the `health#nvim_treesitter#check` and the `health#treesitter#check` sections of `:checkhealth` for any warning. If there is one, it's highly likely that this is the cause of the problem.

Next check the `## Parser/Features` subsection of the `health#nvim_treesitter#check` section of `:checkhealth` to ensure the desired module is enabled for your language. If not, you might be missing query files; see [Adding queries](#adding-queries).

Finally, ensure Neovim is correctly identifying your language's filetype using the `:echo &filetype` command while one of your language's files is open in Neovim. If not, add a short Vimscript file to nvim-treesitter's `ftdetect` runtime directory following [Neovim's documentation](https://neovim.io/doc/user/filetype.html#new-filetype) on filetype detection. You can also quickly & temporarily set the filetype for a single buffer with the `:set filetype=langname` command to test whether it fixes the problem.

If everything is okay, then it might be an actual error. In that case, feel free to [open an issue here](https://github.com/nvim-treesitter/nvim-treesitter/issues/new/choose).

#### [I get module 'vim.treesitter.query' not found](#i-get-module-vimtreesitterquery-not-found)

Make sure you have the latest version of Neovim.

#### [I get Error detected while processing .../plugin/nvim-treesitter.vim every time I open Neovim](#i-get-error-detected-while-processing-pluginnvim-treesittervim-every-time-i-open-neovim)

This is probably due to a change in a parser's grammar or its queries. Try updating the parser that you suspect has changed (`:TSUpdate {language}`) or all of them (`:TSUpdate`). If the error persists after updating all parsers, please [open an issue](https://github.com/nvim-treesitter/nvim-treesitter/issues/new/choose).

#### [I get query error: invalid node type at position](#i-get-query-error-invalid-node-type-at-position)

This could be due a query file outside this plugin using outdated nodes, or due to an outdated parser.

* Make sure you have the parsers up to date with `:TSUpdate`
* Make sure you don't have more than one `parser` runtime directory. You can execute this command `:echo nvim_get_runtime_file('parser', v:true)` to find all runtime directories. If you get more than one path, remove the ones that are outside this plugin (`nvim-treesitter` directory), so the correct version of the parser is used.

#### [I experience weird highlighting issues similar to ](#i-experience-weird-highlighting-issues-similar-to-78)[#78](https://github.com/nvim-treesitter/nvim-treesitter/issues/78)

This is a well known issue, which arises when the tree and the buffer have gotten out of sync. As this is an upstream issue, we don't have any definite fix. To get around this, you can force reparsing the buffer with

:write | edit | TSBufEnable highlight

This will save, restore and enable highlighting for the current buffer.

#### [I experience bugs when using nvim-treesitter's foldexpr similar to ](#i-experience-bugs-when-using-nvim-treesitters-foldexpr-similar-to-194)[#194](https://github.com/nvim-treesitter/nvim-treesitter/issues/194)

This might happen, and is known to happen, with `vim-clap`. To avoid these kind of errors, please use `setlocal` instead of `set` for the respective filetypes.

#### [I run into errors like module 'nvim-treesitter.configs' not found at startup](#i-run-into-errors-like-module-nvim-treesitterconfigs-not-found-at-startup)

This is because of `rtp` management in `nvim`, adding `packadd nvim-treesitter` should fix the issue.

#### [I want to use Git instead of curl for downloading the parsers](#i-want-to-use-git-instead-of-curl-for-downloading-the-parsers)

In your Lua config:

require("nvim-treesitter.install").prefer_git = true

#### [I want to use a HTTP proxy for downloading the parsers](#i-want-to-use-a-http-proxy-for-downloading-the-parsers)

You can either configure curl to use additional CLI arguments in your Lua config:

require("nvim-treesitter.install").command_extra_args = {
    curl = { "--proxy", "\<proxy url\>" },
}

or you can configure git via `.gitconfig` and use git instead of curl

require("nvim-treesitter.install").prefer_git = true

#### [I want to use a mirror instead of "](#i-want-to-use-a-mirror-instead-of-httpsgithubcom)\<https://github.com/\>"

In your Lua config:

for _, config in pairs(require("nvim-treesitter.parsers").get_parser_configs()) do
  config.install_info.url = config.install_info.url:gsub("https://github.com/", "something else")
end

require'nvim-treesitter.configs'.setup {
    --
    --
}



# links
[Read on Omnivore](https://omnivore.app/me/nvim-treesitter-nvim-treesitter-nvim-treesitter-configurations-a-18b3ec95beb)
[Read Original](https://github.com/nvim-treesitter/nvim-treesitter)

<iframe src="https://github.com/nvim-treesitter/nvim-treesitter"  width="800" height="500"></iframe>
