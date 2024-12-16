---
id: 7c45bdca-6d0d-11ee-9066-ff82db9f734d
title: How to debug like a PRO using Neovim 🔥
author: Miguel Crespo
tags:
  - nvim
  - programing
  - text_editors
date: 2023-10-17 19:51:58
words_count: 996
state: INBOX
---

# How to debug like a PRO using Neovim 🔥 by Miguel Crespo
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Learn how to use nvim-dap to debug code in Neovim with code examples


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
I’ve been using `Neovim` to write code since a couple of years, but I must admit that every time I wanted to debug something I would switch to VS Code or Firefox debugging tools (For Node and Javascript), but recently I decided to research how to set up Neovim to do it as well, I started digging into some documentations and found it so interesting that I ended up writing this article 😅.

Few editors are as extensible and powerful as Neovim, I believe everything you can think of can be implemented on it, including debugging (like a PRO).

In this article, we will learn how to prepare our Neovim to debug any kind of language using \*\*DAP (Debug Adapter Protocol) \*\*and in the process understand a bit better this technology. We will focus mainly on `Golang`, but the same knowledge can be applied to any other language with DAP support.

Your browser does not support the video tag.

## What is DAP

[The Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) (DAP) is a standardized protocol introduced by `Microsoft` and used in `Visual Studio Code` that allows editors and IDEs (Tools) to outsource much of the logic that before had to be implemented in every editor to an intermediary called a `Debug Adapter` that can be reused across multiple tools, resulting in faster development times for editors’ developers and better user experiences for normal developers as they can get similar top code assistance across multiple editors.

### Before DAP

Before DAP, every time you developed a new editor, and you wanted to support code debugging inside of it, you had to take care of all the implementation details of features like:

* breakpoints
* watch expressions
* step in, step out
* etc

And besides this, you also had to take care of all the UI implementation, all of these of course was a lot of effort for tool’s developers that some tools simple could not afford.

