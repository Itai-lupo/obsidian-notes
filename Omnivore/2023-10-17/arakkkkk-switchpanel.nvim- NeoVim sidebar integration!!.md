---
id: 78fc6950-6d0f-11ee-9ab1-8fe32b2092ea
title: "arakkkkk/switchpanel.nvim: NeoVim sidebar integration!!"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:06:11
words_count: 87
state: INBOX
---

# arakkkkk/switchpanel.nvim: NeoVim sidebar integration!! by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> NeoVim sidebar integration!! Contribute to arakkkkk/switchpanel.nvim development by creating an account on GitHub.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Integrate a plugin to display NeoVim sidebars and switch between them like a VSCode sidebar.

```routeros
use({
	"arakkkkk/switchpanel.nvim",
	config = function()
		require("switchpanel").setup({})
	end,
})

```

```clojure
{
	panel_list = {
		show = true,
		background = "Blue",
		selected = "LightBlue",
		color = "none",
	},

	width = 30,

	focus_on_open = true,

	tab_repeat = true,
	
	mappings = {
		{"1", "SwitchPanelSwitch 1" },
		{"2", "SwitchPanelSwitch 2" },
		{"3", "SwitchPanelSwitch 3" },
		-- {"4", "SwitchPanelSwitch 4" },
		-- {"5", "SwitchPanelSwitch 5" },
		{"J", "SwitchPanelNext" },
		{"K", "SwitchPanelPrevious" }, },

	builtin = {
		"nvim-tree.lua",
		"sidebar.nvim",
		"undotree",
	}
}

```

```routeros
vim.keymap.set("n", "<leader>e", "<cmd>SwitchPanelToggle<CR>")

```

and you can switch sidebar contents by K and J or number 1\~3.



# links
[Read on Omnivore](https://omnivore.app/me/arakkkkk-switchpanel-nvim-neo-vim-sidebar-integration-18b3e9a25fe)
[Read Original](https://github.com/arakkkkk/switchpanel.nvim)

<iframe src="https://github.com/arakkkkk/switchpanel.nvim"  width="800" height="500"></iframe>
