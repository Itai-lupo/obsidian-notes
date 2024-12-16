---
id: 176a32b2-6d0f-11ee-8ba1-47578228b88a
title: "Djancyp/cheat-sheet: Nvim cheat sheet implementation"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:03:27
words_count: 207
state: INBOX
---

# Djancyp/cheat-sheet: Nvim cheat sheet implementation by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Nvim cheat sheet implementation. Contribute to Djancyp/cheat-sheet development by creating an account on GitHub.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## [Nvim Cheat Sheet](#nvim-cheat-sheet)

This plugin allows you to use cheat sheet ([cht.sh](https://cht.sh/)) inside the vim.

* Plugin written 100 % in lua.[![](https://proxy-prod.omnivore-image-cache.app/0x0,sXGK1CECDgFYy6_9_alebnH-oEdzzxVU18MA-G6rCXlA/https://github.com/Djancyp/cheat-sheet/raw/main/images/cheat-sheet.gif)](https://github.com/Djancyp/cheat-sheet/blob/main/images/cheat-sheet.gif)

## [Installation](#installation)

Packer

use {"Djancyp/cheat-sheet"}

## [Config](#config)

Optionally, you can also pass some configuration to the plugin, here's the default value:

require("cheat-sheet").setup({
  auto_fill = {
    filetype = true,
    current_word = true,
  },

  main_win = {
    style = "minimal",
    border = "double",
  },

  input_win = {
    style = "minimal",
    border = "double",
  },
})

* `auto_fill`:  
   * `filetype`: automatically add filetype prefix to search query (ex: `lua/`)  
   * `current_word`: automatically add the current word under your cursor to search query
* `main_win`:  
   * `style`: main window style (see: `:h nvim_open_win()`)  
   * `border`: main window border (see: `:h nvim_open_win()`)
* `input_win`:  
   * `style`: input window style (see: `:h nvim_open_win()`)  
   * `border`: input window border (see: `:h nvim_open_win()`)

## [Usage](#usage)

This will open an input window and base on your filetype it will highlight the first part of search. When your query ready just hit the enter.

### [Ex:](#ex)

For more information please visit the cheat sheet website - ([cht.sh](https://cht.sh/))

## [Keys](#keys)

```awk
| Key            | Action                          |
| -------------- | ------------------------------- |
| q              | exit cheat sheet window         |
| <C-c>          | exit input window (input mode)  |
| <C-d>          | remove text (input mode)        |
| `<CR>`(Enter)  | activate the search             |

```

## [Contributing](#contributing)

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## [License](#license)

[MIT](https://choosealicense.com/licenses/mit/)



# links
[Read on Omnivore](https://omnivore.app/me/djancyp-cheat-sheet-nvim-cheat-sheet-implementation-18b3e97a659)
[Read Original](https://github.com/Djancyp/cheat-sheet)

<iframe src="https://github.com/Djancyp/cheat-sheet"  width="800" height="500"></iframe>
