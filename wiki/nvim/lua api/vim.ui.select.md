---
sticker: vault//Bins/icons/candy-icons/apps/scalable/pulseeffects.svg
---
## description

this is part of the vim ui api, you can call it with like that `vim.ui.input({opts}, {on_confirm})`
this will call the input prompt that vim has set at the moment.
like that prompt when using [[dressing.nvim]]:
![[Pasted image 20231028040547.png]]

## usage

Parameters:

- items:list - a list of items to chose from
- opts:table - provide Additional options
	- prompt:string - optional - Text of the prompt
	- format_item:function(item) -> text - optional - Function to format an individual item from `items`. Defaults to `tostring`.
	  - kind:string - optional - Arbitrary hint string indicating the item shape. Plugins reimplementing `vim.ui.select`may wish to use this to infer the structure or semantics of `items`, or the context in which select() was called.
-   on_choice:function(item, idx) Called once the user
	confirms or abort the input. `input` is what the user
    typed **(it might be an empty string if nothing was
	entered, or `nil` if the user aborted the dialog.)**

### examples

this will ask the user if he want to use tabs or spaces and the set expend tab accordingly 
```lua
vim.ui.select(
	{ 'tabs', 'spaces' }, 
	{
	    prompt = 'Select tabs or spaces:',
	    format_item = function(item)
	        return "I'd like to choose " .. item
	    end,
	}, 
	function(choice)
	    if choice == 'spaces' then
	        vim.o.expandtab = true
	    else
	        vim.o.expandtab = false
	    end
	end)
```


## resources
[[Lua - Neovim docs#Lua module vim.ui [vim.ui\]( vim.ui)]]