---
id: a78832b8-6c74-11ee-9ca8-772def5ccf10
title: Unified kernel image - ArchWiki
tags:
  - linux
  - boot
date: 2023-10-17 01:38:02
words_count: 2185
state: INBOX
---

# Unified kernel image - ArchWiki by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A unified kernel image (UKI) is a single executable which can be booted directly from UEFI firmware, or automatically sourced by boot-loaders with little or no configuration.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
A [unified kernel image](https://uapi-group.org/specifications/specs/boot%5Floader%5Fspecification/#type-2-efi-unified-kernel-images) (UKI) is a single executable which can be booted directly from UEFI firmware, or automatically sourced by boot-loaders with little or no configuration. 

Although Arch supported kernels themselves [can be loaded by UEFI firmware](https://wiki.archlinux.org/title/EFISTUB "EFISTUB"), a unified image allows to incorporate all or a subset of the following:

* a UEFI stub loader like [systemd-stub(7)](https://man.archlinux.org/man/systemd-stub.7),
* the [kernel command line](https://wiki.archlinux.org/title/Kernel%5Fcommand%5Fline "Kernel command line"),
* [microcode](https://wiki.archlinux.org/title/Microcode "Microcode"),
* an [initramfs image](https://wiki.archlinux.org/title/Arch%5Fboot%5Fprocess#initramfs "Arch boot process"),
* a [kernel image](https://wiki.archlinux.org/title/Arch%5Fboot%5Fprocess#Kernel "Arch boot process"),
* a splash screen.

The resulting executable, and therefore all these elements can then be easily [signed](https://wiki.archlinux.org/title/Unified%5FExtensible%5FFirmware%5FInterface/Secure%5FBoot#Signing%5FEFI%5Fbinaries "Unified Extensible Firmware Interface/Secure Boot") for use with [Secure Boot](https://wiki.archlinux.org/title/Secure%5FBoot "Secure Boot").

**Note:** In the entire article `esp` denotes the mountpoint of the [EFI system partition](https://wiki.archlinux.org/title/EFI%5Fsystem%5Fpartition "EFI system partition").

### mkinitcpio

#### Kernel command line

[mkinitcpio](https://wiki.archlinux.org/title/Mkinitcpio "Mkinitcpio") supports reading [kernel parameters](https://wiki.archlinux.org/title/Kernel%5Fparameters "Kernel parameters") from command line files in the `/etc/cmdline.d` directory. Mkinitcpio will concatenate the contents of all files with a `.conf` extension in this directory and use them to generate the kernel command line. Any lines in the command line file that start with a **#** character are treated as comments and ignored by mkinitcpio. Take care to **remove entries** pointing to microcode and initramfs. 

For example:

/etc/cmdline.d/root.conf

root=UUID=0a3407de-014b-458b-b5c1-848e92a327a3 rw

**Tip:**

* If your root file system is on a non-default Btrfs subvolume, make sure to set necessary mount flags in `rootflags`. See [Btrfs#Mounting subvolume as root](https://wiki.archlinux.org/title/Btrfs#Mounting%5Fsubvolume%5Fas%5Froot "Btrfs").
* For example, if your system subvolume ID is `256` (you can see your subvolume ID using `btrfs subvolume list btrfs_mountpoint`, or you can see the flags in `/etc/fstab`), you should add `rootflags=subvolid=256` to your kernel command line.
* It is not necessary to copy all flags in `/etc/fstab` since `rootflags` is only used during boot. Systemd will read fstab, remount and apply flags listed there automatically after boot.

/etc/cmdline.d/security.conf

# enable apparmor
lsm=landlock,lockdown,yama,integrity,apparmor,bpf audit=1 audit_backlog_limit=256

Alternatively, `/etc/kernel/cmdline` can be used to configure the kernel command line.

For example:

/etc/kernel/cmdline

root=UUID=0a3407de-014b-458b-b5c1-848e92a327a3 rw quiet bgrt_disable

**Tip:**

* The `root=` parameter may be omitted if the root partition is [automounted by systemd](https://wiki.archlinux.org/title/Systemd#GPT%5Fpartition%5Fautomounting "Systemd").
* The `bgrt_disable` parameter tells Linux to not display the OEM logo after loading the ACPI tables.

#### .preset file

Next, modify `/etc/mkinitcpio.d/linux.preset`, or the preset that you are using, as follows, with the appropriate mount point of the [EFI system partition](https://wiki.archlinux.org/title/EFI%5Fsystem%5Fpartition "EFI system partition") :

* Un-comment (i.e. remove `#`) the `PRESET_uki=` parameter for each item in `PRESETS=`,
* Optionally, comment out `PRESET_image=` to avoid storing a redundant `initramfs-*.img` file,
* Optionally, add or un-comment the `--splash` parameter to each `PRESET_options=` line for which you want to add a splash image.

Here is a working example `linux.preset` for the [linux](https://archlinux.org/packages/?name=linux) kernel and the Arch splash screen.

/etc/mkinitcpio.d/linux.preset

# mkinitcpio preset file for the 'linux' package

#ALL_config="/etc/mkinitcpio.conf"
ALL_kver="/boot/vmlinuz-linux"
ALL_microcode=(/boot/*-ucode.img)

PRESETS=('default' 'fallback')

#default_config="/etc/mkinitcpio.conf"
#default_image="/boot/initramfs-linux.img"
default_uki="_esp_/EFI/Linux/arch-linux.efi"
default_options="--splash=/usr/share/systemd/bootctl/splash-arch.bmp"

#fallback_config="/etc/mkinitcpio.conf"
#fallback_image="/boot/initramfs-linux-fallback.img"
fallback_uki="_esp_/EFI/Linux/arch-linux-fallback.efi"
fallback_options="-S autodetect"

**Tip:**

* If all you want to do is boot from the unified kernel images, you can [mount the ESP](https://wiki.archlinux.org/title/EFI%5Fsystem%5Fpartition#Typical%5Fmount%5Fpoints "EFI system partition") to `/efi` and only those need to reside on the [ESP](https://wiki.archlinux.org/title/ESP "ESP") partition.
* You can append `--cmdline /etc/kernel/fallback_cmdline` to `fallback_options` to use different a different [cmdline](#Kernel%5Fcommand%5Fline) than above for the fallback image (e.g. without `quiet`).
* To omit embedding the kernel command line, add `--no-cmdline` to `PRESET_options=`. Kernel parameters will need to be passed via the boot loader.

**Note:**

* `PRESET_uki` options were previously known as `PRESET_efi_image`, [changed November 2022](https://gitlab.archlinux.org/archlinux/mkinitcpio/mkinitcpio/-/issues/134), with older option deprecated but working for now.
* For [IA32 UEFI](https://wiki.archlinux.org/title/Unified%5FExtensible%5FFirmware%5FInterface#UEFI%5Ffirmware%5Fbitness "Unified Extensible Firmware Interface"), add `--uefistub /usr/lib/systemd/boot/efi/linuxia32.efi.stub` to `PRESET_options=`.

#### pacman hook

A [pacman hook](https://wiki.archlinux.org/title/Pacman%5Fhook "Pacman hook") is needed to trigger a rebuild after a microcode upgrade.

/etc/pacman.d/hooks/ucode.hook

[Trigger]
Operation=Install
Operation=Upgrade
Operation=Remove
Type=Package
# Change to appropriate microcode package
Target=amd-ucode
# Change the linux part above and in the Exec line if a different kernel is used
Target=linux

[Action]
Description=Update Microcode module in initcpio
Depends=mkinitcpio
When=PostTransaction
NeedsTargets
Exec=/bin/sh -c 'while read -r trg; do case $trg in linux) exit 0; esac; done; /usr/bin/mkinitcpio -P'

**Tip:** Consider merging this hook with other hooks that monitor the kernel package, such as the one for the [NVIDIA driver](https://wiki.archlinux.org/title/NVIDIA#pacman%5Fhook "NVIDIA"), to avoid repeated mkinitcpio runs.

#### Signing the UKIs for Secure Boot

By using a mkinitcpio post hook ([mkinitcpio(8) § ABOUT POST HOOKS](https://man.archlinux.org/man/mkinitcpio.8#ABOUT%5FPOST%5FHOOKS)), the generated unified kernel images can be signed for [Secure Boot](https://wiki.archlinux.org/title/Secure%5FBoot "Secure Boot"). [Create](https://wiki.archlinux.org/title/Create "Create") the following file and make it [executable](https://wiki.archlinux.org/title/Executable "Executable"):

/etc/initcpio/post/uki-sbsign

#!/usr/bin/env bash

uki="$3"
[[ -n "$uki" ]] || exit 0

keypairs=(_/path/to/_db.key _/path/to/_db.crt)

for (( i=0; i<${#keypairs[@]}; i+=2 )); do
    key="${keypairs[$i]}" cert="${keypairs[(( i + 1 ))]}"
    if ! sbverify --cert "$cert" "$uki" &>/dev/null; then
        sbsign --key "$key" --cert "$cert" --output "$uki" "$uki"
    fi
done

Replace `/path/to/db.key` and `/path/to/db.crt` with the paths to the key pair you want to use for signing the image.

#### Building the UKIs

Finally, make sure that the directory for the UKIs exists and [regenerate the initramfs](https://wiki.archlinux.org/title/Regenerate%5Fthe%5Finitramfs "Regenerate the initramfs"). For example, for the _linux_ preset:

# mkdir -p _esp_/EFI/Linux
# mkinitcpio -p linux

Optionally, remove any leftover `initramfs-*.img` from `/boot` or `/efi`.

### kernel-install

You can use [systemd](https://wiki.archlinux.org/title/Systemd "Systemd")'s [kernel-install(8)](https://man.archlinux.org/man/kernel-install.8) script to automatically install kernels in the UKI format to the _esp_ both for custom kernels and for kernel packages (installed using Pacman) by switching Pacman hooks from _mkinitcpio_ to _kernel-install_. 

`kernel-install` is not an initramfs generator, but it is a framework where packages can hook into the installation/generation of kernels of the system, through its "plugin" system. During its execution it will call the proper initramfs generator of the system (i.e.: _mkinitcpio_). The plugins are involved in kernel image/initramfs generation, signing, installation, etc. Packages that care about doing something during kernel installation can be notified by installing their own "plugin" for `kernel-install`. (The "plugins" are located in `/usr/lib/kernel/install.d/`.)

There are configuration options like "layout" available that affect where and how the kernel is installed when `kernel-install` is getting called.

_mkinitcpio_ ships with a `kernel-install` plugin that generates the appropriate image (a UKI image for layout=uki). Other programs, such as [sbctl](https://archlinux.org/packages/?name=sbctl), also ship with a `kernel-install` plugin.

To setup kernel-install to produce UKIs:

* Set the kernel-install layout to 'uki'. e.g.:  
# echo "layout=uki" >> /etc/kernel/install.conf
* Mask the direct kernel installation Pacman hooks:  
# ln -s /dev/null /etc/pacman.d/hooks/60-mkinitcpio-remove.hook  
# ln -s /dev/null /etc/pacman.d/hooks/90-mkinitcpio-install.hook
* Create a Pacman hook for _kernel-install_. You can use [pacman-hook-kernel-install](https://aur.archlinux.org/packages/pacman-hook-kernel-install/)AUR.
* Remove and reinstall the kernel packages that you use.

### dracut

See [dracut#Unified kernel image](https://wiki.archlinux.org/title/Dracut#Unified%5Fkernel%5Fimage "Dracut") and [dracut#Generate a new initramfs on kernel upgrade](https://wiki.archlinux.org/title/Dracut#Generate%5Fa%5Fnew%5Finitramfs%5Fon%5Fkernel%5Fupgrade "Dracut").

### sbctl

[Install](https://wiki.archlinux.org/title/Install "Install") the [sbctl](https://archlinux.org/packages/?name=sbctl) package. Store the kernel command line in `/etc/kernel/cmdline`. Use the `sbctl bundle` command with the `--save` parameter to create a bundle and have it be regenerated by a Pacman hook at appropriate times:

# sbctl bundle --save _esp_/EFI/Linux/arch-linux.efi

To create more EFI binaries for other kernels and initramfs images, repeat the above command with parameters `--kernel-img` and `--initramfs`, see [sbctl(8) § EFI BINARY COMMANDS](https://man.archlinux.org/man/sbctl.8#EFI%5FBINARY%5FCOMMANDS). The EFI binaries can be regenerated at any time with `sbctl generate-bundles`.

### ukify

[Install](https://wiki.archlinux.org/title/Install "Install") the [systemd-ukify](https://archlinux.org/packages/?name=systemd-ukify) package. Since _ukify_ cannot generate an initramfs on its own, if required, it must be generated using [dracut](https://wiki.archlinux.org/title/Dracut "Dracut"), [mkinitcpio](https://wiki.archlinux.org/title/Mkinitcpio "Mkinitcpio") or [booster](https://wiki.archlinux.org/title/Booster "Booster").

A minimal working example can look something like this:

# /usr/lib/systemd/ukify build --linux=_/boot/vmlinuz-linux_ --initrd=_/boot/intel-ucode.img_ \
--initrd=_/boot/initramfs-linux.img_ \
--cmdline="_quiet rw_"

**Note:** If [external microcode initramfs images](https://wiki.archlinux.org/title/Microcode#Early%5Floading "Microcode") are used (`/boot/amd-ucode.img` or `/boot/intel-ucode.img`), they must always be placed **first**, before the main initramfs image (e.g. `/boot/initramfs-linux.img`).

Then, copy the resulting file to the EFI system partition:

# cp _filename_.efi _esp_/EFI/Linux/

**Tip:**

* To skip having copy over the resulting EFI executable to the EFI System Partition, use the `--output=esp/EFI/Linux/filename.efi` command line option to _ukify_.
* When specifying the `--cmdline` option, one can specify a file name to read the kernel parameters from (e.g. `/etc/kernel/cmdline` by adding the `@` symbol before the file name, like `--cmdline=@/path/to/cmdline`.

An example for automatic UKI building with a systemd service for normal kernel image with intel ucode and /efi mounted ESP:

/etc/ukify.conf

[UKI]
Linux=/boot/vmlinuz-linux
Initrd=/boot/intel-ucode.img /boot/initramfs-linux.img
Cmdline=@/etc/kernel/cmdline
OSRelease=@/etc/os-release
Splash=/usr/share/systemd/bootctl/splash-arch.bmp

**Note:** If the initramfs generator already bundles CPU microcode by default such as mkinitcpio, then only specify the initramfs image in `Initrd=/boot/initramfs-linux.img`.

/etc/systemd/system/run_ukify.service

[Unit]
Description=Run systemd ukify
[Service]
Type=oneshot
ExecStart=/usr/lib/systemd/ukify build --config=/etc/ukify.conf --output _esp_/EFI/Linux/archlinux-linux.efi

/etc/systemd/system/run_ukify.path

[Unit]
Description=Run systemd ukify
[Path]
PathChanged=/boot/initramfs-linux.img
PathChanged=/boot/intel-ucode.img
Unit=run_ukify.service
[Install]
WantedBy=multi-user.target

Then [enable](https://wiki.archlinux.org/title/Enable "Enable") `run_ukify.path`.

### Manually

Put the kernel command line you want to use in a file, and create the bundle file using [objcopy(1)](https://man.archlinux.org/man/objcopy.1).

For [microcode](https://wiki.archlinux.org/title/Microcode "Microcode"), first concatenate the microcode file and your initrd, as follows:

$ cat _esp_/_cpumanufacturer_-ucode.img _esp_/initramfs-linux.img > /tmp/combined_initrd.img

When building the unified kernel image, pass in `/tmp/combined_initrd.img` as the initrd. This file can be removed afterwards.

**Note:** For [IA32 UEFI](https://wiki.archlinux.org/title/Unified%5FExtensible%5FFirmware%5FInterface#UEFI%5Ffirmware%5Fbitness "Unified Extensible Firmware Interface"), replace `/usr/lib/systemd/boot/efi/linuxx64.efi.stub` with `/usr/lib/systemd/boot/efi/linuxia32.efi.stub` in the following commands.

$ align="$(objdump -p /usr/lib/systemd/boot/efi/linuxx64.efi.stub | awk '{ if ($1 == "SectionAlignment"){print $2} }')"
$ align=$((16#$align))
$ osrel_offs="$(objdump -h "/usr/lib/systemd/boot/efi/linuxx64.efi.stub" | awk 'NF==7 {size=strtonum("0x"$3); offset=strtonum("0x"$4)} END {print size + offset}')"
$ osrel_offs=$((osrel_offs + "$align" - osrel_offs % "$align"))
$ cmdline_offs=$((osrel_offs + $(stat -Lc%s "/usr/lib/os-release")))
$ cmdline_offs=$((cmdline_offs + "$align" - cmdline_offs % "$align"))
$ splash_offs=$((cmdline_offs + $(stat -Lc%s "/etc/kernel/cmdline")))
$ splash_offs=$((splash_offs + "$align" - splash_offs % "$align"))
$ initrd_offs=$((splash_offs + $(stat -Lc%s "/usr/share/systemd/bootctl/splash-arch.bmp")))
$ initrd_offs=$((initrd_offs + "$align" - initrd_offs % "$align"))
$ linux_offs=$((initrd_offs + $(stat -Lc%s "_initrd-file_")))
$ linux_offs=$((linux_offs + "$align" - linux_offs % "$align"))

$ objcopy \
    --add-section .osrel="/usr/lib/os-release" --change-section-vma .osrel=$(printf 0x%x $osrel_offs) \
    --add-section .cmdline="/etc/kernel/cmdline" \
    --change-section-vma .cmdline=$(printf 0x%x $cmdline_offs) \
    --add-section .splash="/usr/share/systemd/bootctl/splash-arch.bmp" \
    --change-section-vma .splash=$(printf 0x%x $splash_offs) \
    --add-section .initrd="_initrd-file_" \
    --change-section-vma .initrd=$(printf 0x%x $initrd_offs) \
    --add-section .linux="_vmlinuz-file_" \
    --change-section-vma .linux=$(printf 0x%x $linux_offs) \
    "/usr/lib/systemd/boot/efi/linuxx64.efi.stub" "_linux_.efi"

A few things to note:

* The offsets are dynamically calculated so no sections overlap, as recommended in [\[1\]](https://github.com/systemd/systemd/commit/0fa2cac4f0cdefaf1addd7f1fe0fd8113db9360b#commitcomment-76747223).
* The sections are aligned to what the `SectionAlignment` field of the PE stub indicates (usually 0x1000).
* The kernel image must be in the last section, to prevent in-place decompression from overwriting the sections that follow, as stated in [\[2\]](https://github.com/systemd/systemd/commit/0fa2cac4f0cdefaf1addd7f1fe0fd8113db9360b#commitcomment-84868898).

After creating the image, copy it to the EFI system partition:

# cp _linux_.efi _esp_/EFI/Linux/

## Booting

**Note:** When [Secure Boot](https://wiki.archlinux.org/title/Secure%5FBoot "Secure Boot") is active, unified kernel images with an embedded `.cmdline` ignore all command line options passed to them (either using a boot entry or interactively). When Secure Boot is not active, the options passed via the command line override the embedded `.cmdline`.

### systemd-boot

[systemd-boot](https://wiki.archlinux.org/title/Systemd-boot#Unified%5Fkernel%5Fimages "Systemd-boot") searches in `esp/EFI/Linux/` for unified kernel images, and there is no further configuration needed. See [sd-boot(7) § FILES](https://man.archlinux.org/man/sd-boot.7#FILES) 

### rEFInd

[rEFInd](https://wiki.archlinux.org/title/REFInd "REFInd") will autodetect unified kernel images on your EFI system partition, and is capable of loading them. They can also be manually specified in `refind.conf`, by default located at:

_esp_/EFI/refind/refind.conf

menuentry "Arch Linux" {
    icon \EFI\refind\icons\os_arch.png
    ostype Linux
    loader \EFI\Linux\arch-linux.efi
}

Recall that no kernel parameters from `esp/EFI/refind_linux.conf` will be passed when booting this way. If the UKI was generated without a `.cmdline` section, specify the kernel parameters in the menu entry with an `options` line.

### GRUB

Similar to rEFInd, [GRUB](https://wiki.archlinux.org/title/GRUB "GRUB") can chainload EFI UKIs as described in [GRUB#Chainloading a unified kernel image](https://wiki.archlinux.org/title/GRUB#Chainloading%5Fa%5Funified%5Fkernel%5Fimage "GRUB").

### Directly from UEFI

[efibootmgr](https://wiki.archlinux.org/title/Efibootmgr "Efibootmgr") can be used to create a UEFI boot entry for the _.efi_ file:

# efibootmgr --create --disk /dev/sd_X_ --part _partitionnumber_ --label "Arch Linux" --loader '\EFI\Linux\arch-linux.efi' --unicode

See [efibootmgr(8)](https://man.archlinux.org/man/efibootmgr.8) for an explanation of the options.

## See also

* [Unified kernel image specification](https://uapi-group.org/specifications/specs/unified%5Fkernel%5Fimage/)
* [mkinitcpio v31 and UEFI stubs](https://linderud.dev/blog/mkinitcpio-v31-and-uefi-stubs/)



# links
[Read on Omnivore](https://omnivore.app/me/unified-kernel-image-arch-wiki-18b3aa39b68)
[Read Original](https://wiki.archlinux.org/title/Unified_kernel_image)

<iframe src="https://wiki.archlinux.org/title/Unified_kernel_image"  width="800" height="500"></iframe>
