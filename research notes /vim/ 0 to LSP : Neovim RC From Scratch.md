---
sticker: vault//Bins/icons/candy-icons/apps/scalable/nvim.svg
End date: ""
---

this is a base on [0 to LSP : Neovim RC From Scratch](https://www.youtube.com/watch?v=w7i4amO_zaE)
this is a tutorial showing the base of neovim LSP scripting with no template.
in this tutorial he show how to set up basic neovim dev env and some basic extinctions he uses

first we will open a nvim folder in the config folder in it we will:
nvim .
that will open the folder in nvim.
then we can h rtp that will show as the basic path for the config files.
the we can % and init.lua that will create the main config file.
we can also press d and lua that will create the lua scripts folder  

we can Ex to go back to the file expolerer from a file

in init.lua we can use require to include other scripts 

we can create new script for all are remaps and in it we can add a remap for the leader for now I will set it to space, set pv to show the file explorer and s to save the file

next we want a pulgin manger
first we will go to **[packer.nvim](https://github.com/wbthomason/packer.nvim)** and install it and then we will copy some lua code to a packer.lua file and include it form are init.lua 

to add new pulgins we can simple see how to add then using packer,nvim in the plugin git page,
then add a script with there name in ~/.config/nvim/after/plugin/<\ name>.lua and in it we will add the shortcuts we want for the plugin.

## adding the plugins


let's start by adding telescope

we need to add 


``` lua
Plug 'nvim-lua/plenary.nvim'
Plug 'nvim-telescope/telescope.nvim', { 'tag': '0.1.2' }
```

then we can add in after/plugin the telescope.lua file with this settings:
``` embed-lua 
TITLE: "telescope.lua"
PATH: "vault://research notes /vim/nvim/after/plugin/telescope.lua"
```

now it is time to add support for code

first let's install treesitter whice allow for code parsing

we can this lines to the packer file
``` lua
 use {
			'nvim-treesitter/nvim-treesitter',
			run = function()
				local ts_update = require('nvim-treesitter.install').update({ with_sync = true })
				ts_update()
			end,}
  use("nvim-treesitter/playground")
```

then we can run PackerSync
and work on the plugin settings 
``` embed-lua 
TITLE: "treesitter.lua"
PATH: "vault://research notes /vim/nvim/after/plugin/treesitter.lua"
```

we can also install treesitter playground the same way

then we can do the same to install harpoon

and we will put it's config in the harpoon.lua in after/plugin
``` embed-lua 
TITLE: "harpoon.lua"
PATH: "vault://research notes /vim/nvim/after/plugin/harpoon.lua"
```

next is undotree we will do the same procss and put that in the lua file:
``` embed-lua 
TITLE: "undotree.lua"
PATH: "vault://research notes /vim/nvim/after/plugin/undotree.lua"
```

next is vim fugitive 
``` embed-lua 
TITLE: "fugitive.lua"
PATH: "vault://research notes /vim/nvim/after/plugin/fugitive.lua"
```

now it is time to set up lsp

first we need to install lsp-zero this is the install command, it will install everything related to lsp that is nedded
```lua
use {
	  'VonHeikemen/lsp-zero.nvim',
	  branch = 'v1.x',
	  requires = {
		  -- LSP Support
		  {'neovim/nvim-lspconfig'},
		  {'williamboman/mason.nvim'},
		  {'williamboman/mason-lspconfig.nvim'},

		  -- Autocompletion
		  {'hrsh7th/nvim-cmp'},
		  {'hrsh7th/cmp-buffer'},
		  {'hrsh7th/cmp-path'},
		  {'saadparwaiz1/cmp_luasnip'},
		  {'hrsh7th/cmp-nvim-lsp'},
		  {'hrsh7th/cmp-nvim-lua'},

		  -- Snippets
		  {'L3MON4D3/LuaSnip'},
		  {'rafamadriz/friendly-snippets'},
	  }
  }
```

after that we can go to it's config file lsp.lua
``` embed-lua 
TITLE: "lsp.lua"
PATH: "vault://research notes /vim/nvim/after/plugin/lsp.lua"
```
that will give some usefully shortcuts for lsp if it is available.
the shortcuts are:
![[research notes /vim/cheatsheet#lsp|cheatsheet]]

next is setting up the basic settingis for the vim env
``` embed-lua 
TITLE: "set.lua"
PATH: "vault://research notes /vim/nvim/lua/basic/set.lua"
```

this should make vim nicer looking and feel better
next is setting some remaps 
```embed-lua 
TITLE: "remap.lua"
PATH: "vault://research notes /vim/nvim/lua/basic/remap.lua"

```


that will give me this short cuts:
![[research notes /vim/cheatsheet#remaps]]


this is the most basic setup which allows me to edit code in neovim with linting and fast
