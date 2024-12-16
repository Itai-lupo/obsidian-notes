
## description

this is a nvim plugin that let you color indentation with indentation guides

for example:

you can indent the context you are on
![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,sFcVnfwBoBp9SlNLV1sKmYvsPSwp4MvsTTYGVGTKFJKk/https://user-images.githubusercontent.com/12900252/265403827-a9d2426f-56a4-44bd-8bb5-2a3c5f5ca384.png)

rainbow indentation:
![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,sjthoJRThw-gNs6LIN6Ov5AwdXEajm-LhqQlYDYhGgB8/https://user-images.githubusercontent.com/12900252/265404414-78fd962a-67fa-4ddf-8924-780256dfd118.png)

and integrate with rainbow delimiters
![Screenshot](https://proxy-prod.omnivore-image-cache.app/900x0,s6Et1keRZ3iGm551u2Y7pYbo6vb4-j9PQ8fZB5ccFN98/https://user-images.githubusercontent.com/12900252/265403990-67707d8e-57d3-411c-8418-77908d8babd9.png)

or my use:
![[Pasted image 20231106174633.png]]
## usage
### installation

For [lazy.nvim](https://github.com/folke/lazy.nvim):
{ "lukas-reineke/indent-blankline.nvim", main = "ibl", opts = {} }

and then you need to call setup

```lua
require("ibl").setup({config})
```

#### config fields

> [!info]- ***enabled*** *boolean*
Enables or disables indent-blankline
Default: `true`

> [!info]- ***debounce*** *number*
Sets the amount indent-blankline debounces
refreshes in milliseconds
Default: `200`

> [!info]- ***viewport_buffer*** *|ibl.config.viewport_buffer|*
Configures the viewport of where indentation guides
are generated
> > [!hint] ***min*** *number*
> > Minimum number of lines above and below of what is currently
> > visible in the window for which indentation guides will
> > be generated
> > Default: `30`
> 
> > [!hint]- ***max*** *number*
> > Maximum number of lines above and below of what is currently
> > visible in the window for which indentation guides will
> > be generated
> > Default: `500`

> [!info]- ***indent*** *|ibl.config.indent|*
Configures the indentation
>>[!hint]- ***char*** *string|string[]*
> > Character, or list of characters, that get used to
> > display the indentation guide
> > Each character has to have a display width of 0 or 1
> > Default: `▎`
> > 
> > > [!example]- Alternatives:
> > > • left aligned solid
> > > • `▏`
> > > • `▎` (default)
> > > • `▍`
> > > • `▌`
> > > • `▋`
> > > • `▊`
> > > • `▉`
> > > • `█`
> > > • center aligned solid
> > > • `│`
> > > • `┃`
> > > • right aligned solid
> > > • `▕`
> > > • `▐`
> > > • center aligned dashed
> > > • `╎`
> > > • `╏`
> > > • `┆`
> > > • `┇`
> > > • `┊`
> > > • `┋`
> > > • center aligned double
> > > • `║`
> > 
> 
> > [!hint]- ***tab_char*** *string|string[]*
 > > Character, or list of characters, that get used to
 > > display the indentation guide for tabs
 > > Each character has to have a display width of 0 or 1
 > > Default: uses |lcs-tab| if |'list:'| is set,
 > > otherwise, uses |ibl.config.indent.char|
> 
> > [!hint]- ***highlight*** *string|string[]*
> > Highlight group, or list of highlight groups, that
> > get applied to the indentation guide
> > Default: |hl-IblIndent|
> 
> > [!hint]- ***smart_indent_cap*** *boolean*
 > > Caps the number of indentation levels by looking at
 > > the surrounding code
 > > Default: `true`
> 
> > [!hint]- ***priority*** *number*
> > Virtual text priority for the indentation guide
> > Default: `1`

> [!info]- ***whitespace*** *|ibl.config.whitespace|*
> Configures the whitespace
> 
> > [!hint]- ***highlight*** *string|string[]*
> > Highlight group, or list of highlight groups,
> > that get applied to the whitespace
> > Default: |hl-IblWhitespace|
> 
   > > [!hint]- ***remove_blankline_trail*** *boolean*
> > Removes trailing whitespace on blanklines
> > Turn this off if you want to add background
> > color to the whitespace highlight group
> > Default: `true`


> [!info]- ***scope*** *|ibl.config.scope|*
> Configures the scope
> 
> > [!hint]- ***enabled*** *boolean*
> > Enables or disables scope
> > Default: `true`
> 
> > [!hint]- ***char*** *string|string[]*
> > Character, or list of characters, that get used to
   > > display the scope indentation guide
   > > Each character has to have a display width
   > > of 0 or 1
   > > Default: `|ibl.config.indent.char|`
> 
> > [!hint]- ***show_start*** *boolean*
> > Shows an underline on the first line of the scope
> > Default: `true`
> 
> > [!hint]- ***show_end*** *boolean*
> > Shows an underline on the last line of the scope
> > Default: `true`
> 
> > [!hint]- ***show_exact_scope*** *boolean*
> > Shows an underline on the first line of the scope
> > starting at the exact start of the scope (even if
> > this is to the right of the indent guide) and an
> > underline on the last line of the scope ending at
> > the exact end of the scope.
> > Default: `false`
> 
> > [!hint]- ***injected_languages*** *boolean*
> > Checks for the current scope in injected treesitter languages
> > This also influences if the scope gets excluded or not
> > Default: `true`
> 
> > [!hint]- ***highlight*** *string|string[]*
> > Highlight group, or list of highlight groups,
> > that get applied to the scope
> > Default: |hl-IblScope|
> 
> > [!hint]- ***priority*** *number*
> > Virtual text priority for the scope
> > Default: `1024`
> 
> > [!hint]- ***include*** *|ibl.config.scope.include|*
> > Configures additional nodes to be used as scope
> 
> > [!hint]- ***exclude*** *|ibl.config.scope.exclude|*
> > Configures nodes or languages to be excluded from scope
> 
> > [!example]-
> > 
> > ```python
 > > def foo();
 > >  if True:
 > >       a = "foo █ar"
> >       #        ↳ cursor here
 > >   print(a)
> > ```
> > 
> > ```rust
 > > fn foo() {
> >     if true {
> >     ┋   let a = "foo █ar";
> >     ┋   //           ↳ cursor here
> >     }
> >     print(a);
> > }
> > ```
> > 
> > [!attention] Scope requires treesitter to be set up


> [!info]- ***exclude*** *|ibl.config.exclude|*
> Configures what is excluded from indent-blankline

### hooks
Hooks provide a way to extend the functionality of indent-blankline. Either
from your own config, or even from other third part plugins.
Hooks consist of a type (|ibl.hooks.type|) and a callback
function (|ibl.hooks.cb|). When indent-blankline computes values for which
hooks exist, for example if a buffer is active, it then calls all registered
hooks for that type to get the final value.


## altrnatives

## resources

[[indent blankline]]
[[lukas-reineke-indent-blankline.nvim- Indent guides for Neovim]]
[[Syntax - Neovim docs]]