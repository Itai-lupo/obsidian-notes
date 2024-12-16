---
id: 0872c488-6a10-11ee-ae6c-6b0d288e7115
title: fstab - ArchWiki
tags:
  - fs
  - linux
date: 2023-10-17 01:37:35
words_count: 2067
state: COMPLETED
---

# fstab - ArchWiki by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> The fstab(5) file can be used to define how disk partitions, various other block devices, or remote file systems should be mounted into the file system.


# content

The [fstab(5)](https://man.archlinux.org/man/fstab.5) file can be used to define how disk partitions, various other block devices, or remote file systems should be mounted into the file system.

Each file system is described in a separate line. These definitions will be converted into [systemd](https://wiki.archlinux.org/title/Systemd "Systemd") mount units dynamically at boot, and when the configuration of the system manager is reloaded. The default setup will automatically [fsck](https://wiki.archlinux.org/title/Fsck "Fsck") and mount file systems before starting services that need them to be mounted. For example, systemd automatically makes sure that remote file system mounts like [NFS](https://wiki.archlinux.org/title/NFS "NFS") or [Samba](https://wiki.archlinux.org/title/Samba "Samba") are only started after the network has been set up. Therefore, local and remote file system mounts specified in `/etc/fstab` should work out-of-the-box. See [systemd.mount(5)](https://man.archlinux.org/man/systemd.mount.5) for details.

The `mount` command will use fstab, if just one of either directory or device is given, to fill in the value for the other parameter. When doing so, mount options which are listed in fstab will also be used.

## Usage

A simple `/etc/fstab`, using file system UUIDs:

/etc/fstab

# \\<device\\>                                \\<dir\\> \\<type\\> \\<options\\> \\<dump\\> \\<fsck\\>
UUID=0a3407de-014b-458b-b5c1-848e92a327a3 /     ext4   defaults  0      1
UUID=f9fe0b69-a280-415d-a03a-a32752370dee none  swap   defaults  0      0
UUID=b411dc99-f0a0-4c87-9e05-184977be8539 /home ext4   defaults  0      2

* `\\<device\\>` describes the block special device or remote file system to be mounted; see [#Identifying file systems](#Identifying%5Ffile%5Fsystems).
* `\\<dir\\>` describes the [mount](https://wiki.archlinux.org/title/Mount "Mount") directory.
* `\\<type\\>` the [file system](https://wiki.archlinux.org/title/File%5Fsystem "File system") type.
* `\\<options\\>` the associated mount options; see [mount(8) § FILESYSTEM-INDEPENDENT MOUNT OPTIONS](https://man.archlinux.org/man/mount.8#FILESYSTEM-INDEPENDENT%5FMOUNT%5FOPTIONS) and [ext4(5) § Mount options for ext4](https://man.archlinux.org/man/ext4.5#Mount%5Foptions%5Ffor%5Fext4).
* `\\<dump\\>` is checked by the [dump(8)](https://linux.die.net/man/8/dump) utility. This field is usually set to `0`, which disables the check.
* `\\<fsck\\>` sets the order for file system checks at boot time; see [fsck(8)](https://man.archlinux.org/man/fsck.8). For the root device it should be `1`. For other partitions it should be `2`, or `0` to disable checking.

**Tip:**

* The `auto` type lets the mount command guess what type of file system is used. This is useful for [optical media](https://wiki.archlinux.org/title/Optical%5Fdisc%5Fdrive "Optical disc drive") (CD/DVD/Blu-ray).
* If the root file system is [btrfs](https://wiki.archlinux.org/title/Btrfs "Btrfs") or [XFS](https://wiki.archlinux.org/title/XFS "XFS"), the fsck order should be set to `0` instead of `1`. See [fsck.btrfs(8)](https://man.archlinux.org/man/fsck.btrfs.8) and [fsck.xfs(8)](https://man.archlinux.org/man/fsck.xfs.8).

All specified devices within `/etc/fstab` will be automatically mounted on startup and when the `-a` flag is used with [mount(8)](https://man.archlinux.org/man/mount.8) unless the `noauto` option is specified. Devices that are listed and not present will result in an error unless the `nofail` option is used.

See [fstab(5) § DESCRIPTION](https://man.archlinux.org/man/fstab.5#DESCRIPTION) for details.

## Identifying file systems

[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)**This article or section needs expansion.**[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)

**Reason:** There are more device paths than just kernel name descriptors. `/dev/disk/by-*/*`, `/dev/mapper/*`, `/dev/md/*` have various levels of persistence and there should be no issue using them. (Discuss in [Talk:Fstab](https://wiki.archlinux.org/title/Talk:Fstab))

There are different ways to identify file systems that will be mounted in `/etc/fstab`: kernel name descriptor, file system label and UUID, and GPT partition label and UUID for GPT disks. Kernel name descriptors should not be used, while UUIDs or PARTUUIDs should be preferred over labels. See [Persistent block device naming](https://wiki.archlinux.org/title/Persistent%5Fblock%5Fdevice%5Fnaming "Persistent block device naming") for more explanations. It is recommended to read that article first before continuing with this article.

In this section, we will describe how to mount file systems using all the mount methods available via examples. The output of the commands `lsblk -f` and `blkid` used in the following examples are available in the article [Persistent block device naming](https://wiki.archlinux.org/title/Persistent%5Fblock%5Fdevice%5Fnaming "Persistent block device naming").

### Kernel name descriptors

Run `lsblk -f` to list the partitions and prefix the values in the _NAME_ column with `/dev/`.

/etc/fstab

# \\<device\\>        \\<dir\\>        \\<type\\>        \\<options\\>        \\<dump\\> \\<fsck\\>
/dev/sda1         /boot        vfat          defaults         0      2
/dev/sda2         /            ext4          defaults         0      1
/dev/sda3         /home        ext4          defaults         0      2
/dev/sda4         none         swap          defaults         0      0

### File system labels

Run `lsblk -f` to list the partitions, and prefix the values in the [LABEL](https://wiki.archlinux.org/title/LABEL "LABEL") column with `LABEL=` or alternatively run `blkid` and use the LABEL values without the quotes:

/etc/fstab

# \\<device\\>        \\<dir\\>        \\<type\\>        \\<options\\>        \\<dump\\> \\<fsck\\>
LABEL=ESP         /boot        vfat          defaults         0      2
LABEL=System      /            ext4          defaults         0      1
LABEL=Data        /home        ext4          defaults         0      2
LABEL=Swap        none         swap          defaults         0      0

**Note:** If any of your fields contains spaces, see [#Filepath spaces](#Filepath%5Fspaces).

### File system UUIDs

Run `lsblk -f` to list the partitions, and prefix the values in the [UUID](https://wiki.archlinux.org/title/UUID "UUID") column with `UUID=` or alternatively run `blkid` and use the UUID values without the quotes:

/etc/fstab

# \\<device\\>                                \\<dir\\> \\<type\\> \\<options\\> \\<dump\\> \\<fsck\\>
UUID=CBB6-24F2                            /boot vfat   defaults  0      2
UUID=0a3407de-014b-458b-b5c1-848e92a327a3 /     ext4   defaults  0      1
UUID=b411dc99-f0a0-4c87-9e05-184977be8539 /home ext4   defaults  0      2
UUID=f9fe0b69-a280-415d-a03a-a32752370dee none  swap   defaults  0      0

### GPT partition labels

Run `blkid` to list the partitions, and use the [PARTLABEL](https://wiki.archlinux.org/title/PARTLABEL "PARTLABEL") values without the quotes:

/etc/fstab

# \\<device\\>                           \\<dir\\> \\<type\\> \\<options\\> \\<dump\\> \\<fsck\\>
PARTLABEL=EFI\040system\040partition /boot vfat   defaults  0      2
PARTLABEL=GNU/Linux                  /     ext4   defaults  0      1
PARTLABEL=Home                       /home ext4   defaults  0      2
PARTLABEL=Swap                       none  swap   defaults  0      0

**Note:** If any of your fields contains spaces, see [#Filepath spaces](#Filepath%5Fspaces).

### GPT partition UUIDs

Run `blkid` to list the partitions, and use the [PARTUUID](https://wiki.archlinux.org/title/PARTUUID "PARTUUID") values without the quotes:

/etc/fstab

# \\<device\\>                                    \\<dir\\> \\<type\\> \\<options\\> \\<dump\\> \\<fsck\\>
PARTUUID=d0d0d110-0a71-4ed6-936a-304969ea36af /boot vfat   defaults  0      2
PARTUUID=98a81274-10f7-40db-872a-03df048df366 /     ext4   defaults  0      1
PARTUUID=7280201c-fc5d-40f2-a9b2-466611d3d49e /home ext4   defaults  0      2
PARTUUID=039b6c1c-7553-4455-9537-1befbc9fbc5b none  swap   defaults  0      0

## Tips and tricks

### Automount with systemd

See [systemd.mount(5)](https://man.archlinux.org/man/systemd.mount.5) for all systemd mount options.

#### Local partition

In case of a large partition, it may be more efficient to allow services that do not depend on it to start while it is checked by _fsck_. This can be achieved by adding the following options to the `/etc/fstab` entry of the partition:

x-systemd.automount

This will fsck and mount the partition only when it is first accessed, and the kernel will buffer all file access to it until it is ready. This method can be relevant if one has, for example, a significantly large `/home` partition.

**Note:** This will make the file system type `autofs` which is ignored by [mlocate](https://wiki.archlinux.org/title/Mlocate "Mlocate") by default.

#### Remote file system

The same applies to remote file system mounts. If you want them to be mounted only upon access, you will need to use the `x-systemd.automount` parameters. In addition, you can use the `x-systemd.mount-timeout=` option to specify how long systemd should wait for the mount command to finish. Also, the `_netdev` option ensures systemd understands that the mount is network dependent and order it after the network is online.

x-systemd.automount,x-systemd.mount-timeout=30,_netdev

#### Encrypted file system

If you have encrypted file systems with keyfiles, you can also add the `noauto` parameter to the corresponding entries in `/etc/crypttab`. _systemd_ will then not open the encrypted device on boot, but instead wait until it is actually accessed and then automatically open it with the specified keyfile before mounting it. This might save a few seconds on boot if you are using an encrypted RAID device for example, because systemd does not have to wait for the device to become available. For example:

/etc/crypttab

data /dev/md/MyRAIDArray /etc/cryptsetup-keys.d/data.key noauto

#### Automatic unmount

You may also specify an idle timeout for a mount with the `x-systemd.idle-timeout` flag. For example:

x-systemd.automount,x-systemd.idle-timeout=1min

This will make systemd unmount the mount after it has been idle for 1 minute.

### External devices

External devices that are to be mounted when present but ignored if absent may require the `nofail` option. This prevents errors being reported at boot. For example: 

/etc/fstab

LABEL=MyExternalDrive /media/backup    jfs    nofail,x-systemd.device-timeout=5    0  2

The `nofail` option is best combined with the `x-systemd.device-timeout` option. This is because the default device timeout is 90 seconds, so a disconnected external device with only `nofail` will make your boot take 90 seconds longer, unless you reconfigure the timeout as shown. Make sure not to set the timeout to 0, as this translates to infinite timeout.

### Filepath spaces

Since spaces are used in `fstab` to delimit fields, if any field (_PARTLABEL_, _LABEL_ or the mount point) contains spaces, these spaces must be replaced by escape characters `\` followed by the 3 digit octal code `040`:

/etc/fstab

UUID=47FA-4071         /home/username/Camera\040Pictures   vfat  defaults      0  0
LABEL=Storage\040drive /media/100\040GB\040(Storage)       ext4  defaults,user 0  2

### atime options

Below atime options can impact drive performance.

* The `strictatime` option updates the access time of the files every time they are accessed. This is more purposeful when Linux is used for servers; it does not have much value for desktop use. The drawback about the `strictatime` option is that even reading a file from the page cache (reading from memory instead of the drive) will still result in a write.
* The `noatime` option fully disables writing file access times to the drive every time you read a file. This works well for almost all applications, except for those that need to know if a file has been read since the last time it was modified. The write time information to a file will continue to be updated anytime the file is written to with this option enabled.
* The `nodiratime` option disables the writing of file access times only for directories while other files still get access times written.
* `relatime` updates the access time only if the previous access time was earlier than the current modify or change time. In addition, since Linux 2.6.30, the access time is always updated if the previous access time was more than 24 hours old. This option is used when the `defaults` option, `atime` option (which means to use the kernel default, which is `relatime`; see [mount(8)](https://man.archlinux.org/man/mount.8) and [wikipedia:Stat (system call)#Criticism of atime](https://en.wikipedia.org/wiki/Stat%5F%28system%5Fcall%29#Criticism%5Fof%5Fatime "wikipedia:Stat (system call)")) or no options at all are specified.

When using [Mutt](https://wiki.archlinux.org/title/Mutt "Mutt") or other applications that need to know if a file has been read since the last time it was modified, the `noatime` option should not be used; using the `relatime` option is acceptable and still provides a performance improvement.

Since kernel 4.0 there is another related option:

* `lazytime` reduces writes to disk by maintaining changes to inode timestamps (access, modification and creation times) only in memory. The on-disk timestamps are updated only when either (1) the file inode needs to be updated for some change unrelated to file timestamps, (2) a sync to disk occurs, (3) an undeleted inode is evicted from memory or (4) if more than 24 hours passed since the last time the in-memory copy was written to disk.

**Warning:** In the event of a system crash, the access and modification times on disk might be out of date by up to 24 hours.

Note that the `lazytime` option works **in combination** with the aforementioned `*atime` options, not as an alternative. That is `relatime` by default, but can be even `strictatime` with the same or less cost of disk writes as the plain `relatime` option.

### Remounting the root partition

If for some reason the root partition has been improperly mounted read only, remount the root partition with read-write access with the following command:

# mount -o remount,rw /

### GPT partition automounting

When using UEFI/GPT, it is possible to omit certain partitions from `/etc/fstab` by partitioning according to the [Discoverable Partitions Specification](https://uapi-group.org/specifications/specs/discoverable%5Fpartitions%5Fspecification/) and have [systemd-gpt-auto-generator(8)](https://man.archlinux.org/man/systemd-gpt-auto-generator.8) mount the partitions. See [systemd#GPT partition automounting](https://wiki.archlinux.org/title/Systemd#GPT%5Fpartition%5Fautomounting "Systemd").

### Bind mount

You can link directories with the `bind` option:

/etc/fstab

# \\<device\\>                             \\<dir\\>                         \\<type\\> \\<options\\>     \\<dump\\> \\<fsck\\>
UUID=94649E22649E06E0                  /media/user/OS/               ntfs    defaults,rw,errors=remount-ro  0  0
/media/user/OS/Users/user/Music/       /home/user/Music/             none    defaults,bind 0   0
/media/user/OS/Users/user/Pictures/    /home/user/Pictures/          none    defaults,bind 0   0
/media/user/OS/Users/user/Videos/      /home/user/Videos/            none    defaults,bind 0   0
/media/user/OS/Users/user/Downloads/   /home/user/Downloads/         none    defaults,bind 0   0
/media/user/OS/Users/user/Documents/   /home/user/Documents/         none    defaults,bind 0   0
/media/user/OS/Users/user/projects/    /home/user/projects/windows/  none    defaults,bind 0   0

See [mount(8) § Bind mount operation](https://man.archlinux.org/man/mount.8#Bind%5Fmount%5Foperation) for details.

### Automatically generate an fstab using genfstab

You can use the _genfstab_ tool to create an fstab file. See [genfstab](https://wiki.archlinux.org/title/Genfstab "Genfstab") for details.

## See also

* [Full device listing including block device](https://docs.kernel.org/admin-guide/devices.html)
* [Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS%5F3.0/fhs/index.html)
* [30x Faster Cache and Site Speed with TMPFS](https://www.askapache.com/optimize/super-speed-secrets/)



# links
[Read on Omnivore](https://omnivore.app/me/fstab-arch-wiki-18b3aa330ca)
[Read Original](https://wiki.archlinux.org/title/fstab)

<iframe src="https://wiki.archlinux.org/title/fstab"  width="800" height="500"></iframe>
