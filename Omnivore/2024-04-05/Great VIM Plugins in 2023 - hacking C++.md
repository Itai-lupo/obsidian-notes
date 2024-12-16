---
id: 6284a2cd-b93a-4fce-aa1c-6435500129c5
title: Great VIM Plugins in 2023 | hacking C++
author: André Müller
tags:
  - nvim
  - text_editors
date: 2024-04-05 20:23:06
date_published: 2023-07-29 03:00:00
words_count: 2664
state: INBOX
---

# Great VIM Plugins in 2023 | hacking C++ by André Müller
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> An opinionated list of useful and well-rounded VIM plugins as of 2023. Linting, commenting, fuzzy finding, mass editing, advanced text editing, UI enhancements, etc.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
This list contains all VIM plugins that I’ve used at some time in the past and found potentially helpful and of sufficient quality.

Nowadays I only load a small set of plugins at startup and add whatever I need on demand with VIM 8's :packadd. I think that a lot of VIM plugins out there aren't very useful anyways. They either replicate features that are already available in vanilla VIM or try to do things in a very un-vimmy way.

### VIM 8 or NeoVIM

### 3rd Party Plugin Managers

Generic finder and dispatcher (like [vim-fzf](https://hackingcpp.com/dev/dev/vim%5Fplugins.html#vim-fzf)). Lets you fuzzy find files, commands, help topics, …

Still very young, but seems very promising and works smoothly.

You should use it together with the insanely fast [ripgrep](https://github.com/BurntSushi/ripgrep)(instead of `grep`) as file system crawler.

VIM integration of the [FZF](https://github.com/junegunn/fzf)fuzzy selection command line tool. Lets you fuzzy find files, commands, help topics, …

You should use it together with the insanely fast [ripgrep](https://github.com/BurntSushi/ripgrep)(instead of `grep`) as file system crawler.

Super intuitive mass-editing within hundreds of files using VIM's quickfix list.

* use grep or any other method to populate the quickfix list with file locations
* edit quickfix entries with all VIM tools (change, substitute, ...)
* or remove quickfix lines of files that you don't want to be affected by changes
* apply all changes to the actual target locations by saving the quickfist lit

Superb integration of linters, compilers as linters, fixers/formatting tools and LSP language servers (as linters and for completion and code navigation). Requires VIM 8 or NeoVim.

* pure VimScript
* works well with `cquery`, `clangd`, `gcc`
* highly customizable

(un-)commenting commands and text objects for selecting comments

manage and excute tasks asynchronously (build, clean, run, …) based on simple tasks files; different profiles for release, build, Linux, Windows, etc. possible; easy to integrate with [vim-clap](https://hackingcpp.com/dev/dev/vim%5Fplugins.html#vim-clap) or [vim-fzf](https://hackingcpp.com/dev/dev/vim%5Fplugins.html#vim-fzf)

Provides a window for viewing and searching LSP symbols and/or tags. Similar, but faster and more feature rich than the classic tagbar plugin.

works well with LSP clients like ALE

Switch between header and source file. Much better and more lightweight than the old 'a.vim' plugin.

commands, text objects and visual aides for coding in whitespace-aware languages like Python

enhances the built-in filetype plugin; adds additional modern C++ keywords and language constructs

Debug with gdb/pdb/lldb in VIM. Shows current instruction and breakpoints in code; windows for debugger console, locals, registers, stacks, threads, breakpoints, disassembly, watch expressions.

Similar to, but more user friendly and feature-rich than VIM's termdebug package. I found that it just works without any setup hassle.

CMake integration

* adds CMake build window
* populates quickfix list with build errors
* enables easy switching between CMake build configurations
* autocompletion for build targets, build configurations and tests
* statusline status information

Text objects i#/a# (alternative i3/a3) for C preprocessor regions delimited by `#ifdef`, `#ifndef`, `#else`, `#elif`, `#endif`, etc.

unfortunately not well documented, but it works flawlessly

C++ (additional keywords), qmake, qml, qbs, qrc xml, ui xml, ts xml

A suite of git wrapper commands. Also a great tool for crafting git commits. Probably the best feature is a git status-like overview of all changes that allows staging/unstaging on file-level, hunk-level or line-level. Also allows calling of arbitrary git commands from VIM (with completion of commands, tags, etc.).

Can be augmented with ["Rhubarb"](https://github.com/tpope/vim-rhubarb.git)which allows browsing files/commits/etc. on GitHub directly from VIM.

Shows a git-based quick diff (working dir vs. HEAD) in the sign column. Also comes with a lot of useful commands for hunk-wise staging, undoing etc. Could be a bit faster, but you can turn it on and off as you see fit.

Motions for navigating version control merge conflicts.

A vim9 plugin inspired by VCCode's GitLens. Auto-displays time of change, author and commit message on any line of code.

Repeat more actions with the . command.

Should be built-in.

Commands & text objects for surrounding selections with parentheses, braces, quotes, XML tags, …

A must have for coding; should be built-in.

Exchange the contents of selections/text objects.

Should be built-in.

Makes writing prose in VIM a lot less painful.

Improves the f/t commands in a very intuitive way and also frees up the , and ; keys.

###### [vim-visual-multi](https://github.com/mg979/vim-visual-multi)

Multiple Cursors for VIM. For the occasions when VIM's gnmotion isn't powerful enough or you need more visual feedback.

Very nice plugin! Substantially faster, less buggy, better visual feedback and a lot more features than the old[Multiple Cursors](https://github.com/terryma/vim-multiple-cursors)plugin. Actually the first incarnation of multiple cursors in VIM that I really like.

As an alternative to multiple cursor editing you can put a mapping like nnoremap <silent> M \*\`\`cgn in your vimrc to quickly replace the word under the cursor by pressing M. This can be repeated with ., so one can jump to and replace the next occurrence or use n to skip to the next occurrence without replacing.

Align text into columns; lots of neat options.

Move or duplicate selections/lines around.

Text objects for comma-separated regions; e.g., in function parameter lists.

Motions based on sub-words in CamelCase, snake\_case, dash-case, etc.

Text objects that select sub-words in CamelCase, snake\_case, dash-case, etc.

Adds several text objects for regions that are delimited by quotes, points, etc.

Makes block-wise prepending/appending with I and Aavailable in all visual modes (not just block-wise mode). Should probably also be built-in functionality.

Text objects based on the current indent level. Great for indentation-based languages or markup (Python, HAML, etc.)

Commands & text objects for changing/deleting/yanking surrounding function names or function calls (name + arguments in parentheses).

You should make sure that the mappings don't interfere with the classic Surround plugin (esp. ys). You can simply deactivate the defaults and define mappings in the vimrc (just copy them from the readme and adapt them to your liking).

Replace a motion/text object with the contents of the default register without changing the register content.

Tip: In Vim 9 you can use upper case P in visual mode to paste without affecting registers.

Motions based on indent levels. Lets you jump to prev/next block with same/less/more indent.

Automatically insert end-of-block delimiters in languages that don't use braces (`fi`, `endfunction`, etc.)

Easily search for, substitute, and abbreviate multiple variants of a word.

Has a nice coerce feature that let's you transform between case styles (`snake_case`, `CamelCase`, `Title Case`).

Collects all spelling errors in the quickfix list.

A vim plugin to toggle words between pairs or lists of related words.

Useful if you have to work with a lot of Markdown tables.

Let's you quickly delete/select contiguous regions of whitespace.

Text object for selecting whitespace-separated columns. Useful for working with tab-separated data.

Text objects for various LaTeX regions (math, environments,…).

A plugin to type Unicode chars in Vim, using their LaTeX names.

Adds a text object for selecting the content of the current line (without the whitespace before and after).

Adds text object to select text _after_ designated characters.

Teach Vim about Title Case, with support for motions and text objects.

Live highlight of patterns and range commands (substitute, global, …). Super useful when crafting complex regex searches and/or replacements. Should be built-in functionality.

Highlights different levels of matching delimiters (parentheses, braces, …) in different colors.

Underlines all occurrences of the word under the cursor. Fast; useful for spotting spelling errors in code and redundancy in prose.

Live preview of colors for constants like `red`,`#ffa`, `rgb(0,0,255)`, …

Seamless window/split navigation between TMUX windows and VIM windows.

Flashes the text range that is selected by a yank command like yip. Speed and color can be configured.

Shows a list of all open,unlisted,etc. buffers and provides commands for managing them.

Shows marks in the sign column. Lets you also define additional markers with m1,m2, etc. that can be on multiple lines at the same time (great for tagging lines that belong to one topic).

Show the undo tree and let's you navigate it (switch between revisions).

Displays a scrollbar on the right side of the current window based on the popup window feature of newer VIM versions.

There's also an [alternative for NeoVIM](https://github.com/Xuyuanp/scrollbar.nvim).

enhances the built-in filetype plugin; adds additional modern C++ keywords and language constructs

C++ (additional keywords), qmake, qml, qbs, qrc xml, ui xml, ts xml

Believe it or not, VIM already has a built-in file manager called netrw. However some people (including me) feel that it is too clumsy to use.

I mostly use a fuzzy finder like[vim-clap](https://hackingcpp.com/dev/dev/vim%5Fplugins.html#vim-clap) (nowadays) or[vim-fzf](https://hackingcpp.com/dev/dev/vim%5Fplugins.html#vim-fzf) (in the past) for file opening, buffer switching, etc. and[EasyTree](https://hackingcpp.com/dev/dev/vim%5Fplugins.html#easytree) as tree viewer when exploring new and large projects.

###### [EasyTree](https://github.com/troydm/easytree.vim)

Simple tree viewer that is faster than NERDTree in my experience.

* view and browse the file tree (same as NERDTree)
* create, delete, copy, move files and directories in usual VIM fashion (yank/paste)
* displays git status (untracked, modified, staged, etc.)

###### [nnn.vim](https://github.com/mcchrish/nnn.vim)

Integration of the excellent command line file explorer[nnn](https://github.com/jarun/nnn) into vim. Offers commands for file picking and a file explorer window. Substantially faster than NERD Tree and a no-brainer if you already use nnn (which you probably should).

Lets you (mass) rename files in a directory using vim editing commands. Can be quite useful and way faster and a lot more usable than other renaming tools or shell scripts.

An improved version of the [original Gruvbox scheme](https://github.com/morhetz/gruvbox). In comes in a light and a dark version each having 3 contrast modes.

The improved version loads faster, has better documentation and the 256 color version is a better approximation of the true color version than in the original Gruvbox scheme.

Light & dark color schemes.

Light and dark schemes based on the "One" color scheme for the Atom editor.

Dark color scheme based on the "One" color scheme for the Atom editor.

3 dark and 2 light schemes

dark and light schemes similar to solarized

dark blueish color scheme

greenish color schemes; light & dark in three contrast levels

collection of themes for Vim, text editors, and terminal emulators that are compliant at the very least with the WCAG AA accessibility standard for colour contrast

My personal color scheme(s). Dark scheme, light scheme and hight-contrast light scheme for presentations.

An aggregator site that lists colorschemes from GitHub. Shows preview images and let's you browse schemes by category (light, dark), recently updated, trending, top, etc.

### Websites

* [VIM Tutorial](https://openvim.com/)  
interactive, step-by-step introduction
* [VIM Help Online](https://vimhelp.org/)  
searchable HTML version of VIM's help files
* [Learn VIM For The First Time](https://danielmiessler.com/study/vim/)  
Introduction / Tutorial by Daniel Miessler
* [VIM Cheat Sheet](https://quickref.me/vim)  
Overview of VIM commands
* [VIM from scratch](https://www.vimfromscratch.com/)  
VIM-focused blog by Yanis Triandafilov

---

* [Learn VIM Progressively](http://yannesposito.com/Scratch/en/blog/Learn-Vim-Progressively)
* [A VIM Guide for Beginner Users](https://thevaluable.dev/vim-commands-beginner)
* [A VIM Guide for Intermediate Users](https://thevaluable.dev/vim-intermediate)
* [A VIM Guide for Advanced Users](https://thevaluable.dev/vim-advanced)
* [A VIM Guide for Adept Users](https://thevaluable.dev/vim-adept)

---

* [VimScript Snippets](https://devhints.io/vimscript-functions)  
short examples for how to use the most common VimScript functions
* [Learn VimScript The Hard Way](http://learnvimscriptthehardway.stevelosh.com/)  
excellent step-by-step tutorial with examples and exercises

| fzf     | sudo apt install \-y fzf     |
| ------- | ---------------------------- |
| ripgrep | sudo apt install \-y ripgrep |
| tig     | sudo apt install \-y tig     |

```crmsh
git clone https://github.com/EdenEast/nightfox.nvim.git
git clone https://github.com/Eliot00/git-lens.vim.git
git clone https://github.com/Julian/vim-textobj-variable-segment.git
git clone https://github.com/Matt-A-Bennett/vim-surround-funk.git
git clone https://github.com/NLKNguyen/papercolor-theme.git
git clone https://github.com/PhilRunninger/nerdtree-visual-selection.git
git clone https://github.com/Shougo/vinarise.vim.git
git clone https://github.com/Xuyuanp/nerdtree-git-plugin.git
git clone https://github.com/airblade/vim-gitgutter.git
git clone https://github.com/ap/vim-css-color.git
git clone https://github.com/arcticicestudio/nord-vim.git
git clone https://github.com/b4winckler/vim-angry.git
git clone https://github.com/bfrg/vim-cpp-modern.git
git clone https://github.com/bkad/CamelCaseMotion.git
git clone https://github.com/bounceme/poppy.vim.git
git clone https://github.com/chrisbra/csv.vim.git
git clone https://github.com/christoomey/vim-titlecase.git
git clone https://github.com/christoomey/vim-tmux-navigator.git
git clone https://github.com/coderifous/textobj-word-column.vim.git
git clone https://github.com/cpiger/NeoDebug.git
git clone https://github.com/dhruvasagar/vim-table-mode.git
git clone https://github.com/fedorenchik/qt-support.vim.git
git clone https://github.com/google/vim-searchindex.git
git clone https://github.com/iberianpig/tig-explorer.vim
git clone https://github.com/inkarkat/vim-SpellCheck.git
git clone https://github.com/itchyny/vim-cursorword.git
git clone https://github.com/jeetsukumaran/vim-indentwise.git
git clone https://github.com/jlanzarotta/bufexplorer.git
git clone https://github.com/joom/latex-unicoder.vim.git
git clone https://github.com/joshdick/onedark.vim.git
git clone https://github.com/jreybert/vimagit
git clone https://github.com/junegunn/fzf.vim.git
git clone https://github.com/junegunn/vim-after-object.git
git clone https://github.com/junegunn/vim-easy-align.git
git clone https://github.com/junegunn/vim-plug.git
git clone https://github.com/kana/vim-niceblock.git
git clone https://github.com/kana/vim-textobj-line.git
git clone https://github.com/kshenoy/vim-signature.git
git clone https://github.com/kurkale6ka/vim-pairs.git
git clone https://github.com/kuznetsss/shswitch
git clone https://github.com/lifepillar/vim-gruvbox8.git
git clone https://github.com/lifepillar/vim-solarized8.git
git clone https://github.com/liuchengxu/space-vim-theme.git
git clone https://github.com/liuchengxu/vim-clap.git
git clone https://github.com/machakann/vim-highlightedyank.git
git clone https://github.com/markonm/traces.vim.git
git clone https://github.com/mbbill/undotree.git
git clone https://github.com/mg979/vim-visual-multi.git
git clone https://github.com/michaeljsmith/vim-indent-object.git
git clone https://github.com/morhetz/gruvbox.git
git clone https://github.com/muellan/am-colors.git
git clone https://github.com/muellan/vim-brace-for-umlauts.git
git clone https://github.com/muellan/vim-fzf-extensions.git
git clone https://github.com/muellan/vim-toggle-ui-elements.git
git clone https://github.com/octol/vim-cpp-enhanced-highlight.git
git clone https://github.com/othree/html5.vim.git
git clone https://github.com/pangloss/vim-javascript.git
git clone https://github.com/qpkorr/vim-renamer.git
git clone https://github.com/rakr/vim-one.git
git clone https://github.com/rbonvall/vim-textobj-latex.git
git clone https://github.com/reedes/vim-pencil.git
git clone https://github.com/rhysd/clever-f.vim.git
git clone https://github.com/scrooloose/nerdtree.git
git clone https://github.com/skywind3000/asynctasks.vim.git
git clone https://github.com/stefandtw/quickfix-reflector.vim.git
git clone https://github.com/t9md/vim-textmanip.git
git clone https://github.com/tommcdo/vim-exchange.git
git clone https://github.com/tomtom/tcomment_vim.git
git clone https://github.com/tpope/vim-abolish.git
git clone https://github.com/tpope/vim-endwise.git
git clone https://github.com/tpope/vim-fugitive.git
git clone https://github.com/tpope/vim-repeat.git
git clone https://github.com/tpope/vim-rhubarb.git
git clone https://github.com/tpope/vim-surround.git
git clone https://github.com/tweekmonster/braceless.vim.git
git clone https://github.com/vim-scripts/ConflictMotions.git
git clone https://github.com/vim-scripts/DoxygenToolkit.vim.git
git clone https://github.com/vim-scripts/GCov-plugin.git
git clone https://github.com/vim-scripts/ReplaceWithRegister.git
git clone https://github.com/vim-utils/vim-space.git
git clone https://github.com/w0rp/ale.git
git clone https://github.com/will133/vim-dirdiff.git
git clone https://github.com/zef/vim-cycle.git
```

Found this useful? Share it:



# links
[Read on Omnivore](https://omnivore.app/me/great-vim-plugins-in-2023-hacking-c-18eaf49145c)
[Read Original](https://hackingcpp.com/dev/vim_plugins.html)

<iframe src="https://hackingcpp.com/dev/vim_plugins.html"  width="800" height="500"></iframe>
