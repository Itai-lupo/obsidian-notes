---
id: e060bab0-6c74-11ee-84be-6b021c833495
title: pacman - ArchWiki
tags:
  - linux
  - ppm
date: 2023-10-17 01:39:46
words_count: 5853
state: INBOX
---

# pacman - ArchWiki by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Related articles


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Related articles

* [Creating packages](https://wiki.archlinux.org/title/Creating%5Fpackages "Creating packages")
* [Downgrading packages](https://wiki.archlinux.org/title/Downgrading%5Fpackages "Downgrading packages")
* [pacman/Package signing](https://wiki.archlinux.org/title/Pacman/Package%5Fsigning "Pacman/Package signing")
* [pacman/Pacnew and Pacsave](https://wiki.archlinux.org/title/Pacman/Pacnew%5Fand%5FPacsave "Pacman/Pacnew and Pacsave")
* [pacman/Restore local database](https://wiki.archlinux.org/title/Pacman/Restore%5Flocal%5Fdatabase "Pacman/Restore local database")
* [pacman/Rosetta](https://wiki.archlinux.org/title/Pacman/Rosetta "Pacman/Rosetta")
* [pacman/Tips and tricks](https://wiki.archlinux.org/title/Pacman/Tips%5Fand%5Ftricks "Pacman/Tips and tricks")
* [FAQ#Package management](https://wiki.archlinux.org/title/FAQ#Package%5Fmanagement "FAQ")
* [System maintenance](https://wiki.archlinux.org/title/System%5Fmaintenance "System maintenance")
* [Arch build system](https://wiki.archlinux.org/title/Arch%5Fbuild%5Fsystem "Arch build system")
* [Official repositories](https://wiki.archlinux.org/title/Official%5Frepositories "Official repositories")
* [Arch User Repository](https://wiki.archlinux.org/title/Arch%5FUser%5FRepository "Arch User Repository")

The [pacman](https://archlinux.org/pacman/) [package manager](https://en.wikipedia.org/wiki/Package%5Fmanager "wikipedia:Package manager") is one of the major distinguishing features of Arch Linux. It combines a simple binary package format with an easy-to-use [build system](https://wiki.archlinux.org/title/Arch%5Fbuild%5Fsystem "Arch build system"). The goal of _pacman_ is to make it possible to easily manage packages, whether they are from the [official repositories](https://wiki.archlinux.org/title/Official%5Frepositories "Official repositories") or the user's own builds.

Pacman keeps the system up-to-date by synchronizing package lists with the master server. This server/client model also allows the user to download/install packages with a simple command, complete with all required dependencies.

Pacman is written in the [C](https://wiki.archlinux.org/title/C "C") programming language and uses the [bsdtar(1)](https://man.archlinux.org/man/bsdtar.1) [tar](https://en.wikipedia.org/wiki/tar%5F%28computing%29 "w:tar (computing)") format for packaging.

**Tip:** The [pacman](https://archlinux.org/packages/?name=pacman) package contains tools such as [makepkg](https://wiki.archlinux.org/title/Makepkg "Makepkg") and [vercmp(8)](https://man.archlinux.org/man/vercmp.8). Other useful tools such as [pactree](#Pactree) and [checkupdates](https://wiki.archlinux.org/title/Checkupdates "Checkupdates") are found in [pacman-contrib](https://archlinux.org/packages/?name=pacman-contrib) ([formerly](https://gitlab.archlinux.org/pacman/pacman/commit/0c99eabd50752310f42ec808c8734a338122ec86) part of _pacman_). Run `pacman -Ql pacman pacman-contrib | grep -E 'bin/.+'` to see the full list.

## Usage

What follows is just a small sample of the operations that _pacman_ can perform. To read more examples, refer to [pacman(8)](https://man.archlinux.org/man/pacman.8).

**Tip:** For those who have used other Linux distributions before, there is a helpful [Pacman Rosetta](https://wiki.archlinux.org/title/Pacman%5FRosetta "Pacman Rosetta") article.

### Installing packages

A package is an archive containing:

* all of the (compiled) files of an application
* metadata about the application, such as application name, version, dependencies, etc.
* installation files and directives for _pacman_
* (optionally) extra files to make your life easier, such as a start/stop script

Arch's package manager _pacman_ can install, update, and remove those packages. Using packages instead of compiling and installing programs yourself has various benefits:

* easily updatable: _pacman_ will update existing packages as soon as updates are available
* dependency checks: _pacman_ handles dependencies for you, you only need to specify the program and _pacman_ installs it together with every other program it needs
* clean removal: _pacman_ has a list of every file in a package; this way, no files are unintentionally left behind when you decide to remove a package.

**Note:**

* Packages often have [optional dependencies](https://wiki.archlinux.org/title/PKGBUILD#optdepends "PKGBUILD") which are packages that provide additional functionality to the application but not strictly required for running it. When installing a package, _pacman_ will list a package's optional dependencies, but they will not be found in `pacman.log`. Use the [#Querying package databases](#Querying%5Fpackage%5Fdatabases) command to view the optional dependencies of a package.
* When installing a package which you require only as a (optional) dependency of some other package (i.e. not required by you explicitly), it is recommended to use the `--asdeps` option. For details, see the [#Installation reason](#Installation%5Freason) section.

**Warning:** When installing packages in Arch, avoid refreshing the package list without [upgrading the system](#Upgrading%5Fpackages) (for example, when a [package is no longer found](#Packages%5Fcannot%5Fbe%5Fretrieved%5Fon%5Finstallation) in the official repositories). In practice, do **not** run `pacman -Sy package_name` instead of `pacman -Syu package_name`, as this could lead to dependency issues. See [System maintenance#Partial upgrades are unsupported](https://wiki.archlinux.org/title/System%5Fmaintenance#Partial%5Fupgrades%5Fare%5Funsupported "System maintenance") and [BBS#89328](https://bbs.archlinux.org/viewtopic.php?id=89328).

#### Installing specific packages

To install a single package or list of packages, including dependencies, issue the following command:

# pacman -S _packagename1_ _packagename2_ ...

To install a list of packages with regex (see [this forum thread](https://bbs.archlinux.org/viewtopic.php?id=7179)):

# pacman -S $(pacman -Ssq _packageregex_)

Sometimes there are multiple versions of a package in different repositories (e.g. _extra_ and _testing_). To install the version from the _extra_ repository in this example, the repository needs to be defined in front of the package name:

# pacman -S extra/_packagename_

To install a number of packages sharing similar patterns in their names, one can use curly brace expansion. For example:

# pacman -S plasma-{desktop,mediacenter,nm}

This can be expanded to however many levels needed:

# pacman -S plasma-{workspace{,-wallpapers},pa}

##### Virtual packages

A virtual package is a special package which does not exist by itself, but is [provided](https://wiki.archlinux.org/title/PKGBUILD#provides "PKGBUILD") by one or more other packages. Virtual packages allow other packages to not name a specific package as a dependency, in case there are several candidates. Virtual packages cannot be installed by their name, instead they become installed in your system when you have installed a package _providing_ the virtual package.

**Tip:** When there are multiple candidates, the list of choices presented will sort first by [repositories](https://wiki.archlinux.org/title/Repositories "Repositories") in the order they appear in `pacman.conf`, then alphabetically when multiple results exist from the same repository.

#### Installing package groups

Some packages belong to a [group of packages](https://wiki.archlinux.org/title/Package%5Fgroup "Package group") that can all be installed simultaneously. For example, issuing the command:

# pacman -S gnome

will prompt you to select the packages from the [gnome](https://archlinux.org/groups/x86%5F64/gnome/) group that you wish to install.

Sometimes a package group will contain a large amount of packages, and there may be only a few that you do or do not want to install. Instead of having to enter all the numbers except the ones you do not want, it is sometimes more convenient to select or exclude packages or ranges of packages with the following syntax:

Enter a selection (default=all): 1-10 15

which will select packages 1 through 10 and 15 for installation, or:

Enter a selection (default=all): ^5-8 ^2

which will select all packages except 5 through 8 and 2 for installation.

To see what packages belong to the gnome group, run:

$ pacman -Sg gnome

Also visit <https://archlinux.org/groups/> to see what package groups are available.

**Note:** If a package in the list is already installed on the system, it will be reinstalled even if it is already up-to-date. This behavior can be overridden with the `--needed` option.

### Removing packages

To remove a single package, leaving all of its dependencies installed:

# pacman -R _packagename_

To remove a package and its dependencies which are not required by any other installed package:

# pacman -Rs _packagename_

**Warning:** When removing a group, such as _gnome_, this ignores the install reason of the packages in the group, because it acts as though each package in the group is listed separately. Install reason of dependencies is still respected.

The above may sometimes refuse to run when removing a group which contains otherwise needed packages. In this case try:

# pacman -Rsu _packagename_

To remove a package, its dependencies and all the packages that depend on the target package:

**Warning:** This operation is recursive, and must be used with care since it can remove many potentially needed packages.

# pacman -Rsc _packagename_

To remove a package, which is required by another package, without removing the dependent package:

# pacman -Rdd _packagename_

Pacman saves important configuration files when removing certain applications and names them with the extension: _.pacsave_. To prevent the creation of these backup files use the `-n` option:

# pacman -Rn _packagename_

**Note:** Pacman will not remove configurations that the application itself creates (for example "dotfiles" in the home directory).

### Upgrading packages

**Warning:**

* Users are expected to follow the guidance in the [System maintenance#Upgrading the system](https://wiki.archlinux.org/title/System%5Fmaintenance#Upgrading%5Fthe%5Fsystem "System maintenance") section to upgrade their systems regularly and not blindly run the following command.
* Arch only supports full system upgrades. See [System maintenance#Partial upgrades are unsupported](https://wiki.archlinux.org/title/System%5Fmaintenance#Partial%5Fupgrades%5Fare%5Funsupported "System maintenance") and [#Installing packages](#Installing%5Fpackages) for details.

Pacman can update all packages on the system with just one command. This could take quite a while depending on how up-to-date the system is. The following command synchronizes the repository databases _and_ updates the system's packages, excluding "local" packages that are not in the configured repositories:

# pacman -Syu

### Querying package databases

Pacman queries the local package database with the `-Q` flag, the sync database with the `-S` flag and the files database with the `-F` flag. See `pacman -Q --help`, `pacman -S --help` and `pacman -F --help` for the respective suboptions of each flag.

Pacman can search for packages in the database, searching both in packages' names and descriptions:

$ pacman -Ss _string1_ _string2_ ...

Sometimes, `-s`'s builtin ERE (Extended Regular Expressions) can cause a lot of unwanted results, so it has to be limited to match the package name only; not the description nor any other field:

$ pacman -Ss '^vim-'

To search for already installed packages:

$ pacman -Qs _string1_ _string2_ ...

To search for package file names in remote packages:

$ pacman -F _string1_ _string2_ ...

To display extensive information about a given package:

$ pacman -Si _packagename_

For locally installed packages:

$ pacman -Qi _packagename_

Passing two `-i` flags will also display the list of backup files and their modification states:

$ pacman -Qii _packagename_

To retrieve a list of the files installed by a package:

$ pacman -Ql _packagename_

To retrieve a list of the files installed by a remote package:

$ pacman -Fl _packagename_

To verify the presence of the files installed by a package:

$ pacman -Qk _packagename_

Passing the `k` flag twice will perform a more thorough check.

To query the database to know which package a file in the file system belongs to:

$ pacman -Qo _/path/to/filename_

To query the database to know which remote package a file belongs to:

$ pacman -F _/path/to/filename_

To list all packages no longer required as dependencies (orphans):

$ pacman -Qdt

To list all packages explicitly installed and not required as dependencies:

$ pacman -Qet

See [pacman/Tips and tricks](https://wiki.archlinux.org/title/Pacman/Tips%5Fand%5Ftricks "Pacman/Tips and tricks") for more examples.

#### Pactree

To view the dependency tree of a package:

$ pactree _packagename_

To view the dependant tree of a package, pass the reverse flag `-r` to _pactree_, or use _whoneeds_ from [pkgtools](https://aur.archlinux.org/packages/pkgtools/)AUR.

#### Database structure

The _pacman_ databases are normally located at `/var/lib/pacman/sync`. For each repository specified in `/etc/pacman.conf`, there will be a corresponding database file located there. Database files are gzipped tar archives containing one directory for each package, for example for the [which](https://archlinux.org/packages/?name=which) package:

$ tree which-2.21-5

which-2.21-5
|-- desc

The `desc` file contains meta data such as the package description, dependencies, file size and MD5 hash.

### Cleaning the package cache

Pacman stores its downloaded packages in `/var/cache/pacman/pkg/` and does not remove the old or uninstalled versions automatically. This has some advantages:

1. It allows to [downgrade](https://wiki.archlinux.org/title/Downgrade "Downgrade") a package without the need to retrieve the previous version through other means, such as the [Arch Linux Archive](https://wiki.archlinux.org/title/Arch%5FLinux%5FArchive "Arch Linux Archive").
2. A package that has been uninstalled can easily be reinstalled directly from the cache directory, not requiring a new download from the repository.

However, it is necessary to deliberately clean up the cache periodically to prevent the directory to grow indefinitely in size.

The [paccache(8)](https://man.archlinux.org/man/paccache.8) script, provided within the [pacman-contrib](https://archlinux.org/packages/?name=pacman-contrib) package, deletes all cached versions of installed and uninstalled packages, except for the most recent three, by default:

# paccache -r

[Enable](https://wiki.archlinux.org/title/Enable "Enable") and [start](https://wiki.archlinux.org/title/Start "Start") `paccache.timer` to discard unused packages weekly.

You can also define how many recent versions you want to keep. To retain only one past version use:

# paccache -rk1

Add the `-u`/`--uninstalled` switch to limit the action of _paccache_ to uninstalled packages. For example to remove all cached versions of uninstalled packages, use the following:

# paccache -ruk0

See `paccache -h` for more options.

Pacman also has some built-in options to clean the cache and the leftover database files from repositories which are no longer listed in the configuration file `/etc/pacman.conf`. However _pacman_ does not offer the possibility to keep a number of past versions and is therefore more aggressive than _paccache_ default options.

To remove all the cached packages that are not currently installed, and the unused sync database, execute:

# pacman -Sc

To remove all files from the cache, use the clean switch twice, this is the most aggressive approach and will leave nothing in the cache directory:

# pacman -Scc

**Warning:** One should avoid deleting from the cache all past versions of installed packages and all uninstalled packages unless one desperately needs to free some disk space. This will prevent downgrading or reinstalling packages without downloading them again.

[pkgcacheclean](https://aur.archlinux.org/packages/pkgcacheclean/)AUR and [pacleaner](https://aur.archlinux.org/packages/pacleaner/)AUR are two further alternatives to clean the cache.

### Additional commands

Download a package without installing it:

# pacman -Sw _packagename_

Install a 'local' package that is not from a remote repository (e.g. the package is from the [AUR](https://wiki.archlinux.org/title/AUR "AUR")):

# pacman -U _/path/to/package/packagename-version.pkg.tar.zst_

To keep a copy of the local package in _pacman'_s cache, use:

# pacman -U file:///_path/to/package/packagename-version.pkg.tar.zst_

Install a 'remote' package (not from a repository stated in _pacman'_s configuration files):

# pacman -U _http://www.example.com/repo/example.pkg.tar.zst_

#### dry run

Pacman always lists packages to be installed or removed and asks for permission before it takes action.

To acquire a list in a processable format and inhibit the actions of `-S`, `-U` and `-R`, `-p`, short for `--print` can be used.

`--print-format` can be added to format this list in various ways. `--print-format %n` will return a list without package versions.

### Installation reason

The _pacman_ database organizes installed packages into two groups, according to installation reason:

* **explicitly-installed**: packages that were literally passed to a generic _pacman_ `-S` or `-U` command;
* **dependencies**: packages that, despite never (in general) having been passed to a _pacman_ installation command, were _implicitly_ installed because they were [required](https://wiki.archlinux.org/title/Dependency "Dependency") by packages explicitly installed.

When installing a package, it is possible to force its installation reason to _dependency_ with:

# pacman -S --asdeps _packagename_

The command is normally used because explicitly-installed packages may offer [optional packages](https://wiki.archlinux.org/title/Optdepends "Optdepends"), usually for non-essential features for which the user has discretion.

**Tip:** Installing optional dependencies with `--asdeps` will ensure that, if you [remove orphans](https://wiki.archlinux.org/title/Pacman/Tips%5Fand%5Ftricks#Removing%5Funused%5Fpackages%5F%28orphans%29 "Pacman/Tips and tricks"), _pacman_ will also remove optional packages set this way.

When **re**installing a package, though, the current installation reason is preserved by default.

The list of explicitly-installed packages can be shown with `pacman -Qe`, while the complementary list of dependencies can be shown with `pacman -Qd`.

To change the installation reason of an already installed package, execute:

# pacman -D --asdeps _packagename_

Use `--asexplicit` to do the opposite operation.

**Note:** Using `--asdeps` and `--asexplicit` options when upgrading, such as with `pacman -Syu package_name --asdeps`, is discouraged. This would change the installation reason of not only the package being installed, but also the packages being upgraded.

### Search for a package that contains a specific file

[](https://wiki.archlinux.org/title/File:Merge-arrows-2.png)**This article or section is a candidate for merging with [pacman/Tips and tricks](https://wiki.archlinux.org/title/Pacman/Tips%5Fand%5Ftricks "Pacman/Tips and tricks").**[](https://wiki.archlinux.org/title/File:Merge-arrows-2.png)

**Notes:** Looking at [#Querying package databases](#Querying%5Fpackage%5Fdatabases) this section duplicates but expands what is already covered there. Either this should be moved inside the previous section or merged as a pacman tip in the dedicated article, which is already linked (Discuss in [Talk:Pacman](https://wiki.archlinux.org/title/Talk:Pacman))

Sync the files database:

# pacman -Fy

Search for a package containing a file, e.g.:

$ pacman -F pacman

core/pacman 5.2.1-1 (base base-devel) [installed]
    usr/bin/pacman
    usr/share/bash-completion/completions/pacman
extra/xscreensaver 5.43-1
    usr/lib/xscreensaver/pacman

**Tip:** You can [enable/start](https://wiki.archlinux.org/title/Enable/start "Enable/start") `pacman-filesdb-refresh.timer` to refresh pacman files database weekly.

For advanced functionality, install [pkgfile](https://wiki.archlinux.org/title/Pkgfile "Pkgfile"), which uses a separate database with all files and their associated packages.

### What happens during package install/upgrade/removal

When successful, the workflow of a transaction follows five high-level steps plus pre/post transaction hooks:

1. Initialize the transaction if there is not a database lock
2. Choose which packages will be added or removed in the transaction
3. Prepare the transaction, based on flags, by performing sanity checks on the sync databases, packages, and their dependencies
4. Commit the transaction:  
   1. When applicable, download packages (`_alpm_sync_load`)  
   2. If pre-existing _pacman_ `PreTransaction` hooks apply, they are executed.  
   3. Packages are removed that are to-be-replaced, conflicting, or explicitly targeted to be removed  
   4. If there are packages to add, then each package is committed  
         1. If the package has an install script, its `pre_install` function is executed (or `pre_upgrade` or `pre_remove` in the case of an upgraded or removed package).  
         2. Pacman deletes all the files from a pre-existing version of the package (in the case of an upgraded or removed package). However, files that were marked as configuration files in the package are kept (see [/Pacnew and Pacsave](https://wiki.archlinux.org/title/Pacman/Pacnew%5Fand%5FPacsave "Pacman/Pacnew and Pacsave")).  
         3. Pacman untars the package and dumps its files into the file system (in the case of an installed or upgraded package). Files that would overwrite kept, and manually modified, configuration files (see previous step), are stored with a new name (.pacnew).  
         4. If the package has an install script, its `post_install` function is executed (or `post_upgrade` or `post_remove` in the case of an upgraded or removed package).  
   5. If _pacman_ `PostTransaction` hooks that exist at the end of the transaction apply, they are executed.
5. Release the transaction and transaction resource (i.e. database lock)

## Configuration

Pacman's settings are located in `/etc/pacman.conf`: this is the place where the user configures the program to work in the desired manner. In-depth information about the configuration file can be found in [pacman.conf(5)](https://man.archlinux.org/man/pacman.conf.5).

### General options

General options are in the `[options]` section. Read [pacman.conf(5)](https://man.archlinux.org/man/pacman.conf.5) or look in the default `pacman.conf` for information on what can be done here.

#### Comparing versions before updating

To see old and new versions of available packages, uncomment the "VerbosePkgLists" line in `/etc/pacman.conf`. The output of `pacman -Syu` will be like this:

Package (6)             Old Version  New Version  Net Change  Download Size

extra/libmariadbclient  10.1.9-4     10.1.10-1      0.03 MiB       4.35 MiB
extra/libpng            1.6.19-1     1.6.20-1       0.00 MiB       0.23 MiB
extra/mariadb           10.1.9-4     10.1.10-1      0.26 MiB      13.80 MiB

#### Enabling parallel downloads

Pacman 6.0 introduced the option to download packages in parallel. `ParallelDownloads` under `[options]` needs to be set to a positive integer in `/etc/pacman.conf` to use this feature (e.g., `5`). Packages will otherwise be downloaded sequentially if this option is unset.

#### Skip package from being upgraded

**Warning:** Be careful in skipping packages, since [partial upgrades](https://wiki.archlinux.org/title/Partial%5Fupgrade "Partial upgrade") are unsupported.

To have a specific package skipped when [upgrading](#Upgrading%5Fpackages) the system, add this line in the `[options]` section:

IgnorePkg=linux

For multiple packages use a space-separated list, or use additional `IgnorePkg` lines. Also, [glob](https://en.wikipedia.org/wiki/glob%5F%28programming%29 "wikipedia:glob (programming)") patterns can be used. If you want to skip packages just once, you can also use the `--ignore` option on the command-line - this time with a comma-separated list.

It will still be possible to upgrade the ignored packages using `pacman -S`: in this case _pacman_ will remind you that the packages have been included in an `IgnorePkg` statement.

#### Skip package group from being upgraded

**Warning:** Be careful in skipping package groups, since [partial upgrades](https://wiki.archlinux.org/title/Partial%5Fupgrade "Partial upgrade") are unsupported.

As with packages, skipping a whole package group is also possible:

IgnoreGroup=gnome

#### Skip file from being upgraded

All files listed with a `NoUpgrade` directive will never be touched during a package install/upgrade, and the new files will be installed with a _.pacnew_ extension.

NoUpgrade=_path/to/file_

Multiple files can be specified like this:

NoUpgrade=_path/to/file1 path/to/file2_

**Note:** The path refers to files in the package archive. Therefore, do not include the leading slash.

#### Skip files from being installed to system

To always skip installation of specific directories list them under `NoExtract`. For example, to avoid installation of [systemd](https://wiki.archlinux.org/title/Systemd "Systemd") units use this:

NoExtract=usr/lib/systemd/system/*

Later rules override previous ones, and you can negate a rule by prepending `!`.

**Tip:** Pacman issues warning messages about missing locales when updating a package for which locales have been cleared by _localepurge_ or _bleachbit_. Commenting the `CheckSpace` option in `pacman.conf` suppresses such warnings, but consider that the space-checking functionality will be disabled for all packages.

#### Maintain several configuration files

If you have several configuration files (e.g. main configuration and configuration with [testing](https://wiki.archlinux.org/title/Testing "Testing") repository enabled) and would have to share options between configurations you may use `Include` option declared in the configuration files, e.g.:

Include = _/path/to/common/settings_

where `/path/to/common/settings` file contains the same options for both configurations.

#### Hooks

Pacman can run pre- and post-transaction hooks from the `/usr/share/libalpm/hooks/` directory; more directories can be specified with the `HookDir` option in `pacman.conf`, which defaults to `/etc/pacman.d/hooks`. Hook file names must be suffixed with _.hook_. Pacman hooks are not interactive.

Pacman hooks are used, for example, in combination with `systemd-sysusers` and `systemd-tmpfiles` to automatically create system users and files during the installation of packages. For example, [tomcat8](https://archlinux.org/packages/?name=tomcat8) specifies that it wants a system user called `tomcat8` and certain directories owned by this user. The _pacman_ hooks `systemd-sysusers.hook` and `systemd-tmpfiles.hook` invoke `systemd-sysusers` and `systemd-tmpfiles` when _pacman_ determines that [tomcat8](https://archlinux.org/packages/?name=tomcat8) contains files specifying users and tmp files.

For more information on alpm hooks, see [alpm-hooks(5)](https://man.archlinux.org/man/alpm-hooks.5).

### Repositories and mirrors

Besides the special [\[options\]](#General%5Foptions) section, each other `[section]` in `pacman.conf` defines a package repository to be used. A _repository_ is a _logical_ collection of packages, which are _physically_ stored on one or more servers: for this reason each server is called a _mirror_ for the repository.

Repositories are distinguished between [official](https://wiki.archlinux.org/title/Official%5Frepositories "Official repositories") and [unofficial](https://wiki.archlinux.org/title/Unofficial%5Fuser%5Frepositories "Unofficial user repositories"). The order of repositories in the configuration file matters; repositories listed first will take precedence over those listed later in the file when packages in two repositories have identical names, regardless of version number. In order to use a repository after adding it, you will need to [upgrade](#Upgrading%5Fpackages) the whole system first.

Each repository section allows defining the list of its mirrors directly or in a dedicated external file through the `Include` directive; for example, the mirrors for the official repositories are included from `/etc/pacman.d/mirrorlist`. See the [Mirrors](https://wiki.archlinux.org/title/Mirrors "Mirrors") article for mirror configuration.

#### Package cache directory

Pacman stores downloaded package files in cache, in a directory denoted by `CacheDir` in [\[options\]](#General%5Foptions) section of `pacman.conf` (defaults to `/var/cache/pacman/pkg/` if not set).

Cache directory may grow over time, even if keeping just the freshest versions of installed packages.

If you want to move that directory to some more convenient place, do one of the following:

* Set the `CacheDir` option in `pacman.conf` to new directory. Remember to retain the trailing slash. **This is the recommended solution**.
* Mount a dedicated partition or e.g. [Btrfs subvolume](https://wiki.archlinux.org/title/Btrfs#Subvolumes "Btrfs") in `/var/cache/pacman/pkg/`.
* Bind-mount selected directory in `/var/cache/pacman/pkg/`.

**Warning:** **Do not symlink** the `/var/cache/pacman/pkg/` directory to some other location. It **will** cause pacman to misbehave, especially when pacman attempts to update itself.

#### Package security

Pacman supports package signatures, which add an extra layer of security to the packages. The default configuration, `SigLevel = Required DatabaseOptional`, enables signature verification for all the packages on a global level. This can be overridden by per-repository `SigLevel` lines. For more details on package signing and signature verification, take a look at [pacman-key](https://wiki.archlinux.org/title/Pacman-key "Pacman-key").

## Troubleshooting

### "Failed to commit transaction (conflicting files)" error

If you see the following error: [\[1\]](https://bbs.archlinux.org/viewtopic.php?id=56373) 

error: could not prepare transaction
error: failed to commit transaction (conflicting files)
_package_: _/path/to/file_ exists in filesystem
Errors occurred, no packages were upgraded.

This is happening because _pacman_ has detected a file conflict, and by design, will not overwrite files for you. This is by design, not a flaw.

The problem is usually trivial to solve (although to be sure, you should try to find out how these files got there in the first place). A safe way is to first check if another package owns the file (`pacman -Qo /path/to/file`). If the file is owned by another package, [file a bug report](https://wiki.archlinux.org/title/Reporting%5Fbug%5Fguidelines "Reporting bug guidelines"). If the file is not owned by another package, rename the file which "exists in filesystem" and re-issue the update command. If all goes well, the file may then be removed.

If you had installed a program manually without using _pacman_, for example through `make install`, you have to remove/uninstall this program with all of its files. See also [Pacman tips#Identify files not owned by any package](https://wiki.archlinux.org/title/Pacman%5Ftips#Identify%5Ffiles%5Fnot%5Fowned%5Fby%5Fany%5Fpackage "Pacman tips").

Every installed package provides a `/var/lib/pacman/local/package-version/files` file that contains metadata about this package. If this file gets corrupted, is empty or goes missing, it results in `file exists in filesystem` errors when trying to update the package. Such an error usually concerns only one package. Instead of manually renaming and later removing all the files that belong to the package in question, you may explicitly run `pacman -S --overwrite glob package` to force _pacman_ to overwrite files that match `glob`.

### "Failed to commit transaction (invalid or corrupted package)" error

Look for _.part_ files (partially downloaded packages) in `/var/cache/pacman/pkg/` and remove them (often caused by usage of a custom `XferCommand` in `pacman.conf`).

# find /var/cache/pacman/pkg/ -iname "*.part" -delete

That same error may also appear if _archlinux-keyring_ is out-of-date, preventing _pacman_ from verifying signatures. See [Pacman/Package signing#Upgrade system regularly](https://wiki.archlinux.org/title/Pacman/Package%5Fsigning#Upgrade%5Fsystem%5Fregularly "Pacman/Package signing") for the fix and how to avoid it in the future.

### "Failed to init transaction (unable to lock database)" error

When _pacman_ is about to alter the package database, for example installing a package, it creates a lock file at `/var/lib/pacman/db.lck`. This prevents another instance of _pacman_ from trying to alter the package database at the same time.

If _pacman_ is interrupted while changing the database, this stale lock file can remain. If you are certain that no instances of _pacman_ are running then delete the lock file:

# rm /var/lib/pacman/db.lck

**Tip:** You can run `fuser /var/lib/pacman/db.lck` as root to verify if there is any process still using it.

### Packages cannot be retrieved on installation

This error manifests as `Not found in sync db`, `Target not found` or `Failed retrieving file`.

Firstly, ensure the package actually exists. If certain the package exists, your package list may be out-of-date. Try running `pacman -Syu` to force a refresh of all package lists and upgrade. Also make sure the selected [mirrors](https://wiki.archlinux.org/title/Mirrors "Mirrors") are up-to-date and [repositories](#Repositories%5Fand%5Fmirrors) are correctly configured.

It could also be that the repository containing the package is not enabled on your system, e.g. the package could be in the [multilib](https://wiki.archlinux.org/title/Multilib "Multilib") repository, but _multilib_ is not enabled in your `pacman.conf`.

See also [FAQ#Why is there only a single version of each shared library in the official repositories?](https://wiki.archlinux.org/title/FAQ#Why%5Fis%5Fthere%5Fonly%5Fa%5Fsingle%5Fversion%5Fof%5Feach%5Fshared%5Flibrary%5Fin%5Fthe%5Fofficial%5Frepositories? "FAQ").

### Pacman crashes during an upgrade

In the case that _pacman_ crashes with a "database write" error while removing packages, and reinstalling or upgrading packages fails thereafter, do the following:

1. Boot using the Arch installation media. Preferably use a recent media so that the _pacman_ version matches/is newer than the system.
2. Mount the system's root filesystem, e.g., `mount /dev/sdaX /mnt` as root, and check the mount has sufficient space with `df -h`
3. Mount the proc, sys and dev filesystems as well: `mount -t proc proc /mnt/proc; mount --rbind /sys /mnt/sys; mount --rbind /dev /mnt/dev `
4. If the system uses default database and directory locations, you can now update the system's _pacman_ database and upgrade it via `pacman --sysroot /mnt -Syu` as root.  
   * Alternatively, if you cannot update/upgrade, refer to [Pacman/Tips and tricks#Reinstalling all packages](https://wiki.archlinux.org/title/Pacman/Tips%5Fand%5Ftricks#Reinstalling%5Fall%5Fpackages "Pacman/Tips and tricks").
5. After the upgrade, one way to double-check for not upgraded but still broken packages: `find /mnt/usr/lib -size 0`
6. Followed by a re-install of any still broken package via `pacman --sysroot /mnt -S package`.

#### pacman: command not found

If `/var/cache/pacman/pkg` is a symlink, _pacman_ will try to make a directory instead and thus remove this symlink during self-upgrade. This will cause the update to fail. As a result, `/usr/bin/pacman` and other contents of the [pacman](https://archlinux.org/packages/?name=pacman) package will be missing.

Never symlink `/var/cache/pacman/pkg` because it is controlled by _pacman_. Use the `CacheDir` option or a bind mount instead; see [#Package cache directory](#Package%5Fcache%5Fdirectory).

If you have already encountered this problem and broke your system, you can manually extract `/usr` contents from the package to restore _pacman_ and then reinstall it properly; see [FS#73306](https://bugs.archlinux.org/task/73306) and [related forum thread](https://bbs.archlinux.org/viewtopic.php?id=241213) for details.

### Manually reinstalling pacman

#### Using pacman-static

[pacman-static](https://aur.archlinux.org/packages/pacman-static/)AUR is a statically compiled version of _pacman_, so it will be able to run even when the libraries on the system are not working. This can also come in handy when a [partial upgrade](https://wiki.archlinux.org/title/Partial%5Fupgrade "Partial upgrade") was performed and _pacman_ can not run anymore.

The pinned comment and the PKGBUILD provides a way to directly download the binary, which can be used to reinstall _pacman_ or to upgrade the entire system in case of partial upgrades.

#### Using an external pacman

If even `pacman-static` does not work, it is possible to recover using an external _pacman_. One of the easiest methods to do so is by using the [archiso](https://wiki.archlinux.org/title/Archiso "Archiso") and simply using `--sysroot` or `--root` to specify the mount point. See [Chroot#Using chroot](https://wiki.archlinux.org/title/Chroot#Using%5Fchroot "Chroot") on how to mount the necessary filesystems required by `--sysroot`.

#### 

**Warning:** It is extremely easy to break your system even worse using this approach. Use this only as a last resort if the method from [#Pacman crashes during an upgrade](#Pacman%5Fcrashes%5Fduring%5Fan%5Fupgrade) is not an option.

Even if _pacman_ is terribly broken, you can fix it manually by downloading the latest packages and extracting them to the correct locations. The rough steps to perform are:

1. Determine the [pacman](https://archlinux.org/packages/?name=pacman) dependencies to install
2. Download each package from a [mirror](https://wiki.archlinux.org/title/Mirror "Mirror") of your choice
3. Extract each package to root
4. Reinstall these packages with `pacman -S --overwrite` to update the package database accordingly
5. Do a full system upgrade

If you have a healthy Arch system on hand, you can see the full list of dependencies with:

$ pacman -Q $(pactree -u pacman)

But you may only need to update a few of them depending on your issue. An example of extracting a package is

# tar -xvpwf _package.tar.zst_ -C / --exclude .PKGINFO --exclude .INSTALL --exclude .MTREE --exclude .BUILDINFO

Note the use of the `w` flag for interactive mode. Running non-interactively is very risky since you might end up overwriting an important file. Also take care to extract packages in the correct order (i.e. dependencies first). [This forum post](https://bbs.archlinux.org/viewtopic.php?id=95007) contains an example of this process where only a couple _pacman_ dependencies are broken.

### "Unable to find root device" error after rebooting

Most likely the [initramfs](https://wiki.archlinux.org/title/Initramfs "Initramfs") became corrupted during a [kernel](https://wiki.archlinux.org/title/Kernel "Kernel") update (improper use of _pacman'_s `--overwrite` option can be a cause). There are two options; first, try the _Fallback_ entry.

**Tip:** In case you removed the _Fallback_ entry, you can always press the `Tab` key when the boot loader menu shows up (for Syslinux) or `e` (for GRUB or systemd-boot), rename it `initramfs-linux-fallback.img` and press `Enter` or `b` (depending on your [boot loader](https://wiki.archlinux.org/title/Boot%5Floader "Boot loader")) to boot with the new parameters.

Once the system starts, run this command (for the stock [linux](https://archlinux.org/packages/?name=linux) kernel) either from the console or from a terminal to rebuild the initramfs image:

# mkinitcpio -p linux

If that does not work, from a current Arch release (CD/DVD or USB stick), [mount](https://wiki.archlinux.org/title/Mount "Mount") your root and boot partitions to `/mnt` and `/mnt/boot`, respectively. Then [chroot](https://wiki.archlinux.org/title/Chroot "Chroot") using _arch-chroot_:

# arch-chroot /mnt
# pacman -Syu mkinitcpio systemd linux

**Note:**

* If you do not have a current release or if you only have some other "live" Linux distribution laying around, you can [chroot](https://wiki.archlinux.org/title/Chroot "Chroot") using the old fashioned way. Obviously, there will be more typing than simply running the `arch-chroot` script.
* If _pacman_ fails with `Could not resolve host`, please [check your internet connection](https://wiki.archlinux.org/title/Network%5Fconfiguration#Check%5Fthe%5Fconnection "Network configuration").
* If you cannot enter the arch-chroot or chroot environment but need to re-install packages, you can use the command `pacman --sysroot /mnt -Syu foo bar` to use _pacman_ on your root partition.

Reinstalling the kernel (the [linux](https://archlinux.org/packages/?name=linux) package) will automatically re-generate the initramfs image with `mkinitcpio -p linux`. There is no need to do this separately.

Afterwards, it is recommended that you run `exit`, `umount /mnt/{boot,} ` and `reboot`.

### "Warning: current locale is invalid; using default "C" locale" error

As the error message says, your locale is not correctly configured. See [Locale](https://wiki.archlinux.org/title/Locale "Locale").

### Pacman does not honor proxy settings

Make sure that the relevant environment variables (`$http_proxy`, `$ftp_proxy` etc.) are set up. If you use _pacman_ with [sudo](https://wiki.archlinux.org/title/Sudo "Sudo"), you need to configure sudo to [pass these environment variables to pacman](https://wiki.archlinux.org/title/Sudo#Environment%5Fvariables "Sudo"). Also, ensure the configuration of [dirmngr](https://wiki.archlinux.org/title/GnuPG#Key%5Fservers "GnuPG") has `honor-http-proxy` in `/etc/pacman.d/gnupg/dirmngr.conf` to honor the proxy when refreshing the keys.

### How do I reinstall all packages, retaining information on whether something was explicitly installed or as a dependency?

To reinstall all the native packages: `pacman -Qnq | pacman -S -` or `pacman -S $(pacman -Qnq)` (the `-S` option preserves the installation reason by default).

You will then need to reinstall all the foreign packages, which can be listed with `pacman -Qmq`.

### "Cannot open shared object file" error

It looks like previous _pacman_ transaction removed or corrupted shared libraries needed for _pacman_ itself.

To recover from this situation, you need to unpack required libraries to your filesystem manually. First find what package contains the missed library and then locate it in the _pacman_ cache (`/var/cache/pacman/pkg/`). Unpack required shared library to the filesystem. This will allow to run _pacman_.

Now you need to [reinstall](#Installing%5Fspecific%5Fpackages) the broken package. Note that you need to use `--overwrite` flag as you just unpacked system files and _pacman_ does not know about it. Pacman will correctly replace our shared library file with one from package.

That's it. Update the rest of the system.

### Freeze of package downloads

Some issues have been reported regarding network problems that prevent _pacman_ from updating/synchronizing repositories. [\[2\]](https://bbs.archlinux.org/viewtopic.php?id=68944) [\[3\]](https://bbs.archlinux.org/viewtopic.php?id=65728) When installing Arch Linux natively, these issues have been resolved by replacing the default _pacman_ file downloader with an alternative (see [Improve pacman performance](https://wiki.archlinux.org/title/Improve%5Fpacman%5Fperformance "Improve pacman performance") for more details). When installing Arch Linux as a guest OS in [VirtualBox](https://wiki.archlinux.org/title/VirtualBox "VirtualBox"), this issue has also been addressed by using _Host interface_ instead of _NAT_ in the machine properties.

### Failed retrieving file 'core.db' from mirror

If you receive this error message with correct [mirrors](https://wiki.archlinux.org/title/Mirrors "Mirrors"), try setting a different [name server](https://wiki.archlinux.org/title/Resolv.conf "Resolv.conf").

### error: 'local-package.pkg.tar': permission denied

If you want to install a package on an sshfs mount using `pacman -U` and receive this error, move the package to a local directory and try to install again.

### error: could not determine cachedir mount point /var/cache/pacman/pkg

Upon executing, e.g., `pacman -Syu` inside a chroot environment an error is encountered:

error: could not determine cachedir mount point /var/cache/pacman/pkg
error: failed to commit transaction (not enough free disk space)

This is frequently caused by the chroot directory not being a mountpoint when the chroot is entered. See the note at [Install Arch Linux from existing Linux#Downloading basic tools](https://wiki.archlinux.org/title/Install%5FArch%5FLinux%5Ffrom%5Fexisting%5FLinux#Downloading%5Fbasic%5Ftools "Install Arch Linux from existing Linux") for a solution, and [arch-chroot(8)](https://man.archlinux.org/man/arch-chroot.8) for an explanation and an example of using bind mounting to make the chroot directory a mountpoint.

### error: GPGME error: No data

If you are unable to update packages and receive this error, try `rm -r /var/lib/pacman/sync/` before attempting to update.

## See also

* [Pacman Home Page](https://archlinux.org/pacman/)
* [libalpm(3)](https://man.archlinux.org/man/libalpm.3)
* [pacman(8)](https://man.archlinux.org/man/pacman.8)
* [pacman.conf(5)](https://man.archlinux.org/man/pacman.conf.5)
* [repo-add(8)](https://man.archlinux.org/man/repo-add.8)



# links
[Read on Omnivore](https://omnivore.app/me/pacman-arch-wiki-18b3aa52ff8)
[Read Original](https://wiki.archlinux.org/title/pacman)

<iframe src="https://wiki.archlinux.org/title/pacman"  width="800" height="500"></iframe>
