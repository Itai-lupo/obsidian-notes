## background
my main computer is not working well, I want to reinstall it fresh and I want to do it better this time around

## partitions
in my main disk:

- `/` (`/Dev` `/etc` `/root` `/run` `/opt` `/mnt` `/media`) 40 GB (for mounting large files)
- `/usr` (`/bin` `/sbin` `/lib` `/lib64`) && mkfs.ext4 GB
- `/tmp` 8 GB (download file size max 6 GB)
- `/var` 20 GB (don't want Linux jamming keep big)
- `/boot` 1280 MB
- `/home` (rest)
- `/home/bin` 512 MB

/ will be mounted with `noexec` `nosuid` `nodev` and read only except for /etc
/usr will be read only but when system update it will be remounted with rw and will have `nodev`
/tmp and /var because you can't make read only and want to use `nodev` `nosuid` `noexec`.
/boot read only with `nodev` `nosuid` `noexec`.

in the second disk I will have one storage ext4 read and write file system that will mounted as needed and a second partitions which I will leave empty for now

and /home/bin will have +x and /home won't so scripts will only be able to run from /home/bin by default

I will also use a logical volume manger it will allow me to have raid if I want in the future and resize my partitions if I ever need to
and I will also be able to create snapshots from time to time that I can save
[LVM - ArchWiki](https://wiki.archlinux.org/title/LVM)

but better yet is btrfs give all of that and comprission and good snapshots.
and I will use time shift and keep backups in my free partition

---


## boot manger
there are many options for a boot manger 
- grub - I used it, it is not much fun by my exprince
- systemmd boot - simple and fast but to much work 
- refind - good and feature full with out much work

for now I will go with refind it is easy and good

long story short.
having usr on a different btrfs sub volume is not easy
you need to add a linux hook using [[mkinitcpio]] and have it config on the [[fstab]].
you also need to miss around with [[grub]] a little so it will have the right entrys for [[btrfs]].
as of now I use grub and I will try to move to [[refind]] once the system is fully working 