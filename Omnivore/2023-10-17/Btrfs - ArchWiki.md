---
id: 6e856bd4-6c74-11ee-87bf-db6f5da8c6b9
title: Btrfs - ArchWiki
tags:
  - linux
  - fs
date: 2023-10-17 01:36:43
words_count: 6583
state: INBOX
---

# Btrfs - ArchWiki by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> From the Btrfs Documentation:


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
From the [Btrfs Documentation](https://btrfs.readthedocs.io/en/latest/Introduction.html):

Btrfs is a modern copy on write (COW) file system for Linux aimed at implementing advanced features while also focusing on fault tolerance, repair and easy administration.

**Note:** Like some other file systems, Btrfs is under continuous development. This means that specific features may not be ready for everyday use yet. To see if your use case might be affected, check the Btrfs Documentation’s [Status](https://btrfs.readthedocs.io/en/latest/Status.html) and the [#Known issues](#Known%5Fissues) section of this article.

## Preparation

For user space utilities, [install](https://wiki.archlinux.org/title/Install "Install") the [btrfs-progs](https://archlinux.org/packages/?name=btrfs-progs) package that is required for basic operations.

If you need to boot from a Btrfs file system (i.e., your kernel and initramfs reside on a Btrfs partition), check if your [boot loader](https://wiki.archlinux.org/title/Boot%5Floader "Boot loader") supports Btrfs.

## File system creation

The following shows how to create a new Btrfs [file system](https://wiki.archlinux.org/title/File%5Fsystem "File system"). To convert an Ext3/4 partition to Btrfs, see [#Ext3/4 to Btrfs conversion](#Ext3/4%5Fto%5FBtrfs%5Fconversion). To use a partitionless setup, see [#Partitionless Btrfs disk](#Partitionless%5FBtrfs%5Fdisk).

See [mkfs.btrfs(8)](https://man.archlinux.org/man/mkfs.btrfs.8) for more information.

### File system on a single device

To create a Btrfs file system on partition `/dev/partition`:

# mkfs.btrfs -L _mylabel_ /dev/_partition_

The Btrfs default nodesize for metadata is 16 KiB, while the default sectorsize for data is equal to page size and autodetected. To use a larger nodesize for metadata (must be a multiple of sectorsize, up to 64 KiB is allowed), specify a value for the `nodesize` via the `-n` switch as shown in this example using 32 KiB blocks:

# mkfs.btrfs -L _mylabel_ -n 32k /dev/_partition_

**Note:** According to [mkfs.btrfs(8) § OPTIONS](https://man.archlinux.org/man/mkfs.btrfs.8#OPTIONS), "\[a\] smaller node size increases fragmentation but leads to taller b-trees which in turn leads to lower locking contention. Higher node sizes give better packing and less fragmentation at the cost of more expensive memory operations while updating the metadata blocks".

### Multi-device file system

Multiple devices can be used to create a RAID. Supported RAID levels include RAID 0, RAID 1, RAID 10, RAID 5 and RAID 6\. Starting from kernel 5.5 RAID1c3 and RAID1c4 for 3- and 4- copies of RAID 1 level. The RAID levels can be configured separately for data and metadata using the `-d` and `-m` options respectively. By default, the data has one copy (`single`) and the metadata is mirrored (`raid1`). This is similar to creating a [JBOD configuration](https://en.wikipedia.org/wiki/JBOD "w:JBOD"), where disks are seen as one file system, but files are not duplicated. See [Using Btrfs with Multiple Devices](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/Using%5FBtrfs%5Fwith%5FMultiple%5FDevices.html) for more information about how to create a Btrfs RAID volume.

# mkfs.btrfs -d single -m raid1 /dev/_part1_ /dev/_part2_ ...

You must include either the `udev` hook, `systemd` hook or the `btrfs` hook in `/etc/mkinitcpio.conf` in order to use multiple Btrfs devices in a pool. See the [Mkinitcpio#Common hooks](https://wiki.archlinux.org/title/Mkinitcpio#Common%5Fhooks "Mkinitcpio") article for more information.

**Note:**

* It is possible to add devices to a multiple-device file system later on. See the [Btrfs wiki article](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/Using%5FBtrfs%5Fwith%5FMultiple%5FDevices.html) for more information.
* Devices can be of different sizes. However, if one drive in a RAID configuration is bigger than the others, this extra space will not be used.
* Some [boot loaders](https://wiki.archlinux.org/title/Boot%5Floader "Boot loader") such as [Syslinux](https://wiki.archlinux.org/title/Syslinux "Syslinux") do not support multi-device file systems.
* Btrfs does not automatically read from the fastest device, so mixing different kinds of disks results in inconsistent performance. See [\[1\]](https://stackoverflow.com/a/55408367) for details.

See <#RAID> for advice on maintenance specific to multi-device Btrfs file systems.

## Configuring the file system

### Copy-on-Write (CoW)

By default, Btrfs uses [copy-on-write](https://en.wikipedia.org/wiki/copy-on-write "wikipedia:copy-on-write") for all files all the time. Writes do not overwrite data in place; instead, a modified copy of the block is written to a new location, and metadata is updated to point at the new location. See the [Btrfs Sysadmin Guide section](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/SysadminGuide.html#Copy%5Fon%5FWrite%5F.28CoW.29) for implementation details, as well as advantages and disadvantages.

#### Disabling CoW

**Warning:** Disabling CoW in Btrfs also disables checksums. Btrfs will not be able to detect corrupted `nodatacow` files. When combined with RAID 1, power outages or other sources of corruption can cause the data to become out of sync.

To disable copy-on-write for newly created files in a mounted subvolume, use the `nodatacow` mount option. This will only affect newly created files. Copy-on-write will still happen for existing files. The `nodatacow` option also disables compression. See [btrfs(5)](https://man.archlinux.org/man/btrfs.5) for details.

**Note:** From [btrfs(5) § MOUNT OPTIONS](https://man.archlinux.org/man/btrfs.5#MOUNT%5FOPTIONS):

within a single file system, it is not possible to mount some subvolumes with `nodatacow` and others with `datacow`. The mount option of the first mounted subvolume applies to any other subvolumes.

To disable copy-on-write for single files/directories, do:

$ chattr +C _/dir/file_

This will disable copy-on-write for those operation in which there is only one reference to the file. If there is more than one reference, e.g. due to file clones or lightweight clones or file system snapshots, copy-on-write still occurs. Note that as of [coreutils](https://archlinux.org/packages/?name=coreutils) 9.0, `cp` attempts to perform lightweight copies by default — see [cp(1)](https://man.archlinux.org/man/cp.1) for more details.

**Note:** From [chattr(1)](https://man.archlinux.org/man/chattr.1):

For Btrfs, the '`C`' flag should be set on new or empty files. If it is set on a file which already has data blocks, it is undefined when the blocks assigned to the file will be fully stable. If the '`C`' flag is set on a directory, it will have no effect on the directory, but new files created in that directory will have the `No_COW` attribute.

**Tip:** In accordance with the note above, you can use the following trick to disable copy-on-write on existing files in a directory:

$ mv _/path/to/dir_ _/path/to/dir__old
$ mkdir _/path/to/dir_
$ chattr +C _/path/to/dir_
$ cp -a --reflink=never _/path/to/dir__old/. _/path/to/dir_
$ rm -rf _/path/to/dir__old

Make sure that the data are not used during this process. Also note that `mv` or `cp` without `--reflink=never` as described below will not work.

##### Effect on snapshots

If a file has copy-on-write disabled (NOCOW) and a [snapshot](#Snapshots) is taken, the first write to a file block after the snapshot [will be a COW operation](https://www.spinics.net/lists/linux-btrfs/msg33090.html) because the snapshot locks the old file blocks in place. However, the file will retain the NOCOW attribute and any subsequent writes to the same file block will be in-place until the next snapshot.

Frequent snapshots can reduce the effectiveness of NOCOW, as COW is still required on the first write. To avoid copy-on-write for such files altogether, put them in a separate subvolume and do not take snapshots of that subvolume.

### Compression

Btrfs supports [transparent and automatic compression](https://btrfs.readthedocs.io/en/latest/Compression.html). This reduces the size of files as well as significantly increases the lifespan of flash-based media by reducing write amplification. See [Fedora:Changes/BtrfsByDefault#Compression](https://fedoraproject.org/wiki/Changes/BtrfsByDefault#Compression "fedora:Changes/BtrfsByDefault"), [\[2\]](https://lists.fedoraproject.org/archives/list/devel@lists.fedoraproject.org/message/NTV77NFF6NDZM3QTPUM2TQZ5PCM6GOO2/), and [\[3\]](https://pagure.io/fedora-btrfs/project/issue/36#comment-701551). It can also [improve performance](https://www.phoronix.com/scan.php?page=article&item=btrfs%5Fcompress%5F2635&num=1), in some cases (e.g. single thread with heavy file I/O), while obviously harming performance in other cases (e.g. multi-threaded and/or CPU intensive tasks with large file I/O). Better performance is generally achieved with the fastest compress algorithms, _zstd_ and _lzo_, and some [benchmarks](https://www.phoronix.com/scan.php?page=article&item=btrfs-zstd-compress) provide detailed comparisons.

LZO has a fixed compression level, whereas zlib and zstd have a range of levels from 1 (low compression) to 9 (zlib) or 15 (zstd); see [btrfs(5) § COMPRESSION](https://man.archlinux.org/man/btrfs.5#COMPRESSION). Changing the levels will affect CPU and I/O throughput differently, so they should be checked / benchmarked before and after changing.

The `compress=alg[:level]` mount option enables automatically considering every file for compression, where `alg` is either `zlib`, `lzo`, `zstd`, or `no` (for no compression). Using this option, Btrfs will check if compressing the first portion of the data shrinks it. If it does, the entire write to that file will be compressed. If it does not, none of it is compressed. With this option, if the first portion of the write does not shrink, no compression will be applied to the write even if the rest of the data would shrink tremendously. [\[4\]](https://btrfs.readthedocs.io/en/latest/Compression.html#incompressible-data) This is done to prevent making the disk wait to start writing until all of the data to be written is fully given to Btrfs and compressed.

[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)**This article or section needs expansion.**[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)

**Reason:** Missing reference for the "empirical testing" mentioned in the following paragraph. (Discuss in [Talk:Btrfs](https://wiki.archlinux.org/title/Talk:Btrfs))

The `compress-force=alg[:level]` mount option can be used instead, which makes Btrfs skip checking if compression shrinks the first portion, and enables automatic compression try for every file. In a worst-case scenario, this can cause (slightly) more CPU usage for no purpose. However, empirical testing on multiple mixed-use systems showed a significant improvement of about 10% disk compression from using `compress-force=zstd` over just `compress=zstd`, which also had 10% disk compression. However, keep in mind that forcing compression is against [official Btrfs guidelines](https://btrfs.readthedocs.io/en/latest/Compression.html#incompressible-data).

Only files created or modified after the mount option is added will be compressed.

To apply compression to existing files, use the `btrfs filesystem defragment -calg` command, where `alg` is either `zlib`, `lzo` or `zstd`. For example, in order to re-compress the whole file system with [zstd](https://archlinux.org/packages/?name=zstd), run the following command:

# btrfs filesystem defragment -r -v -czstd /

**Warning:** Defragmenting a file which has a COW copy (either a snapshot copy or one made with `cp` or bcp) plus using the `-c` switch with a compression algorithm may result in two unrelated files effectively increasing the disk usage.

To enable compression when installing Arch to an empty Btrfs partition, use the `compress` option when [mounting](https://wiki.archlinux.org/title/Mounting "Mounting") the file system: `mount -o compress=zstd /dev/sdxY /mnt/`. During configuration, add `compress=zstd` to the mount options of the root file system in [fstab](https://wiki.archlinux.org/title/Fstab "Fstab").

**Tip:** Compression can also be enabled per-file without using the `compress` mount option; to do so, apply `chattr +c` to the file. When applied to directories, it will cause new files to be automatically compressed as they come.

**Warning:**

* Systems using older kernels or [btrfs-progs](https://archlinux.org/packages/?name=btrfs-progs) without `zstd` support may be unable to read or repair your file system if you use this option.
* [GRUB](https://wiki.archlinux.org/title/GRUB "GRUB") introduced _zstd_ support in 2.04\. Make sure you have actually upgraded the bootloader installed in your MBR/ESP since then, by running `grub-install` with the appropriate options for your BIOS/UEFI setup, since that is not done automatically. See [FS#63235](https://bugs.archlinux.org/task/63235).

#### View compression types and ratios

[compsize](https://archlinux.org/packages/?name=compsize) takes a list of files (or an entire Btrfs file system) and measures compression types used and effective compression ratios. Uncompressed size may not match the number given by other programs such as [du(1)](https://man.archlinux.org/man/du.1), because every extent is counted once, even if it is reflinked several times, and even if a part of it is no longer used anywhere but has not been garbage collected. The `-x` option keeps it on a single file system, which is useful in situations like `compsize -x /` to avoid it from attempting to look in non-Btrfs subdirectories and fail the entire run.

### Subvolumes

"A Btrfs subvolume is not a block device (and cannot be treated as one) instead, a btrfs subvolume can be thought of as a POSIX file namespace. This namespace can be accessed via the top-level subvolume of the file system, or it can be mounted in its own right." [\[5\]](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/SysadminGuide.html#Subvolumes) 

Each Btrfs file system has a top-level subvolume with ID 5\. It can be mounted as `/` (by default), or another subvolume can be [mounted](#Mounting%5Fsubvolumes) instead. Subvolumes can be moved around in the file system and are rather identified by their id than their path.

A major use case for subvolumes are [snapshots](#Snapshots).

See the following links for more details:

* [Btrfs Documentation](https://btrfs.readthedocs.io/en/latest/Subvolumes.html)
* [Btrfs Wiki SysadminGuide#Subvolumes](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/SysadminGuide.html#Subvolumes)
* [Btrfs Wiki Trees](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/Trees.html)

#### Creating a subvolume

To create a subvolume, the Btrfs file system must be mounted. The subvolume's name is set using the last argument.

# btrfs subvolume create _/path/to/subvolume_

#### Listing subvolumes

To see a list of current subvolumes and their ids under `path`:

# btrfs subvolume list -p _path_

#### Deleting a subvolume

To delete a subvolume:

# btrfs subvolume delete _/path/to/subvolume_

Alternatively, a subvolume can be deleted like a regular directory (`rm -r`, `rmdir`).

#### Mounting subvolumes

Subvolumes can be mounted like file system partitions using the `subvol=/path/to/subvolume` or `subvolid=objectid` mount flags. For example, you could have a subvolume named `subvol_root` and mount it as `/`. One can mimic traditional file system partitions by creating various subvolumes under the top level of the file system and then mounting them at the appropriate mount points. It is preferable to mount using `subvol=/path/to/subvolume`, rather than the subvolid, as the subvolid may change when restoring <#Snapshots>, requiring a change of mount configuration.

**Tip:** Changing subvolume layouts is made simpler by not using the top-level subvolume (ID=5) as `/` (which is done by default). Instead, consider creating a subvolume to house your actual data and mounting it as `/`.

**Note:** From [btrfs(5) § MOUNT OPTIONS](https://man.archlinux.org/man/btrfs.5#MOUNT%5FOPTIONS):

Most mount options apply to the **whole file system**, and only the options for the first subvolume to be mounted will take effect. This is due to lack of implementation and may change in the future.

See the [Btrfs Wiki FAQ](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/FAQ.html#Can%5FI%5Fmount%5Fsubvolumes%5Fwith%5Fdifferent%5Fmount%5Foptions.3F) for which mount options can be used per subvolume.

See [Snapper#Suggested filesystem layout](https://wiki.archlinux.org/title/Snapper#Suggested%5Ffilesystem%5Flayout "Snapper"), [Btrfs SysadminGuide#Managing Snapshots](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/SysadminGuide.html#Managing%5FSnapshots), and [SysadminGuide#Layout](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/SysadminGuide.html#Layout) for example file system layouts using subvolumes.

See [btrfs(5)](https://man.archlinux.org/man/btrfs.5) for a full list of Btrfs-specific mount options.

#### Mounting subvolume as root

To use a subvolume as the root mountpoint, either make it the [default subvolume](#Changing%5Fthe%5Fdefault%5Fsub-volume), or specify the subvolume via a [kernel parameter](https://wiki.archlinux.org/title/Kernel%5Fparameters#Configuration "Kernel parameters") using `rootflags=subvol=/path/to/subvolume`. Edit the root mountpoint in `/etc/fstab` and specify the mount option `subvol=`. Alternatively, the subvolume can be specified with its id, `rootflags=subvolid=objectid` as kernel parameter and `subvolid=objectid` as mount option in `/etc/fstab`. It is preferable to mount using `subvol=/path/to/subvolume`, rather than the subvolid, as the subvolid may change when restoring <#Snapshots>, requiring a change of mount configuration, or else the system will not boot.

#### Changing the default sub-volume

The default sub-volume is mounted if no `subvol=` mount option is provided. To change the default subvolume, do:

# btrfs subvolume set-default _subvolume-id_ /

where _subvolume-id_ can be found by [listing](#Listing%5Fsubvolumes).

**Note:** After changing the default subvolume on a system with [GRUB](https://wiki.archlinux.org/title/GRUB "GRUB"), you should run `grub-install` again to notify the bootloader of the changes. See [this forum thread](https://bbs.archlinux.org/viewtopic.php?pid=1615373).

Changing the default subvolume with `btrfs subvolume set-default` will make the top level of the file system inaccessible, except by use of the `subvol=/` or `subvolid=5` mount options [\[6\]](https://btrfs.readthedocs.io/en/latest/Administration.html).

### Quota

**Warning:** Qgroup is not stable yet and combining quota with (too many) snapshots of subvolumes can cause performance problems, for example when deleting snapshots. Plus there are several more [known issues](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/Quota%5Fsupport.html#Known%5Fissues).

Quota support in Btrfs is implemented at a subvolume level by the use of quota groups or qgroup: Each subvolume is assigned a quota groups in the form of _0/subvolume\_id_ by default. However, it is possible to create a quota group using any number if desired.

To use qgroups, you need to enable quota first using

# btrfs quota enable _path_

From this point onwards, newly created subvolumes will be controlled by those groups. In order to retrospectively enable them for already existing subvolumes, enable quota normally, then create a qgroup (quota group) for each of those subvolume using their _subvolume\_id_ and rescan them:

# btrfs subvolume list _path_ | cut -d' ' -f2 | xargs -I{} -n1 btrfs qgroup create 0/{} _path_
# btrfs quota rescan _path_

Quota groups in Btrfs form a tree hierarchy, whereby qgroups are attached to subvolumes. The size limits are set per qgroup and apply when any limit is reached in tree that contains a given subvolume.

Limits on quota groups can be applied either to the total data usage, un-shared data usage, compressed data usage or both. File copy and file deletion may both affect limits since the unshared limit of another qgroup can change if the original volume's files are deleted and only one copy is remaining. For example, a fresh snapshot shares almost all the blocks with the original subvolume, new writes to either subvolume will raise towards the exclusive limit, deletions of common data in one volume raises towards the exclusive limit in the other one.

To apply a limit to a qgroup, use the command `btrfs qgroup limit`. Depending on your usage, either use a total limit, unshared limit (`-e`) or compressed limit (`-c`). To show usage and limits for a given path within a file system, use

# btrfs qgroup show -reF _path_

### Commit interval

The resolution at which data are written to the file system is dictated by Btrfs itself and by system-wide settings. Btrfs defaults to a 30 seconds checkpoint interval in which new data are committed to the file system. This can be changed by appending the `commit` mount option in `/etc/fstab` for the Btrfs partition.

LABEL=arch64 / btrfs defaults,compress=zstd,commit=120 0 0

System-wide settings also affect commit intervals. They include the files under `/proc/sys/vm/*` and are out-of-scope of this wiki article. The kernel documentation for them is available at <https://docs.kernel.org/admin-guide/sysctl/vm.html>.

### SSD TRIM

A Btrfs file system is able to free unused blocks from an SSD drive supporting the TRIM command. Asynchronous discard support is available with mount option `discard=async`, and is enabled by default as of [linux](https://archlinux.org/packages/?name=linux) 6.2\. Freed extents are not discarded immediately, but grouped together and trimmed later by a separate worker thread, improving commit latency. 

Asynchronous discard can safely be used alongside periodic trim [\[7\]](https://lists.fedoraproject.org/archives/list/devel@lists.fedoraproject.org/thread/MLZIPQUXMJFRVSFJS6B2ACDKTYNSX3AX/).

More information about enabling and using TRIM can be found in [Solid State Drives#TRIM](https://wiki.archlinux.org/title/Solid%5FState%5FDrives#TRIM "Solid State Drives").

## Usage

### Swap file

**Note:** Swap files on file systems spanning multiple devices are not supported. See [btrfs(5) § SWAPFILE SUPPORT](https://man.archlinux.org/man/btrfs.5#SWAPFILE%5FSUPPORT) for all limitations.

To properly initialize a swap file, first create a _non-snapshotted_ subvolume to host the file, e.g. 

# btrfs subvolume create /swap 

**Tip:** Consider creating the subvolume directly below the top-level subvolume, e.g. `@swap`. Then, make sure the subvolume is [mounted](#Mounting%5Fsubvolumes) to `/swap` (or any other accessible location).

Create the swap file:

# btrfs filesystem mkswapfile --size 4g --uuid clear /swap/swapfile

If `--size` is omitted, the default of 2GiB is used.

Activate the swap file:

# swapon /swap/swapfile

Finally, edit the [fstab](https://wiki.archlinux.org/title/Fstab "Fstab") configuration to add an entry for the swap file:

/etc/fstab

/swap/swapfile none swap defaults 0 0

For additional information, see [fstab#Usage](https://wiki.archlinux.org/title/Fstab#Usage "Fstab").

**Note:** You can also create the swap file manually, by [setting the](#Disabling%5FCoW) `No_COW` attribute on the whole subvolume with `chattr`, then following the steps in [Swap#Swap file creation](https://wiki.archlinux.org/title/Swap#Swap%5Ffile%5Fcreation "Swap"). See [btrfs(5) § SWAPFILE SUPPORT](https://man.archlinux.org/man/btrfs.5#SWAPFILE%5FSUPPORT) for an alternative method.

Configuring hibernation to a swap file is described in [Power management/Suspend and hibernate#Hibernation into swap file](https://wiki.archlinux.org/title/Power%5Fmanagement/Suspend%5Fand%5Fhibernate#Hibernation%5Finto%5Fswap%5Ffile "Power management/Suspend and hibernate").

### Displaying used/free space

General linux userspace tools such as [df(1)](https://man.archlinux.org/man/df.1) will inaccurately report free space on a Btrfs partition. It is recommended to use `btrfs filesystem usage` to query Btrfs partitions. For example, for a full breakdown of device allocation and usage stats:

# btrfs filesystem usage /

**Note:** The `btrfs filesystem usage` command does not currently work correctly with `RAID5/RAID6` RAID levels.

Alternatively, `btrfs filesystem df` allows a quick check on usage of allocated space without the requirement to run as root:

$ btrfs filesystem df /

See [\[8\]](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/FAQ.html#How%5Fmuch%5Ffree%5Fspace%5Fdo%5FI%5Fhave.3F) for more information.

The same limitations apply to tools which analyze space usage for some subset of the file system, such as [du(1)](https://man.archlinux.org/man/du.1) or [ncdu(1)](https://man.archlinux.org/man/ncdu.1), as they do not take into account reflinks, snapshots and compression. Instead, see [btdu](https://aur.archlinux.org/packages/btdu/)AUR and [compsize](#View%5Fcompression%5Ftypes%5Fand%5Fratios) for Btrfs-aware alternatives.

### Defragmentation

Btrfs supports online defragmentation through the mount option `autodefrag`; see [btrfs(5) § MOUNT OPTIONS](https://man.archlinux.org/man/btrfs.5#MOUNT%5FOPTIONS). To manually defragment your root, use:

# btrfs filesystem defragment -r /

Using the above command without the `-r` switch will result in only the metadata held by the subvolume containing the directory being defragmented. This allows for single file defragmentation by simply specifying the path.

**Warning:** Defragmenting a file which has a COW copy (either a snapshot copy or one made with `cp` or bcp) plus using the `-c` switch with a compression algorithm may result in two unrelated files effectively increasing the disk usage.

### RAID

Btrfs offers native "RAID" for [#Multi-device file systems](#Multi-device%5Ffile%5Fsystem). Notable features which set Btrfs RAID apart from [mdadm](https://wiki.archlinux.org/title/Mdadm "Mdadm") are self-healing redundant arrays and online balancing. See [the Btrfs wiki page](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/Using%5FBtrfs%5Fwith%5FMultiple%5FDevices.html) for more information. The Btrfs sysadmin page also [has a section](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/SysadminGuide.html#RAID%5Fand%5Fdata%5Freplication) with some more technical background.

#### Scrub

[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)**This article or section needs expansion.**[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)

The [Btrfs Wiki Glossary](https://btrfs.readthedocs.io/en/latest/Glossary.html) says that Btrfs scrub is "\[a\]n online file system checking tool. Reads all the data and metadata on the file system and uses checksums and the duplicate copies from RAID storage to identify and repair any corrupt data."

**Note:** A running scrub process will prevent the system from suspending, see [this thread](https://lore.kernel.org/linux-btrfs/20140227190656.GA28338@merlins.org/) for details.

##### Start manually

To start a (background) scrub on the file system which contains `/`:

# btrfs scrub start /

To check the status of a running scrub:

# btrfs scrub status /

##### Start with a service or timer

The [btrfs-progs](https://archlinux.org/packages/?name=btrfs-progs) package brings the `btrfs-scrub@.timer` unit for monthly scrubbing the specified mountpoint. [Enable](https://wiki.archlinux.org/title/Enable "Enable") the timer with an escaped path, e.g. `btrfs-scrub@-.timer` for `/` and `btrfs-scrub@home.timer` for `/home`. You can use `systemd-escape -p /path/to/mountpoint` to escape the path; see [systemd-escape(1)](https://man.archlinux.org/man/systemd-escape.1) for details.

You can also run the scrub by [starting](https://wiki.archlinux.org/title/Starting "Starting") `btrfs-scrub@.service` (with the same encoded path). The advantage of this over `btrfs scrub` (as the root user) is that the results of the scrub will be logged in the [systemd journal](https://wiki.archlinux.org/title/Systemd%5Fjournal "Systemd journal").

On large NVMe drives with insufficient cooling (e.g. in a laptop), scrubbing can read the drive fast enough and long enough to get it very hot. If you are running scrubs with systemd, you can easily limit the rate of scrubbing with the `IOReadBandwidthMax` option described in [systemd.resource-control(5)](https://man.archlinux.org/man/systemd.resource-control.5) by using a [drop-in file](https://wiki.archlinux.org/title/Drop-in%5Ffile "Drop-in file").

#### Balance

"A balance passes all data in the file system through the allocator again. It is primarily intended to rebalance the data in the file system across the devices when a device is added or removed. A balance will regenerate missing copies for the redundant RAID levels, if a device has failed." [\[9\]](https://btrfs.readthedocs.io/en/latest/Glossary.html) See [Upstream FAQ page](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/FAQ.html#What%5Fdoes%5F.22balance.22%5Fdo.3F).

On a single-device filesystem, a balance may be also useful for (temporarily) reducing the amount of allocated but unused (meta)data chunks. Sometimes this is needed for fixing ["file system full" issues](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/FAQ.html#Help.21%5FBtrfs%5Fclaims%5FI.27m%5Fout%5Fof%5Fspace.2C%5Fbut%5Fit%5Flooks%5Flike%5FI%5Fshould%5Fhave%5Flots%5Fleft.21).

# btrfs balance start --bg /
# btrfs balance status /

### Snapshots

"A snapshot is simply a subvolume that shares its data (and metadata) with some other subvolume, using Btrfs's COW capabilities." See [Btrfs Wiki SysadminGuide#Snapshots](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/SysadminGuide.html#Snapshots) for details.

To create a snapshot:

# btrfs subvolume snapshot _source_ [_dest_/]_name_

To create a readonly snapshot, add the `-r` flag. To create a writable version of a readonly snapshot, simply create a snapshot of it.

**Note:**

* It is possible for a snapshot to be converted in-place from readonly to writeable with `btrfs property set -f -ts '/path/to/snapshot' ro false`. However, this is not recommended because it [causes issues](https://lore.kernel.org/linux-btrfs/06e92a0b-e71b-eb21-edb5-9d2a5513b718@gmail.com/) with any future incremental send/receive. Making a new writeable snapshot prevents such issues.
* Snapshots are not recursive. Every nested subvolume will be an empty directory inside the snapshot.

### Send/receive

A subvolume can be sent to stdout or a file using the `send` command. This is usually most useful when piped to a Btrfs `receive` command. For example, to send a snapshot named `/root_backup` (perhaps of a snapshot you made of `/` earlier) to `/backup`, you would do the following:

# btrfs send /root_backup | btrfs receive /backup

The snapshot that is sent _must_ be readonly. The above command is useful for copying a subvolume to an external device (e.g. a USB disk mounted at `/backup` above).

The subvolume will be created on the receiving end. It does not need to be created manually.

Another example which creates: `/mnt/arch-v2/subvolumes/@var`:

# btrfs send --proto 2 --compressed-data '/mnt/arch/snapshots/@var' | btrfs receive '/mnt/arch-v2/subvolumes/'

The parameters `--proto 2` and `--compressed-data` used in the example might be useful for more efficient sending (assumes compressed data).

You can also send only the difference between two snapshots. For example, if you have already sent a copy of `root_backup` above and have made a new readonly snapshot on your system named `root_backup_new`, then to send only the incremental difference to `/backup`, do:

# btrfs send -p /root_backup /root_backup_new | btrfs receive /backup

Now, a new subvolume named `root_backup_new` will be present in `/backup`.

See [Btrfs Wiki's Incremental Backup page](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/Incremental%5FBackup.html) and [#Incremental backup to external drive](#Incremental%5Fbackup%5Fto%5Fexternal%5Fdrive) on how to use this for incremental backups and for tools that automate the process.

### Deduplication

Using copy-on-write, Btrfs is able to copy files or whole subvolumes without actually copying the data. However, whenever a file is altered, a new _proper_ copy is created. Deduplication takes this a step further by actively identifying blocks of data which share common sequences and combining them into an extent with the same copy-on-write semantics.

Tools dedicated to deduplicate a Btrfs formatted partition include [duperemove](https://archlinux.org/packages/?name=duperemove), [bees](https://archlinux.org/packages/?name=bees), [bedup](https://aur.archlinux.org/packages/bedup/)AUR and _btrfs-dedup_. One may also want to merely deduplicate data on a file based level instead using e.g. [rmlint](https://archlinux.org/packages/?name=rmlint), [jdupes](https://aur.archlinux.org/packages/jdupes/)AUR or [dduper-git](https://aur.archlinux.org/packages/dduper-git/)AUR. For an overview of available features of those programs and additional information, have a look at the [upstream Wiki entry](https://btrfs.readthedocs.io/en/latest/Deduplication.html).

Furthermore, Btrfs developers are working on inband (also known as synchronous or inline) deduplication, meaning deduplication done when writing new data to the file system. Currently, it is still an experiment which is developed out-of-tree. Users willing to test the new feature should read the [appropriate kernel wiki page](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/User%5Fnotes%5Fon%5Fdedupe.html).

### Resizing

**Warning:** To avoid data loss, ensure that you back up your data before you begin any resizing task.

You can grow a file system to the maximum space available on the device, or specify an exact size. Ensure that you grow the size of the device or logical volume before you attempt to increase the size of the file system. When specifying an exact size for the file system on a device, either increasing or decreasing, ensure that the new size satisfies the following conditions:

* The new size must be greater than the size of the existing data; otherwise, data loss occurs.
* The new size must be equal to or less than the current device size because the file system size cannot extend beyond the space available.

**Note:** If you plan to also decrease the size of the logical volume that holds the file system, ensure that you decrease the size of the file system before you attempt to decrease the size of the device or logical volume.

To extend the file system size to the maximum available size of the device:

# btrfs filesystem resize max /

To extend the file system to a specific size:

# btrfs filesystem resize _size_ /

Replace `size` with the desired size in bytes. You can also specify units on the value, such as K (kibibytes), M (mebibytes), or G (gibibytes). Alternatively, you can specify an increase or decrease to the current size by prefixing the value with a plus (+) or a minus (-) sign, respectively:

# btrfs filesystem resize +_size_ /
# btrfs filesystem resize -_size_ /

## Known issues

A few limitations should be known before trying.

### Encryption

Btrfs has no built-in encryption support, but this [may](https://lwn.net/Articles/700487/) come in the future. Users can encrypt the partition before running `mkfs.btrfs`. See [dm-crypt/Encrypting an entire system](https://wiki.archlinux.org/title/Dm-crypt/Encrypting%5Fan%5Fentire%5Fsystem "Dm-crypt/Encrypting an entire system"). 

Existing Btrfs file systems can use something like [EncFS](https://wiki.archlinux.org/title/EncFS "EncFS") or [TrueCrypt](https://wiki.archlinux.org/title/TrueCrypt "TrueCrypt"), though perhaps without some of Btrfs features.

### btrfs check issues

The tool `btrfs check` has known issues and should not be run without further reading; see section [#btrfs check](#btrfs%5Fcheck).

## Tips and tricks

### Partitionless Btrfs disk

**Warning:** Most users do not want this type of setup and instead should install Btrfs on a regular partition. Furthermore, GRUB strongly discourages installation to a partitionless disk.

Btrfs can occupy an entire data storage device, replacing the [MBR](https://wiki.archlinux.org/title/MBR "MBR") or [GPT](https://wiki.archlinux.org/title/GPT "GPT") partitioning schemes, using [subvolumes](#Subvolumes) to simulate partitions. However, using a partitionless setup is not required to simply [create a Btrfs file system](#File%5Fsystem%5Fcreation) on an existing [partition](https://wiki.archlinux.org/title/Partition "Partition") that was created using another method. There are some limitations to partitionless single disk setups:

* Cannot place other [file systems](https://wiki.archlinux.org/title/File%5Fsystems "File systems") on another partition on the same disk.
* Due to the previous point, having an [ESP](https://wiki.archlinux.org/title/ESP "ESP") on this disk is not possible. Another device is necessary for [UEFI](https://wiki.archlinux.org/title/UEFI "UEFI") boot.

To overwrite the existing partition table with Btrfs, run the following command:

# mkfs.btrfs /dev/sd_X_

For example, use `/dev/sda` rather than `/dev/sda1`. The latter would format an existing partition instead of replacing the entire partitioning scheme. Because the root partition is Btrfs, make sure `btrfs` is compiled into the kernel, or put `btrfs` into [mkinitcpio.conf#MODULES](https://wiki.archlinux.org/title/Mkinitcpio.conf#MODULES "Mkinitcpio.conf") and [regenerate the initramfs](https://wiki.archlinux.org/title/Regenerate%5Fthe%5Finitramfs "Regenerate the initramfs").

Install the [boot loader](https://wiki.archlinux.org/title/Boot%5Floader "Boot loader") like you would for a data storage device with a [Master Boot Record](https://wiki.archlinux.org/title/Master%5FBoot%5FRecord "Master Boot Record"). See [Syslinux#Manual install](https://wiki.archlinux.org/title/Syslinux#Manual%5Finstall "Syslinux") or [GRUB/Tips and tricks#Install to partition or partitionless disk](https://wiki.archlinux.org/title/GRUB/Tips%5Fand%5Ftricks#Install%5Fto%5Fpartition%5For%5Fpartitionless%5Fdisk "GRUB/Tips and tricks"). If your kernel does not boot due to `Failed to mount /sysroot.`, please add `GRUB_PRELOAD_MODULES="btrfs"` in `/etc/default/grub` and [generate](https://wiki.archlinux.org/title/GRUB#Generate%5Fthe%5Fmain%5Fconfiguration%5Ffile "GRUB") the grub configuration.

### Ext3/4 to Btrfs conversion

**Warning:** There are many reports on the btrfs mailing list about incomplete/corrupt/broken conversions. Make sure you have _working_ backups of any data you cannot afford to lose. See [Conversion from Ext3](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/Conversion%5Ffrom%5FExt3.html) on the Btrfs wiki for more information.

Boot from an install CD, then convert by doing:

# btrfs-convert /dev/_partition_

Mount the partion and test the conversion by checking the files. Be sure to change the `/etc/fstab` to reflect the change (**type** to `btrfs` and **fs\_passno** \[the last field\] to `0` as Btrfs does not do a file system check on boot). Also note that the UUID of the partition will have changed, so update fstab accordingly when using UUIDs. `chroot` into the system and rebuild your boot loader's menu list (see [Install from existing Linux](https://wiki.archlinux.org/title/Install%5Ffrom%5Fexisting%5FLinux "Install from existing Linux")). If converting a root file system, while still chrooted, run `mkinitcpio -p linux` to regenerate the initramfs or the system will not successfully boot.

**Note:** If there is anything wrong, either unable to mount or write files to the newly converted Btrfs; there is always the option to rollback as long as the backup subvolume `/ext2_saved` is still there. Use the `btrfs-convert -r /dev/partition` command to rollback; this will discard any modifications to the newly converted Btrfs file system.

After confirming that there are no problems, complete the conversion by deleting the backup `ext2_saved` sub-volume. Note that you cannot revert back to ext3/4 without it.

# btrfs subvolume delete /ext2_saved

Finally, [balance](#Balance) the file system to reclaim the space.

Remember that some applications which were installed prior have to be adapted to Btrfs.

**Note:** Ext3/4 to Btrfs conversion is a time consuming operation. For a 4 TiB file system and a regular HDD, it can take up to 10 hours.

### Corruption recovery

**Warning:** The tool `btrfs check` has known issues, see section [#btrfs check](#btrfs%5Fcheck)

_btrfs-check_ cannot be used on a mounted file system. To be able to use _btrfs-check_ without booting from a live USB, add it to the initial ramdisk:

/etc/mkinitcpio.conf

BINARIES=(btrfs)

[Regenerate the initramfs](https://wiki.archlinux.org/title/Regenerate%5Fthe%5Finitramfs "Regenerate the initramfs").

Then if there is a problem booting, the utility is available for repair.

**Note:** If the fsck process has to invalidate the space cache (and/or other caches?), it is normal for a subsequent boot to hang up for a while (it may give console messages about btrfs-transaction being hung). The system should recover from this after a while.

See [btrfs-check(8)](https://man.archlinux.org/man/btrfs-check.8) for more information.

### Booting into snapshots

In order to boot into a snapshot, the same procedure applies as for mounting a subvolume as your root partition, as given in section [mounting a subvolume as your root partition](#Mounting%5Fsubvolume%5Fas%5Froot), because snapshots can be mounted like subvolumes.

* If using [GRUB](https://wiki.archlinux.org/title/GRUB "GRUB"), you can automatically populate your boot menu with Btrfs snapshots when regenerating the configuration file with the help of [grub-btrfs](https://archlinux.org/packages/?name=grub-btrfs) or [grub-btrfs-git](https://aur.archlinux.org/packages/grub-btrfs-git/)AUR.
* If using [rEFInd](https://wiki.archlinux.org/title/REFInd "REFInd"), you can automatically populate your boot menu with Btrfs snapshots with the help of [refind-btrfs](https://aur.archlinux.org/packages/refind-btrfs/)AUR, after [enabling](https://wiki.archlinux.org/title/Enabling "Enabling") `refind-btrfs.service`.

### Use Btrfs subvolumes with systemd-nspawn

See the [Systemd-nspawn#Use Btrfs subvolume as container root](https://wiki.archlinux.org/title/Systemd-nspawn#Use%5FBtrfs%5Fsubvolume%5Fas%5Fcontainer%5Froot "Systemd-nspawn") and [Systemd-nspawn#Use temporary Btrfs snapshot of container](https://wiki.archlinux.org/title/Systemd-nspawn#Use%5Ftemporary%5FBtrfs%5Fsnapshot%5Fof%5Fcontainer "Systemd-nspawn") articles.

### Reducing access time metadata updates

Because of the copy-on-write nature of Btrfs, simply accessing files can trigger the metadata copy and writing. Reducing the frequency of access time updates may eliminate this unexpected disk usage and increase performance. See [fstab#atime options](https://wiki.archlinux.org/title/Fstab#atime%5Foptions "Fstab") for the available options.

### Incremental backup to external drive

The following packages use `btrfs send` and `btrfs receive` to send backups incrementally to an external drive. Refer to their documentation to see differences in implementation, features, and requirements.

* **btrbk** — Tool for creating snapshots and remote backups of Btrfs subvolumes.

<https://github.com/digint/btrbk> || [btrbk](https://archlinux.org/packages/?name=btrbk)

* **snap-sync** — Use [Snapper](https://wiki.archlinux.org/title/Snapper "Snapper") snapshots to backup to external drive or remote machine.

<https://github.com/wesbarnett/snap-sync> || [snap-sync](https://archlinux.org/packages/?name=snap-sync)

* **snapsync** — A synchronization tool for [Snapper](https://wiki.archlinux.org/title/Snapper "Snapper").

<https://github.com/doudou/snapsync> || [ruby-snapsync](https://aur.archlinux.org/packages/ruby-snapsync/)AUR

The following package allows backing up snapper snapshots to non-Btrfs file systems.

* **snapborg** — borgmatic-like tool which integrates snapper snapshots with [borg](https://archlinux.org/packages/?name=borg) backups.

<https://github.com/enzingerm/snapborg> || [snapborg](https://aur.archlinux.org/packages/snapborg/)AUR

## Troubleshooting

See the [Btrfs Troubleshooting pages](https://btrfs.readthedocs.io/en/latest/trouble-index.html) and [Btrfs Problem FAQ](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/Problem%5FFAQ.html) for general troubleshooting.

### GRUB

#### Partition offset

The offset problem may happen when you try to embed `core.img` into a partitioned disk. It means that [it is OK](https://wiki.archlinux.org/title/Special:Diff/319474 "Special:Diff/319474") to embed GRUB's `core.img` into a Btrfs pool on a partitionless disk (e.g. `/dev/sdX`) directly.

[GRUB](https://wiki.archlinux.org/title/GRUB "GRUB") can boot Btrfs partitions, however the module may be larger than other [file systems](https://wiki.archlinux.org/title/File%5Fsystems "File systems"). And the `core.img` file made by `grub-install` may not fit in the first 63 sectors (31.5KiB) of the drive between the MBR and the first partition. Up-to-date partitioning tools such as `fdisk` and `gdisk` avoid this issue by offsetting the first partition by roughly 1MiB or 2MiB.

#### Missing root

[](https://wiki.archlinux.org/title/File:Tango-inaccurate.png)**The factual accuracy of this article or section is disputed.**[](https://wiki.archlinux.org/title/File:Tango-inaccurate.png)

Users experiencing the following: `error no such device: root` when booting from a RAID style setup then edit /usr/share/grub/grub-mkconfig\_lib and remove both quotes from the line `echo " search --no-floppy --fs-uuid --set=root ${hints} ${fs_uuid}"`. Regenerate the config for grub and the system should boot without an error.

### Mounting timed out

Sometimes, especially with large RAID1 arrays, mounting might time out during boot with a journal message such as:

Jan 25 18:05:12 host systemd[1]: storage.mount: Mounting timed out. Terminating.
Jan 25 18:05:46 host systemd[1]: storage.mount: Mount process exited, code=killed, status=15/TERM
Jan 25 18:05:46 host systemd[1]: storage.mount: Failed with result 'timeout'.
Jan 25 18:05:46 host systemd[1]: Failed to mount /storage.
Jan 25 18:05:46 host systemd[1]: Startup finished in 32.943s (firmware) + 3.097s (loader) + 7.247s (kernel)>
Jan 25 18:05:46 host kernel: BTRFS error (device sda): open_ctree failed

This can easily be worked around by providing a longer timeout via the systemd-specific mount option `x-systemd.mount-timeout` in [fstab](https://wiki.archlinux.org/title/Fstab "Fstab"). For example:

/dev/sda                /storage    btrfs       rw,relatime,x-systemd.mount-timeout=5min  0 0

### BTRFS: open\_ctree failed

As of November 2014, there seems to be a bug in [systemd](https://wiki.archlinux.org/title/Systemd "Systemd") or [mkinitcpio](https://wiki.archlinux.org/title/Mkinitcpio "Mkinitcpio") causing the following error on systems with multi-device Btrfs file system using the `btrfs` hook in `mkinitcpio.conf`:

BTRFS: open_ctree failed
mount: wrong fs type, bad option, bad superblock on /dev/sdb2, missing codepage or helper program, or other error

In some cases, useful info is found in syslog - try dmesg|tail or so.

You are now being dropped into an emergency shell.

A workaround is to remove `btrfs` from the `HOOKS` array in `/etc/mkinitcpio.conf` and instead add `btrfs` to the `MODULES` array. Then [regenerate the initramfs](https://wiki.archlinux.org/title/Regenerate%5Fthe%5Finitramfs "Regenerate the initramfs") and reboot.

You will get the same error if you try to mount a raid array without one of the devices. In that case, you must add the `degraded` mount option to `/etc/fstab`. If your root resides on the array, you must also add `rootflags=degraded` to your [kernel parameters](https://wiki.archlinux.org/title/Kernel%5Fparameters "Kernel parameters").

As of August 2016, a potential workaround for this bug is to mount the array by a single drive only in `/etc/fstab`, and allow Btrfs to discover and append the other drives automatically. Group-based identifiers such as UUID and LABEL appear to contribute to the failure. For example, a two-device RAID1 array consisting of 'disk1' and disk2' will have a UUID allocated to it, but instead of using the UUID, use only `/dev/mapper/disk1` in `/etc/fstab`. For a more detailed explanation, see the following [blog post](https://web.archive.org/web/20161108175034/http://blog.samcater.com/fix-for-btrfs-open%5Fctree-failed-when-running-root-fs-on-raid-1-or-raid10-arch-linux/).

Another possible workaround is to remove the `udev` hook in [mkinitcpio.conf](https://wiki.archlinux.org/title/Mkinitcpio.conf "Mkinitcpio.conf") and replace it with the `systemd` hook. In this case, `btrfs` should _not_ be in the `HOOKS` or `MODULES` arrays.

See the [original forums thread](https://bbs.archlinux.org/viewtopic.php?id=189845) and [FS#42884](https://bugs.archlinux.org/task/42884) for further information and discussion.

### btrfs check

[](https://wiki.archlinux.org/title/File:View-refresh-red.svg)**This article or section is out of date.**[](https://wiki.archlinux.org/title/File:View-refresh-red.svg)

**Reason:** The "heavy development" status is old. (Discuss in [Talk:Btrfs](https://wiki.archlinux.org/title/Talk:Btrfs))

**Warning:** Since Btrfs is under heavy development, especially the `btrfs check` command, it is highly recommended to create a [backup](https://wiki.archlinux.org/title/Backup "Backup") and consult [btrfs-check(8)](https://man.archlinux.org/man/btrfs-check.8) before executing `btrfs check` with the `--repair` switch.

The [btrfs-check(8)](https://man.archlinux.org/man/btrfs-check.8) command can be used to check or repair an unmounted Btrfs file system. However, this repair tool is still immature and not able to repair certain file system errors even those that do not render the file system unmountable.

### Constant drive activity

Since the [kernel](https://wiki.archlinux.org/title/Kernel "Kernel") version 6.2, `discard=async` [mount(8)](https://man.archlinux.org/man/mount.8) option is set by default. This [has been reported](https://lore.kernel.org/linux-btrfs/Y%2F%2Bn1wS%2F4XAH7X1p@nz/#r) to cause constant drive activity on some drives even while idle, as the discard queue is filled faster than it is processed. This can cause increased power usage, especially on NVMe-based drives.

As of kernel version 6.3, the default discard `iops_limit` has been changed from 100 to 1000 to address this issue. You can manually set it to a desired value on an old kernel version, e.g.

# echo 1000 > /sys/fs/btrfs/_uuid_/discard/iops_limit

Where `uuid` is the UUID of the Btrfs file system. The limit of `1000` will need to be tuned experimentally.

To set the parameter on boot, [systemd-tmpfiles](https://wiki.archlinux.org/title/Systemd-tmpfiles "Systemd-tmpfiles") may be used, e.g. by creating the following file:

/etc/tmpfiles.d/btrfs-discard.conf

w /sys/fs/btrfs/_uuid_/discard/iops_limit - - - - 1000

Alternatively, one can disable asynchronous discard altogether by mounting using the `nodiscard` mount option in [fstab](https://wiki.archlinux.org/title/Fstab "Fstab"), and instead use [Periodic TRIM](https://wiki.archlinux.org/title/Solid%5Fstate%5Fdrive#Periodic%5FTRIM "Solid state drive").

## See also

* **Official site**  
   * [Btrfs Documentation](https://btrfs.readthedocs.io/)  
   * [Archived Btrfs Wiki](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/)
* **Performance related**  
   * [Btrfs on raw disks?](https://superuser.com/questions/432188/should-i-put-my-multi-device-btrfs-filesystem-on-disk-partitions-or-raw-devices)  
   * [Varying leafsize and nodesize in Btrfs](https://lore.kernel.org/linux-btrfs/CAKcLGm%5FMKEdTiHFBd-b-v2sN5gJmgFRqsykzWRXTVqUw4O6Acw@mail.gmail.com/)  
   * [Btrfs support for efficient SSD operation (data blocks alignment)](https://lore.kernel.org/linux-btrfs/jgui4j$th5$1@dough.gmane.org/)  
   * [Is Btrfs optimized for SSDs?](https://archive.kernel.org/oldwiki/btrfs.wiki.kernel.org/index.php/FAQ.html#Is%5FBtrfs%5Foptimized%5Ffor%5FSSD.3F)  
   * [Lzo vs. zLib](https://blog.erdemagaoglu.com/post/4605524309/lzo-vs-snappy-vs-lzf-vs-zlib-a-comparison-of)
* **Miscellaneous**  
   * [Funtoo:BTRFS Fun](https://www.funtoo.org/BTRFS%5FFun "funtoo:BTRFS Fun")  
   * [Avi Miller presenting Btrfs](https://www.phoronix.com/scan.php?page=news%5Fitem&px=MTA0ODU) at SCALE 10x, January 2012.  
   * [Summary of Chris Mason's talk](https://www.phoronix.com/scan.php?page=news%5Fitem&px=MTA4Mzc) from LFCS 2012  
   * [Btrfs: stop providing a bmap operation to avoid swapfile corruptions](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=35054394c4b3cecd52577c2662c84da1f3e73525) 2009-01-21  
   * [Doing Fast Incremental Backups With Btrfs Send and Receive](https://marc.merlins.org/perso/btrfs/post%5F2014-03-22%5FBtrfs-Tips%5F-Doing-Fast-Incremental-Backups-With-Btrfs-Send-and-Receive.html)



# links
[Read on Omnivore](https://omnivore.app/me/btrfs-arch-wiki-18b3aa266cb)
[Read Original](https://wiki.archlinux.org/title/Btrfs)

<iframe src="https://wiki.archlinux.org/title/Btrfs"  width="800" height="500"></iframe>
