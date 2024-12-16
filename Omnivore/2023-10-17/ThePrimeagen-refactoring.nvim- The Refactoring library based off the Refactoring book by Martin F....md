---
id: cbfef7a2-6d10-11ee-942b-570172b7eb55
title: "ThePrimeagen/refactoring.nvim: The Refactoring library based off the Refactoring book by Martin Fowler"
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-10-17 20:15:40
words_count: 1514
state: INBOX
---

# ThePrimeagen/refactoring.nvim: The Refactoring library based off the Refactoring book by Martin Fowler by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> The Refactoring library based off the Refactoring book by Martin Fowler - ThePrimeagen/refactoring.nvim: The Refactoring library based off the Refactoring book by Martin Fowler


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## [Table of Contents](#table-of-contents)

* [Installation](#installation)  
   * [Requirements](#requirements)  
   * [Setup Using Packer](#packer)  
   * [Setup Using Lazy](#lazy)  
   * [Quickstart](#quickstart)
* [Features](#features)  
   * [Supported Languages](#supported-languages)  
   * [Refactoring Features](#refactoring-features)  
   * [Debug Features](#debug-features)
* [Configuration](#configuration)  
   * [Configuration for Refactoring Operations](#config-refactoring)  
         * [Ex Commands](#config-refactoring-command)  
         * [Lua API](#config-refactoring-direct)  
         * [Using Built-In Neovim Selection](#config-refactoring-builtin)  
         * [Using Telescope](#config-refactoring-telescope)  
   * [Configuration for Debug Operations](#config-debug)  
         * [Customizing Printf and Print Var Statements](#config-debug-stringification)  
                  * [Customizing Printf Statements](#config-debug-stringification-printf)  
                  * [Customizing Print Var Statements](#config-debug-stringification-print-var)  
   * [Customizing Extract Variable Statements](#config-119-custom)  
   * [Configuration for Type Prompt Operations](#config-prompt)

## [Installation](#installation)

### [Requirements](#requirements)

* **Neovim Nightly**
* Treesitter
* Plenary

### [Setup Using Packer](#setup-using-packer)

use {
    "ThePrimeagen/refactoring.nvim",
    requires = {
        {"nvim-lua/plenary.nvim"},
        {"nvim-treesitter/nvim-treesitter"}
    }
}

### [Setup Using Lazy](#setup-using-lazy)

  {
    "ThePrimeagen/refactoring.nvim",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
    },
    config = function()
      require("refactoring").setup()
    end,
  },

### [Quickstart](#quickstart)

require('refactoring').setup()

## [Features](#features)

### [Supported Languages](#supported-languages)

Given that this is a work in progress, the languages supported for the operations listed below is **constantly changing**. As of now, these languages are supported (with individual support for each function may vary):

* TypeScript
* JavaScript
* Lua
* C/C++
* Golang
* Python
* Java
* PHP
* Ruby

### [Refactoring Features](#refactoring-features)

* Support for various common refactoring operations  
   * **106: Extract Function**  
         * Extracts the last highlighted code from visual mode to a separate function  
         * Optionally prompts for function param types and return types (see[configuration for type prompt operations](#config-prompt))  
         * Also possible to Extract Block.  
         * Both Extract Function and Extract Block have the capability to extract to a separate file.  
   * **115: Inline Function**  
         * Inverse of extract function  
         * In normal mode, inline occurrences of the function under the cursor  
         * The function under the cursor has to be the declaration of the function  
   * **119: Extract Variable**  
         * In visual mode, extracts occurrences of a selected expression to its own variable, replacing occurrences of that expression with the variable  
   * **123: Inline Variable**  
         * Inverse of extract variable  
         * Replaces all occurrences of a variable with its value  
         * Can be used in normal mode or visual mode  
                  * Using this function in normal mode will automatically find the variable under the cursor and inline it  
                  * Using this function in visual mode will find the variable(s) in the visual selection.  
                              * If there is more than one variable in the selection, the plugin will prompt for which variable to inline,  
                              * If there is only one variable in the visual selection, it will automatically inline that variable

### [Debug Features](#debug-features)

* Also comes with various useful features for debugging  
   * **Printf:** Automated insertion of print statement to mark the calling of a function  
   * **Print var:** Automated insertion of print statement to print a variable at a given point in the code. This map can be made with either visual or normal mode:  
         * Using this function in visual mode will print out whatever is in the visual selection.  
         * Using this function in normal mode will print out the identifier under the cursor  
   * **Cleanup:** Automated cleanup of all print statements generated by the plugin

## [Configuration](#configuration)

There are many ways to configure this plugin. Below are some example configurations.

**Setup Function**

No matter which configuration option you use, you must first call the setup function.

require('refactoring').setup({})

Here are all the available options for the setup function and their defaults:

require('refactoring').setup({
    prompt_func_return_type = {
        go = false,
        java = false,

        cpp = false,
        c = false,
        h = false,
        hpp = false,
        cxx = false,
    },
    prompt_func_param_type = {
        go = false,
        java = false,

        cpp = false,
        c = false,
        h = false,
        hpp = false,
        cxx = false,
    },
    printf_statements = {},
    print_var_statements = {},
})

See each of the sections below for details on each configuration option.

### [Configuration for Refactoring Operations](#configuration-for-refactoring-operations)

#### [Ex Commands ](#ex-commands-)

The plugin offers the `:Refactor` command as an alternative to the Lua API.

The first argument to the command selects the type of refactor to perform. Additional arguments will be passed to each refactor if needed (e.g. the name of the extracted function for `extract`).

The first argument can be tab completed, so there is no need to memorize them all. (e.g. `:Refactor e<tab>` will suggest `extract_block_to_file`, `extract`, `extract_block`,`extract_var` and `extract_to_file`).

The main advantage of using an Ex command instead of the Lua API is that you will be able to preview the changes made by the refactor before committing to them.

command\_showcase.mp4 

The command can also be used in mappings:

vim.keymap.set("x", "<leader>re", ":Refactor extract ")
vim.keymap.set("x", "<leader>rf", ":Refactor extract_to_file ")

vim.keymap.set("x", "<leader>rv", ":Refactor extract_var ")

vim.keymap.set({ "n", "x" }, "<leader>ri", ":Refactor inline_var")

vim.keymap.set( "n", "<leader>rI", ":Refactor inline_func")

vim.keymap.set("n", "<leader>rb", ":Refactor extract_block")
vim.keymap.set("n", "<leader>rbf", ":Refactor extract_block_to_file")

The `` (space) at the end of some mappings is intentional because those mappings expect an additional argument (all of these mappings leave the user in command mode to utilize the preview command feature).

#### [Lua API ](#lua-api-)

If you want to make remaps for a specific refactoring operation, you can do so by configuring the plugin like this:

vim.keymap.set("x", "<leader>re", function() require('refactoring').refactor('Extract Function') end)
vim.keymap.set("x", "<leader>rf", function() require('refactoring').refactor('Extract Function To File') end)
-- Extract function supports only visual mode
vim.keymap.set("x", "<leader>rv", function() require('refactoring').refactor('Extract Variable') end)
-- Extract variable supports only visual mode
vim.keymap.set("n", "<leader>rI", function() require('refactoring').refactor('Inline Function') end)
-- Inline func supports only normal
vim.keymap.set({ "n", "x" }, "<leader>ri", function() require('refactoring').refactor('Inline Variable') end)
-- Inline var supports both normal and visual mode

vim.keymap.set("n", "<leader>rb", function() require('refactoring').refactor('Extract Block') end)
vim.keymap.set("n", "<leader>rbf", function() require('refactoring').refactor('Extract Block To File') end)
-- Extract block supports only normal mode

#### [Using Built-In Neovim Selection](#using-built-in-neovim-selection)

You can also set up the plugin to prompt for a refactoring operation to apply using Neovim's built in selection API. Here is an example remap to demonstrate this functionality:

-- prompt for a refactor to apply when the remap is triggered
vim.keymap.set(
    {"n", "x"},
    "<leader>rr",
    function() require('refactoring').select_refactor() end
)
-- Note that not all refactor support both normal and visual mode

#### [Using Telescope](#using-telescope)

If you would prefer to use Telescope to choose a refactor, you can do so using the **Telescope extension.** Here is an example config for this setup:

-- load refactoring Telescope extension
require("telescope").load_extension("refactoring")

vim.keymap.set(
	{"n", "x"},
	"<leader>rr",
	function() require('telescope').extensions.refactoring.refactors() end
)

### [Configuration for Debug Operations](#configuration-for-debug-operations)

Finally, you can configure remaps for the debug operations of this plugin like this:

-- You can also use below = true here to to change the position of the printf
-- statement (or set two remaps for either one). This remap must be made in normal mode.
vim.keymap.set(
	"n",
	"<leader>rp",
	function() require('refactoring').debug.printf({below = false}) end
)

-- Print var

vim.keymap.set({"x", "n"}, "<leader>rv", function() require('refactoring').debug.print_var() end)
-- Supports both visual and normal mode

vim.keymap.set("n", "<leader>rc", function() require('refactoring').debug.cleanup({}) end)
-- Supports only normal mode

#### [Customizing Printf and Print Var Statements](#customizing-printf-and-print-var-statements)

It is possible to override the statements used in the printf and print var functionalities.

##### [Customizing Printf Statements](#customizing-printf-statements)

You can add to the printf statements for any language by adding something like the below to your configuration:

require('refactoring').setup({
  -- overriding printf statement for cpp
  printf_statements = {
      -- add a custom printf statement for cpp
      cpp = {
          'std::cout << "%s" << std::endl;'
      }
  }
})

In any custom printf statement, it is possible to optionally add a max of**one %s** pattern, which is where the debug path will go. For an example custom printf statement, go to [this folder](https://github.com/ThePrimeagen/refactoring.nvim/blob/master/lua/refactoring/tests/debug/printf), select your language, and click on `multiple-statements/printf.config`.

##### [Customizing Print Var Statements](#customizing-print-var-statements)

The print var functionality can also be extended for any given language, as shown below:

require('refactoring').setup({
  -- overriding printf statement for cpp
  print_var_statements = {
      -- add a custom print var statement for cpp
      cpp = {
          'printf("a custom statement %%s %s", %s)'
      }
  }
})

In any custom print var statement, it is possible to optionally add a max of**two %s** patterns, which is where the debug path and the actual variable reference will go, respectively. To add a literal "%s" to the string, escape the sequence like this: `%%s`. For an example custom print var statement, go to[this folder](https://github.com/ThePrimeagen/refactoring.nvim/blob/master/lua/refactoring/tests/debug/print%5Fvar), select your language, and view `multiple-statements/print_var.config`.

**Note:** for either of these functions, if you have multiple custom statements, the plugin will prompt for which one should be inserted. If you just have one custom statement in your config, it will override the default automatically.

### [Customizing Extract variable Statements](#customizing-extract-variable-statements)

When performing an `extract_var` refactor operation, you can custom how the new variable would be declared by setting configuration like the below example.

require('refactoring').setup({
  -- overriding extract statement for go
  extract_var_statements = {
    go = "%s := %s // poggers"
  }
})

### [Configuration for Type Prompt Operations](#configuration-for-type-prompt-operations)

For certain languages like Golang, types are required for functions that return an object(s) and parameters of functions. Unfortunately, for some parameters and functions there is no way to automatically find their type. In those instances, we want to provide a way to input a type instead of inserting a placeholder value.

By default all prompts are turned off. The configuration below shows how to enable prompts for all the languages currently supported.

require('refactoring').setup({
    -- prompt for return type
    prompt_func_return_type = {
        go = true,
        cpp = true,
        c = true,
        java = true,
    },
    -- prompt for function parameters
    prompt_func_param_type = {
        go = true,
        cpp = true,
        c = true,
        java = true,
    },
})



# links
[Read on Omnivore](https://omnivore.app/me/the-primeagen-refactoring-nvim-the-refactoring-library-based-off-18b3ea2d39a)
[Read Original](https://github.com/ThePrimeagen/refactoring.nvim)

<iframe src="https://github.com/ThePrimeagen/refactoring.nvim"  width="800" height="500"></iframe>
