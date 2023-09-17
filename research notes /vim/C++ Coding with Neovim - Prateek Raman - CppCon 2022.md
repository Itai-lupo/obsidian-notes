---
sticker: vault//Bins/icons/candy-icons/apps/scalable/nvim.svg
End date: ""
---
LSP is language server protocol, this is how vim can understand the code for intellsense and auto complete.
you don't have to understand LSP to use it(but I might as well right?)
- [x] learn about LSP and add support for it in my generic makefile if possible
- [ ] check what VCPKG is

[the best vim manual](https://github.com/mhinz/vim-galore/blob/master/README.md)

you need to config neovim to use clangd as the LSP forr cpp and you need the right files to exists for it to work
LSP provied error indcation and auto fix for simple error and it can also show clan-tide errors and fixs
- [ ] add calng tidy rules to my cpp project template
- [ ] add clang format rules to my cpp project template

there is a similar protocol to LSP called debug adaptor protocol which might be usefully to integrate it as well.
it is used for visual debugging in neovim.

to config neovim:
""$HOME/.config/nvim/init.lua" - this is the file neovim use a it's config file.
there is good template at kickstart.nvim project.
there is also lsp-zero

you should use a lua folder and put all your lua files in it and include them from init.lua

things to set up in neovim:
- [x] LSP
- [x] clangd ✅ 2023-07-29
- [ ] clang tidy
- [x] telescope
- [ ] debugger
- [ ] formatter
- [ ] unit test integration
- [ ] refactoring tool
- [ ] nvim-cmp
- [ ] trouble
- [ ] which-key

reference meatrial
![[C++ Coding with Neovim - Prateek Raman - CppCon 2022.pdf]]


