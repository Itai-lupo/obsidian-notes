---
id: be38de1a-779a-4181-b676-13a7c2898cab
title: Syntax - Neovim docs
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-11-06 17:31:17
date_published: 2023-11-06 02:00:00
words_count: 29347
state: INBOX
---

# Syntax - Neovim docs by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Neovim user documentation


# content

##  Syntax

 _Nvim `:help` pages, [generated](https://github.com/neovim/neovim/blob/master/scripts/gen%5Fhelp%5Fhtml.lua) from [source](https://github.com/neovim/neovim/blob/master/runtime/doc/syntax.txt) using the [tree-sitter-vimdoc](https://github.com/neovim/tree-sitter-vimdoc) parser._ 

---

Syntax highlighting `syntax-highlighting` `coloring`

Syntax highlighting enables Vim to show parts of the text in another font or color. Those parts can be specific keywords or text matching a pattern. Vim doesn't parse the whole file (to keep it fast), so the highlighting has its limitations. Lexical highlighting might be a better name, but since everybody calls it syntax highlighting we'll stick with that.

Vim supports syntax highlighting on all terminals. But since most ordinary terminals have very limited highlighting possibilities, it works best in the GUI version, gvim.

In the User Manual:[usr\_06.txt](https://neovim.io/doc/user/usr%5F06.html#usr%5F06.txt) introduces syntax highlighting.[usr\_44.txt](https://neovim.io/doc/user/usr%5F44.html#usr%5F44.txt) introduces writing a syntax file.

## 1\. Quick start [:syn-qstart](#%3Asyn-qstart)

`:syn-enable` `:syntax-enable` `:syn-on` `:syntax-on`Syntax highlighting is enabled by default. If you need to enable it again after it was disabled (see below), use:

:syntax enable

Alternatively:

:syntax on

What this command actually does is to execute the command

:source $VIMRUNTIME/syntax/syntax.vim

If the VIM environment variable is not set, Vim will try to find the path in another way (see [$VIMRUNTIME](https://neovim.io/doc/user/starting.html#%24VIMRUNTIME)). Usually this works just fine. If it doesn't, try setting the VIM environment variable to the directory where the Vim stuff is located. For example, if your syntax files are in the "/usr/vim/vim82/syntax" directory, set $VIMRUNTIME to "/usr/vim/vim82". You must do this in the shell, before starting Vim. This command also sources the [menu.vim](https://neovim.io/doc/user/gui.html#menu.vim) script when the GUI is running or will start soon. See ['go-M'](https://neovim.io/doc/user/options.html#'go-M') about avoiding that.

`:hi-normal` `:highlight-normal`If you are running in the GUI, you can get white text on a black background with:

:highlight Normal guibg=Black guifg=White

For a color terminal see [:hi-normal-cterm](https://neovim.io/doc/user/syntax.html#%3Ahi-normal-cterm).

NOTE: The syntax files on MS-Windows have lines that end in `\<CR\>` `\<NL\>`. The files for Unix end in `\<NL\>`. This means you should use the right type of file for your system. Although on MS-Windows the right format is automatically selected if the ['fileformats'](https://neovim.io/doc/user/options.html#'fileformats') option is not empty.

NOTE: When using reverse video ("gvim -fg white -bg black"), the default value of ['background'](https://neovim.io/doc/user/options.html#'background') will not be set until the GUI window is opened, which is after reading the [gvimrc](https://neovim.io/doc/user/gui.html#gvimrc). This will cause the wrong default highlighting to be used. To set the default value of ['background'](https://neovim.io/doc/user/options.html#'background') before switching on highlighting, include the ":gui" command in the [gvimrc](https://neovim.io/doc/user/gui.html#gvimrc):

:gui                " open window and set default for 'background'
:syntax on        " start highlighting, use 'background' to set colors

NOTE: Using ":gui" in the [gvimrc](https://neovim.io/doc/user/gui.html#gvimrc) means that "gvim -f" won't start in the foreground! Use ":gui -f" then.

`g:syntax_on`You can toggle the syntax on/off with this command:

:if exists("g:syntax_on") | syntax off | else | syntax enable | endif

To put this into a mapping, you can use:

:map \<F7\> :if exists("g:syntax_on") \<Bar\>
     \   syntax off \<Bar\>
     \ else \<Bar\>
     \   syntax enable \<Bar\>
     \ endif \<CR\>

\[using the [\<\>](https://neovim.io/doc/user/intro.html#%3C%3E) notation, type this literally\]

Details: The ":syntax" commands are implemented by sourcing a file. To see exactly how this works, look in the file:

 command file

 :syntax enable $VIMRUNTIME/syntax/syntax.vim :syntax on $VIMRUNTIME/syntax/syntax.vim :syntax manual $VIMRUNTIME/syntax/manual.vim :syntax off $VIMRUNTIME/syntax/nosyntax.vim Also see [syntax-loading](https://neovim.io/doc/user/syntax.html#syntax-loading).

NOTE: If displaying long lines is slow and switching off syntax highlighting makes it fast, consider setting the ['synmaxcol'](https://neovim.io/doc/user/options.html#'synmaxcol') option to a lower value.

## 2\. Syntax files [:syn-files](#%3Asyn-files)

The syntax and highlighting commands for one language are normally stored in a syntax file. The name convention is: "{name}.vim". Where `{name}` is the name of the language, or an abbreviation (to fit the name in 8.3 characters, a requirement in case the file is used on a DOS filesystem). Examples: c.vim perl.vim java.vim html.vim cpp.vim sh.vim csh.vim

The syntax file can contain any Ex commands, just like a vimrc file. But the idea is that only commands for a specific language are included. When a language is a superset of another language, it may include the other one, for example, the cpp.vim file could include the c.vim file:

:so $VIMRUNTIME/syntax/c.vim

The .vim files are normally loaded with an autocommand. For example:

:au Syntax c            runtime! syntax/c.vim
:au Syntax cpp   runtime! syntax/cpp.vim

These commands are normally in the file $VIMRUNTIME/syntax/synload.vim.

### MAKING YOUR OWN SYNTAX FILES [mysyntaxfile](#mysyntaxfile)

When you create your own syntax files, and you want to have Vim use these automatically with ":syntax enable", do this:

1\. Create your user runtime directory. You would normally use the first item of the ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath') option. Example for Unix:

mkdir ~/.config/nvim

2\. Create a directory in there called "syntax". For Unix:

mkdir ~/.config/nvim/syntax

3\. Write the Vim syntax file. Or download one from the internet. Then write it in your syntax directory. For example, for the "mine" syntax:

:w ~/.config/nvim/syntax/mine.vim

Now you can start using your syntax file manually:

:set syntax=mine

You don't have to exit Vim to use this.

If you also want Vim to detect the type of file, see [new-filetype](https://neovim.io/doc/user/filetype.html#new-filetype).

If you are setting up a system with many users and you don't want each user to add the same syntax file, you can use another directory from ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath').

### ADDING TO AN EXISTING SYNTAX FILE [mysyntaxfile-add](#mysyntaxfile-add)

If you are mostly satisfied with an existing syntax file, but would like to add a few items or change the highlighting, follow these steps:

1\. Create your user directory from ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath'), see above.

2\. Create a directory in there called "after/syntax". For Unix:

mkdir ~/.config/nvim/after
mkdir ~/.config/nvim/after/syntax

3\. Write a Vim script that contains the commands you want to use. For example, to change the colors for the C syntax:

highlight cComment ctermfg=Green guifg=Green

4\. Write that file in the "after/syntax" directory. Use the name of the syntax, with ".vim" added. For our C syntax:

:w ~/.config/nvim/after/syntax/c.vim

That's it. The next time you edit a C file the Comment color will be different. You don't even have to restart Vim.

If you have multiple files, you can use the filetype as the directory name. All the "\*.vim" files in this directory will be used, for example: \~/.config/nvim/after/syntax/c/one.vim \~/.config/nvim/after/syntax/c/two.vim

### REPLACING AN EXISTING SYNTAX FILE [mysyntaxfile-replace](#mysyntaxfile-replace)

If you don't like a distributed syntax file, or you have downloaded a new version, follow the same steps as for [mysyntaxfile](https://neovim.io/doc/user/syntax.html#mysyntaxfile) above. Just make sure that you write the syntax file in a directory that is early in ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath'). Vim will only load the first syntax file found, assuming that it sets b:current\_syntax.

### NAMING CONVENTIONS [group-name](#group-name) [{group-name}](#%7Bgroup-name%7D) [E669](#E669) [E5248](#E5248)

A syntax group name is to be used for syntax items that match the same kind of thing. These are then linked to a highlight group that specifies the color. A syntax group name doesn't specify any color or attributes itself.

The name for a highlight or syntax group must consist of ASCII letters, digits, underscores, dots, hyphens, or `@`. As a regexp: `[a-zA-Z0-9_.@-]*`. The maximum length of a group name is about 200 bytes. `E1249`

To be able to allow each user to pick their favorite set of colors, there must be preferred names for highlight groups that are common for many languages. These are the suggested group names (if syntax highlighting works properly you can see the actual color, except for "Ignore"):

 Comment any comment

 Constant any constant String a string constant: "this is a string" Character a character constant: 'c', '\\n' Number a number constant: 234, 0xff Boolean a boolean constant: TRUE, false Float a floating point constant: 2.3e10

 Identifier any variable name Function function name (also: methods for classes)

 Statement any statement Conditional if, then, else, endif, switch, etc. Repeat for, do, while, etc. Label case, default, etc. Operator "sizeof", "+", "\*", etc. Keyword any other keyword Exception try, catch, throw

 PreProc generic Preprocessor Include preprocessor #include Define preprocessor #define Macro same as Define PreCondit preprocessor #if, #else, #endif, etc.

 Type int, long, char, etc. StorageClass static, register, volatile, etc. Structure struct, union, enum, etc. Typedef A typedef

 Special any special symbol SpecialChar special character in a constant Tag you can use `CTRL-]` on this Delimiter character that needs attention SpecialComment special things inside a comment Debug debugging statements

 Underlined text that stands out, HTML links

 Error any erroneous construct

 Todo anything that needs extra attention; mostly the keywords TODO FIXME and XXX

The names marked with \* are the preferred groups; the others are minor groups. For the preferred groups, the "syntax.vim" file contains default highlighting. The minor groups are linked to the preferred groups, so they get the same highlighting. You can override these defaults by using ":highlight" commands after sourcing the "syntax.vim" file.

Note that highlight group names are not case sensitive. "String" and "string" can be used for the same group.

The following names are reserved and cannot be used as a group name: NONE ALL ALLBUT contains contained

`hl-Ignore`When using the Ignore group, you may also consider using the conceal mechanism. See [conceal](https://neovim.io/doc/user/syntax.html#conceal).

## 3\. Syntax loading procedure [syntax-loading](#syntax-loading)

This explains the details that happen when the command ":syntax enable" is issued. When Vim initializes itself, it finds out where the runtime files are located. This is used here as the variable [$VIMRUNTIME](https://neovim.io/doc/user/starting.html#%24VIMRUNTIME).

":syntax enable" and ":syntax on" do the following:

 Source $VIMRUNTIME/syntax/syntax.vim | +- Clear out any old syntax by sourcing $VIMRUNTIME/syntax/nosyntax.vim | +- Source first syntax/synload.vim in ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath') | | | +- Set up syntax autocmds to load the appropriate syntax file when | | the ['syntax'](https://neovim.io/doc/user/options.html#'syntax') option is set. `synload-1` | | | +- Source the user's optional file, from the [mysyntaxfile](https://neovim.io/doc/user/syntax.html#mysyntaxfile) variable. | This is for backwards compatibility with Vim 5.x only. `synload-2` | +- Do ":filetype on", which does ":runtime! filetype.vim". It loads any | filetype.vim files found. It should always Source | $VIMRUNTIME/filetype.vim, which does the following. | | | +- Install autocmds based on suffix to set the ['filetype'](https://neovim.io/doc/user/options.html#'filetype') option | | This is where the connection between file name and file type is | | made for known file types. `synload-3` | | | +- Source the user's optional file, from the `myfiletypefile` | | variable. This is for backwards compatibility with Vim 5.x only. | | `synload-4` | | | +- Install one autocommand which sources scripts.vim when no file | | type was detected yet. `synload-5` | | | +- Source $VIMRUNTIME/menu.vim, to setup the Syntax menu. [menu.vim](https://neovim.io/doc/user/gui.html#menu.vim) | +- Install a FileType autocommand to set the ['syntax'](https://neovim.io/doc/user/options.html#'syntax') option when a file | type has been detected. `synload-6` | +- Execute syntax autocommands to start syntax highlighting for each already loaded buffer.

Upon loading a file, Vim finds the relevant syntax file as follows:

 Loading the file triggers the BufReadPost autocommands. | +- If there is a match with one of the autocommands from [synload-3](https://neovim.io/doc/user/syntax.html#synload-3) | (known file types) or [synload-4](https://neovim.io/doc/user/syntax.html#synload-4) (user's file types), the ['filetype'](https://neovim.io/doc/user/options.html#'filetype') | option is set to the file type. | +- The autocommand at [synload-5](https://neovim.io/doc/user/syntax.html#synload-5) is triggered. If the file type was not | found yet, then scripts.vim is searched for in ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath'). This | should always load $VIMRUNTIME/scripts.vim, which does the following. | | | +- Source the user's optional file, from the `myscriptsfile` | | variable. This is for backwards compatibility with Vim 5.x only. | | | +- If the file type is still unknown, check the contents of the file, | again with checks like "getline(1) =\~ pattern" as to whether the | file type can be recognized, and set ['filetype'](https://neovim.io/doc/user/options.html#'filetype'). | +- When the file type was determined and ['filetype'](https://neovim.io/doc/user/options.html#'filetype') was set, this | triggers the FileType autocommand [synload-6](https://neovim.io/doc/user/syntax.html#synload-6) above. It sets | ['syntax'](https://neovim.io/doc/user/options.html#'syntax') to the determined file type. | +- When the ['syntax'](https://neovim.io/doc/user/options.html#'syntax') option was set above, this triggers an autocommand | from [synload-1](https://neovim.io/doc/user/syntax.html#synload-1) (and [synload-2](https://neovim.io/doc/user/syntax.html#synload-2)). This find the main syntax file in | ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath'), with this command: | runtime! syntax/\<name\>.vim | +- Any other user installed FileType or Syntax autocommands are triggered. This can be used to change the highlighting for a specific syntax.

## 4\. Conversion to HTML [2html.vim](#2html.vim) [convert-to-HTML](#convert-to-HTML)

2html is not a syntax file itself, but a script that converts the current window into HTML. Vim opens a new window in which it builds the HTML file.

After you save the resulting file, you can view it with any browser. The colors should be exactly the same as you see them in Vim. With[g:html\_line\_ids](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fline%5Fids) you can jump to specific lines by adding (for example) #L123 or #123 to the end of the URL in your browser's address bar. And with[g:html\_dynamic\_folds](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdynamic%5Ffolds) enabled, you can show or hide the text that is folded in Vim.

You are not supposed to set the ['filetype'](https://neovim.io/doc/user/options.html#'filetype') or ['syntax'](https://neovim.io/doc/user/options.html#'syntax') option to "2html"! Source the script to convert the current file:

:runtime! syntax/2html.vim

Many variables affect the output of 2html.vim; see below. Any of the on/off options listed below can be enabled or disabled by setting them explicitly to the desired value, or restored to their default by removing the variable using[:unlet](https://neovim.io/doc/user/eval.html#%3Aunlet).

Remarks:

 Some truly ancient browsers may not show the background colors.

 From most browsers you can also print the file (in color)!

Here is an example how to run the script over all .c and .h files from a Unix shell:

for f in *.[ch]; do gvim -f +"syn on" +"run! syntax/2html.vim" +"wq" +"q" $f; done

`g:html_start_line` `g:html_end_line`To restrict the conversion to a range of lines, use a range with the [:TOhtml](https://neovim.io/doc/user/syntax.html#%3ATOhtml)command below, or set "g:html\_start\_line" and "g:html\_end\_line" to the first and last line to be converted. Example, using the last set Visual area:

:let g:html_start_line = line("'\<")
:let g:html_end_line = line("'\>")
:runtime! syntax/2html.vim

`:TOhtml`:\[range\]TOhtml The ":TOhtml" command is defined in a standard plugin. This command will source [2html.vim](https://neovim.io/doc/user/syntax.html#2html.vim) for you. When a range is given, this command sets [g:html\_start\_line](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fstart%5Fline) and [g:html\_end\_line](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fend%5Fline) to the start and end of the range, respectively. Default range is the entire buffer.

 If the current window is part of a [diff](https://neovim.io/doc/user/diff.html#diff), unless[g:html\_diff\_one\_file](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdiff%5Fone%5Ffile) is set, :TOhtml will convert all windows which are part of the diff in the current tab and place them side-by-side in a `\<table\>` element in the generated HTML. With [g:html\_line\_ids](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fline%5Fids) you can jump to lines in specific windows with (for example) #W1L42 for line 42 in the first diffed window, or #W3L87 for line 87 in the third.

 Examples:

:10,40TOhtml " convert lines 10-40 to html
:'\<,'\>TOhtml " convert current/last visual selection
:TOhtml      " convert entire buffer

`g:html_diff_one_file`Default: 0\. When 0, and using [:TOhtml](https://neovim.io/doc/user/syntax.html#%3ATOhtml) all windows involved in a [diff](https://neovim.io/doc/user/diff.html#diff) in the current tab page are converted to HTML and placed side-by-side in a `\<table\>` element. When 1, only the current buffer is converted. Example:

let g:html_diff_one_file = 1

`g:html_whole_filler`Default: 0\. When 0, if [g:html\_diff\_one\_file](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdiff%5Fone%5Ffile) is 1, a sequence of more than 3 filler lines is displayed as three lines with the middle line mentioning the total number of inserted lines. When 1, always display all inserted lines as if [g:html\_diff\_one\_file](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdiff%5Fone%5Ffile) were not set.

:let g:html_whole_filler = 1

`TOhtml-performance` `g:html_no_progress`Default: 0\. When 0, display a progress bar in the statusline for each major step in the 2html.vim conversion process. When 1, do not display the progress bar. This offers a minor speed improvement but you won't have any idea how much longer the conversion might take; for big files it can take a long time! Example:

let g:html_no_progress = 1

You can obtain better performance improvements by also instructing Vim to not run interactively, so that too much time is not taken to redraw as the script moves through the buffer, switches windows, and the like:

vim -E -s -c "let g:html_no_progress=1" -c "syntax on" -c "set ft=c" -c "runtime syntax/2html.vim" -cwqa myfile.c

Note that the -s flag prevents loading your vimrc and any plugins, so you need to explicitly source/enable anything that will affect the HTML conversion. See [\-E](https://neovim.io/doc/user/starting.html#-E) and [\-s-ex](https://neovim.io/doc/user/starting.html#-s-ex) for details. It is probably best to create a script to replace all the -c commands and use it with the -u flag instead of specifying each command separately.

`hl-TOhtmlProgress` `TOhtml-progress-color`When displayed, the progress bar will show colored boxes along the statusline as the HTML conversion proceeds. By default, the background color as the current "DiffDelete" highlight group is used. If "DiffDelete" and "StatusLine" have the same background color, TOhtml will automatically adjust the color to differ. If you do not like the automatically selected colors, you can define your own highlight colors for the progress bar. Example:

hi TOhtmlProgress guifg=#c0ffee ctermbg=7

`g:html_number_lines`Default: Current ['number'](https://neovim.io/doc/user/options.html#'number') setting. When 0, buffer text is displayed in the generated HTML without line numbering. When 1, a column of line numbers is added to the generated HTML with the same highlighting as the line number column in Vim ([hl-LineNr](https://neovim.io/doc/user/syntax.html#hl-LineNr)). Force line numbers even if ['number'](https://neovim.io/doc/user/options.html#'number') is not set:

:let g:html_number_lines = 1

Force to omit the line numbers:

:let g:html_number_lines = 0

Go back to the default to use ['number'](https://neovim.io/doc/user/options.html#'number') by deleting the variable:

:unlet g:html_number_lines

`g:html_line_ids`Default: 1 if [g:html\_number\_lines](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fnumber%5Flines) is set, 0 otherwise. When 1, adds an HTML id attribute to each line number, or to an empty `\<span\>`inserted for that purpose if no line numbers are shown. This ID attribute takes the form of L123 for single-buffer HTML pages, or W2L123 for diff-view pages, and is used to jump to a specific line (in a specific window of a diff view). Javascript is inserted to open any closed dynamic folds ([g:html\_dynamic\_folds](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdynamic%5Ffolds)) containing the specified line before jumping. The javascript also allows omitting the window ID in the url, and the leading L. For example:

page.html#L123        jumps to line 123 in a single-buffer file
page.html#123        does the same
diff.html#W1L42        jumps to line 42 in the first window in a diff
diff.html#42        does the same

`g:html_use_css`Default: 1\. When 1, generate valid HTML 5 markup with CSS styling, supported in all modern browsers and many old browsers. When 0, generate `\<font\>` tags and similar outdated markup. This is not recommended but it may work better in really old browsers, email clients, forum posts, and similar situations where basic CSS support is unavailable. Example:

:let g:html_use_css = 0

`g:html_ignore_conceal`Default: 0\. When 0, concealed text is removed from the HTML and replaced with a character from [:syn-cchar](https://neovim.io/doc/user/syntax.html#%3Asyn-cchar) or ['listchars'](https://neovim.io/doc/user/options.html#'listchars') as appropriate, depending on the current value of ['conceallevel'](https://neovim.io/doc/user/options.html#'conceallevel'). When 1, include all text from the buffer in the generated HTML, even if it is[conceal](https://neovim.io/doc/user/syntax.html#conceal)ed.

Either of the following commands will ensure that all text in the buffer is included in the generated HTML (unless it is folded):

:let g:html_ignore_conceal = 1
:setl conceallevel=0

`g:html_ignore_folding`Default: 0\. When 0, text in a closed fold is replaced by the text shown for the fold in Vim ([fold-foldtext](https://neovim.io/doc/user/fold.html#fold-foldtext)). See [g:html\_dynamic\_folds](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdynamic%5Ffolds) if you also want to allow the user to expand the fold as in Vim to see the text inside. When 1, include all text from the buffer in the generated HTML; whether the text is in a fold has no impact at all. [g:html\_dynamic\_folds](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdynamic%5Ffolds) has no effect.

Either of these commands will ensure that all text in the buffer is included in the generated HTML (unless it is concealed):

zR
:let g:html_ignore_folding = 1

`g:html_dynamic_folds`Default: 0\. When 0, text in a closed fold is not included at all in the generated HTML. When 1, generate javascript to open a fold and show the text within, just like in Vim.

Setting this variable to 1 causes 2html.vim to always use CSS for styling, regardless of what [g:html\_use\_css](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fuse%5Fcss) is set to.

`g:html_no_foldcolumn`Default: 0\. When 0, if [g:html\_dynamic\_folds](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdynamic%5Ffolds) is 1, generate a column of text similar to Vim's foldcolumn ([fold-foldcolumn](https://neovim.io/doc/user/fold.html#fold-foldcolumn)) the user can click on to toggle folds open or closed. The minimum width of the generated text column is the current['foldcolumn'](https://neovim.io/doc/user/options.html#'foldcolumn') setting. When 1, do not generate this column; instead, hovering the mouse cursor over folded text will open the fold as if [g:html\_hover\_unfold](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fhover%5Funfold) were set.

:let g:html_no_foldcolumn = 1

`TOhtml-uncopyable-text` `g:html_prevent_copy`Default: Empty string. This option prevents certain regions of the generated HTML from being copied, when you select all text in document rendered in a browser and copy it. Useful for allowing users to copy-paste only the source text even if a fold column or line numbers are shown in the generated content. Specify regions to be affected in this way as follows: f: fold column n: line numbers (also within fold text) t: fold text d: diff filler

Example, to make the fold column and line numbers uncopyable:

:let g:html_prevent_copy = "fn"

The method used to prevent copying in the generated page depends on the value of [g:html\_use\_input\_for\_pc](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fuse%5Finput%5Ffor%5Fpc).

When "all", read-only `\<input\>` elements are used in place of normal text for uncopyable regions. In some browsers, especially older browsers, after selecting an entire page and copying the selection, the `\<input\>` tags are not pasted with the page text. If [g:html\_no\_invalid](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fno%5Finvalid) is 0, the `\<input\>` tags have invalid type; this works in more browsers, but the page will not validate. Note: This method does NOT work in recent versions of Chrome and equivalent browsers; the `\<input\>` tags get pasted with the text.

When "fallback" (default value), the same `\<input\>` elements are generated for older browsers, but newer browsers (detected by CSS feature query) hide the`\<input\>` elements and instead use generated content in an ::before pseudoelement to display the uncopyable text. This method should work with the largest number of browsers, both old and new.

When "none", the `\<input\>` elements are not generated at all. Only the generated-content method is used. This means that old browsers, notably Internet Explorer, will either copy the text intended not to be copyable, or the non-copyable text may not appear at all. However, this is the most standards-based method, and there will be much less markup.

`g:html_no_invalid`Default: 0\. When 0, if [g:html\_prevent\_copy](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fprevent%5Fcopy) is non-empty and [g:html\_use\_input\_for\_pc](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fuse%5Finput%5Ffor%5Fpc) is not "none", an invalid attribute is intentionally inserted into the `\<input\>`element for the uncopyable areas. This prevents pasting the `\<input\>` elements in some applications. Specifically, some versions of Microsoft Word will not paste the `\<input\>` elements if they contain this invalid attribute. When 1, no invalid markup is inserted, and the generated page should validate. However,`\<input\>` elements may be pasted into some applications and can be difficult to remove afterward.

`g:html_hover_unfold`Default: 0\. When 0, the only way to open a fold generated by 2html.vim with[g:html\_dynamic\_folds](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdynamic%5Ffolds) set, is to click on the generated fold column. When 1, use CSS 2.0 to allow the user to open a fold by moving the mouse cursor over the displayed fold text. This is useful to allow users with disabled javascript to view the folded text.

Note that old browsers (notably Internet Explorer 6) will not support this feature. Browser-specific markup for IE6 is included to fall back to the normal CSS1 styling so that the folds show up correctly for this browser, but they will not be openable without a foldcolumn.

:let g:html_hover_unfold = 1

`g:html_id_expr`Default: "" Dynamic folding and jumping to line IDs rely on unique IDs within the document to work. If generated HTML is copied into a larger document, these IDs are no longer guaranteed to be unique. Set g:html\_id\_expr to an expression Vim can evaluate to get a unique string to append to each ID used in a given document, so that the full IDs will be unique even when combined with other content in a larger HTML document. Example, to append \_ and the buffer number to each ID:

:let g:html_id_expr = '"_" .. bufnr("%")'

To append a string "\_mystring" to the end of each ID:

:let g:html_id_expr = '"_mystring"'

Note: When converting a diff view to HTML, the expression will only be evaluated for the first window in the diff, and the result used for all the windows.

`TOhtml-wrap-text` `g:html_pre_wrap`Default: Current ['wrap'](https://neovim.io/doc/user/options.html#'wrap') setting. When 0, if [g:html\_no\_pre](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fno%5Fpre) is 0 or unset, the text in the generated HTML does not wrap at the edge of the browser window. When 1, if [g:html\_use\_css](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fuse%5Fcss) is 1, the CSS 2.0 "white-space:pre-wrap" value is used, causing the text to wrap at whitespace at the edge of the browser window. Explicitly enable text wrapping:

:let g:html_pre_wrap = 1

Explicitly disable wrapping:

:let g:html_pre_wrap = 0

Go back to default, determine wrapping from ['wrap'](https://neovim.io/doc/user/options.html#'wrap') setting:

:unlet g:html_pre_wrap

`g:html_no_pre`Default: 0\. When 0, buffer text in the generated HTML is surrounded by `\<pre\>`...\</pre\> tags. Series of whitespace is shown as in Vim without special markup, and tab characters can be included literally (see [g:html\_expand\_tabs](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fexpand%5Ftabs)). When 1 (not recommended), the `\<pre\>` tags are omitted, and a plain `\<div\>` is used instead. Whitespace is replaced by a series of &nbsp; character references, and `\<br\>` is used to end each line. This is another way to allow text in the generated HTML is wrap (see [g:html\_pre\_wrap](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fpre%5Fwrap)) which also works in old browsers, but may cause noticeable differences between Vim's display and the rendered page generated by 2html.vim.

:let g:html_no_pre = 1

`g:html_no_doc`Default: 0\. When 1 it doesn't generate a full HTML document with a DOCTYPE, `\<head\>`,`\<body\>`, etc. If [g:html\_use\_css](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fuse%5Fcss) is enabled (the default) you'll have to define the CSS manually. The [g:html\_dynamic\_folds](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fdynamic%5Ffolds) and [g:html\_line\_ids](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fline%5Fids)settings (off by default) also insert some JavaScript.

`g:html_no_links`Default: 0\. Don't generate `\<a\>` tags for text that looks like an URL.

`g:html_no_modeline`Default: 0\. Don't generate a modeline disabling folding.

`g:html_expand_tabs`Default: 0 if ['tabstop'](https://neovim.io/doc/user/options.html#'tabstop') is 8, ['expandtab'](https://neovim.io/doc/user/options.html#'expandtab') is 0, ['vartabstop'](https://neovim.io/doc/user/options.html#'vartabstop') is not in use, and no fold column or line numbers occur in the generated HTML; 1 otherwise. When 1, `\<Tab\>` characters in the buffer text are replaced with an appropriate number of space characters, or &nbsp; references if [g:html\_no\_pre](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fno%5Fpre) is 1\. When 0, if [g:html\_no\_pre](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fno%5Fpre) is 0 or unset, `\<Tab\>` characters in the buffer text are included as-is in the generated HTML. This is useful for when you want to allow copy and paste from a browser without losing the actual whitespace in the source document. Note that this can easily break text alignment and indentation in the HTML, unless set by default.

Force [2html.vim](https://neovim.io/doc/user/syntax.html#2html.vim) to keep `\<Tab\>` characters:

:let g:html_expand_tabs = 0

Force tabs to be expanded:

:let g:html_expand_tabs = 1

`TOhtml-encoding-detect` `TOhtml-encoding`It is highly recommended to set your desired encoding with[g:html\_use\_encoding](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fuse%5Fencoding) for any content which will be placed on a web server.

If you do not specify an encoding, [2html.vim](https://neovim.io/doc/user/syntax.html#2html.vim) uses the preferred IANA name for the current value of ['fileencoding'](https://neovim.io/doc/user/options.html#'fileencoding') if set, or ['encoding'](https://neovim.io/doc/user/options.html#'encoding') if not.['encoding'](https://neovim.io/doc/user/options.html#'encoding') is always used for certain ['buftype'](https://neovim.io/doc/user/options.html#'buftype') values. ['fileencoding'](https://neovim.io/doc/user/options.html#'fileencoding') will be set to match the chosen document encoding.

Automatic detection works for the encodings mentioned specifically by name in[encoding-names](https://neovim.io/doc/user/mbyte.html#encoding-names), but TOhtml will only automatically use those encodings with wide browser support. However, you can override this to support specific encodings that may not be automatically detected by default (see options below). See \<https://www.iana.org/assignments/character-sets\> for the IANA names.

Note: By default all Unicode encodings are converted to UTF-8 with no BOM in the generated HTML, as recommended by W3C:

`g:html_use_encoding`Default: none, uses IANA name for current ['fileencoding'](https://neovim.io/doc/user/options.html#'fileencoding') as above. To overrule all automatic charset detection, set g:html\_use\_encoding to the name of the charset to be used. It is recommended to set this variable to something widely supported, like UTF-8, for anything you will be hosting on a webserver:

:let g:html_use_encoding = "UTF-8"

You can also use this option to omit the line that specifies the charset entirely, by setting g:html\_use\_encoding to an empty string (NOT recommended):

:let g:html_use_encoding = ""

To go back to the automatic mechanism, delete the [g:html\_use\_encoding](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fuse%5Fencoding)variable:

:unlet g:html_use_encoding

`g:html_encoding_override`Default: none, autoload/tohtml.vim contains default conversions for encodings mentioned by name at [encoding-names](https://neovim.io/doc/user/mbyte.html#encoding-names). This option allows [2html.vim](https://neovim.io/doc/user/syntax.html#2html.vim) to detect the correct ['fileencoding'](https://neovim.io/doc/user/options.html#'fileencoding') when you specify an encoding with [g:html\_use\_encoding](https://neovim.io/doc/user/syntax.html#g%3Ahtml%5Fuse%5Fencoding) which is not in the default list of conversions.

This is a dictionary of charset-encoding pairs that will replace existing pairs automatically detected by TOhtml, or supplement with new pairs.

Detect the HTML charset "windows-1252" as the encoding "8bit-cp1252":

:let g:html_encoding_override = {'windows-1252': '8bit-cp1252'}

`g:html_charset_override`Default: none, autoload/tohtml.vim contains default conversions for encodings mentioned by name at [encoding-names](https://neovim.io/doc/user/mbyte.html#encoding-names) and which have wide browser support. This option allows [2html.vim](https://neovim.io/doc/user/syntax.html#2html.vim) to detect the HTML charset for any['fileencoding'](https://neovim.io/doc/user/options.html#'fileencoding') or ['encoding'](https://neovim.io/doc/user/options.html#'encoding') which is not detected automatically. You can also use it to override specific existing encoding-charset pairs. For example, TOhtml will by default use UTF-8 for all Unicode/UCS encodings. To use UTF-16 and UTF-32 instead, use:

:let g:html_charset_override = {'ucs-4': 'UTF-32', 'utf-16': 'UTF-16'}

Note that documents encoded in either UTF-32 or UTF-16 have known compatibility problems with some major browsers.

`g:html_font`Default: "monospace" You can specify the font or fonts used in the converted document using g:html\_font. If this option is set to a string, then the value will be surrounded with single quotes. If this option is set to a list then each list item is surrounded by single quotes and the list is joined with commas. Either way, "monospace" is added as the fallback generic family name and the entire result used as the font family (using CSS) or font face (if not using CSS). Examples:

" font-family: 'Consolas', monospace;
:let g:html_font = "Consolas"
" font-family: 'DejaVu Sans Mono', 'Consolas', monospace;
:let g:html_font = ["DejaVu Sans Mono", "Consolas"]

`convert-to-XML` `convert-to-XHTML` `g:html_use_xhtml`Default: 0\. When 0, generate standard HTML 4.01 (strict when possible). When 1, generate XHTML 1.0 instead (XML compliant HTML).

:let g:html_use_xhtml = 1

`b:current_syntax-variable`Vim stores the name of the syntax that has been loaded in the "b:current\_syntax" variable. You can use this if you want to load other settings, depending on which syntax is active. Example:

:au BufReadPost * if b:current_syntax == "csh"
:au BufReadPost *   do-some-things
:au BufReadPost * endif

### ABEL [abel.vim](#abel.vim) [ft-abel-syntax](#ft-abel-syntax)

ABEL highlighting provides some user-defined options. To enable them, assign any value to the respective variable. Example:

:let abel_obsolete_ok=1

To disable them use ":unlet". Example:

:unlet abel_obsolete_ok

Variable Highlight

abel\_obsolete\_ok obsolete keywords are statements, not errors abel\_cpp\_comments\_illegal do not interpret '//' as inline comment leader

### ADA

The ant syntax file provides syntax highlighting for javascript and python by default. Syntax highlighting for other script languages can be installed by the function AntSyntaxScript(), which takes the tag name as first argument and the script syntax file name as second argument. Example:

:call AntSyntaxScript('perl', 'perl.vim')

will install syntax perl highlighting for the following ant code

\<script language = 'perl'\>\<![CDATA[
    # everything inside is highlighted as perl
]]\>\</script\>

See [mysyntaxfile-add](https://neovim.io/doc/user/syntax.html#mysyntaxfile-add) for installing script languages permanently.

The apache syntax file provides syntax highlighting for Apache HTTP server version 2.2.3.

Files matching "\*.i" could be Progress or Assembly. If the automatic detection doesn't work for you, or you don't edit Progress at all, use this in your startup vimrc:

:let filetype_i = "asm"

Replace "asm" with the type of assembly you use.

There are many types of assembly languages that all use the same file name extensions. Therefore you will have to select the type yourself, or add a line in the assembly file that Vim will recognize. Currently these syntax files are included: asm GNU assembly (the default) asm68k Motorola 680x0 assembly asmh8300 Hitachi H-8300 version of GNU assembly ia64 Intel Itanium 64 fasm Flat assembly ([https://flatassembler.net](https://flatassembler.net/)) masm Microsoft assembly (probably works for any 80x86) nasm Netwide assembly tasm Turbo Assembly (with opcodes 80x86 up to Pentium, and MMX) pic PIC assembly (currently for PIC16F84)

The most flexible is to add a line in your assembly file containing:

asmsyntax=nasm

Replace "nasm" with the name of the real assembly syntax. This line must be one of the first five lines in the file. No non-white text must be immediately before or after this text. Note that specifying asmsyntax=foo is equivalent to setting ft=foo in a [modeline](https://neovim.io/doc/user/options.html#modeline), and that in case of a conflict between the two settings the one from the modeline will take precedence (in particular, if you have ft=asm in the modeline, you will get the GNU syntax highlighting regardless of what is specified as asmsyntax).

The syntax type can always be overruled for a specific buffer by setting the b:asmsyntax variable:

:let b:asmsyntax = "nasm"

If b:asmsyntax is not set, either automatically or by hand, then the value of the global variable asmsyntax is used. This can be seen as a default assembly language:

:let asmsyntax = "nasm"

As a last resort, if nothing is defined, the "asm" syntax is used.

Netwide assembler (nasm.vim) optional highlighting

To enable a feature:

:let   {variable}=1|set syntax=nasm

To disable a feature:

:unlet {variable}  |set syntax=nasm

Variable Highlight

nasm\_loose\_syntax unofficial parser allowed syntax not as Error (parser dependent; not recommended) nasm\_ctx\_outside\_macro contexts outside macro not as Error nasm\_no\_warn potentially risky syntax not as ToDo

ASPPERL and ASPVBS `ft-aspperl-syntax` `ft-aspvbs-syntax`

`*.asp` and `*.asa` files could be either Perl or Visual Basic script. Since it's hard to detect this you can set two global variables to tell Vim what you are using. For Perl script use:

:let g:filetype_asa = "aspperl"
:let g:filetype_asp = "aspperl"

For Visual Basic use:

:let g:filetype_asa = "aspvbs"
:let g:filetype_asp = "aspvbs"

### BAAN [baan.vim](#baan.vim) [baan-syntax](#baan-syntax)

The baan.vim gives syntax support for BaanC of release BaanIV up to SSA ERP LN for both 3 GL and 4 GL programming. Large number of standard defines/constants are supported.

Some special violation of coding standards will be signalled when one specify in ones [init.vim](https://neovim.io/doc/user/starting.html#init.vim):

let baan_code_stds=1

`baan-folding`

Syntax folding can be enabled at various levels through the variables mentioned below (Set those in your [init.vim](https://neovim.io/doc/user/starting.html#init.vim)). The more complex folding on source blocks and SQL can be CPU intensive.

To allow any folding and enable folding at function level use:

let baan_fold=1

Folding can be enabled at source block level as if, while, for ,... The indentation preceding the begin/end keywords has to match (spaces are not considered equal to a tab).

let baan_fold_block=1

Folding can be enabled for embedded SQL blocks as SELECT, SELECTDO, SELECTEMPTY, ... The indentation preceding the begin/end keywords has to match (spaces are not considered equal to a tab).

let baan_fold_sql=1

Note: Block folding can result in many small folds. It is suggested to [:set](https://neovim.io/doc/user/options.html#%3Aset)the options ['foldminlines'](https://neovim.io/doc/user/options.html#'foldminlines') and ['foldnestmax'](https://neovim.io/doc/user/options.html#'foldnestmax') in [init.vim](https://neovim.io/doc/user/starting.html#init.vim) or use [:setlocal](https://neovim.io/doc/user/options.html#%3Asetlocal)in .../after/syntax/baan.vim (see [after-directory](https://neovim.io/doc/user/options.html#after-directory)). Eg:

set foldminlines=5
set foldnestmax=6

### BASIC [basic.vim](#basic.vim) [vb.vim](#vb.vim) [ft-basic-syntax](#ft-basic-syntax) [ft-vb-syntax](#ft-vb-syntax)

Both Visual Basic and "normal" BASIC use the extension ".bas". To detect which one should be used, Vim checks for the string "VB\_Name" in the first five lines of the file. If it is not found, filetype will be "basic", otherwise "vb". Files with the ".frm" extension will always be seen as Visual Basic.

If the automatic detection doesn't work for you or you only edit, for example, FreeBASIC files, use this in your startup vimrc:

:let filetype_bas = "freebasic"

C `c.vim` `ft-c-syntax`

A few things in C highlighting are optional. To enable them assign any value (including zero) to the respective variable. Example:

:let c_comment_strings = 1
:let c_no_bracket_error = 0

To disable them use `:unlet`. Example:

:unlet c_comment_strings

Setting the value to zero doesn't work!

An alternative is to switch to the C++ highlighting:

:set filetype=cpp

Variable Highlight

`c_gnu` GNU gcc specific items strings and numbers inside a comment`c_space_errors` trailing white space and spaces before a `\<Tab\>` `c_no_trail_space_error` ... but no trailing spaces`c_no_tab_space_error` ... but no spaces before a `\<Tab\>` `c_no_bracket_error` don't highlight {}; inside \[\] as errors`c_no_curly_error` don't highlight {}; inside \[\] and () as errors; except { and } in first column Default is to highlight them, otherwise you can't spot a missing ")".`c_curly_error` highlight a missing } by finding all pairs; this forces syncing from the start of the file, can be slow`c_no_ansi` don't do standard ANSI types and constants`c_ansi_typedefs` ... but do standard ANSI types`c_ansi_constants` ... but do standard ANSI constants`c_no_utf` don't highlight \\u and \\U in strings`c_syntax_for_h` for `*.h` files use C syntax instead of C++ and use objc syntax instead of objcpp`c_no_if0` don't highlight "#if 0" blocks as comments`c_no_cformat` don't highlight %-formats in strings`c_no_c99` don't highlight C99 standard items`c_no_c11` don't highlight C11 standard items`c_no_bsd` don't highlight BSD specific types

When ['foldmethod'](https://neovim.io/doc/user/options.html#'foldmethod') is set to "syntax" then `/* */` comments and { } blocks will become a fold. If you don't want comments to become a fold use:

:let c_no_comment_fold = 1

"#if 0" blocks are also folded, unless:

:let c_no_if0_fold = 1

If you notice highlighting errors while scrolling backwards, which are fixed when redrawing with `CTRL-L`, try setting the "c\_minlines" internal variable to a larger number:

:let c_minlines = 100

This will make the syntax synchronization start 100 lines before the first displayed line. The default value is 50 (15 when c\_no\_if0 is set). The disadvantage of using a larger number is that redrawing can become slow.

When using the "#if 0" / "#endif" comment highlighting, notice that this only works when the "#if 0" is within "c\_minlines" from the top of the window. If you have a long "#if 0" construct it will not be highlighted correctly.

To match extra items in comments, use the cCommentGroup cluster. Example:

:au Syntax c call MyCadd()
:function MyCadd()
:  syn keyword cMyItem contained Ni
:  syn cluster cCommentGroup add=cMyItem
:  hi link cMyItem Title
:endfun

ANSI constants will be highlighted with the "cConstant" group. This includes "NULL", "SIG\_IGN" and others. But not "TRUE", for example, because this is not in the ANSI standard. If you find this confusing, remove the cConstant highlighting:

:hi link cConstant NONE

If you see '{' and '}' highlighted as an error where they are OK, reset the highlighting for cErrInParen and cErrInBracket.

If you want to use folding in your C files, you can add these lines in a file in the "after" directory in ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath'). For Unix this would be \~/.config/nvim/after/syntax/c.vim.

syn sync fromstart
set foldmethod=syntax

### CH [ch.vim](#ch.vim) [ft-ch-syntax](#ft-ch-syntax)

C/C++ interpreter. Ch has similar syntax highlighting to C and builds upon the C syntax file. See [c.vim](https://neovim.io/doc/user/syntax.html#c.vim) for all the settings that are available for C.

By setting a variable you can tell Vim to use Ch syntax for `*.h` files, instead of C or C++:

:let ch_syntax_for_h = 1

### CHILL [chill.vim](#chill.vim) [ft-chill-syntax](#ft-chill-syntax)

Chill syntax highlighting is similar to C. See [c.vim](https://neovim.io/doc/user/syntax.html#c.vim) for all the settings that are available. Additionally there is:

chill\_space\_errors like c\_space\_errors chill\_comment\_string like c\_comment\_strings chill\_minlines like c\_minlines

ChangeLog supports highlighting spaces at the start of a line. If you do not like this, add following line to your vimrc:

let g:changelog_spacing_errors = 0

This works the next time you edit a changelog file. You can also use "b:changelog\_spacing\_errors" to set this per buffer (before loading the syntax file).

You can change the highlighting used, e.g., to flag the spaces as an error:

:hi link ChangelogError Error

Or to avoid the highlighting:

:hi link ChangelogError NONE

This works immediately.

Syntax highlighting of public vars in "clojure.core" is provided by default, but additional symbols can be highlighted by adding them to the[g:clojure\_syntax\_keywords](https://neovim.io/doc/user/syntax.html#g%3Aclojure%5Fsyntax%5Fkeywords) variable. The value should be a [Dictionary](https://neovim.io/doc/user/eval.html#Dictionary) of syntax group names, each containing a [List](https://neovim.io/doc/user/eval.html#List) of identifiers.

let g:clojure_syntax_keywords = {
    \   'clojureMacro': ["defproject", "defcustom"],
    \   'clojureFunc': ["string/join", "string/replace"]
    \ }

Refer to the Clojure syntax script for valid syntax group names.

There is also which is a buffer-local variant of this variable intended for use by plugin authors to highlight symbols dynamically.

By setting the variable, vars from "clojure.core" will not be highlighted by default. This is useful for namespaces that have set `(:refer-clojure :only [])`

Setting [g:clojure\_fold](https://neovim.io/doc/user/syntax.html#g%3Aclojure%5Ffold) to `1` will enable the folding of Clojure code. Any list, vector or map that extends over more than one line can be folded using the standard Vim [fold-commands](https://neovim.io/doc/user/fold.html#fold-commands).

Set this variable to `1` to enable basic highlighting of Clojure's "discard reader macro".

#_(defn foo [x]
    (println x))

Note that this option will not correctly highlight stacked discard macros (e.g. `#_#_`).

COBOL highlighting has different needs for legacy code than it does for fresh development. This is due to differences in what is being done (maintenance versus development) and other factors. To enable legacy code highlighting, add this line to your vimrc:

:let cobol_legacy_code = 1

To disable it again, use this:

:unlet cobol_legacy_code

### COLD FUSION [coldfusion.vim](#coldfusion.vim) [ft-coldfusion-syntax](#ft-coldfusion-syntax)

The ColdFusion has its own version of HTML comments. To turn on ColdFusion comment highlighting, add the following line to your startup file:

:let html_wrong_comments = 1

The ColdFusion syntax file is based on the HTML syntax file.

Variable Highlight

cpp\_no\_cpp11 don't highlight C++11 standard items cpp\_no\_cpp14 don't highlight C++14 standard items cpp\_no\_cpp17 don't highlight C++17 standard items cpp\_no\_cpp20 don't highlight C++20 standard items

This covers the shell named "csh". Note that on some systems tcsh is actually used.

Detecting whether a file is csh or tcsh is notoriously hard. Some systems symlink /bin/csh to /bin/tcsh, making it almost impossible to distinguish between csh and tcsh. In case VIM guesses wrong you can set the "filetype\_csh" variable. For using csh: `g:filetype_csh`

:let g:filetype_csh = "csh"

For using tcsh:

:let g:filetype_csh = "tcsh"

Any script with a tcsh extension or a standard tcsh filename (.tcshrc, tcsh.tcshrc, tcsh.login) will have filetype tcsh. All other tcsh/csh scripts will be classified as tcsh, UNLESS the "filetype\_csh" variable exists. If the "filetype\_csh" variable exists, the filetype will be set to the value of the variable.

Cynlib files are C++ files that use the Cynlib class library to enable hardware modelling and simulation using C++. Typically Cynlib files have a .cc or a .cpp extension, which makes it very difficult to distinguish them from a normal C++ file. Thus, to enable Cynlib highlighting for .cc files, add this line to your vimrc file:

:let cynlib_cyntax_for_cc=1

Similarly for cpp files (this extension is only usually used in Windows)

:let cynlib_cyntax_for_cpp=1

To disable these again, use this:

:unlet cynlib_cyntax_for_cc
:unlet cynlib_cyntax_for_cpp

Files matching "\*.w" could be Progress or cweb. If the automatic detection doesn't work for you, or you don't edit Progress at all, use this in your startup vimrc:

:let filetype_w = "cweb"

### DART [dart.vim](#dart.vim) [ft-dart-syntax](#ft-dart-syntax)

Dart is an object-oriented, typed, class defined, garbage collected language used for developing mobile, desktop, web, and back-end applications. Dart uses a C-like syntax derived from C, Java, and JavaScript, with features adopted from Smalltalk, Python, Ruby, and others.

More information about the language and its development environment at the official Dart language website at [https://dart.dev](https://dart.dev/)

dart.vim syntax detects and highlights Dart statements, reserved words, type declarations, storage classes, conditionals, loops, interpolated values, and comments. There is no support idioms from Flutter or any other Dart framework.

Changes, fixes? Submit an issue or pull request via:

Primary goal of this syntax file is to highlight .desktop and .directory files according to freedesktop.org standard:\<https://specifications.freedesktop.org/desktop-entry-spec/latest/\>To highlight nonstandard extensions that does not begin with X-, set

let g:desktop_enable_nonstd = 1

Note that this may cause wrong highlight. To highlight KDE-reserved features, set

let g:desktop_enable_kde = 1

g:desktop\_enable\_kde follows g:desktop\_enable\_nonstd if not supplied

### DIFF [diff.vim](#diff.vim)

The diff highlighting normally finds translated headers. This can be slow if there are very long lines in the file. To disable translations:

:let diff_translations = 0

Also see [diff-slow](https://neovim.io/doc/user/diff.html#diff-slow).

The dircolors utility highlighting definition has one option. It exists to provide compatibility with the Slackware GNU/Linux distributions version of the command. It adds a few keywords that are generally ignored by most versions. On Slackware systems, however, the utility accepts the keywords and uses them for processing. To enable the Slackware keywords add the following line to your startup file:

let dircolors_is_slackware = 1

### DOCBOOK [docbk.vim](#docbk.vim) [ft-docbk-syntax](#ft-docbk-syntax) [docbook](#docbook)

### DOCBOOK XML [docbkxml.vim](#docbkxml.vim) [ft-docbkxml-syntax](#ft-docbkxml-syntax)

### DOCBOOK SGML [docbksgml.vim](#docbksgml.vim) [ft-docbksgml-syntax](#ft-docbksgml-syntax)

There are two types of DocBook files: SGML and XML. To specify what type you are using the "b:docbk\_type" variable should be set. Vim does this for you automatically if it can recognize the type. When Vim can't guess it the type defaults to XML. You can set the type manually:

:let docbk_type = "sgml"

or:

:let docbk_type = "xml"

You need to do this before loading the syntax file, which is complicated. Simpler is setting the filetype to "docbkxml" or "docbksgml":

:set filetype=docbksgml

or:

:set filetype=docbkxml

You can specify the DocBook version:

:let docbk_ver = 3

When not set 4 is used.

Select the set of Windows Command interpreter extensions that should be supported with the variable dosbatch\_cmdextversion. For versions of Windows NT (before Windows 2000) this should have the value of 1\. For Windows 2000 and later it should be 2\. Select the version you want with the following line:

:let dosbatch_cmdextversion = 1

If this variable is not defined it defaults to a value of 2 to support Windows 2000 and later.

The original MS-DOS supports an idiom of using a double colon (::) as an alternative way to enter a comment line. This idiom can be used with the current Windows Command Interpreter, but it can lead to problems when used inside ( ... ) command blocks. You can find a discussion about this on Stack Overflow -

To allow the use of the :: idiom for comments in the Windows Command Interpreter or working with MS-DOS bat files, set the dosbatch\_colons\_comment variable to anything:

:let dosbatch_colons_comment = 1

There is an option that covers whether `*.btm` files should be detected as type "dosbatch" (MS-DOS batch files) or type "btm" (4DOS batch files). The latter is used by default. You may select the former with the following line:

:let g:dosbatch_syntax_for_btm = 1

If this variable is undefined or zero, btm syntax is selected.

Doxygen generates code documentation using a special documentation format (similar to Javadoc). This syntax script adds doxygen highlighting to c, cpp, idl and php files, and should also work with java.

There are a few of ways to turn on doxygen formatting. It can be done explicitly or in a modeline by appending '.doxygen' to the syntax of the file. Example:

:set syntax=c.doxygen

or

// vim:syntax=c.doxygen

It can also be done automatically for C, C++, C#, IDL and PHP files by setting the global or buffer-local variable load\_doxygen\_syntax. This is done by adding the following to your vimrc.

:let g:load_doxygen_syntax=1

There are a couple of variables that have an effect on syntax highlighting, and are to do with non-standard highlighting options.

Variable Default Effect

g:doxygen\_enhanced\_color g:doxygen\_enhanced\_colour 0 Use non-standard highlighting for doxygen comments.

doxygen\_my\_rendering 0 Disable rendering of HTML bold, italic and html\_my\_rendering underline.

doxygen\_javadoc\_autobrief 1 Set to 0 to disable javadoc autobrief colour highlighting.

doxygen\_end\_punctuation '\[.\]' Set to regexp match for the ending punctuation of brief

There are also some highlight groups worth mentioning as they can be useful in configuration.

Highlight Effect

doxygenErrorComment The colour of an end-comment when missing punctuation in a code, verbatim or dot section doxygenLinkError The colour of an end-comment when missing the \\endlink from a \\link section.

The DTD syntax highlighting is case sensitive by default. To disable case-sensitive highlighting, add the following line to your startup file:

:let dtd_ignore_case=1

The DTD syntax file will highlight unknown tags as errors. If this is annoying, it can be turned off by setting:

:let dtd_no_tag_errors=1

before sourcing the dtd.vim syntax file. Parameter entity names are highlighted in the definition using the 'Type' highlighting group and 'Comment' for punctuation and '%'. Parameter entity instances are highlighted using the 'Constant' highlighting group and the 'Type' highlighting group for the delimiters % and ;. This can be turned off by setting:

:let dtd_no_param_entities=1

The DTD syntax file is also included by xml.vim to highlight included dtd's.

While Eiffel is not case-sensitive, its style guidelines are, and the syntax highlighting file encourages their use. This also allows to highlight class names differently. If you want to disable case-sensitive highlighting, add the following line to your startup file:

:let eiffel_ignore_case=1

Case still matters for class names and TODO marks in comments.

Conversely, for even stricter checks, add one of the following lines:

:let eiffel_strict=1
:let eiffel_pedantic=1

Setting eiffel\_strict will only catch improper capitalization for the five predefined words "Current", "Void", "Result", "Precursor", and "NONE", to warn against their accidental use as feature or class names.

Setting eiffel\_pedantic will enforce adherence to the Eiffel style guidelines fairly rigorously (like arbitrary mixes of upper- and lowercase letters as well as outdated ways to capitalize keywords).

If you want to use the lower-case version of "Current", "Void", "Result", and "Precursor", you can use

:let eiffel_lower_case_predef=1

instead of completely turning case-sensitive highlighting off.

Support for ISE's proposed new creation syntax that is already experimentally handled by some compilers can be enabled by:

:let eiffel_ise=1

Finally, some vendors support hexadecimal constants. To handle them, add

:let eiffel_hex_constants=1

to your startup file.

Two syntax highlighting files exist for Euphoria. One for Euphoria version 3.1.1, which is the default syntax highlighting file, and one for Euphoria version 4.0.5 or later.

The following file extensions are auto-detected as Euphoria file type:

*.e, *.eu, *.ew, *.ex, *.exu, *.exw
*.E, *.EU, *.EW, *.EX, *.EXU, *.EXW

To select syntax highlighting file for Euphoria, as well as for auto-detecting the `*.e` and `*.E` file extensions as Euphoria file type, add the following line to your startup file:

:let g:filetype_euphoria = "euphoria3"

 or

:let g:filetype_euphoria = "euphoria4"

Elixir and Euphoria share the `*.ex` file extension. If the filetype is specifically set as Euphoria with the g:filetype\_euphoria variable, or the file is determined to be Euphoria based on keywords in the file, then the filetype will be set as Euphoria. Otherwise, the filetype will default to Elixir.

Erlang is a functional programming language developed by Ericsson. Files with the following extensions are recognized as Erlang files: erl, hrl, yaws.

The BIFs (built-in functions) are highlighted by default. To disable this, put the following line in your vimrc:

:let g:erlang_highlight_bifs = 0

To enable highlighting some special atoms, put this in your vimrc:

:let g:erlang_highlight_special_atoms = 1

### ELIXIR [elixir.vim](#elixir.vim) [ft-elixir-syntax](#ft-elixir-syntax)

Elixir is a dynamic, functional language for building scalable and maintainable applications.

The following file extensions are auto-detected as Elixir file types:

*.ex, *.exs, *.eex, *.leex, *.lock

Elixir and Euphoria share the `*.ex` file extension. If the filetype is specifically set as Euphoria with the g:filetype\_euphoria variable, or the file is determined to be Euphoria based on keywords in the file, then the filetype will be set as Euphoria. Otherwise, the filetype will default to Elixir.

FlexWiki is an ASP.NET-based wiki package available at [https://www.flexwiki.com](https://www.flexwiki.com/)NOTE: This site currently doesn't work, on Wikipedia is mentioned that development stopped in 2009.

Syntax highlighting is available for the most common elements of FlexWiki syntax. The associated ftplugin script sets some buffer-local options to make editing FlexWiki pages more convenient. FlexWiki considers a newline as the start of a new paragraph, so the ftplugin sets ['tw'](https://neovim.io/doc/user/options.html#'tw')\=0 (unlimited line length),['wrap'](https://neovim.io/doc/user/options.html#'wrap') (wrap long lines instead of using horizontal scrolling), ['linebreak'](https://neovim.io/doc/user/options.html#'linebreak')(to wrap at a character in ['breakat'](https://neovim.io/doc/user/options.html#'breakat') instead of at the last char on screen), and so on. It also includes some keymaps that are disabled by default.

If you want to enable the keymaps that make "j" and "k" and the cursor keys move up and down by display lines, add this to your vimrc:

:let flexwiki_maps = 1

### FORM [form.vim](#form.vim) [ft-form-syntax](#ft-form-syntax)

The coloring scheme for syntax elements in the FORM file uses the default modes Conditional, Number, Statement, Comment, PreProc, Type, and String, following the language specifications in 'Symbolic Manipulation with FORM' by J.A.M. Vermaseren, CAN, Netherlands, 1991.

If you want to include your own changes to the default colors, you have to redefine the following syntax groups:

 formConditional

 formNumber

 formStatement

 formHeaderStatement

 formComment

 formPreProc

 formDirective

 formType

 formString

Note that the form.vim syntax file implements FORM preprocessor commands and directives per default in the same syntax group.

A predefined enhanced color mode for FORM is available to distinguish between header statements and statements in the body of a FORM program. To activate this mode define the following variable in your vimrc file

:let form_enhanced_color=1

The enhanced mode also takes advantage of additional color features for a dark gvim display. Here, statements are colored LightYellow instead of Yellow, and conditionals are LightBlue for better distinction.

Both Visual Basic and FORM use the extension ".frm". To detect which one should be used, Vim checks for the string "VB\_Name" in the first five lines of the file. If it is found, filetype will be "vb", otherwise "form".

If the automatic detection doesn't work for you or you only edit, for example, FORM files, use this in your startup vimrc:

:let filetype_frm = "form"

### FORTH [forth.vim](#forth.vim) [ft-forth-syntax](#ft-forth-syntax)

Files matching "\*.f" could be Fortran or Forth and those matching "\*.fs" could be F# or Forth. If the automatic detection doesn't work for you, or you don't edit F# or Fortran at all, use this in your startup vimrc:

:let filetype_f  = "forth"
:let filetype_fs = "forth"

### FORTRAN [fortran.vim](#fortran.vim) [ft-fortran-syntax](#ft-fortran-syntax)

Default highlighting and dialect

Highlighting appropriate for Fortran 2008 is used by default. This choice should be appropriate for most users most of the time because Fortran 2008 is almost a superset of previous versions (Fortran 2003, 95, 90, and 77).

Fortran source code form

Fortran code can be in either fixed or free source form. Note that the syntax highlighting will not be correct if the form is incorrectly set.

When you create a new fortran file, the syntax script assumes fixed source form. If you always use free source form, then

:let fortran_free_source=1

in your vimrc prior to the :syntax on command. If you always use fixed source form, then

:let fortran_fixed_source=1

in your vimrc prior to the :syntax on command.

If the form of the source code depends, in a non-standard way, upon the file extension, then it is most convenient to set fortran\_free\_source in a ftplugin file. For more information on ftplugin files, see [ftplugin](https://neovim.io/doc/user/usr%5F41.html#ftplugin). Note that this will work only if the "filetype plugin indent on" command precedes the "syntax on" command in your .vimrc file.

When you edit an existing fortran file, the syntax script will assume free source form if the fortran\_free\_source variable has been set, and assumes fixed source form if the fortran\_fixed\_source variable has been set. If neither of these variables have been set, the syntax script attempts to determine which source form has been used by examining the file extension using conventions common to the ifort, gfortran, Cray, NAG, and PathScale compilers (.f, .for, .f77 for fixed-source, .f90, .f95, .f03, .f08 for free-source). If none of this works, then the script examines the first five columns of the first 500 lines of your file. If no signs of free source form are detected, then the file is assumed to be in fixed source form. The algorithm should work in the vast majority of cases. In some cases, such as a file that begins with 500 or more full-line comments, the script may incorrectly decide that the fortran code is in fixed form. If that happens, just add a non-comment statement beginning anywhere in the first five columns of the first twenty-five lines, save (:w) and then reload (:e!) the file.

Tabs in fortran files

Tabs are not recognized by the Fortran standards. Tabs are not a good idea in fixed format fortran source code which requires fixed column boundaries. Therefore, tabs are marked as errors. Nevertheless, some programmers like using tabs. If your fortran files contain tabs, then you should set the variable fortran\_have\_tabs in your vimrc with a command such as

:let fortran_have_tabs=1

placed prior to the :syntax on command. Unfortunately, the use of tabs will mean that the syntax file will not be able to detect incorrect margins.

Syntax folding of fortran files

If you wish to use foldmethod=syntax, then you must first set the variable fortran\_fold with a command such as

:let fortran_fold=1

to instruct the syntax script to define fold regions for program units, that is main programs starting with a program statement, subroutines, function subprograms, block data subprograms, interface blocks, and modules. If you also set the variable fortran\_fold\_conditionals with a command such as

:let fortran_fold_conditionals=1

then fold regions will also be defined for do loops, if blocks, and select case constructs. If you also set the variable fortran\_fold\_multilinecomments with a command such as

:let fortran_fold_multilinecomments=1

then fold regions will also be defined for three or more consecutive comment lines. Note that defining fold regions can be slow for large files.

If fortran\_fold, and possibly fortran\_fold\_conditionals and/or fortran\_fold\_multilinecomments, have been set, then vim will fold your file if you set foldmethod=syntax. Comments or blank lines placed between two program units are not folded because they are seen as not belonging to any program unit.

More precise fortran syntax

If you set the variable fortran\_more\_precise with a command such as

:let fortran_more_precise=1

then the syntax coloring will be more precise but slower. In particular, statement labels used in do, goto and arithmetic if statements will be recognized, as will construct names at the end of a do, if, select or forall construct.

Non-default fortran dialects

The syntax script supports two Fortran dialects: f08 and F. You will probably find the default highlighting (f08) satisfactory. A few legacy constructs deleted or declared obsolescent in the 2008 standard are highlighted as todo items.

If you use F, the advantage of setting the dialect appropriately is that other legacy features excluded from F will be highlighted as todo items and that free source form will be assumed.

The dialect can be selected in various ways. If all your fortran files use the same dialect, set the global variable fortran\_dialect in your vimrc prior to your syntax on statement. The case-sensitive, permissible values of fortran\_dialect are "f08" or "F". Invalid values of fortran\_dialect are ignored.

If the dialect depends upon the file extension, then it is most convenient to set a buffer-local variable in a ftplugin file. For more information on ftplugin files, see [ftplugin](https://neovim.io/doc/user/usr%5F41.html#ftplugin). For example, if all your fortran files with an .f90 extension are written in the F subset, your ftplugin file should contain the code

let s:extfname = expand("%:e")
if s:extfname ==? "f90"
    let b:fortran_dialect="F"
else
    unlet! b:fortran_dialect
endif

Note that this will work only if the "filetype plugin indent on" command precedes the "syntax on" command in your vimrc file.

Finer control is necessary if the file extension does not uniquely identify the dialect. You can override the default dialect, on a file-by-file basis, by including a comment with the directive "fortran\_dialect=xx" (where xx=F or f08) in one of the first three lines in your file. For example, your older .f files may be legacy code but your newer ones may be F codes, and you would identify the latter by including in the first three lines of those files a Fortran comment of the form

! fortran_dialect=F

For previous versions of the syntax, you may have set fortran\_dialect to the now-obsolete values "f77", "f90", "f95", or "elf". Such settings will be silently handled as "f08". Users of "elf" may wish to experiment with "F" instead.

The syntax/fortran.vim script contains embedded comments that tell you how to comment and/or uncomment some lines to (a) activate recognition of some non-standard, vendor-supplied intrinsics and (b) to prevent features deleted or declared obsolescent in the 2008 standard from being highlighted as todo items.

Limitations

Parenthesis checking does not catch too few closing parentheses. Hollerith strings are not recognized. Some keywords may be highlighted incorrectly because Fortran90 has no reserved words.

FreeBASIC files will be highlighted differently for each of the four available dialects, "fb", "qb", "fblite" and "deprecated". See [ft-freebasic-plugin](https://neovim.io/doc/user/filetype.html#ft-freebasic-plugin)for how to select the correct dialect.

Highlighting is further configurable via the following variables.

Variable Highlight

 disable multiline comment folding`freebasic_operators` non-alpha operators`freebasic_space_errors` trailing white space and spaces before a `\<Tab\>` `freebasic_type_suffixes` QuickBASIC style type suffixes

### FVWM CONFIGURATION FILES [fvwm.vim](#fvwm.vim) [ft-fvwm-syntax](#ft-fvwm-syntax)

In order for Vim to recognize Fvwm configuration files that do not match the patterns `fvwmrc` or `fvwm2rc` , you must put additional patterns appropriate to your system in your myfiletypes.vim file. For these patterns, you must set the variable "b:fvwm\_version" to the major version number of Fvwm, and the ['filetype'](https://neovim.io/doc/user/options.html#'filetype') option to fvwm.

For example, to make Vim identify all files in /etc/X11/fvwm2/ as Fvwm2 configuration files, add the following:

:au! BufNewFile,BufRead /etc/X11/fvwm2/*  let b:fvwm_version = 2 |
                                       \ set filetype=fvwm

### GSP [gsp.vim](#gsp.vim) [ft-gsp-syntax](#ft-gsp-syntax)

The default coloring style for GSP pages is defined by [html.vim](https://neovim.io/doc/user/syntax.html#html.vim), and the coloring for java code (within java tags or inline between backticks) is defined by [java.vim](https://neovim.io/doc/user/syntax.html#java.vim). The following HTML groups defined in [html.vim](https://neovim.io/doc/user/syntax.html#html.vim)are redefined to incorporate and highlight inline java code:

 htmlString htmlValue htmlEndTag htmlTag htmlTagN

Highlighting should look fine most of the places where you'd see inline java code, but in some special cases it may not. To add another HTML group where you will have inline java code where it does not highlight correctly, just copy the line you want from [html.vim](https://neovim.io/doc/user/syntax.html#html.vim) and add gspJava to the contains clause.

The backticks for inline java are highlighted according to the htmlError group to make them easier to see.

The groff syntax file is a wrapper for [nroff.vim](https://neovim.io/doc/user/syntax.html#nroff.vim), see the notes under that heading for examples of use and configuration. The purpose of this wrapper is to set up groff syntax extensions by setting the filetype from a [modeline](https://neovim.io/doc/user/options.html#modeline) or in a personal filetype definitions file (see [filetype.txt](https://neovim.io/doc/user/filetype.html#filetype.txt)).

The Haskell syntax files support plain Haskell code as well as literate Haskell code, the latter in both Bird style and TeX style. The Haskell syntax highlighting will also highlight C preprocessor directives.

If you want to highlight delimiter characters (useful if you have a light-coloured background), add to your vimrc:

:let hs_highlight_delimiters = 1

To treat True and False as keywords as opposed to ordinary identifiers, add:

:let hs_highlight_boolean = 1

To also treat the names of primitive types as keywords:

:let hs_highlight_types = 1

And to treat the names of even more relatively common types as keywords:

:let hs_highlight_more_types = 1

If you want to highlight the names of debugging functions, put in your vimrc:

:let hs_highlight_debug = 1

The Haskell syntax highlighting also highlights C preprocessor directives, and flags lines that start with # but are not valid directives as erroneous. This interferes with Haskell's syntax for operators, as they may start with #. If you want to highlight those as operators as opposed to errors, put in your vimrc:

:let hs_allow_hash_operator = 1

The syntax highlighting for literate Haskell code will try to automatically guess whether your literate Haskell code contains TeX markup or not, and correspondingly highlight TeX constructs or nothing at all. You can override this globally by putting in your vimrc

:let lhs_markup = none

for no highlighting at all, or

:let lhs_markup = tex

to force the highlighting to always try to highlight TeX markup. For more flexibility, you may also use buffer local versions of this variable, so e.g.

:let b:lhs_markup = tex

will force TeX highlighting for a particular buffer. It has to be set before turning syntax highlighting on for the buffer or loading a file.

The coloring scheme for tags in the HTML file works as follows.

The \<\> of opening tags are colored differently than the \</\> of a closing tag. This is on purpose! For opening tags the 'Function' color is used, while for closing tags the 'Identifier' color is used (See syntax.vim to check how those are defined for you)

Known tag names are colored the same way as statements in C. Unknown tag names are colored with the same color as the \<\> or \</\> respectively which makes it easy to spot errors

Note that the same is true for argument (or attribute) names. Known attribute names are colored differently than unknown ones.

Some HTML tags are used to change the rendering of text. The following tags are recognized by the html.vim syntax coloring file and change the way normal text is shown: `\<B\>` `\<I\>` `\<U\>` `\<EM\>` `\<STRONG\>` (`\<EM\>` is used as an alias for `\<I\>`, while `\<STRONG\>` as an alias for `\<B\>`), `\<H1\>` \- `\<H6\>`, `\<HEAD\>`, `\<TITLE\>` and `\<A\>`, but only if used as a link (that is, it must include a href as in \<A href="somefile.html"\>).

If you want to change how such text is rendered, you must redefine the following syntax groups:

 htmlBold

 htmlBoldUnderline

 htmlBoldUnderlineItalic

 htmlUnderline

 htmlUnderlineItalic

 htmlItalic

 htmlTitle for titles

 htmlH1 - htmlH6 for headings

To make this redefinition work you must redefine them all with the exception of the last two (htmlTitle and htmlH\[1-6\], which are optional) and define the following variable in your vimrc (this is due to the order in which the files are read during initialization)

:let html_my_rendering=1

If you'd like to see an example download mysyntax.vim at\<https://www.fleiner.com/vim/download.html\>

You can also disable this rendering by adding the following line to your vimrc file:

:let html_no_rendering=1

HTML comments are rather special (see an HTML reference document for the details), and the syntax coloring scheme will highlight all errors. However, if you prefer to use the wrong style (starts with \<!-- and ends with --\>) you can define

:let html_wrong_comments=1

JavaScript and Visual Basic embedded inside HTML documents are highlighted as 'Special' with statements, comments, strings and so on colored as in standard programming languages. Note that only JavaScript and Visual Basic are currently supported, no other scripting language has been added yet.

Embedded and inlined cascading style sheets (CSS) are highlighted too.

There are several html preprocessor languages out there. html.vim has been written such that it should be trivial to include it. To do so add the following two lines to the syntax coloring file for that language (the example comes from the asp.vim file):

runtime! syntax/html.vim
syn cluster htmlPreproc add=asp

Now you just need to make sure that you add all regions that contain the preprocessor language to the cluster htmlPreproc.

`html-folding`The HTML syntax file provides syntax [folding](https://neovim.io/doc/user/fold.html#folding) (see [:syn-fold](https://neovim.io/doc/user/syntax.html#%3Asyn-fold)) between start and end tags. This can be turned on by

:let g:html_syntax_folding = 1
:set foldmethod=syntax

Note: Syntax folding might slow down syntax highlighting significantly, especially for large files.

HTML/OS (by Aestiva) `htmlos.vim` `ft-htmlos-syntax`

The coloring scheme for HTML/OS works as follows:

Functions and variable names are the same color by default, because VIM doesn't specify different colors for Functions and Identifiers. To change this (which is recommended if you want function names to be recognizable in a different color) you need to add the following line to your vimrc:

:hi Function cterm=bold ctermfg=LightGray

Of course, the ctermfg can be a different color if you choose.

Another issues that HTML/OS runs into is that there is no special filetype to signify that it is a file with HTML/OS coding. You can change this by opening a file and turning on HTML/OS syntax by doing the following:

:set syntax=htmlos

Lastly, it should be noted that the opening and closing characters to begin a block of HTML/OS code can either be \<\< or \[\[ and \>\> or \]\], respectively.

Highlighting for the Intel Itanium 64 assembly language. See [asm.vim](https://neovim.io/doc/user/syntax.html#asm.vim) for how to recognize this filetype.

To have `*.inc` files be recognized as IA64, add this to your vimrc file:

:let g:filetype_inc = "ia64"

### INFORM [inform.vim](#inform.vim) [ft-inform-syntax](#ft-inform-syntax)

Inform highlighting includes symbols provided by the Inform Library, as most programs make extensive use of it. If do not wish Library symbols to be highlighted add this to your vim startup:

:let inform_highlight_simple=1

By default it is assumed that Inform programs are Z-machine targeted, and highlights Z-machine assembly language symbols appropriately. If you intend your program to be targeted to a Glulx/Glk environment you need to add this to your startup sequence:

:let inform_highlight_glulx=1

This will highlight Glulx opcodes instead, and also adds glk() to the set of highlighted system functions.

The Inform compiler will flag certain obsolete keywords as errors when it encounters them. These keywords are normally highlighted as errors by Vim. To prevent such error highlighting, you must add this to your startup sequence:

:let inform_suppress_obsolete=1

By default, the language features highlighted conform to Compiler version 6.30 and Library version 6.11\. If you are using an older Inform development environment, you may with to add this to your startup sequence:

:let inform_highlight_old=1

### IDL [idl.vim](#idl.vim) [idl-syntax](#idl-syntax)

IDL (Interface Definition Language) files are used to define RPC calls. In Microsoft land, this is also used for defining COM interfaces and calls.

IDL's structure is simple enough to permit a full grammar based approach to rather than using a few heuristics. The result is large and somewhat repetitive but seems to work.

There are some Microsoft extensions to idl files that are here. Some of them are disabled by defining idl\_no\_ms\_extensions.

The more complex of the extensions are disabled by defining idl\_no\_extensions.

idl\_no\_ms\_extensions Disable some of the Microsoft specific extensions idl\_no\_extensions Disable complex extensions idlsyntax\_showerror Show IDL errors (can be rather intrusive, but quite helpful) idlsyntax\_showerror\_soft Use softer colours by default for errors

The java.vim syntax highlighting file offers several options:

In Java 1.0.2 it was never possible to have braces inside parens, so this was flagged as an error. Since Java 1.1 this is possible (with anonymous classes), and therefore is no longer marked as an error. If you prefer the old way, put the following line into your vim startup file:

:let java_mark_braces_in_parens_as_errors=1

All identifiers in java.lang.\* are always visible in all classes. To highlight them use:

:let java_highlight_java_lang_ids=1

You can also highlight identifiers of most standard Java packages if you download the javaid.vim script at \<https://www.fleiner.com/vim/download.html\>. If you prefer to only highlight identifiers of a certain package, say java.io use the following:

:let java_highlight_java_io=1

Check the javaid.vim file for a list of all the packages that are supported.

Function names are not highlighted, as the way to find functions depends on how you write Java code. The syntax file knows two possible ways to highlight functions:

If you write function declarations that are always indented by either a tab, 8 spaces or 2 spaces you may want to set

:let java_highlight_functions="indent"

However, if you follow the Java guidelines about how functions and classes are supposed to be named (with respect to upper and lowercase), use

:let java_highlight_functions="style"

If both options do not work for you, but you would still want function declarations to be highlighted create your own definitions by changing the definitions in java.vim or by creating your own java.vim which includes the original one and then adds the code to highlight functions.

In Java 1.1 the functions System.out.println() and System.err.println() should only be used for debugging. Therefore it is possible to highlight debugging statements differently. To do this you must add the following definition in your startup file:

:let java_highlight_debug=1

The result will be that those statements are highlighted as 'Special' characters. If you prefer to have them highlighted differently you must define new highlightings for the following groups.: Debug, DebugSpecial, DebugString, DebugBoolean, DebugType which are used for the statement itself, special characters used in debug strings, strings, boolean constants and types (this, super) respectively. I have opted to choose another background for those statements.

Javadoc is a program that takes special comments out of Java program files and creates HTML pages. The standard configuration will highlight this HTML code similarly to HTML files (see [html.vim](https://neovim.io/doc/user/syntax.html#html.vim)). You can even add Javascript and CSS inside this code (see below). There are four differences however: 1\. The title (all characters up to the first '.' which is followed by some white space or up to the first '@') is colored differently (to change the color change the group CommentTitle). 2\. The text is colored as 'Comment'. 3\. HTML comments are colored as 'Special' 4\. The special Javadoc tags (@see, @param, ...) are highlighted as specials and the argument (for @see, @param, @exception) as Function. To turn this feature off add the following line to your startup file:

:let java_ignore_javadoc=1

If you use the special Javadoc comment highlighting described above you can also turn on special highlighting for Javascript, visual basic scripts and embedded CSS (stylesheets). This makes only sense if you actually have Javadoc comments that include either Javascript or embedded CSS. The options to use are

:let java_javascript=1
:let java_css=1
:let java_vb=1

In order to highlight nested parens with different colors define colors for javaParen, javaParen1 and javaParen2, for example with

:hi link javaParen Comment

or

:hi javaParen ctermfg=blue guifg=#0000ff

If you notice highlighting errors while scrolling backwards, which are fixed when redrawing with `CTRL-L`, try setting the "java\_minlines" internal variable to a larger number:

:let java_minlines = 50

This will make the syntax synchronization start 50 lines before the first displayed line. The default value is 10\. The disadvantage of using a larger number is that redrawing can become slow.

The json syntax file provides syntax highlighting with conceal support by default. To disable concealment:

let g:vim_json_conceal = 0

To disable syntax highlighting of errors:

let g:vim_json_warnings = 0

### LACE [lace.vim](#lace.vim) [ft-lace-syntax](#ft-lace-syntax)

Lace (Language for Assembly of Classes in Eiffel) is case insensitive, but the style guide lines are not. If you prefer case insensitive highlighting, just define the vim variable 'lace\_case\_insensitive' in your startup file:

:let lace_case_insensitive=1

### LEX [lex.vim](#lex.vim) [ft-lex-syntax](#ft-lex-syntax)

Lex uses brute-force synchronizing as the "^%%$" section delimiter gives no clue as to what section follows. Consequently, the value for

:syn sync minlines=300

may be changed by the user if they are experiencing synchronization difficulties (such as may happen with large lex files).

To highlight deprecated functions as errors, add in your vimrc:

:let g:lifelines_deprecated = 1

The lisp syntax highlighting provides two options:

g:lisp_instring : If it exists, then "(...)" strings are highlighted
                  as if the contents of the string were lisp.
                  Useful for AutoLisp.
g:lisp_rainbow  : If it exists and is nonzero, then differing levels
                  of parenthesization will receive different
                  highlighting.

The g:lisp\_rainbow option provides 10 levels of individual colorization for the parentheses and backquoted parentheses. Because of the quantity of colorization levels, unlike non-rainbow highlighting, the rainbow mode specifies its highlighting using ctermfg and guifg, thereby bypassing the usual color scheme control using standard highlighting groups. The actual highlighting used depends on the dark/bright setting (see ['bg'](https://neovim.io/doc/user/options.html#'bg')).

There are two options for the lite syntax highlighting.

If you like SQL syntax highlighting inside Strings, use this:

:let lite_sql_query = 1

For syncing, minlines defaults to 100\. If you prefer another value, you can set "lite\_minlines" to the value you desire. Example:

:let lite_minlines = 200

### LPC [lpc.vim](#lpc.vim) [ft-lpc-syntax](#ft-lpc-syntax)

LPC stands for a simple, memory-efficient language: Lars Pensjö C. The file name of LPC is usually `*.c`. Recognizing these files as LPC would bother users writing only C programs. If you want to use LPC syntax in Vim, you should set a variable in your vimrc file:

:let lpc_syntax_for_c = 1

If it doesn't work properly for some particular C or LPC files, use a modeline. For a LPC file:

// vim:set ft=lpc:

For a C file that is recognized as LPC:

// vim:set ft=c:

If you don't want to set the variable, use the modeline in EVERY LPC file.

There are several implementations for LPC, we intend to support most widely used ones. Here the default LPC syntax is for MudOS series, for MudOS v22 and before, you should turn off the sensible modifiers, and this will also assert the new efuns after v22 to be invalid, don't set this variable when you are using the latest version of MudOS:

:let lpc_pre_v22 = 1

For LpMud 3.2 series of LPC:

:let lpc_compat_32 = 1

For LPC4 series of LPC:

:let lpc_use_lpc4_syntax = 1

For uLPC series of LPC: uLPC has been developed to Pike, so you should use Pike syntax instead, and the name of your source file should be `*.pike`

The Lua syntax file can be used for versions 4.0, 5.0, 5.1 and 5.2 (5.2 is the default). You can select one of these versions using the global variables lua\_version and lua\_subversion. For example, to activate Lua 5.1 syntax highlighting, set the variables like this:

:let lua_version = 5
:let lua_subversion = 1

### MAIL [mail.vim](#mail.vim) [ft-mail.vim](#ft-mail.vim)

Vim highlights all the standard elements of an email (headers, signatures, quoted text and URLs / email addresses). In keeping with standard conventions, signatures begin in a line containing only "--" followed optionally by whitespaces and end with a newline.

Vim treats lines beginning with '\]', '}', '|', '\>' or a word followed by '\>' as quoted text. However Vim highlights headers and signatures in quoted text only if the text is quoted with '\>' (optionally followed by one space).

By default mail.vim synchronises syntax to 100 lines before the first displayed line. If you have a slow machine, and generally deal with emails with short headers, you can change this to a smaller value:

:let mail_minlines = 30

### MAKE [make.vim](#make.vim) [ft-make-syntax](#ft-make-syntax)

In makefiles, commands are usually highlighted to make it easy for you to spot errors. However, this may be too much coloring for you. You can turn this feature off by using:

:let make_no_commands = 1

### MAPLE [maple.vim](#maple.vim) [ft-maple-syntax](#ft-maple-syntax)

Maple V, by Waterloo Maple Inc, supports symbolic algebra. The language supports many packages of functions which are selectively loaded by the user. The standard set of packages' functions as supplied in Maple V release 4 may be highlighted at the user's discretion. Users may place in their vimrc file:

:let mvpkg_all= 1

to get all package functions highlighted, or users may select any subset by choosing a variable/package from the table below and setting that variable to 1, also in their vimrc file (prior to sourcing $VIMRUNTIME/syntax/syntax.vim).

 Table of Maple V Package Function Selectors

mv_DEtools         mv_genfunc        mv_networks        mv_process
mv_Galois         mv_geometry        mv_numapprox        mv_simplex
mv_GaussInt         mv_grobner        mv_numtheory        mv_stats
mv_LREtools         mv_group        mv_orthopoly        mv_student
mv_combinat         mv_inttrans        mv_padic        mv_sumtools
mv_combstruct mv_liesymm        mv_plots        mv_tensor
mv_difforms         mv_linalg        mv_plottools        mv_totorder
mv_finance         mv_logic        mv_powseries

### MARKDOWN [ft-markdown-syntax](#ft-markdown-syntax)

If you have long regions there might be wrong highlighting. At the cost of slowing down displaying, you can have the engine look further back to sync on the start of a region, for example 500 lines:

:let g:markdown_minlines = 500

### MATHEMATICA [mma.vim](#mma.vim) [ft-mma-syntax](#ft-mma-syntax) [ft-mathematica-syntax](#ft-mathematica-syntax)

Empty `*.m` files will automatically be presumed to be Matlab files unless you have the following in your vimrc:

let filetype_m = "mma"

### MOO [moo.vim](#moo.vim) [ft-moo-syntax](#ft-moo-syntax)

If you use C-style comments inside expressions and find it mangles your highlighting, you may want to use extended (slow!) matches for C-style comments:

:let moo_extended_cstyle_comments = 1

To disable highlighting of pronoun substitution patterns inside strings:

:let moo_no_pronoun_sub = 1

To disable highlighting of the regular expression operator '%|', and matching '%(' and '%)' inside strings:

:let moo_no_regexp = 1

Unmatched double quotes can be recognized and highlighted as errors:

:let moo_unmatched_quotes = 1

To highlight builtin properties (.name, .location, .programmer etc.):

:let moo_builtin_properties = 1

Unknown builtin functions can be recognized and highlighted as errors. If you use this option, add your own extensions to the mooKnownBuiltinFunction group. To enable this option:

:let moo_unknown_builtin_functions = 1

An example of adding sprintf() to the list of known builtin functions:

:syn keyword mooKnownBuiltinFunction sprintf contained

### MSQL [msql.vim](#msql.vim) [ft-msql-syntax](#ft-msql-syntax)

There are two options for the msql syntax highlighting.

If you like SQL syntax highlighting inside Strings, use this:

:let msql_sql_query = 1

For syncing, minlines defaults to 100\. If you prefer another value, you can set "msql\_minlines" to the value you desire. Example:

:let msql_minlines = 200

### N1QL [n1ql.vim](#n1ql.vim) [ft-n1ql-syntax](#ft-n1ql-syntax)

N1QL is a SQL-like declarative language for manipulating JSON documents in Couchbase Server databases.

Vim syntax highlights N1QL statements, keywords, operators, types, comments, and special values. Vim ignores syntactical elements specific to SQL or its many dialects, like COLUMN or CHAR, that don't exist in N1QL.

There is one option for NCF syntax highlighting.

If you want to have unrecognized (by ncf.vim) statements highlighted as errors, use this:

:let ncf_highlight_unknowns = 1

If you don't want to highlight these errors, leave it unset.

The nroff syntax file works with AT&T n/troff out of the box. You need to activate the GNU groff extra features included in the syntax file before you can use them.

For example, Linux and BSD distributions use groff as their default text processing package. In order to activate the extra syntax highlighting features for groff, arrange for files to be recognized as groff (see[ft-groff-syntax](https://neovim.io/doc/user/syntax.html#ft-groff-syntax)) or add the following option to your start-up files:

:let nroff_is_groff = 1

Groff is different from the old AT&T n/troff that you may still find in Solaris. Groff macro and request names can be longer than 2 characters and there are extensions to the language primitives. For example, in AT&T troff you access the year as a 2-digit number with the request \\(yr. In groff you can use the same request, recognized for compatibility, or you can use groff's native syntax, \\\[yr\]. Furthermore, you can use a 4-digit year directly: \\\[year\]. Macro requests can be longer than 2 characters, for example, GNU mm accepts the requests ".VERBON" and ".VERBOFF" for creating verbatim environments.

In order to obtain the best formatted output g/troff can give you, you should follow a few simple rules about spacing and punctuation.

1\. Do not leave empty spaces at the end of lines.

2\. Leave one space and one space only after an end-of-sentence period, exclamation mark, etc.

3\. For reasons stated below, it is best to follow all period marks with a carriage return.

The reason behind these unusual tips is that g/n/troff have a line breaking algorithm that can be easily upset if you don't follow the rules given above.

Unlike TeX, troff fills text line-by-line, not paragraph-by-paragraph and, furthermore, it does not have a concept of glue or stretch, all horizontal and vertical space input will be output as is.

Therefore, you should be careful about not using more space between sentences than you intend to have in your final document. For this reason, the common practice is to insert a carriage return immediately after all punctuation marks. If you want to have "even" text in your final processed output, you need to maintain regular spacing in the input text. To mark both trailing spaces and two or more spaces after a punctuation as an error, use:

:let nroff_space_errors = 1

Another technique to detect extra spacing and other errors that will interfere with the correct typesetting of your file, is to define an eye-catching highlighting definition for the syntax groups "nroffDefinition" and "nroffDefSpecial" in your configuration files. For example:

hi def nroffDefinition cterm=italic gui=reverse
hi def nroffDefSpecial cterm=italic,bold gui=reverse,bold

If you want to navigate preprocessor entries in your source file as easily as with section markers, you can activate the following option in your vimrc file:

let b:preprocs_as_sections = 1

As well, the syntax file adds an extra paragraph marker for the extended paragraph macro (.XP) in the ms package.

Finally, there is a [groff.vim](https://neovim.io/doc/user/syntax.html#groff.vim) syntax file that can be used for enabling groff syntax highlighting either on a file basis or globally by default.

The OCaml syntax file handles files having the following prefixes: .ml, .mli, .mll and .mly. By setting the following variable

:let ocaml_revised = 1

you can switch from standard OCaml-syntax to revised syntax as supported by the camlp4 preprocessor. Setting the variable

:let ocaml_noend_error = 1

prevents highlighting of "end" as error, which is useful when sources contain very long structures that Vim does not synchronize anymore.

The PApp syntax file handles .papp files and, to a lesser extent, .pxml and .pxsl files which are all a mixture of perl/xml/html/other using xml as the top-level file format. By default everything inside phtml or pxml sections is treated as a string with embedded preprocessor commands. If you set the variable:

:let papp_include_html=1

in your startup file it will try to syntax-highlight html code inside phtml sections, but this is relatively slow and much too colourful to be able to edit sensibly. ;)

The newest version of the papp.vim syntax file can usually be found at[http://papp.plan9.de](http://papp.plan9.de/).

Files matching "\*.p" could be Progress or Pascal and those matching "\*.pp" could be Puppet or Pascal. If the automatic detection doesn't work for you, or you only edit Pascal files, use this in your startup vimrc:

:let filetype_p  = "pascal"
:let filetype_pp = "pascal"

The Pascal syntax file has been extended to take into account some extensions provided by Turbo Pascal, Free Pascal Compiler and GNU Pascal Compiler. Delphi keywords are also supported. By default, Turbo Pascal 7.0 features are enabled. If you prefer to stick with the standard Pascal keywords, add the following line to your startup file:

:let pascal_traditional=1

To switch on Delphi specific constructions (such as one-line comments, keywords, etc):

:let pascal_delphi=1

The option pascal\_symbol\_operator controls whether symbol operators such as +,`*`, .., etc. are displayed using the Operator color or not. To colorize symbol operators, add the following line to your startup file:

:let pascal_symbol_operator=1

Some functions are highlighted by default. To switch it off:

:let pascal_no_functions=1

Furthermore, there are specific variables for some compilers. Besides pascal\_delphi, there are pascal\_gpc and pascal\_fpc. Default extensions try to match Turbo Pascal.

:let pascal_gpc=1

or

:let pascal_fpc=1

To ensure that strings are defined on a single line, you can define the pascal\_one\_line\_string variable.

:let pascal_one_line_string=1

If you dislike `\<Tab\>` chars, you can set the pascal\_no\_tabs variable. Tabs will be highlighted as Error.

:let pascal_no_tabs=1

### PERL [perl.vim](#perl.vim) [ft-perl-syntax](#ft-perl-syntax)

There are a number of possible options to the perl syntax highlighting.

Inline POD highlighting is now turned on by default. If you don't wish to have the added complexity of highlighting POD embedded within Perl files, you may set the 'perl\_include\_pod' option to 0:

:let perl_include_pod = 0

To reduce the complexity of parsing (and increase performance) you can switch off two elements in the parsing of variable names and contents. To handle package references in variable and function names not differently from the rest of the name (like 'PkgName::' in '$PkgName::VarName'):

:let perl_no_scope_in_variables = 1

(In Vim 6.x it was the other way around: "perl\_want\_scope\_in\_variables" enabled it.)

If you do not want complex things like `@{${"foo"}}` to be parsed:

:let perl_no_extended_vars = 1

(In Vim 6.x it was the other way around: "perl\_extended\_vars" enabled it.)

The coloring strings can be changed. By default strings and qq friends will be highlighted like the first line. If you set the variable perl\_string\_as\_statement, it will be highlighted as in the second line.

 "hello world!"; qq|hello world|; ^^^^^^^^^^^^^^NN^^^^^^^^^^^^^^^N (unlet perl\_string\_as\_statement) S^^^^^^^^^^^^SNNSSS^^^^^^^^^^^SN (let perl\_string\_as\_statement)

(^ = perlString, S = perlStatement, N = None at all)

The syncing has 3 options. The first two switch off some triggering of synchronization and should only be needed in case it fails to work properly. If while scrolling all of a sudden the whole screen changes color completely then you should try and switch off one of those. Let me know if you can figure out the line that causes the mistake.

One triggers on "^\\s\*sub\\s\*" and the other on "^\[$@%\]" more or less.

:let perl_no_sync_on_sub
:let perl_no_sync_on_global_var

Below you can set the maximum distance VIM should look for starting points for its attempts in syntax highlighting.

:let perl_sync_dist = 100

If you want to use folding with perl, set perl\_fold:

:let perl_fold = 1

If you want to fold blocks in if statements, etc. as well set the following:

:let perl_fold_blocks = 1

Subroutines are folded by default if 'perl\_fold' is set. If you do not want this, you can set 'perl\_nofold\_subs':

:let perl_nofold_subs = 1

Anonymous subroutines are not folded by default; you may enable their folding via 'perl\_fold\_anonymous\_subs':

:let perl_fold_anonymous_subs = 1

Packages are also folded by default if 'perl\_fold' is set. To disable this behavior, set 'perl\_nofold\_packages':

:let perl_nofold_packages = 1

PHP3 and PHP4 `php.vim` `php3.vim` `ft-php-syntax` `ft-php3-syntax`

\[Note: Previously this was called "php3", but since it now also supports php4 it has been renamed to "php"\]

There are the following options for the php syntax highlighting.

If you like SQL syntax highlighting inside Strings:

let php_sql_query = 1

For highlighting the Baselib methods:

let php_baselib = 1

Enable HTML syntax highlighting inside strings:

let php_htmlInStrings = 1

Using the old colorstyle:

let php_oldStyle = 1

Enable highlighting ASP-style short tags:

let php_asp_tags = 1

Disable short tags:

let php_noShortTags = 1

For highlighting parent error \] or ):

let php_parent_error_close = 1

For skipping a php end tag, if there exists an open ( or \[ without a closing one:

let php_parent_error_open = 1

Enable folding for classes and functions:

let php_folding = 1

Selecting syncing method:

let php_sync_method = x

x = -1 to sync by search (default), x \> 0 to sync at least x lines backwards, x = 0 to sync from start.

TeX is a typesetting language, and plaintex is the file type for the "plain" variant of TeX. If you never want your `*.tex` files recognized as plain TeX, see [ft-tex-plugin](https://neovim.io/doc/user/filetype.html#ft-tex-plugin).

This syntax file has the option

let g:plaintex_delimiters = 1

if you want to highlight brackets "\[\]" and braces "{}".

PPWizard is a preprocessor for HTML and OS/2 INF files

This syntax file has the options:

 ppwiz\_highlight\_defs : Determines highlighting mode for PPWizard's definitions. Possible values are

 ppwiz\_highlight\_defs = 1 : PPWizard #define statements retain the colors of their contents (e.g. PPWizard macros and variables).

 ppwiz\_highlight\_defs = 2 : Preprocessor #define and #evaluate statements are shown in a single color with the exception of line continuation symbols.

 The default setting for ppwiz\_highlight\_defs is 1.

 ppwiz\_with\_html : If the value is 1 (the default), highlight literal HTML code; if 0, treat HTML code like ordinary text.

There are two options for the phtml syntax highlighting.

If you like SQL syntax highlighting inside Strings, use this:

:let phtml_sql_query = 1

For syncing, minlines defaults to 100\. If you prefer another value, you can set "phtml\_minlines" to the value you desire. Example:

:let phtml_minlines = 200

### POSTSCRIPT [postscr.vim](#postscr.vim) [ft-postscr-syntax](#ft-postscr-syntax)

There are several options when it comes to highlighting PostScript.

First which version of the PostScript language to highlight. There are currently three defined language versions, or levels. Level 1 is the original and base version, and includes all extensions prior to the release of level 2\. Level 2 is the most common version around, and includes its own set of extensions prior to the release of level 3\. Level 3 is currently the highest level supported. You select which level of the PostScript language you want highlighted by defining the postscr\_level variable as follows:

:let postscr_level=2

If this variable is not defined it defaults to 2 (level 2) since this is the most prevalent version currently.

Note: Not all PS interpreters will support all language features for a particular language level. In particular the %!PS-Adobe-3.0 at the start of PS files does NOT mean the PostScript present is level 3 PostScript!

If you are working with Display PostScript, you can include highlighting of Display PS language features by defining the postscr\_display variable as follows:

:let postscr_display=1

If you are working with Ghostscript, you can include highlighting of Ghostscript specific language features by defining the variable postscr\_ghostscript as follows:

:let postscr_ghostscript=1

PostScript is a large language, with many predefined elements. While it useful to have all these elements highlighted, on slower machines this can cause Vim to slow down. In an attempt to be machine friendly font names and character encodings are not highlighted by default. Unless you are working explicitly with either of these this should be ok. If you want them to be highlighted you should set one or both of the following variables:

:let postscr_fonts=1
:let postscr_encodings=1

There is a stylistic option to the highlighting of and, or, and not. In PostScript the function of these operators depends on the types of their operands - if the operands are booleans then they are the logical operators, if they are integers then they are binary operators. As binary and logical operators can be highlighted differently they have to be highlighted one way or the other. By default they are treated as logical operators. They can be highlighted as binary operators by defining the variable postscr\_andornot\_binary as follows:

:let postscr_andornot_binary=1

`ptcap.vim` `ft-printcap-syntax`PRINTCAP + TERMCAP `ft-ptcap-syntax` `ft-termcap-syntax`

This syntax file applies to the printcap and termcap databases.

In order for Vim to recognize printcap/termcap files that do not match the patterns `printcap`, or `termcap`, you must put additional patterns appropriate to your system in your [myfiletypefile](https://neovim.io/doc/user/syntax.html#myfiletypefile) file. For these patterns, you must set the variable "b:ptcap\_type" to either "print" or "term", and then the ['filetype'](https://neovim.io/doc/user/options.html#'filetype') option to ptcap.

For example, to make Vim identify all files in /etc/termcaps/ as termcap files, add the following:

:au BufNewFile,BufRead /etc/termcaps/* let b:ptcap_type = "term" |
                                    \ set filetype=ptcap

If you notice highlighting errors while scrolling backwards, which are fixed when redrawing with `CTRL-L`, try setting the "ptcap\_minlines" internal variable to a larger number:

:let ptcap_minlines = 50

(The default is 20 lines.)

Files matching "\*.w" could be Progress or cweb. If the automatic detection doesn't work for you, or you don't edit cweb at all, use this in your startup vimrc:

:let filetype_w = "progress"

The same happens for "\*.i", which could be assembly, and "\*.p", which could be Pascal. Use this if you don't use assembly and Pascal:

:let filetype_i = "progress"
:let filetype_p = "progress"

### PYTHON [python.vim](#python.vim) [ft-python-syntax](#ft-python-syntax)

There are six options to control Python syntax highlighting.

For highlighted numbers:

:let python_no_number_highlight = 1

For highlighted builtin functions:

:let python_no_builtin_highlight = 1

For highlighted standard exceptions:

:let python_no_exception_highlight = 1

For highlighted doctests and code inside:

:let python_no_doctest_highlight = 1

or

:let python_no_doctest_code_highlight = 1

The first option implies the second one.

For highlighted trailing whitespace and mix of spaces and tabs:

:let python_space_error_highlight = 1

If you want all possible Python highlighting:

:let python_highlight_all = 1

This has the same effect as setting python\_space\_error\_highlight and unsetting all the other ones.

If you use Python 2 or straddling code (Python 2 and 3 compatible), you can enforce the use of an older syntax file with support for Python 2 and up to Python 3.5.

:let python_use_python2_syntax = 1

This option will exclude all modern Python 3.6 or higher features.

Note: Only existence of these options matters, not their value. You can replace 1 above with anything.

The Quake syntax definition should work for most FPS (First Person Shooter) based on one of the Quake engines. However, the command names vary a bit between the three games (Quake, Quake 2, and Quake 3 Arena) so the syntax definition checks for the existence of three global variables to allow users to specify what commands are legal in their files. The three variables can be set for the following effects:

set to highlight commands only available in Quake:

:let quake_is_quake1 = 1

set to highlight commands only available in Quake 2:

:let quake_is_quake2 = 1

set to highlight commands only available in Quake 3 Arena:

:let quake_is_quake3 = 1

Any combination of these three variables is legal, but might highlight more commands than are actually available to you by the game.

The parsing of R code for syntax highlight starts 40 lines backwards, but you can set a different value in your [vimrc](https://neovim.io/doc/user/starting.html#vimrc). Example:

let r_syntax_minlines = 60

You can also turn off syntax highlighting of ROxygen:

let r_syntax_hl_roxygen = 0

enable folding of code delimited by parentheses, square brackets and curly braces:

let r_syntax_folding = 1

and highlight as functions all keywords followed by an opening parenthesis:

let r_syntax_fun_pattern = 1

R MARKDOWN `rmd.vim` `ft-rmd-syntax`

To disable syntax highlight of YAML header, add to your [vimrc](https://neovim.io/doc/user/starting.html#vimrc):

let rmd_syn_hl_yaml = 0

To disable syntax highlighting of citation keys:

let rmd_syn_hl_citations = 0

To highlight R code in knitr chunk headers:

let rmd_syn_hl_chunk = 1

By default, chunks of R code will be highlighted following the rules of R language. If you want proper syntax highlighting of chunks of other languages, you should add them to either `markdown_fenced_languages` or`rmd_fenced_languages`. For example to properly highlight both R and Python, you may add this to your [vimrc](https://neovim.io/doc/user/starting.html#vimrc):

let rmd_fenced_languages = ['r', 'python']

R RESTRUCTURED TEXT `rrst.vim` `ft-rrst-syntax`

To highlight R code in knitr chunk headers, add to your [vimrc](https://neovim.io/doc/user/starting.html#vimrc):

let rrst_syn_hl_chunk = 1

### READLINE [readline.vim](#readline.vim) [ft-readline-syntax](#ft-readline-syntax)

The readline library is primarily used by the BASH shell, which adds quite a few commands and options to the ones already available. To highlight these items as well you can add the following to your [vimrc](https://neovim.io/doc/user/starting.html#vimrc) or just type it in the command line before loading a file with the readline syntax:

let readline_has_bash = 1

This will add highlighting for the commands that BASH (version 2.05a and later, and part earlier) adds.

Rego is a query language developed by Styra. It is mostly used as a policy language for kubernetes, but can be applied to almost anything. Files with the following extensions are recognized as rego files: .rego.

### RESTRUCTURED TEXT [rst.vim](#rst.vim) [ft-rst-syntax](#ft-rst-syntax)

Syntax highlighting is enabled for code blocks within the document for a select number of file types. See $VIMRUNTIME/syntax/rst.vim for the default syntax list.

To set a user-defined list of code block syntax highlighting:

let rst_syntax_code_list = ['vim', 'lisp', ...]

To assign multiple code block types to a single syntax, define`rst_syntax_code_list` as a mapping:

let rst_syntax_code_list = {
        \ 'cpp': ['cpp', 'c++'],
        \ 'bash': ['bash', 'sh'],
        ...
\ }

To use color highlighting for emphasis text:

let rst_use_emphasis_colors = 1

To enable folding of sections:

let rst_fold_enabled = 1

Note that folding can cause performance issues on some platforms.

If you notice highlighting errors while scrolling backwards, which are fixed when redrawing with `CTRL-L`, try setting the "rexx\_minlines" internal variable to a larger number:

:let rexx_minlines = 50

This will make the syntax synchronization start 50 lines before the first displayed line. The default value is 10\. The disadvantage of using a larger number is that redrawing can become slow.

Vim tries to guess what type a ".r" file is. If it can't be detected (from comment lines), the default is "r". To make the default rexx add this line to your vimrc: `g:filetype_r`

:let g:filetype_r = "r"

### RUBY [ruby.vim](#ruby.vim) [ft-ruby-syntax](#ft-ruby-syntax)

`ruby_operators`

 Ruby: Operator highlighting

Operators can be highlighted by defining "ruby\_operators":

:let ruby_operators = 1

`ruby_space_errors`

 Ruby: Whitespace errors

Whitespace errors can be highlighted by defining "ruby\_space\_errors":

:let ruby_space_errors = 1

This will highlight trailing whitespace and tabs preceded by a space character as errors. This can be refined by defining "ruby\_no\_trail\_space\_error" and "ruby\_no\_tab\_space\_error" which will ignore trailing whitespace and tabs after spaces respectively.

`ruby_fold` `ruby_foldable_groups`

 Ruby: Folding

Folding can be enabled by defining "ruby\_fold":

:let ruby_fold = 1

This will set the value of ['foldmethod'](https://neovim.io/doc/user/options.html#'foldmethod') to "syntax" locally to the current buffer or window, which will enable syntax-based folding when editing Ruby filetypes.

Default folding is rather detailed, i.e., small syntax units like "if", "do", "%w\[\]" may create corresponding fold levels.

You can set "ruby\_foldable\_groups" to restrict which groups are foldable:

:let ruby_foldable_groups = 'if case %'

The value is a space-separated list of keywords:

 keyword meaning

 \-------- -------------------------------------

 ALL Most block syntax (default) NONE Nothing if "if" or "unless" block def "def" block class "class" block module "module" block do "do" block begin "begin" block case "case" block for "for", "while", "until" loops { Curly bracket block or hash literal \[ Array literal % Literal with "%" notation, e.g.: %w(STRING), %!STRING! / Regexp string String and shell command output (surrounded by ', ",) : Symbol # Multiline comment \<\< Here documents \_\_END\_\_ Source code after "\_\_END\_\_" directive

`ruby_no_expensive`

 Ruby: Reducing expensive operations

By default, the "end" keyword is colorized according to the opening statement of the block it closes. While useful, this feature can be expensive; if you experience slow redrawing (or you are on a terminal with poor color support) you may want to turn it off by defining the "ruby\_no\_expensive" variable:

:let ruby_no_expensive = 1

In this case the same color will be used for all control keywords.

If you do want this feature enabled, but notice highlighting errors while scrolling backwards, which are fixed when redrawing with `CTRL-L`, try setting the "ruby\_minlines" variable to a value larger than 50:

:let ruby_minlines = 100

Ideally, this value should be a number of lines large enough to embrace your largest class or module.

`ruby_spellcheck_strings`

 Ruby: Spellchecking strings

Ruby syntax will perform spellchecking of strings if you define "ruby\_spellcheck\_strings":

:let ruby_spellcheck_strings = 1

By default only R7RS keywords are highlighted and properly indented.

scheme.vim also supports extensions of the CHICKEN Scheme-\>C compiler. Define b:is\_chicken or g:is\_chicken, if you need them.

The SDL highlighting probably misses a few keywords, but SDL has so many of them it's almost impossibly to cope.

The new standard, SDL-2000, specifies that all identifiers are case-sensitive (which was not so before), and that all keywords can be used either completely lowercase or completely uppercase. To have the highlighting reflect this, you can set the following variable:

:let sdl_2000=1

This also sets many new keywords. If you want to disable the old keywords, which is probably a good idea, use:

:let SDL_no_96=1

The indentation is probably also incomplete, but right now I am very satisfied with it for my own projects.

To make tabs stand out from regular blanks (accomplished by using Todo highlighting on the tabs), define "g:sed\_highlight\_tabs" by putting

:let g:sed_highlight_tabs = 1

in the vimrc file. (This special highlighting only applies for tabs inside search patterns, replacement texts, addresses or text included by an Append/Change/Insert command.) If you enable this option, it is also a good idea to set the tab width to one character; by doing that, you can easily count the number of tabs in a string.

GNU sed allows comments after text on the same line. BSD sed only allows comments where "#" is the first character of the line. To enforce BSD-style comments, i.e. mark end-of-line comments as errors, use:

:let g:sed_dialect = "bsd"

Note that there are other differences between GNU sed and BSD sed which are not (yet) affected by this setting.

Bugs:

 The transform command (y) is treated exactly like the substitute command. This means that, as far as this syntax file is concerned, transform accepts the same flags as substitute, which is wrong. (Transform accepts no flags.) I tolerate this bug because the involved commands need very complex treatment (95 patterns, one for each plausible pattern delimiter).

The coloring scheme for tags in the SGML file works as follows.

The \<\> of opening tags are colored differently than the \</\> of a closing tag. This is on purpose! For opening tags the 'Function' color is used, while for closing tags the 'Type' color is used (See syntax.vim to check how those are defined for you)

Known tag names are colored the same way as statements in C. Unknown tag names are not colored which makes it easy to spot errors.

Note that the same is true for argument (or attribute) names. Known attribute names are colored differently than unknown ones.

Some SGML tags are used to change the rendering of text. The following tags are recognized by the sgml.vim syntax coloring file and change the way normal text is shown: `\<varname\>` `\<emphasis\>` `\<command\>` `\<function\>` `\<literal\>` `\<replaceable\>` `\<ulink\>` and `\<link\>`.

If you want to change how such text is rendered, you must redefine the following syntax groups:

 sgmlBold

 sgmlBoldItalic

 sgmlUnderline

 sgmlItalic

 sgmlLink for links

To make this redefinition work you must redefine them all and define the following variable in your vimrc (this is due to the order in which the files are read during initialization)

let sgml_my_rendering=1

You can also disable this rendering by adding the following line to your vimrc file:

let sgml_no_rendering=1

(Adapted from the html.vim help text by Claudio Fleiner \<claudio@fleiner.com\>)

This covers syntax highlighting for the older Unix (Bourne) sh, and newer shells such as bash, dash, posix, and the Korn shells.

Vim attempts to determine which shell type is in use by specifying that various filenames are of specific types, e.g.:

ksh : .kshrc* *.ksh
bash: .bashrc* bashrc bash.bashrc .bash_profile* *.bash

See $VIMRUNTIME/filetype.vim for the full list of patterns. If none of these cases pertain, then the first line of the file is examined (ex. looking for /bin/sh /bin/ksh /bin/bash). If the first line specifies a shelltype, then that shelltype is used. However some files (ex. .profile) are known to be shell files but the type is not apparent. Furthermore, on many systems sh is symbolically linked to "bash" (Linux, Windows+cygwin) or "ksh" (Posix).

One may specify a global default by instantiating one of the following variables in your vimrc:

 ksh:

let g:is_kornshell = 1

 posix: (using this is nearly the same as setting g:is\_kornshell to 1)

let g:is_posix     = 1

 sh: (default) Bourne shell

let g:is_sh           = 1

 (dash users should use posix)

If there's no "#! ..." line, and the user hasn't availed themself of a default sh.vim syntax setting as just shown, then syntax/sh.vim will assume the Bourne shell syntax. No need to quote RFCs or market penetration statistics in error reports, please -- just select the default version of the sh your system uses and install the associated "let..." in your \<.vimrc\>.

The syntax/sh.vim file provides several levels of syntax-based folding:

let g:sh_fold_enabled= 0     (default, no syntax folding)
let g:sh_fold_enabled= 1     (enable function folding)
let g:sh_fold_enabled= 2     (enable heredoc folding)
let g:sh_fold_enabled= 4     (enable if/do/for folding)

then various syntax items (ie. HereDocuments and function bodies) become syntax-foldable (see [:syn-fold](https://neovim.io/doc/user/syntax.html#%3Asyn-fold)). You also may add these together to get multiple types of folding:

let g:sh_fold_enabled= 3     (enables function and heredoc folding)

If you notice highlighting errors while scrolling backwards which are fixed when one redraws with `CTRL-L`, try setting the "sh\_minlines" internal variable to a larger number. Example:

let sh_minlines = 500

This will make syntax synchronization start 500 lines before the first displayed line. The default value is 200\. The disadvantage of using a larger number is that redrawing can become slow.

If you don't have much to synchronize on, displaying can be very slow. To reduce this, the "sh\_maxlines" internal variable can be set. Example:

let sh_maxlines = 100

The default is to use the twice sh\_minlines. Set it to a smaller number to speed up displaying. The disadvantage is that highlight errors may appear.

syntax/sh.vim tries to flag certain problems as errors; usually things like unmatched "\]", "done", "fi", etc. If you find the error handling problematic for your purposes, you may suppress such error highlighting by putting the following line in your .vimrc:

let g:sh_no_error= 1

`sh-embed` `sh-awk` Sh: EMBEDDING LANGUAGES\~

You may wish to embed languages into sh. I'll give an example courtesy of Lorance Stinson on how to do this with awk as an example. Put the following file into $HOME/.config/nvim/after/syntax/sh/awkembed.vim:

" AWK Embedding:
" ==============
" Shamelessly ripped from aspperl.vim by Aaron Hope.
if exists("b:current_syntax")
  unlet b:current_syntax
endif
syn include @AWKScript syntax/awk.vim
syn region AWKScriptCode matchgroup=AWKCommand start=+[=\\]\@\<!'+ skip=+\\'+ end=+'+ contains=@AWKScript contained
syn region AWKScriptEmbedded matchgroup=AWKCommand start=+\\<awk\\>+ skip=+\\$+ end=+[=\\]\@\<!'+me=e-1 contains=@shIdList,@shExprList2 nextgroup=AWKScriptCode
syn cluster shCommandSubList add=AWKScriptEmbedded
hi def link AWKCommand Type

This code will then let the awk code in the single quotes:

awk '...awk code here...'

be highlighted using the awk highlighting syntax. Clearly this may be extended to other languages.

### SPEEDUP [spup.vim](#spup.vim) [ft-spup-syntax](#ft-spup-syntax)

(AspenTech plant simulator)

The Speedup syntax file has some options:

 strict\_subsections : If this variable is defined, only keywords for sections and subsections will be highlighted as statements but not other keywords (like WITHIN in the OPERATION section).

 highlight\_types : Definition of this variable causes stream types like temperature or pressure to be highlighted as Type, not as a plain Identifier. Included are the types that are usually found in the DECLARE section; if you defined own types, you have to include them in the syntax file.

 oneline\_comments : This value ranges from 1 to 3 and determines the highlighting of # style comments.

 oneline\_comments = 1 : Allow normal Speedup code after an even number of #s.

 oneline\_comments = 2 : Show code starting with the second # as error. This is the default setting.

 oneline\_comments = 3 : Show the whole line as error if it contains more than one #.

Since especially OPERATION sections tend to become very large due to PRESETting variables, syncing may be critical. If your computer is fast enough, you can increase minlines and/or maxlines near the end of the syntax file.

While there is an ANSI standard for SQL, most database engines add their own custom extensions. Vim currently supports the Oracle and Informix dialects of SQL. Vim assumes "\*.sql" files are Oracle SQL by default.

Vim currently has SQL support for a variety of different vendors via syntax scripts. You can change Vim's default from Oracle to any of the current SQL supported types. You can also easily alter the SQL dialect being used on a buffer by buffer basis.

For more detailed instructions see [ft\_sql.txt](https://neovim.io/doc/user/ft%5Fsql.html#ft%5Fsql.txt).

Squirrel is a high level imperative, object-oriented programming language, designed to be a light-weight scripting language that fits in the size, memory bandwidth, and real-time requirements of applications like video games. Files with the following extensions are recognized as squirrel files: .nut.

This covers the shell named "tcsh". It is a superset of csh. See [csh.vim](https://neovim.io/doc/user/syntax.html#csh.vim)for how the filetype is detected.

Tcsh does not allow \\" in strings unless the "backslash\_quote" shell variable is set. If you want VIM to assume that no backslash quote constructs exist add this line to your vimrc:

:let tcsh_backslash_quote = 0

If you notice highlighting errors while scrolling backwards, which are fixed when redrawing with `CTRL-L`, try setting the "tcsh\_minlines" internal variable to a larger number:

:let tcsh_minlines = 1000

This will make the syntax synchronization start 1000 lines before the first displayed line. If you set "tcsh\_minlines" to "fromstart", then synchronization is done from the start of the file. The default value for tcsh\_minlines is 100\. The disadvantage of using a larger number is that redrawing can become slow.

 Tex Contents\~ Tex: Want Syntax Folding? [tex-folding](https://neovim.io/doc/user/syntax.html#tex-folding) Tex: No Spell Checking Wanted [g:tex\_nospell](https://neovim.io/doc/user/syntax.html#g%3Atex%5Fnospell) Tex: Don't Want Spell Checking In Comments? [tex-nospell](https://neovim.io/doc/user/syntax.html#tex-nospell) Tex: Want Spell Checking in Verbatim Zones? [tex-verb](https://neovim.io/doc/user/syntax.html#tex-verb) Tex: Run-on Comments or MathZones [tex-runon](https://neovim.io/doc/user/syntax.html#tex-runon) Tex: Slow Syntax Highlighting? [tex-slow](https://neovim.io/doc/user/syntax.html#tex-slow) Tex: Want To Highlight More Commands? [tex-morecommands](https://neovim.io/doc/user/syntax.html#tex-morecommands) Tex: Excessive Error Highlighting? [tex-error](https://neovim.io/doc/user/syntax.html#tex-error) Tex: Need a new Math Group? [tex-math](https://neovim.io/doc/user/syntax.html#tex-math) Tex: Starting a New Style? [tex-style](https://neovim.io/doc/user/syntax.html#tex-style) Tex: Taking Advantage of Conceal Mode [tex-conceal](https://neovim.io/doc/user/syntax.html#tex-conceal) Tex: Selective Conceal Mode [g:tex\_conceal](https://neovim.io/doc/user/syntax.html#g%3Atex%5Fconceal) Tex: Controlling iskeyword [g:tex\_isk](https://neovim.io/doc/user/syntax.html#g%3Atex%5Fisk) Tex: Fine Subscript and Superscript Control [tex-supersub](https://neovim.io/doc/user/syntax.html#tex-supersub) Tex: Match Check Control [tex-matchcheck](https://neovim.io/doc/user/syntax.html#tex-matchcheck)

`tex-folding` `g:tex_fold_enabled`

 Tex: Want Syntax Folding?

As of version 28 of \<syntax/tex.vim\>, syntax-based folding of parts, chapters, sections, subsections, etc are supported. Put

let g:tex_fold_enabled=1

in your vimrc, and :set fdm=syntax. I suggest doing the latter via a modeline at the end of your LaTeX file:

% vim: fdm=syntax

If your system becomes too slow, then you might wish to look into

https://vimhelp.org/vim_faq.txt.html#faq-29.7

`g:tex_nospell` Tex: No Spell Checking Wanted\~

If you don't want spell checking anywhere in your LaTeX document, put

let g:tex_nospell=1

into your vimrc. If you merely wish to suppress spell checking inside comments only, see [g:tex\_comment\_nospell](https://neovim.io/doc/user/syntax.html#g%3Atex%5Fcomment%5Fnospell).

`tex-nospell` 

 Tex: Don't Want Spell Checking In Comments?

Some folks like to include things like source code in comments and so would prefer that spell checking be disabled in comments in LaTeX files. To do this, put the following in your vimrc:

let g:tex_comment_nospell= 1

If you want to suppress spell checking everywhere inside your LaTeX document, see [g:tex\_nospell](https://neovim.io/doc/user/syntax.html#g%3Atex%5Fnospell).

`tex-verb` `g:tex_verbspell` Tex: Want Spell Checking in Verbatim Zones?\~

Often verbatim regions are used for things like source code; seldom does one want source code spell-checked. However, for those of you who do want your verbatim zones spell-checked, put the following in your vimrc:

let g:tex_verbspell= 1

`tex-runon` `tex-stopzone`

 Tex: Run-on Comments or MathZones

The \<syntax/tex.vim\> highlighting supports TeX, LaTeX, and some AmsTeX. The highlighting supports three primary zones/regions: normal, texZone, and texMathZone. Although considerable effort has been made to have these zones terminate properly, zones delineated by $..$ and $$..$$ cannot be synchronized as there's no difference between start and end patterns. Consequently, a special "TeX comment" has been provided

%stopzone

which will forcibly terminate the highlighting of either a texZone or a texMathZone.

`tex-slow` `tex-sync`

 Tex: Slow Syntax Highlighting?

If you have a slow computer, you may wish to reduce the values for

:syn sync maxlines=200
:syn sync minlines=50

(especially the latter). If your computer is fast, you may wish to increase them. This primarily affects synchronizing (i.e. just what group, if any, is the text at the top of the screen supposed to be in?).

Another cause of slow highlighting is due to syntax-driven folding; see[tex-folding](https://neovim.io/doc/user/syntax.html#tex-folding) for a way around this.

Finally, if syntax highlighting is still too slow, you may set

:let g:tex_fast= ""

in your vimrc. Used this way, the g:tex\_fast variable causes the syntax highlighting script to avoid defining any regions and associated synchronization. The result will be much faster syntax highlighting; the price: you will no longer have as much highlighting or any syntax-based folding, and you will be missing syntax-based error checking.

You may decide that some syntax is acceptable; you may use the following table selectively to enable just some syntax highlighting:

b : allow bold and italic syntax
c : allow texComment syntax
m : allow texMatcher syntax (ie. {...} and [...])
M : allow texMath syntax
p : allow parts, chapter, section, etc syntax
r : allow texRefZone syntax (nocite, bibliography, label, pageref, eqref)
s : allow superscript/subscript regions
S : allow texStyle syntax
v : allow verbatim syntax
V : allow texNewEnv and texNewCmd syntax

As an example, let g:tex\_fast= "M" will allow math-associated highlighting but suppress all the other region-based syntax highlighting. (also see: [g:tex\_conceal](https://neovim.io/doc/user/syntax.html#g%3Atex%5Fconceal) and [tex-supersub](https://neovim.io/doc/user/syntax.html#tex-supersub))

`tex-morecommands` `tex-package`

 Tex: Want To Highlight More Commands?

LaTeX is a programmable language, and so there are thousands of packages full of specialized LaTeX commands, syntax, and fonts. If you're using such a package you'll often wish that the distributed syntax/tex.vim would support it. However, clearly this is impractical. So please consider using the techniques in [mysyntaxfile-add](https://neovim.io/doc/user/syntax.html#mysyntaxfile-add) to extend or modify the highlighting provided by syntax/tex.vim.

I've included some support for various popular packages on my website:

https://www.drchip.org/astronaut/vim/index.html#LATEXPKGS

The syntax files there go into your .../after/syntax/tex/ directory.

`tex-error` `g:tex_no_error`

 Tex: Excessive Error Highlighting?

The \<tex.vim\> supports lexical error checking of various sorts. Thus, although the error checking is ofttimes very useful, it can indicate errors where none actually are. If this proves to be a problem for you, you may put in your vimrc the following statement:

let g:tex_no_error=1

and all error checking by \<syntax/tex.vim\> will be suppressed.

`tex-math`

 Tex: Need a new Math Group?

If you want to include a new math group in your LaTeX, the following code shows you an example as to how you might do so:

call TexNewMathZone(sfx,mathzone,starform)

You'll want to provide the new math group with a unique suffix (currently, A-L and V-Z are taken by \<syntax/tex.vim\> itself). As an example, consider how eqnarray is set up by \<syntax/tex.vim\>:

call TexNewMathZone("D","eqnarray",1)

You'll need to change "mathzone" to the name of your new math group, and then to the call to it in .vim/after/syntax/tex.vim. The "starform" variable, if true, implies that your new math group has a starred form (ie. eqnarray\*).

`tex-style` `b:tex_stylish`

 Tex: Starting a New Style?

One may use "\\makeatletter" in `*.tex` files, thereby making the use of "@" in commands available. However, since the `*.tex` file doesn't have one of the following suffices: sty cls clo dtx ltx, the syntax highlighting will flag such use of @ as an error. To solve this:

:let b:tex_stylish = 1
:set ft=tex

Putting "let g:tex\_stylish=1" into your vimrc will make \<syntax/tex.vim\> always accept such use of @.

`tex-cchar` `tex-cole` `tex-conceal` Tex: Taking Advantage of Conceal Mode\~

If you have ['conceallevel'](https://neovim.io/doc/user/options.html#'conceallevel') set to 2 and if your encoding is utf-8, then a number of character sequences can be translated into appropriate utf-8 glyphs, including various accented characters, Greek characters in MathZones, and superscripts and subscripts in MathZones. Not all characters can be made into superscripts or subscripts; the constraint is due to what utf-8 supports. In fact, only a few characters are supported as subscripts.

One way to use this is to have vertically split windows (see [CTRL-W\_v](https://neovim.io/doc/user/windows.html#CTRL-W%5Fv)); one with ['conceallevel'](https://neovim.io/doc/user/options.html#'conceallevel') at 0 and the other at 2; and both using ['scrollbind'](https://neovim.io/doc/user/options.html#'scrollbind').

`g:tex_conceal` Tex: Selective Conceal Mode\~

You may selectively use conceal mode by setting g:tex\_conceal in your vimrc. By default, g:tex\_conceal is set to "admgs" to enable concealment for the following sets of characters:

a = accents/ligatures
b = bold and italic
d = delimiters
m = math symbols
g = Greek
s = superscripts/subscripts

By leaving one or more of these out, the associated conceal-character substitution will not be made.

`g:tex_isk` `g:tex_stylish` Tex: Controlling iskeyword\~

Normally, LaTeX keywords support 0-9, a-z, A-z, and 192-255 only. Latex keywords don't support the underscore - except when in `*.sty` files. The syntax highlighting script handles this with the following logic:

 \* If g:tex\_stylish exists and is 1 then the file will be treated as a "sty" file, so the "\_" will be allowed as part of keywords (regardless of g:tex\_isk) \* Else if the file's suffix is sty, cls, clo, dtx, or ltx, then the file will be treated as a "sty" file, so the "\_" will be allowed as part of keywords (regardless of g:tex\_isk)

 \* If g:tex\_isk exists, then it will be used for the local ['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword') \* Else the local ['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword') will be set to 48-57,a-z,A-Z,192-255

`tex-supersub` `g:tex_superscripts` `g:tex_subscripts` Tex: Fine Subscript and Superscript Control\~

 See [tex-conceal](https://neovim.io/doc/user/syntax.html#tex-conceal) for how to enable concealed character replacement.

 See [g:tex\_conceal](https://neovim.io/doc/user/syntax.html#g%3Atex%5Fconceal) for selectively concealing accents, bold/italic, math, Greek, and superscripts/subscripts.

 One may exert fine control over which superscripts and subscripts one wants syntax-based concealment for (see [:syn-cchar](https://neovim.io/doc/user/syntax.html#%3Asyn-cchar)). Since not all fonts support all characters, one may override the concealed-replacement lists; by default these lists are given by:

let g:tex_superscripts= "[0-9a-zA-W.,:;+-\<\>/()=]"
let g:tex_subscripts= "[0-9aehijklmnoprstuvx,+-/().]"

 For example, I use Luxi Mono Bold; it doesn't support subscript characters for "hklmnpst", so I put

let g:tex_subscripts= "[0-9aeijoruvx,+-/().]"

 in \~/.config/nvim/ftplugin/tex/tex.vim in order to avoid having inscrutable utf-8 glyphs appear.

`tex-matchcheck` `g:tex_matchcheck` Tex: Match Check Control\~

 Sometimes one actually wants mismatched parentheses, square braces, and or curly braces; for example, \\text{(1,10\]} is a range from but not including 1 to and including 10\. This wish, of course, conflicts with the desire to provide delimiter mismatch detection. To accommodate these conflicting goals, syntax/tex.vim provides

g:tex_matchcheck = '[({[]'

 which is shown along with its default setting. So, if one doesn't want \[\] and () to be checked for mismatches, try using

let g:tex_matchcheck= '[{}]'

 If you don't want matching to occur inside bold and italicized regions,

let g:tex_excludematcher= 1

 will prevent the texMatcher group from being included in those regions.

There is one option for the tf syntax highlighting.

For syncing, minlines defaults to 100\. If you prefer another value, you can set "tf\_minlines" to the value you desire. Example:

:let tf_minlines = your choice

### VIM [vim.vim](#vim.vim) [ft-vim-syntax](#ft-vim-syntax)

`g:vimsyn_minlines` `g:vimsyn_maxlines`There is a trade-off between more accurate syntax highlighting versus screen updating speed. To improve accuracy, you may wish to increase the g:vimsyn\_minlines variable. The g:vimsyn\_maxlines variable may be used to improve screen updating rates (see [:syn-sync](https://neovim.io/doc/user/syntax.html#%3Asyn-sync) for more on this).

g:vimsyn_minlines : used to set synchronization minlines
g:vimsyn_maxlines : used to set synchronization maxlines

 (g:vim\_minlines and g:vim\_maxlines are deprecated variants of these two options)

`g:vimsyn_embed`The g:vimsyn\_embed option allows users to select what, if any, types of embedded script highlighting they wish to have.

g:vimsyn_embed == 0      : disable (don't embed any scripts)
g:vimsyn_embed == 'lPr'  : support embedded lua, python and ruby

This option is disabled by default.`g:vimsyn_folding`

Some folding is now supported with syntax/vim.vim:

g:vimsyn_folding == 0 or doesn't exist: no syntax-based folding
g:vimsyn_folding =~ 'a' : augroups
g:vimsyn_folding =~ 'f' : fold functions
g:vimsyn_folding =~ 'P' : fold python   script

`g:vimsyn_noerror`Not all error highlighting that syntax/vim.vim does may be correct; Vim script is a difficult language to highlight correctly. A way to suppress error highlighting is to put the following line in your [vimrc](https://neovim.io/doc/user/starting.html#vimrc):

let g:vimsyn_noerror = 1

The Workflow Description Language is a way to specify data processing workflows with a human-readable and writeable syntax. This is used a lot in bioinformatics. More info on the spec can be found here:\<https://github.com/openwdl/wdl\>

The syntax of XF86Config file differs in XFree86 v3.x and v4.x. Both variants are supported. Automatic detection is used, but is far from perfect. You may need to specify the version manually. Set the variable xf86conf\_xfree86\_version to 3 or 4 according to your XFree86 version in your vimrc. Example:

:let xf86conf_xfree86_version=3

When using a mix of versions, set the b:xf86conf\_xfree86\_version variable.

Note that spaces and underscores in option names are not supported. Use "SyncOnGreen" instead of "\_\_s yn con gr\_e\_e\_n" if you want the option name highlighted.

Xml namespaces are highlighted by default. This can be inhibited by setting a global variable:

:let g:xml_namespace_transparent=1

`xml-folding`The xml syntax file provides syntax [folding](https://neovim.io/doc/user/fold.html#folding) (see [:syn-fold](https://neovim.io/doc/user/syntax.html#%3Asyn-fold)) between start and end tags. This can be turned on by

:let g:xml_syntax_folding = 1
:set foldmethod=syntax

Note: Syntax folding might slow down syntax highlighting significantly, especially for large files.

X Pixmaps (XPM) `xpm.vim` `ft-xpm-syntax`

xpm.vim creates its syntax items dynamically based upon the contents of the XPM file. Thus if you make changes e.g. in the color specification strings, you have to source it again e.g. with ":set syn=xpm".

To copy a pixel with one of the colors, yank a "pixel" with "yl" and insert it somewhere else with "P".

Do you want to draw with the mouse? Try the following:

:function! GetPixel()
:   let c = getline(".")[col(".") - 1]
:   echo c
:   exe "noremap \<LeftMouse\> \<LeftMouse\>r" .. c
:   exe "noremap \<LeftDrag\>        \<LeftMouse\>r" .. c
:endfunction
:noremap \<RightMouse\> \<LeftMouse\>:call GetPixel()\<CR\>
:set guicursor=n:hor20           " to see the color beneath the cursor

This turns the right button into a pipette and the left button into a pen. It will work with XPM files that have one character per pixel only and you must not click outside of the pixel strings, but feel free to improve it.

It will look much better with a font in a quadratic cell size, e.g. for X:

:set guifont=-*-clean-medium-r-*-*-8-*-*-*-*-80-*

### YAML [yaml.vim](#yaml.vim) [ft-yaml-syntax](#ft-yaml-syntax)

`g:yaml_schema` `b:yaml_schema`A YAML schema is a combination of a set of tags and a mechanism for resolving non-specific tags. For user this means that YAML parser may, depending on plain scalar contents, treat plain scalar (which can actually be only string and nothing else) as a value of the other type: null, boolean, floating-point, integer. `g:yaml_schema` option determines according to which schema values will be highlighted specially. Supported schemas are

Schema Description

failsafe No additional highlighting. json Supports JSON-style numbers, booleans and null. core Supports more number, boolean and null styles. pyyaml In addition to core schema supports highlighting timestamps, but there are some differences in what is recognized as numbers and many additional boolean values not present in core schema.

Default schema is `core`.

Note that schemas are not actually limited to plain scalars, but this is the only difference between schemas defined in YAML specification and the only difference defined in the syntax file.

The syntax script for zsh allows for syntax-based folding:

:let g:zsh_fold_enable = 1

## 6\. Defining a syntax [:syn-define](#%3Asyn-define) [E410](#E410)

Vim understands three types of syntax items:

1\. Keyword It can only contain keyword characters, according to the characters specified with [:syn-iskeyword](https://neovim.io/doc/user/syntax.html#%3Asyn-iskeyword) or the ['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword') option. It cannot contain other syntax items. It will only match with a complete word (there are no keyword characters before or after the match). The keyword "if" would match in "if(a=b)", but not in "ifdef x", because "(" is not a keyword character and "d" is.

2\. Match This is a match with a single regexp pattern.

3\. Region This starts at a match of the "start" regexp pattern and ends with a match with the "end" regexp pattern. Any other text can appear in between. A "skip" regexp pattern can be used to avoid matching the "end" pattern.

Several syntax ITEMs can be put into one syntax GROUP. For a syntax group you can give highlighting attributes. For example, you could have an item to define a `/* .. */` comment and another one that defines a "// .." comment, and put them both in the "Comment" group. You can then specify that a "Comment" will be in bold font and have a blue color. You are free to make one highlight group for one syntax item, or put all items into one group. This depends on how you want to specify your highlighting attributes. Putting each item in its own group results in having to specify the highlighting for a lot of groups.

Note that a syntax group and a highlight group are similar. For a highlight group you will have given highlight attributes. These attributes will be used for the syntax group with the same name.

In case more than one item matches at the same position, the one that was defined LAST wins. Thus you can override previously defined syntax items by using an item that matches the same text. But a keyword always goes before a match or region. And a keyword with matching case always goes before a keyword with ignoring case.

### PRIORITY [:syn-priority](#%3Asyn-priority)

When several syntax items may match, these rules are used:

1\. When multiple Match or Region items start in the same position, the item defined last has priority. 2\. A Keyword has priority over Match and Region items. 3\. An item that starts in an earlier position has priority over items that start in later positions.

### DEFINING CASE [:syn-case](#%3Asyn-case) [E390](#E390)

:sy\[ntax\] case \[match | ignore\] This defines if the following ":syntax" commands will work with matching case, when using "match", or with ignoring case, when using "ignore". Note that any items before this are not affected, and all items until the next ":syntax case" command are affected.

:sy\[ntax\] case Show either "syntax case match" or "syntax case ignore".

### DEFINING FOLDLEVEL [:syn-foldlevel](#%3Asyn-foldlevel)

:sy\[ntax\] foldlevel start :sy\[ntax\] foldlevel minimum This defines how the foldlevel of a line is computed when using foldmethod=syntax (see [fold-syntax](https://neovim.io/doc/user/fold.html#fold-syntax) and [:syn-fold](https://neovim.io/doc/user/syntax.html#%3Asyn-fold)):

 start: Use level of item containing start of line. minimum: Use lowest local-minimum level of items on line.

 The default is "start". Use "minimum" to search a line horizontally for the lowest level contained on the line that is followed by a higher level. This produces more natural folds when syntax items may close and open horizontally within a line.

:sy\[ntax\] foldlevel Show the current foldlevel method, either "syntax foldlevel start" or "syntax foldlevel minimum".

### SPELL CHECKING [:syn-spell](#%3Asyn-spell)

:sy\[ntax\] spell toplevel :sy\[ntax\] spell notoplevel :sy\[ntax\] spell default This defines where spell checking is to be done for text that is not in a syntax item:

 toplevel: Text is spell checked. notoplevel: Text is not spell checked. default: When there is a @Spell cluster no spell checking.

 For text in syntax items use the @Spell and @NoSpell clusters[spell-syntax](https://neovim.io/doc/user/spell.html#spell-syntax). When there is no @Spell and no @NoSpell cluster then spell checking is done for "default" and "toplevel".

 To activate spell checking the ['spell'](https://neovim.io/doc/user/options.html#'spell') option must be set.

:sy\[ntax\] spell Show the current syntax spell checking method, either "syntax spell toplevel", "syntax spell notoplevel" or "syntax spell default".

### SYNTAX ISKEYWORD SETTING [:syn-iskeyword](#%3Asyn-iskeyword)

:sy\[ntax\] iskeyword \[clear | `{option}`\] This defines the keyword characters. It's like the ['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword') option for but only applies to syntax highlighting.

 clear: Syntax specific iskeyword setting is disabled and the buffer-local ['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword') setting is used.`{option}` Set the syntax ['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword') option to a new value.

 Example:

:syntax iskeyword @,48-57,192-255,$,_

 This would set the syntax specific iskeyword option to include all alphabetic characters, plus the numeric characters, all accented characters and also includes the "\_" and the "$".

 If no argument is given, the current value will be output.

 Setting this option influences what [/\\k](https://neovim.io/doc/user/pattern.html#%2F%5Ck) matches in syntax patterns and also determines where [:syn-keyword](https://neovim.io/doc/user/syntax.html#%3Asyn-keyword) will be checked for a new match.

 It is recommended when writing syntax files, to use this command to set the correct value for the specific syntax language and not change the ['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword') option.

### DEFINING KEYWORDS [:syn-keyword](#%3Asyn-keyword)

:sy\[ntax\] keyword `{group-name}` \[`{options}`\] `{keyword}` .. \[`{options}`\]

 This defines a number of keywords.

`{group-name}` Is a syntax group name such as "Comment". \[`{options}`\] See [:syn-arguments](https://neovim.io/doc/user/syntax.html#%3Asyn-arguments) below.`{keyword}` .. Is a list of keywords which are part of this group.

 Example:

:syntax keyword   Type   int long char

 The `{options}` can be given anywhere in the line. They will apply to all keywords given, also for options that come after a keyword. These examples do exactly the same:

:syntax keyword   Type   contained int long char
:syntax keyword   Type   int long contained char
:syntax keyword   Type   int long char contained

`E789` `E890` When you have a keyword with an optional tail, like Ex commands in Vim, you can put the optional characters inside \[\], to define all the variations at once:

:syntax keyword   vimCommand         ab[breviate] n[ext]

 Don't forget that a keyword can only be recognized if all the characters are included in the ['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword') option. If one character isn't, the keyword will never be recognized. Multi-byte characters can also be used. These do not have to be in['iskeyword'](https://neovim.io/doc/user/options.html#'iskeyword'). See [:syn-iskeyword](https://neovim.io/doc/user/syntax.html#%3Asyn-iskeyword) for defining syntax specific iskeyword settings.

 A keyword always has higher priority than a match or region, the keyword is used if more than one item matches. Keywords do not nest and a keyword can't contain anything else.

 Note that when you have a keyword that is the same as an option (even one that isn't allowed here), you can not use it. Use a match instead.

 The maximum length of a keyword is 80 characters.

 The same keyword can be defined multiple times, when its containment differs. For example, you can define the keyword once not contained and use one highlight group, and once contained, and use a different highlight group. Example:

:syn keyword vimCommand tag
:syn keyword vimSetting contained tag

 When finding "tag" outside of any syntax item, the "vimCommand" highlight group is used. When finding "tag" in a syntax item that contains "vimSetting", the "vimSetting" group is used.

### DEFINING MATCHES [:syn-match](#%3Asyn-match)

:sy\[ntax\] match `{group-name}` \[`{options}`\] \[excludenl\] \[keepend\]`{pattern}` \[`{options}`\]

 This defines one match.

`{group-name}` A syntax group name such as "Comment". \[`{options}`\] See [:syn-arguments](https://neovim.io/doc/user/syntax.html#%3Asyn-arguments) below. \[excludenl\] Don't make a pattern with the end-of-line "$" extend a containing match or region. Must be given before the pattern. [:syn-excludenl](https://neovim.io/doc/user/syntax.html#%3Asyn-excludenl) keepend Don't allow contained matches to go past a match with the end pattern. See[:syn-keepend](https://neovim.io/doc/user/syntax.html#%3Asyn-keepend).`{pattern}` The search pattern that defines the match. See [:syn-pattern](https://neovim.io/doc/user/syntax.html#%3Asyn-pattern) below. Note that the pattern may match more than one line, which makes the match depend on where Vim starts searching for the pattern. You need to make sure syncing takes care of this.

 Example (match a character constant):

:syntax match Character /'.'/hs=s+1,he=e-1

### DEFINING REGIONS [:syn-region](#%3Asyn-region) [:syn-start](#%3Asyn-start) [:syn-skip](#%3Asyn-skip) [:syn-end](#%3Asyn-end)

`E398` `E399`:sy\[ntax\] region `{group-name}` \[`{options}`\] \[matchgroup={group-name}\] \[keepend\] \[extend\] \[excludenl\] start={start-pattern} .. \[skip={skip-pattern}\] end={end-pattern} .. \[`{options}`\]

 This defines one region. It may span several lines.

`{group-name}` A syntax group name such as "Comment". \[`{options}`\] See [:syn-arguments](https://neovim.io/doc/user/syntax.html#%3Asyn-arguments) below. \[matchgroup={group-name}\] The syntax group to use for the following start or end pattern matches only. Not used for the text in between the matched start and end patterns. Use NONE to reset to not using a different group for the start or end match. See [:syn-matchgroup](https://neovim.io/doc/user/syntax.html#%3Asyn-matchgroup). keepend Don't allow contained matches to go past a match with the end pattern. See[:syn-keepend](https://neovim.io/doc/user/syntax.html#%3Asyn-keepend). extend Override a "keepend" for an item this region is contained in. See [:syn-extend](https://neovim.io/doc/user/syntax.html#%3Asyn-extend). excludenl Don't make a pattern with the end-of-line "$" extend a containing match or item. Only useful for end patterns. Must be given before the patterns it applies to. [:syn-excludenl](https://neovim.io/doc/user/syntax.html#%3Asyn-excludenl) start={start-pattern} The search pattern that defines the start of the region. See [:syn-pattern](https://neovim.io/doc/user/syntax.html#%3Asyn-pattern) below. skip={skip-pattern} The search pattern that defines text inside the region where not to look for the end pattern. See [:syn-pattern](https://neovim.io/doc/user/syntax.html#%3Asyn-pattern) below. end={end-pattern} The search pattern that defines the end of the region. See [:syn-pattern](https://neovim.io/doc/user/syntax.html#%3Asyn-pattern) below.

 Example:

:syntax region String   start=+"+  skip=+\\"+  end=+"+

 The start/skip/end patterns and the options can be given in any order. There can be zero or one skip pattern. There must be one or more start and end patterns. This means that you can omit the skip pattern, but you must give at least one start and one end pattern. It is allowed to have white space before and after the equal sign (although it mostly looks better without white space).

 When more than one start pattern is given, a match with one of these is sufficient. This means there is an OR relation between the start patterns. The last one that matches is used. The same is true for the end patterns.

 The search for the end pattern starts right after the start pattern. Offsets are not used for this. This implies that the match for the end pattern will never overlap with the start pattern.

 The skip and end pattern can match across line breaks, but since the search for the pattern can start in any line it often does not do what you want. The skip pattern doesn't avoid a match of an end pattern in the next line. Use single-line patterns to avoid trouble.

 Note: The decision to start a region is only based on a matching start pattern. There is no check for a matching end pattern. This does NOT work:

:syn region First  start="("  end=":"
:syn region Second start="("  end=";"

 The Second always matches before the First (last defined pattern has higher priority). The Second region then continues until the next ';', no matter if there is a ':' before it. Using a match does work:

:syn match First  "(\_.\{-}:"
:syn match Second "(\_.\{-};"

 This pattern matches any character or line break with "\\\_." and repeats that with "\\{-}" (repeat as few as possible).

`:syn-keepend` By default, a contained match can obscure a match for the end pattern. This is useful for nesting. For example, a region that starts with "{" and ends with "}", can contain another region. An encountered "}" will then end the contained region, but not the outer region: { starts outer "{}" region { starts contained "{}" region } ends contained "{}" region } ends outer "{} region If you don't want this, the "keepend" argument will make the matching of an end pattern of the outer region also end any contained item. This makes it impossible to nest the same region, but allows for contained items to highlight parts of the end pattern, without causing that to skip the match with the end pattern. Example:

:syn match  vimComment +"[^"]\+$+
:syn region vimCommand start="set" end="$" contains=vimComment keepend

 The "keepend" makes the vimCommand always end at the end of the line, even though the contained vimComment includes a match with the `\<EOL\>`.

 When "keepend" is not used, a match with an end pattern is retried after each contained match. When "keepend" is included, the first encountered match with an end pattern is used, truncating any contained matches.`:syn-extend` The "keepend" behavior can be changed by using the "extend" argument. When an item with "extend" is contained in an item that uses "keepend", the "keepend" is ignored and the containing region will be extended. This can be used to have some contained items extend a region while others don't. Example:

:syn region htmlRef start=+\<a\>+ end=+\</a\>+ keepend contains=htmlItem,htmlScript
:syn match htmlItem +\<[^\>]*\>+ contained
:syn region htmlScript start=+\<script+ end=+\</script[^\>]*\>+ contained extend

 Here the htmlItem item does not make the htmlRef item continue further, it is only used to highlight the \<\> items. The htmlScript item does extend the htmlRef item.

 Another example:

:syn region xmlFold start="\<a\>" end="\</a\>" fold transparent keepend extend

 This defines a region with "keepend", so that its end cannot be changed by contained items, like when the "\</a\>" is matched to highlight it differently. But when the xmlFold region is nested (it includes itself), the "extend" applies, so that the "\</a\>" of a nested region only ends that region, and not the one it is contained in.

`:syn-excludenl` When a pattern for a match or end pattern of a region includes a '$' to match the end-of-line, it will make a region item that it is contained in continue on the next line. For example, a match with "\\\\$" (backslash at the end of the line) can make a region continue that would normally stop at the end of the line. This is the default behavior. If this is not wanted, there are two ways to avoid it: 1\. Use "keepend" for the containing item. This will keep all contained matches from extending the match or region. It can be used when all contained items must not extend the containing item. 2\. Use "excludenl" in the contained item. This will keep that match from extending the containing match or region. It can be used if only some contained items must not extend the containing item. "excludenl" must be given before the pattern it applies to.

`:syn-matchgroup` "matchgroup" can be used to highlight the start and/or end pattern differently than the body of the region. Example:

:syntax region String matchgroup=Quote start=+"+  skip=+\\"+        end=+"+

 This will highlight the quotes with the "Quote" group, and the text in between with the "String" group. The "matchgroup" is used for all start and end patterns that follow, until the next "matchgroup". Use "matchgroup=NONE" to go back to not using a matchgroup.

 In a start or end pattern that is highlighted with "matchgroup" the contained items of the region are not used. This can be used to avoid that a contained item matches in the start or end pattern match. When using "transparent", this does not apply to a start or end pattern match that is highlighted with "matchgroup".

 Here is an example, which highlights three levels of parentheses in different colors:

:sy region par1 matchgroup=par1 start=/(/ end=/)/ contains=par2
:sy region par2 matchgroup=par2 start=/(/ end=/)/ contains=par3 contained
:sy region par3 matchgroup=par3 start=/(/ end=/)/ contains=par1 contained
:hi par1 ctermfg=red guifg=red
:hi par2 ctermfg=blue guifg=blue
:hi par3 ctermfg=darkgreen guifg=darkgreen

`E849`The maximum number of syntax groups is 19999.

## 7\. :syntax arguments [:syn-arguments](#%3Asyn-arguments)

The :syntax commands that define syntax items take a number of arguments. The common ones are explained here. The arguments may be given in any order and may be mixed with patterns.

Not all commands accept all arguments. This table shows which arguments can not be used for all commands:`E395` contains oneline fold display extend concealends\~ :syntax keyword - - - - - - :syntax match yes - yes yes yes - :syntax region yes yes yes yes yes yes

These arguments can be used for all three commands: conceal cchar contained containedin nextgroup transparent skipwhite skipnl skipempty

conceal `conceal` `:syn-conceal`

When the "conceal" argument is given, the item is marked as concealable. Whether or not it is actually concealed depends on the value of the['conceallevel'](https://neovim.io/doc/user/options.html#'conceallevel') option. The ['concealcursor'](https://neovim.io/doc/user/options.html#'concealcursor') option is used to decide whether concealable items in the current line are displayed unconcealed to be able to edit the line. Another way to conceal text is with [matchadd()](https://neovim.io/doc/user/builtin.html#matchadd%28%29).

concealends `:syn-concealends`

When the "concealends" argument is given, the start and end matches of the region, but not the contents of the region, are marked as concealable. Whether or not they are actually concealed depends on the setting on the['conceallevel'](https://neovim.io/doc/user/options.html#'conceallevel') option. The ends of a region can only be concealed separately in this way when they have their own highlighting via "matchgroup"

cchar `:syn-cchar` `E844`The "cchar" argument defines the character shown in place of the item when it is concealed (setting "cchar" only makes sense when the conceal argument is given.) If "cchar" is not set then the default conceal character defined in the ['listchars'](https://neovim.io/doc/user/options.html#'listchars') option is used. The character cannot be a control character such as Tab. Example:

:syntax match Entity "&amp;" conceal cchar=&

See [hl-Conceal](https://neovim.io/doc/user/syntax.html#hl-Conceal) for highlighting.

contained `:syn-contained`

When the "contained" argument is given, this item will not be recognized at the top level, but only when it is mentioned in the "contains" field of another match. Example:

:syntax keyword Todo    TODO    contained
:syntax match   Comment "//.*"  contains=Todo

display `:syn-display`

If the "display" argument is given, this item will be skipped when the detected highlighting will not be displayed. This will speed up highlighting, by skipping this item when only finding the syntax state for the text that is to be displayed.

Generally, you can use "display" for match and region items that meet these conditions:

 The item does not continue past the end of a line. Example for C: A region for a "/\*" comment can't contain "display", because it continues on the next line.

 The item does not contain items that continue past the end of the line or make it continue on the next line.

 The item does not change the size of any item it is contained in. Example for C: A match with "\\\\$" in a preprocessor match can't have "display", because it may make that preprocessor match shorter.

 The item does not allow other items to match that didn't match otherwise, and that item may extend the match too far. Example for C: A match for a "//" comment can't use "display", because a "/\*" inside that comment would match then and start a comment which extends past the end of the line.

Examples, for the C language, where "display" can be used:

 match with a number

 match with a label

transparent `:syn-transparent`

If the "transparent" argument is given, this item will not be highlighted itself, but will take the highlighting of the item it is contained in. This is useful for syntax items that don't need any highlighting but are used only to skip over a part of the text.

The "contains=" argument is also inherited from the item it is contained in, unless a "contains" argument is given for the transparent item itself. To avoid that unwanted items are contained, use "contains=NONE". Example, which highlights words in strings, but makes an exception for "vim":

:syn match myString /'[^']*'/ contains=myWord,myVim
:syn match myWord   /\\<[a-z]*\\>/ contained
:syn match myVim    /\\<vim\\>/ transparent contained contains=NONE
:hi link myString String
:hi link myWord   Comment

Since the "myVim" match comes after "myWord" it is the preferred match (last match in the same position overrules an earlier one). The "transparent" argument makes the "myVim" match use the same highlighting as "myString". But it does not contain anything. If the "contains=NONE" argument would be left out, then "myVim" would use the contains argument from myString and allow "myWord" to be contained, which will be highlighted as a Comment. This happens because a contained match doesn't match inside itself in the same position, thus the "myVim" match doesn't overrule the "myWord" match here.

When you look at the colored text, it is like looking at layers of contained items. The contained item is on top of the item it is contained in, thus you see the contained item. When a contained item is transparent, you can look through, thus you see the item it is contained in. In a picture:

 look from here

 | | | | | | V V V V V V

 xxxx yyy more contained items .................... contained item (transparent) ============================= first item

The 'x', 'y' and '=' represent a highlighted syntax item. The '.' represent a transparent group.

What you see is:

 \=======xxxx=======yyy========

Thus you look through the transparent "....".

oneline `:syn-oneline`

The "oneline" argument indicates that the region does not cross a line boundary. It must match completely in the current line. However, when the region has a contained item that does cross a line boundary, it continues on the next line anyway. A contained item can be used to recognize a line continuation pattern. But the "end" pattern must still match in the first line, otherwise the region doesn't even start.

When the start pattern includes a "\\n" to match an end-of-line, the end pattern must be found in the same line as where the start pattern ends. The end pattern may also include an end-of-line. Thus the "oneline" argument means that the end of the start pattern and the start of the end pattern must be within one line. This can't be changed by a skip pattern that matches a line break.

fold `:syn-fold`

The "fold" argument makes the fold level increase by one for this item. Example:

:syn region myFold start="{" end="}" transparent fold
:syn sync fromstart
:set foldmethod=syntax

This will make each {} block form one fold.

The fold will start on the line where the item starts, and end where the item ends. If the start and end are within the same line, there is no fold. The ['foldnestmax'](https://neovim.io/doc/user/options.html#'foldnestmax') option limits the nesting of syntax folds. See [:syn-foldlevel](https://neovim.io/doc/user/syntax.html#%3Asyn-foldlevel) to control how the foldlevel of a line is computed from its syntax items.

`:syn-contains` `E405` `E406` `E407` `E408` `E409`contains={group-name},..

The "contains" argument is followed by a list of syntax group names. These groups will be allowed to begin inside the item (they may extend past the containing group's end). This allows for recursive nesting of matches and regions. If there is no "contains" argument, no groups will be contained in this item. The group names do not need to be defined before they can be used here.

contains=ALL If the only item in the contains list is "ALL", then all groups will be accepted inside the item.

contains=ALLBUT,{group-name},.. If the first item in the contains list is "ALLBUT", then all groups will be accepted inside the item, except the ones that are listed. Example:

:syntax region Block start="{" end="}" ... contains=ALLBUT,Function

contains=TOP If the first item in the contains list is "TOP", then all groups will be accepted that don't have the "contained" argument. contains=TOP,{group-name},.. Like "TOP", but excluding the groups that are listed.

contains=CONTAINED If the first item in the contains list is "CONTAINED", then all groups will be accepted that have the "contained" argument. contains=CONTAINED,{group-name},.. Like "CONTAINED", but excluding the groups that are listed.

The `{group-name}` in the "contains" list can be a pattern. All group names that match the pattern will be included (or excluded, if "ALLBUT" is used). The pattern cannot contain white space or a ','. Example:

... contains=Comment.*,Keyw[0-3]

The matching will be done at moment the syntax command is executed. Groups that are defined later will not be matched. Also, if the current syntax command defines a new group, it is not matched. Be careful: When putting syntax commands in a file you can't rely on groups NOT being defined, because the file may have been sourced before, and ":syn clear" doesn't remove the group names.

The contained groups will also match in the start and end patterns of a region. If this is not wanted, the "matchgroup" argument can be used[:syn-matchgroup](https://neovim.io/doc/user/syntax.html#%3Asyn-matchgroup). The "ms=" and "me=" offsets can be used to change the region where contained items do match. Note that this may also limit the area that is highlighted

containedin={group-name}... `:syn-containedin`

The "containedin" argument is followed by a list of syntax group names. The item will be allowed to begin inside these groups. This works as if the containing item has a "contains=" argument that includes this item.

The `{group-name}`... can be used just like for "contains", as explained above.

This is useful when adding a syntax item afterwards. An item can be told to be included inside an already existing item, without changing the definition of that item. For example, to highlight a word in a C comment after loading the C syntax:

:syn keyword myword HELP containedin=cComment contained

Note that "contained" is also used, to avoid that the item matches at the top level.

Matches for "containedin" are added to the other places where the item can appear. A "contains" argument may also be added as usual. Don't forget that keywords never contain another item, thus adding them to "containedin" won't work.

nextgroup={group-name},.. `:syn-nextgroup`

The "nextgroup" argument is followed by a list of syntax group names, separated by commas (just like with "contains", so you can also use patterns).

If the "nextgroup" argument is given, the mentioned syntax groups will be tried for a match, after the match or region ends. If none of the groups have a match, highlighting continues normally. If there is a match, this group will be used, even when it is not mentioned in the "contains" field of the current group. This is like giving the mentioned group priority over all other groups. Example:

:syntax match  ccFoobar  "Foo.\{-}Bar"  contains=ccFoo
:syntax match  ccFoo     "Foo"            contained nextgroup=ccFiller
:syntax region ccFiller  start="."  matchgroup=ccBar  end="Bar"  contained

This will highlight "Foo" and "Bar" differently, and only when there is a "Bar" after "Foo". In the text line below, "f" shows where ccFoo is used for highlighting, and "bbb" where ccBar is used.

Foo asdfasd Bar asdf Foo asdf Bar asdf
fff               bbb        fff         bbb

Note the use of ".\\{-}" to skip as little as possible until the next Bar. when ".\*" would be used, the "asdf" in between "Bar" and "Foo" would be highlighted according to the "ccFoobar" group, because the ccFooBar match would include the first "Foo" and the last "Bar" in the line (see [pattern](https://neovim.io/doc/user/pattern.html#pattern)).

skipwhite `:syn-skipwhite`skipnl `:syn-skipnl`skipempty `:syn-skipempty`

These arguments are only used in combination with "nextgroup". They can be used to allow the next group to match after skipping some text: skipwhite skip over space and tab characters skipnl skip over the end of a line skipempty skip over empty lines (implies a "skipnl")

When "skipwhite" is present, the white space is only skipped if there is no next group that matches the white space.

When "skipnl" is present, the match with nextgroup may be found in the next line. This only happens when the current item ends at the end of the current line! When "skipnl" is not present, the nextgroup will only be found after the current item in the same line.

When skipping text while looking for a next group, the matches for other groups are ignored. Only when no next group matches, other items are tried for a match again. This means that matching a next group and skipping white space and `\<EOL\>`s has a higher priority than other items.

Example:

:syn match ifstart "\\<if.*"          nextgroup=ifline skipwhite skipempty
:syn match ifline  "[^ \t].*" nextgroup=ifline skipwhite skipempty contained
:syn match ifline  "endif"        contained

Note that the "\[^ \\t\].\*" match matches all non-white text. Thus it would also match "endif". Therefore the "endif" match is put last, so that it takes precedence. Note that this example doesn't work for nested "if"s. You need to add "contains" arguments to make that work (omitted for simplicity of the example).

### IMPLICIT CONCEAL [:syn-conceal-implicit](#%3Asyn-conceal-implicit)

:sy\[ntax\] conceal \[on|off\] This defines if the following ":syntax" commands will define keywords, matches or regions with the "conceal" flag set. After ":syn conceal on", all subsequent ":syn keyword", ":syn match" or ":syn region" defined will have the "conceal" flag set implicitly. ":syn conceal off" returns to the normal state where the "conceal" flag must be given explicitly.

:sy\[ntax\] conceal Show either "syntax conceal on" or "syntax conceal off".

## 8\. Syntax patterns [:syn-pattern](#%3Asyn-pattern) [E401](#E401) [E402](#E402)

In the syntax commands, a pattern must be surrounded by two identical characters. This is like it works for the ":s" command. The most common to use is the double quote. But if the pattern contains a double quote, you can use another character that is not used in the pattern. Examples:

:syntax region Comment  start="/\*"  end="\*/"
:syntax region String   start=+"+    end=+"+         skip=+\\"+

See [pattern](https://neovim.io/doc/user/pattern.html#pattern) for the explanation of what a pattern is. Syntax patterns are always interpreted like the ['magic'](https://neovim.io/doc/user/options.html#'magic') option is set, no matter what the actual value of ['magic'](https://neovim.io/doc/user/options.html#'magic') is. And the patterns are interpreted like the 'l' flag is not included in ['cpoptions'](https://neovim.io/doc/user/options.html#'cpoptions'). This was done to make syntax files portable and independent of the ['magic'](https://neovim.io/doc/user/options.html#'magic') setting.

Try to avoid patterns that can match an empty string, such as "\[a-z\]\*". This slows down the highlighting a lot, because it matches everywhere.

`:syn-pattern-offset`The pattern can be followed by a character offset. This can be used to change the highlighted part, and to change the text area included in the match or region (which only matters when trying to match other items). Both are relative to the matched pattern. The character offset for a skip pattern can be used to tell where to continue looking for an end pattern.

The offset takes the form of "{what}={offset}" The `{what}` can be one of seven strings:

ms Match Start offset for the start of the matched text me Match End offset for the end of the matched text hs Highlight Start offset for where the highlighting starts he Highlight End offset for where the highlighting ends rs Region Start offset for where the body of a region starts re Region End offset for where the body of a region ends lc Leading Context offset past "leading context" of pattern

The `{offset}` can be:

s start of the matched pattern s+{nr} start of the matched pattern plus `{nr}` chars to the right s-{nr} start of the matched pattern plus `{nr}` chars to the left e end of the matched pattern e+{nr} end of the matched pattern plus `{nr}` chars to the right e-{nr} end of the matched pattern plus `{nr}` chars to the left`{nr}` (for "lc" only): start matching `{nr}` chars right of the start

Examples: "ms=s+1", "hs=e-2", "lc=3".

Although all offsets are accepted after any pattern, they are not always meaningful. This table shows which offsets are actually used:

 ms me hs he rs re lc

match item yes yes yes yes - - yes region item start yes - yes - yes - yes region item skip - yes - - - - yes region item end - yes - yes - yes yes

Offsets can be concatenated, with a ',' in between. Example:

:syn match String  /"[^"]*"/hs=s+1,he=e-1

 some "string" text ^^^^^^ highlighted

Notes:

 There must be no white space between the pattern and the character offset(s).

 The highlighted area will never be outside of the matched text.

 A negative offset for an end pattern may not always work, because the end pattern may be detected when the highlighting should already have stopped.

 Before Vim 7.2 the offsets were counted in bytes instead of characters. This didn't work well for multibyte characters, so it was changed with the Vim 7.2 release.

 The start of a match cannot be in a line other than where the pattern matched. This doesn't work: "a\\nb"ms=e. You can make the highlighting start in another line, this does work: "a\\nb"hs=e.

Example (match a comment but don't highlight the `/* and */`):

```routeros
:syntax region Comment start="/\*"hs=e+1 end="\*/"he=s-1
```

/* this is a comment */
  ^^^^^^^^^^^^^^^^^^^          highlighted

A more complicated Example:

```routeros
:syn region Exa matchgroup=Foo start="foo"hs=s+2,rs=e+2 matchgroup=Bar end="bar"me=e-1,he=e-1,re=s-1
```

abcfoostringbarabc
   mmmmmmmmmmm            match
     sssrrreee            highlight start/region/end ("Foo", "Exa" and "Bar")

Leading context `:syn-lc` `:syn-leading` `:syn-context`

Note: This is an obsolete feature, only included for backwards compatibility with previous Vim versions. It's now recommended to use the [/\\@\<=](https://neovim.io/doc/user/pattern.html#%2F%5C%40%3C%3D) construct in the pattern. You can also often use [/\\zs](https://neovim.io/doc/user/pattern.html#%2F%5Czs).

The "lc" offset specifies leading context -- a part of the pattern that must be present, but is not considered part of the match. An offset of "lc=n" will cause Vim to step back n columns before attempting the pattern match, allowing characters which have already been matched in previous patterns to also be used as leading context for this match. This can be used, for instance, to specify that an "escaping" character must not precede the match:

:syn match ZNoBackslash "[^\\]z"ms=s+1
:syn match WNoBackslash "[^\\]w"lc=1
:syn match Underline "_\+"

 \_\_\_zzzz \_\_\_wwww ^^^ ^^^ matches Underline ^ ^ matches ZNoBackslash ^^^^ matches WNoBackslash

The "ms" offset is automatically set to the same value as the "lc" offset, unless you set "ms" explicitly.

Multi-line patterns `:syn-multi-line`

The patterns can include "\\n" to match an end-of-line. Mostly this works as expected, but there are a few exceptions.

When using a start pattern with an offset, the start of the match is not allowed to start in a following line. The highlighting can start in a following line though. Using the "\\zs" item also requires that the start of the match doesn't move to another line.

The skip pattern can include the "\\n", but the search for an end pattern will continue in the first character of the next line, also when that character is matched by the skip pattern. This is because redrawing may start in any line halfway in a region and there is no check if the skip pattern started in a previous line. For example, if the skip pattern is "a\\nb" and an end pattern is "b", the end pattern does match in the second line of this:

x x a
b x x

Generally this means that the skip pattern should not match any characters after the "\\n".

External matches `:syn-ext-match`

These extra regular expression items are available in region patterns:

`/\z(` `/\z(\)` `E50` `E52` `E879` \\z(\\) Marks the sub-expression as "external", meaning that it can be accessed from another pattern match. Currently only usable in defining a syntax region start pattern.

`/\z1` `/\z2` `/\z3` `/\z4` `/\z5` \\z1 ... \\z9 `/\z6` `/\z7` `/\z8` `/\z9` `E66` `E67` Matches the same string that was matched by the corresponding sub-expression in a previous start pattern match.

Sometimes the start and end patterns of a region need to share a common sub-expression. A common example is the "here" document in Perl and many Unix shells. This effect can be achieved with the "\\z" special regular expression items, which marks a sub-expression as "external", in the sense that it can be referenced from outside the pattern in which it is defined. The here-document example, for instance, can be done like this:

:syn region hereDoc start="\<\<\z(\I\i*\)" end="^\z1$"

As can be seen here, the \\z actually does double duty. In the start pattern, it marks the "\\(\\I\\i\*\\)" sub-expression as external; in the end pattern, it changes the \\z1 back-reference into an external reference referring to the first external sub-expression in the start pattern. External references can also be used in skip patterns:

:syn region foo start="start \z(\I\i*\)" skip="not end \z1" end="end \z1"

Note that normal and external sub-expressions are completely orthogonal and indexed separately; for instance, if the pattern "\\z(..\\)\\(..\\)" is applied to the string "aabb", then \\1 will refer to "bb" and \\z1 will refer to "aa". Note also that external sub-expressions cannot be accessed as back-references within the same pattern like normal sub-expressions. If you want to use one sub-expression as both a normal and an external sub-expression, you can nest the two, as in "\\(\\z(...\\)\\)".

Note that only matches within a single line can be used. Multi-line matches cannot be referred to.

## 9\. Syntax clusters [:syn-cluster](#%3Asyn-cluster) [E400](#E400)

:sy\[ntax\] cluster `{cluster-name}` \[contains={group-name}..\] \[add={group-name}..\] \[remove={group-name}..\]

This command allows you to cluster a list of syntax groups together under a single name.

 contains={group-name}.. The cluster is set to the specified list of groups. add={group-name}.. The specified groups are added to the cluster. remove={group-name}.. The specified groups are removed from the cluster.

A cluster so defined may be referred to in a contains=.., containedin=.., nextgroup=.., add=.. or remove=.. list with a "@" prefix. You can also use this notation to implicitly declare a cluster before specifying its contents.

Example:

:syntax match Thing "# [^#]\+ #" contains=@ThingMembers
:syntax cluster ThingMembers contains=ThingMember1,ThingMember2

As the previous example suggests, modifications to a cluster are effectively retroactive; the membership of the cluster is checked at the last minute, so to speak:

:syntax keyword A aaa
:syntax keyword B bbb
:syntax cluster AandB contains=A
:syntax match Stuff "( aaa bbb )" contains=@AandB
:syntax cluster AandB add=B          " now both keywords are matched in Stuff

This also has implications for nested clusters:

:syntax keyword A aaa
:syntax keyword B bbb
:syntax cluster SmallGroup contains=B
:syntax cluster BigGroup contains=A,@SmallGroup
:syntax match Stuff "( aaa bbb )" contains=@BigGroup
:syntax cluster BigGroup remove=B        " no effect, since B isn't in BigGroup
:syntax cluster SmallGroup remove=B        " now bbb isn't matched within Stuff

`E848`The maximum number of clusters is 9767.

## 10\. Including syntax files [:syn-include](#%3Asyn-include) [E397](#E397)

It is often useful for one language's syntax file to include a syntax file for a related language. Depending on the exact relationship, this can be done in two different ways:

 If top-level syntax items in the included syntax file are to be allowed at the top level in the including syntax, you can simply use the [:runtime](https://neovim.io/doc/user/repeat.html#%3Aruntime) command:

" In cpp.vim:
:runtime! syntax/c.vim
:unlet b:current_syntax

 If top-level syntax items in the included syntax file are to be contained within a region in the including syntax, you can use the ":syntax include" command:

:sy\[ntax\] include \[@{grouplist-name}\] `{file-name}`

 All syntax items declared in the included file will have the "contained" flag added. In addition, if a group list is specified, all top-level syntax items in the included file will be added to that list.

" In perl.vim:
:syntax include @Pod \<sfile\>:p:h/pod.vim
:syntax region perlPOD start="^=head" end="^=cut" contains=@Pod

 When `{file-name}` is an absolute path (starts with "/", "c:", "$VAR" or "\<sfile\>") that file is sourced. When it is a relative path (e.g., "syntax/pod.vim") the file is searched for in ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath'). All matching files are loaded. Using a relative path is recommended, because it allows a user to replace the included file with their own version, without replacing the file that does the ":syn include".

`E847`The maximum number of includes is 999.

## 11\. Synchronizing [:syn-sync](#%3Asyn-sync) [E403](#E403) [E404](#E404)

Vim wants to be able to start redrawing in any position in the document. To make this possible it needs to know the syntax state at the position where redrawing starts.

:sy\[ntax\] sync \[ccomment \[group-name\] | minlines={N} | ...\]

There are four ways to synchronize: 1\. Always parse from the start of the file.[:syn-sync-first](https://neovim.io/doc/user/syntax.html#%3Asyn-sync-first)2\. Based on C-style comments. Vim understands how C-comments work and can figure out if the current line starts inside or outside a comment.[:syn-sync-second](https://neovim.io/doc/user/syntax.html#%3Asyn-sync-second)3\. Jumping back a certain number of lines and start parsing there.[:syn-sync-third](https://neovim.io/doc/user/syntax.html#%3Asyn-sync-third)4\. Searching backwards in the text for a pattern to sync on.[:syn-sync-fourth](https://neovim.io/doc/user/syntax.html#%3Asyn-sync-fourth)

`:syn-sync-maxlines` `:syn-sync-minlines`For the last three methods, the line range where the parsing can start is limited by "minlines" and "maxlines".

If the "minlines={N}" argument is given, the parsing always starts at least that many lines backwards. This can be used if the parsing may take a few lines before it's correct, or when it's not possible to use syncing.

If the "maxlines={N}" argument is given, the number of lines that are searched for a comment or syncing pattern is restricted to N lines backwards (after adding "minlines"). This is useful if you have few things to sync on and a slow machine. Example:

:syntax sync maxlines=500 ccomment

`:syn-sync-linebreaks`When using a pattern that matches multiple lines, a change in one line may cause a pattern to no longer match in a previous line. This means has to start above where the change was made. How many lines can be specified with the "linebreaks" argument. For example, when a pattern may include one line break use this:

:syntax sync linebreaks=1

The result is that redrawing always starts at least one line before where a change was made. The default value for "linebreaks" is zero. Usually the value for "minlines" is bigger than "linebreaks".

First syncing method: `:syn-sync-first`

:syntax sync fromstart

The file will be parsed from the start. This makes syntax highlighting accurate, but can be slow for long files. Vim caches previously parsed text, so that it's only slow when parsing the text for the first time. However, when making changes some part of the text needs to be parsed again (worst case: to the end of the file).

Using "fromstart" is equivalent to using "minlines" with a very large number.

Second syncing method: `:syn-sync-second` 

For the second method, only the "ccomment" argument needs to be given. Example:

:syntax sync ccomment

When Vim finds that the line where displaying starts is inside a C-style comment, the last region syntax item with the group-name "Comment" will be used. This requires that there is a region with the group-name "Comment"! An alternate group name can be specified, for example:

:syntax sync ccomment javaComment

This means that the last item specified with "syn region javaComment" will be used for the detected C comment region. This only works properly if that region does have a start pattern "\\/\*" and an end pattern "\*\\/".

The "maxlines" argument can be used to restrict the search to a number of lines. The "minlines" argument can be used to at least start a number of lines back (e.g., for when there is some construct that only takes a few lines, but it hard to sync on).

Note: Syncing on a C comment doesn't work properly when strings are used that cross a line and contain a "\*/". Since letting strings cross a line is a bad programming habit (many compilers give a warning message), and the chance of a "\*/" appearing inside a comment is very small, this restriction is hardly ever noticed.

Third syncing method: `:syn-sync-third`

For the third method, only the "minlines={N}" argument needs to be given. Vim will subtract `{N}` from the line number and start parsing there. This means `{N}` extra lines need to be parsed, which makes this method a bit slower. Example:

:syntax sync minlines=50

"lines" is equivalent to "minlines" (used by older versions).

Fourth syncing method: `:syn-sync-fourth`

The idea is to synchronize on the end of a few specific regions, called a sync pattern. Only regions can cross lines, so when we find the end of some region, we might be able to know in which syntax item we are. The search starts in the line just above the one where redrawing starts. From there the search continues backwards in the file.

This works just like the non-syncing syntax items. You can use contained matches, nextgroup, etc. But there are a few differences:

 Keywords cannot be used.

 The syntax items with the "sync" keyword form a completely separated group of syntax items. You can't mix syncing groups and non-syncing groups.

 The matching works backwards in the buffer (line by line), instead of forwards.

 A line continuation pattern can be given. It is used to decide which group of lines need to be searched like they were one line. This means that the search for a match with the specified items starts in the first of the consecutive lines that contain the continuation pattern.

 When using "nextgroup" or "contains", this only works within one line (or group of continued lines).

 When using a region, it must start and end in the same line (or group of continued lines). Otherwise the end is assumed to be at the end of the line (or group of continued lines).

 When a match with a sync pattern is found, the rest of the line (or group of continued lines) is searched for another match. The last match is used. This is used when a line can contain both the start end the end of a region (e.g., in a C-comment like `/* this */`, the last "\*/" is used).

There are two ways how a match with a sync pattern can be used: 1\. Parsing for highlighting starts where redrawing starts (and where the search for the sync pattern started). The syntax group that is expected to be valid there must be specified. This works well when the regions that cross lines cannot contain other regions. 2\. Parsing for highlighting continues just after the match. The syntax group that is expected to be present just after the match must be specified. This can be used when the previous method doesn't work well. It's much slower, because more text needs to be parsed. Both types of sync patterns can be used at the same time.

Besides the sync patterns, other matches and regions can be specified, to avoid finding unwanted matches.

\[The reason that the sync patterns are given separately, is that mostly the search for the sync point can be much simpler than figuring out the highlighting. The reduced number of patterns means it will go (much) faster.\]

`syn-sync-grouphere` `E393` `E394` :syntax sync match `{sync-group-name}` grouphere `{group-name}` "pattern" ..

 Define a match that is used for syncing. `{group-name}` is the name of a syntax group that follows just after the match. Parsing of the text for highlighting starts just after the match. A region must exist for this `{group-name}`. The first one defined will be used. "NONE" can be used for when there is no syntax group after the match.

`syn-sync-groupthere` :syntax sync match `{sync-group-name}` groupthere `{group-name}` "pattern" ..

 Like "grouphere", but `{group-name}` is the name of a syntax group that is to be used at the start of the line where searching for the sync point started. The text between the match and the start of the sync pattern searching is assumed not to change the syntax highlighting. For example, in C you could search backwards for "/\*" and "\*/". If "/\*" is found first, you know that you are inside a comment, so the "groupthere" is "cComment". If "\*/" is found first, you know that you are not in a comment, so the "groupthere" is "NONE". (in practice it's a bit more complicated, because the "/\*" and "\*/" could appear inside a string. That's left as an exercise to the reader...).

 :syntax sync match .. :syntax sync region ..

 Without a "groupthere" argument. Define a region or match that is skipped while searching for a sync point.

`syn-sync-linecont` :syntax sync linecont `{pattern}`

 When `{pattern}` matches in a line, it is considered to continue in the next line. This means that the search for a sync point will consider the lines to be concatenated.

If the "maxlines={N}" argument is given too, the number of lines that are searched for a match is restricted to N. This is useful if you have very few things to sync on and a slow machine. Example:

:syntax sync maxlines=100

You can clear all sync settings with:

:syntax sync clear

You can clear specific sync patterns with:

:syntax sync clear {sync-group-name} ..

## 12\. Listing syntax items [:syntax](#%3Asyntax) [:sy](#%3Asy) [:syn](#%3Asyn) [:syn-list](#%3Asyn-list)

This command lists all the syntax items:

:sy[ntax] [list]

To show the syntax items for one syntax group:

:sy[ntax] list {group-name}

To list the syntax groups in one cluster: `E392`

:sy[ntax] list @{cluster-name}

See above for other arguments for the ":syntax" command.

Note that the ":syntax" command can be abbreviated to ":sy", although ":syn" is mostly used, because it looks better.

## 13\. Highlight command [:highlight](#%3Ahighlight) [:hi](#%3Ahi) [E28](#E28) [E411](#E411) [E415](#E415)

There are two types of highlight groups:

 The ones used for specific languages. For these the name starts with the name of the language. Many of these don't have any attributes, but are linked to a group of the second type.`hitest.vim`You can see all the groups currently active with this command:

:so $VIMRUNTIME/syntax/hitest.vim

This will open a new window containing all highlight group names, displayed in their own color.

`:colo` `:colorscheme` `E185`:colo\[rscheme\] Output the name of the currently active color scheme. This is basically the same as

:echo g:colors_name

 In case g:colors\_name has not been defined :colo will output "default".

:colo\[rscheme\] `{name}` Load color scheme `{name}`. This searches ['runtimepath'](https://neovim.io/doc/user/options.html#'runtimepath') for the file "colors/{name}.{vim,lua}". The first one that is found is loaded. Note: "colors/{name}.vim" is tried first. Also searches all plugins in ['packpath'](https://neovim.io/doc/user/options.html#'packpath'), first below "start" and then under "opt".

 Doesn't work recursively, thus you can't use ":colorscheme" in a color scheme script.

 To customize a color scheme use another name, e.g. "\~/.config/nvim/colors/mine.vim", and use `:runtime` to load the original color scheme:

runtime colors/evening.vim
hi Statement ctermfg=Blue guifg=Blue

 Before the color scheme will be loaded the[ColorSchemePre](https://neovim.io/doc/user/autocmd.html#ColorSchemePre) autocommand event is triggered. After the color scheme has been loaded the[ColorScheme](https://neovim.io/doc/user/autocmd.html#ColorScheme) autocommand event is triggered. For info about writing a color scheme file:

:edit $VIMRUNTIME/colors/README.txt

:hi\[ghlight\] List all the current highlight groups that have attributes set.

:hi\[ghlight\] `{group-name}` List one highlight group.

`highlight-clear` `:hi-clear`:hi\[ghlight\] clear Reset all highlighting to the defaults. Removes all highlighting for groups added by the user. Uses the current value of ['background'](https://neovim.io/doc/user/options.html#'background') to decide which default colors to use. If there was a default link, restore it. [:hi-link](https://neovim.io/doc/user/syntax.html#%3Ahi-link)

:hi\[ghlight\] clear `{group-name}`:hi\[ghlight\] `{group-name}` NONE Disable the highlighting for one highlight group. It is \_not\_ set back to the default colors.

:hi\[ghlight\] \[default\] `{group-name}` `{key}`\={arg} .. Add a highlight group, or change the highlighting for an existing group. See [highlight-args](https://neovim.io/doc/user/syntax.html#highlight-args) for the `{key}`\={arg} arguments. See [:highlight-default](https://neovim.io/doc/user/syntax.html#%3Ahighlight-default) for the optional \[default\] argument.

Normally a highlight group is added once when starting up. This sets the default values for the highlighting. After that, you can use additional highlight commands to change the arguments that you want to set to non-default values. The value "NONE" can be used to switch the value off or go back to the default value.

A simple way to change colors is with the [:colorscheme](https://neovim.io/doc/user/syntax.html#%3Acolorscheme) command. This loads a file with ":highlight" commands such as this:

:hi Comment        gui=bold

Note that all settings that are not included remain the same, only the specified field is used, and settings are merged with previous ones. So, the result is like this single command has been used:

:hi Comment        ctermfg=Cyan guifg=#80a0ff gui=bold

`:highlight-verbose`When listing a highlight group and ['verbose'](https://neovim.io/doc/user/options.html#'verbose') is non-zero, the listing will also tell where it was last set. Example:

:verbose hi Comment

 Comment xxx ctermfg=4 guifg=Blue

 Last set from /home/mool/vim/vim7/runtime/syntax/syncolor.vim

When ":hi clear" is used then the script where this command is used will be mentioned for the default values. See [:verbose-cmd](https://neovim.io/doc/user/various.html#%3Averbose-cmd) for more information.

`highlight-args` `E416` `E417` `E423`There are two types of UIs for highlighting: cterm terminal UI ([TUI](https://neovim.io/doc/user/term.html#TUI)) gui GUI or RGB-capable TUI (['termguicolors'](https://neovim.io/doc/user/options.html#'termguicolors'))

For each type the highlighting can be given. This makes it possible to use the same syntax file on all UIs.

1\. TUI highlight arguments

`bold` `underline` `undercurl` `underdouble` `underdotted` `underdashed` `inverse` `italic` `standout` `strikethrough` `altfont` `nocombine`cterm={attr-list} `attr-list` `highlight-cterm` `E418` attr-list is a comma-separated list (without spaces) of the following items (in any order): bold underline undercurl curly underline underdouble double underline underdotted dotted underline underdashed dashed underline strikethrough reverse inverse same as reverse italic standout altfont nocombine override attributes instead of combining them NONE no attributes used (used to reset it)

 Note that "bold" can be used here and by using a bold font. They have the same effect. "undercurl", "underdouble", "underdotted", and "underdashed" fall back to "underline" in a terminal that does not support them. The color is set using [guisp](https://neovim.io/doc/user/syntax.html#guisp).

start={term-list} `highlight-start` `E422`stop={term-list} `term-list` `highlight-stop` These lists of terminal codes can be used to get non-standard attributes on a terminal.

 The escape sequence specified with the "start" argument is written before the characters in the highlighted area. It can be anything that you want to send to the terminal to highlight this area. The escape sequence specified with the "stop" argument is written after the highlighted area. This should undo the "start" argument. Otherwise the screen will look messed up.

`{term-list}` is a string with escape sequences. This is any string of characters, except that it can't start with "t\_" and blanks are not allowed. The \<\> notation is recognized here, so you can use things like "\<Esc\>" and "\<Space\>". Example: start=\<Esc\>\[27h;\<Esc\>\[`\<Space\>`r;

ctermfg={color-nr} `ctermfg` `E421`ctermbg={color-nr} `ctermbg` The `{color-nr}` argument is a color number. Its range is zero to (not including) the number of [tui-colors](https://neovim.io/doc/user/term.html#tui-colors) available. The actual color with this number depends on the type of terminal and its settings. Sometimes the color also depends on the settings of "cterm". For example, on some systems "cterm=bold ctermfg=3" gives another color, on others you just get color 3.

 The following (case-insensitive) names are recognized:

`cterm-colors`

 NR-16 NR-8 COLOR NAME

 0 0 Black 1 4 DarkBlue 2 2 DarkGreen 3 6 DarkCyan 4 1 DarkRed 5 5 DarkMagenta 6 3 Brown, DarkYellow 7 7 LightGray, LightGrey, Gray, Grey 8 0\* DarkGray, DarkGrey 9 4\* Blue, LightBlue 10 2\* Green, LightGreen 11 6\* Cyan, LightCyan 12 1\* Red, LightRed 13 5\* Magenta, LightMagenta 14 3\* Yellow, LightYellow 15 7\* White

 The number under "NR-16" is used for 16-color terminals ('t\_Co' greater than or equal to 16). The number under "NR-8" is used for 8-color terminals ('t\_Co' less than 16). The "\*" indicates that the bold attribute is set for ctermfg. In many 8-color terminals (e.g., "linux"), this causes the bright colors to appear. This doesn't work for background colors! Without the "\*" the bold attribute is removed. If you want to set the bold attribute in a different way, put a "cterm=" argument AFTER the "ctermfg=" or "ctermbg=" argument. Or use a number instead of a color name.

 Note that for 16 color ansi style terminals (including xterms), the numbers in the NR-8 column is used. Here "\*" means "add 8" so that Blue is 12, DarkGray is 8 etc.

 Note that for some color terminals these names may result in the wrong colors!

 You can also use "NONE" to remove the color.

`:hi-normal-cterm` When setting the "ctermfg" or "ctermbg" colors for the Normal group, these will become the colors used for the non-highlighted text. Example:

:highlight Normal ctermfg=grey ctermbg=darkblue

 When setting the "ctermbg" color for the Normal group, the['background'](https://neovim.io/doc/user/options.html#'background') option will be adjusted automatically, under the condition that the color is recognized and ['background'](https://neovim.io/doc/user/options.html#'background') was not set explicitly. This causes the highlight groups that depend on['background'](https://neovim.io/doc/user/options.html#'background') to change! This means you should set the colors for Normal first, before setting other colors. When a color scheme is being used, changing ['background'](https://neovim.io/doc/user/options.html#'background') causes it to be reloaded, which may reset all colors (including Normal). First delete the "g:colors\_name" variable when you don't want this.

 When you have set "ctermfg" or "ctermbg" for the Normal group, Vim needs to reset the color when exiting. This is done with the "orig\_pair" [terminfo](https://neovim.io/doc/user/term.html#terminfo) entry.`E419` `E420` When Vim knows the normal foreground and background colors, "fg" and "bg" can be used as color names. This only works after setting the colors for the Normal group and for the MS-Windows console. Example, for reverse video:

:highlight Visual ctermfg=bg ctermbg=fg

 Note that the colors are used that are valid at the moment this command are given. If the Normal group colors are changed later, the "fg" and "bg" colors will not be adjusted.

2\. GUI highlight arguments

gui={attr-list} `highlight-gui` These give the attributes to use in the GUI mode. See [attr-list](https://neovim.io/doc/user/syntax.html#attr-list) for a description. Note that "bold" can be used here and by using a bold font. They have the same effect. Note that the attributes are ignored for the "Normal" group.

font={font-name} `highlight-font` font-name is the name of a font, as it is used on the system Vim runs on. For X11 this is a complicated name, for example:

font=-misc-fixed-bold-r-normal--14-130-75-75-c-70-iso8859-1

 The font-name "NONE" can be used to revert to the default font. When setting the font for the "Normal" group, this becomes the default font (until the ['guifont'](https://neovim.io/doc/user/options.html#'guifont') option is changed; the last one set is used). The following only works with Motif not with other GUIs: When setting the font for the "Menu" group, the menus will be changed. When setting the font for the "Tooltip" group, the tooltips will be changed. All fonts used, except for Menu and Tooltip, should be of the same character size as the default font! Otherwise redrawing problems will occur. To use a font name with an embedded space or other special character, put it in single quotes. The single quote cannot be used then. Example:

:hi comment font='Monospace 10'

guifg={color-name} `guifg`guibg={color-name} `guibg`guisp={color-name} `guisp` These give the foreground (guifg), background (guibg) and special (guisp) color to use in the GUI. "guisp" is used for various underlines. There are a few special names: NONE no color (transparent) bg use normal background color background use normal background color fg use normal foreground color foreground use normal foreground color To use a color name with an embedded space or other special character, put it in single quotes. The single quote cannot be used then. Example:

:hi comment guifg='salmon pink'

`gui-colors` Suggested color names (these are available on most systems): Red LightRed DarkRed Green LightGreen DarkGreen SeaGreen Blue LightBlue DarkBlue SlateBlue Cyan LightCyan DarkCyan Magenta LightMagenta DarkMagenta Yellow LightYellow Brown DarkYellow Gray LightGray DarkGray Black White Orange Purple Violet

 You can also specify a color by its RGB (red, green, blue) values. The format is "#rrggbb", where "rr" is the Red value "gg" is the Green value "bb" is the Blue value All values are hexadecimal, range from "00" to "ff". Examples:

:highlight Comment guifg=#11f0c3 guibg=#ff00ff

blend={integer} `highlight-blend` Override the blend level for a highlight group within the popupmenu or floating windows. Only takes effect if ['pumblend'](https://neovim.io/doc/user/options.html#'pumblend') or ['winblend'](https://neovim.io/doc/user/options.html#'winblend') is set for the menu or window. See the help at the respective option.

`highlight-groups` `highlight-default`These are the builtin highlighting groups. Note that the highlighting depends on the value of ['background'](https://neovim.io/doc/user/options.html#'background'). You can see the current settings with the ":highlight" command.`hl-ColorColumn`ColorColumn Used for the columns set with ['colorcolumn'](https://neovim.io/doc/user/options.html#'colorcolumn').`hl-Conceal`Conceal Placeholder characters substituted for concealed text (see ['conceallevel'](https://neovim.io/doc/user/options.html#'conceallevel')).`hl-CurSearch`CurSearch Used for highlighting a search pattern under the cursor (see ['hlsearch'](https://neovim.io/doc/user/options.html#'hlsearch')).`hl-Cursor` `hl-lCursor`Cursor Character under the cursor. lCursor Character under the cursor when [language-mapping](https://neovim.io/doc/user/map.html#language-mapping) is used (see ['guicursor'](https://neovim.io/doc/user/options.html#'guicursor')).`hl-CursorIM`CursorIM Like Cursor, but used when in IME mode. `CursorIM` `hl-CursorColumn`CursorColumn Screen-column at the cursor, when ['cursorcolumn'](https://neovim.io/doc/user/options.html#'cursorcolumn') is set.`hl-CursorLine`CursorLine Screen-line at the cursor, when ['cursorline'](https://neovim.io/doc/user/options.html#'cursorline') is set. Low-priority if foreground (ctermfg OR guifg) is not set.`hl-Directory`Directory Directory names (and other special names in listings).`hl-DiffAdd`DiffAdd Diff mode: Added line. [diff.txt](https://neovim.io/doc/user/diff.html#diff.txt) `hl-DiffChange`DiffChange Diff mode: Changed line. [diff.txt](https://neovim.io/doc/user/diff.html#diff.txt) `hl-DiffDelete`DiffDelete Diff mode: Deleted line. [diff.txt](https://neovim.io/doc/user/diff.html#diff.txt) `hl-DiffText`DiffText Diff mode: Changed text within a changed line. [diff.txt](https://neovim.io/doc/user/diff.html#diff.txt) `hl-EndOfBuffer`EndOfBuffer Filler lines (\~) after the end of the buffer. By default, this is highlighted like [hl-NonText](https://neovim.io/doc/user/syntax.html#hl-NonText).`hl-TermCursor`TermCursor Cursor in a focused terminal.`hl-TermCursorNC`TermCursorNC Cursor in an unfocused terminal.`hl-ErrorMsg`ErrorMsg Error messages on the command line.`hl-WinSeparator`WinSeparator Separators between window splits.`hl-Folded`Folded Line used for closed folds.`hl-FoldColumn`FoldColumn ['foldcolumn'](https://neovim.io/doc/user/options.html#'foldcolumn') `hl-SignColumn`SignColumn Column where [signs](https://neovim.io/doc/user/sign.html#signs) are displayed.`hl-IncSearch`IncSearch ['incsearch'](https://neovim.io/doc/user/options.html#'incsearch') highlighting; also used for the text replaced with ":s///c".`hl-Substitute`Substitute [:substitute](https://neovim.io/doc/user/change.html#%3Asubstitute) replacement text highlighting.

`hl-LineNr`LineNr Line number for ":number" and ":#" commands, and when ['number'](https://neovim.io/doc/user/options.html#'number') or ['relativenumber'](https://neovim.io/doc/user/options.html#'relativenumber') option is set.`hl-LineNrAbove`LineNrAbove Line number for when the ['relativenumber'](https://neovim.io/doc/user/options.html#'relativenumber') option is set, above the cursor line.`hl-LineNrBelow`LineNrBelow Line number for when the ['relativenumber'](https://neovim.io/doc/user/options.html#'relativenumber') option is set, below the cursor line.`hl-CursorLineNr`CursorLineNr Like LineNr when ['cursorline'](https://neovim.io/doc/user/options.html#'cursorline') is set and ['cursorlineopt'](https://neovim.io/doc/user/options.html#'cursorlineopt') contains "number" or is "both", for the cursor line.`hl-CursorLineFold`CursorLineFold Like FoldColumn when ['cursorline'](https://neovim.io/doc/user/options.html#'cursorline') is set for the cursor line.`hl-CursorLineSign`CursorLineSign Like SignColumn when ['cursorline'](https://neovim.io/doc/user/options.html#'cursorline') is set for the cursor line.`hl-MatchParen`MatchParen Character under the cursor or just before it, if it is a paired bracket, and its match. [pi\_paren.txt](https://neovim.io/doc/user/pi%5Fparen.html#pi%5Fparen.txt)

`hl-ModeMsg`ModeMsg ['showmode'](https://neovim.io/doc/user/options.html#'showmode') message (e.g., "-- INSERT --").`hl-MsgArea`MsgArea Area for messages and cmdline.`hl-MsgSeparator`MsgSeparator Separator for scrolled messages [msgsep](https://neovim.io/doc/user/vim%5Fdiff.html#msgsep).`hl-MoreMsg`MoreMsg [more-prompt](https://neovim.io/doc/user/message.html#more-prompt) `hl-NonText`NonText '@' at the end of the window, characters from ['showbreak'](https://neovim.io/doc/user/options.html#'showbreak') and other characters that do not really exist in the text (e.g., "\>" displayed when a double-wide character doesn't fit at the end of the line). See also [hl-EndOfBuffer](https://neovim.io/doc/user/syntax.html#hl-EndOfBuffer).`hl-Normal`Normal Normal text.`hl-NormalFloat`NormalFloat Normal text in floating windows.`hl-FloatBorder`FloatBorder Border of floating windows.`hl-FloatTitle`FloatTitle Title of floating windows. FloatFooter Footer of floating windows.`hl-NormalNC`NormalNC Normal text in non-current windows. Pmenu Popup menu: Normal item. PmenuSel Popup menu: Selected item. PmenuKind Popup menu: Normal item "kind". PmenuKindSel Popup menu: Selected item "kind". PmenuExtra Popup menu: Normal item "extra text". PmenuExtraSel Popup menu: Selected item "extra text". PmenuSbar Popup menu: Scrollbar. PmenuThumb Popup menu: Thumb of the scrollbar.`hl-Question`Question [hit-enter](https://neovim.io/doc/user/message.html#hit-enter) prompt and yes/no questions.`hl-QuickFixLine`QuickFixLine Current [quickfix](https://neovim.io/doc/user/quickfix.html#quickfix) item in the quickfix window. Combined with[hl-CursorLine](https://neovim.io/doc/user/syntax.html#hl-CursorLine) when the cursor is there.`hl-Search`Search Last search pattern highlighting (see ['hlsearch'](https://neovim.io/doc/user/options.html#'hlsearch')). Also used for similar items that need to stand out.`hl-SpecialKey`SpecialKey Unprintable characters: Text displayed differently from what it really is. But not ['listchars'](https://neovim.io/doc/user/options.html#'listchars') whitespace. [hl-Whitespace](https://neovim.io/doc/user/syntax.html#hl-Whitespace) `hl-SpellBad`SpellBad Word that is not recognized by the spellchecker. [spell](https://neovim.io/doc/user/spell.html#spell) Combined with the highlighting used otherwise.`hl-SpellCap`SpellCap Word that should start with a capital. [spell](https://neovim.io/doc/user/spell.html#spell) Combined with the highlighting used otherwise.`hl-SpellLocal`SpellLocal Word that is recognized by the spellchecker as one that is used in another region. [spell](https://neovim.io/doc/user/spell.html#spell) Combined with the highlighting used otherwise.`hl-SpellRare`SpellRare Word that is recognized by the spellchecker as one that is hardly ever used. [spell](https://neovim.io/doc/user/spell.html#spell) Combined with the highlighting used otherwise.`hl-StatusLine`StatusLine Status line of current window.`hl-StatusLineNC`StatusLineNC Status lines of not-current windows.`hl-TabLine`TabLine Tab pages line, not active tab page label.`hl-TabLineFill`TabLineFill Tab pages line, where there are no labels.`hl-TabLineSel`TabLineSel Tab pages line, active tab page label.`hl-Title`Title Titles for output from ":set all", ":autocmd" etc.`hl-Visual`Visual Visual mode selection.`hl-VisualNOS`VisualNOS Visual mode selection when vim is "Not Owning the Selection".`hl-WarningMsg`WarningMsg Warning messages.`hl-Whitespace`Whitespace "nbsp", "space", "tab", "multispace", "lead" and "trail" in ['listchars'](https://neovim.io/doc/user/options.html#'listchars'). WildMenu Current match in ['wildmenu'](https://neovim.io/doc/user/options.html#'wildmenu') completion.`hl-WinBar`WinBar Window bar of current window.`hl-WinBarNC`WinBarNC Window bar of not-current windows.

`hl-User1` `hl-User1..9` `hl-User9`The ['statusline'](https://neovim.io/doc/user/options.html#'statusline') syntax allows the use of 9 different highlights in the statusline and ruler (via ['rulerformat'](https://neovim.io/doc/user/options.html#'rulerformat')). The names are User1 to User9.

For the GUI you can use the following groups to set the colors for the menu, scrollbars and tooltips. They don't have defaults. This doesn't work for the Win32 GUI. Only three highlight arguments have any effect here: font, guibg, and guifg.

Menu Current font, background and foreground colors of the menus. Also used for the toolbar. Applicable highlight arguments: font, guibg, guifg.

`hl-Scrollbar`Scrollbar Current background and foreground of the main window's scrollbars. Applicable highlight arguments: guibg, guifg.

`hl-Tooltip`Tooltip Current font, background and foreground of the tooltips. Applicable highlight arguments: font, guibg, guifg.

## 14\. Linking groups [:hi-link](#%3Ahi-link) [:highlight-link](#%3Ahighlight-link) [E412](#E412) [E413](#E413)

When you want to use the same highlighting for several syntax groups, you can do this more easily by linking the groups into one common highlight group, and give the color attributes only for that group.

To set a link:

 :hi\[ghlight\]\[!\] \[default\] link `{from-group}` `{to-group}`

To remove a link:

 :hi\[ghlight\]\[!\] \[default\] link `{from-group}` NONE

Notes: `E414`

 If the `{from-group}` and/or `{to-group}` doesn't exist, it is created. You don't get an error message for a non-existing group.

 As soon as you use a ":highlight" command for a linked group, the link is removed.

 If there are already highlight settings for the `{from-group}`, the link is not made, unless the '!' is given. For a ":highlight link" command in a sourced file, you don't get an error message. This can be used to skip links for groups that already have settings.

`:hi-default` `:highlight-default`The \[default\] argument is used for setting the default highlighting for a group. If highlighting has already been specified for the group the command will be ignored. Also when there is an existing link.

Using \[default\] is especially useful to overrule the highlighting of a specific syntax file. For example, the C syntax file contains:

:highlight default link cComment Comment

If you like Question highlighting for C comments, put this in your vimrc file:

:highlight link cComment Question

Without the "default" in the C syntax file, the highlighting would be overruled when the syntax file is loaded.

To have a link survive `:highlight clear`, which is useful if you have highlighting for a specific filetype and you want to keep it when selecting another color scheme, put a command like this in the "after/syntax/{filetype}.vim" file:

highlight! default link cComment Question

## 15\. Cleaning up [:syn-clear](#%3Asyn-clear) [E391](#E391)

If you want to clear the syntax stuff for the current buffer, you can use this command:

:syntax clear

This command should be used when you want to switch off syntax highlighting, or when you want to switch to using another syntax. It's normally not needed in a syntax file itself, because syntax is cleared by the autocommands that load the syntax file. The command also deletes the "b:current\_syntax" variable, since no syntax is loaded after this command.

To clean up specific syntax groups for the current buffer:

:syntax clear {group-name} ..

This removes all patterns and keywords for `{group-name}`.

To clean up specific syntax group lists for the current buffer:

:syntax clear @{grouplist-name} ..

This sets `{grouplist-name}`'s contents to an empty list.

`:syntax-off` `:syn-off`If you want to disable syntax highlighting for all buffers, you need to remove the autocommands that load the syntax files:

:syntax off

What this command actually does, is executing the command

:source $VIMRUNTIME/syntax/nosyntax.vim

See the "nosyntax.vim" file for details. Note that for this to work $VIMRUNTIME must be valid. See [$VIMRUNTIME](https://neovim.io/doc/user/starting.html#%24VIMRUNTIME).

`:syntax-reset` `:syn-reset`If you have changed the colors and messed them up, use this command to get the defaults back:

:syntax reset

It is a bit of a wrong name, since it does not reset any syntax items, it only affects the highlighting.

Note that the syntax colors that you set in your vimrc file will also be reset back to their Vim default. Note that if you are using a color scheme, the colors defined by the color scheme for syntax highlighting will be lost.

Note that when a color scheme is used, there might be some confusion whether your defined colors are to be used or the colors from the scheme. This depends on the color scheme file. See [:colorscheme](https://neovim.io/doc/user/syntax.html#%3Acolorscheme).

## 16\. Highlighting tags [tag-highlight](#tag-highlight)

If you want to highlight all the tags in your file, you can use the following mappings.

`\<F11\>` \-- Generate tags.vim file, and highlight tags.`\<F12\>` \-- Just highlight tags based on existing tags.vim file.

:map \<F11\>  :sp tags\<CR\>:%s/^\([^        :]*:\)\=\([^        ]*\).*/syntax keyword Tag \2/\<CR\>:wq! tags.vim\<CR\>/^\<CR\>\<F12\>
:map \<F12\>  :so tags.vim\<CR\>

WARNING: The longer the tags file, the slower this will be, and the more memory Vim will consume.

Only highlighting typedefs, unions and structs can be done too. For this you must use Universal Ctags ([https://ctags.io](https://ctags.io/)) or Exuberant ctags.

Put these lines in your Makefile:

# Make a highlight file for types.  Requires Universal/Exuberant ctags and awk
types: types.vim
types.vim: *.[ch]
        ctags --c-kinds=gstu -o- *.[ch] |\
                awk 'BEGIN{printf("syntax keyword Type\t")}\
                        {printf("%s ", $$1)}END{print ""}' \> $@

And put these lines in your vimrc:

" load the types.vim highlighting file, if it exists
autocmd BufRead,BufNewFile *.[ch] let fname = expand('\<afile\>:p:h') .. '/types.vim'
autocmd BufRead,BufNewFile *.[ch] if filereadable(fname)
autocmd BufRead,BufNewFile *.[ch]   exe 'so ' .. fname
autocmd BufRead,BufNewFile *.[ch] endif

## 17\. Window-local syntax [:ownsyntax](#%3Aownsyntax)

Normally all windows on a buffer share the same syntax settings. It is possible, however, to set a particular window on a file to have its own private syntax setting. A possible example would be to edit LaTeX source with conventional highlighting in one window, while seeing the same source highlighted differently (so as to hide control sequences and indicate bold, italic etc regions) in another. The ['scrollbind'](https://neovim.io/doc/user/options.html#'scrollbind') option is useful here.

To set the current window to have the syntax "foo", separately from all other windows on the buffer:

:ownsyntax foo

`w:current_syntax`This will set the "w:current\_syntax" variable to "foo". The value of "b:current\_syntax" does not change. This is implemented by saving and restoring "b:current\_syntax", since the syntax files do set "b:current\_syntax". The value set by the syntax file is assigned to "w:current\_syntax". Note: This resets the ['spell'](https://neovim.io/doc/user/options.html#'spell'), ['spellcapcheck'](https://neovim.io/doc/user/options.html#'spellcapcheck') and ['spellfile'](https://neovim.io/doc/user/options.html#'spellfile') options.

Once a window has its own syntax, syntax commands executed from other windows on the same buffer (including :syntax clear) have no effect. Conversely, syntax commands executed from that window do not affect other windows on the same buffer.

A window with its own syntax reverts to normal behavior when another buffer is loaded into that window or the file is reloaded. When splitting the window, the new window will use the original syntax.

## 18\. Color xterms [xterm-color](#xterm-color) [color-xterm](#color-xterm)

`colortest.vim`To test your color setup, a file has been included in the Vim distribution. To use it, execute this command:

:runtime syntax/colortest.vim

Nvim uses 256-color and [true-color](https://neovim.io/doc/user/term.html#true-color) terminal capabilities wherever possible.

## 19\. When syntax is slow [:syntime](#%3Asyntime)

This is aimed at authors of a syntax file.

If your syntax causes redrawing to be slow, here are a few hints on making it faster. To see slowness switch on some features that usually interfere, such as ['relativenumber'](https://neovim.io/doc/user/options.html#'relativenumber') and [folding](https://neovim.io/doc/user/fold.html#folding).

To find out what patterns are consuming most time, get an overview with this sequence:

:syntime on
[ redraw the text at least once with CTRL-L ]
:syntime report

This will display a list of syntax patterns that were used, sorted by the time it took to match them against the text.

:syntime on Start measuring syntax times. This will add some overhead to compute the time spent on syntax pattern matching.

:syntime off Stop measuring syntax times.

:syntime clear Set all the counters to zero, restart measuring.

:syntime report Show the syntax items used since ":syntime on" in the current window. Use a wider display to see more of the output.

 The list is sorted by total time. The columns are: TOTAL Total time in seconds spent on matching this pattern. COUNT Number of times the pattern was used. MATCH Number of times the pattern actually matched SLOWEST The longest time for one try. AVERAGE The average time for one try. NAME Name of the syntax item. Note that this is not unique. PATTERN The pattern being used.

Pattern matching gets slow when it has to try many alternatives. Try to include as much literal text as possible to reduce the number of ways a pattern does NOT match.

When using the "\\@\<=" and "\\@\<!" items, add a maximum size to avoid trying at all positions in the current and previous line. For example, if the item is literal text specify the size of that text (in bytes):

"\<\\@\<=span" Matches "span" in "\<span". This tries matching with "\<" in many places. "\<\\@1\<=span" Matches the same, but only tries one byte before "span".



# links
[Read on Omnivore](https://omnivore.app/me/syntax-neovim-docs-18ba5427424)
[Read Original](https://neovim.io/doc/user/syntax.html)

<iframe src="https://neovim.io/doc/user/syntax.html"  width="800" height="500"></iframe>