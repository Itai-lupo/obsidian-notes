---
sticker: vault//Bins/icons/candy-icons/apps/scalable/system-software-update.svg
---
## state report,

> [!info]- the first stage of the my nvim setup
> I want to be here as detailed as possibly on what I have done both in research and features I added
> I also want to use that state to plan a road map toward the final set up, things like using JSON files in the setup and other quilty of lives.
> at the end I also want to have a clear goals for what this set up will and will have in the hope of publishing it and making it nice to use and as easy to change as possibly.
> 
> > [!important] this is over kill as it is a practice for other projects.


### table of content

```dataviewjs
dv.view('/Bins/js/toc', 2)
```

### current environment state

![[Pasted image 20231022030319.png]]
![[Pasted image 20231022030426.png]]

the screen shots are taken from my [[tmux setup]] and we can see a few features at play in different states of complication.

- there is a really nice to use file explorer.
- we can see telescope allowing as to do quick file and string search that works good but there is some work on the look of it and you can't set files to ignore at the moment.
- there is 2 types of outline utils and a scroll bar all have a bunch of good parts but some what leaking in beaver as well the scroll bar is a keeper but I want to make the first outline the go to and fix that fact that you can Ctrl-click on a function to see it
- we can also see lsp in work, but it is missing it will show a documentation if there is but I would like to the return value and maybe the code itself if available it also so warnings and errors in the file I can't always see what they are I would like to be able to hover to see that and I don't have control over the server parameters and formatting/linting isn't working well at the moment.
- last is the color scheme but it is also using tmux and dolphin and some parts aren't working great at the moment.

missing features:

- debugging
- built in console or easy integration with the tmux console(better option)
- good pane control
- code refactor
- multi cursor support
- customize env per project with json and easily changing things in general
- good git integration
- build system integration
- tests runner
- better redo and undo tree
- ignore files.
- good cheat sheet both for keybinding and quick doc search(like man and cht.sh)
- refactor tool
- spelling check

