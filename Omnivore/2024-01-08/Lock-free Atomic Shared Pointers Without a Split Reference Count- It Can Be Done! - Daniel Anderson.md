---
id: a58edbaf-6028-4e79-90dd-a1cfa4449da9
title: Lock-free Atomic Shared Pointers Without a Split Reference Count? It Can Be Done! - Daniel Anderson
author: CppCon
tags:
  - programing
  - cppcon
  - cpp
  - youtube
date: 2024-01-08 20:24:05
words_count: 18
state: INBOX
---

# Lock-free Atomic Shared Pointers Without a Split Reference Count? It Can Be Done! - Daniel Anderson by CppCon
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Lock-free Atomic Shared Pointers Without a Split Reference Count? It Can Be Done! - Daniel Anderson

## note
>[!note] 
>   
Smart pointers such as std::unique_ptr and std::shared_pointer are the recommended way to manage dynamic memory in C++ programs. At least, that is what we try to teach people. But what if you are writing parallel and concurrent code, can we will make use of std::shared_ptr? Yes, but only if concurrent modifications are done via a std::atomicï¼œstd::shared_prtï¼ž! Atomic smart pointers were recently introduced to the C++20 standard for this purpose, however, existing implementations in major standard libraries are not lock-free. This makes them impractical for applications with heavy concurrency, as their performance degrades badly.

There are several well known implementations of a lock-free atomic shared pointer, such as Folly's, and Anthony William's which is included in a commercial library. These implementations and several others are all based on the so-called "split reference count" technique, which solves the problem of atomically modifying the reference count and the object pointer when performing an update operation. This technique is difficult to make fully portable however, since it either relies on a double-word compare-exchange operation, or packs a reference count inside the "unused" high-order bits of the pointer.

In this talk, we describe a strategy for implementing lock-free atomic shared pointers without a split reference count. The solution is surprisingly simple and elegant, as it does not require adding any fields to the shared pointer or atomic shared pointer and does not hide anything inside the bits of the pointer. Under the hood, it makes use of hazard pointers and deferred reclamation. Since hazard pointers are on track for inclusion in C++26, this implementation is timely, simple to implement with nearly-standard C++, and achieves excellent performance.
---

# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Lock-free Atomic Shared Pointers Without a Split Reference Count? It Can Be Done! - Daniel Anderson](https://www.youtube.com/watch?v=lNPZV9Iqo3U)

By [CppCon](https://www.youtube.com/@CppCon)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-l-npzv-9-iqo-3-u-18cea514a41)
[Read Original](https://www.youtube.com/watch?v=lNPZV9Iqo3U)

<iframe src="https://www.youtube.com/watch?v=lNPZV9Iqo3U"  width="800" height="500"></iframe>
