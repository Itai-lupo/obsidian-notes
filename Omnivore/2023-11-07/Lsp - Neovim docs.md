---
id: c85cf56d-cdb4-4fa9-b6d5-743cd7fbe6a2
title: Lsp - Neovim docs
tags:
  - nvim
  - programing
  - text_editors
  - tools_to_use
date: 2023-11-07 03:40:18
date_published: 2023-11-06 02:00:00
words_count: 9278
state: INBOX
---

# Lsp - Neovim docs by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Neovim user documentation


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
##  Lsp

 _Nvim `:help` pages, [generated](https://github.com/neovim/neovim/blob/master/scripts/gen%5Fhelp%5Fhtml.lua) from [source](https://github.com/neovim/neovim/blob/master/runtime/doc/lsp.txt) using the [tree-sitter-vimdoc](https://github.com/neovim/tree-sitter-vimdoc) parser._ 

---

LSP client/framework `LSP` 

Nvim supports the Language Server Protocol (LSP), which means it acts as a client to LSP servers and includes a Lua framework `vim.lsp` for building enhanced LSP tools.

LSP facilitates features like go-to-definition, find-references, hover, completion, rename, format, refactor, etc., using semantic whole-project analysis (unlike [ctags](https://neovim.io/doc/user/tagsrch.html#ctags)).

## QUICKSTART [lsp-quickstart](#lsp-quickstart)

Nvim provides an LSP client, but the servers are provided by third parties. Follow these steps to get LSP features:

2\. Configure the LSP client per language server. See [vim.lsp.start()](https://neovim.io/doc/user/lsp.html#vim.lsp.start%28%29) or use this minimal example as a guide:

```sml
vim.lsp.start({
  name = 'my-server-name',
  cmd = {'name-of-language-server-executable'},
  root_dir = vim.fs.dirname(vim.fs.find({'setup.py', 'pyproject.toml'}, { upward = true })[1]),
})
```

3\. Check that the server attached to the buffer:

:lua =vim.lsp.get_clients()

4\. Configure keymaps and autocmds to use LSP features. See [lsp-config](https://neovim.io/doc/user/lsp.html#lsp-config).

`lsp-config` `lsp-defaults`When the LSP client starts it enables diagnostics [vim.diagnostic](https://neovim.io/doc/user/diagnostic.html#vim.diagnostic) (see[vim.diagnostic.config()](https://neovim.io/doc/user/diagnostic.html#vim.diagnostic.config%28%29) to customize). It also sets various default options, listed below, if (1) the language server supports the functionality and (2) the options are empty or were set by the builtin runtime (ftplugin) files. The options are not restored when the LSP client is stopped or detached.

 To opt out of this use [gw](https://neovim.io/doc/user/change.html#gw) instead of gq, or set ['formatexpr'](https://neovim.io/doc/user/options.html#'formatexpr') on LspAttach.

`lsp-defaults-disable`To override the above defaults, set or unset the options on [LspAttach](https://neovim.io/doc/user/lsp.html#LspAttach):

```vim
vim.api.nvim_create_autocmd('LspAttach', {
  callback = function(ev)
    vim.bo[ev.buf].formatexpr = nil
    vim.bo[ev.buf].omnifunc = nil
    vim.keymap.del("n", "K", { buffer = ev.buf })
  end,
})
```

To use other LSP features like hover, rename, etc. you can set other keymaps on [LspAttach](https://neovim.io/doc/user/lsp.html#LspAttach). Example:

```vim
vim.api.nvim_create_autocmd('LspAttach', {
  callback = function(args)
    vim.keymap.set('n', 'K', vim.lsp.buf.hover, { buffer = args.buf })
  end,
})
```

The most common functions are:

Not all language servers provide the same capabilities. To ensure you only set keymaps if the language server supports a feature, you can guard the keymap calls behind capability checks:

```routeros
vim.api.nvim_create_autocmd('LspAttach', {
  callback = function(args)
    local client = vim.lsp.get_client_by_id(args.data.client_id)
    if client.server_capabilities.hoverProvider then
      vim.keymap.set('n', 'K', vim.lsp.buf.hover, { buffer = args.buf })
    end
  end,
})
```

To learn what capabilities are available you can run the following command in a buffer with a started LSP client:

```vim
:lua =vim.lsp.get_clients()[1].server_capabilities
```

Full list of features provided by default can be found in [lsp-buf](https://neovim.io/doc/user/lsp.html#lsp-buf).

## FAQ [lsp-faq](#lsp-faq)

 Q: How to force-reload LSP?

 A: Stop all clients, then reload the buffer.

```css
:lua vim.lsp.stop_client(vim.lsp.get_clients())
:edit
```

 Q: Why isn't completion working?

 A: In the buffer where you want to use LSP, check that ['omnifunc'](https://neovim.io/doc/user/options.html#'omnifunc') is set to "v:lua.vim.lsp.omnifunc": `:verbose set omnifunc?` 

 Some other plugin may be overriding the option. To avoid that you could set the option in an [after-directory](https://neovim.io/doc/user/options.html#after-directory) ftplugin, e.g. "after/ftplugin/python.vim".

 Q: How do I run a request synchronously (e.g. for formatting on file save)?

 A: Check if the function has an `async` parameter and set the value to false. E.g. code formatting:

```routeros
" Auto-format *.rs (rust) files prior to saving them
" (async = false is the default for format)
autocmd BufWritePre *.rs lua vim.lsp.buf.format({ async = false })
```

`lsp-vs-treesitter`

 Q: How do LSP and Treesitter compare?

 A: LSP requires a client and language server. The language server uses semantic analysis to understand code at a project level. This provides language servers with the ability to rename across files, find definitions in external libraries and more.

 Treesitter is a language parsing library that provides excellent tools for incrementally parsing text and handling errors. This makes it a great fit for editors to understand the contents of the current file for things like syntax highlighting, simple goto-definitions, scope analysis and more.

 LSP and Treesitter are both great tools for editing and inspecting code.

## LSP API [lsp-api](#lsp-api)

LSP core API is described at [lsp-core](https://neovim.io/doc/user/lsp.html#lsp-core). Those are the core functions for creating and managing clients.

The `vim.lsp.buf_…` functions perform operations for all LSP clients attached to the given buffer. [lsp-buf](https://neovim.io/doc/user/lsp.html#lsp-buf) 

LSP request/response handlers are implemented as Lua functions (see[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler)).`lsp-method` 

Requests and notifications defined by the LSP specification are referred to as "LSP methods". The Nvim LSP client provides default handlers in the global[vim.lsp.handlers](https://neovim.io/doc/user/lsp.html#vim.lsp.handlers) table, you can list them with this command:

```css
:lua vim.print(vim.tbl_keys(vim.lsp.handlers))
```

They are also listed below. Note that handlers depend on server support: they won't run if your server doesn't support them.

 callHierarchy/incomingCalls

 callHierarchy/outgoingCalls

 textDocument/codeAction

 textDocument/completion

 textDocument/declaration\*

 textDocument/definition

 textDocument/diagnostic

 textDocument/documentHighlight

 textDocument/documentSymbol

 textDocument/formatting

 textDocument/hover

 textDocument/implementation\*

 textDocument/inlayHint

 textDocument/publishDiagnostics

 textDocument/rangeFormatting

 textDocument/references

 textDocument/rename

 textDocument/semanticTokens/full

 textDocument/semanticTokens/full/delta

 textDocument/signatureHelp

 textDocument/typeDefinition\*

 window/logMessage

 window/showMessage

 window/showDocument

 window/showMessageRequest

 workspace/applyEdit

 workspace/configuration

 workspace/executeCommand

 workspace/inlayHint/refresh

 workspace/symbol

 workspace/workspaceFolders

`lsp-handler`LSP handlers are functions that handle [lsp-response](https://neovim.io/doc/user/lsp.html#lsp-response)s to requests made by Nvim to the server. (Notifications, as opposed to requests, are fire-and-forget: there is no response, so they can't be handled. [lsp-notification](https://neovim.io/doc/user/lsp.html#lsp-notification))

Each response handler has this signature:

function(err, result, ctx, config)

 Parameters:

`{err}` (table|nil) Error info dict, or `nil` if the request completed.

`{result}` (Result | Params | nil) `result` key of the [lsp-response](https://neovim.io/doc/user/lsp.html#lsp-response) or`nil` if the request failed.

`{ctx}` (table) Table of calling state associated with the handler, with these keys:

`{bufnr}` (Buffer) Buffer handle.

`{params}` (table|nil) Request parameters table.

`{version}` (number) Document version at time of request. Handlers can compare this to the current document version to check if the response is "stale". See also [b:changedtick](https://neovim.io/doc/user/eval.html#b%3Achangedtick).

 Returns:

 Two values `result, err` where `err` is shaped like an RPC error:

{ code, message, data? }

To configure the behavior of a builtin [lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler), the convenient method[vim.lsp.with()](https://neovim.io/doc/user/lsp.html#vim.lsp.with%28%29) is provided for users.

 To configure the behavior of [vim.lsp.diagnostic.on\_publish\_diagnostics()](https://neovim.io/doc/user/lsp.html#vim.lsp.diagnostic.on%5Fpublish%5Fdiagnostics%28%29), consider the following example, where a new [lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) is created using[vim.lsp.with()](https://neovim.io/doc/user/lsp.html#vim.lsp.with%28%29) that no longer generates signs for the diagnostics:

```stylus
vim.lsp.handlers["textDocument/publishDiagnostics"] = vim.lsp.with(
  vim.lsp.diagnostic.on_publish_diagnostics, {
    -- Disable signs
    signs = false,
  }
)
```

 To enable signs, use [vim.lsp.with()](https://neovim.io/doc/user/lsp.html#vim.lsp.with%28%29) again to create and assign a new[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) to [vim.lsp.handlers](https://neovim.io/doc/user/lsp.html#vim.lsp.handlers) for the associated method:

```stylus
vim.lsp.handlers["textDocument/publishDiagnostics"] = vim.lsp.with(
  vim.lsp.diagnostic.on_publish_diagnostics, {
    -- Enable signs
    signs = true,
  }
)
```

 To configure a handler on a per-server basis, you can use the `{handlers}` key for [vim.lsp.start\_client()](https://neovim.io/doc/user/lsp.html#vim.lsp.start%5Fclient%28%29)

```stylus
vim.lsp.start_client {
  ..., -- Other configuration omitted.
  handlers = {
    ["textDocument/publishDiagnostics"] = vim.lsp.with(
      vim.lsp.diagnostic.on_publish_diagnostics, {
        -- Disable virtual_text
        virtual_text = false,
      }
    ),
  },
}
```

 or if using "nvim-lspconfig", you can use the `{handlers}` key of `setup()`:

```stylus
require('lspconfig').rust_analyzer.setup {
  handlers = {
    ["textDocument/publishDiagnostics"] = vim.lsp.with(
      vim.lsp.diagnostic.on_publish_diagnostics, {
        -- Disable virtual_text
        virtual_text = false
      }
    ),
  }
}
```

 Some handlers do not have an explicitly named handler function (such as ||vim.lsp.diagnostic.on\_publish\_diagnostics()|). To override these, first create a reference to the existing handler:

```golo
local on_references = vim.lsp.handlers["textDocument/references"]
vim.lsp.handlers["textDocument/references"] = vim.lsp.with(
  on_references, {
    -- Use location list instead of quickfix list
    loclist = true,
  }
)
```

`lsp-handler-resolution`Handlers can be set by:

 Setting a field in vim.lsp.handlers. `vim.lsp.handlers` vim.lsp.handlers is a global table that contains the default mapping of[lsp-method](https://neovim.io/doc/user/lsp.html#lsp-method) names to [lsp-handlers](https://neovim.io/doc/user/lsp.html#lsp-handlers). To override the handler for the`"textDocument/definition"` method:

```stylus
vim.lsp.handlers["textDocument/definition"] = my_custom_default_definition
```

 The `{handlers}` parameter of [vim.lsp.start()](https://neovim.io/doc/user/lsp.html#vim.lsp.start%28%29). This sets the default[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) for the server being started. Example:

```prolog
vim.lsp.start {
  ..., -- Other configuration omitted.
  handlers = {
    ["textDocument/definition"] = my_custom_server_definition
  },
}
```

 The `{handler}` parameter of [vim.lsp.buf\_request\_all()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf%5Frequest%5Fall%28%29). This sets the [lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) ONLY for the given request(s). Example:

```autohotkey
vim.lsp.buf_request_all(
  0,
  "textDocument/definition",
  my_request_params,
  my_handler
)
```

In summary, the [lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) will be chosen based on the current [lsp-method](https://neovim.io/doc/user/lsp.html#lsp-method)in the following order:

### VIM.LSP.PROTOCOL [vim.lsp.protocol](#vim.lsp.protocol)

For example `vim.lsp.protocol.ErrorCodes` allows reverse lookup by number or name:

```stylus
vim.lsp.protocol.TextDocumentSyncKind.Full == 1
vim.lsp.protocol.TextDocumentSyncKind[1] == "Full"
```

`on_list` receives a table with:

`title` string, title for the list.

This table can be used with vim.fn.setqflist or vim.fn.setloclist. E.g.:

```vim
local function on_list(options)
  vim.fn.setqflist({}, ' ', options)
  vim.api.nvim_command('cfirst')
end
vim.lsp.buf.definition{on_list=on_list}
vim.lsp.buf.references(nil, {on_list=on_list})
```

If you prefer loclist do something like this:

```vim
local function on_list(options)
  vim.fn.setloclist(0, {}, ' ', options)
  vim.api.nvim_command('lopen')
end
```

## LSP HIGHLIGHT [lsp-highlight](#lsp-highlight)

Reference Highlights:

`hl-LspReferenceText`LspReferenceText used for highlighting "text" references`hl-LspReferenceRead`LspReferenceRead used for highlighting "read" references`hl-LspReferenceWrite`LspReferenceWrite used for highlighting "write" references`hl-LspInlayHint`LspInlayHint used for highlighting inlay hints

Highlight groups related to [lsp-codelens](https://neovim.io/doc/user/lsp.html#lsp-codelens) functionality.

LspCodeLensSeparator `hl-LspCodeLensSeparator` Used to color the separator between two or more code lenses.

### LSP SEMANTIC HIGHLIGHTS [lsp-semantic-highlight](#lsp-semantic-highlight)

When available, the LSP client highlights code using [lsp-semantic\_tokens](https://neovim.io/doc/user/lsp.html#lsp-semantic%5Ftokens), which are another way that LSP servers can provide information about source code. Note that this is in addition to treesitter syntax highlighting; semantic highlighting does not replace syntax highlighting.

The server will typically provide one token per identifier in the source code. The token will have a `type` such as "function" or "variable", and 0 or more`modifier`s such as "readonly" or "deprecated." The standard types and modifiers are described here:<https://microsoft.github.io/language-server-protocol/specification/#textDocument%5FsemanticTokens>LSP servers may also use off-spec types and modifiers.

The LSP client adds one or more highlights for each token. The highlight groups are derived from the token's type and modifiers:

`@lsp.type.<type>.<ft>` for the type

`@lsp.mod.<mod>.<ft>` for each modifier

`@lsp.typemod.<type>.<mod>.<ft>` for each modifier Use [:Inspect](https://neovim.io/doc/user/lua.html#%3AInspect) to view the highlights for a specific token. Use [:hi](https://neovim.io/doc/user/syntax.html#%3Ahi) or[nvim\_set\_hl()](https://neovim.io/doc/user/api.html#nvim%5Fset%5Fhl%28%29) to change the appearance of semantic highlights:

```vim
hi @lsp.type.function guifg=Yellow        " function names are yellow
hi @lsp.type.variable.lua guifg=Green     " variables in lua are green
hi @lsp.mod.deprecated gui=strikethrough  " deprecated is crossed out
hi @lsp.typemod.function.async guifg=Blue " async functions are blue
```

The value [vim.highlight.priorities](https://neovim.io/doc/user/lua.html#vim.highlight.priorities)`.semantic_tokens` is the priority of the`@lsp.type.*` highlights. The `@lsp.mod.*` and `@lsp.typemod.*` highlights have priorities one and two higher, respectively.

You can disable semantic highlights by clearing the highlight groups:

```routeros
-- Hide semantic highlights for functions
vim.api.nvim_set_hl(0, '@lsp.type.function', {})
-- Hide all semantic highlights
for _, group in ipairs(vim.fn.getcompletion("@lsp", "highlight")) do
  vim.api.nvim_set_hl(0, group, {})
end
```

You probably want these inside a [ColorScheme](https://neovim.io/doc/user/autocmd.html#ColorScheme) autocommand.

The following groups are linked by default to standard [group-name](https://neovim.io/doc/user/syntax.html#group-name)s:

@lsp.type.class         Structure
@lsp.type.decorator     Function
@lsp.type.enum          Structure
@lsp.type.enumMember    Constant
@lsp.type.function      Function
@lsp.type.interface     Structure
@lsp.type.macro         Macro
@lsp.type.method        Function
@lsp.type.namespace     Structure
@lsp.type.parameter     Identifier
@lsp.type.property      Identifier
@lsp.type.struct        Structure
@lsp.type.type          Type
@lsp.type.typeParameter TypeDef
@lsp.type.variable      Identifier

## EVENTS [lsp-events](#lsp-events)

LspAttach `LspAttach` After an LSP client attaches to a buffer. The [autocmd-pattern](https://neovim.io/doc/user/autocmd.html#autocmd-pattern) is the name of the buffer. When used from Lua, the client ID is passed to the callback in the "data" table. Example:

```vim
vim.api.nvim_create_autocmd("LspAttach", {
  callback = function(args)
    local bufnr = args.buf
    local client = vim.lsp.get_client_by_id(args.data.client_id)
    if client.server_capabilities.completionProvider then
      vim.bo[bufnr].omnifunc = "v:lua.vim.lsp.omnifunc"
    end
    if client.server_capabilities.definitionProvider then
      vim.bo[bufnr].tagfunc = "v:lua.vim.lsp.tagfunc"
    end
  end,
})
```

LspDetach `LspDetach` Just before an LSP client detaches from a buffer. The [autocmd-pattern](https://neovim.io/doc/user/autocmd.html#autocmd-pattern) is the name of the buffer. When used from Lua, the client ID is passed to the callback in the "data" table. Example:

```routeros
vim.api.nvim_create_autocmd("LspDetach", {
  callback = function(args)
    local client = vim.lsp.get_client_by_id(args.data.client_id)
    -- Do something with the client
    vim.cmd("setlocal tagfunc< omnifunc<")
  end,
})
```

LspNotify `LspNotify` This event is triggered after each successful notification sent to an LSP server.

 When used from Lua, the client\_id, LSP method, and parameters are sent in the "data" table. Example:

```monkey
vim.api.nvim_create_autocmd('LspNotify', {
  callback = function(args)
    local bufnr = args.buf
    local client_id = args.data.client_id
    local method = args.data.method
    local params = args.data.params
    -- do something with the notification
    if method == 'textDocument/...' then
      update_buffer(bufnr)
    end
  end,
})
```

LspProgress `LspProgress` Upon receipt of a progress notification from the server. Notifications can be polled from a `progress` ring buffer of a [vim.lsp.client](https://neovim.io/doc/user/lsp.html#vim.lsp.client) or use[vim.lsp.status()](https://neovim.io/doc/user/lsp.html#vim.lsp.status%28%29) to get an aggregate message

 If the server sends a "work done progress", the `pattern` is set to `kind` (one of `begin`, `report` or `end`).

 When used from Lua, the event contains a `data` table with `client_id` and`result` properties. `result` will contain the request params sent by the server.

 Example:

```vim
autocmd LspProgress * redrawstatus
```

LspRequest `LspRequest` For each request sent to an LSP server, this event is triggered for every change to the request's status. The status can be one of`pending`, `complete`, or `cancel` and is sent as the `{type}` on the "data" table passed to the callback function.

 It triggers when the initial request is sent (`{type}` \== `pending`) and when the LSP server responds (`{type}` \== `complete`). If a cancellation is requested using `client.cancel_request(request_id)`, then this event will trigger with `{type}` \== `cancel`.

 When used from Lua, the client ID, request ID, and request are sent in the "data" table. See `{requests}` in [vim.lsp.client](https://neovim.io/doc/user/lsp.html#vim.lsp.client) for details on the`{request}` value. If the request type is `complete`, the request will be deleted from the client's pending requests table immediately after calling the event's callbacks. Example:

```vim
vim.api.nvim_create_autocmd('LspRequest', {
  callback = function(args)
    local bufnr = args.buf
    local client_id = args.data.client_id
    local request_id = args.data.request_id
    local request = args.data.request
    if request.type == 'pending' then
      -- do something with pending requests
      track_pending(client_id, bufnr, request_id, request)
    elseif request.type == 'cancel' then
      -- do something with pending cancel requests
      track_canceling(client_id, bufnr, request_id, request)
    elseif request.type == 'complete' then
      -- do something with finished requests. this pending
      -- request entry is about to be removed since it is complete
      track_finish(client_id, bufnr, request_id, request)
    end
  end,
})
```

LspTokenUpdate `LspTokenUpdate` When a visible semantic token is sent or updated by the LSP server, or when an existing token becomes visible for the first time. The[autocmd-pattern](https://neovim.io/doc/user/autocmd.html#autocmd-pattern) is the name of the buffer. When used from Lua, the token and client ID are passed to the callback in the "data" table. The token fields are documented in [vim.lsp.semantic\_tokens.get\_at\_pos()](https://neovim.io/doc/user/lsp.html#vim.lsp.semantic%5Ftokens.get%5Fat%5Fpos%28%29). Example:

```stata
vim.api.nvim_create_autocmd('LspTokenUpdate', {
  callback = function(args)
    local token = args.data.token
    if token.type == 'variable' and not token.modifiers.readonly then
      vim.lsp.semantic_tokens.highlight_token(
        token, args.buf, args.data.client_id, 'MyMutableVariableHighlight'
      )
    end
  end,
})
```

## Lua module: vim.lsp [lsp-core](#lsp-core)

buf\_attach\_client(`{bufnr}`, `{client_id}`) `vim.lsp.buf_attach_client()` Implements the `textDocument/did…` notifications required to track a buffer for any language server.

 Without calling this, the server won't be notified of changes to a buffer.

 Parameters:

`{bufnr}` (integer) Buffer handle, or 0 for current

`{client_id}` (integer) Client id

 Return:

 (boolean) success `true` if client was attached successfully; `false` otherwise

buf\_detach\_client(`{bufnr}`, `{client_id}`) `vim.lsp.buf_detach_client()` Detaches client from the specified buffer. Note: While the server is notified that the text document (buffer) was closed, it is still able to send notifications should it ignore this notification.

 Parameters:

`{bufnr}` (integer) Buffer handle, or 0 for current

`{client_id}` (integer) Client id

buf\_is\_attached(`{bufnr}`, `{client_id}`) `vim.lsp.buf_is_attached()` Checks if a buffer is attached for a particular client.

 Parameters:

`{bufnr}` (integer) Buffer handle, or 0 for current

`{client_id}` (integer) the client id

buf\_notify(`{bufnr}`, `{method}`, `{params}`) `vim.lsp.buf_notify()` Send a notification to a server

 Parameters:

`{bufnr}` (integer|nil) The number of the buffer

`{method}` (string) Name of the request method

`{params}` (any) Arguments to send to the server

 Return:

 (boolean) success true if any client returns true; false otherwise

`vim.lsp.buf_request_all()`buf\_request\_all(`{bufnr}`, `{method}`, `{params}`, `{handler}`) Sends an async request for all active clients attached to the buffer and executes the `handler` callback with the combined result.

 Parameters:

`{bufnr}` (integer) Buffer handle, or 0 for current.

`{method}` (string) LSP method name

`{params}` (table|nil) Parameters to send to the server

`{handler}` (function) Handler called after all requests are completed. Server results are passed as a `client_id:result` map.

 Return:

 (function) cancel Function that cancels all requests.

`vim.lsp.buf_request_sync()`buf\_request\_sync(`{bufnr}`, `{method}`, `{params}`, `{timeout_ms}`) Sends a request to all server and waits for the response of all of them.

 Calls [vim.lsp.buf\_request\_all()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf%5Frequest%5Fall%28%29) but blocks Nvim while awaiting the result. Parameters are the same as [vim.lsp.buf\_request\_all()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf%5Frequest%5Fall%28%29) but the result is different. Waits a maximum of `{timeout_ms}` (default 1000) ms.

 Parameters:

`{bufnr}` (integer) Buffer handle, or 0 for current.

`{method}` (string) LSP method name

`{params}` (table|nil) Parameters to send to the server

`{timeout_ms}` (integer|nil) Maximum time in milliseconds to wait for a result. Defaults to 1000

 Return (multiple):

 (table) result Map of client\_id:request\_result. (string|nil) err On timeout, cancel, or error, `err` is a string describing the failure reason, and `result` is nil.

 Methods:

 request(method, params, \[handler\], bufnr) Sends a request to the server. This is a thin wrapper around `{client.rpc.request}` with some additional checking. If `{handler}` is not specified, If one is not found there, then an error will occur. Returns: `{status}`,`{[client_id]}`. `{status}` is a boolean indicating if the notification was successful. If it is `false`, then it will always be `false` (the client has shutdown). If `{status}` is `true`, the function returns`{request_id}` as the second result. You can use this with`client.cancel_request(request_id)` to cancel the request.

 request\_sync(method, params, timeout\_ms, bufnr) Sends a request to the server and synchronously waits for the response. This is a wrapper around `{client.request}` Returns: { err=err, result=result }, a dictionary, where `err` and `result` come from the [lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler). On timeout, cancel or error, returns `(nil, err)` where `err` is a string describing the failure reason. If the request was unsuccessful returns`nil`.

 notify(method, params) Sends a notification to an LSP server. Returns: a boolean to indicate if the notification was successful. If it is false, then it will always be false (the client has shutdown).

 cancel\_request(id) Cancels a request with a given request id. Returns: same as `notify()`.

 stop(\[force\]) Stops a client, optionally with force. By default, it will just ask the server to shutdown without force. If you request to stop a client which has previously been requested to shutdown, it will automatically escalate and force shutdown.

 is\_stopped() Checks whether a client is stopped. Returns: true if the client is fully stopped.

 on\_attach(client, bufnr) Runs the on\_attach function from the client's config if it was defined. Useful for buffer-local setup.

 Members

`{id}` (number): The id allocated to the client.

`{name}` (string): If a name is specified on creation, that will be used. Otherwise it is just the client id. This is used for logs and messages.

`{rpc}` (table): RPC client object, for low level interaction with the client. See [vim.lsp.rpc.start()](https://neovim.io/doc/user/lsp.html#vim.lsp.rpc.start%28%29).

`{offset_encoding}` (string): The encoding used for communicating with the server. You can modify this in the `config`'s `on_init` method before text is sent to the server.

`{handlers}` (table): The handlers used by the client as described in[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler).

`{requests}` (table): The current pending requests in flight to the server. Entries are key-value pairs with the key being the request ID while the value is a table with `type`, `bufnr`, and `method` key-value pairs. `type` is either "pending" for an active request, or "cancel" for a cancel request. It will be "complete" ephemerally while executing [LspRequest](https://neovim.io/doc/user/lsp.html#LspRequest) autocmds when replies are received from the server.

`{config}` (table): copy of the table that was passed by the user to[vim.lsp.start\_client()](https://neovim.io/doc/user/lsp.html#vim.lsp.start%5Fclient%28%29).

`{server_capabilities}` (table): Response from the server sent on`initialize` describing the server's capabilities.

`{progress}` A ring buffer ([vim.ringbuf()](https://neovim.io/doc/user/lua.html#vim.ringbuf%28%29)) containing progress messages sent by the server.

client\_is\_stopped(`{client_id}`) `vim.lsp.client_is_stopped()` Checks whether a client is stopped.

 Parameters:

`{client_id}` (integer)

 Return:

 (boolean) stopped true if client is stopped, false otherwise.

commands `vim.lsp.commands` Registry for client side commands. This is an extension point for plugins to handle custom commands which are not part of the core language server protocol specification.

 The registry is a table where the key is a unique command name, and the value is a function which is called if any LSP action (code action, code lenses, ...) triggers the command.

 If a LSP response contains a command for which no matching entry is available in this registry, the command will be executed via the LSP server using `workspace/executeCommand`.

 The first argument to the function will be the `Command`: Command title: String command: String arguments?: any\[\]

 The second argument is the `ctx` of [lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) 

formatexpr(`{opts}`) `vim.lsp.formatexpr()` Provides an interface between the built-in client and a `formatexpr` function.

 Currently only supports a single client. This can be set viasetlocal formatexpr=v:lua.vim.lsp.formatexpr()\` but will typically or in`on_attach` viavim.bo\[bufnr\].formatexpr = 'v:lua.vim.lsp.formatexpr(#{timeout\_ms:250})'\`.

 Parameters:

`{opts}` (table) options for customizing the formatting expression which takes the following optional keys:

 timeout\_ms (default 500ms). The timeout period for the formatting request.

`vim.lsp.get_buffers_by_client_id()`get\_buffers\_by\_client\_id(`{client_id}`) Returns list of buffers attached to client\_id.

 Parameters:

`{client_id}` (integer) client id

 Return:

 integer\[\] buffers list of buffer ids

get\_client\_by\_id(`{client_id}`) `vim.lsp.get_client_by_id()` Gets a client by id, or nil if the id is invalid. The returned client may not yet be fully initialized.

 Parameters:

`{client_id}` (integer) client id

 Return:

 (nil|lsp.Client) client rpc object

get\_clients(`{filter}`) `vim.lsp.get_clients()` Get active clients.

 Parameters:

`{filter}` (table|nil) A table with key-value pairs used to filter the returned clients. The available keys are:

 id (number): Only return clients with the given id

 bufnr (number): Only return clients attached to this buffer

 name (string): Only return clients with the given name

 method (string): Only return clients supporting the given method

get\_log\_path() `vim.lsp.get_log_path()` Gets the path of the logfile used by the LSP client.

 Return:

 (string) path to log file

inlay\_hint(`{bufnr}`, `{enable}`) `vim.lsp.inlay_hint()` Enable/disable/toggle inlay hints for a buffer

 Parameters:

`{bufnr}` (integer) Buffer handle, or 0 for current

`{enable}` (boolean|nil) true/false to enable/disable, nil to toggle

omnifunc(`{findstart}`, `{base}`) `vim.lsp.omnifunc()` Implements ['omnifunc'](https://neovim.io/doc/user/options.html#'omnifunc') compatible LSP completion.

 Parameters:

`{findstart}` (integer) 0 or 1, decides behavior

`{base}` (integer) findstart=0, text to match against

 Return:

 integer|table Decided by `{findstart}`:

 findstart=0: column where the completion starts, or -2 or -3

 findstart=1: list of matches (actually just calls [complete()](https://neovim.io/doc/user/builtin.html#complete%28%29))

set\_log\_level(`{level}`) `vim.lsp.set_log_level()` Sets the global log level for LSP logging.

 Levels by name: "TRACE", "DEBUG", "INFO", "WARN", "ERROR", "OFF"

 Level numbers begin with "TRACE" at 0

 Use `lsp.log_levels` for reverse lookup.

 Parameters:

`{level}` (integer|string) the case insensitive level name or number

start(`{config}`, `{opts}`) `vim.lsp.start()` Create a new LSP client and start a language server or reuses an already running client if one is found matching `name` and `root_dir`. Attaches the current buffer to the client.

 Example:

```sml
vim.lsp.start({
   name = 'my-server-name',
   cmd = {'name-of-language-server-executable'},
   root_dir = vim.fs.dirname(vim.fs.find({'pyproject.toml', 'setup.py'}, { upward = true })[1]),
})
```

`name` arbitrary name for the LSP client. Should be unique per language server.

`cmd` command (in list form) used to start the language server. Must be absolute, or found on `$PATH`. Shell constructs like `~` are not expanded.

`root_dir` path to the project root. By default this is used to decide if an existing client should be re-used. The example above uses[vim.fs.find()](https://neovim.io/doc/user/lua.html#vim.fs.find%28%29) and [vim.fs.dirname()](https://neovim.io/doc/user/lua.html#vim.fs.dirname%28%29) to detect the root by traversing the file system upwards starting from the current directory until either a `pyproject.toml` or `setup.py` file is found.

`workspace_folders` list of `{ uri:string, name: string }` tables specifying the project root folders used by the language server. If`nil` the property is derived from `root_dir` for convenience.

 Language servers use this information to discover metadata like the dependencies of your project and they tend to index the contents within the project folder.

 To ensure a language server is only started for languages it can handle, make sure to call [vim.lsp.start()](https://neovim.io/doc/user/lsp.html#vim.lsp.start%28%29) within a [FileType](https://neovim.io/doc/user/autocmd.html#FileType) autocmd. Either use [:au](https://neovim.io/doc/user/autocmd.html#%3Aau), [nvim\_create\_autocmd()](https://neovim.io/doc/user/api.html#nvim%5Fcreate%5Fautocmd%28%29) or put the call in a`ftplugin/<filetype_name>.lua` (See [ftplugin-name](https://neovim.io/doc/user/usr%5F05.html#ftplugin-name))

 Parameters:

`{opts}` (nil|lsp.StartOpts) Optional keyword arguments:

 reuse\_client (fun(client: client, config: table): boolean) Predicate used to decide if a client should be re-used. Used on all running clients. The default implementation re-uses a client if name and root\_dir matches.

 bufnr (number) Buffer handle to attach to if starting or re-using a client (0 for current).

 Return:

 (integer|nil) client\_id

start\_client(`{config}`) `vim.lsp.start_client()` Starts and initializes a client with the given configuration.

 Field `cmd` in `{config}` is required.

 Parameters:

`{config}` ( lsp.ClientConfig ) Configuration for the server:

 cmd: (string\[\]|fun(dispatchers: table):table) command a list of strings treated like [jobstart()](https://neovim.io/doc/user/builtin.html#jobstart%28%29). The command must launch the language server process. `cmd` can also be a function that creates an RPC client. The function receives a dispatchers table and must return a table with the functions `request`, `notify`, `is_closing` and`terminate` See [vim.lsp.rpc.request()](https://neovim.io/doc/user/lsp.html#vim.lsp.rpc.request%28%29) and[vim.lsp.rpc.notify()](https://neovim.io/doc/user/lsp.html#vim.lsp.rpc.notify%28%29) For TCP there is a built-in rpc client factory: [vim.lsp.rpc.connect()](https://neovim.io/doc/user/lsp.html#vim.lsp.rpc.connect%28%29) 

 cmd\_cwd: (string, default=|getcwd()|) Directory to launch the `cmd` process. Not related to `root_dir`.

 cmd\_env: (table) Environment flags to pass to the LSP on spawn. Must be specified using a table. Non-string values are coerced to string. Example:

{ PORT = 8080; HOST = "0.0.0.0"; }

 detached: (boolean, default true) Daemonize the server process so that it runs in a separate process group from Nvim. Nvim will shutdown the process on exit, but if Nvim fails to exit cleanly this could leave behind orphaned server processes.

 workspace\_folders: (table) List of workspace folders passed to the language server. For backwards compatibility rootUri and rootPath will be derived from the first workspace folder in this list. See `workspaceFolders` in the LSP spec.

 capabilities: Map overriding the default capabilities defined by [vim.lsp.protocol.make\_client\_capabilities()](https://neovim.io/doc/user/lsp.html#vim.lsp.protocol.make%5Fclient%5Fcapabilities%28%29), passed to the language server on initialization. Hint: use make\_client\_capabilities() and modify its result.

 Note: To send an empty dictionary use[vim.empty\_dict()](https://neovim.io/doc/user/lua.html#vim.empty%5Fdict%28%29), else it will be encoded as an array.

 handlers: Map of language server method names to[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) 

 settings: Map with language server specific settings. These are returned to the language server if requested via`workspace/configuration`. Keys are case-sensitive.

 commands: table Table that maps string of clientside commands to user-defined functions. Commands passed to start\_client take precedence over the global command registry. Each key must be a unique command name, and the value is a function which is called if any LSP action (code action, code lenses, ...) triggers the command.

 init\_options Values to pass in the initialization request as `initializationOptions`. See `initialize` in the LSP spec.

 name: (string, default=client-id) Name in log messages.

 get\_language\_id: function(bufnr, filetype) -> language ID as string. Defaults to the filetype.

 offset\_encoding: (default="utf-16") One of "utf-8", "utf-16", or "utf-32" which is the encoding that the LSP server expects. Client does not verify this is correct.

 on\_error: Callback with parameters (code, ...), invoked when the client operation throws an error. `code` is a number describing the error. Other arguments may be passed depending on the error kind. See`vim.lsp.rpc.client_errors` for possible errors. Use`vim.lsp.rpc.client_errors[code]` to get human-friendly name.

 before\_init: Callback with parameters (initialize\_params, config) invoked before the LSP "initialize" phase, where`params` contains the parameters being sent to the server and `config` is the config that was passed to[vim.lsp.start\_client()](https://neovim.io/doc/user/lsp.html#vim.lsp.start%5Fclient%28%29). You can use this to modify parameters before they are sent.

 on\_init: Callback (client, initialize\_result) invoked after LSP "initialize", where `result` is a table of`capabilities` and anything else the server may send. For example, clangd sends `initialize_result.offsetEncoding` if `capabilities.offsetEncoding` was sent to it. You can only modify the `client.offset_encoding` here before any notifications are sent. Most language servers expect to be sent client specified settings after initialization. Nvim does not make this assumption. A`workspace/didChangeConfiguration` notification should be sent to the server during on\_init.

 on\_exit Callback (code, signal, client\_id) invoked on client exit.

 code: exit code of the process

 signal: number describing the signal used to terminate (if any)

 client\_id: client handle

 on\_attach: Callback (client, bufnr) invoked when client attaches to a buffer.

 trace: ("off" | "messages" | "verbose" | nil) passed directly to the language server in the initialize request. Invalid/empty values will default to "off"

 flags: A table with flags for the client. The current (experimental) flags are:

 allow\_incremental\_sync (bool, default true): Allow using incremental sync for buffer edits

 debounce\_text\_changes (number, default 150): Debounce didChange notifications to the server by the given number in milliseconds. No debounce occurs if nil

 exit\_timeout (number|boolean, default false): Milliseconds to wait for server to exit cleanly after sending the "shutdown" request before sending kill -15\. If set to false, nvim exits immediately after sending the "shutdown" request to the server.

 root\_dir: (string) Directory where the LSP server will base its workspaceFolders, rootUri, and rootPath on initialization.

 Return:

 (integer|nil) client\_id. [vim.lsp.get\_client\_by\_id()](https://neovim.io/doc/user/lsp.html#vim.lsp.get%5Fclient%5Fby%5Fid%28%29) Note: client may not be fully initialized. Use `on_init` to do any actions once the client has been initialized.

status() `vim.lsp.status()` Consumes the latest progress messages from all clients and formats them as a string. Empty if there are no clients or if no new messages

stop\_client(`{client_id}`, `{force}`) `vim.lsp.stop_client()` Stops a client(s).

 You can also use the `stop()` function on a [vim.lsp.client](https://neovim.io/doc/user/lsp.html#vim.lsp.client) object. To stop all clients:

```css
vim.lsp.stop_client(vim.lsp.get_clients())
```

 By default asks the server to shutdown, unless stop was requested already for this client, then force-shutdown is attempted.

 Parameters:

`{client_id}` integer|table id or [vim.lsp.client](https://neovim.io/doc/user/lsp.html#vim.lsp.client) object, or list thereof

`{force}` (boolean|nil) shutdown forcefully

tagfunc(`{pattern}`, `{flags}`) `vim.lsp.tagfunc()` Provides an interface between the built-in client and ['tagfunc'](https://neovim.io/doc/user/options.html#'tagfunc').

 When used with normal mode commands (e.g. [CTRL-\]](https://neovim.io/doc/user/tagsrch.html#CTRL-%5D)) this will invoke the "textDocument/definition" LSP method to find the tag under the cursor. Otherwise, uses "workspace/symbol". If no results are returned from any LSP servers, falls back to using built-in tags.

 Parameters:

`{pattern}` (string) Pattern used to find a workspace symbol

 Return:

 table\[\] tags A list of matching tags

with(`{handler}`, `{override_config}`) `vim.lsp.with()` Function to manage overriding defaults for LSP handlers.

 Parameters:

`{override_config}` (table) Table containing the keys to override behavior of the `{handler}` 

## Lua module: vim.lsp.buf [lsp-buf](#lsp-buf)

`vim.lsp.buf.add_workspace_folder()`add\_workspace\_folder(`{workspace_folder}`) Add the folder at path to the workspace folders. If `{path}` is not provided, the user will be prompted for a path using [input()](https://neovim.io/doc/user/builtin.html#input%28%29).

clear\_references() `vim.lsp.buf.clear_references()` Removes document highlights from current buffer.

code\_action(`{options}`) `vim.lsp.buf.code_action()` Selects a code action available at the current cursor position.

 Parameters:

`{options}` (table|nil) Optional table which holds the following optional fields:

 context: (table|nil) Corresponds to `CodeActionContext` of the LSP specification:

 diagnostics (table|nil): LSP `Diagnostic[]`. Inferred from the current position if not provided.

 only (table|nil): List of LSP `CodeActionKind`s used to filter the code actions. Most language servers support values like `refactor` or `quickfix`.

 triggerKind (number|nil): The reason why code actions were requested.

 filter: (function|nil) Predicate taking an `CodeAction` and returning a boolean.

 apply: (boolean|nil) When set to `true`, and there is just one remaining action (after filtering), the action is applied without user query.

 range: (table|nil) Range for which code actions should be requested. If in visual mode this defaults to the active selection. Table must contain `start` and `end` keys with`{row,col}` tuples using mark-like indexing. See[api-indexing](https://neovim.io/doc/user/api.html#api-indexing) 

 See also:

 vim.lsp.protocol.CodeActionTriggerKind

completion(`{context}`) `vim.lsp.buf.completion()` Retrieves the completion items at the current cursor position. Can only be called in Insert mode.

 Parameters:

`{context}` (table) (context support not yet implemented) Additional information about the context in which a completion was triggered (how it was triggered, and by which trigger character, if applicable)

 See also:

 vim.lsp.protocol.CompletionTriggerKind

declaration(`{options}`) `vim.lsp.buf.declaration()` Jumps to the declaration of the symbol under the cursor.

 Parameters:

`{options}` (table|nil) additional options

 reuse\_win: (boolean) Jump to existing window if buffer is already open.

 on\_list: (function) [lsp-on-list-handler](https://neovim.io/doc/user/lsp.html#lsp-on-list-handler) replacing the default handler. Called for any non-empty result.

definition(`{options}`) `vim.lsp.buf.definition()` Jumps to the definition of the symbol under the cursor.

 Parameters:

`{options}` (table|nil) additional options

 reuse\_win: (boolean) Jump to existing window if buffer is already open.

 on\_list: (function) [lsp-on-list-handler](https://neovim.io/doc/user/lsp.html#lsp-on-list-handler) replacing the default handler. Called for any non-empty result.

document\_highlight() `vim.lsp.buf.document_highlight()` Send request to the server to resolve document highlights for the current text document position. This request can be triggered by a key mapping or by events such as `CursorHold`, e.g.:

```vim
autocmd CursorHold  <buffer> lua vim.lsp.buf.document_highlight()
autocmd CursorHoldI <buffer> lua vim.lsp.buf.document_highlight()
autocmd CursorMoved <buffer> lua vim.lsp.buf.clear_references()
```

document\_symbol(`{options}`) `vim.lsp.buf.document_symbol()` Lists all symbols in the current buffer in the quickfix window.

 Parameters:

`{options}` (table|nil) additional options

execute\_command(`{command_params}`) `vim.lsp.buf.execute_command()` Executes an LSP server command.

 Parameters:

`{command_params}` (table) A valid `ExecuteCommandParams` object

format(`{options}`) `vim.lsp.buf.format()` Formats a buffer using the attached (and optionally filtered) language server clients.

 Parameters:

`{options}` (table|nil) Optional table which holds the following optional fields:

 timeout\_ms (integer|nil, default 1000): Time in milliseconds to block for formatting requests. No effect if async=true

 bufnr (number|nil): Restrict formatting to the clients attached to the given buffer, defaults to the current buffer (0).

 filter (function|nil): Predicate used to filter clients. Receives a client as argument and must return a boolean. Clients matching the predicate are included. Example:

```routeros
-- Never request typescript-language-server for formatting
vim.lsp.buf.format {
  filter = function(client) return client.name ~= "tsserver" end
}
```

 async boolean|nil If true the method won't block. Defaults to false. Editing the buffer while formatting asynchronous can lead to unexpected changes.

 id (number|nil): Restrict formatting to the client with ID (client.id) matching this field.

 name (string|nil): Restrict formatting to the client with name (client.name) matching this field.

 range (table|nil) Range to format. Table must contain`start` and `end` keys with `{row,col}` tuples using (1,0) indexing. Defaults to current selection in visual mode Defaults to `nil` in other modes, formatting the full buffer

hover() `vim.lsp.buf.hover()` Displays hover information about the symbol under the cursor in a floating window. Calling the function twice will jump into the floating window.

implementation(`{options}`) `vim.lsp.buf.implementation()` Lists all the implementations for the symbol under the cursor in the quickfix window.

 Parameters:

`{options}` (table|nil) additional options

 on\_list: (function) [lsp-on-list-handler](https://neovim.io/doc/user/lsp.html#lsp-on-list-handler) replacing the default handler. Called for any non-empty result.

incoming\_calls() `vim.lsp.buf.incoming_calls()` Lists all the call sites of the symbol under the cursor in the [quickfix](https://neovim.io/doc/user/quickfix.html#quickfix) window. If the symbol can resolve to multiple items, the user can pick one in the [inputlist()](https://neovim.io/doc/user/builtin.html#inputlist%28%29).

list\_workspace\_folders() `vim.lsp.buf.list_workspace_folders()` List workspace folders.

outgoing\_calls() `vim.lsp.buf.outgoing_calls()` Lists all the items that are called by the symbol under the cursor in the[quickfix](https://neovim.io/doc/user/quickfix.html#quickfix) window. If the symbol can resolve to multiple items, the user can pick one in the [inputlist()](https://neovim.io/doc/user/builtin.html#inputlist%28%29).

references(`{context}`, `{options}`) `vim.lsp.buf.references()` Lists all the references to the symbol under the cursor in the quickfix window.

 Parameters:

`{context}` (table|nil) Context for the request

`{options}` (table|nil) additional options

`vim.lsp.buf.remove_workspace_folder()`remove\_workspace\_folder(`{workspace_folder}`) Remove the folder at path from the workspace folders. If `{path}` is not provided, the user will be prompted for a path using [input()](https://neovim.io/doc/user/builtin.html#input%28%29).

rename(`{new_name}`, `{options}`) `vim.lsp.buf.rename()` Renames all references to the symbol under the cursor.

 Parameters:

`{new_name}` (string|nil) If not provided, the user will be prompted for a new name using [vim.ui.input()](https://neovim.io/doc/user/lua.html#vim.ui.input%28%29).

`{options}` (table|nil) additional options

 filter (function|nil): Predicate used to filter clients. Receives a client as argument and must return a boolean. Clients matching the predicate are included.

 name (string|nil): Restrict clients used for rename to ones where client.name matches this field.

signature\_help() `vim.lsp.buf.signature_help()` Displays signature information about the symbol under the cursor in a floating window.

type\_definition(`{options}`) `vim.lsp.buf.type_definition()` Jumps to the definition of the type of the symbol under the cursor.

 Parameters:

`{options}` (table|nil) additional options

 reuse\_win: (boolean) Jump to existing window if buffer is already open.

 on\_list: (function) [lsp-on-list-handler](https://neovim.io/doc/user/lsp.html#lsp-on-list-handler) replacing the default handler. Called for any non-empty result.

workspace\_symbol(`{query}`, `{options}`) `vim.lsp.buf.workspace_symbol()` Lists all symbols in the current workspace in the quickfix window.

 The list is filtered against `{query}`; if the argument is omitted from the call, the user is prompted to enter a string on the command line. An empty string means no filtering is done.

 Parameters:

`{query}` (string|nil) optional

`{options}` (table|nil) additional options

## Lua module: vim.lsp.diagnostic [lsp-diagnostic](#lsp-diagnostic)

`vim.lsp.diagnostic.get_namespace()`get\_namespace(`{client_id}`, `{is_pull}`) Get the diagnostic namespace associated with an LSP client[vim.diagnostic](https://neovim.io/doc/user/diagnostic.html#vim.diagnostic) for diagnostics

 Parameters:

`{client_id}` (integer) The id of the LSP client

`{is_pull}` boolean? Whether the namespace is for a pull or push client. Defaults to push

`vim.lsp.diagnostic.on_diagnostic()`on\_diagnostic(`{_}`, `{result}`, `{ctx}`, `{config}`)[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) for the method "textDocument/diagnostic"

 See [vim.diagnostic.config()](https://neovim.io/doc/user/diagnostic.html#vim.diagnostic.config%28%29) for configuration options. Handler-specific configuration can be set using [vim.lsp.with()](https://neovim.io/doc/user/lsp.html#vim.lsp.with%28%29):

```routeros
vim.lsp.handlers["textDocument/diagnostic"] = vim.lsp.with(
  vim.lsp.diagnostic.on_diagnostic, {
    -- Enable underline, use default values
    underline = true,
    -- Enable virtual text, override spacing to 4
    virtual_text = {
      spacing = 4,
    },
    -- Use a function to dynamically turn signs off
    -- and on, using buffer local variables
    signs = function(namespace, bufnr)
      return vim.b[bufnr].show_signs == true
    end,
    -- Disable a feature
    update_in_insert = false,
  }
)
```

`vim.lsp.diagnostic.on_publish_diagnostics()`on\_publish\_diagnostics(`{_}`, `{result}`, `{ctx}`, `{config}`)[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) for the method "textDocument/publishDiagnostics"

 See [vim.diagnostic.config()](https://neovim.io/doc/user/diagnostic.html#vim.diagnostic.config%28%29) for configuration options. Handler-specific configuration can be set using [vim.lsp.with()](https://neovim.io/doc/user/lsp.html#vim.lsp.with%28%29):

```routeros
vim.lsp.handlers["textDocument/publishDiagnostics"] = vim.lsp.with(
  vim.lsp.diagnostic.on_publish_diagnostics, {
    -- Enable underline, use default values
    underline = true,
    -- Enable virtual text, override spacing to 4
    virtual_text = {
      spacing = 4,
    },
    -- Use a function to dynamically turn signs off
    -- and on, using buffer local variables
    signs = function(namespace, bufnr)
      return vim.b[bufnr].show_signs == true
    end,
    -- Disable a feature
    update_in_insert = false,
  }
)
```

## Lua module: vim.lsp.codelens [lsp-codelens](#lsp-codelens)

clear(`{client_id}`, `{bufnr}`) `vim.lsp.codelens.clear()` Clear the lenses

 Parameters:

`{client_id}` (integer|nil) filter by client\_id. All clients if nil

`{bufnr}` (integer|nil) filter by buffer. All buffers if nil

display(`{lenses}`, `{bufnr}`, `{client_id}`) `vim.lsp.codelens.display()` Display the lenses using virtual text

 Parameters:

`{lenses}` lsp.CodeLens\[\]|nil lenses to display

`{bufnr}` (integer)

`{client_id}` (integer)

get(`{bufnr}`) `vim.lsp.codelens.get()` Return all lenses for the given buffer

 Parameters:

`{bufnr}` (integer) Buffer number. 0 can be used for the current buffer.

`vim.lsp.codelens.on_codelens()`on\_codelens(`{err}`, `{result}`, `{ctx}`, `{_}`)[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) for the method `textDocument/codeLens` 

refresh() `vim.lsp.codelens.refresh()` Refresh the codelens for the current buffer

 It is recommended to trigger this using an autocmd or via keymap.

 Example:

```vim
autocmd BufEnter,CursorHold,InsertLeave <buffer> lua vim.lsp.codelens.refresh()
```

run() `vim.lsp.codelens.run()` Run the code lens in the current line

save(`{lenses}`, `{bufnr}`, `{client_id}`) `vim.lsp.codelens.save()` Store lenses for a specific buffer and client

 Parameters:

`{lenses}` lsp.CodeLens\[\]|nil lenses to store

`{bufnr}` (integer)

`{client_id}` (integer)

## Lua module: vim.lsp.semantic\_tokens [lsp-semantic\_tokens](#lsp-semantic%5Ftokens)

force\_refresh(`{bufnr}`) `vim.lsp.semantic_tokens.force_refresh()` Force a refresh of all semantic tokens

 Only has an effect if the buffer is currently active for semantic token highlighting ([vim.lsp.semantic\_tokens.start()](https://neovim.io/doc/user/lsp.html#vim.lsp.semantic%5Ftokens.start%28%29) has been called for it)

 Parameters:

`{bufnr}` (integer|nil) filter by buffer. All buffers if nil, current buffer if 0

`vim.lsp.semantic_tokens.get_at_pos()`get\_at\_pos(`{bufnr}`, `{row}`, `{col}`) Return the semantic token(s) at the given position. If called without arguments, returns the token under the cursor.

 Parameters:

`{bufnr}` (integer|nil) Buffer number (0 for current buffer, default)

`{row}` (integer|nil) Position row (default cursor position)

`{col}` (integer|nil) Position column (default cursor position)

 Return:

 (table|nil) List of tokens at position. Each token has the following fields:

 line (integer) line number, 0-based

 start\_col (integer) start column, 0-based

 end\_col (integer) end column, 0-based

 type (string) token type as string, e.g. "variable"

 modifiers (table) token modifiers as a set. E.g., { static = true, readonly = true }

`vim.lsp.semantic_tokens.highlight_token()`highlight\_token(`{token}`, `{bufnr}`, `{client_id}`, `{hl_group}`, `{opts}`) Highlight a semantic token.

 Apply an extmark with a given highlight group for a semantic token. The mark will be deleted by the semantic token engine when appropriate; for example, when the LSP sends updated tokens. This function is intended for use inside [LspTokenUpdate](https://neovim.io/doc/user/lsp.html#LspTokenUpdate) callbacks.

 Parameters:

`{token}` (table) a semantic token, found as `args.data.token` in[LspTokenUpdate](https://neovim.io/doc/user/lsp.html#LspTokenUpdate).

`{bufnr}` (integer) the buffer to highlight

`{hl_group}` (string) Highlight group name

`{opts}` (table|nil) Optional parameters.

 priority: (integer|nil) Priority for the applied extmark. Defaults to`vim.highlight.priorities.semantic_tokens + 3` 

start(`{bufnr}`, `{client_id}`, `{opts}`) `vim.lsp.semantic_tokens.start()` Start the semantic token highlighting engine for the given buffer with the given client. The client must already be attached to the buffer.

 NOTE: This is currently called automatically by[vim.lsp.buf\_attach\_client()](https://neovim.io/doc/user/lsp.html#vim.lsp.buf%5Fattach%5Fclient%28%29). To opt-out of semantic highlighting with a server that supports it, you can delete the semanticTokensProvider table from the `{server_capabilities}` of your client in your [LspAttach](https://neovim.io/doc/user/lsp.html#LspAttach) callback or your configuration's `on_attach` callback:

```ini
client.server_capabilities.semanticTokensProvider = nil
```

 Parameters:

`{bufnr}` (integer)

`{client_id}` (integer)

`{opts}` (nil|table) Optional keyword arguments

 debounce (integer, default: 200): Debounce token requests to the server by the given number in milliseconds

stop(`{bufnr}`, `{client_id}`) `vim.lsp.semantic_tokens.stop()` Stop the semantic token highlighting engine for the given buffer with the given client.

 NOTE: This is automatically called by a [LspDetach](https://neovim.io/doc/user/lsp.html#LspDetach) autocmd that is set up as part of `start()`, so you should only need this function to manually disengage the semantic token engine without fully detaching the LSP client from the buffer.

 Parameters:

`{bufnr}` (integer)

`{client_id}` (integer)

## Lua module: vim.lsp.handlers [lsp-handlers](#lsp-handlers)

hover(`{_}`, `{result}`, `{ctx}`, `{config}`) `vim.lsp.handlers.hover()` [lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) for the method "textDocument/hover"

```stylus
vim.lsp.handlers["textDocument/hover"] = vim.lsp.with(
  vim.lsp.handlers.hover, {
    -- Use a sharp border with `FloatBorder` highlights
    border = "single",
    -- add the title in hover float window
    title = "hover"
  }
)
```

 Parameters:

`{config}` (table) Configuration table.

 border: (default=nil)

 Add borders to the floating window

`vim.lsp.handlers.signature_help()`signature\_help(`{_}`, `{result}`, `{ctx}`, `{config}`)[lsp-handler](https://neovim.io/doc/user/lsp.html#lsp-handler) for the method "textDocument/signatureHelp".

 The active parameter is highlighted with [hl-LspSignatureActiveParameter](https://neovim.io/doc/user/lsp.html#hl-LspSignatureActiveParameter).

```stylus
vim.lsp.handlers["textDocument/signatureHelp"] = vim.lsp.with(
  vim.lsp.handlers.signature_help, {
    -- Use a sharp border with `FloatBorder` highlights
    border = "single"
  }
)
```

 Parameters:

`{result}` (table) Response from the language server

`{ctx}` (table) Client context

`{config}` (table) Configuration table.

 border: (default=nil)

 Add borders to the floating window

## Lua module: vim.lsp.util [lsp-util](#lsp-util)

`vim.lsp.util.apply_text_document_edit()`apply\_text\_document\_edit(`{text_document_edit}`, `{index}`, `{offset_encoding}`) Applies a `TextDocumentEdit`, which is a list of changes to a single document.

 Parameters:

`{text_document_edit}` (table) a `TextDocumentEdit` object

`{index}` (integer) Optional index of the edit, if from a list of edits (or nil, if not from a list)

`vim.lsp.util.apply_text_edits()`apply\_text\_edits(`{text_edits}`, `{bufnr}`, `{offset_encoding}`) Applies a list of text edits to a buffer.

 Parameters:

`{text_edits}` (table) list of `TextEdit` objects

`{bufnr}` (integer) Buffer id

`{offset_encoding}` (string) utf-8|utf-16|utf-32

`vim.lsp.util.apply_workspace_edit()`apply\_workspace\_edit(`{workspace_edit}`, `{offset_encoding}`) Applies a `WorkspaceEdit`.

 Parameters:

`{workspace_edit}` (table) `WorkspaceEdit` 

`{offset_encoding}` (string) utf-8|utf-16|utf-32 (required)

buf\_clear\_references(`{bufnr}`) `vim.lsp.util.buf_clear_references()` Removes document highlights from a buffer.

 Parameters:

`{bufnr}` (integer|nil) Buffer id

`vim.lsp.util.buf_highlight_references()`buf\_highlight\_references(`{bufnr}`, `{references}`, `{offset_encoding}`) Shows a list of document highlights for a certain buffer.

 Parameters:

`{bufnr}` (integer) Buffer id

`{references}` (table) List of `DocumentHighlight` objects to highlight

`{offset_encoding}` (string) One of "utf-8", "utf-16", "utf-32".

`vim.lsp.util.character_offset()`character\_offset(`{buf}`, `{row}`, `{col}`, `{offset_encoding}`) Returns the UTF-32 and UTF-16 offsets for a position in a certain buffer.

 Parameters:

`{buf}` (integer) buffer number (0 for current)

`{row}` 0-indexed line

`{col}` 0-indexed byte offset in line

`{offset_encoding}` (string) utf-8|utf-16|utf-32 defaults to`offset_encoding` of first client of `buf` 

 Return:

 (integer) `offset_encoding` index of the character in line `{row}` column `{col}` in buffer `{buf}` 

`vim.lsp.util.convert_input_to_markdown_lines()`convert\_input\_to\_markdown\_lines(`{input}`, `{contents}`) Converts any of `MarkedString` | `MarkedString[]` | `MarkupContent` into a list of lines containing valid markdown. Useful to populate the hover window for `textDocument/hover`, for parsing the result of`textDocument/signatureHelp`, and potentially others.

 Note that if the input is of type `MarkupContent` and its kind is`plaintext`, then the corresponding value is returned without further modifications.

 Parameters:

`{input}` (`MarkedString` | `MarkedString[]` | `MarkupContent`)

`{contents}` (table|nil) List of strings to extend with converted lines. Defaults to {}.

 Return:

 string\[\] extended with lines of converted markdown.

`vim.lsp.util.convert_signature_help_to_markdown_lines()`convert\_signature\_help\_to\_markdown\_lines(`{signature_help}`, `{ft}`, `{triggers}`) Converts `textDocument/signatureHelp` response to markdown lines.

 Parameters:

`{signature_help}` (table) Response of `textDocument/SignatureHelp` 

`{ft}` (string|nil) filetype that will be use as the `lang` for the label markdown code block

`{triggers}` (table|nil) list of trigger characters from the lsp server. used to better determine parameter offsets

 Return (multiple):

 (table|nil) table list of lines of converted markdown. (table|nil) table of active hl

get\_effective\_tabstop(`{bufnr}`) `vim.lsp.util.get_effective_tabstop()` Returns indentation size.

 Parameters:

`{bufnr}` (integer|nil) Buffer handle, defaults to current

 Return:

 (integer) indentation size

`vim.lsp.util.jump_to_location()`jump\_to\_location(`{location}`, `{offset_encoding}`, `{reuse_win}`) Jumps to a location.

 Parameters:

`{location}` (table) (`Location`\`LocationLink\`)

`{offset_encoding}` (string|nil) utf-8|utf-16|utf-32

`{reuse_win}` (boolean|nil) Jump to existing window if buffer is already open.

 Return:

 (boolean) `true` if the jump succeeded

`vim.lsp.util.locations_to_items()`locations\_to\_items(`{locations}`, `{offset_encoding}`) Returns the items with the byte position calculated correctly and in sorted order, for display in quickfix and location lists.

 The `user_data` field of each resulting item will contain the original`Location` or `LocationLink` it was computed from.

 Parameters:

`{locations}` (table) list of `Location`s or `LocationLink`s

`{offset_encoding}` (string) offset\_encoding for locations utf-8|utf-16|utf-32 default to first client of buffer

 Return:

 (table) list of items

lookup\_section(`{settings}`, `{section}`) `vim.lsp.util.lookup_section()` Helper function to return nested values in language server settings

 Parameters:

`{settings}` (table) language server settings

`{section}` string indicating the field of the settings table

 Return:

 table|string The value of settings accessed via section

make\_floating\_popup\_options(`{width}`, `{height}`, `{opts}`) Creates a table with sensible default options for a floating window. The table can be passed to [nvim\_open\_win()](https://neovim.io/doc/user/api.html#nvim%5Fopen%5Fwin%28%29).

 Parameters:

`{width}` (integer) window width (in character cells)

`{height}` (integer) window height (in character cells)

`{opts}` (table) optional

 offset\_x (integer) offset to add to `col` 

 offset\_y (integer) offset to add to `row` 

 border (string or table) override `border` 

 focusable (string or table) override `focusable` 

 zindex (string or table) override `zindex`, defaults to 50

 relative ("mouse"|"cursor") defaults to "cursor"

 anchor\_bias ("auto"|"above"|"below") defaults to "auto"

 "auto": place window based on which side of the cursor has more lines

 "above": place the window above the cursor unless there are not enough lines to display the full window height.

 "below": place the window below the cursor unless there are not enough lines to display the full window height.

`vim.lsp.util.make_formatting_params()`make\_formatting\_params(`{options}`) Creates a `DocumentFormattingParams` object for the current buffer and cursor position.

 Parameters:

`{options}` (table|nil) with valid `FormattingOptions` entries

 Return:

`DocumentFormattingParams` object

`vim.lsp.util.make_given_range_params()`make\_given\_range\_params(`{start_pos}`, `{end_pos}`, `{bufnr}`, `{offset_encoding}`) Using the given range in the current buffer, creates an object that is similar to [vim.lsp.util.make\_range\_params()](https://neovim.io/doc/user/lsp.html#vim.lsp.util.make%5Frange%5Fparams%28%29).

 Parameters:

`{start_pos}` integer\[\]|nil `{row,col}` mark-indexed position. Defaults to the start of the last visual selection.

`{end_pos}` integer\[\]|nil `{row,col}` mark-indexed position. Defaults to the end of the last visual selection.

`{bufnr}` (integer|nil) buffer handle or 0 for current, defaults to current

`{offset_encoding}` "utf-8"|"utf-16"|"utf-32"|nil defaults to`offset_encoding` of first client of `bufnr` 

 Return:

 (table) { textDocument = { uri = `current_file_uri` }, range = { start = `start_position`, end = `end_position` } }

`vim.lsp.util.make_position_params()`make\_position\_params(`{window}`, `{offset_encoding}`) Creates a `TextDocumentPositionParams` object for the current buffer and cursor position.

 Parameters:

`{window}` (integer|nil) window handle or 0 for current, defaults to current

`{offset_encoding}` (string|nil) utf-8|utf-16|utf-32|nil defaults to`offset_encoding` of first client of buffer of`window` 

 Return:

 (table) `TextDocumentPositionParams` object

`vim.lsp.util.make_range_params()`make\_range\_params(`{window}`, `{offset_encoding}`) Using the current position in the current buffer, creates an object that can be used as a building block for several LSP requests, such as`textDocument/codeAction`, `textDocument/colorPresentation`,`textDocument/rangeFormatting`.

 Parameters:

`{window}` (integer|nil) window handle or 0 for current, defaults to current

`{offset_encoding}` "utf-8"|"utf-16"|"utf-32"|nil defaults to`offset_encoding` of first client of buffer of`window` 

 Return:

 (table) { textDocument = { uri = `current_file_uri` }, range = { start = `current_position`, end = `current_position` } }

`vim.lsp.util.make_text_document_params()`make\_text\_document\_params(`{bufnr}`) Creates a `TextDocumentIdentifier` object for the current buffer.

 Parameters:

`{bufnr}` (integer|nil) Buffer handle, defaults to current

 Return:

 (table) `TextDocumentIdentifier` 

`vim.lsp.util.make_workspace_params()`make\_workspace\_params(`{added}`, `{removed}`) Create the workspace params

 Parameters:

`{added}` (table)

`{removed}` (table)

`vim.lsp.util.open_floating_preview()`open\_floating\_preview(`{contents}`, `{syntax}`, `{opts}`) Shows contents in a floating window.

 Parameters:

`{contents}` (table) of lines to show in window

`{syntax}` (string) of syntax to set for opened buffer

 height: (integer) height of floating window

 width: (integer) width of floating window

 wrap: (boolean, default true) wrap long lines

 wrap\_at: (integer) character to wrap at for computing height when wrap is enabled

 max\_width: (integer) maximal width of floating window

 max\_height: (integer) maximal height of floating window

 focus\_id: (string) if a popup with this id is opened, then focus it

 close\_events: (table) list of events that closes the floating window

 focusable: (boolean, default true) Make float focusable

 focus: (boolean, default true) If `true`, and if`{focusable}` is also `true`, focus an existing floating window with the same `{focus_id}` 

 Return (multiple):

 (integer) bufnr of newly created float window (integer) winid of newly created float window preview window

preview\_location(`{location}`, `{opts}`) `vim.lsp.util.preview_location()` Previews a location in a floating window

 behavior depends on type of location:

 for Location, range is shown (e.g., function definition)

 for LocationLink, targetRange is shown (e.g., body of function definition)

 Parameters:

`{location}` (table) a single `Location` or `LocationLink` 

 Return (multiple):

 (integer|nil) buffer id of float window (integer|nil) window id of float window

rename(`{old_fname}`, `{new_fname}`, `{opts}`) `vim.lsp.util.rename()` Rename old\_fname to new\_fname

 Parameters:

`{opts}` (table)

`vim.lsp.util.show_document()`show\_document(`{location}`, `{offset_encoding}`, `{opts}`) Shows document and optionally jumps to the location.

 Parameters:

`{location}` (table) (`Location`\`LocationLink\`)

`{offset_encoding}` (string|nil) utf-8|utf-16|utf-32

`{opts}` (table|nil) options

 reuse\_win (boolean) Jump to existing window if buffer is already open.

 focus (boolean) Whether to focus/jump to location if possible. Defaults to true.

 Return:

 (boolean) `true` if succeeded

`vim.lsp.util.stylize_markdown()`stylize\_markdown(`{bufnr}`, `{contents}`, `{opts}`) Converts markdown into syntax highlighted regions by stripping the code blocks and converting them into highlighted code. This will by default insert a blank line separator after those code block regions to improve readability.

 This method configures the given buffer and returns the lines to set.

 If you want to open a popup with fancy markdown, use`open_floating_preview` instead

 Parameters:

`{contents}` (table) of lines to show in window

`{opts}` (table) with optional fields

 height of floating window

 width of floating window

 wrap\_at character to wrap at for computing height

 max\_width maximal width of floating window

 max\_height maximal height of floating window

 separator insert separator after code block

 Return:

 (table) stripped content

symbols\_to\_items(`{symbols}`, `{bufnr}`) `vim.lsp.util.symbols_to_items()` Converts symbols to quickfix list items.

 Parameters:

`{symbols}` (table) DocumentSymbol\[\] or SymbolInformation\[\]

## Lua module: vim.lsp.log [lsp-log](#lsp-log)

get\_filename() `vim.lsp.log.get_filename()` Returns the log filename.

 Return:

 (string) log filename

get\_level() `vim.lsp.log.get_level()` Gets the current log level.

 Return:

 (integer) current log level

set\_format\_func(`{handle}`) `vim.lsp.log.set_format_func()` Sets formatting function used to format logs

 Parameters:

`{handle}` (function) function to apply to logging arguments, pass vim.inspect for multi-line formatting

set\_level(`{level}`) `vim.lsp.log.set_level()` Sets the current log level.

 Parameters:

`{level}` (string|integer) One of `vim.lsp.log.levels` 

should\_log(`{level}`) `vim.lsp.log.should_log()` Checks whether the level is sufficient for logging.

 Parameters:

`{level}` (integer) log level

 Return:

 (bool) true if would log, false if not

## Lua module: vim.lsp.rpc [lsp-rpc](#lsp-rpc)

connect(`{host}`, `{port}`) `vim.lsp.rpc.connect()` Create a LSP RPC client factory that connects via TCP to the given host and port

 Parameters:

`{host}` (string)

`{port}` (integer)

format\_rpc\_error(`{err}`) `vim.lsp.rpc.format_rpc_error()` Constructs an error message from an LSP error object.

 Parameters:

`{err}` (table) The error object

 Return:

 (string) The formatted error message

notify(`{method}`, `{params}`) `vim.lsp.rpc.notify()` Sends a notification to the LSP server.

 Parameters:

`{method}` (string) The invoked LSP method

`{params}` (table|nil) Parameters for the invoked LSP method

 Return:

 (boolean) `true` if notification could be sent, `false` if not

`vim.lsp.rpc.request()`request(`{method}`, `{params}`, `{callback}`, `{notify_reply_callback}`) Sends a request to the LSP server and runs `{callback}` upon response.

 Parameters:

`{method}` (string) The invoked LSP method

`{params}` (table|nil) Parameters for the invoked LSP method

`{callback}` fun(err: lsp.ResponseError | nil, result: any) Callback to invoke

`{notify_reply_callback}` (function|nil) Callback to invoke as soon as a request is no longer pending

 Return:

 (boolean) success, integer|nil request\_id true, message\_id if request could be sent, `false` if not

`vim.lsp.rpc.rpc_response_error()`rpc\_response\_error(`{code}`, `{message}`, `{data}`) Creates an RPC response object/table.

 Parameters:

`{code}` (integer) RPC error code defined in`vim.lsp.protocol.ErrorCodes` 

`{message}` (string|nil) arbitrary message to send to server

`{data}` any|nil arbitrary data to send to server

`vim.lsp.rpc.start()`start(`{cmd}`, `{cmd_args}`, `{dispatchers}`, `{extra_spawn_params}`) Starts an LSP server process and create an LSP RPC client object to interact with it. Communication with the spawned process happens via stdio. For communication via TCP, spawn a process manually and use[vim.lsp.rpc.connect()](https://neovim.io/doc/user/lsp.html#vim.lsp.rpc.connect%28%29) 

 Parameters:

`{cmd}` (string) Command to start the LSP server.

`{cmd_args}` (table) List of additional string arguments to pass to `{cmd}`.

`{dispatchers}` (table|nil) Dispatchers for LSP message types. Valid dispatcher names are:

`"notification"` 

`"server_request"` 

`"on_error"` 

`"on_exit"` 

`{extra_spawn_params}` (table|nil) Additional context for the LSP server process. May contain:

`{cwd}` (string) Working directory for the LSP server process

`{env}` (table) Additional environment variables for LSP server process

 Return:

 (table|nil) Client RPC object, with these methods:

`is_closing()` returns a boolean indicating if the RPC is closing.

`terminate()` terminates the RPC client.

## Lua module: vim.lsp.protocol [lsp-protocol](#lsp-protocol)

`vim.lsp.protocol.make_client_capabilities()`make\_client\_capabilities() Gets a new ClientCapabilities object describing the LSP client capabilities.

 Return:

 lsp.ClientCapabilities

Methods `vim.lsp.protocol.Methods` LSP method names.

`vim.lsp.protocol.resolve_capabilities()`resolve\_capabilities(`{server_capabilities}`) Creates a normalized object describing LSP server capabilities.

 Parameters:

`{server_capabilities}` (table) Table of capabilities supported by the server

 Return:

 (table|nil) Normalized table of capabilities



# links
[Read on Omnivore](https://omnivore.app/me/lsp-neovim-docs-18ba76fb745)
[Read Original](https://neovim.io/doc/user/lsp.html)

<iframe src="https://neovim.io/doc/user/lsp.html"  width="800" height="500"></iframe>