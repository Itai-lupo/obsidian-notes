---
id: 05bef0e7-0cd6-4e6a-9871-4ee94bed93f3
title: "The Absurdity of Error Handling: Finding a Purpose for Errors in Safety-Critical SYCL - Erik Tomusk"
author: CppCon
tags:
  - youtube
  - programing
  - game_engine
  - c
date: 2024-04-05 19:23:50
date_published: 2024-02-19 02:00:00
words_count: 7589
state: INBOX
---

# The Absurdity of Error Handling: Finding a Purpose for Errors in Safety-Critical SYCL - Erik Tomusk by CppCon
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> https://cppcon.org/
---

The Absurdity of Error Handling: Finding a Purpose for Errors in Safety-Critical SYCL - Erik Tomusk - CppCon 2023
https://github.com/CppCon/CppCon2023

C++ is hard. Error handling is hard. Safety-critical software is very hard. Combine the three, and you get just one of the exciting problems faced by the SYCL SC working group.
 
SYCL is one of the most widely supported abstraction layers for programming GPUs and other hardware accelerators using ISO C++. As of March 2023, the Khronos Group has a working group tasked with specifying SYCL SC --- a variant of SYCL that is compatible with safety-critical systems. One of the key features of a safety-critical system is that its behavior must be well understood not just in normal operation, but also in the presence of faults. This raises some difficult technical questions, such as, "How do I implement deterministic error handling?" but also some more philosophical ones, like, “What does an error actually mean, and is the error even theoretically actionable?”
 
Much of the information on C++ error handling in safety-critical contexts focuses on RTTI and the pitfalls of stack unwinding. Although these are important considerations, I will argue that a far greater problem is a lack of agreement on what *safety* even means. This talk will focus on how *safety* in a safety-critical context differs from *safety* from a programming language design perspective. While the talk is inspired by the pain-points of C++ error handling in safety-critical contexts, the conclusions are relevant to C++ software in general. The talk will challenge the audience to rethink the situations that can be considered erroneous and to carefully consider the expected behavior of their software in the presence of errors.
 
I am a member of the SYCL SC working group, but this talk will contain my own opinions.
---

Erik Tomusk

Erik Tomusk is the Senior Safety Architect at Codeplay Software, where he is working to bring functional safety to the SYCL API. In a previous role, he spent a few years writing C++ and CMake for Codeplay's OpenCL runtime.

Before joining Codeplay, Erik researched CPU architectures at the University of Edinburgh, and even managed to secure a Ph.D.
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
[The Absurdity of Error Handling: Finding a Purpose for Errors in Safety-Critical SYCL - Erik Tomusk](https://www.youtube.com/watch?v=ZUAPHTbxnAc)

By [CppCon](https://www.youtube.com/@CppCon)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-zuaph-tbxn-ac-18eaf12d452)
[Read Original](https://www.youtube.com/watch?v=ZUAPHTbxnAc)

<iframe src="https://www.youtube.com/watch?v=ZUAPHTbxnAc"  width="800" height="500"></iframe>
