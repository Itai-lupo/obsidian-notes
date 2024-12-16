---
id: 0d7f8a58-8998-4e28-aba5-21c836970cf6
title: Descriptorless files for io_uring [LWN.net]
author: Jonathan Corbet
tags:
  - linux
  - programing
  - game_engine
  - c
  - networking
date: 2024-04-05 20:16:06
date_published: 2021-07-19 03:00:00
words_count: 1081
state: INBOX
---

# Descriptorless files for io_uring [LWN.net] by Jonathan Corbet
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> The lowly file descriptor is one of the fundamental objects in Linux
systems.  A file descriptor, which is a simple integer value, can refer to an
open file — or to a network connection, a running process, a loaded BPF
program, or a namespace. 
Over the years, the use of file descriptors to refer to transient objects
has grown to the point that it can be difficult to justify an API that
uses anything else.  Interestingly, though, the io_uring subsystem looks as if it is moving
toward its own number space separate from file descriptors.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
**Benefits for LWN subscribers**

The primary benefit from [subscribing to LWN](https://lwn.net/subscribe/) is helping to keep us publishing, but, beyond that, subscribers get immediate access to all site content and access to a number of extra site features. Please sign up today!

The lowly file descriptor is one of the fundamental objects in Linux systems. A file descriptor, which is a simple integer value, can refer to an open file — or to a network connection, a running process, a loaded BPF program, or a namespace. Over the years, the use of file descriptors to refer to transient objects has grown to the point that it can be difficult to justify an API that uses anything else. Interestingly, though, the [io\_uring subsystem](https://lwn.net/Articles/776703/) looks as if it is moving toward its own number space separate from file descriptors.

Io\_uring was created to solve the asynchronous I/O problem; this is a functionality that Linux has never supported as well as users would have liked. User space can queue operations in a memory segment that is shared directly with the kernel, allowing those operations to be initiated, in many cases, without the need for an expensive system call. Similarly, another shared-memory segment contains the results of those operations once they complete. Initially, io\_uring focused on simple operations (reading and writing, for example), but it has quickly [gained support for many other system](https://lwn.net/Articles/810414/) calls. It is evolving into the general asynchronous-operation API that Linux systems have always lacked.

#### Fixed files

A read or write operation must specify both the file descriptor to be operated on and a buffer to hold the data. There is a fair amount of setup work that must be done in the kernel before that operation can proceed, though. That includes taking a reference to the open file (to prevent it from going away while the operation is underway) and locking down the memory for the buffer. That overhead can, in many cases, add up to a significant part of the total cost of the operation; since programs tend to perform multiple operations with the same file descriptors and the same buffers, this overhead can be paid many times for the same resources, and it can add up.

From the beginning, io\_uring has included a way to reduce that overhead in the form of the [io\_uring\_register()system call](https://manpages.debian.org/unstable/liburing-dev/io%5Furing%5Fregister.2.en.html):

    int io_uring_register(unsigned int fd, unsigned int opcode,
                          void *arg, unsigned int nr_args);

If opcode is IORING\_REGISTER\_BUFFERS, the io\_uring subsystem will perform the setup work for the nr\_args buffers pointed to by arg and keep the result; those buffers can then be used multiple times without paying that setup cost each time. If, instead,opcode is IORING\_REGISTER\_FILES, then arg is interpreted as an array of nr\_args file descriptors. Each file in that array will be referenced and held open so that, once again, it can be used efficiently in multiple operations. These file descriptors are called "fixed" in io\_uring jargon.

There are a couple of interesting aspects to fixed files. One is that the application can call close() on the file descriptor associated with a fixed file, but the reference within io\_uring will remain and will still be usable. The other is that a fixed file is not referenced in subsequent io\_uring operations by its file-descriptor number. Instead, operations use the offset where that file descriptor appeared in theargs array during the io\_uring\_register() call. So if file descriptor 42 was placed in args\[13\], it will subsequently be known as fixed file 13 within io\_uring.

So the io\_uring subsystem has, in essence, set up a parallel descriptor space that can refer to open files, but which is independent of the regular file descriptors. In current kernels, though, it is still necessary to obtain a regular file descriptor for a file and register it for the file to appear in the io\_uring fixed-file space. If, however, an application will never do anything with a file outside of io\_uring, the creation of the regular file descriptor serves no real purpose.

It is, indeed, possible to create, use, and close a file descriptor entirely within io\_uring. As noted above, this subsystem is not limited to simple I/O; it is also possible to open files and accept network connections with io\_uring operations. At the moment, though, user space must intervene between the creation of the file descriptor and its use to install it as a fixed file. The cost of this work is not huge but it, too, can add up in an application that processes a lot of file descriptors.

#### No more file descriptors

To address this problem, Pavel Begunkov has posted [this patch series](https://lwn.net/ml/linux-kernel/cover.1625657451.git.asml.silence@gmail.com/) adding a direct-to-fixed open operation. The io\_uring operations that can create file descriptors — the equivalents of the [openat2()](https://man7.org/linux/man-pages/man2/openat2.2.html)and [accept()](https://man7.org/linux/man-pages/man2/accept.2.html)system calls — gain the ability to, instead, store their result directly into the fixed-file table at a user-supplied offset. When this option is selected, there is no regular file descriptor created at all; the io\_uring alternative descriptor is the only way to refer to the file.

The most likely use case for this feature is network servers; a busy server can create (with accept()) and use huge numbers of file descriptors in a short period of time. While io\_uring operations, being asynchronous, can generally be executed in any order, it is possible to chain operations so that one does not begin before the previous one has successfully completed. Using this capability, a network server could queue a series of operations to accept the next incoming connection (storing it in the fixed-file table), write out the standard greeting, and initiate a read for the first data from the remote peer. User space would only need to become involved once that data has arrived and is ready to be processed.

This is clearly an interesting capability, and it shows how io\_uring is quickly evolving into an alternative programming interface for Linux systems. The separation from the traditional file-descriptor space is just one more step in that direction. With the future addition of [BPF support](https://lwn.net/Articles/847951/) (which is [still under development](https://lwn.net/ml/linux-kernel/23168ac0-0f05-3cd7-90dc-08855dd275b2@gmail.com/)), the separation will become even more pronounced; the user-space component of some applications may become small indeed. Use of the io\_uring API will probably not be worthwhile for the majority of applications, but for some it can make a large difference. It will be interesting to see where it goes from here.  

| Index entries for this article         |                                                      |
| -------------------------------------- | ---------------------------------------------------- |
| [Kernel](https://lwn.net/Kernel/Index) | [io\_uring](https://lwn.net/Kernel/Index#io%5Furing) |

  
---

 ([Log in](https://lwn.net/Login/?target=/Articles/863071/) to post comments)



# links
[Read on Omnivore](https://omnivore.app/me/descriptorless-files-for-io-uring-lwn-net-18eaf42ac55)
[Read Original](https://lwn.net/Articles/863071/)

<iframe src="https://lwn.net/Articles/863071/"  width="800" height="500"></iframe>