![Before DAP](https://proxy-prod.omnivore-image-cache.app/0x0,s7Uw_mpcg5kL0uJpCRz1ENZr4wN1AfqoPQSQ5DtE5_KA/https://images.ctfassets.net/fduzn3bxxb8f/Rj2oAg48d1Yhu8tBemT4l/739b10871617b4a3dc1e246959ef3faf/Before_DAP.jpg)

### After DAP

Now with DAP editors’ developers only have to focus on:

* Integrating a DAP Client that will handle all the communication with the `Debug Adapter`
* Focus on the UI development to send or show the data from the `Debug Adapter`

![After DAP](https://proxy-prod.omnivore-image-cache.app/0x0,s8EVarna0KvXw6VUJFcp_BGdn24T6F4sVn6Yya7KVd2U/https://images.ctfassets.net/fduzn3bxxb8f/7CNzoIqSQLdTPX0qc6tpsl/fb1dd01e49b017d5615bcde9112d9bb8/After_DAP.jpg)

## Installing a DAP Client

Currently, Neovim doesn’t have a built-in DAP Client, as it does for the Language Server Protocol (LSP). So we need to manually install [nvim-dap](https://github.com/mfussenegger/nvim-dap) which is a normal Neovim plugin that will act as the **DAP Client**.

If you’re using Packer, simply add to your plugin list:

`use 'mfussenegger/nvim-dap'`

## Installing a debugger

In order to start debugging, you first need to install a `debugger` for the language you’re using, for Go:

| Language | Debugger |
| -------- | -------- |
| Golang   |          |

\*\*Installing ****`delve`** for \*\* **`Golang`**

`go install github.com/go-delve/delve/cmd/dlv@latest`

## Configuring the Debug Adapter

The next thing is to tell `Neovim` how to communicate with `delve`, you don’t really need to install another plugin to do this, but there are multiple plugins that basically do most of the configuration of the adapter for us.

For `Go`, we can use [nvim-dap-go](https://github.com/leoluz/nvim-dap-go) which only require the following lines:

```ada
use 'leoluz/nvim-dap-go' -- Install the plugin with Packer
require('dap-go').setup()
```

### What does nvim-dap-go actually do?

> **You can skip this section unless you want to understand what**`nvim-dap-go` actually does.**

This plugin basically tells how Neovim should launch the debugger (in our case `delve`) by using the API provided by the plugin `nvim-dap`

* First it checks if `delve` is installed in the system, otherwise it returns an error
* Then it starts `delve` and `delve` runs as a server
* Then it tells `nvim-dap` that it can connect to `delve` by attaching to the server that was started in the previous step

A very simplistic version of this extension’s code would be:

* Tell `nvim-dap` how to connect to the running `delve` server

```routeros
dap.adapters.go = function(callback, config)
  -- Wait for delve to start
    vim.defer_fn(function()
        callback({type = "server", host = "127.0.0.1", port = "port"})
      end,
    100)
end
```

* Configure how the `debuggee` (our application) should be launched, in this case we’re creating a configuration name `Debug` and telling `nvim-dap` to start debugging the current opened file

```routeros
dap.configurations.go = {
    {
      type = "go",
      name = "Debug",
      request = "launch",
      program = "${file}",
    },
...
```

``\[nvim-dap-go complete

code\](<https://github.com/leoluz/nvim-dap-go/blob/main/lua/dap-go.lua>)

### Defining configuration using `launch.json` file

If you’re familiar with how VS Code works, you might know that you can provide the above configuration using a file called `launch.json` that is located in your project folder, if you prefer this method, this is also possible using nvim-dap!

Simply add the following line to your configuration:

```less
require('dap.ext.vscode').load_launchjs(nil, {})
```

* The first parameter is the path where you store the file, by default is `.vscode/launch.json`, but you can change it to whatever you want

## Making the debugging interface amazing 💅!

### Installing `nvim-dap-ui`

![nvim dap ui](https://proxy-prod.omnivore-image-cache.app/0x0,sfAf6_jKE93ntySd68TmDDg44SbutE9Ggy3ur2JXhSUg/https://images.ctfassets.net/fduzn3bxxb8f/707fZYT4wLUoomNiI8AZN3/5cd74c0f6306fc3ad183d90571410463/image.png)

This is a nice package that will make the debugging much nicer, it basically puts all the DAP information into Neovim buffers.

To install it:

`use { "rcarriga/nvim-dap-ui", requires = {"mfussenegger/nvim-dap"} }`

### Open automatically when a new debug session is created

```lua
local dap, dapui =require("dap"),require("dapui")
dap.listeners.after.event_initialized["dapui_config"]=function()
  dapui.open()
end
dap.listeners.before.event_terminated["dapui_config"]=function()
  dapui.close()
end
dap.listeners.before.event_exited["dapui_config"]=function()
  dapui.close()
end
```

### Make the breakpoints look nicer

In your configuration, put this to change the ugly `B` text for these icons

```mel
vim.fn.sign_define('DapBreakpoint',{ text ='🟥', texthl ='', linehl ='', numhl =''})
vim.fn.sign_define('DapStopped',{ text ='▶️', texthl ='', linehl ='', numhl =''})
```

### Set some keymaps

```vim
vim.keymap.set('n', '<F5>', require 'dap'.continue)
vim.keymap.set('n', '<F10>', require 'dap'.step_over)
vim.keymap.set('n', '<F11>', require 'dap'.step_into)
vim.keymap.set('n', '<F12>', require 'dap'.step_out)
vim.keymap.set('n', '<leader>b', require 'dap'.toggle_breakpoint)
```

## What do you think?

What do you think about this article? Leave your comments 💬



# links
[Read on Omnivore](https://omnivore.app/me/how-to-debug-like-a-pro-using-neovim-18b3e8d2061)
[Read Original](https://miguelcrespo.co/posts/how-to-debug-like-a-pro-using-neovim)

<iframe src="https://miguelcrespo.co/posts/how-to-debug-like-a-pro-using-neovim"  width="800" height="500"></iframe>