- [ ] write the state and a wiki for cheatsheet.nvim [link](https://todoist.com/showTask?id=7351246387) #todoist %%[todoist_id:: 7351246387]%%
- [ ] write the state and a wiki for cmp-buffer [link](https://todoist.com/showTask?id=7351246391) #todoist %%[todoist_id:: 7351246391]%%
- [ ] write the state and a wiki for cmp-nvim-lsp [link](https://todoist.com/showTask?id=7351246397) #todoist %%[todoist_id:: 7351246397]%%
- [ ] write the state and a wiki for cmp-nvim-lua [link](https://todoist.com/showTask?id=7351246417) #todoist %%[todoist_id:: 7351246417]%%
- [ ] write the state and a wiki for cmp-path [link](https://todoist.com/showTask?id=7351246436) #todoist %%[todoist_id:: 7351246436]%%
- [ ] write the state and a wiki for cmp_luasnip [link](https://todoist.com/showTask?id=7351246461) #todoist %%[todoist_id:: 7351246461]%%
- [x] write the state and a wiki for Comment.nvim ✅ 2023-10-26 [link](https://todoist.com/showTask?id=7351246506) #todoist %%[todoist_id:: 7351246506]%%
- [x] write the state and a wiki for dressing.nvim [link](https://todoist.com/showTask?id=7351246544) #todoist %%[todoist_id:: 7351246544]%% ✅ 2023-10-28
- [x] write the state and a wiki for gitsigns.nvim [link](https://todoist.com/showTask?id=7351246585) #todoist %%[todoist_id:: 7351246585]%% ✅ 2023-11-06
- [x] write the state and a wiki for indent-blankline.nvim [link](https://todoist.com/showTask?id=7351246589) #todoist %%[todoist_id:: 7351246589]%% ✅ 2023-11-06
- [ ] write the state and a wiki for lazy.nvim [link](https://todoist.com/showTask?id=7351246596) #todoist %%[todoist_id:: 7351246596]%%
- [ ] write the state and a wiki for lsp-zero.nvim [link](https://todoist.com/showTask?id=7351246611) #todoist %%[todoist_id:: 7351246611]%%
- [ ] write the state and a wiki for lspkind.nvim [link](https://todoist.com/showTask?id=7351246622) #todoist %%[todoist_id:: 7351246622]%%
- [ ] write the state and a wiki for lspsaga.nvim [link](https://todoist.com/showTask?id=7351246655) #todoist %%[todoist_id:: 7351246655]%%
- [ ] write the state and a wiki for lualine.nvim [link](https://todoist.com/showTask?id=7351246667) #todoist %%[todoist_id:: 7351246667]%%
- [ ] write the state and a wiki for LuaSnip [link](https://todoist.com/showTask?id=7351246679) #todoist %%[todoist_id:: 7351246679]%%
- [ ] write the state and a wiki for markdown-preview.nvim [link](https://todoist.com/showTask?id=7351246688) #todoist %%[todoist_id:: 7351246688]%%
- [ ] write the state and a wiki for mason-lspconfig.nvim [link](https://todoist.com/showTask?id=7351246694) #todoist %%[todoist_id:: 7351246694]%%
- [ ] write the state and a wiki for mason.nvim [link](https://todoist.com/showTask?id=7351246701) #todoist %%[todoist_id:: 7351246701]%%
- [ ] write the state and a wiki for nvim-autopairs [link](https://todoist.com/showTask?id=7351246724) #todoist %%[todoist_id:: 7351246724]%%
- [ ] write the state and a wiki for nvim-cmp [link](https://todoist.com/showTask?id=7351246740) #todoist %%[todoist_id:: 7351246740]%%
- [ ] write the state and a wiki for nvim-lspconfig [link](https://todoist.com/showTask?id=7351246751) #todoist %%[todoist_id:: 7351246751]%%
- [ ] write the state and a wiki for nvim-scrollview [link](https://todoist.com/showTask?id=7351246763) #todoist %%[todoist_id:: 7351246763]%%
- [ ] write the state and a wiki for nvim-tree.lua [link](https://todoist.com/showTask?id=7351246768) #todoist %%[todoist_id:: 7351246768]%%
- [ ] write the state and a wiki for nvim-treesitter [link](https://todoist.com/showTask?id=7351246775) #todoist %%[todoist_id:: 7351246775]%%
- [ ] write the state and a wiki for nvim-treesitter-context [link](https://todoist.com/showTask?id=7351246780) #todoist %%[todoist_id:: 7351246780]%%
- [ ] write the state and a wiki for nvim-ts-autotag [link](https://todoist.com/showTask?id=7351246797) #todoist %%[todoist_id:: 7351246797]%%
- [ ] write the state and a wiki for nvim-web-devicons [link](https://todoist.com/showTask?id=7351246810) #todoist %%[todoist_id:: 7351246810]%%
- [ ] write the state and a wiki for playground [link](https://todoist.com/showTask?id=7351246821) #todoist %%[todoist_id:: 7351246821]%%
- [ ] write the state and a wiki for plenary.nvim [link](https://todoist.com/showTask?id=7351246823) #todoist %%[todoist_id:: 7351246823]%%
- [ ] write the state and a wiki for popup.nvim [link](https://todoist.com/showTask?id=7351246833) #todoist %%[todoist_id:: 7351246833]%%
- [ ] write the state and a wiki for rainbow-delimiters.nvim [link](https://todoist.com/showTask?id=7351246841) #todoist %%[todoist_id:: 7351246841]%%
- [ ] write the state and a wiki for refactoring.nvim [link](https://todoist.com/showTask?id=7351246852) #todoist %%[todoist_id:: 7351246852]%%
- [ ] write the state and a wiki for ReplaceWithRegister [link](https://todoist.com/showTask?id=7351246871) #todoist %%[todoist_id:: 7351246871]%%
- [ ] write the state and a wiki for sidebar.nvim [link](https://todoist.com/showTask?id=7351246899) #todoist %%[todoist_id:: 7351246899]%%
- [ ] write the state and a wiki for tabby.nvim [link](https://todoist.com/showTask?id=7351246909) #todoist %%[todoist_id:: 7351246909]%%
- [ ] write the state and a wiki for tagbar [link](https://todoist.com/showTask?id=7351246919) #todoist %%[todoist_id:: 7351246919]%%
- [ ] write the state and a wiki for telescope-fzf-native.nvim [link](https://todoist.com/showTask?id=7351246926) #todoist %%[todoist_id:: 7351246926]%%
- [ ] write the state and a wiki for telescope.nvim [link](https://todoist.com/showTask?id=7351246934) #todoist %%[todoist_id:: 7351246934]%%
- [ ] write the state and a wiki for typescript.nvim [link](https://todoist.com/showTask?id=7351246953) #todoist %%[todoist_id:: 7351246953]%%
- [ ] write the state and a wiki for undotree [link](https://todoist.com/showTask?id=7351246960) #todoist %%[todoist_id:: 7351246960]%%
- [ ] write the state and a wiki for vim-fugitive [link](https://todoist.com/showTask?id=7351246967) #todoist %%[todoist_id:: 7351246967]%%
- [ ] write the state and a wiki for vim-maximizer [link](https://todoist.com/showTask?id=7351246970) #todoist %%[todoist_id:: 7351246970]%%
- [ ] write the state and a wiki for vim-nightfly-guicolors [link](https://todoist.com/showTask?id=7351246980) #todoist %%[todoist_id:: 7351246980]%%
- [ ] write the state and a wiki for vim-surround [link](https://todoist.com/showTask?id=7351246990) #todoist %%[todoist_id:: 7351246990]%%
- [ ] write the state and a wiki for vim-tmux [link](https://todoist.com/showTask?id=7351247006) #todoist %%[todoist_id:: 7351247006]%%
- [ ] write the state and a wiki for vim-tmux-navigator [link](https://todoist.com/showTask?id=7351247012) #todoist %%[todoist_id:: 7351247012]%%

#### list of plugins used

> [!info]- [[cheatsheet.nvim#description|cheatsheet.nvim]]
> ![[cheatsheet.nvim#description|cheatsheet.nvim]]

> [!info]- [[wiki/nvim/plugins/Comment.nvim#description|Comment.nvim]]
> ![[wiki/nvim/plugins/Comment.nvim#description|Comment.nvim]]
> 
> > [!note] State
> > it works really well and uses lazy loading by key press which is cool
> > if ever want to use ts/js it might be worth checking how to integrate [nvim-ts-context-commentstring](https://github.com/JoosepAlviste/nvim-ts-context-commentstring#commentnvim) with it. it is not to bad and I think it will be worth it


> [!info]- [[dressing.nvim#description|dressing.nvi]]
> ![[dressing.nvim#description|dressing.nvim]]

> [!info]- [[gitsigns.nvim#description|gitsigns.nvim]]
> ![[gitsigns.nvim#description|gitsigns.nvim]]

> [!info]- [[indent-blankline.nvim#description|indent-blankline.nvim]]
> ![[indent-blankline.nvim#description|indent-blankline.nvim]]

> [!info]- [[wiki/nvim/plugins/lazy.nvim#description|lazy.nvim]]
> ![[wiki/nvim/plugins/lazy.nvim#description|lazy.nvim]]

> [!info]- [[wiki/nvim/plugins/lsp-zero.nvim#description|lsp-zero.nvim]]
> ![[wiki/nvim/plugins/lsp-zero.nvim#description|lsp-zero.nvim]]

> [!info]- [[wiki/nvim/plugins/lspsaga.nvim#description|lspsaga.nvim]]
> ![[wiki/nvim/plugins/lspsaga.nvim#description|lspsaga.nvim]]

> [!info]- [[wiki/nvim/plugins/lualine.nvim#description|lualine.nvim]]
> ![[wiki/nvim/plugins/lualine.nvim#description|lualine.nvim]]

> [!info]- [[wiki/nvim/plugins/markdown-preview.nvi#description|markdown-preview.nvi]]
> ![[wiki/nvim/plugins/markdown-preview.nvi#description|markdown-preview.nvi]]

> [!info]- [[wiki/nvim/plugins/mason-lspconfig.nvi#description|mason-lspconfig.nvi]]
> ![[wiki/nvim/plugins/mason-lspconfig.nvi#description|mason-lspconfig.nvi]]

> [!info]- [[wiki/nvim/plugins/mason.nvi#description|mason.nvi]]
> ![[wiki/nvim/plugins/mason.nvi#description|mason.nvi]]

> [!info]- [[wiki/nvim/plugins/nvim-autopair#description|nvim-autopair]]
> ![[wiki/nvim/plugins/nvim-autopair#description|nvim-autopair]]

> [!info]- [[wiki/nvim/plugins/nvim-cmp#description|nvim-cmp ]]
> ![[wiki/nvim/plugins/nvim-cmp#description|nvim-cmp ]]

> [!info]- [[wiki/nvim/plugins/nvim-lspconfi#description|nvim-lspconfi]]
> ![[wiki/nvim/plugins/nvim-lspconfi#description|nvim-lspconfi]]

> [!info]- [[wiki/nvim/plugins/nvim-scrollvie#description|nvim-scrollvie]]
> ![[wiki/nvim/plugins/nvim-scrollvie#description|nvim-scrollvie]]

> [!info]- [[wiki/nvim/plugins/nvim-tree.lua#description|nvim-tree.lua]]
> ![[wiki/nvim/plugins/nvim-tree.lua#description|nvim-tree.lua]]

> [!info]- [[wiki/nvim/plugins/nvim-treesitter#description|nvim-treesitter]]
> ![[wiki/nvim/plugins/nvim-treesitter#description|nvim-treesitter]]

> [!info]- [[wiki/nvim/plugins/nvim-treesitter-contex#description|nvim-treesitter-contex]]
> ![[wiki/nvim/plugins/nvim-treesitter-contex#description|nvim-treesitter-contex]]

> [!info]- [[wiki/nvim/plugins/nvim-ts-autota#description|nvim-ts-autota]]
> ![[wiki/nvim/plugins/nvim-ts-autota#description|nvim-ts-autota]]

> [!info]- [[wiki/nvim/plugins/nvim-web-devicon#description|nvim-web-devicon]]
> ![[wiki/nvim/plugins/nvim-web-devicon#description|nvim-web-devicon]]

> [!info]- [[wiki/nvim/plugins/playgroun#description|playgroun]]
> ![[wiki/nvim/plugins/playgroun#description|playgroun]]

> [!info]- [[wiki/nvim/plugins/plenary.nvi#description|plenary.nvi]]
> ![[wiki/nvim/plugins/plenary.nvi#description|plenary.nvi]]

> [!info]- [[wiki/nvim/plugins/rainbow-delimiters.nvi#description|rainbow-delimiters.nvi]]
> ![[wiki/nvim/plugins/rainbow-delimiters.nvi#description|rainbow-delimiters.nvi]]

> [!info]- [[wiki/nvim/plugins/refactoring.nvi#description|refactoring.nvi]]
> ![[wiki/nvim/plugins/refactoring.nvi#description|refactoring.nvi]]

> [!info]- [[wiki/nvim/plugins/ReplaceWithRegiste#description|ReplaceWithRegiste]]
> ![[wiki/nvim/plugins/ReplaceWithRegiste#description|ReplaceWithRegiste]]

> [!info]- [[wiki/nvim/plugins/sidebar.nvi#description|sidebar.nvi]]
> ![[wiki/nvim/plugins/sidebar.nvi#description|sidebar.nvi]]

> [!info]- [[wiki/nvim/plugins/tabby.nvi#description|tabby.nvi]]
> ![[wiki/nvim/plugins/tabby.nvi#description|tabby.nvi]]

> [!info]- [[wiki/nvim/plugins/tagba#description|tagba]]
> ![[wiki/nvim/plugins/tagba#description|tagba]]

> [!info]- [[wiki/nvim/plugins/telescope-fzf-native.nvi#description|telescope-fzf-native.nvi]]
> ![[wiki/nvim/plugins/telescope-fzf-native.nvi#description|telescope-fzf-native.nvi]]

> [!info]- [[wiki/nvim/plugins/telescope.nvim#description|telescope.nvim]]
> ![[wiki/nvim/plugins/telescope.nvim#description|telescope.nvim]]

> [!info]- [[wiki/nvim/plugins/typescript.nvi#description|typescript.nvi]]
> ![[wiki/nvim/plugins/typescript.nvi#description|typescript.nvi]]

> [!info]- [[wiki/nvim/plugins/undotre#description|undotre]]
> ![[wiki/nvim/plugins/undotre#description|undotre]]

> [!info]- [[wiki/nvim/plugins/vim-fugitiv#description|vim-fugitiv]]
> ![[wiki/nvim/plugins/vim-fugitiv#description|vim-fugitiv]]

> [!info]- [[wiki/nvim/plugins/vim-maximize#description|vim-maximize]]
> ![[wiki/nvim/plugins/vim-maximize#description|vim-maximize]]

> [!info]- [[wiki/nvim/plugins/vim-nightfly-guicolors#description|vim-nightfly-guicolors]]
> ![[wiki/nvim/plugins/vim-nightfly-guicolors#description|vim-nightfly-guicolors]]

> [!info]- [[wiki/nvim/plugins/vim-surroun#description|vim-surroun]]
> ![[wiki/nvim/plugins/vim-surroun#description|vim-surroun]]

> [!info]- [[wiki/nvim/plugins/vim-tmu#description|vim-tmu]]
> ![[wiki/nvim/plugins/vim-tmu#description|vim-tmu]]

> [!info]- [[wiki/nvim/plugins/vim-tmux-navigato#description|vim-tmux-navigat]]
> ![[wiki/nvim/plugins/vim-tmux-navigato#description|vim-tmux-navigato]]

#### list of set up modules

> [!info] [[plugins setup]]
> ![[plugins setup#description]]

> [!info] [[projects/nvim/modules/lsp|lsp]]
> ![[projects/nvim/modules/lsp#description|lsp]]

### future road map

### resources used
