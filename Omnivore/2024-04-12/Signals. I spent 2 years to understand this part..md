---
id: d4925407-3a6c-46b1-b746-eb119aceaf03
title: Signals. I spent 2 years to understand this part.
author: kimylamp
tags:
  - programing
  - linux
  - c
date: 2024-04-12 14:27:25
date_published: 2024-04-11 03:00:00
words_count: 5033
state: INBOX
---

# Signals. I spent 2 years to understand this part. by kimylamp
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A quick introduction to one of the interprocess communication mechanisms in linux.

00:00 Main idea. We want to execute a function when external signal arrives
00:50 While loop. We can't simply jump to the signal handler!
01:24 Interrupts. Breaking a natural instruction flow
02:30 Saving registers. Kernel preserves user register values
03:09 How pc is saved
04:03 The most important idea! Replacing the pc
04:40 Big Picture overview.
05:55 To the Source code!
07:16 Kernel entry. Disassembling my kernel binary
12:04 Replacing the program counter
12:35 Return to user.
13:28 Signal handler is finished. How to resume the main code?
14:14 How the stack works when enter the kernel
16:26 We need to keep main code's original registers!
16:49 Kernel stack has to be empty. Overflow. Nested signals
17:30 Saving original regs to user stack
18:48 Kernel trampoline. Sigreturn
20:45 Bonus! (about the compiler bug video)


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Signals. I spent 2 years to understand this part.](https://www.youtube.com/watch?v=d0gS5TXarXc)

By [kimylamp](https://www.youtube.com/@kimylamp)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-d-0-g-s-5-t-xar-xc-18ed20ff6ab)
[Read Original](https://www.youtube.com/watch?v=d0gS5TXarXc)

<iframe src="https://www.youtube.com/watch?v=d0gS5TXarXc"  width="800" height="500"></iframe>
