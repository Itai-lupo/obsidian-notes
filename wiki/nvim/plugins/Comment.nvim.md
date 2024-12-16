## description
this is a plugin to comment/uncomment out lines of code with [[nvim-treesitter]] support.


## usage
### installation
you can just add 'numToStr/Comment.nvim' to the package manger and lazy can be false
and then you need to call(all options are set to this by default)
``` c
require('Comment').setup(
{
	---Add a space b/w comment and the line
	padding = true,
	---Whether the cursor should stay at its position
	sticky = true,
	---Lines to be ignored while (un)comment
	ignore = nil,
	---LHS of toggle mappings in NORMAL mode
	toggler = {
		---Line-comment toggle keymap
		line = 'gcc',
		---Block-comment toggle keymap
		block = 'gbc',
	},
	---LHS of operator-pending mappings in NORMAL and VISUAL mode
	opleader = {
		---Line-comment keymap
		line = 'gc',
		---Block-comment keymap
		block = 'gb',
	},
	---LHS of extra mappings
	extra = {
		---Add comment on the line above
		above = 'gcO',
		---Add comment on the line below
		below = 'gco',
		---Add comment at the end of line
		eol = 'gcA',
	},
	---Enable keybindings
	---NOTE: If given `false` then the plugin won't create any mappings
	mappings = {
		---Operator-pending mapping; `gcc` `gbc` `gc[count]{motion}` `gb[count]{motion}`
		basic = true,
		---Extra mapping; `gco`, `gcO`, `gcA`
		extra = true,
	},
	---Function to call before (un)comment
	pre_hook = nil,
	---Function to call after (un)comment
	post_hook = nil,
)
```

#### Basic mappings

These mappings are enabled by default. (config: `mappings.basic`)

* NORMAL mode

`gcc` - Toggles the current line using linewise comment
`gbc` - Toggles the current line using blockwise comment
`[count]gcc` - Toggles the number of line given as a prefix-count using linewise
`[count]gbc` - Toggles the number of line given as a prefix-count using blockwise
`gc[count]{motion}` - (Op-pending) Toggles the region using linewise comment
`gb[count]{motion}` - (Op-pending) Toggles the region using blockwise comment

* VISUAL mode

`gc` - Toggles the region using linewise comment
`gb` - Toggles the region using blockwise comment

#### Extra mappings

These mappings are enabled by default. (config: `mappings.extra`)

* NORMAL mode

`gco` - Insert comment to the next line and enters INSERT mode
`gcO` - Insert comment to the previous line and enters INSERT mode
`gcA` - Insert comment to end of the current line and enters INSERT mode

#### Examples

###### Linewise

`gcw` - Toggle from the current cursor position to the next word
`gc$` - Toggle from the current cursor position to the end of line
`gc}` - Toggle until the next blank line
`gc5j` - Toggle 5 lines after the current cursor position
`gc8k` - Toggle 8 lines before the current cursor position
`gcip` - Toggle inside of paragraph
`gca}` - Toggle around curly brackets

###### Blockwise

`gb2}` - Toggle until the 2 next blank line
`gbaf` - Toggle comment around a function (w/ LSP/treesitter support)
`gbac` - Toggle comment around a class (w/ LSP/treesitter support)	Do not automatically 

this shortcuts can be changed from the setup function.
there is also a lua api that allow for custom key maps if wanted


### plugin API
api.toggle                                                  *comment.api.toggle*
    Provides API to toggle comments over a region, on current-line, or with a
    count using line or block comment string.

Every function takes a {motion} argument, except '*.count()' function which
takes an {count} argument, and an optional {config} parameter.


    Usage:  
```lua
local api = require('Comment.api')
local config = require('Comment.config'):get()

api.toggle.linewise(motion, config?)
api.toggle.linewise.current(motion?, config?)
api.toggle.linewise.count(count, config?)

api.toggle.blockwise(motion, config?)
api.toggle.blockwise.current(motion?, config?)
api.toggle.blockwise.count(count, config?)

# Toggle current line (linewise) using C-/
vim.keymap.set('n', '<C-_>', api.toggle.linewise.current)

# Toggle current line (blockwise) using C-\
vim.keymap.set('n', '<C-\\>', api.toggle.blockwise.current)

# Toggle lines (linewise) with dot-repeat support
# Example: <leader>gc3j will comment 4 lines
vim.keymap.set(
	'n', '<leader>gc', api.call('toggle.linewise', 'g@'),
	{ expr = true }
)

# Toggle lines (blockwise) with dot-repeat support
# Example: <leader>gb3j will comment 4 lines
vim.keymap.set(
	'n', '<leader>gb', api.call('toggle.blockwise', 'g@'),
	{ expr = true }
)

local esc = vim.api.nvim_replace_termcodes(
	'<ESC>', true, false, true
)

# Toggle selection (linewise)
vim.keymap.set('x', '<leader>c', function()
	vim.api.nvim_feedkeys(esc, 'nx', false)
	api.toggle.linewise(vim.fn.visualmode())
end)

# Toggle selection (blockwise)
vim.keymap.set('x', '<leader>b', function()
	vim.api.nvim_feedkeys(esc, 'nx', false)
	api.toggle.blockwise(vim.fn.visualmode())
end)


# in order to inset comments
api.insert.linewise.above(config?)
api.insert.linewise.below(config?)
api.insert.linewise.eol(config?)

api.insert.blockwise.above(config?)
api.insert.blockwise.below(config?)
api.insert.blockwise.eol(config?)
```

you can also use comment/uncomment instead of toggle

api.call({cb}, {op})
    Callback function which does the following
      1. Sets 'operatorfunc' for dot-repeat
      2. Preserves jumps and marks
      3. Stores last cursor position

Parameters:  
        {cb}  (string)      Name of the API function to call
        {op}  ("g@"|"g@$")  Operator-mode expression

Returns:  
        (fun():string)  Keymap RHS callback


### example
you can use it with lazy like that:
```lua
 {
	"<leader>c",
	comment.call('toggle.blockwise', 'g@'),
	expr = true,
	desc = "toggle line comment"
},
{
	"<leader>cc",
	function()
		comment.toggle.linewise.count(1)
	end,
	desc = "toggle comment one line, the vim way"
},
{
	"<leader>c",
	function()
		vim.api.nvim_feedkeys(esc, 'nx', false)
		comment.toggle.blockwise(vim.fn.visualmode())
	end,
	mode = "x",
	desc = "toggle comment on marked text, the vim way"
}
```

this code will add shortcuts to toggle with motion a line or in visual mode

## altrnative
[nvim-comment: A comment toggler for Neovim, written in Lua](https://github.com/terrortylor/nvim-comment)

## resources 
[[numToStr-Comment.nvim- -brain- -- Smart and powerful comment plugin for neovim. Supports treesitt...|comment.nvim readme]]
[Comment.txt](https://github.com/numToStr/Comment.nvim/blob/master/doc/Comment.txt)