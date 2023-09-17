---
tags:
  - todo
State: work in progress
Difficulty: 8
Category: nvim
Sub Category: language intelligence tools
Start date: 2023-09-07
End date: ""
Creation date: 2023-09-04 20:06
Resources: []
Changes: []
Git commit: ""
Version: .nan
sticker: vault//Bins/icons/candy-icons/apps/scalable/thedarkmod.svg
---
## **feature specification** 
The **Language Server Protocol** (**LSP**) is an open protocol for use between editors and servers that provide *language intelligence tools* programming language-specific features like :
- **code completion**
- **Syntax highlighting**
- **marking of warnings and errors**
- **refactoring routines**
### *what is the purpose of the feature?*
the goal is to allow easy integration of other tools that give language-specific features as mention above.
also it should be easy to add both new tools and new languages support.
a change to one language should not affect other languages but it should be possible to change both the default behavior,
and change something across all the languages

### *what is the scope of the feature?*
for now the scope is to both create a framework for adding new lsp servers and adding the following servers:
- c/cpp(cland/clang-format?)
- lua
- js/ts
- py
- shell
- html/css
- glsl
- asm
- md
- make
- cmake
- documentation(docxgen/lualint/pep)
### *what are the design considerations for the feature?*
it should be easy to add or change things in it.
it should be highly user customized.
it should only load what it needs and only when it needs it.
it should be possible to change everything around it without changing any thing but it's interface.

### *Product acceptance criteria:*
all the servers work well and all the 4 features are possible to set up.
multiply servers can work together in a open project and it is not to have on the system and if something shouldn't be used it isn't loaded


------------------------------------------------

### *User stories:*
##### *adding new server:*				
should be as easy as creating a new lua file with the server name that return all the info about the server.

##### *using the server for other things:*
should just work for each supported file type it should auto use the right server and use the vim lsp api.

##### *viewing info regarding any settings or state of lsp:*
should be in telescope ui and as informative as possible 


## **current state** 
using lsp zero give basic support for some of the server without any option the easily edit them. 
apart from that it is not that simple to integrate anything with it and it is not that clear how to add servers that are not supported 
the code is also messy and not documented that well.

## **sub tasks**
 - [x] write the feature specs down ✅ 2023-09-07
 - [x] explain the current state ✅ 2023-09-07
 - [ ] chose the right plugins to use for lsp support and understand the available options.  
 - [ ] build a the lsp framework design around the chosen plugins.
 - [ ] add support for all the wanted servers.
 - [ ] document and clean the code
 - [ ] lay planes for things that might be usfly in the futre and things that might need to change or that I need to keep track of 
 - [ ] reflect


## **feature design**
*the design process and final result of the feature design, should include as many diagrams as it can*

### **Preliminary Research**
#### *background on the feature?*
in nvim lsp is supported using it's built [Lsp client](https://neovim.io/doc/user/lsp.html)
the LSP clients facilitates features like go-to-definition, find-references, hover, completion, rename, format, refactor, etc., using semantic whole-project analysis
you can add support for new servers directly with the lsp client, the doc says how to do it.
but there are multitude of existing plugins that already support many server.
but they might not be as easy to add support for server they don't support and they are limited and harder to change
there are also many plugins built above the lsp config that enhance the ui if vim and add more functionality or better quality of life.
they are also worth consideration in the design even if some of them are not in the scope of this feature and can be features of there own or part of other features.
##### *available solutions?*
##### *existing implementations?*

#### *where can the feature go?*

#### *my ten minute of breaking my head against the web but now on paper*

#### *list of assumptions and hypothesis*
*this is very important section, here I should write what I assume I know in and need and what I think I know and need.*
#### *what I still don't know. aka "unknown unknowns"*


### **design process**


### **final design**



## **feature implementation**
*the implementation details of the feature should include as descriptive of explanation as possible and include screen shots and links as needed *


### *implementation process*


### *final implementation*


## **testing**
*the tests the feature passed and didn't pass*

## **future**
*notes for future self, possible changes that can or should be made, tool used, struggle points and every thing that might be relevant in order to maintain the feature*
### *tools used*


### *struggle points*


### *possible additions or changes that might need to be made*



## **reflection**
*what did I do well? what could have been better? interesting things I have learned?*


## **resources used**
*a list of all the resources I used and why I used them, this note should not contain any research or info that is not related to the new feature thous should be extracted to wiki note*

