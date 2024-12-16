---
tags:
  - todo
State: work in progress
Difficulty: 2
Category: vim
Sub Category: windows
Start date: 2023-09-16
End date: 
Creation date: 2023-09-04 20:06
Resources: []
Changes: []
Git commit: ""
Version: .nan
sticker: vault//Bins/icons/candy-icons/apps/scalable/thedarkmod.svg
---
## **feature specification** 

### *what is the purpose of the feature?*
to have easy navagtion between the vim windows tabs and split windows and make

### *what is the scope of the feature?*
- opening windows 
- closing windows 
- splitting windows 
- tab switching
- tab bar
### *what are the design considerations for the feature?*

there might be many other features that will want to split or add new windows so it should be easy to do it.
there are many types of windows all of them should look good in the tab bar and be easy to switch around.

### *Product acceptance criteria:*
every thing within the scope of the feature feel natural and easy to use and look nice.
it is easy to expend the feature and modify how things work and everything is clean and documented 

### *User stories:*
in the tab view there should be all the open windows with there name and if there is more then one file with the same name then the last path until the path is not the same.

there should be a short cut to rotate around the windows by order and by last use and pressing on a tab should lead to that window as well.

there should be a way to easy split a window and cycle all the views as well.

there should be a way to close a tab with all the windows related to it.

## **current state** 
there is a tab bar that show a bad format of the open windows 

there is a short cut for opening windows but it is not that good


## **sub tasks**
 - [x] write the feature specs down ✅ 2023-09-16
 - [x] explain the current state ✅ 2023-09-16
 - [ ] make the tab bar look good ⏳ 2023-09-17 
 - [ ] easy window open and close ⏳ 2023-09-17 
 - [ ] easy splitting ⏳ 2023-09-17 
 - [ ] easy navigation ⏳ 2023-09-17 


## **feature design**
*the design purpose and final result of the feature design, should include as many diagrams as it can*

### **design process**


### **Preliminary Research**
#### *background on the feature?*
first I want to understand the windows and tabs api in vim.
we can look at the usage of tabby.nvim it give a lot of ways to control the tab views 
also we can get a list of all the tabs using tabs and there are more commands on that concept.

we can find a lot of examples of using tabby here: [nanozuki/tabby.nvim Show And Tell · Discussions · GitHub](https://github.com/nanozuki/tabby.nvim/discussions/categories/show-and-tell)

it seems that I can solve the tab bar with a custom preset of tabby and get a really good res or use barbar and get an easy win but not much in the way of customizability


##### *available solutions?*
- barbar.nvim
  this is a plugin for a good tab bar
- vim-tabbar
  less good barbar
- tabby has a lot of features but require a lot of config, a mid ground between full customization and no plugin at all 

##### *existing implementations?*
there are examples for tabby and a barbar setup example there code also show how they work.

#### *where can the feature go?*
it seems like it makes sense to use a plugin here so it can just be a part of the plugin module all the shortcuts and settings can go there.

#### *my ten minute of breaking my head against the web but now on paper*
let's try to set up tabby from one of the templates that will be a good and quick start.
there is some bug when I open up vim and it dosn't look quite like I want it to but it dose work
the bug:
![[Pasted image 20230916194003.png]]

the tabbar:
![[Pasted image 20230916194036.png]]

let's take a bit more to see how it works and maybe fix the bug for a proper POC
the fix was easy I just needed to fix the include path for the config file.

I can't get some of the templates to work but there is a lot of potentially there.
this seem like a good direction to build upon

#### *list of assumptions and hypothesis*
*this is very important section, here I should write what I assume I know in and need and what I think I know and need.*
I hypothesis tabby work well and give my all of what I need from a tab bar.
I assume I can do pretty much what ever I want with the tab bar with the right config.
I assume can solve the tab navigation using tabby shortcuts.

#### *what I still don't know. aka "unknown unknowns"*
is there any problems with tabby?
how do I preset things like file tree for all tabs.


### **final design**

#### *using tabby*
I think tabby is the better option due to much better customizability.
let's try to understand how to get everything I need using tabby how should it look

maybe I don't need tabs at all?
maybe I  can scrap this feature in ט of a really strong [[file navigation]] feature then I won't need tabs.


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

