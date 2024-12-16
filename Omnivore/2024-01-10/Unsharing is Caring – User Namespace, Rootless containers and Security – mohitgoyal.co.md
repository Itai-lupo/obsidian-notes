---
id: bf231da9-bc2d-4cc2-b804-fc554613398f
title: Unsharing is Caring – User Namespace, Rootless containers and Security – mohitgoyal.co
tags:
  - linux
  - docker
date: 2024-01-10 04:19:59
date_published: 2021-04-20 00:21:00
words_count: 2211
state: INBOX
---

# Unsharing is Caring – User Namespace, Rootless containers and Security – mohitgoyal.co by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Those who have been working with containers, have long been worried about security aspects associated with underlying containers. One of the vulnerability associated with containers is with running containers as root user. Containers have often required to do some privileged tasks such as mount filesystems, associated with packet route tables on the host networks etc…


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Those who have been working with containers, have long been worried about security aspects associated with underlying containers. One of the vulnerability associated with containers is with running containers as root user. Containers have often required to do some privileged tasks such as mount filesystems, associated with packet route tables on the host networks etc which have historically needed privileged access on the underlying host machine. So this has allowed malicious actors to try to exploit vulnerabilities in containers host. 

With rootless containers, we are slowly shifting to overcome this scenario. Rootless containers refers to the ability for an unprivileged user to create, run and otherwise manage containers. This term also includes the variety of tooling around containers that can also be run as an unprivileged user. 

As linux developers, admins and security researchers have noted that everything on a linux system is some sort of file, and therefore file permissions are the first line of defense against an application that may misbehave or exploited. The primary way linux handles file permissions is through the implementation of _users_ and _groups_. There are _normal users,_ for which linux applies privilege checking, and there is the _superuser_ that bypasses most (if not all) checks. In short, the original linux model was all-or-nothing. It also had concept of the _suid_ bit, where certain executables, which needed to be run by standard users but also make privileged kernel calls, would have the suid bit set. This however was the equivalent of granting them privileged access, for the system / kernel calls, they were allowed to make. This also made them the target for malicious actors. 

**Linux Capabilities – A quick introduction**

Linux _[capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)_ were created to provide a more granular application of the security model. The underlying idea was simple: split all the possible privileged _kernel calls_ up into groups of related functionality, then assign processes only to the subset they needed. So instead of running the binary as root, you can apply only the specific capabilities an application requires to be effective. As of linux Kernel 5.1, there are 38 capabilities. 

However, situation is a little complex. Normal processes does not require any capabilities at all. Most of the privileges they need are already associated with files. Note again that capabilities are for kernel calls, which means that you need to perform system wide changes. 

Besides this, _capability sets_ were also defined.

A _capability set_ is the manner in which capabilities can be assigned to threads. In brief, there are five total capability sets – _effective_, _inheritable_, _permitted_, _ambient,_ and _bounding_. Executables also get two of these (permitted and inheritable) as well an _effective bit_ which can be set.

In order to see what capabilities a given process may have you can run the `getpcaps ${PID}` command. The output of this command will look different depending on the distribution of Linux.

