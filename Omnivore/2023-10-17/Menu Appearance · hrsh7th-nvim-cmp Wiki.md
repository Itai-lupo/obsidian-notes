---
id: 90dcac54-6d11-11ee-a748-0321afc75020
title: Menu Appearance · hrsh7th/nvim-cmp Wiki
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:21:10
date_published: 2023-08-09 03:00:00
words_count: 1626
state: INBOX
---

# Menu Appearance · hrsh7th/nvim-cmp Wiki by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A completion plugin for neovim coded in Lua. Contribute to hrsh7th/nvim-cmp development by creating an account on GitHub.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
###  Pages 6 

* * [Menu Type](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance#menu-type)  
   * [Custom Menu Direction](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance#custom-menu-direction)  
   * [Basic Customisations](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance#basic-customisations)  
   * [How to add Visual Studio Code Dark+ Theme Colors to the Menu](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance#how-to-add-visual-studio-code-dark-theme-colors-to-the-menu)  
   * [Show devicons as kind field.](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance#show-devicons-as-kind-field)  
   * [How to add Visual Studio Code Codicons to the Menu](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance#how-to-add-visual-studio-code-codicons-to-the-menu)  
   * [How to add custom Icons for any source](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance#how-to-add-custom-icons-for-any-source)  
   * [How to get types on the left, and offset the menu](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance#how-to-get-types-on-the-left-and-offset-the-menu)

##### Clone this wiki locally

## [Menu Type](#menu-type)

`cmp` support three different completion menu types:

1. Custom popup menu, supporting item highlights, etc.
2. Custom wildmenu, displaying items horizontally on the bottom of the window (userful for search in cmdline mode)
3. Native menu (experimental)

By default, the Custom menu is enabled. This can be changed as follows:

cmp.setup({
   view = {            
      entries = "custom" -- can be "custom", "wildmenu" or "native"
   }                   
})

For wildmenu, you can specify the separator between items. Also, in the following, we also set up `wildmenu` in `cmdline` mode:

cmp.setup.cmdline('/', {                                  
  view = {                                                
    entries = {name = 'wildmenu', separator = '|' }       
  },                                                      
})                                                        

The above config results in the following:

![Peek 2022-01-14 13-30](https://proxy-prod.omnivore-image-cache.app/0x0,shusdHwsLnvI-iottbbpfl39eYVZhYjZRa8o-bC1uC4U/https://user-images.githubusercontent.com/4946827/149509010-9e1af916-bb4f-4a07-b7ce-e4fefc691c1c.gif) 

## [Custom Menu Direction](#custom-menu-direction)

By default, the custom completion menu's order is top-down; The highest scoring entry appears at the top of the menu. However, when in cmdline mode, or when the cursor is near the bottom of the screen, and the menu opens _above_ the cursor, it sometimes can be preferable if the menu used a bottom down approach. Consider the following example:![Peek](https://proxy-prod.omnivore-image-cache.app/0x0,s7TWR_Dv09frznEaZH1JpCEsj_Q9oH2d7tJTt5yvST1w/https://user-images.githubusercontent.com/4946827/160830982-0b31c17e-9162-4d39-a224-286ef6b67a0b.gif) 

To enable this behavior, use something like the following:

view = {                                                        
  entries = {name = 'custom', selection_order = 'near_cursor' } 
},                                                               

## [Basic Customisations](#basic-customisations)

You can display the fancy icons to completion-menu with [lspkind-nvim](https://github.com/onsails/lspkind-nvim).

Install the plugin and put this snippet on your config.

local cmp = require('cmp')
local lspkind = require('lspkind')
cmp.setup {
  formatting = {
    format = lspkind.cmp_format(),
  },
}

You can optionally append `mode = "symbol_text"` or `mode = "text_symbol"` into `lspkind.cmp_format()` to also show the name of item's kind.

To display the source of the completion items, add `menu` and put the source names in the table.

formatting = {
  format = lspkind.cmp_format({
    mode = "symbol_text",
    menu = ({
      buffer = "[Buffer]",
      nvim_lsp = "[LSP]",
      luasnip = "[LuaSnip]",
      nvim_lua = "[Lua]",
      latex_symbols = "[Latex]",
    })
  }),
},

Alternatively, you can also do the above without having to install an extra plugin.

Define icons on your own

local kind_icons = {
  Text = "",
  Method = "󰆧",
  Function = "󰊕",
  Constructor = "",
  Field = "󰇽",
  Variable = "󰂡",
  Class = "󰠱",
  Interface = "",
  Module = "",
  Property = "󰜢",
  Unit = "",
  Value = "󰎠",
  Enum = "",
  Keyword = "󰌋",
  Snippet = "",
  Color = "󰏘",
  File = "󰈙",
  Reference = "",
  Folder = "󰉋",
  EnumMember = "",
  Constant = "󰏿",
  Struct = "",
  Event = "",
  Operator = "󰆕",
  TypeParameter = "󰅲",
}

Setup

local cmp = require('cmp')
cmp.setup {
  formatting = {
    format = function(entry, vim_item)
      -- Kind icons
      vim_item.kind = string.format('%s %s', kind_icons[vim_item.kind], vim_item.kind) -- This concatonates the icons with the name of the item kind
      -- Source
      vim_item.menu = ({
        buffer = "[Buffer]",
        nvim_lsp = "[LSP]",
        luasnip = "[LuaSnip]",
        nvim_lua = "[Lua]",
        latex_symbols = "[LaTeX]",
      })[entry.source.name]
      return vim_item
    end
  },
}

To combine both (lspkind and your own kind\_icons when lspkind plugin is not installed), try this:

-- define kind_icons array like above
local kind_icons = {
  Text = "",
  Method = "",
  Function = "",
  Constructor = "",
  -- ... (remaining)
}

local cmp = require('cmp')
cmp.setup {
  formatting = {
    format = function(entry, vim_item)
      local lspkind_ok, lspkind = pcall(require, "lspkind")
      if not lspkind_ok then
        -- From kind_icons array
	vim_item.kind = string.format('%s %s', kind_icons[vim_item.kind], vim_item.kind) -- This concatonates the icons with the name of the item kind
        -- Source
        vim_item.menu = ({
	  buffer = "[Buffer]",
	  nvim_lsp = "[LSP]",
	  luasnip = "[LuaSnip]",
	  nvim_lua = "[Lua]",
          latex_symbols = "[LaTeX]",
        })[entry.source.name]
        return vim_item
      else
        -- From lspkind
        return lspkind.cmp_format()(entry, vim_item)
      end
    end
},

}

## [How to add Visual Studio Code Dark+ Theme Colors to the Menu](#how-to-add-visual-studio-code-dark-theme-colors-to-the-menu)

Since the addition of [specific kind highlights](https://github.com/hrsh7th/nvim-cmp#cmpitemkindkind%5Fname) you can emulate the Dark+ Theme of VS Code using the following settings (if your theme does not already provide them):

" gray
highlight! CmpItemAbbrDeprecated guibg=NONE gui=strikethrough guifg=#808080
" blue
highlight! CmpItemAbbrMatch guibg=NONE guifg=#569CD6
highlight! link CmpItemAbbrMatchFuzzy CmpItemAbbrMatch
" light blue
highlight! CmpItemKindVariable guibg=NONE guifg=#9CDCFE
highlight! link CmpItemKindInterface CmpItemKindVariable
highlight! link CmpItemKindText CmpItemKindVariable
" pink
highlight! CmpItemKindFunction guibg=NONE guifg=#C586C0
highlight! link CmpItemKindMethod CmpItemKindFunction
" front
highlight! CmpItemKindKeyword guibg=NONE guifg=#D4D4D4
highlight! link CmpItemKindProperty CmpItemKindKeyword
highlight! link CmpItemKindUnit CmpItemKindKeyword

Lua version for NeoVim with lua.init set up:

-- gray
vim.api.nvim_set_hl(0, 'CmpItemAbbrDeprecated', { bg='NONE', strikethrough=true, fg='#808080' })
-- blue
vim.api.nvim_set_hl(0, 'CmpItemAbbrMatch', { bg='NONE', fg='#569CD6' })
vim.api.nvim_set_hl(0, 'CmpItemAbbrMatchFuzzy', { link='CmpIntemAbbrMatch' })
-- light blue
vim.api.nvim_set_hl(0, 'CmpItemKindVariable', { bg='NONE', fg='#9CDCFE' })
vim.api.nvim_set_hl(0, 'CmpItemKindInterface', { link='CmpItemKindVariable' })
vim.api.nvim_set_hl(0, 'CmpItemKindText', { link='CmpItemKindVariable' })
-- pink
vim.api.nvim_set_hl(0, 'CmpItemKindFunction', { bg='NONE', fg='#C586C0' })
vim.api.nvim_set_hl(0, 'CmpItemKindMethod', { link='CmpItemKindFunction' })
-- front
vim.api.nvim_set_hl(0, 'CmpItemKindKeyword', { bg='NONE', fg='#D4D4D4' })
vim.api.nvim_set_hl(0, 'CmpItemKindProperty', { link='CmpItemKindKeyword' })
vim.api.nvim_set_hl(0, 'CmpItemKindUnit', { link='CmpItemKindKeyword' })

With the official [vs code codicons](https://microsoft.github.io/vscode-codicons/), the results look like this:

![VS Code Dark+ Theme Colors and Icons](https://proxy-prod.omnivore-image-cache.app/0x0,sjGy6Kmmlb2EDLB373ZG4F_9XYoKNGN6Kc1KcsF7yXiI/https://camo.githubusercontent.com/b8d76af86cdfec70f46d5193bf6e7c53ff358b31b29511dd7c6e111e982fc179/68747470733a2f2f656c7365776562646576656c6f706d656e742e636f6d2f77702d636f6e74656e742f75706c6f6164732f6e76696d2d636d702d6461726b2d706c75732e706e67)

(These colors are now included in `tomasiser/vim-code-dark`)

## [Show devicons as kind field.](#show-devicons-as-kind-field)

Requirements: nvim-web-devicons and path source.

cmp.setup {
  formatting = {
    format = function(entry, vim_item)
      if vim.tbl_contains({ 'path' }, entry.source.name) then
        local icon, hl_group = require('nvim-web-devicons').get_icon(entry:get_completion_item().label)
        if icon then
          vim_item.kind = icon
          vim_item.kind_hl_group = hl_group
          return vim_item
        end
      end
      return require('lspkind').cmp_format({ with_text = false })(entry, vim_item)
    end
  }
}

## [How to add Visual Studio Code Codicons to the Menu](#how-to-add-visual-studio-code-codicons-to-the-menu)

You can obtain the `codicons.ttf` file by following [this link.](https://github.com/microsoft/vscode-codicons/raw/main/dist/codicon.ttf) (required for the icons to show properly.)

The definitions are:

local cmp_kinds = {
  Text = '  ',
  Method = '  ',
  Function = '  ',
  Constructor = '  ',
  Field = '  ',
  Variable = '  ',
  Class = '  ',
  Interface = '  ',
  Module = '  ',
  Property = '  ',
  Unit = '  ',
  Value = '  ',
  Enum = '  ',
  Keyword = '  ',
  Snippet = '  ',
  Color = '  ',
  File = '  ',
  Reference = '  ',
  Folder = '  ',
  EnumMember = '  ',
  Constant = '  ',
  Struct = '  ',
  Event = '  ',
  Operator = '  ',
  TypeParameter = '  ',
}

  formatting = {
    format = function(_, vim_item)
      vim_item.kind = (cmp_kinds[vim_item.kind] or '') .. vim_item.kind
      return vim_item
    end,
  },

Alternatively, if you want to mimic VS Code's menu appearance you can use this setup:

  formatting = {
    fields = { "kind", "abbr" },
    format = function(_, vim_item)
      vim_item.kind = cmp_kinds[vim_item.kind] or ""
      return vim_item
    end,
  },

## [How to add custom Icons for any source](#how-to-add-custom-icons-for-any-source)

Along with the icons specified with the kind\_icons, it is possible to assign certain icons/symbols to specific sources that aren't listed in the kind\_icons table, in the snippet below, I'll use [CMP-Calc](https://github.com/hrsh7th/cmp-calc) as an example.

  sources = cmp.config.sources({
      --other sources
      { name = "calc" },
      --other sources

inside your formatting table, before setting your icons you can include a snippet like this

local custom_menu_icon = {
        calc = " 󰃬 ",
        --NOTE: requires a nerdfont to be rendered
        --you could include other sources here as well
      }
      
      if entry.source.name == "calc" then
        -- Get the custom icon for 'calc' source
        -- Replace the kind glyph with the custom icon
        vim_item.kind = custom_menu_icon.calc
      end
      kind.menu = "    (" .. (strings[2] or "") .. ") "
      return kind
    end,
  },

Normally, completion results from CMP-calc are given the same icon for all Text-Completion, the above snippet would replace the icon with whichever you specify.

![image](https://proxy-prod.omnivore-image-cache.app/0x0,s5ZO69plRkgJIKznkWief_S8U-9QJLE1QtqTKRdftSDc/https://user-images.githubusercontent.com/61883659/259285610-1c00f64a-1d66-4fd0-aaf7-28ac8a86aa18.png)

## [How to get types on the left, and offset the menu](#how-to-get-types-on-the-left-and-offset-the-menu)

![Screenshot 2022-06-15 at 10 35 12](https://proxy-prod.omnivore-image-cache.app/0x0,s3k0UM-SAaq1IGm5bwve-PShp_rULA8xx8MMu_ZRHtLs/https://user-images.githubusercontent.com/7228095/173782308-d28623d9-078d-4d15-a5e1-075899fb41ab.png)

require("cmp").setup({
  window = {
    completion = {
      winhighlight = "Normal:Pmenu,FloatBorder:Pmenu,Search:None",
      col_offset = -3,
      side_padding = 0,
    },
  },
  formatting = {
    fields = { "kind", "abbr", "menu" },
    format = function(entry, vim_item)
      local kind = require("lspkind").cmp_format({ mode = "symbol_text", maxwidth = 50 })(entry, vim_item)
      local strings = vim.split(kind.kind, "%s", { trimempty = true })
      kind.kind = " " .. (strings[1] or "") .. " "
      kind.menu = "    (" .. (strings[2] or "") .. ")"

      return kind
    end,
  },
})

Some custom highlight groups might be required. Tune these as you see fit. (click to expand) 

{
  PmenuSel = { bg = "#282C34", fg = "NONE" },
  Pmenu = { fg = "#C5CDD9", bg = "#22252A" },

  CmpItemAbbrDeprecated = { fg = "#7E8294", bg = "NONE", strikethrough = true },
  CmpItemAbbrMatch = { fg = "#82AAFF", bg = "NONE", bold = true },
  CmpItemAbbrMatchFuzzy = { fg = "#82AAFF", bg = "NONE", bold = true },
  CmpItemMenu = { fg = "#C792EA", bg = "NONE", italic = true },

  CmpItemKindField = { fg = "#EED8DA", bg = "#B5585F" },
  CmpItemKindProperty = { fg = "#EED8DA", bg = "#B5585F" },
  CmpItemKindEvent = { fg = "#EED8DA", bg = "#B5585F" },

  CmpItemKindText = { fg = "#C3E88D", bg = "#9FBD73" },
  CmpItemKindEnum = { fg = "#C3E88D", bg = "#9FBD73" },
  CmpItemKindKeyword = { fg = "#C3E88D", bg = "#9FBD73" },

  CmpItemKindConstant = { fg = "#FFE082", bg = "#D4BB6C" },
  CmpItemKindConstructor = { fg = "#FFE082", bg = "#D4BB6C" },
  CmpItemKindReference = { fg = "#FFE082", bg = "#D4BB6C" },

  CmpItemKindFunction = { fg = "#EADFF0", bg = "#A377BF" },
  CmpItemKindStruct = { fg = "#EADFF0", bg = "#A377BF" },
  CmpItemKindClass = { fg = "#EADFF0", bg = "#A377BF" },
  CmpItemKindModule = { fg = "#EADFF0", bg = "#A377BF" },
  CmpItemKindOperator = { fg = "#EADFF0", bg = "#A377BF" },

  CmpItemKindVariable = { fg = "#C5CDD9", bg = "#7E8294" },
  CmpItemKindFile = { fg = "#C5CDD9", bg = "#7E8294" },

  CmpItemKindUnit = { fg = "#F5EBD9", bg = "#D4A959" },
  CmpItemKindSnippet = { fg = "#F5EBD9", bg = "#D4A959" },
  CmpItemKindFolder = { fg = "#F5EBD9", bg = "#D4A959" },

  CmpItemKindMethod = { fg = "#DDE5F5", bg = "#6C8ED4" },
  CmpItemKindValue = { fg = "#DDE5F5", bg = "#6C8ED4" },
  CmpItemKindEnumMember = { fg = "#DDE5F5", bg = "#6C8ED4" },

  CmpItemKindInterface = { fg = "#D8EEEB", bg = "#58B5A8" },
  CmpItemKindColor = { fg = "#D8EEEB", bg = "#58B5A8" },
  CmpItemKindTypeParameter = { fg = "#D8EEEB", bg = "#58B5A8" },
}

Same as above but using the \`vim.api.nvim\_set\_hl\`. (click to expand) 

-- Customization for Pmenu
vim.api.nvim_set_hl(0, "PmenuSel", { bg = "#282C34", fg = "NONE" })
vim.api.nvim_set_hl(0, "Pmenu", { fg = "#C5CDD9", bg = "#22252A" })

vim.api.nvim_set_hl(0, "CmpItemAbbrDeprecated", { fg = "#7E8294", bg = "NONE", strikethrough = true })
vim.api.nvim_set_hl(0, "CmpItemAbbrMatch", { fg = "#82AAFF", bg = "NONE", bold = true })
vim.api.nvim_set_hl(0, "CmpItemAbbrMatchFuzzy", { fg = "#82AAFF", bg = "NONE", bold = true })
vim.api.nvim_set_hl(0, "CmpItemMenu", { fg = "#C792EA", bg = "NONE", italic = true })

vim.api.nvim_set_hl(0, "CmpItemKindField", { fg = "#EED8DA", bg = "#B5585F" })
vim.api.nvim_set_hl(0, "CmpItemKindProperty", { fg = "#EED8DA", bg = "#B5585F" })
vim.api.nvim_set_hl(0, "CmpItemKindEvent", { fg = "#EED8DA", bg = "#B5585F" })

vim.api.nvim_set_hl(0, "CmpItemKindText", { fg = "#C3E88D", bg = "#9FBD73" })
vim.api.nvim_set_hl(0, "CmpItemKindEnum", { fg = "#C3E88D", bg = "#9FBD73" })
vim.api.nvim_set_hl(0, "CmpItemKindKeyword", { fg = "#C3E88D", bg = "#9FBD73" })

vim.api.nvim_set_hl(0, "CmpItemKindConstant", { fg = "#FFE082", bg = "#D4BB6C" })
vim.api.nvim_set_hl(0, "CmpItemKindConstructor", { fg = "#FFE082", bg = "#D4BB6C" })
vim.api.nvim_set_hl(0, "CmpItemKindReference", { fg = "#FFE082", bg = "#D4BB6C" })

vim.api.nvim_set_hl(0, "CmpItemKindFunction", { fg = "#EADFF0", bg = "#A377BF" })
vim.api.nvim_set_hl(0, "CmpItemKindStruct", { fg = "#EADFF0", bg = "#A377BF" })
vim.api.nvim_set_hl(0, "CmpItemKindClass", { fg = "#EADFF0", bg = "#A377BF" })
vim.api.nvim_set_hl(0, "CmpItemKindModule", { fg = "#EADFF0", bg = "#A377BF" })
vim.api.nvim_set_hl(0, "CmpItemKindOperator", { fg = "#EADFF0", bg = "#A377BF" })

vim.api.nvim_set_hl(0, "CmpItemKindVariable", { fg = "#C5CDD9", bg = "#7E8294" })
vim.api.nvim_set_hl(0, "CmpItemKindFile", { fg = "#C5CDD9", bg = "#7E8294" })

vim.api.nvim_set_hl(0, "CmpItemKindUnit", { fg = "#F5EBD9", bg = "#D4A959" })
vim.api.nvim_set_hl(0, "CmpItemKindSnippet", { fg = "#F5EBD9", bg = "#D4A959" })
vim.api.nvim_set_hl(0, "CmpItemKindFolder", { fg = "#F5EBD9", bg = "#D4A959" })

vim.api.nvim_set_hl(0, "CmpItemKindMethod", { fg = "#DDE5F5", bg = "#6C8ED4" })
vim.api.nvim_set_hl(0, "CmpItemKindValue", { fg = "#DDE5F5", bg = "#6C8ED4" })
vim.api.nvim_set_hl(0, "CmpItemKindEnumMember", { fg = "#DDE5F5", bg = "#6C8ED4" })

vim.api.nvim_set_hl(0, "CmpItemKindInterface", { fg = "#D8EEEB", bg = "#58B5A8" })
vim.api.nvim_set_hl(0, "CmpItemKindColor", { fg = "#D8EEEB", bg = "#58B5A8" })
vim.api.nvim_set_hl(0, "CmpItemKindTypeParameter", { fg = "#D8EEEB", bg = "#58B5A8" })



# links
[Read on Omnivore](https://omnivore.app/me/menu-appearance-hrsh-7-th-nvim-cmp-wiki-18b3ea7ddcd)
[Read Original](https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance)

<iframe src="https://github.com/hrsh7th/nvim-cmp/wiki/Menu-Appearance"  width="800" height="500"></iframe>
