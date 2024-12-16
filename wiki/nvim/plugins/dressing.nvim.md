## description

this provide an implementation for vim.ui.select and vim.ui.input.
for vim.ui.select it lets you use plugins such as [[telescope.nvim]] for menus like that:
![[Pasted image 20231027032402.png]]

the plugin in itself is just an adapter between nvim api and telescope or any other menu plugin.
there is not much to do with it, but it dose allow you to ask from input or selection from the user using
[[vim.ui.select]] and [[vim.ui.input]]

## usage
### installation

{
  'stevearc/dressing.nvim',
}

there are many options to tweak dressing but it is good out of the box and most settings are not that interesting.

## alternative

## resources

[[stevearc-dressing.nvim- Neovim plugin to improve the default vim.ui interfaces]]
