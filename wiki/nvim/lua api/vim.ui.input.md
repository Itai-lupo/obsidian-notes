---
sticker: vault//Bins/icons/candy-icons/devices/scalable/input-keyboard.svg
---
## description

this is part of the vim ui api, you can call it with like that `vim.ui.input({opts}, {on_confirm})`
this will call the input prompt that vim has set at the moment.
like that prompt when using [[dressing.nvim]]:
![[Pasted image 20231028040547.png]]

## usage

Parameters:

  - opts:table - provide Additional options
	  - prompt:string - optional - Text of the prompt
	  - default:string - optional - Default reply to the input
	  - completion:string - optional - Specifies type of completion
			supported for input. Supported types are the same that
			can be supplied to a user-defined command using the
			"-complete=" argument.
	  - highlight (function) - optional - Function that will be used for
			highlighting user inputs.
  - on_confirm:function(input) Called once the user
	  confirms or abort the input. `input` is what the user
	  typed (it might be an empty string if nothing was
	  entered), or `nil` if the user aborted the dialog.

### examples

this will ask a user for shift width and then set the shift width to what the user entered 
``` lua
vim.ui.input(
	{ prompt = 'Enter value for shiftwidth: ', default = tostring(vim.o.shiftwidth) }, 
	function(input)
		 vim.o.shiftwidth = tonumber(input)
     end)
```


## resources
[[Lua - Neovim docs#Lua module vim.ui [vim.ui\]( vim.ui)]]