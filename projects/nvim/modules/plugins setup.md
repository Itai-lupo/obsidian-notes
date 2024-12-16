---
sticker: vault//Bins/icons/candy-icons/apps/scalable/distributor-logo-fedora.svg
---
## description
the idea of this module is to build a layer of abstraction above the ppm so if I want to move from [[lazy.nvim]] to something else I could without changing most of my code it has been proven by moving from packer to lazy.

the module also offer more quality of life features:
some of them already exist:
- load all the plugins from the plugin folder(the plugin folder path should be a setup variable).
- abstraction above the ppm so it can auto set some fields from other fields
- install the ppm and load it

missing features:
- auto fill the config and keys fields to a file in the same folder(or name of the plugin in the right folder? need more work).
- use json files for both the plugins and the shortcuts
- allow for project plugins in a .nvim folder 


## module design 

the first part of the module is the file loader.
the most basic POF for that is just a simple folder itrator like that:
```lua
local exclude = { package_manager = true }
local plugins_path = vim.fn.stdpath('config') .. '/lua/plugins'
for _, file in ipairs(vim.fn.readdir(plugins_path, [[v:val !~ '\.lua$']])) do
    if  not exclude[file] then
        local module = require("plugins." .. file)
		table.insert(plugins, module)
end
```

this code assume a lot of stuff and require a very specific file structure.
but it is also quite easy to extend it as we can just add more code that plugins to `plugins`.

building on this POF we can build this psudo code:


![[plugins setup pseudo code.svg]]

this should work but there is 2 edge cases that should be noted.
>[!attention] edge cases 
> sometimes plugins files have more then one plugin spec in them,
> and sometimes it is nested like in the case of dependencies.
> 
> some plugins may appear twice it should be fine to load both appearances but this require farther tests,

### file structure 
all the plugins info should be in a plugins/ folder there will be one in the stdpath("config")/lua/plugins and when which look the same in the open project in .nvim/plugins.
the file structure in it will look like that

![[plugins file structure]]

the spec file structure will be a table or array with all of the wanted [[lazy.nvim]] specs with some added specs.
- desc will not be used but can have a short description on the plugin and might be used in the future