So, why is this important? Remember that capabilities are tied to a specific _[user namespace](https://man7.org/linux/man-pages/man7/user%5Fnamespaces.7.html)_. User namespaces are one of the popular category in linux _[namespaces](https://man7.org/linux/man-pages/man7/namespaces.7.html#:~:text=%2A%20The%20namespace%20is%20hierarchical%20%28i.e.,%5D%2Fns%2Fpid%5Ffor%5Fchildren%20symbolic%20link.)_. 

**Namespaces** **– A quick introduction** 

As taken from the wiki, a _namespace_ wraps a global system resource in an abstraction that makes it appear to the processes within the namespace that they have their own isolated instance of the global resource. Changes to the global resource are visible to other processes that are members of the namespace, but are invisible to other processes. As with any other parent-child trees, parent namespaces may have full visibility to child namespaces, but child namespaces do not have visibility to parent namespaces. 

One of the popular usage of namespaces is to implement containers. So processes in containers are visible to each other but not to the outside world. 

The namespaces are further divided into below categories:

* Cgroup – isolates Cgroup root directory
* IPC – isolates System V IPC, Posix message queues
* Network – isolates network devices, stacks, ports, etc
* PID – isolates process ids
* Time – isolates boot and monitonic clocks
* User – isolates users and group ids
* UTS – isolates hostname and nis

Also, namespaces can be _nested_ up to 32 levels. 

**User Namespaces**

As we mentioned, _user namespaces_ are a way to isolate users and group ids. In earlier versions of kernel, the id that was used to represent user or group, was a 16 bit unsigned integer, so it could hold values from 0 to 65536 only. 0 was assigned to _root_ user. It was later increased to 64 bit, allowing kernel to store over 4 billion uniquely different ids. 

Again, unless restricted by the system admins, user namespaces can be nested. This means that at a give user namespace instance (say app-user) can have zero or more child namespaces (say java-user, web-user, etc) and they can have their own child user namespace (say db-user, etc.) and so on up to 32 nested levels. Once this hierarchy is created, it cannot be changed afterwards. The only possible way is to destroy it and re-create it as you need. The effect is that all user namespaces have exactly one parent, forming a tree structure. And as with the trees, at top there is single parent, that is _root_. 

Below are the salient features of user namespaces:

* Only namespace which can be created without CAP\_SYS\_ADMIN capability
* A process will have distinct set of uids, gids and capabilities
* User namespaces allow per-namespace mappings of user and group ids.
* Users and groups may have privileges for certain operations inside the container without having those privileges outside the container
* Have root privileges for operations inside the container only
* Map user ids on the host system to corresponding user ids in the namespaces
* Since linux kernel version 3.8 are generally available
* User namespace root users can create network namespaces

Lets try to understand this a bit more. Lets examine, who we are in the current context (as of now, we are working as `cloud_user`):

cloud_user@d7e5dc06581c:~$ whoami
cloud_user
cloud_user@d7e5dc06581c:~$ id
uid=1001(cloud_user) gid=1001(cloud_user) groups=1001(cloud_user),27(sudo)

Above output indicates that our uid, gid is 1001 and we are part of `sudo` group, so we have sudo privileges. Now, lets create a user namespace using `unshare -U`:

cloud_user@d7e5dc06581c:~$ unshare -U
nobody@d7e5dc06581c:~$ whoami
nobody
nobody@d7e5dc06581c:~$ id
uid=65534(nobody) gid=65534(nogroup) groups=65534(nogroup)

Interestingly, our username inside new user namespace is `nobody` and our group name is `nogroup`. This is because, by default, there is no user id mapping taking place. When no mapping is defined, the namespace simply uses your system’s rules to determine how to handle an undefined user.

To create the user mapping along with the user namespace, we need to run command `unshare -Ur`:

# unshare -r implies mapping with root user (alternative of unshare --map-root-user)
cloud_user@d7e5dc06581c:~$ unshare -Ur
root@d7e5dc06581c:~# whoami
root
root@d7e5dc06581c:~# id
uid=0(root) gid=0(root) groups=0(root),65534(nogroup)

Now our username inside new user namespace is `root`. This is also called _fakeroot_, as it appears as root to only itself. For its parent, its still a normal user and everything will appear to be owned by parent user. To demonstrate this, lets create a file using `touch new_user_root.txt` with `root` user:

root@d7e5dc06581c:~# touch new_user_root.txt
root@d7e5dc06581c:~# root@d7e5dc06581c:~# ls -l
total 1
-rw-rw-r--  1 root   root        0 Mar 18 22:50 new_user_root.txt

Lets observe this file from context of parent user i.e. cloud\_user:

cloud_user@d7e5dc06581c:~$ ls -l
total 1
-rw-rw-r--  1 cloud_user cloud_user     0 Mar 18 22:50 new_user_root.txt

So for its parent, the file is still owned by it.

The information linking uids from one namespace to another is called a _user id mapping_. It represents lookup tables from ids in the current user namespace to ids in other user namespaces and every user namespace is associated with exactly one uid mapping (in addition to one gid mapping for group ids). Since everything is a file in linux, it exposes this mapping via the `/proc` filesystem at `/proc/$pid/uid_map` for uid and `/proc/$pid/gid_map` for gid where `$pid` is a process id. These files are also called as _map files_.

# from within the context of cloud_user user namespace:
# 2532 is the pid here
cloud_user@d7e5dc06581c:~/user-ns$ cat /proc/2532/uid_map
         0       1001          1
cloud_user@d7e5dc06581c:~/user-ns$ cat /proc/2532/gid_map
         0       1001          1


# from within the context of root (child of cloud_user) user namespace:
root@d7e5dc06581c:~# cat /proc/$$/uid_map
         0       1001          1
root@d7e5dc06581c:~# cat /proc/$$/gid_map
         0       1001          1

These ids are assigned in the format: `id-inside-ns id-outside-ns range`. As you can guess, `id-inside-ns` is the id inside namespace of current process, `id-outside-ns` is the id outside namespace i.e. of the parent process. `range` indicates the number of processes mapped. The output of this file needs to be understood in the context of _who_ is reading it.

For example, if a process reads the file `/proc/2532/uid_map` and among the received rows is `15 22 5`, then uids 15 through 19 in process 2532’s user namespace maps to uids 22-26 in the reading process’s distinct user namespace.

On the other hand, if a process reads from the file `/proc/$$/uid_map` (or the map file for any process that belongs to the same user namespace as it does) and receives `15 22 5`, then uids 15 through 19 in its user namespace maps to uids 22 through 26 in its parent user namespace.

**Owner Namespaces**

User Namespaces are special in the sense that:

* You do not need to have any privileged access to create them, so you do not need to be a `root` user
* The newly created default or initial user in user namespace has _root_ privileges in its _own_ context
* Having _root_ privileges in their _own_ context, allows it to create other sub-namespaces and user-namespaces and _own_ them as well.
* If other namespaces like network namespace is created alongside user namespace as part of the same system call, linux will create user namespace first and designate it as owner of network namespace

Owner namespaces are important because a process requesting to carry out a privileged action on a resource encapsulated by a non-user namespace will have its uid privileges checked against the owner user namespace and not the root user namespace.

Let’s consider this with below example:

# start with our current user i.e. cloud_user and verify the same using id
cloud_user@d7e5dc06581c:~$ id
uid=1001(cloud_user) gid=1001(cloud_user) groups=1001(cloud_user),27(sudo)


# try to add a network device 
# this will not work as we do not have sudo privileges here
cloud_user@d7e5dc06581c:~$ ip link add type veth
RTNETLINK answers: Operation not permitted

# lets create a owner user namespace 
# -n allows unsharing of network spaces, more details on unshare --help
cloud_user@d7e5dc06581c:~$ unshare -nUr

# verify our uid, gid within new user namespace
root@d7e5dc06581c:~# id
uid=0(root) gid=0(root) groups=0(root),65534(nogroup)

# now try to add a network device
# this will work as now we have sudo privileges
root@d7e5dc06581c:~# ip link add type veth


# verify that network device was created 
root@d7e5dc06581c:~# ip link show
1: lo: <LOOPBACK> mtu 65536 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: veth0@veth1: <BROADCAST,MULTICAST,M-DOWN> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether 3a:b8:1b:3c:2b:bd brd ff:ff:ff:ff:ff:ff
3: veth1@veth0: <BROADCAST,MULTICAST,M-DOWN> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether 46:5f:85:1b:af:55 brd ff:ff:ff:ff:ff:ff

# exit out of the user namespace, so that it is terminated
root@d7e5dc06581c:~# exit
logout


# verify that we are back to parent user namespace
# note that at this point, since we have exited out of the child namespace, it is not technically a parent namespace # anymore
cloud_user@d7e5dc06581c:~$ id
uid=1001(cloud_user) gid=1001(cloud_user) groups=1001(cloud_user),27(sudo)


# verify the network devices present now
# note that as soon as a namespace is terminated, all associated processes will also be terminated. cloud_user@d7e5dc06581c:~$ ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: ens5: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9001 qdisc mq state UP mode DEFAULT group default qlen 1000
    link/ether 02:aa:b2:d6:d1:8e brd ff:ff:ff:ff:ff:ff

**Not all about Containers…or Is it?**

Containers have become a dicey term when we talk about namespaces. As far as linux is concerned, a set of process running isolated can be termed as containers. And for the lack of better word, containers are known as containers in the DevOps world. However, the namespaces and unsharing is not meant only for containers in the DevOps world, it eventually enables lot of other security enhancements in linux world, which were previously not possible. Many individuals and organizations have already built proprietary and/or open-source tooling using this feature and many are in the process of building. One of the prominent examples is _[flatpak](https://www.flatpak.org/)_



# links
[Read on Omnivore](https://omnivore.app/me/unsharing-is-caring-user-namespace-rootless-containers-and-secur-18cf12b5b60)
[Read Original](https://mohitgoyal.co/2021/04/20/unsharing-is-caring-user-namespace-rootless-containers-and-security/)

<iframe src="https://mohitgoyal.co/2021/04/20/unsharing-is-caring-user-namespace-rootless-containers-and-security/"  width="800" height="500"></iframe>
