---
id: ee27ccb7-38b8-448c-a08a-df9af9926210
title: A Linux sysadmin's introduction to cgroups | Enable Sysadmin
author: Steve Ovens
tags:
  - linux
  - docker
date: 2024-01-10 04:02:22
date_published: 2020-09-29 12:10:01
words_count: 1834
state: INBOX
---

# A Linux sysadmin's introduction to cgroups | Enable Sysadmin by Steve Ovens
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Defining cgroups and how they help with resource management and performance tuning in this first article kicking off a four-part series covering cgroups and resource management.


# content

So you've heard of this thing called cgroups, and you are interested in finding out more. Perhaps you caught mention of it while listening to a talk about containerization. Maybe you were looking into Linux performance tuning, or perhaps you just happened to be traversing your file system one day and discovered `/sys/fs/cgroups`. Either way, you want to learn more about this functionality that has been baked into the kernel for quite some time. So sit back, grab some popcorn, and prepare to (hopefully) learn something you may not have known before.

## What are cgroups?

Webster's dictionary defines _cgroups_ as... Just kidding. I always hated listening to talks that started with boring dictionary definitions. Instead, I am going to attempt to distill the technical definition of cgroups down into something easy to understand.

Cgroups are a huge topic. I've broken this discussion down into a four-part series. Part one, this article, covers the fundamental concepts of cgroups. Part two examines CPUShare in greater depth. Part three, entitled "Doing cgroups the hardway," looks at cgroup administrative tasks. Finally, part four covers cgroups as managed by systemd.

As you may or may not know, the Linux kernel is responsible for all of the hardware interacting reliably on a system. That means, aside from just the bits of code (drivers) that enable the operating system (OS) to understand the hardware, it also sets limits on how many resources a particular program can demand from the system. This is most easily understood when talking about the amount of memory (RAM) a system has to divide up amongst all of the applications your computer may execute. In its most basic form, a Linux system is allowed to run most applications without restriction. This can be great for general computing if all applications play nicely together. But what happens if there is a bug in a program, and it starts to consume all of the available memory? The kernel has a facility called the Out Of Memory (OOM) Killer. Its job is to halt applications in order to free up enough RAM so that the OS may continue to function without crashing.

That's great, you say, but what does this have to do with cgroups? Well, the OOM process acts as a last line of defense before your system comes crashing down around you. It's useful to a point, but since the kernel can control which processes must survive the OOM, it can also determine which applications cannot consume too much RAM in the first place.

Cgroups are, therefore, a facility built into the kernel that allow the administrator to set resource utilization limits on any process on the system. In general, cgroups control:

* The number of CPU shares per process.
* The limits on memory per process.
* Block Device I/O per process.
* Which network packets are identified as the same type so that another application can enforce network traffic rules.

There are more facets than just these, but those are the major categories that most administrators care about.

## Cgroups' humble beginnings

Control groups (cgroups) are a Linux kernel mechanism for fine-grained control of resources. Originally put forward by Google engineers in 2006, cgroups were eventually merged into the Linux kernel around 2007\. While there are currently two versions of cgroups, most distributions and mechanisms use version 1, as it has been in the kernel since 2.6.24\. Like with most things added into the mainline kernel, there was not a huge adoption rate at first. Version 2 continues this trend, having been around for almost half a decade but still not widely deployed.

One issue plaguing cgroup adoption is the lack of knowledge of its existence and its part in the modern Linux system. Low awareness and adoption often mean that the interaction with a kernel interface is clunky, convoluted, or just downright a manual process. Such was the case with cgroups initially. Sure, it's not that hard to create one-off cgroups. For example, if you wanted to simulate the early days before the tooling around cgroups was developed, you could create a bunch of directories, mount the `cgroup` filesystem and start configuring everything by hand. But before we get to all that, let's talk a little bit about _why_ cgroups are vital in today's Linux ecosystem.

## Why cgroups are important

Cgroups have four main features closely related to each other that make them very important in a modern system, especially if you are running a containerized workload.

#### 1\. Resource limiting

As touched upon earlier, cgroups allow an administrator to ensure that programs running on the system stay within certain acceptable boundaries for CPU, RAM, block device I/O, and device groups.

_**NOTE**: The device groups CGroup can be a key component in your system's comprehensive security strategy. Device groups include controlling permissions for read, write, and `mknod `operations. The read/write operations are fairly self-explanatory, so let's take a moment to look at the `mknod` functionality in a Linux system._

`mknod` was initially designed to populate all of the things that show up in `/dev/`. These are things like hard drives, USB interfaces for devices such as the Arduino, ESP8266 microcontrollers, or other devices that might exist on a system. Most modern Linux systems use `udev` to automatically populate this virtual filesystem with things detected by the kernel. `mknod` also allows multiple programs to communicate with each other by creating a named pipe. This concept is beyond the scope of this explanation, but it is sufficient to understand that this facilitates passing information from one program to another. Regardless, the `mknod` in a controlled environment is something that an administrator should look closely at restricting.

#### 2\. Prioritization

