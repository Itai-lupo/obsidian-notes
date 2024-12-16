---
id: f249a4ca-02b6-49bb-9866-c5cc3390e6fc
title: Automating Your Obsidian Workspace | ThoughtAsylum
author: Stephen Millard
tags:
  - text_editors
  - obsidian
date: 2023-11-16 05:19:09
date_published: 2021-09-12 02:00:00
words_count: 4601
state: INBOX
---

# Automating Your Obsidian Workspace | ThoughtAsylum by Stephen Millard
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Obsidian is a popular tool for managing notes in Markdown format. It is cross-platform, uses files direct from a file system location, and has some rather useful features, including a range of plugins created by the developers and the wider community. In this post I am going to walk you through how I have used some of the community plugins to give me better control over a feature known as workspaces.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## Contents

* [Obsidian Workspaces](#obsidian-workspaces)
* [Enabling Workspaces in Obsidian](#enabling-workspaces-in-obsidian)
* [The Dynamic Workspace Limitation](#the-dynamic-workspace-limitation)
* [Building the Automation](#building-the-automation)  
   * [Step 1 - Install Additional Plugins](#step-1---install-additional-plugins)  
   * [Step 2 - Compose a URL to Load a Workspace](#step-2---compose-a-url-to-load-a-workspace)  
   * [Step 3 - Build a Script](#step-3---build-a-script)  
   * [Step 4 - Create a Macro to Call the Script](#step-4---create-a-macro-to-call-the-script)  
   * [Step 5 - Create a Quick Addition](#step-5---create-a-quick-addition)  
   * [Step 6 - Test](#step-6---test)
* [Enhancing the Automation](#enhancing-the-automation)  
   * [Step 7 - Add it to the Root of the Command Palette](#step-7---add-it-to-the-root-of-the-command-palette)  
   * [Step 8 - Assign a Keyboard Shortcut](#step-8---assign-a-keyboard-shortcut)  
   * [Step 9 - Enhance the Macro](#step-9---enhance-the-macro)  
   * [Step 10 - External Trigger](#step-10---external-trigger)
* [Conclusion](#conclusion)

[Obsidian](https://obsidian.md/) is a popular tool for managing notes in Markdown format. It is cross-platform, uses files direct from a file system location, and has some rather useful features, including a range of plugins created by the developers and the wider community. In this post I am going to walk you through how I have used some of the community plugins to give me better control over a feature known as workspaces.

## Obsidian Workspaces

In case you are unfamiliar with Obsidian and its workspace features, I am going to start with a little background.

Obsidian allows you to open and interact (create, read, update, delete, and search) with sets of notes in [Markdown format](https://daringfireball.net/projects/markdown/). These sets are based on a folder structure, which can be whatever suits you, but each root of such a set is the root of what in Obsidian terms is known as a _vault_.

The Obsidian app itself applies a flexible pane model to its user interface. Each pane is almost like a window in its own right. You cannot drag it around anywhere within the main Obsidian app window like you could with the old Microsoft Windows multiple document interface (MDI), but you can split and align different panes to be different sizes and have varying content.

![](https://proxy-prod.omnivore-image-cache.app/0x0,s0_ANH6rIzH9q3eiO6yGKrhurcJLkwVbDqCPxBg8fQE8/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-mdi.png)

The layout can be as simple or as complex as you like. Here I have the Obsidian help vault open, and I have numerous panes open and options enabled.

![](https://proxy-prod.omnivore-image-cache.app/0x0,s2jrm7s7AgyxjuOcoViAU4gpeTLpV-EMn8qXNG_NFVwo/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-example-layout.png)

Each Obsidian vault also stores Obsidian settings alongside the notes. This allows Obsidian to offer different functions, behave, and display differently based on the settings you have for a particular vault. For example, you may have a plugin that you use to support Internet research that are relevant to vaults you maintain on cooking, IT, and movies. But maybe there is a third plugin for allowing you to execute scripts that is only ever going to be of use when you are using your IT vault. Maybe you also want to have a different colour scheme applied to the app to help you quickly identify which vault you are looking at from just a glance to the screen?

As well as styling and extra functionality, Obsidian also has a concept known as _Workspaces_. This is also a plugin for the app, but one that was developed by the Obsidian developers. It allows you to save particular layouts for a vault, so you can switch between them. Specifically it stores the state of the pane layout (including which pane has focus), the sidebar states and the file open states. For example, you might have a particular arrangement of panes that you like to use for taking notes during a meeting, a different one for writing and researching your latest project, and another for reviewing your study materials? You would set these up as workspaces and then switch between them as required.

## Enabling Workspaces in Obsidian

As noted above, workspaces are an additional set of functionality delivered by a plugin. To enable workspaces for a vault:

1. Open Obsidian’s settings (the _Open Settings_ command in the [command palette](https://help.obsidian.md/Plugins/Command+palette)).
2. Select _Core plugins_ from the list of available options in the navigation list.
3. Scroll down or use the search option to find the _Workspaces_ plugin.
4. Select the Workspaces plugin to toggle it and enable the plugin.

Once you have a particular layout that you like, you can call the _Save a workspace_ command from the command palette, provide a name and save the details. To load the workspace in, you call the _Load a workspace_ command from the command palette and then select the workspace to load.

> **Naming Tip**  
> If you prefix your workspaces with a unique identifier, it makes it very quick to search/filter your list of workspaces when loading them. I tend to use single-digit numbers as a prefix to make workspaces quicker to access.

> **Load List Tip**  
> Using the same numeric basis, I tend to set the keyboard shortcut to load the list of workflows to be CTRL + 0 (Windows) or CMD + 0 (Apple OSes). This makes it easy to remember and access, and the selection of the workspace follows on logically.

## The Dynamic Workspace Limitation

As previously noted, workspaces store a set of layout information that includes file open states. This means that the workspace cannot be set to do things like dynamically load a daily note for the current day, or set any subsequent configuration that isn’t stored as part of the workspace’s data set.

I tend to keep my pane layouts empty of specific files so I can quickly build up what I need for a particular task as my working needs can vary quite a bit. But in particular the desire to load my daily note into my two-pane layout with the notes on the left and the preview on the right is something I have a more than daily need for.

> **Side Note:**  
> I tend to have both the editable note and the preview up as I often need to copy out of notes in a rich text format, view rendered diagrams (from Mermaid code), images, etc. When I only need to edit, I tend to use the [Maximise Active Pane Plugin](https://github.com/deathau/maximise-active-pane-obsidian) to focus on a pane rather than having a workspace for it. This approach gives me even more flexibility than a specific workspace would.

While there are limitations, a bit of automation know-how and a few additional community plugins, and even a dynamically populated workspace is not beyond reach.

## Building the Automation

Before starting to build the plugin, make sure you have your workspace to be automated all set up. For my use case, my workspace is called `1-Main` and I will be referencing that as I build my automation. The workspace looks like this.

![](https://proxy-prod.omnivore-image-cache.app/0x0,s_TwBbdpw4MSvPnHP0GbTi3HhqMcr3iMUCm-3fx6Rokw/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-1-main.png)

### Step 1 - Install Additional Plugins

To build the automation for a dynamic workspace, we start by installing two community plugins.

* [Advanced Obsidian URI](https://github.com/Vinzent03/obsidian-advanced-uri).
* [QuickAdd](https://github.com/chhoumann/quickadd).

To install these community plugins you can follow these steps.

1. Open Obsidian’s settings (the _Open Settings_ command in the command palette.
2. Select _Community plugins_ from the list of available options in the navigation list.
3. Select _Browse_.
4. Enter the name of the plugin in the search field.
5. Select the plugin in the list.
6. Select the button to _Install_ the plugin.
7. Select the button to _Enable_ the plugin.

### Step 2 - Compose a URL to Load a Workspace

I provided some tips above to make it easier to load workspaces by name as Obsidian does not currently enable you to add keyboard shortcuts to specific workspaces. This seems to be the only way to access and load a workspace natively; well via a core plugin. However, the Advanced Obsidian URI plugin provides another way for us to load a workspace.

A URI or Uniform Resource Identifier is an identifier for accessing a resource. A URL is a Uniform Resource Locator, and is probably what most people are familiar with. These are a subset of URI, but for all intents, we are going to be generating something that looks and works like a special URL for interacting with Obsidian and that allows us to request that Obsidian loads a workspace for us.

The [Navigation](https://github.com/Vinzent03/obsidian-advanced-uri#navigation) options for the Advanced Obsidian URI plugin allow us to specify a workspace by name to be opened by using the `workspace` parameter.

The schema is of the form `obsidian://advanced-uri?vault=<your-vault>&<parameter>=<value>&<parameter2>=<value2>`, so we can build our URI like follows for the `1-Main` workspace.

```dts
obsidian://advanced-uri?vault=<your-vault>&workspace=1-Main

```

Because my example workspace name has no spaces or other non-URI friendly characters, I did not need to [URL encode](https://en.wikipedia.org/wiki/Percent-encoding) it, but if you do find you have spaces or other unusual characters, just use [an online encoder](https://www.urlencoder.org/) to generate the parameter value.

You may have noticed that we haven’t specified the `vault`. `vault` is actually an optional parameter in that if you exclude it, it will work on the current Obsidian vault, but to remove ambiguity, we should specify that too. For this post I am using my demonstration vault “_obsidian\_demo_”. The URI therefore becomes this.

```dts
obsidian://advanced-uri?vault=obsidian_demo&workspace=1-Main

```

If I put this URI into the Safari (web browser app) address bar on my Mac, I get a security prompt, but after selecting to allow, this triggers Obsidian to open my demo vault (or switch to it if already open), and load my workspace.

![](https://proxy-prod.omnivore-image-cache.app/0x0,sG-r971sSWrqNEzbfn5DdNaiBJjun9PEm40xyZmxh2B8/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-safari.png)

### Step 3 - Build a Script

The next step in the process is to build a little wrapper to do the same job as our web browser, but to do it in a way that is automatable from within Obsidian. This wrapper for our URI is going to be in the form of a very short script.

Assuming you have not created any scripts before for use in Obsidian, the first thing we want to do is put the script file somewhere that Obsidian can find it. In other words somewhere inside the vault.

The script file is going to be a JavaScript script file and will have a `.js` file extension. Obsidian’s navigation only deals with Markdown files, so wherever we put this script file, it is not going to show up in Obsidian. While we could just dump it in the root of the vault, my preference is to place them in a specific folder. To that end I created a “`Scripts`” folder in my vault.

Do note that if you create a hidden folder (e.g. `.scripts` on a Mac), then the script files in that folder get hidden from the plugin that we are going to call the script from.

Once you have decided where you want to place your script, you can go ahead and create the file in that location within your favourite text editor. I named my script file `workspace-load-1-main.js`.

The content of the file is as shown below. Note the URI for opening the workspace. You should obviously change this to match your own URI.

```dart
module.exports = async () =>
{
	window.open("obsidian://advanced-uri?vault=obsidian_demo&workspace=1-Main");
}

```

> **Note**For command line fluent people, you don’t need to set the executable bit on the file as Obsidian will read and evaluate the content. It is not run standalone.

You do not need to understand the detail of what this script does other than to know when it is run, Obsidian will make a request to open the URI, which will then itself trigger a request to Obsidian, to request that the _Advanced Obsidian URI_ plugin trigger the load of the specified workspace.

So our call chain now looks like this:

![{Some Trigger in Obsidian} > Call Script > Open URI > Load Workspace](https://proxy-prod.omnivore-image-cache.app/0x0,saJ-JsDorMoplm9VKAg1VZQdzLzp-E1RTnLO6M3tgcII/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-chain-1.png "{Some Trigger in Obsidian} > Call Script > Open URI > Load Workspace")

### Step 4 - Create a Macro to Call the Script

This is where I feel things become a little less intuitive as we dip into using the _QuickAdd_ plugin. The primary purpose of this plugin is to allow you to quickly capture information and put it into notes. However, it also allows us to carry out a little bit of automation, such as calling our script via a macro.

Firstly, navigate to the _QuickAdd_ configuration page.

1. Open Obsidian’s settings (the _Open Settings_ command in the command palette.
2. Select _QuickAdd_ from the list of available plugin options in the navigation list.

Unless you have used _QuickAdd_ before, you should be presented with a rather barren looking window like this.

![](https://proxy-prod.omnivore-image-cache.app/0x0,sUiQS6XZi5oZOi0y4O4XZc5ZrAMUe_VKFIjXvfVsp4P8/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-quickadd-empty.png)

The next step is to create a new, empty macro which we can then configure.

1. Select the button to _Manage Macros_.
2. Enter a name for your macro in the _Macro Name_ field.  
   * I am going to call mine “Daily Set Up”, because as well as calling a script, I am going to enhance it further a little later on.
3. Select _Add Macro_.

![](https://proxy-prod.omnivore-image-cache.app/0x0,sGh96b_0FkuKh5wWc0zgRQmCIVhc1s2nb4GCR1wRm_qM/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-empty-macro.png)

Next we populate our empty macro with instructions to run our script.

1. Select the _Configure_ button to open the macro configuration window.
2. Select the script (for me `workspace-load-1-main.js`) in the _User script_ field.
3. Select the _Add_ button.

![](https://proxy-prod.omnivore-image-cache.app/0x0,skAfUytBcdfG6n3ygu9dNOX9NQ01MNcdepHoy4DTKZAo/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-script-select.png)

The result should look something like this. A macro with a single action that is to run a script.

![](https://proxy-prod.omnivore-image-cache.app/0x0,s8qVymB1YHN3ZCZ3VF8988dhZd0pu9sEPjoSlFyvUHag/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-simple-macro.png)

With that configured, press `ESC` twice to return to the main _QuickAdd_ settings window. There is more work to be done.

### Step 5 - Create a Quick Addition

We now have a macro we can run, but there is an additional piece of configuration that we need to carry out in the _QuickAdd_ plugin to allow us to run the macro. This is why I feel that _QuickAdd_ is a little unintuitive in that a macro isn’t something we can use, but rather something we can call, and as yet _QuickAdd_ does not really provide much in the way of reuse around this, so my assumption is that either there is something on the roadmap that will require this disconnect, or I am just overlooking a more obvious reason.

Creating the quick addition is easy to do.

1. In _Name_ enter the name of your macro (for me “Daily Set Up”).  
   * Using the name of your macro makes it easy to know which macro it is running.
2. Select `Macro` from the drop-down list next to the name.
3. Select the _Add Choice_ button.

![](https://proxy-prod.omnivore-image-cache.app/0x0,s5eMCNcjqzj2YJ8s_ZU1_H_Z65ERySnqtJN_TocnJT6Q/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-daily-set-up-initial.png)

We now need to connect the macro to the quick addition.

1. To the right of the new quick addition are a set of icons. Select the cog to open the configuration window for the quick addition.
2. In the drop down list select the name of the macro you created.  
   * If you only have one _QuickAdd_ macro, it will be selected by default.
3. Press `ESC`.

![](https://proxy-prod.omnivore-image-cache.app/0x0,sdvDKn8YFPAQtVuRktgUD9lZ_rB-zr0IB2kD7oLuIXxg/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-daily-set-up-macro-selection.png)

### Step 6 - Test

The final step in the basic set up is to test that this works.

From the main Obsidian user interface, bring up the command palette and search for the _Quick Add: Run QuickAdd_ option and select it. This will then display your _QuickAdd_ options.

At this point you should see your quick addition listed (e.g. “Daily Set Up”). Selecting this will run the full automation, opening your workspace.

## Enhancing the Automation

The chaining to trigger the workspace now looks like this.

![](https://proxy-prod.omnivore-image-cache.app/0x0,s8j31zvwP9gO8aC-BHSBhwJgyybytVPXr1NloipNAi4E/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-chain-2.jpg)

Now it may seem that all we have done is build something convoluted that in the same number of key presses does what the load workspace option we started with does. And you would be absolutely correct. It is seemingly like we have reinvented an over-engineered wheel. But you know what? We can use this new wheel to go faster and farther than the previous version. We just need to put in a little bit more work.

![](https://proxy-prod.omnivore-image-cache.app/0x0,s1TzurwA-1LWza4IkvJK_0juSD8EqK1a20SESbt-UwcY/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-wheel.jpg)

### Step 7 - Add it to the Root of the Command Palette

The first thing we will do is to enable the quick addition entry to appear in the command palette when we search. This eliminates needing to go into the _Quick Add: Run QuickAdd_ option first.

This is quite straight forward to do.

1. Open Obsidian’s settings (the _Open Settings_ command in the command palette.
2. Select _QuickAdd_ from the list of available plugin options in the navigation list.
3. Select the lightning bolt icon to enable for the command palette.  
   * The icon will change colour when enabled.

![](https://proxy-prod.omnivore-image-cache.app/0x0,sAFhQgPImMPw1ugpTcmMmysDvgYFDPt56j3hSKs-omYk/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-enable-in-command-palette.png)

Now when searching in the command palette, we can see the _QuickAdd_ entry has been surfaced.

![](https://proxy-prod.omnivore-image-cache.app/0x0,sYBgH5jop3lFpZkXe1W_LiNYxlrr7YRGxWb2sf9uFqIo/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-quick-addition-in-palette.png)

When the entry is selected it will run the quick addition.

### Step 8 - Assign a Keyboard Shortcut

Making it a command palette entry is really just a stepping stone to get us to a point where we can assign a keyboard shortcut. Obsidian allows any entry in the command palette to be assigned a keyboard shortcut.

Here’s how you do it.

1. Open Obsidian’s settings (the _Open Settings_ command in the command palette.
2. Select _Hotkeys_ from the list of available options in the navigation list.
3. Use the filter field to search for the command palette entry you want to update.
4. To the right of the entry is an icon of a key with an asterisk on it. Select that icon.
5. Press the keyboard shortcut you want to use to trigger the command palette entry.

I opted to set my “Daily Set Up” entry to be triggered by `CTRL + CMD + 1` on my Mac.

![](https://proxy-prod.omnivore-image-cache.app/0x0,s7-G65sA5u1EfJvNJdRRMyjrp1IVWv6uX3eV-GHw2dz4/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-keyboard-shortcut.png)

### Step 9 - Enhance the Macro

Now we have a pretty fast way of triggering everything, which is a step above the standard approach, but now we need to add in the dynamic element.

For my `1-Main` workspace, for this set up, I want to display the daily note for the current date (creating it if necessary), in both panes. In the left pane I want to have it in edit mode, and in the right frame in preview mode, with the two panes linked.

Now, at this point, I will let you in on a secret. My workspace is already configured to have the two panes linked, and open with two empty (“No file is open”) panes. How do you do that? Well there are two ways I know of. One is to modify the underlying JSON for workspaces, but the other is probably a little quicker in most cases and can be achieved in the user interface. It is not essential to what follows as we could automate it another way (which I am positive you will figure out as we go through), but I think this approach is quite efficient and it may be of use to some of you.

> Once you have your layout for your workspace, if you want to have a pane that is empty rather than having a file in it, all you need do is to open a new file in the pane and then delete the new file. The pane will then show the “No file is open” information. Note that there is no command in the command palette to close a file, so this is the only way I have found to date of getting the pane to do this.
> 
> If you have two panes that you want to link (an option available on the _More Options_ menu for a pane - the three vertical dots in the top right corner of the pane), but also show initially as empty, you simply need to link the two panes together before you delete the file. The link will remain in place. Unfortunately, the state is not maintained. It is not a workspace thing, but rather a broader Obsidian thing.
> 
> If I set one pane to be the preview of another, then switch to a new file, delete the file, and switch back to the previous file, both panes will now be in edit mode rather than one in edit and one in preview.

As you may have guessed from the title of this section, we are going to give the _QuickAdd_ macro some additional instructions to finish setting up our workspace in a more dynamic way. Previously we used a user script to trigger the URL, but we actually have seven options available.

1. **Capture** \- Get some user content.
2. **Template** \- Build some content automatically.
3. **Wait** \- Do nothing for a period of time.
4. **Obsidian Command** \- Call a command palette entry.
5. **Editor Command** \- Run one of a small selection of editor commands.  
   * Copy.  
   * Cut.  
   * Paste.  
   * Select Active Line.  
   * Select Link on Active Line.
6. **User Scripts** \- Run a script.
7. **Choices** \- Offer the user a choice of quick addition to run.

Opening a daily note (including its creation if necessary) is available from the command palette. The same is true of toggling between edit and preview mode. There are also pane navigation options in the command palette allowing you to shift the focus up, down, left and right between panes. With these commands we can build up a macro that after loading the workspace loads the daily note (it loads in both panes as we have that as part of the workspace set up), shifts focus to the pane we want to use for previewing, toggles from edit to preview mode, then shifts the focus back to the other pane for editing.

One thing to note at this point is that computers can be too fast at times. Things can occur in parallel and things can then occur out of order. An issue often referred to as a race condition. To help with that we can add delays in to say wait for this long, this long being an estimate of the maximum time it will take the previous step to complete, before moving on to the next step. Therefore you will see lots of wait entries in my final macro. The values are ones that work reliably for my computer, but because there is a dependency on your available resources, you should tailor these to work for your set up. You may be able to reduce the wait times if you have a faster computer. If you have the same computer, but with more utilised resources, you may find you have to increase the wait times a little. The wait times are in milliseconds, so overall the wait time will probably be under 2 seconds which for most people should not be too onerous.

> **Modifying Wait Times**I didn’t think it was obvious, so in case that applies to you too, to change the duration of a wait period, click on the number after the “Wait for” entry and over type it with the length of delay that you want.

Here is what my macro looks like with these extra steps added in.

![](https://proxy-prod.omnivore-image-cache.app/0x0,sp60mErvyP5w1oUh1nBPqZDJ6iFb4t8WuqF4nVgyyBKg/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-full-macro.png)

### Step 10 - External Trigger

With the keyboard shortcut, you can trigger the whole process quickly from within Obsidian. But I am guessing the keen automators among you might be wondering if it is possible to trigger this from outside Obsidian. Could you for example include this on a start of the day schedule, or an Elgato Stream Deck/Better Touch Tool drive touch bar to switch your context or mode of operation. It should be no surprise that this is also possible.

We used the _Advanced Obsidian URI_ plugin to load our workspace earlier, but we can also use this plugin to call any command palette entry using the `commandname` parameter.

Therefore to open my demo vault and run my “QuickAdd: Daily Set Up” entry, I can use this URI.

```apache
obsidian://advanced-uri?vault=obsidian_demo&commandname=QuickAdd%3A%20Daily%20Set%20Up

```

Opening a URI from the command line or your favourite automation tool should be relatively trivial from this point.

We then have the following.

![](https://proxy-prod.omnivore-image-cache.app/0x0,sLdCeQKB6Jr_ABNaqUODVLj5YC3GtkfUOFK7ii82kA7I/https://www.thoughtasylum.com/assets/images/2021/2021-09-12-chain-3.png)

## Conclusion

This might have been a surprisingly large number of steps to achieve something that at first glance seems relatively innocuous. I would have to agree that it would be nice if things like this were easier, but Obsidian is moving fast and there may be an easier way to do this in the future. For now I am happy to have a flexible solution that I can use today; in fact I’ve been using it for a few months at this point.

While the output of this may seem relatively small, it is something I was doing manually multiple times per day. Having these automations in place means I can set it and forget it. Everything works just the way I want it now and that bit of friction has been removed from my day. I am also using the principles demonstrated here in other areas of Obsidian use, so it has helped me push on in those areas too. For me the effort involved I think has already paid off, and by sharing it with you, hopefully that benefit will increase even more.

If you find this useful, and please do reach out on social media and let me know. Do also share it with any other Obsidian users that you feel may find it useful.

**Author:** [Stephen Millard](https://www.thoughtasylum.com/authors/stephen%5Fmillard) 

[![Buy me a coffee](https://proxy-prod.omnivore-image-cache.app/0x0,sGstRDzLJWaYitgtTJdXXhTU-EZwrsoiTufFClPtyhXM/https://www.thoughtasylum.com/assets/site/bmc-new-btn-logo.svg)Buy me a coffee](https://www.buymeacoffee.com/sylumer) 

  
---

## Related posts that you may also like to read

* ![](https://proxy-prod.omnivore-image-cache.app/0x0,ssFe6Xg9sBE6gOjDVv5kuTIauKNneTny2p14OFDhDZfc/https://www.thoughtasylum.com/assets/thumbnails/2023/2023-02-26-man-at-mac.jpg)  
## [My Obsidian Generic Meeting Template](https://www.thoughtasylum.com/2023/02/26/my-obsidian-generic-meeting-template/)  
In many of my posts I share solutions to technical challenges I have come across. In this post there is certainly an element of that, but it is building on some earlier work and is perhaps more about sharing a real view of what I use day to day, as a way of providing a bit of insight or inspiration into how you may be able to employ something similar. Specifically, in this post I am going to share some details of my “general” meeting template in [Obsidian](https://obsidian.md/). Oh, and that’s “general meeting” template as in a generic template for a general, run of the mill, ad hoc meeting, not a general meeting as in governance (e.g. AGM, EGM).  
[Read More](https://www.thoughtasylum.com/2023/02/26/my-obsidian-generic-meeting-template/)
* ![](https://proxy-prod.omnivore-image-cache.app/0x0,sQp3fYhwpSBX9LOT91fETrqKOuERBThmbd78dHTPbOoU/https://www.thoughtasylum.com/assets/thumbnails/2023/2023-02-18-path.jpg)  
## [Path-based Commands in Obsidian](https://www.thoughtasylum.com/2023/02/18/path-based-commands-in-obsidian/)  
While [Drafts](https://getdrafts.com/) is my ever present information capture app, [Obsidian](https://obsidian.md/) is the destination for a large amount of that information as I build the content into cross-referenced, meaningful notes. Much like Drafts, Obsidian has a framework through which people can develop plug in solutions (literally “plugins” - core and community), which in many ways mimics Drafts’ actions.  
While some of my own work on Drafts actions has yielded libraries and reusable actions that others can build into workflows, the nature of some of the amazing plugins in Obsidian takes things further and uses plugins to open portals to allow you to interact directly with the underlying Obsidian API. As a result you can build some quite useful commands without having to build your own plugin.  
In this post I am going to share the construction of some simple ‘path-based’ command examples to illustrate how you can take advantage of this.  
[Read More](https://www.thoughtasylum.com/2023/02/18/path-based-commands-in-obsidian/)
* ![](https://proxy-prod.omnivore-image-cache.app/0x0,sm0qr_SWW9NQi60lhCtHXXv0HBiC-i8iIGCt4jVtcpTk/https://www.thoughtasylum.com/assets/thumbnails/2023/2023-02-05-time.jpg)  
## [Creating An Obsidian Annual Timeline](https://www.thoughtasylum.com/2023/02/05/creating-an-obsidian-annual-timeline/)  
A few days ago I published a post about a change to [how I am managing my daily tasks in Obsidian](https://www.thoughtasylum.com/2023/01/29/obsidian-daily-task-list/). Within that post I included a bit about how I am pulling that task list through into my dashboard canvas, and this threw up a bit of interest on Mastodon with a few people asking how I had produced a timeline on my dashboard. While I provided a few pointers at the time, I promised to go through in more detail what I have in place, and that is what I will be doing in this post.  
[Read More](https://www.thoughtasylum.com/2023/02/05/creating-an-obsidian-annual-timeline/)
* ![](https://proxy-prod.omnivore-image-cache.app/0x0,st7o7zdEXOo3gRrWatLRwtaS1ko_o6YJE_dTlmjO6co8/https://www.thoughtasylum.com/assets/thumbnails/2023/2023-01-29-tasks-today.jpg)  
## [An Obsidian Daily Task List](https://www.thoughtasylum.com/2023/01/29/obsidian-daily-task-list/)  
My use of [Obsidian](https://obsidian.md/) as a personal knowledge management (PKM) tool sees me making extensive use of daily notes. Each day I work, I create a new note and use it to keep an activity journal of all the key things I have done, link out to notes for meetings I have attended, things I have learned, etc. I also display my key tasks (for today and a soon as possible) and record any of the key tasks I have completed that day.  
I have always taken to cutting and pasting to transfer incomplete tasks to transfer them forward to the next daily note. But after having tried out [Roam Research](https://roamresearch.com/) a few years ago and working with their task management approach, I have always felt that my method was inefficient; but as with many things Obsidian, I found a better way utilising a third-party plugin.  
[Read More](https://www.thoughtasylum.com/2023/01/29/obsidian-daily-task-list/)

---



# links
[Read on Omnivore](https://omnivore.app/me/automating-your-obsidian-workspace-thought-asylum-18bd623c1a2)
[Read Original](https://www.thoughtasylum.com/2021/09/12/automating-your-obsidian-workspace/)

<iframe src="https://www.thoughtasylum.com/2021/09/12/automating-your-obsidian-workspace/"  width="800" height="500"></iframe>
