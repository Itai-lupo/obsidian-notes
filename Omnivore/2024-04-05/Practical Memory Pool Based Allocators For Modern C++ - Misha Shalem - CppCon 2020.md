---
id: 3d5af341-856e-4be4-9e6e-6efc0eaf7c16
title: Practical Memory Pool Based Allocators For Modern C++ - Misha Shalem - CppCon 2020
author: CppCon
tags:
  - youtube
  - programing
  - cppcon
  - cpp
date: 2024-04-05 19:24:35
date_published: 2020-09-29 03:00:00
words_count: 14578
state: INBOX
---

# Practical Memory Pool Based Allocators For Modern C++ - Misha Shalem - CppCon 2020 by CppCon
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> https://cppcon.org/
https://github.com/CppCon/CppCon2020/blob/main/Presentations/practical_memory_pool_based_allocators_for_modern_cpp/practical_memory_pool_based_allocators_for_modern_cpp__misha_shalem__cppcon_2020.pdf
---
Runtime-deterministic memory allocations are a crucial aspect of any safety-critical real-time system. One of the simplest and widely adopted allocation mechanisms used in such systems is a memory pool with fixed block sizes. Unfortunately, the need to know the exact sizes of the memory blocks makes any practical usage of memory pools with standard C++ allocator-based approach rather problematic since users often “hide” real properties of allocations which are made under the hood. For example: STL’s node-based containers like 'std::map' as well as other standard mechanisms like 'std::promise' or 'std::allocate_shared'.

Being a company which focuses on real-time safety-critical applications, we still see a significant value in keeping compatibility with the standard allocator model as well as in following common conventions which are familiar to every C++ developer.

This talk presents an approach which uses a combination of a memory allocator implementation which instruments the code, and an external LLVM-based tool which extracts the instrumentation information and generates static memory pool definitions, allowing the allocator to switch from the heap to a memory pool without any further changes to the code. The presentation will walk through a simplest possible implementation of this approach.

---
Misha Shalem
C++ Architect, Apex.AI
C++ developer with 16+ years of experience. Currently holds position of C++ Architect at Apex.AI, Palo Alto, CA

---
Streamed & Edited by Digital Medium Ltd - events.digital-medium.co.uk
events@digital-medium.co.uk 

*-----*
Register Now For CppCon 2022: https://cppcon.org/registration/
*-----*


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Practical Memory Pool Based Allocators For Modern C++ - Misha Shalem - CppCon 2020](https://www.youtube.com/watch?v=l14Zkx5OXr4)

By [CppCon](https://www.youtube.com/@CppCon)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-l-14-zkx-5-o-xr-4-18eaf1383d5)
[Read Original](https://www.youtube.com/watch?v=l14Zkx5OXr4)

<iframe src="https://www.youtube.com/watch?v=l14Zkx5OXr4"  width="800" height="500"></iframe>
