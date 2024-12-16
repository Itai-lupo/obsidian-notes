---
id: 595bc580-6d11-11ee-85ee-9f7e6a9465ca
title: Home · kkharji/lspsaga.nvim Wiki
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:19:37
date_published: 2022-06-05 03:00:00
words_count: 337
state: INBOX
---

# Home · kkharji/lspsaga.nvim Wiki by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> The neovim language-server-client UI. Contribute to kkharji/lspsaga.nvim development by creating an account on GitHub.


# content

###  Pages 2 

* * [Async Lsp Finder](https://github.com/kkharji/lspsaga.nvim/wiki#async-lsp-finder)  
   * [Code Action](https://github.com/kkharji/lspsaga.nvim/wiki#code-action)  
   * [Code Action auto prompt](https://github.com/kkharji/lspsaga.nvim/wiki#code-action-auto-prompt)  
   * [Hover Doc](https://github.com/kkharji/lspsaga.nvim/wiki#hover-doc)  
   * [SignatureHelp](https://github.com/kkharji/lspsaga.nvim/wiki#signaturehelp)  
   * [Rename](https://github.com/kkharji/lspsaga.nvim/wiki#rename)  
   * [Preview Definition](https://github.com/kkharji/lspsaga.nvim/wiki#preview-definition)  
   * [Jump Diagnostic and Show Diagnostics](https://github.com/kkharji/lspsaga.nvim/wiki#jump-diagnostic-and-show-diagnostics)  
   * [Float Terminal](https://github.com/kkharji/lspsaga.nvim/wiki#float-terminal)  
   * [Color schemes that support Lspsaga](https://github.com/kkharji/lspsaga.nvim/wiki#color-schemes-that-support-lspsaga)

##### Clone this wiki locally

### [Async Lsp Finder](#async-lsp-finder)

![](https://proxy-prod.omnivore-image-cache.app/0x0,se5OVhhxqrPzq_y0M6pFzm1PXgrQiFOjM7-BeE9Savlo/https://user-images.githubusercontent.com/41671631/107140076-ae77ec00-695a-11eb-8329-0b9d8361bfeb.gif) 

-- lsp provider to find the cursor word definition and reference
nnoremap \<silent\> gh \<cmd\>lua require'lspsaga.provider'.lsp_finder()\<CR\>
-- or use command LspSagaFinder
nnoremap \<silent\> gh :Lspsaga lsp_finder\<CR\>

### [Code Action](#code-action)

![](https://proxy-prod.omnivore-image-cache.app/0x0,sy_i7FgpDGoUllMgv_SSgdtZg8uULNJ_ra-6waQBxamU/https://user-images.githubusercontent.com/41671631/105657414-490a1100-5eff-11eb-897d-587ac1375d4e.gif) 

#### [Code Action auto prompt](#code-action-auto-prompt)

![](https://proxy-prod.omnivore-image-cache.app/0x0,sP2jYZb70_uikEJ18iNGKGSQMUh3_M_6dpB3412vdRkE/https://user-images.githubusercontent.com/41671631/110590664-0e102400-81b3-11eb-9b9d-a894537104bc.gif) 

-- code action
nnoremap \<silent\>\<leader\>ca \<cmd\>lua require('lspsaga.codeaction').code_action()\<CR\>
vnoremap \<silent\>\<leader\>ca :\<C-U\>lua require('lspsaga.codeaction').range_code_action()\<CR\>
-- or use command
nnoremap \<silent\>\<leader\>ca :Lspsaga code_action\<CR\>
vnoremap \<silent\>\<leader\>ca :\<C-U\>Lspsaga range_code_action\<CR\>

### [Hover Doc](#hover-doc)

![](https://proxy-prod.omnivore-image-cache.app/0x0,sdojz8BfTHPpM4ZRCgAiSN_cx6erJNdLkMNJi3oiox9Q/https://user-images.githubusercontent.com/41671631/106566308-1dc09b00-656b-11eb-85e2-2ab5b23599c9.gif) 

-- show hover doc
nnoremap \<silent\> K \<cmd\>lua require('lspsaga.hover').render_hover_doc()\<CR\>
-- or use command
nnoremap \<silent\>K :Lspsaga hover_doc\<CR\>

-- scroll down hover doc or scroll in definition preview
nnoremap \<silent\> \<C-f\> \<cmd\>lua require('lspsaga.action').smart_scroll_with_saga(1)\<CR\>
-- scroll up hover doc
nnoremap \<silent\> \<C-b\> \<cmd\>lua require('lspsaga.action').smart_scroll_with_saga(-1)\<CR\>

### [SignatureHelp](#signaturehelp)

![](https://proxy-prod.omnivore-image-cache.app/0x0,sIaWLtYsjbkJg8_K8ksPO02tmo6-uLCuLEUna9Jj9K4I/https://user-images.githubusercontent.com/41671631/105969051-c7fb7700-60c2-11eb-9c79-aef3e01d88b1.gif) 

-- show signature help
nnoremap \<silent\> gs \<cmd\>lua require('lspsaga.signaturehelp').signature_help()\<CR\>
-- or command
nnoremap \<silent\> gs :Lspsaga signature_help\<CR\>

and you also can use smart_scroll_with_saga to scroll in signature help win

### [Rename](#rename)

![](https://proxy-prod.omnivore-image-cache.app/0x0,szwF5Za6sGrlHVvwcUZsOzxxE5H86-laQX6Z_zgjj93E/https://user-images.githubusercontent.com/41671631/106115648-f6915480-618b-11eb-9818-003cfb15c8ac.gif) 

-- rename
nnoremap \<silent\>gr \<cmd\>lua require('lspsaga.rename').rename()\<CR\>
-- or command
nnoremap \<silent\>gr :Lspsaga rename\<CR\>
-- close rename win use \<C-c\> in insert mode or `q` in noremal mode or `:q`

### [Preview Definition](#preview-definition)

![](https://proxy-prod.omnivore-image-cache.app/0x0,siZr2L6Z7dTuCCWoJpH9LuzJooaVy1cpLuV6Z0sy87b8/https://user-images.githubusercontent.com/41671631/105657900-5b387f00-5f00-11eb-8b39-4d3b1433cb75.gif) 

-- preview definition
nnoremap \<silent\> gd \<cmd\>lua require'lspsaga.provider'.preview_definition()\<CR\>
-- or use command
nnoremap \<silent\> gd :Lspsaga preview_definition\<CR\>

can use smart_scroll_with_saga to scroll

### [Jump Diagnostic and Show Diagnostics](#jump-diagnostic-and-show-diagnostics)

![](https://proxy-prod.omnivore-image-cache.app/0x0,s9tn4Lk8Hx3Yq44Pll49WebqPgFMXH7vK5LLA0umDGw4/https://user-images.githubusercontent.com/41671631/102290042-21786e00-3f7b-11eb-8026-d467bc256ba8.gif) 

-- show
nnoremap \<silent\>\<leader\>cd \<cmd\>lua
require'lspsaga.diagnostic'.show_line_diagnostics()\<CR\>

nnoremap \<silent\> \<leader\>cd :Lspsaga show_line_diagnostics\<CR\>
-- only show diagnostic if cursor is over the area
nnoremap \<silent\>\<leader\>cc \<cmd\>lua
require'lspsaga.diagnostic'.show_cursor_diagnostics()\<CR\>

-- jump diagnostic
nnoremap \<silent\> [e \<cmd\>lua require 'lspsaga.diagnostic'.navigate("prev"))\<CR\>
nnoremap \<silent\> ]e \<cmd\>lua require 'lspsaga.diagnostic'.navigate("next")\<CR\>
-- or use command
nnoremap \<silent\> [e :Lspsaga diagnostic_jump_next\<CR\>
nnoremap \<silent\> ]e :Lspsaga diagnostic_jump_prev\<CR\>

### [Float Terminal](#float-terminal)

![](https://proxy-prod.omnivore-image-cache.app/0x0,sarEScSqfWnML09IeiW0X1EMXg3HSFOd966N70OsLA7Y/https://user-images.githubusercontent.com/41671631/105658287-2c6ed880-5f01-11eb-8af6-daa6fd23576c.gif) 

-- float terminal also you can pass the cli command in open_float_terminal function
nnoremap \<silent\> \<A-d\> \<cmd\>lua require('lspsaga.floaterm').open_float_terminal()\<CR\> -- or open_float_terminal('lazygit')\<CR\>
tnoremap \<silent\> \<A-d\> \<C-\\>\<C-n\>:lua require('lspsaga.floaterm').close_float_terminal()\<CR\>
-- or use command
nnoremap \<silent\> \<A-d\> :Lspsaga open_floaterm\<CR\>
tnoremap \<silent\> \<A-d\> \<C-\\>\<C-n\>:Lspsaga close_floaterm\<CR\>

### [Color schemes that support Lspsaga](#color-schemes-that-support-lspsaga)

* \<https://github.com/catppuccin/nvim\>
* \<https://github.com/glepnir/zephyr-nvim\>



# links
[Read on Omnivore](https://omnivore.app/me/home-kkharji-lspsaga-nvim-wiki-18b3ea67224)
[Read Original](https://github.com/kkharji/lspsaga.nvim/wiki)

<iframe src="https://github.com/kkharji/lspsaga.nvim/wiki"  width="800" height="500"></iframe>
