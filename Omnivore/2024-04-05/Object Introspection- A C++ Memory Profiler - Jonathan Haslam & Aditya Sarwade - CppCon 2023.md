---
id: b8f89a55-c3a5-45ca-bd1e-1c5cfc7150dc
title: "Object Introspection: A C++ Memory Profiler - Jonathan Haslam & Aditya Sarwade - CppCon 2023"
author: CppCon
tags:
  - youtube
  - cppcon
  - cpp
date: 2024-04-05 19:25:12
date_published: 2024-01-29 02:00:00
words_count: 14500
state: INBOX
---

# Object Introspection: A C++ Memory Profiler - Jonathan Haslam & Aditya Sarwade - CppCon 2023 by CppCon
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> https://cppcon.org/
---

Object Introspection: A C++ Memory Profiler - Jonathan Haslam & Aditya Sarwade - CppCon 2023
https://github.com/CppCon/CppCon2023

This talk presents a new open source technology for the Linux platform that we have developed and deployed at Meta. It enables you to observe the precise memory footprint and composition of your C++ objects in live applications including their containers (even user-defined ones!) and all dynamic memory allocations. This is achieved with no code modification or recompilation using regular DWARF debug data.

We provide two different approaches for introspecting objects, (1) a profiler that operates on a target process and (2) APIs that allow you to introspect objects directly from within your application code. We describe the core technology underlying both mechanisms followed by details of how the two approaches work and how they can be used. We will give code examples demonstrating the types of efficiency improvements made in our C++ source base and demonstrate just how easy it is to make significant efficiency improvements in your code when you have the data in hand. As this technology is open source we hope it will inspire you to leave here fired up to introspect every object that is now in sight!

Understanding the detailed memory footprint of your C++ objects in live applications allows you to develop code to more efficiently utilize memory and CPU. Existing tools and techniques in this space are extremely thin on the ground and tend to be prohibitively intrusive for real world applications in production environments and provide partial information at best. We are on a mission to elevate the observability of data to the same level as code.

https://objectintrospection.org/
---

Aditya Sarwade

Aditya Sarwade is a software developer who has worked at Meta for over 4 years on system performance for large services and building C++ profiling tools. Previously, he has worked for 6 years in the virtual devices team at VMware implementing paravirtual devices for VMware's ESX platform.

Jonathan Haslam

Jon Haslam is a software developer at Meta where he has spent the last 5 years developing and applying software for C++ application observability. In his 25+ years of industry experience Jon has been fortunate enough to be involved in developing some interesting technologies including Sun Microsystem's Solaris Dynamic Tracing system (DTrace) and technologies within Oracle's RDBMS Database.
---

Videos Filmed & Edited by Bash Films: http://www.BashFilms.com
YouTube Channel Managed by Digital Medium Ltd: https://events.digital-medium.co.uk
---

Registration for CppCon: https://cppcon.org/registration/

#cppcon #cppprogramming #cpp


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Object Introspection: A C++ Memory Profiler - Jonathan Haslam & Aditya Sarwade - CppCon 2023](https://www.youtube.com/watch?v=6IlTs8YRne0)

By [CppCon](https://www.youtube.com/@CppCon)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-6-il-ts-8-y-rne-0-18eaf1411ee)
[Read Original](https://www.youtube.com/watch?v=6IlTs8YRne0)

<iframe src="https://www.youtube.com/watch?v=6IlTs8YRne0"  width="800" height="500"></iframe>
