## description
git integration plugin for neo vim.
it let you see a lot of git related info like diff and blame

## usage
### installation

with lazy:
{
"lewis6991/gitsigns.nvim"
}


#### setup
```lua
require('gitsigns').setup {
  signs = {
    add          = { text = '│' },
    change       = { text = '│' },
    delete       = { text = '_' },
    topdelete    = { text = '‾' },
    changedelete = { text = '~' },
    untracked    = { text = '┆' },
  },
  signcolumn = true,  # Toggle with `:Gitsigns toggle_signs`
  numhl      = false, # Toggle with `:Gitsigns toggle_numhl`
  linehl     = false, # Toggle with `:Gitsigns toggle_linehl`
  word_diff  = false, # Toggle with `:Gitsigns toggle_word_diff`
  watch_gitdir = {
    follow_files = true
  },
  attach_to_untracked = true,
  current_line_blame = false, # Toggle with `:Gitsigns toggle_current_line_blame`
  current_line_blame_opts = {
    virt_text = true,
    virt_text_pos = 'eol', # 'eol' | 'overlay' | 'right_align'
    delay = 1000,
    ignore_whitespace = false,
  },
  current_line_blame_formatter = '\<author\>, \<author_time:%Y-%m-%d\> - \<summary\>',
  sign_priority = 6,
  update_debounce = 100,
  status_formatter = nil, # Use default
  max_file_length = 40000, # Disable if file is longer than this (in lines)
  preview_config = {
    # Options passed to nvim_open_win
    border = 'single',
    style = 'minimal',
    relative = 'cursor',
    row = 0,
    col = 1
  },
  yadm = {
    enable = false
  },
}
```

#### Status Line

Use `b:gitsigns_status` or `b:gitsigns_status_dict`. `b:gitsigns_status` is formatted using `config.status_formatter`. `b:gitsigns_status_dict` is a dictionary with the keys `added`, `removed`, `changed` and `head`.

Example:

set statusline+=%{get(b:,'gitsigns_status','')}

For the current branch use the variable `b:gitsigns_head`.
## altrnatives

* [coc-git](https://github.com/neoclide/coc-git)
* [vim-gitgutter](https://github.com/airblade/vim-gitgutter)
* [vim-signify](https://github.com/mhinz/vim-signify)

## resources 
[[lewis6991-gitsigns.nvim- Git integration for buffers]]