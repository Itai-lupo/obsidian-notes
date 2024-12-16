---
id: ee7211e3-6b36-422b-8dd0-6f0852ce9eb3
title: Network Namespaces Basics Explained in 15 Minutes
author: KodeKloud
tags:
  - linux
  - docker
date: 2024-01-09 03:54:56
words_count: 9
state: INBOX
---

# Network Namespaces Basics Explained in 15 Minutes by KodeKloud
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Network Namespaces Basics Explained in 15 Minutes

## note
>[!note] 
>   
Network Namespaces are used by containerization technologies like Docker to isolate network between containers.

We’ll start with a simple host.  As we know already containers are separated from the underlying host using namespaces. So what are namespaces? 

When the container is created we create a network namespace for it that way it has no visibility to any network-related information on the host. Within its namespace the container can have its own virtual interfaces, routing and ARP tables. The container has an interface.

To create a new network namespace on a Linux host, run the ip nets add command. In this case we create two network namespaces read and blue. To list the network namespaces run the ip netns command.

To list the interfaces on my host, I run the ip link command. I see that my host has the loopback interface and the eth0 interface. Now, how do we view the same within the network namespace we created? How do we run the same command within the red or blue namespace? Pre-fix the command with the command ip netns exec followed by the namespace name which is red. Now the ip link command will be executed inside the red namespace. Another way to do it is to add the –n option to the original ip link command. Both of these are the same, the second one is simpler though. But remember this only works if you intend to run the ip command inside the namespace. As you can see it only lists the loopback interface. You cannot see the eth0 interface on the host. So with namespaces we have successfully prevented the container from seeing the hosts interface.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Network Namespaces Basics Explained in 15 Minutes](https://www.youtube.com/watch?v=j%5FUUnlVC2Ss)

By [KodeKloud](https://www.youtube.com/@KodeKloud)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-j-u-unl-vc-2-ss-18cebeb9721)
[Read Original](https://www.youtube.com/watch?v=j_UUnlVC2Ss)

<iframe src="https://www.youtube.com/watch?v=j_UUnlVC2Ss"  width="800" height="500"></iframe>
