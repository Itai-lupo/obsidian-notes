---
id: c96f554b-59d3-42a9-97ae-252d46cfeea1
title: Asynchronous I/O and coroutines for smooth data streaming - Björn  Fahller - NDC TechTown 2021
author: NDC Conferences
tags:
  - programing
  - cpp
  - youtube
date: 2024-01-08 20:22:22
words_count: 19
state: INBOX
---

# Asynchronous I/O and coroutines for smooth data streaming - Björn  Fahller - NDC TechTown 2021 by NDC Conferences
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Asynchronous I/O and coroutines for smooth data streaming - Björn  Fahller - NDC TechTown 2021

## note
>[!note] 
>   Linux kernel 5.1 introduced io_uring, which is a mechanism to do asynchronous I/O, primarily for network and disk operations. With asynchronous I/O, the responsiveness of your program is enhanced, but it can easily lead to "callback hell", where you register callbacks that processes arrived data, which feeds information to other callbacks, and so on. C++20 brings us language level coroutines. 
Coroutines are a generalization of functions, that can be suspended in the middle to allow other computations, and then resumed again, all in the same thread. One such suspension point can be to wait for the arrival of data. 

In this presentation I will bring a brief introduction to both topics, and then show how to use io_uring and coroutines to write code that reads asynchronous data in seeral short loops, seemingly running in parallel, without having to worry about threading issues.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Asynchronous I/O and coroutines for smooth data streaming - Björn Fahller - NDC TechTown 2021](https://www.youtube.com/watch?v=uPJFj3b8RN0)

By [NDC Conferences](https://www.youtube.com/@NDC)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-u-pj-fj-3-b-8-rn-0-18cea4fb847)
[Read Original](https://www.youtube.com/watch?v=uPJFj3b8RN0)

<iframe src="https://www.youtube.com/watch?v=uPJFj3b8RN0"  width="800" height="500"></iframe>