Prioritization is slightly different than resource limiting because you are not restricting processes necessarily. Instead, you are merely saying that regardless of how many resources are available, process **X** will always have more time on the system than process **Y**.

#### 3\. Accounting

While accounting is turned off by default for most enterprise versions of Linux due to additional resource utilization, it can be really helpful to turn on resource utilization for a particular tree (more on this later). You can thus see what processes inside of which cgroup are consuming which types or resources.

#### 4\. Process control

There is a facility in cgroups called _freezer_. While a deep understanding of this functionality is outside the scope of this article, you can think of freezer as the ability to take a snapshot of a particular process and move it. See the [Kernel Documentation](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v1/freezer-subsystem.html) for a deeper understanding.

Okay, so what does this all mean? Well, from a system administrator's perspective, it means several things.

First, even without delving into container technology, it means that you can achieve greater density on a single server by carefully managing the type of workload, the applications, and the resources that they require.

Second, it enhances your security posture quite a bit. While a typical Linux installation uses cgroups by default, it does not put any restrictions upon processes. You can impose restrictions by default if you so choose. You can also restrict access to specific devices for specific users, groups, or processes, which further helps to lock down a system.

Finally, you can do a significant amount of performance tuning through cgroups. That, in combination with [tuned](https://access.redhat.com/documentation/en-us/red%5Fhat%5Fenterprise%5Flinux/7/html/power%5Fmanagement%5Fguide/tuned), means that you can create an environment specifically adjusted for your individual workloads. At scale, or in a latency-sensitive environment, these adjustments can mean the difference between meeting or missing your Service Level Agreements (SLAs).

## How do cgroups work?

For the purposes of this discussion, we are talking about **cgroups V1**. While version 2 is available in Red Hat Enterprise Linux 8 (RHEL 8), it is disabled by default. Most container technologies such as Kubernetes, OpenShift, Docker, and so on still rely on cgroups version 1.

We have already discussed that cgroups are a mechanism for controlling certain subsystems in the kernel. These subsystems, such as devices, CPU, RAM, network access, and so on, are called _controllers_ in the cgroup terminology.

Each type of controller (`cpu`, `blkio`, `memory`, etc.) is subdivided into a tree-like structure. Each branch or leaf has its own weights or limits. A control group has multiple processes associated with it, making resource utilization granular and easy to fine-tune.

_**NOTE**: Each child inherits and is restricted by the limits set on the parent cgroup._

Image

![cgroups diagramming displaying separate controllers](https://proxy-prod.omnivore-image-cache.app/1232x1019,sARmYc_1Enew5dI-nw0Ri2MqDTCcp6jJNMgUYn3aBiYM/https://www.redhat.com/sysadmin/sites/default/files/styles/embed_large/public/2020-09/CGroup_Diagram.png?itok=4C4vO4Ah)

In the diagram above, you can see that it is possible to have `PID 1` in `memory`, `disk i/o`, and `cpu` control groups. The cgroups are created per resource type and have no association with each other. That means you could have a `database` group associated with all of the controllers, but the groups are treated independently. Like GIDs, these groups are assigned a numeric value upon creation and not a friendly name. Under the hood, the kernel uses these values to determine resource allocation. To think of it another way, assume that each cgroup name, once attached to a controller, is renamed to the name of the controller plus the name of your choosing. So a group called `database` in the `memory` controller can actually be thought to be `memory-database`. Thus, there is no relation to a `database` group associated with the controller `cpu` as the friendly name can be thought of as `cpu-database`.

_**NOTE**: This is a gross simplification and is NOT technically accurate should you be looking to get involved with the underlying cgroup code. The above explanation is meant for clarity of understanding._

## Wrap up

So now you have an idea of what cgroups are and how they might help you with performance tuning and security. You also have a better understanding of how cgroups interact with controllers.

This article is not a breakdown of all the controller types that exist in cgroups. Something on that scale would take an entire book to explain properly. In the next article, I look at CPUShares due to their relative complexity and the importance they play in the overall health of a system. The other controllers function similarly. Therefore, you should be able to take the lessons learned from the CPU controller and apply them to most of the remaining cgroup controllers.

Don't forget that in part three we'll examine administrative tasks and in part four we'll wrap up with how systemd interacts with cgroups.

_**\[ Getting started with containers? Check out this free course. [Deploying containerized applications: A technical overview](https://www.redhat.com/en/services/training/do080-deploying-containerized-applications-technical-overview?intcmp=701f20000012ngPAAQ). \]**_

Managing access to CPU time using CPUShares with cgroups in part two in this four-part series covering cgroups and resource management.

Manually managing cgroups is difficult, but it helps you to understand what's happening under the hood in part three of this four-part series covering cgroups and resource management.

Find out how much easier cgroup management is with systemd in this four-part series finale covering cgroups and resource management.



# links
[Read on Omnivore](https://omnivore.app/me/a-linux-sysadmin-s-introduction-to-cgroups-enable-sysadmin-18cf11b37b0)
[Read Original](https://www.redhat.com/sysadmin/cgroups-part-one)

<iframe src="https://www.redhat.com/sysadmin/cgroups-part-one"  width="800" height="500"></iframe>
