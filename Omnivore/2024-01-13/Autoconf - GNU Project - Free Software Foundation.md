---
id: e5b38b73-95df-4490-99f7-f7f28dbfd77a
title: Autoconf - GNU Project - Free Software Foundation
tags:
  - programing
  - tools_to_use
date: 2024-01-13 17:08:58
words_count: 727
state: INBOX
---

# Autoconf - GNU Project - Free Software Foundation by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Autoconf is an extensible package of M4 macros that produce shell
scripts to automatically configure software source code packages.
These scripts can adapt the packages to many kinds of UNIX-like
systems without manual user intervention.  Autoconf creates a
configuration script for a package from a template file that lists the
operating system features that the package can use, in the form of M4
macro calls.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## Autoconf

---

#### Table of Contents

* [Introduction to Autoconf](#introduction)
* [Downloading Autoconf](#downloading)
* [Documentation](#documentation)
* [Autoconf Mailing Lists](#mailinglists)
* [Related Software](#family)
* [Report a Bug](#bug)
* [Maintainers](#maintainer)
* [Autoconf Humor](#humor)

---

### [Introduction to Autoconf](#TOCintroduction)

Autoconf is an extensible package of M4 macros that produce shell scripts to automatically configure software source code packages. These scripts can adapt the packages to many kinds of UNIX-like systems without manual user intervention. Autoconf creates a configuration script for a package from a template file that lists the operating system features that the package can use, in the form of M4 macro calls.

Producing configuration scripts using Autoconf requires [GNU M4](https://www.gnu.org/software/m4/m4.html). You should install GNU M4 (at least version 1.4.6, although 1.4.13 or later is recommended) before configuring Autoconf, so that Autoconf's configure script can find it. The configuration scripts produced by Autoconf are self-contained, so their users do not need to have Autoconf (or GNU M4).

### [Downloading Autoconf](#TOCdownloading)

GNU Autoconf releases can be found on<http://ftp.gnu.org/gnu/autoconf/>\[via http\] and<ftp://ftp.gnu.org/gnu/autoconf/>\[via FTP\]. It can also be found on one of [our FTP mirrors](https://www.gnu.org/prep/ftp.html). Please [use a mirror](https://ftpmirror.gnu.org/gnu/autoconf/)if possible.

Third party macros can be downloaded from the[Autoconf Macro Archive](https://www.gnu.org/software/autoconf-archive/).

Alpha/beta releases of Autoconf can be found in[https://alpha.gnu.org/pub/gnu/autoconf/](https://alpha.gnu.org/pub/gnu/autoconf/), and the latest development sources for Autoconf can always be fetched through git, using either of:

git clone git://git.sv.gnu.org/autoconf
git clone http://git.sv.gnu.org/r/autoconf.git

You can also[view the git tree](http://git.sv.gnu.org/gitweb/?p=autoconf.git) on the web.

DO NOT use Autoconf sources from these locations for production use.

### [Documentation](#TOCdocumentation)

Autoconf documentation can be found in several formats at[http://www.gnu.org/software/autoconf/manual/](https://www.gnu.org/software/autoconf/manual/index.html). You may also find more information about Autoconf by looking at your local documentation. For example, you might try looking in /usr/share/doc/autoconf/, or use _info autoconf_ at the shell prompt.

### [Mailing Lists](#TOCmailinglists)

Autoconf has several moderated mailing lists, each with an archive.

For general Autoconf discussions, use[<autoconf@gnu.org>](mailto:autoconf@gnu.org) [(archives)](https://lists.gnu.org/mailman/listinfo/autoconf/).

Development of Autoconf, and GNU in general, is a volunteer effort, and your contribution would be welcome. For general information, please read[How to help GNU](https://www.gnu.org/help/). If you'd like to get involved with Autoconf, it's a good idea to join this general list.

If you have a patch for a bug in Autoconf that hasn't yet been fixed in the latest git sources of Autoconf, please send the patch (made for the current git sources, not the released sources) to[<autoconf-patches@gnu.org>](mailto:autoconf-patches@gnu.org) [(archives)](https://lists.gnu.org/mailman/listinfo/autoconf-patches/).

All commits to the repository are automatically mailed to <autoconf-commit@gnu.org> ([archives](https://lists.gnu.org/archive/html/autoconf-commit/)and[subscription](https://lists.gnu.org/mailman/listinfo/autoconf-commit/)).

You can subscribe to any GNU mailing list via the web as described below. Or you can send an empty mail with a Subject: header line of just "subscribe" to the relevant -request list. For example, to subscribe yourself to the bug-autoconf list, you would send mail to [<bug-autoconf-request@gnu.org>](mailto:bug-autoconf-request@gnu.org)with no body and a Subject: header line of just "subscribe".

#### Announcements

The low-volume mailing list[autotools-announce](https://lists.gnu.org/mailman/listinfo/autotools-announce) contains all announcements about Autoconf and a few other related projects. Important announcements about Autoconf and most other GNU Software in general are also made on the[info-gnu](https://lists.gnu.org/mailman/listinfo/info-gnu) list.

### [Related Software](#TOCfamily)

Autoconf is often used together with the following software systems:

* [GNU M4](https://www.gnu.org/software/m4/m4.html) is a prerequisite for Autoconf.
* [Perl](http://www.perl.org/) is a prerequisite for Autoconf.
* [GNU Automake](https://www.gnu.org/software/automake/automake.html) uses Autoconf.
* [GNU Libtool](https://www.gnu.org/software/libtool/libtool.html) also uses Autoconf.

### [Report a Bug](#TOCbug)

If you think you have found a bug in GNU Autoconf, then please post as complete a report as possible to the [Autoconf bug tracker on Savannah](https://savannah.gnu.org/support/?func=additem&group=autoconf). Mail to [ <bug-autoconf@gnu.org>](mailto:bug-autoconf@gnu.org) is also accepted, but currently causes extra work for the maintainers. An easy way to collect all the required information, such as platform and compiler, is to run _make check_, and include the resulting file_tests/testsuite.log_ to your report. Disagreements between the manual and the code are also bugs.

### [Maintainers](#TOCmaintainer)

GNU Autoconf is maintained by several developers, including Paul Eggert and Eric Blake[<ebb9@byu.net>](mailto:ebb9@byu.net). Contributors, and consolidated development information, are listed on the[Savannah](http://savannah.gnu.org/projects/autoconf)page.

### [Autoconf Humor](#TOChumor)

For a more light-hearted look at Autoconf, you may be interested in these alternate renderings of prior versions of this web page.

* [Sweedish (Chef)](https://www.gnu.org/software/autoconf/autoconf.alt-sc.html)
* [Latin (Pig)](https://www.gnu.org/software/autoconf/autoconf.alt-pl.html)

You may also be interested in this[bug report](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=140837), asking why Autoconf bothers to mark generated scripts as readable.



# links
[Read on Omnivore](https://omnivore.app/me/autoconf-gnu-project-free-software-foundation-18d035e76ce)
[Read Original](https://www.gnu.org/software/autoconf/)

<iframe src="https://www.gnu.org/software/autoconf/"  width="800" height="500"></iframe>
