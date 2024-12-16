---
id: d0c6755a-3aca-4d91-80d9-5c2109a2e0c9
title: "Darakah/obsidian-comments-plugin: Simple plugin to add inline comment tooltips as well as a side panel which lists the comments on the current active leaf."
tags:
  - text_editors
  - obsidian
  - tools_to_use
date: 2023-10-25 01:11:26
words_count: 559
state: INBOX
---

# Darakah/obsidian-comments-plugin: Simple plugin to add inline comment tooltips as well as a side panel which lists the comments on the current active leaf. by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Simple plugin to add inline comment tooltips as well as a side panel which lists the comments on the current active leaf. - Darakah/obsidian-comments-plugin: Simple plugin to add inline comment too...


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## [Obsidian Comments Plugin](#obsidian-comments-plugin)

[![GitHub release)](https://proxy-prod.omnivore-image-cache.app/0x0,ssxZxwu9MfLGDac_Lz7MgYmfSMMZhXH6HTaZsI3dAwIY/https://camo.githubusercontent.com/f91efce0e60f92bafd56cf0226453e8d1e7e73de4f2b7b4656abb486fc0e30b3/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f762f72656c656173652f446172616b61682f6f6273696469616e2d636f6d6d656e74732d706c7567696e)](https://camo.githubusercontent.com/f91efce0e60f92bafd56cf0226453e8d1e7e73de4f2b7b4656abb486fc0e30b3/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f762f72656c656173652f446172616b61682f6f6273696469616e2d636f6d6d656e74732d706c7567696e) [![GitHub all releases](https://proxy-prod.omnivore-image-cache.app/0x0,sOhC2KoIrD-sIWy0Sg7usJCDkY2bp8XN3qrzuEieonIs/https://camo.githubusercontent.com/1cc20ad37f3a83348309955003edf3f46129af267e8fdc29dc09a2788cd97103/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f646f776e6c6f6164732f446172616b61682f6f6273696469616e2d636f6d6d656e74732d706c7567696e2f746f74616c)](https://camo.githubusercontent.com/1cc20ad37f3a83348309955003edf3f46129af267e8fdc29dc09a2788cd97103/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f646f776e6c6f6164732f446172616b61682f6f6273696469616e2d636f6d6d656e74732d706c7567696e2f746f74616c)

**_Brief Description:_** PDF comments for obsidian notes

**_Detailed Description:_**

1. Command that adds a comment syntax for the selected text (in edit mode)
2. Selected text will be highlighted with a certain text color & background color in preview mode
3. Clicking the highlighted text in preview mode will reveal a pop-up containing the comment related to it
4. A side panel that lists all comments for the current active note

## [Usage](#usage)

### [Insert a comment:](#insert-a-comment)

---

1. Select the text that you want to add a comment to
2. cmd/ctrl + p -> 'add comment' command -> enter
3. the selected text will be replaced with the following:`<label class="ob-comment" title="..." style="..."> SELECTED TEXT <input type="checkbox"> <span> COMMENT </span></label>`
* binding the add comment to a hotkey (settings -> hotkeys) can make its usage faster e.g. cmd/ctrl + C

### [Example](#example)

---

[![example](https://proxy-prod.omnivore-image-cache.app/0x0,sT7evxqwdrI2rvy_XYFOAgF4F-hrnFvPZJsYfVF4vNsg/https://raw.githubusercontent.com/Darakah/obsidian-comments-plugin/main/images/example_2.png)](https://raw.githubusercontent.com/Darakah/obsidian-comments-plugin/main/images/example%5F2.png)

**\----> Old View but still valid annotations:**

[![example](https://proxy-prod.omnivore-image-cache.app/0x0,s1pKie_gWHmeNKFQ4t4CngAlMhG3nOKon07lINSe8Fdk/https://raw.githubusercontent.com/Darakah/obsidian-comments-plugin/main/images/example_1.png)](https://raw.githubusercontent.com/Darakah/obsidian-comments-plugin/main/images/example%5F1.png)

### [Comment Properties](#comment-properties)

---

1. Title (optional): Text to be shown in the side panel above the comment. If a title is not specified a default place holder will be used as the title. Possible use cases:
* to specify the line of text where this comment appears (if you have editor mode line number active) which can be useful in very large notes as currently side panel links don't cause the page to jump to it ;(
* Q/A -> the question can be the title and clicking it in the sidebar will reveal the highlighted text (can be used to review key ideas of the note just from the side pannel)
* Note to remember the reason for the comment
1. Style (optional): as shown by the example above, as it is simple html syntax style can be defined as one desires. keep in mind there are !!! **2 STYLES** !!! the one placed inside `<label class="ob-comment" style="...">` will specify style for the highlighted text while `<input type="checkbox"> <span style="">` will specify the style for the comment pop-up (this style is used the same for the side pannel.
2. COMMENT section: as the comment is identified using `<input type="checkbox"> <span>` to identify the content, the actual COMMENT can include more divs / spans / HTML elements to further custimise it and it will be rendered properly in-line and in the side-panel.

### [Comment Ribbon & Comment Panel:](#comment-ribbon--comment-panel)

---

#### [Comment Ribbon](#comment-ribbon)

A ribbon is added by default, when clicked it will open the side panel comment list. The ribbon can be hidden through the plugin settings tab (NEED TO UNLOAD / RELOAD THE PLUGIN AFTER THIS OPTION IS MODIFED FOR THE CHANGE TO TAKE PLACE!!!)

#### [Comment Panel](#comment-panel)

Can be opened in 2 ways:

* Clicking the comment ribbon
* Using a command `comment panel`

### [Default background color & Text color](#default-background-color--text-color)

---

As all in-line highlights / pop-ups are done using css, it can all be customized as one wishes by modifying the `style.css` in the `obsidian-comments-plugin` folder. to modify the default background color / text color for highlighted text:

```css
.ob-comment {
  color: #8f0303;
  background-color: #CCA300;
}

```

to modify the default background color / text color for comment bubble:

```css
.ob-comment span {
  background-color: #FFDE5C;
  color: #b30202;
}

```

to modify the highlight color when it is hovered over:

```css
.ob-comment:hover {
  background-color: #FFDE5C;
}

```

### [Settings:](#settings)

---

[![settings](https://proxy-prod.omnivore-image-cache.app/0x0,sq4oyAS50uFlBuwybnNVIOmR1OKTXyNUg8V_TbM_dVAQ/https://raw.githubusercontent.com/Darakah/obsidian-comments-plugin/main/settings.png)](https://raw.githubusercontent.com/Darakah/obsidian-comments-plugin/main/settings.png)

## [Release Notes:](#release-notes)

### [v0.2.0](#v020)

* Sticky bookmark-like display of comment pop-ups

## [To-Do:](#to-do)

* Sticky better display of comment pop-ups
* Find a way to make links work from sidepanel to jump to section of origin

## [Support](#support)

[![Github Sponsorship](https://proxy-prod.omnivore-image-cache.app/0x0,sCOlqjqCojaia0CD20AmDV7KEV8kJ3nNJzCZVjjLrmgo/https://raw.githubusercontent.com/Darakah/Darakah/e0fe245eaef23cb4a5f19fe9a09a9df0c0cdc8e1/icons/github_sponsor_btn.svg)](https://github.com/sponsors/Darakah) [![BuyMeACoffee](https://proxy-prod.omnivore-image-cache.app/100x0,srPU00gEqRI70FDCUBh7FqMOSnPpQytFzWz-FbuSphFQ/https://camo.githubusercontent.com/28aae05a0fba45679e8e27d90609601e249b64a5fe30dfef05495de4f4e318d4/68747470733a2f2f63646e2e6275796d6561636f666665652e636f6d2f627574746f6e732f76322f64656661756c742d79656c6c6f772e706e67)](https://www.buymeacoffee.com/darakah)

## [Credits:](#credits)

Thanks to the obsidian discord community that helped me put this together, especially the developers that put up with my questions.



# links
[Read on Omnivore](https://omnivore.app/me/darakah-obsidian-comments-plugin-simple-plugin-to-add-inline-com-18b63be20ae)
[Read Original](https://github.com/Darakah/obsidian-comments-plugin)

<iframe src="https://github.com/Darakah/obsidian-comments-plugin"  width="800" height="500"></iframe>
