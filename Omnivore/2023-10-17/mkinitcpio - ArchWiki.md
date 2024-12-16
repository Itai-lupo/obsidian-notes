---
id: b3645094-6c74-11ee-8101-1fa823bc5aff
title: mkinitcpio - ArchWiki
tags:
  - boot
  - linux
date: 2023-10-17 01:38:22
words_count: 4595
state: INBOX
---

# mkinitcpio - ArchWiki by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> mkinitcpio is a Bash script used to create an initial ramdisk environment. From the mkinitcpio(8) man page:


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[mkinitcpio](https://gitlab.archlinux.org/archlinux/mkinitcpio/mkinitcpio) is a Bash script used to create an [initial ramdisk](https://en.wikipedia.org/wiki/Initial%5Framdisk "wikipedia:Initial ramdisk") environment. From the [mkinitcpio(8)](https://man.archlinux.org/man/mkinitcpio.8) man page:

The initial ramdisk is in essence a very small environment (early userspace) which loads various kernel modules and sets up necessary things before handing over control to `init`. This makes it possible to have, for example, encrypted root file systems and root file systems on a software RAID array. _mkinitcpio_ allows for easy extension with custom hooks, has autodetection at runtime, and many other features.

Traditionally, the kernel was responsible for all hardware detection and initialization tasks early in the [boot process](https://wiki.archlinux.org/title/Boot%5Fprocess "Boot process") before mounting the root file system and passing control to `init`. However, as technology advances, these tasks have become increasingly complex. 

Nowadays, the root file system may be on a wide range of hardware, from SCSI to SATA to USB drives, controlled by a variety of drive controllers from different manufacturers. Additionally, the root file system may be encrypted or compressed; within a software RAID array or a logical volume group. The simple way to handle that complexity is to pass management into userspace: an initial ramdisk. See also: [/dev/brain0 » Blog Archive » Early Userspace in Arch Linux](https://web.archive.org/web/20150430223035/http://archlinux.me/brain0/2010/02/13/early-userspace-in-arch-linux/).

_mkinitcpio_ has been developed by the Arch Linux developers and from community contributions. See the [public Git repository](https://gitlab.archlinux.org/archlinux/mkinitcpio/mkinitcpio).

## Installation

[Install](https://wiki.archlinux.org/title/Install "Install") the [mkinitcpio](https://archlinux.org/packages/?name=mkinitcpio) package, which is a dependency of the [linux](https://archlinux.org/packages/?name=linux) package, so most users will already have it installed.

Advanced users may wish to install the latest development version of _mkinitcpio_ from Git with the [mkinitcpio-git](https://aur.archlinux.org/packages/mkinitcpio-git/)AUR package.

## Image creation and activation

### Automated generation

Every time a kernel is installed or upgraded, a [pacman hook](https://wiki.archlinux.org/title/Pacman%5Fhook "Pacman hook") automatically generates a _.preset_ file saved in `/etc/mkinitcpio.d/`. For example `linux.preset` for the official stable [linux](https://archlinux.org/packages/?name=linux) kernel package. A preset is simply a list of information required to create initial ramdisk images, instead of manually specifying the various parameters and the location of the output files. By default, it contains the instructions to create two images:

1. the _default_ ramdisk image created following the directives specified in the mkinitcpio <#Configuration>, and
2. the _fallback_ ramdisk image, same as above except that the _autodetect_ hook is skipped during creation, thus including a full range of modules which supports most systems.

After creating the preset, the pacman hook calls the _mkinitcpio_ script which generates the two images, using the information provided in the preset.

**Note:** _.preset_ files are used to automatically regenerate the initramfs after a kernel update; be careful when editing them.

### Manual generation

To run the script manually, refer to the [mkinitcpio(8)](https://man.archlinux.org/man/mkinitcpio.8) manual page for instructions. In particular, to (re-)generate the preset provided by a kernel package, use the `-p`/`--preset` option followed by the preset to utilize. For example, for the [linux](https://archlinux.org/packages/?name=linux) package, use the command:

# mkinitcpio -p linux

To (re-)generate all existing presets, use the `-P`/`--allpresets` switch. This is typically used to regenerate all the initramfs images after a change of the global <#Configuration>:

# mkinitcpio -P

Users may create any number of initramfs images with a variety of different configurations. The desired image must be specified in the respective [boot loader](https://wiki.archlinux.org/title/Boot%5Floader "Boot loader") configuration file.

### Customized generation

Users can generate an image using an alternative configuration file. For example, the following will generate an initial ramdisk image according to the directions in `/etc/mkinitcpio-custom.conf` and save it as `/boot/initramfs-custom.img`.

# mkinitcpio --config /etc/mkinitcpio-custom.conf --generate /boot/initramfs-custom.img

If generating an image for a kernel other than the one currently running, add the kernel release version to the command line. The installed kernel releases can be found in `/usr/lib/modules/`, the syntax is consistent with the output of the command `uname -r` for each kernel.

# mkinitcpio --generate /boot/initramfs-custom2.img --kernel 5.7.12-arch1-1

### Unified kernel images

As of version 31, _mkinitpcio_ can also create [unified kernel images](https://wiki.archlinux.org/title/Unified%5Fkernel%5Fimage "Unified kernel image").

## Configuration

The primary configuration file for _mkinitcpio_ is `/etc/mkinitcpio.conf`. Drop-in configuration files are also supported, e.g. `/etc/mkinitcpio.conf.d/myhooks.conf`. Additionally, preset definitions are provided by kernel packages in the `/etc/mkinitcpio.d` directory (e.g. `/etc/mkinitcpio.d/linux.preset`).

Users can modify six variables within the configuration file, see [mkinitcpio.conf(5)](https://man.archlinux.org/man/mkinitcpio.conf.5) for more details:

`MODULES`

Kernel modules to be loaded before any boot hooks are run.

`BINARIES`

Additional binaries to be included in the initramfs image.

`FILES`

Additional files to be included in the initramfs image.

`HOOKS`

Hooks are scripts that execute in the initial ramdisk.

`COMPRESSION`

Used to compress the initramfs image.

`COMPRESSION_OPTIONS`

Extra arguments to pass to the `COMPRESSION` program. Usage of this setting is strongly discouraged. _mkinitcpio_ will handle special requirements for compressors (e.g. passing `--check=crc32` to xz), and misusage can easily lead to an unbootable system.

**Note:**

* Some hooks that may be required for your system like **lvm2**, **mdadm\_udev**, and **encrypt** are **NOT** enabled by default. Read the <#HOOKS> section carefully for instructions.
* Users with multiple hardware disk controllers that use the same node names but different kernel modules (e.g. two SCSI/SATA or two IDE controllers) should use [persistent block device naming](https://wiki.archlinux.org/title/Persistent%5Fblock%5Fdevice%5Fnaming "Persistent block device naming") to ensure that the right devices are mounted. Otherwise, the root device location may change between boots, resulting in kernel panics.
* Preset files created by _mkinitcpio_ before Version 36 set the variable `ALL_config`, which prevents drop-in configuration files from being loaded. To enable drop-in files, comment out the line `ALL_config="/etc/mkinitcpio.conf"` in older preset files.

### MODULES

The `MODULES` array is used to specify modules to load before anything else is done.

Modules suffixed with a `?` will not throw errors if they are not found. This might be useful for custom kernels that compile in modules which are listed explicitly in a hook or configuration file.

**Note:**

* If using **reiser4**, it _must_ be added to the `MODULES` array.
* When using the **encrypt** or **sd-encrypt** hook, the keyboard modules and/or filesystems needed to unlock the LUKS device during system boot need to be added to the `MODULES` array when the target system differs from the one used to run _mkinitcpio_. For example, if you use a keyfile on an ext2 file system but no ext2 file system is mounted at the time _mkinitcpio_ runs, add `ext2`. See [dm-crypt/System configuration#cryptkey](https://wiki.archlinux.org/title/Dm-crypt/System%5Fconfiguration#cryptkey "Dm-crypt/System configuration") for more details.
* If using a keyboard through a USB 3 hub and wish to use it to unlock a LUKS device, add `usbhid xhci_hcd`.
* If using displays connected to a docking station, you might need to add a module for your graphic card to make initrd output visible (e.g. `i915` for most Intel cards).

### BINARIES and FILES

These options allow users to add files to the image. Both `BINARIES` and `FILES` are added before hooks are run, and may be used to override files used or provided by a hook. `BINARIES` are auto-located within a standard `PATH` and are dependency-parsed, meaning any required libraries will also be added. `FILES` are added _as-is_. For example:

FILES=(/etc/modprobe.d/modprobe.conf)

BINARIES=(kexec)

Note that as both `BINARIES` and `FILES` are [Bash](https://wiki.archlinux.org/title/Bash "Bash") arrays, multiple entries can be added delimited with spaces.

### HOOKS

[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)**This article or section needs expansion.**[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)

The `HOOKS` array is the most important setting in the file. Hooks are small scripts which describe what will be added to the image. For some hooks, they will also contain a runtime component which provides additional behavior, such as starting a daemon, or assembling a stacked block device. Hooks are referred to by their name, and executed in the order they exist in the `HOOKS` array of the configuration file.

The default `HOOKS` setting should be sufficient for most simple, single disk setups. For root devices which are stacked or multi-block devices such as [LVM](https://wiki.archlinux.org/title/LVM "LVM"), [RAID](https://wiki.archlinux.org/title/RAID "RAID"), or [dm-crypt](https://wiki.archlinux.org/title/Dm-crypt "Dm-crypt"), see the respective wiki pages for further necessary configuration.

#### Build hooks

Build hooks are found in `/usr/lib/initcpio/install/`, custom build hooks can be placed in `/etc/initcpio/install/`. These files are sourced by the bash shell during runtime of _mkinitcpio_ and should contain two functions: `build` and `help`. The `build` function describes the modules, files, and binaries which will be added to the image. An API, documented by [mkinitcpio(8)](https://man.archlinux.org/man/mkinitcpio.8), serves to facilitate the addition of these items. The `help` function outputs a description of what the hook accomplishes.

For a list of all available hooks:

$ mkinitcpio -L

Use _mkinitcpio'_s `-H`/`--hookhelp` option to output help for a specific hook, for example:

$ mkinitcpio -H udev

#### Runtime hooks

Runtime hooks are found in `/usr/lib/initcpio/hooks/`, custom runtime hooks can be placed in `/etc/initcpio/hooks/`. For any runtime hook, there should always be a build hook of the same name, which calls `add_runscript` to add the runtime hook to the image. These files are sourced by the busybox ash shell during early userspace. With the exception of cleanup hooks, they will always be run in the order listed in the `HOOKS` setting. Runtime hooks may contain several functions:

`run_earlyhook`: Functions of this name will be run once the API file systems have been mounted and the kernel command line has been parsed. This is generally where additional daemons, such as udev, which are needed for the early boot process are started from.

`run_hook`: Functions of this name are run shortly after the early hooks. This is the most common hook point, and operations such as assembly of stacked block devices should take place here.

`run_latehook`: Functions of this name are run after the root device has been mounted. This should be used, sparingly, for further setup of the root device, or for mounting other file systems, such as `/usr`.

`run_cleanuphook`: Functions of this name are run as late as possible, and in the reverse order of how they are listed in the `HOOKS` array in the configuration file. These hooks should be used for any last minute cleanup, such as shutting down any daemons started by an early hook.

**Note:** Runtime hooks are only used by busybox init. **systemd** hook triggers a systemd based init, which does not run any runtime hooks but uses systemd units instead.

#### Common hooks

A table of common hooks and how they affect image creation and runtime follows. Note that this table is not complete, as packages can provide custom hooks.

[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)**This article or section needs expansion.**[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)

| busybox init    | systemd init                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | [Build hook](#Build%5Fhooks)                                                                                                                                                                                                                                                                                                                                                                                                                             | [Runtime hook](#Runtime%5Fhooks) (busybox init only)                                                                                                                                                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **base**        | Sets up all initial directories and installs base utilities and libraries. Always keep this hook as the first hook unless you know what you are doing, as it provides critical busybox init when not using **systemd** hook. Optional when using the **systemd** hook as it only provides a busybox recovery shell. **Note:** The recovery shell is not usable since the root account in the initramfs is [locked](https://gitlab.archlinux.org/archlinux/packaging/packages/systemd/-/commit/292cdf8a2f7dd7c6c7d91d2b59617391935c837c). See [FS#70408](https://bugs.archlinux.org/task/70408).                                                                                                                                                                                                                                                                                              | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **udev**        | **systemd**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Adds udevd, udevadm, and a small subset of udev rules to your image.                                                                                                                                                                                                                                                                                                                                                                                     | Starts the udev daemon and processes uevents from the kernel; creating device nodes. As it simplifies the boot process by not requiring the user to explicitly specify necessary modules, using it is recommended.                                                                                                                                                  |
| **usr**         | Adds support for /usr on a separate partition. See [#/usr as a separate partition](#/usr%5Fas%5Fa%5Fseparate%5Fpartition) for details.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Mounts the /usr partition after the real root has been mounted.                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                     |
| **resume**      | –                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Tries to resume from the "suspend to disk" state. See [Hibernation](https://wiki.archlinux.org/title/Hibernation "Hibernation") for further configuration.                                                                                                                                                                                                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                     |
| **btrfs**       | –                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Sets the required modules to enable [Btrfs](https://wiki.archlinux.org/title/Btrfs "Btrfs") for using multiple devices with Btrfs. You need to have [btrfs-progs](https://archlinux.org/packages/?name=btrfs-progs) installed to use this. This hook is not required for using Btrfs on a single device where the filesystems hook suffices.                                                                                                             | Runs btrfs device scan to assemble a multi-device Btrfs root file system when **udev** hook or **systemd** hook is not present. The [btrfs-progs](https://archlinux.org/packages/?name=btrfs-progs) package is required for this hook.                                                                                                                              |
| **autodetect**  | Shrinks your initramfs to a smaller size by creating a whitelist of modules from a scan of sysfs. Be sure to verify included modules are correct and none are missing. This hook must be run before other subsystem hooks in order to take advantage of auto-detection. Any hooks placed before 'autodetect' will be installed in full.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **modconf**     | Includes modprobe configuration files from /etc/modprobe.d/ and /usr/lib/modprobe.d/.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **kms**         | Adds GPU modules to provide [early KMS start](https://wiki.archlinux.org/title/Kernel%5Fmode%5Fsetting#Installation "Kernel mode setting"). Additionally adds modules that are required by privacy screens built into the LCD panel of some laptops.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **block**       | Adds all block device modules, formerly separately provided by the _fw_, _mmc_, _pata_, _sata_, _scsi_, _usb_, and _virtio_ hooks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **net**         | _not implemented_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Adds the necessary modules for a network device. You must have [mkinitcpio-nfs-utils](https://archlinux.org/packages/?name=mkinitcpio-nfs-utils) installed to use this, see [#Using net](#Using%5Fnet) for details.                                                                                                                                                                                                                                      | Provides handling for an NFS-based root file system.                                                                                                                                                                                                                                                                                                                |
| **dmraid**      | _?_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Provides support for fakeRAID root devices. You must have [dmraid](https://archlinux.org/packages/?name=dmraid) installed to use this. Note that it is preferred to use [mdadm](https://wiki.archlinux.org/title/Mdadm "Mdadm") with the **mdadm\_udev** hook with fakeRAID if your controller supports it. See [#Using RAID](#Using%5FRAID) for details.                                                                                                | Locates and assembles fakeRAID block devices using dmraid.                                                                                                                                                                                                                                                                                                          |
| **mdadm\_udev** | Provides support for assembling RAID arrays via udev. You must have [mdadm](https://archlinux.org/packages/?name=mdadm) installed to use this. If you use this hook with a FakeRAID array, it is recommended to include mdmon in BINARIES. See [#Using RAID](#Using%5FRAID) for details.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **keyboard**    | Adds the necessary modules for keyboard devices. Use this if you have an USB or serial keyboard and need it in early userspace (either for entering encryption passphrases or for use in an interactive shell). As a side effect, modules for some non-keyboard input devices might be added too, but this should not be relied on. Supersedes old _usbinput_ hook.**Note:** For systems that are booted with different hardware configurations (e.g. laptops with external keyboard vs. internal keyboard or [headless systems](https://en.wikipedia.org/wiki/Headless%5Fcomputer "wikipedia:Headless computer")), this hook needs to be placed before **autodetect** in order to be able to use the keyboard at boot time, for example to unlock an encrypted device when using the encrypt hook.                                                                                          | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **keymap**      | **sd-vconsole**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Adds the specified [keymap(s)](https://wiki.archlinux.org/title/Linux%5Fconsole/Keyboard%5Fconfiguration#Persistent%5Fconfiguration "Linux console/Keyboard configuration") from /etc/vconsole.conf to the initramfs. If you use [system encryption](https://wiki.archlinux.org/title/Dm-crypt/Encrypting%5Fan%5Fentire%5Fsystem "Dm-crypt/Encrypting an entire system"), especially full-disk encryption, make sure you add it before the encrypt hook. | Loads the specified keymap(s) from /etc/vconsole.conf during early userspace.                                                                                                                                                                                                                                                                                       |
| **consolefont** | Adds the specified [console font](https://wiki.archlinux.org/title/Linux%5Fconsole#Persistent%5Fconfiguration "Linux console") from /etc/vconsole.conf to the initramfs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Loads the specified console font from /etc/vconsole.conf during early userspace.                                                                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                     |
| **encrypt**     | **sd-encrypt**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Adds the dm\_crypt kernel module and the cryptsetup tool to the image. You must have [cryptsetup](https://archlinux.org/packages/?name=cryptsetup) installed to use this. **Note:** Take notice of the remarks for the _keyboard_ hook above to unlock an encrypted device during boot, and/or the filesystem remarks in <#MODULES> when you use a file to unlock.                                                                                       | Detects and unlocks an encrypted root partition. See [#Runtime customization](#Runtime%5Fcustomization) for further configuration.For **sd-encrypt** see [dm-crypt/System configuration#Using systemd-cryptsetup-generator](https://wiki.archlinux.org/title/Dm-crypt/System%5Fconfiguration#Using%5Fsystemd-cryptsetup-generator "Dm-crypt/System configuration"). |
| **lvm2**        | Adds the device mapper kernel module and the lvm tool to the image. You must have [lvm2](https://archlinux.org/packages/?name=lvm2) installed to use this. This is necessary if you have your root file system on [LVM](https://wiki.archlinux.org/title/LVM "LVM").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **filesystems** | This includes necessary file system modules into your image. This hook is **required** unless you specify your file system modules in MODULES.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |
| **fsck**        | Adds the fsck binary and file system-specific helpers to allow running fsck against your root device (and /usr if separate) prior to mounting. If added after the **autodetect** hook, only the helper specific to your root file system will be added. Usage of this hook is **strongly** recommended, and it is required with a separate /usr partition. It is highly recommended that if you include this hook that you also include any necessary modules to ensure your keyboard will work in early userspace. The use of this hook requires the rw parameter to be set on the [kernel command line](https://wiki.archlinux.org/title/Kernel%5Fcommand%5Fline "Kernel command line") ([discussion](https://bbs.archlinux.org/viewtopic.php?pid=1307895#p1307895)). See [fsck#Boot time checking](https://wiki.archlinux.org/title/Fsck#Boot%5Ftime%5Fchecking "Fsck") for more details. | –                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                     |

### COMPRESSION

The kernel supports several formats for compression of the initramfs: [gzip](https://archlinux.org/packages/?name=gzip), [bzip2](https://archlinux.org/packages/?name=bzip2), lzma, [xz](https://archlinux.org/packages/?name=xz), [lzo](https://archlinux.org/packages/?name=lzo), [lz4](https://archlinux.org/packages/?name=lz4) and [zstd](https://archlinux.org/packages/?name=zstd). mkinitcpio uses zstd compressed images by default, note that the zstd compression runs in multi-threading mode (with the `-T0` option which spawns as many threads as detected cores).

The provided `mkinitcpio.conf` has the various `COMPRESSION` options commented out. Uncomment one if you wish to switch to another compression method and make sure you have the corresponding compression utility installed. If none is specified, the zstd default method is used. If you wish to create an uncompressed image, specify `COMPRESSION=cat` in the configuration file or use `-z cat` on the command line.

**Tip:** With a compression ratio typically around 2.5 on the image in its high compression mode (`-9`), lz4 achieves the fastest decompression speed at the cost of a slower single-threaded compression. For a slightly better compression, lzo is still fast to decompress. zstd offers a versatile solution, with multi-threaded compression and a wide range of compression levels through its options — see [zstd(1) § Operation modifiers](https://man.archlinux.org/man/zstd.1#Operation%5Fmodifiers). xz achieves the smallest size with a reduction factor around 5 in its high compression preset (`-9`), at the cost of a much slower decompression speed.

### COMPRESSION\_OPTIONS

These are additional flags passed to the program specified by `COMPRESSION`, such as:

COMPRESSION_OPTIONS=(-9)

This option can be left empty; _mkinitcpio_ will ensure that any supported compression method has the necessary flags to produce a working image.

**Warning:** Misuse of this option may lead to an **unbootable system** if the kernel is unable to unpack the resultant archive.

With the default zstd compression, to save space for custom kernels (especially with a [dual boot](https://wiki.archlinux.org/title/Dual%5Fboot "Dual boot") setup when using the EFI system partition as `/boot`), the `--long` option is very effective. However, systems with limited RAM may not be able to decompress initramfs using this option. The `-v` option may also be desired to see details during the initramfs generation. For example:

COMPRESSION_OPTIONS=(-v -5 --long)

## Runtime customization

[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)**This article or section needs expansion.**[](https://wiki.archlinux.org/title/File:Tango-view-fullscreen.svg)

**Reason:** Which options work with the `systemd` hook and which are `base`\-only? (Discuss in [Talk:Mkinitcpio](https://wiki.archlinux.org/title/Talk:Mkinitcpio))

Runtime configuration options can be passed to `init` and certain hooks via the kernel command line. Kernel command-line parameters are often supplied by the boot loader. The options discussed below can be appended to the kernel command line to alter default behavior. See [Kernel parameters](https://wiki.archlinux.org/title/Kernel%5Fparameters "Kernel parameters") and [Arch boot process](https://wiki.archlinux.org/title/Arch%5Fboot%5Fprocess "Arch boot process") for more information.

### init from base hook

`root`

This is the most important parameter specified on the kernel command line, as it determines what device will be mounted as your proper root device. _mkinitcpio_ is flexible enough to allow a wide variety of formats, for example: 

root=/dev/sda1                                                # /dev node
root=LABEL=CorsairF80                                         # label
root=UUID=ea1c4959-406c-45d0-a144-912f4e86b207                # UUID
root=PARTUUID=14420948-2cea-4de7-b042-40f67c618660            # GPT partition UUID

**Note:** The following boot parameters alter the default behavior of `init` in the initramfs environment. See `/usr/lib/initcpio/init` for details. They will not work when `systemd` hook is being used since the `init` from `base` hook is replaced.

`break`

If `break` or `break=premount` is specified, `init` pauses the boot process (after loading hooks, but before mounting the root file system) and launches an interactive shell which can be used for troubleshooting purposes. This shell can be launched after the root has been mounted by specifying `break=postmount`. Normal boot continues after exiting from the shell.

`disablehooks`

Disable hooks at runtime by adding `disablehooks=hook1[,hook2,...]`. For example: 

disablehooks=resume

`earlymodules`

Alter the order in which modules are loaded by specifying modules to load early via `earlymodules=mod1[,mod2,...]`. (This may be used, for example, to ensure the correct ordering of multiple network interfaces.)

See [Boot debugging](https://wiki.archlinux.org/title/Boot%5Fdebugging "Boot debugging") and [mkinitcpio(8)](https://man.archlinux.org/man/mkinitcpio.8) for other parameters.

### Using RAID

See [RAID#Configure mkinitcpio](https://wiki.archlinux.org/title/RAID#Configure%5Fmkinitcpio "RAID").

### Using net

**Note:** NFSv4 is not yet supported [FS#28287](https://bugs.archlinux.org/task/28287).

**Required packages** 

`net` requires the [mkinitcpio-nfs-utils](https://archlinux.org/packages/?name=mkinitcpio-nfs-utils) package.

**Kernel parameters** 

Comprehensive and up-to-date information can be found in the official [kernel documentation](https://docs.kernel.org/admin-guide/nfs/nfsroot.html).

**ip=** 

This parameter tells the kernel how to configure IP addresses of devices and also how to set up the IP routing table. It can take up to nine arguments separated by colons: `ip=<client-ip>:<server-ip>:<gw-ip>:<netmask>:<hostname>:<device>:<autoconf>:<dns0-ip>:<dns1-ip>:<ntp0-ip>`.

If this parameter is missing from the kernel command line, all fields are assumed to be empty, and the defaults mentioned in the [kernel documentation](https://docs.kernel.org/admin-guide/nfs/nfsroot.html) apply. In general this means that the kernel tries to configure everything using autoconfiguration.

The `<autoconf>` parameter can appear alone as the value to the `ip` parameter (without all the `:` characters before). If the value is `ip=off` or `ip=none`, no autoconfiguration will take place, otherwise autoconfiguration will take place. The most common way to use this is `ip=dhcp`.

For parameters explanation, see the [kernel documentation](https://docs.kernel.org/admin-guide/nfs/nfsroot.html).

Examples:

ip=127.0.0.1:::::lo:none  --> Enable the loopback interface.
ip=192.168.1.1:::::eth2:none --> Enable static eth2 interface.
ip=:::::eth0:dhcp --> Enable dhcp protocol for eth0 configuration.

**Note:** Make sure to use kernel device names (e.g. `eth0`) for the `<device>` parameter, the persistent names (e.g. `enp2s0`) will not work. See [Network configuration#Network interfaces](https://wiki.archlinux.org/title/Network%5Fconfiguration#Network%5Finterfaces "Network configuration") for details.

**BOOTIF=** 

If you have multiple network cards, this parameter can include the MAC address of the interface you are booting from. This is often useful as interface numbering may change, or in conjunction with pxelinux IPAPPEND 2 or IPAPPEND 3 option. If not given, `eth0` will be used.

Example:

BOOTIF=01-A1-B2-C3-D4-E5-F6  # Note the prepended "01-" and capital letters.

**nfsroot=** 

If the `nfsroot` parameter is NOT given on the command line, the default `/tftpboot/%s` will be used.

nfsroot=[<server-ip>:]<root-dir>[,<nfs-options>]

Run `mkinitcpio -H net` for parameter explanation.

### Using LVM

If your root device is on [LVM](https://wiki.archlinux.org/title/LVM "LVM"), see [Install Arch Linux on LVM#Adding mkinitcpio hooks](https://wiki.archlinux.org/title/Install%5FArch%5FLinux%5Fon%5FLVM#Adding%5Fmkinitcpio%5Fhooks "Install Arch Linux on LVM").

### Using encrypted root

If using an [encrypted root](https://wiki.archlinux.org/title/Dm-crypt/Encrypting%5Fan%5Fentire%5Fsystem "Dm-crypt/Encrypting an entire system") see [dm-crypt/System configuration#mkinitcpio](https://wiki.archlinux.org/title/Dm-crypt/System%5Fconfiguration#mkinitcpio "Dm-crypt/System configuration") for detailed information on which hooks to include.

### /usr as a separate partition

If you keep `/usr` as a separate partition, you must adhere to the following requirements:

* Add the `fsck` hook, mark `/usr` with a `passno` of `2` in `/etc/fstab` to run the check on the partition at startup. While recommended for everyone, it is mandatory if you want your `/usr` partition to be fsck'ed at boot-up. Without this hook, `/usr` will never be fsck'd.
* If not using the systemd hook, add the `usr` hook. This will mount the `/usr` partition after root is mounted.

## Troubleshooting

### 

If you are curious about what is inside the initramfs image, you can extract it and poke at the files inside of it. 

The initramfs image is an SVR4 CPIO archive, generated via the `find` and `bsdcpio` commands, optionally compressed with a compression scheme understood by the kernel. For more information on the compression schemes, see <#COMPRESSION>.

_mkinitcpio_ includes a utility called [lsinitcpio(1)](https://man.archlinux.org/man/lsinitcpio.1) which will list and/or extract the contents of initramfs images.

You can list the files in the image with:

# lsinitcpio /boot/initramfs-linux.img

And to extract them all in the current directory:

# lsinitcpio -x /boot/initramfs-linux.img

You can also get a more human-friendly listing of the important parts in the image:

# lsinitcpio -a /boot/initramfs-linux.img

### 

Invoke the `build_image` function of the `/usr/bin/mkinitcpio` script with parameters

build_image _outfile_ _compression_

It can be done by creating a new script with the contents of the `build_image` function and running it with the above parameters. This will compress the contents present in the current directory in a file named `outfile`.

**Warning:** It is a good idea to rename the automatically generated `/boot/initramfs-linux.img` before you overwrite it, so you can easily undo your changes. Be prepared for making a mistake that prevents your system from booting. If this happens, you will need to boot through the fallback, or a boot CD, to restore your original, run _mkinitcpio_ to overwrite your changes, or fix them yourself and recompress the image.

### "/dev must be mounted" when it already is

The test used by _mkinitcpio_ to determine if `/dev` is mounted is to see if `/dev/fd/` is there. If everything else looks fine, it can be "created" manually by:

# ln -s /proc/self/fd /dev/

(Obviously, `/proc` must be mounted as well. _mkinitcpio_ requires that anyway, and that is the next thing it will check.)

### Possibly missing firmware for module XXXX

When initramfs are being rebuilt after a kernel update, you might get warnings:

==> WARNING: Possibly missing firmware for module: '_modulename_'

If these messages appear when generating a _default_ initramfs image, then, as the warning says, installing additional firmware may be required. Most common firmware files can be acquired by [installing](https://wiki.archlinux.org/title/Install "Install") the [linux-firmware](https://archlinux.org/packages/?name=linux-firmware) package. For other packages providing firmware see the table below or try searching for the module name in the [official repositories](https://wiki.archlinux.org/title/Official%5Frepositories "Official repositories") or [AUR](https://wiki.archlinux.org/title/AUR "AUR").

Otherwise, if the messages only appear when generating the _fallback_ initramfs image you have the following options:

* You can safely ignore the warnings, if you know that you do not use the affected hardware.
* If you want to suppress the warnings, you can install the missing firmware. The meta-package [mkinitcpio-firmware](https://aur.archlinux.org/packages/mkinitcpio-firmware/)AUR contains most optional firmwares. Alternatively, manually install the needed packages:

| Module          | Package                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| aic94xx         | [aic94xx-firmware](https://aur.archlinux.org/packages/aic94xx-firmware/)AUR             |
| ast             | [ast-firmware](https://aur.archlinux.org/packages/ast-firmware/)AUR                     |
| bfa             | [linux-firmware-qlogic](https://archlinux.org/packages/?name=linux-firmware-qlogic)     |
| bnx2x           | [linux-firmware-bnx2x](https://archlinux.org/packages/?name=linux-firmware-bnx2x)       |
| liquidio        | [linux-firmware-liquidio](https://archlinux.org/packages/?name=linux-firmware-liquidio) |
| mlxsw\_spectrum | [linux-firmware-mellanox](https://archlinux.org/packages/?name=linux-firmware-mellanox) |
| nfp             | [linux-firmware-nfp](https://archlinux.org/packages/?name=linux-firmware-nfp)           |
| qed             | [linux-firmware-qlogic](https://archlinux.org/packages/?name=linux-firmware-qlogic)     |
| qla1280         | [linux-firmware-qlogic](https://archlinux.org/packages/?name=linux-firmware-qlogic)     |
| qla2xxx         | [linux-firmware-qlogic](https://archlinux.org/packages/?name=linux-firmware-qlogic)     |
| wd719x          | [wd719x-firmware](https://aur.archlinux.org/packages/wd719x-firmware/)AUR               |
| xhci\_pci       | [upd72020x-fw](https://aur.archlinux.org/packages/upd72020x-fw/)AUR                     |

* If you want to get rid of the warnings, but do not want to waste your system space on unneeded firmware packages, you can disable fallback initramfs generation altogether:  
   1. Change `PRESETS=('default' 'fallback')` line to `PRESETS=('default')` in all _.preset_ files in `/etc/mkinitcpio.d/`.  
   2. Remove fallback initramfs images: `# rm /boot/*-fallback.img`.  
   3. Update your [boot loader](https://wiki.archlinux.org/title/Boot%5Floader "Boot loader") configuration.

**Warning:** Disabling fallback initramfs generation will deprive you of another option to boot into the system in case a default initramfs fails. Before proceeding, make sure you have a bootable [installation medium](https://wiki.archlinux.org/title/USB%5Fflash%5Finstallation%5Fmedium "USB flash installation medium") for rescue purposes on hand.

### No PS/2 controller found

On some motherboards (mostly ancient ones, but also a few new ones), the i8042 controller cannot be automatically detected. It is rare, but some people will surely be without keyboard. You can detect this situation in advance. If you have a PS/2 port and get `i8042: PNP: No PS/2 controller found. Probing ports directly` message, add **atkbd** to the `MODULES` array.

### Standard rescue procedures

With an improper initial ram-disk a system often is unbootable. So follow a system rescue procedure like below:

#### Boot succeeds on one machine and fails on another

_mkinitcpio'_s `autodetect` hook filters unneeded [kernel modules](https://wiki.archlinux.org/title/Kernel%5Fmodules "Kernel modules") in the primary initramfs scanning `/sys` and the modules loaded at the time it is run. If you transfer your `/boot` directory to another machine and the boot sequence fails during early userspace, it may be because the new hardware is not detected due to missing kernel modules. Note that USB 2.0 and 3.0 need different kernel modules. 

To fix, first try choosing the [fallback](#Image%5Fcreation%5Fand%5Factivation) image from your [boot loader](https://wiki.archlinux.org/title/Boot%5Floader "Boot loader"), as it is not filtered by `autodetect`. Once booted, run _mkinitcpio_ on the new machine to rebuild the primary image with the correct modules. If the fallback image fails, try booting into an Arch Linux live CD/USB, chroot into the installation, and run _mkinitcpio_ on the new machine. As a last resort, try [manually](#MODULES) adding modules to the initramfs.

## See also

* Linux Kernel documentation on [initramfs, "What is rootfs?"](https://docs.kernel.org/filesystems/ramfs-rootfs-initramfs.html#what-is-rootfs)
* Linux Kernel documentation on [initrd](https://docs.kernel.org/admin-guide/initrd.html)
* Wikipedia article on [initrd](https://en.wikipedia.org/wiki/initrd "wikipedia:initrd")



# links
[Read on Omnivore](https://omnivore.app/me/mkinitcpio-arch-wiki-18b3aa3ea0b)
[Read Original](https://wiki.archlinux.org/title/Mkinitcpio)

<iframe src="https://wiki.archlinux.org/title/Mkinitcpio"  width="800" height="500"></iframe>
