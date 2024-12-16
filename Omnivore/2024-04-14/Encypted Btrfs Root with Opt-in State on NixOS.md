---
id: 872ef01f-b2d9-4737-84ff-ff152e5b609c
title: Encypted Btrfs Root with Opt-in State on NixOS
tags:
  - linux
  - nixos
date: 2024-04-14 22:44:29
date_published: 2020-06-29 03:00:00
words_count: 3238
state: READING
---

# Encypted Btrfs Root with Opt-in State on NixOS by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> grahamc’s “Erase your darlings” blog post is an amazing example of what a snapshotting filesystems (zfs) combined with an immutable, infrastructue-as-code OS (NixOS) can achieve. To summarize the post, grahamc demonstrates how to erase the root partition at boot while opting in to state by getting NixOS to symlink stuff to a dedicated partition. This restores the machine to a clean state on every boot, preserving the “new computer smell”.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
<DIV id="readability-content"><DIV data-omnivore-anchor-idx="1" class="page" id="readability-page-1"><article data-omnivore-anchor-idx="2">

<p data-omnivore-anchor-idx="3"><a data-omnivore-anchor-idx="4" href="https://grahamc.com/blog/erase-your-darlings">grahamc’s “Erase your darlings” blog post</a> is an amazing example of what a snapshotting filesystems (zfs) combined with an immutable, infrastructue-as-code OS (NixOS) can achieve. To summarize the post, grahamc demonstrates how to erase the root partition at boot while opting in to state by getting NixOS to symlink stuff to a dedicated partition. This restores the machine to a clean state on every boot, preserving the “new computer smell”.</p>
<p data-omnivore-anchor-idx="5">I believe the main selling point of this concept of <strong data-omnivore-anchor-idx="6">opt-in state</strong> is that it makes it dead simple to keep track of ephemeral machine state (everything not explicitly specified by your NixOS configuration) and enforces elimination of <a data-omnivore-anchor-idx="7" href="https://dzone.com/articles/configuration-drift">Configuration Drift</a>. While the benefits of this are clear for servers, this also works pretty well with workstations and laptops, where you gradually accumulate junk in <code data-omnivore-anchor-idx="8" class="hljs language-jboss-cli"><span data-omnivore-anchor-idx="9" class="hljs-string">/etc</span></code> and <code data-omnivore-anchor-idx="10" class="hljs language-actionscript language-arcade">/<span data-omnivore-anchor-idx="11" class="hljs-keyword">var</span></code> which you never can be completely confident in deleting.<a data-omnivore-anchor-idx="12" href="#fn1" id="fnref1" role="doc-noteref"><sup data-omnivore-anchor-idx="13">1</sup></a></p>
<p data-omnivore-anchor-idx="14">Here are some notes on how to reproduce the setup with an encrypted<a data-omnivore-anchor-idx="15" href="#fn2" id="fnref2" role="doc-noteref"><sup data-omnivore-anchor-idx="16">2</sup></a> btrfs root, along with a few tips for a nicer laptop experience. The instructions for encrypted btrfs root are heavily based on <a data-omnivore-anchor-idx="17" href="https://jappieklooster.nl/nixos-on-encrypted-btrfs.html">this blog post</a>.</p>
<h2 data-omnivore-anchor-idx="18" id="making-a-live-usb">Making a Live USB</h2>
<p data-omnivore-anchor-idx="19">The laptop I’m currently using is a Dell XPS-13 2-in-1 (7390) with <a data-omnivore-anchor-idx="20" href="https://wiki.archlinux.org/index.php/Dell_XPS_13_2-in-1_(7390)">a fair number of issues running on Linux</a>, some of which interferes with boot. Fortunately, most of these have been fixed in newer kernels, but the default installation ISO ships an older kernel version, so we need a custom ISO. Building an ISO with a custom configuration for NixOS is shockingly simple; following the instructions on the <a data-omnivore-anchor-idx="21" href="https://nixos.wiki/wiki/Creating_a_NixOS_live_CD">wiki</a>:</p>
<div data-omnivore-anchor-idx="22" id="cb1"><pre data-omnivore-anchor-idx="23"><code data-omnivore-anchor-idx="24" class="hljs language-routeros language-nix"><span data-omnivore-anchor-idx="25" class="hljs-comment"># iso.nix</span>
{ config, pkgs, <span data-omnivore-anchor-idx="26" class="hljs-built_in">..</span>. }:
{
  imports = [
    # installation-cd-graphical-plasma5-new-kernel.nix uses pkgs.linuxPackages_latest
    # instead of the<span data-omnivore-anchor-idx="27" class="hljs-built_in"> default </span>kernel.
    &lt;nixpkgs/nixos/modules/installer/cd-dvd/installation-cd-graphical-plasma5-new-kernel.nix&gt;
    &lt;nixpkgs/nixos/modules/installer/cd-dvd/channel.nix&gt;
  ];

  hardware.enableAllFirmware = <span data-omnivore-anchor-idx="28" class="hljs-literal">true</span>;
  nixpkgs.config.allowUnfree = <span data-omnivore-anchor-idx="29" class="hljs-literal">true</span>;

  environment.systemPackages = with pkgs; [
    wget
    vim
    git
    tmux
    gparted
    nix-prefetch-scripts
  ];
}</code></pre></div>
<p data-omnivore-anchor-idx="30">The image can be built with</p>
<pre data-omnivore-anchor-idx="31"><code data-omnivore-anchor-idx="32" class="hljs language-mipsasm language-stylus">nix-<span data-omnivore-anchor-idx="33" class="hljs-keyword">build </span><span data-omnivore-anchor-idx="34" class="hljs-string">'&lt;nixpkgs/nixos&gt;'</span> -A <span data-omnivore-anchor-idx="35" class="hljs-built_in">config</span>.system.<span data-omnivore-anchor-idx="36" class="hljs-keyword">build.isoImage </span>-I nixos-<span data-omnivore-anchor-idx="37" class="hljs-built_in">config</span>=iso.nix</code></pre>
<p data-omnivore-anchor-idx="38">Then, we write the ISO to a USB stick like so:</p>
<pre data-omnivore-anchor-idx="39"><code data-omnivore-anchor-idx="40" class="hljs language-routeros language-nix">sudo dd <span data-omnivore-anchor-idx="41" class="hljs-attribute">if</span>=./result/iso/nixos-20.03....-x86_64-linux.iso <span data-omnivore-anchor-idx="42" class="hljs-attribute">of</span>=/dev/&lt;usb device&gt; <span data-omnivore-anchor-idx="43" class="hljs-attribute">bs</span>=1M <span data-omnivore-anchor-idx="44" class="hljs-attribute">status</span>=progress</code></pre>
<h2 data-omnivore-anchor-idx="45" id="nixos-installation">NixOS Installation</h2>
<p data-omnivore-anchor-idx="46">Once we’ve booted into a graphical session, we need to partition the disk. We’ll refer to the whole disk as <code data-omnivore-anchor-idx="47" class="hljs language-gams language-autoit"><span data-omnivore-anchor-idx="48" class="hljs-meta"><span data-omnivore-anchor-idx="49" class="hljs-meta-keyword">$DISK</span></span></code> (<code data-omnivore-anchor-idx="50" class="hljs language-gcode language-awk">/dev/<span data-omnivore-anchor-idx="51" class="hljs-symbol">nvme0</span><span data-omnivore-anchor-idx="52" class="hljs-symbol">n1</span></code> in my case), and we need three partitions. The EFI partition, swap<a data-omnivore-anchor-idx="53" href="#fn3" id="fnref3" role="doc-noteref"><sup data-omnivore-anchor-idx="54">3</sup></a>, and the rest of the disk for btrfs to use, which we’ll respecively refer to as <code data-omnivore-anchor-idx="55" class="hljs language-armasm language-bash"><span data-omnivore-anchor-idx="56" class="hljs-string">"$DISK"</span><span data-omnivore-anchor-idx="57" class="hljs-built_in">p1</span></code>, <code data-omnivore-anchor-idx="58" class="hljs language-armasm language-bash"><span data-omnivore-anchor-idx="59" class="hljs-string">"$DISK"</span><span data-omnivore-anchor-idx="60" class="hljs-built_in">p2</span></code>, and <code data-omnivore-anchor-idx="61" class="hljs language-armasm language-bash"><span data-omnivore-anchor-idx="62" class="hljs-string">"$DISK"</span><span data-omnivore-anchor-idx="63" class="hljs-built_in">p3</span></code>.</p>
<p data-omnivore-anchor-idx="64">Btrfs doesn’t natively support encryption, so we’ll be using <a data-omnivore-anchor-idx="65" href="https://wiki.archlinux.org/index.php/Dm-crypt">dm-crypt</a> to transparently encrypt the partition, which would be available at <code data-omnivore-anchor-idx="66" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="67" class="hljs-regexp">/dev/m</span>apper<span data-omnivore-anchor-idx="68" class="hljs-regexp">/enc</span></code> after running these commands:</p>
<pre data-omnivore-anchor-idx="69"><code data-omnivore-anchor-idx="70" class="hljs language-kotlin language-perl">cryptsetup --verify-passphrase -v luksFormat <span data-omnivore-anchor-idx="71" class="hljs-string">"<span data-omnivore-anchor-idx="72" class="hljs-variable">$DISK</span>"</span>p3
cryptsetup <span data-omnivore-anchor-idx="73" class="hljs-keyword">open</span> <span data-omnivore-anchor-idx="74" class="hljs-string">"<span data-omnivore-anchor-idx="75" class="hljs-variable">$DISK</span>"</span>p3 enc</code></pre>
<p data-omnivore-anchor-idx="76">We can then format each partition as needed:</p>
<pre data-omnivore-anchor-idx="77"><code data-omnivore-anchor-idx="78" class="hljs language-armasm language-bash"><span data-omnivore-anchor-idx="79" class="hljs-symbol">mkfs.vfat</span> -n <span data-omnivore-anchor-idx="80" class="hljs-keyword">boot </span><span data-omnivore-anchor-idx="81" class="hljs-string">"$DISK"</span><span data-omnivore-anchor-idx="82" class="hljs-built_in">p1</span>
<span data-omnivore-anchor-idx="83" class="hljs-symbol">mkswap</span> <span data-omnivore-anchor-idx="84" class="hljs-string">"$DISK"</span><span data-omnivore-anchor-idx="85" class="hljs-built_in">p2</span>
<span data-omnivore-anchor-idx="86" class="hljs-symbol">swapon</span> <span data-omnivore-anchor-idx="87" class="hljs-string">"$DISK"</span><span data-omnivore-anchor-idx="88" class="hljs-built_in">p2</span>
<span data-omnivore-anchor-idx="89" class="hljs-symbol">mkfs.btrfs</span> /dev/mapper/enc</code></pre>
<p data-omnivore-anchor-idx="90">Now we have a btrfs volume, we need to decide on how to structure our subvolumes. We want to split our data into a number of subvolumes to keep track of a few things:</p>
<ul data-omnivore-anchor-idx="91">
<li data-omnivore-anchor-idx="92">root: The subvolume for <code data-omnivore-anchor-idx="93" class="hljs language-undefined">/</code>, which will be cleared on every boot.</li>
<li data-omnivore-anchor-idx="94">home: The subvolume for <code data-omnivore-anchor-idx="95" class="hljs language-arduino language-jboss-cli">/<span data-omnivore-anchor-idx="96" class="hljs-built_in">home</span></code>, which should be backed up.</li>
<li data-omnivore-anchor-idx="97">nix: The subvolume for <code data-omnivore-anchor-idx="98" class="hljs language-jboss-cli"><span data-omnivore-anchor-idx="99" class="hljs-string">/nix</span></code>, which needs to be persistent but is not worth backing up, as it’s trivial to reconstruct.</li>
<li data-omnivore-anchor-idx="100">persist: The subvolume for <code data-omnivore-anchor-idx="101" class="hljs language-jboss-cli"><span data-omnivore-anchor-idx="102" class="hljs-string">/persist</span></code>, containing system state which should be persistent across reboots and possibly backed up.</li>
<li data-omnivore-anchor-idx="103">log: The subvolume for <code data-omnivore-anchor-idx="104" class="hljs language-excel language-lasso">/<span data-omnivore-anchor-idx="105" class="hljs-built_in">var</span>/<span data-omnivore-anchor-idx="106" class="hljs-built_in">log</span></code>. I’m not so interested in backing up logs but I want them to be preserved across reboots, so I’m dedicating a subvolume to logs rather than using the persist subvolume.</li>
</ul>
<p data-omnivore-anchor-idx="107">Somewhat arbitrarily, we’ll go with the <a data-omnivore-anchor-idx="108" href="https://btrfs.wiki.kernel.org/index.php/SysadminGuide#Flat">“Flat” layout as described in the btrfs wiki</a>, and create our subvolumes accordingly.</p>
<pre data-omnivore-anchor-idx="109"><code data-omnivore-anchor-idx="110" class="hljs language-jboss-cli language-awk">mount -t btrfs <span data-omnivore-anchor-idx="111" class="hljs-string">/dev/mapper/enc</span> <span data-omnivore-anchor-idx="112" class="hljs-string">/mnt</span>

<span data-omnivore-anchor-idx="113" class="hljs-comment"># We first create the subvolumes outlined above:</span>
btrfs subvolume create <span data-omnivore-anchor-idx="114" class="hljs-string">/mnt/root</span>
btrfs subvolume create <span data-omnivore-anchor-idx="115" class="hljs-string">/mnt/home</span>
btrfs subvolume create <span data-omnivore-anchor-idx="116" class="hljs-string">/mnt/nix</span>
btrfs subvolume create <span data-omnivore-anchor-idx="117" class="hljs-string">/mnt/persist</span>
btrfs subvolume create <span data-omnivore-anchor-idx="118" class="hljs-string">/mnt/log</span>

<span data-omnivore-anchor-idx="119" class="hljs-comment"># We then take an empty *readonly* snapshot of the root subvolume,</span>
<span data-omnivore-anchor-idx="120" class="hljs-comment"># which we'll eventually rollback to on every boot.</span>
btrfs subvolume snapshot -r <span data-omnivore-anchor-idx="121" class="hljs-string">/mnt/root</span> <span data-omnivore-anchor-idx="122" class="hljs-string">/mnt/root-blank</span>

umount <span data-omnivore-anchor-idx="123" class="hljs-string">/mnt</span></code></pre>
<p data-omnivore-anchor-idx="124">Once we’ve created the subvolumes, we mount them with the options that we want. Here, we’re using <a data-omnivore-anchor-idx="125" href="https://facebook.github.io/zstd/">Zstandard compression</a> along with the <code data-omnivore-anchor-idx="126" class="hljs language-ebnf"><span data-omnivore-anchor-idx="127" class="hljs-attribute">noatime</span></code> option.</p>
<pre data-omnivore-anchor-idx="128"><code data-omnivore-anchor-idx="129" class="hljs language-stata language-jboss-cli">mount -o subvol=root,<span data-omnivore-anchor-idx="130" class="hljs-keyword">compress</span>=zstd,noatime /dev/mapper/<span data-omnivore-anchor-idx="131" class="hljs-keyword">enc</span> /mnt

<span data-omnivore-anchor-idx="132" class="hljs-keyword">mkdir</span> /mnt/home
mount -o subvol=home,<span data-omnivore-anchor-idx="133" class="hljs-keyword">compress</span>=zstd,noatime /dev/mapper/<span data-omnivore-anchor-idx="134" class="hljs-keyword">enc</span> /mnt/home

<span data-omnivore-anchor-idx="135" class="hljs-keyword">mkdir</span> /mnt/nix
mount -o subvol=nix,<span data-omnivore-anchor-idx="136" class="hljs-keyword">compress</span>=zstd,noatime /dev/mapper/<span data-omnivore-anchor-idx="137" class="hljs-keyword">enc</span> /mnt/nix

<span data-omnivore-anchor-idx="138" class="hljs-keyword">mkdir</span> /mnt/persist
mount -o subvol=persist,<span data-omnivore-anchor-idx="139" class="hljs-keyword">compress</span>=zstd,noatime /dev/mapper/<span data-omnivore-anchor-idx="140" class="hljs-keyword">enc</span> /mnt/persist

<span data-omnivore-anchor-idx="141" class="hljs-keyword">mkdir</span> -p /mnt/<span data-omnivore-anchor-idx="142" class="hljs-keyword">var</span>/<span data-omnivore-anchor-idx="143" class="hljs-keyword">log</span>
mount -o subvol=<span data-omnivore-anchor-idx="144" class="hljs-keyword">log</span>,<span data-omnivore-anchor-idx="145" class="hljs-keyword">compress</span>=zstd,noatime /dev/mapper/<span data-omnivore-anchor-idx="146" class="hljs-keyword">enc</span> /mnt/<span data-omnivore-anchor-idx="147" class="hljs-keyword">var</span>/<span data-omnivore-anchor-idx="148" class="hljs-keyword">log</span>

# don't forget this!
<span data-omnivore-anchor-idx="149" class="hljs-keyword">mkdir</span> /mnt/<span data-omnivore-anchor-idx="150" class="hljs-keyword">boot</span>
mount <span data-omnivore-anchor-idx="151" class="hljs-string">"$DISK"</span>p1 /mnt/<span data-omnivore-anchor-idx="152" class="hljs-keyword">boot</span></code></pre>
<p data-omnivore-anchor-idx="153">Then, let NixOS figure out the config.</p>
<pre data-omnivore-anchor-idx="154"><code data-omnivore-anchor-idx="155" class="hljs language-verilog language-jboss-cli">nixos-<span data-omnivore-anchor-idx="156" class="hljs-keyword">generate</span>-<span data-omnivore-anchor-idx="157" class="hljs-keyword">config</span> --root /mnt</code></pre>
<p data-omnivore-anchor-idx="158">This should result with <code data-omnivore-anchor-idx="159" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="160" class="hljs-regexp">/mnt/</span>etc<span data-omnivore-anchor-idx="161" class="hljs-regexp">/nixos/</span>hardware-configuration.nix</code> looking something like this:</p>
<div data-omnivore-anchor-idx="162" id="cb9"><pre data-omnivore-anchor-idx="163"><code data-omnivore-anchor-idx="164" class="hljs language-nix language-routeros"><span data-omnivore-anchor-idx="165" class="hljs-comment"># Do not modify this file!  It was generated by ‘nixos-generate-config’</span>
<span data-omnivore-anchor-idx="166" class="hljs-comment"># and may be overwritten by future invocations.  Please make changes</span>
<span data-omnivore-anchor-idx="167" class="hljs-comment"># to /etc/nixos/configuration.nix instead.</span>
{ config, lib, pkgs, ... }:

{
  <span data-omnivore-anchor-idx="168" class="hljs-attr">imports</span> =
    [ &lt;nixpkgs/nixos/modules/installer/scan/not-detected.nix&gt;
    ];

  boot.initrd.<span data-omnivore-anchor-idx="169" class="hljs-attr">availableKernelModules</span> = [ <span data-omnivore-anchor-idx="170" class="hljs-string">"xhci_pci"</span> <span data-omnivore-anchor-idx="171" class="hljs-string">"nvme"</span> <span data-omnivore-anchor-idx="172" class="hljs-string">"usb_storage"</span> <span data-omnivore-anchor-idx="173" class="hljs-string">"sd_mod"</span> <span data-omnivore-anchor-idx="174" class="hljs-string">"rtsx_pci_sdmmc"</span> ];
  boot.initrd.<span data-omnivore-anchor-idx="175" class="hljs-attr">kernelModules</span> = [ ];
  boot.<span data-omnivore-anchor-idx="176" class="hljs-attr">kernelModules</span> = [ <span data-omnivore-anchor-idx="177" class="hljs-string">"kvm-intel"</span> ];
  boot.<span data-omnivore-anchor-idx="178" class="hljs-attr">extraModulePackages</span> = [ ];

  fileSystems.<span data-omnivore-anchor-idx="179" class="hljs-string">"/"</span> =
    { <span data-omnivore-anchor-idx="180" class="hljs-attr">device</span> = <span data-omnivore-anchor-idx="181" class="hljs-string">"/dev/disk/by-uuid/f73c53b7-ae6c-4240-89c3-511ad918edcc"</span>;
      <span data-omnivore-anchor-idx="182" class="hljs-attr">fsType</span> = <span data-omnivore-anchor-idx="183" class="hljs-string">"btrfs"</span>;
      <span data-omnivore-anchor-idx="184" class="hljs-attr">options</span> = [ <span data-omnivore-anchor-idx="185" class="hljs-string">"subvol=root"</span> <span data-omnivore-anchor-idx="186" class="hljs-string">"compress=zstd"</span> <span data-omnivore-anchor-idx="187" class="hljs-string">"noatime"</span> ];
    };

  boot.initrd.luks.devices.<span data-omnivore-anchor-idx="188" class="hljs-string">"enc"</span>.<span data-omnivore-anchor-idx="189" class="hljs-attr">device</span> = <span data-omnivore-anchor-idx="190" class="hljs-string">"/dev/disk/by-uuid/050db9bf-0741-4150-8cf8-d6ec12735d4c"</span>;

  fileSystems.<span data-omnivore-anchor-idx="191" class="hljs-string">"/home"</span> =
    { <span data-omnivore-anchor-idx="192" class="hljs-attr">device</span> = <span data-omnivore-anchor-idx="193" class="hljs-string">"/dev/disk/by-uuid/f73c53b7-ae6c-4240-89c3-511ad918edcc"</span>;
      <span data-omnivore-anchor-idx="194" class="hljs-attr">fsType</span> = <span data-omnivore-anchor-idx="195" class="hljs-string">"btrfs"</span>;
      <span data-omnivore-anchor-idx="196" class="hljs-attr">options</span> = [ <span data-omnivore-anchor-idx="197" class="hljs-string">"subvol=home"</span> <span data-omnivore-anchor-idx="198" class="hljs-string">"compress=zstd"</span> <span data-omnivore-anchor-idx="199" class="hljs-string">"noatime"</span> ];
    };

  fileSystems.<span data-omnivore-anchor-idx="200" class="hljs-string">"/nix"</span> =
    { <span data-omnivore-anchor-idx="201" class="hljs-attr">device</span> = <span data-omnivore-anchor-idx="202" class="hljs-string">"/dev/disk/by-uuid/f73c53b7-ae6c-4240-89c3-511ad918edcc"</span>;
      <span data-omnivore-anchor-idx="203" class="hljs-attr">fsType</span> = <span data-omnivore-anchor-idx="204" class="hljs-string">"btrfs"</span>;
      <span data-omnivore-anchor-idx="205" class="hljs-attr">options</span> = [ <span data-omnivore-anchor-idx="206" class="hljs-string">"subvol=nix"</span> <span data-omnivore-anchor-idx="207" class="hljs-string">"compress=zstd"</span> <span data-omnivore-anchor-idx="208" class="hljs-string">"noatime"</span> ];
    };

  fileSystems.<span data-omnivore-anchor-idx="209" class="hljs-string">"/var/log"</span> =
    { <span data-omnivore-anchor-idx="210" class="hljs-attr">device</span> = <span data-omnivore-anchor-idx="211" class="hljs-string">"/dev/disk/by-uuid/f73c53b7-ae6c-4240-89c3-511ad918edcc"</span>;
      <span data-omnivore-anchor-idx="212" class="hljs-attr">fsType</span> = <span data-omnivore-anchor-idx="213" class="hljs-string">"btrfs"</span>;
      <span data-omnivore-anchor-idx="214" class="hljs-attr">options</span> = [ <span data-omnivore-anchor-idx="215" class="hljs-string">"subvol=log"</span> <span data-omnivore-anchor-idx="216" class="hljs-string">"compress=zstd"</span> <span data-omnivore-anchor-idx="217" class="hljs-string">"noatime"</span> ];
    };

  fileSystems.<span data-omnivore-anchor-idx="218" class="hljs-string">"/persist"</span> =
    { <span data-omnivore-anchor-idx="219" class="hljs-attr">device</span> = <span data-omnivore-anchor-idx="220" class="hljs-string">"/dev/disk/by-uuid/f73c53b7-ae6c-4240-89c3-511ad918edcc"</span>;
      <span data-omnivore-anchor-idx="221" class="hljs-attr">fsType</span> = <span data-omnivore-anchor-idx="222" class="hljs-string">"btrfs"</span>;
      <span data-omnivore-anchor-idx="223" class="hljs-attr">options</span> = [ <span data-omnivore-anchor-idx="224" class="hljs-string">"subvol=persist"</span> <span data-omnivore-anchor-idx="225" class="hljs-string">"compress=zstd"</span> <span data-omnivore-anchor-idx="226" class="hljs-string">"noatime"</span> ];
    };

  fileSystems.<span data-omnivore-anchor-idx="227" class="hljs-string">"/boot"</span> =
    { <span data-omnivore-anchor-idx="228" class="hljs-attr">device</span> = <span data-omnivore-anchor-idx="229" class="hljs-string">"/dev/disk/by-uuid/8CE7-3C76"</span>;
      <span data-omnivore-anchor-idx="230" class="hljs-attr">fsType</span> = <span data-omnivore-anchor-idx="231" class="hljs-string">"vfat"</span>;
    };

  <span data-omnivore-anchor-idx="232" class="hljs-attr">swapDevices</span> =
    [ { <span data-omnivore-anchor-idx="233" class="hljs-attr">device</span> = <span data-omnivore-anchor-idx="234" class="hljs-string">"/dev/disk/by-uuid/5b1b6659-14ab-497f-a788-5518c25e7ec8"</span>; }
    ];

  nix.<span data-omnivore-anchor-idx="235" class="hljs-attr">maxJobs</span> = lib.mkDefault <span data-omnivore-anchor-idx="236" class="hljs-number">8</span>;
  powerManagement.<span data-omnivore-anchor-idx="237" class="hljs-attr">cpuFreqGovernor</span> = lib.mkDefault <span data-omnivore-anchor-idx="238" class="hljs-string">"powersave"</span>;
  <span data-omnivore-anchor-idx="239" class="hljs-comment"># High-DPI console</span>
  console.<span data-omnivore-anchor-idx="240" class="hljs-attr">font</span> = lib.mkDefault <span data-omnivore-anchor-idx="241" class="hljs-string">"<span data-omnivore-anchor-idx="242" class="hljs-subst">${pkgs.terminus_font}</span>/share/consolefonts/ter-u28n.psf.gz"</span>;
}</code></pre></div>
<p data-omnivore-anchor-idx="243">Make sure that this is what you want, and adjust options as necessary. Note that in order to correctly persist <code data-omnivore-anchor-idx="244" class="hljs language-excel language-lasso">/<span data-omnivore-anchor-idx="245" class="hljs-built_in">var</span>/<span data-omnivore-anchor-idx="246" class="hljs-built_in">log</span></code>, the log subvolume needs to be mounted early enough in the boot process. To do this, we need to add <code data-omnivore-anchor-idx="247" class="hljs language-ini language-abnf"><span data-omnivore-anchor-idx="248" class="hljs-attr">neededForBoot</span> = <span data-omnivore-anchor-idx="249" class="hljs-literal">true</span><span data-omnivore-anchor-idx="250" class="hljs-comment">;</span></code> so the entry will look like this:</p>
<div data-omnivore-anchor-idx="251" id="cb10"><pre data-omnivore-anchor-idx="252"><code data-omnivore-anchor-idx="253" class="hljs language-abnf language-nix">  fileSystems.<span data-omnivore-anchor-idx="254" class="hljs-string">"/var/log"</span> =
    { device = <span data-omnivore-anchor-idx="255" class="hljs-string">"/dev/disk/by-uuid/f73c53b7-ae6c-4240-89c3-511ad918edcc"</span><span data-omnivore-anchor-idx="256" class="hljs-comment">;</span>
      fsType = <span data-omnivore-anchor-idx="257" class="hljs-string">"btrfs"</span><span data-omnivore-anchor-idx="258" class="hljs-comment">;</span>
      options = [ <span data-omnivore-anchor-idx="259" class="hljs-string">"subvol=log"</span> <span data-omnivore-anchor-idx="260" class="hljs-string">"compress=zstd"</span> <span data-omnivore-anchor-idx="261" class="hljs-string">"noatime"</span> ]<span data-omnivore-anchor-idx="262" class="hljs-comment">;</span>
      neededForBoot = true<span data-omnivore-anchor-idx="263" class="hljs-comment">;</span>
    }<span data-omnivore-anchor-idx="264" class="hljs-comment">;</span></code></pre></div>
<p data-omnivore-anchor-idx="265">Although it’s possible to customize <code data-omnivore-anchor-idx="266" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="267" class="hljs-regexp">/etc/</span>nixos<span data-omnivore-anchor-idx="268" class="hljs-regexp">/configuration.nix</span></code> at this point to set up all the things you need in one fell swoop, I recommend starting out with a reletively minimal config to make sure everything works ok. I went with something like this, with a user called <code data-omnivore-anchor-idx="269" class="hljs language-ada language-ebnf"><span data-omnivore-anchor-idx="270" class="hljs-keyword">delta</span></code>:</p>
<div data-omnivore-anchor-idx="271" id="cb11"><pre data-omnivore-anchor-idx="272"><code data-omnivore-anchor-idx="273" class="hljs language-nix language-routeros">{ config, pkgs, ... }:
{
  <span data-omnivore-anchor-idx="274" class="hljs-attr">imports</span> =
    [ <span data-omnivore-anchor-idx="275" class="hljs-comment"># Include the results of the hardware scan.</span>
      ./hardware-configuration.nix
    ];

  boot.<span data-omnivore-anchor-idx="276" class="hljs-attr">kernelPackages</span> = pkgs.linuxPackages_latest;
  boot.<span data-omnivore-anchor-idx="277" class="hljs-attr">supportedFilesystems</span> = [ <span data-omnivore-anchor-idx="278" class="hljs-string">"btrfs"</span> ];
  hardware.<span data-omnivore-anchor-idx="279" class="hljs-attr">enableAllFirmware</span> = <span data-omnivore-anchor-idx="280" class="hljs-literal">true</span>;
  nixpkgs.config.<span data-omnivore-anchor-idx="281" class="hljs-attr">allowUnfree</span> = <span data-omnivore-anchor-idx="282" class="hljs-literal">true</span>;

  <span data-omnivore-anchor-idx="283" class="hljs-comment"># Use the systemd-boot EFI boot loader.</span>
  boot.loader.systemd-boot.<span data-omnivore-anchor-idx="284" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="285" class="hljs-literal">true</span>;
  boot.loader.efi.<span data-omnivore-anchor-idx="286" class="hljs-attr">canTouchEfiVariables</span> = <span data-omnivore-anchor-idx="287" class="hljs-literal">true</span>;

  networking.<span data-omnivore-anchor-idx="288" class="hljs-attr">hostName</span> = <span data-omnivore-anchor-idx="289" class="hljs-string">"apollo"</span>; <span data-omnivore-anchor-idx="290" class="hljs-comment"># Define your hostname.</span>
  networking.networkmanager.<span data-omnivore-anchor-idx="291" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="292" class="hljs-literal">true</span>;

  <span data-omnivore-anchor-idx="293" class="hljs-comment"># Enable the X11 windowing system.</span>
  services.xserver.<span data-omnivore-anchor-idx="294" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="295" class="hljs-literal">true</span>;

  <span data-omnivore-anchor-idx="296" class="hljs-comment"># Enable the KDE Desktop Environment.</span>
  services.xserver.displayManager.sddm.<span data-omnivore-anchor-idx="297" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="298" class="hljs-literal">true</span>;
  services.xserver.desktopManager.plasma5.<span data-omnivore-anchor-idx="299" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="300" class="hljs-literal">true</span>;

  <span data-omnivore-anchor-idx="301" class="hljs-comment"># Define a user account. Don't forget to set a password with ‘passwd’.</span>
  users.users.<span data-omnivore-anchor-idx="302" class="hljs-attr">delta</span> = {
    <span data-omnivore-anchor-idx="303" class="hljs-attr">isNormalUser</span> = <span data-omnivore-anchor-idx="304" class="hljs-literal">true</span>;
    <span data-omnivore-anchor-idx="305" class="hljs-attr">extraGroups</span> = [ <span data-omnivore-anchor-idx="306" class="hljs-string">"wheel"</span> ]; <span data-omnivore-anchor-idx="307" class="hljs-comment"># Enable ‘sudo’ for the user.</span>
  };

  system.<span data-omnivore-anchor-idx="308" class="hljs-attr">stateVersion</span> = <span data-omnivore-anchor-idx="309" class="hljs-string">"20.03"</span>;
}</code></pre></div>
<p data-omnivore-anchor-idx="310">Take a deep breath.</p>
<pre data-omnivore-anchor-idx="311"><code data-omnivore-anchor-idx="312" class="hljs language-cmake language-ebnf">nixos-<span data-omnivore-anchor-idx="313" class="hljs-keyword">install</span>
reboot</code></pre>
<p data-omnivore-anchor-idx="314">If all goes well, we’ll be prompted for the passphrase for <code data-omnivore-anchor-idx="315" class="hljs language-gams language-autoit"><span data-omnivore-anchor-idx="316" class="hljs-meta"><span data-omnivore-anchor-idx="317" class="hljs-meta-keyword">$DISK</span></span></code> entered earlier, then we’ll see the greeter for the KDE Desktop Environment. Swith to another tty with <code data-omnivore-anchor-idx="318" class="hljs language-armasm"><span data-omnivore-anchor-idx="319" class="hljs-symbol">Ctrl</span>+Alt+<span data-omnivore-anchor-idx="320" class="hljs-built_in">F1</span></code>, login as root, <code data-omnivore-anchor-idx="321" class="hljs language-ada language-ebnf">passwd <span data-omnivore-anchor-idx="322" class="hljs-keyword">delta</span></code> to set your password, and switch back to KDE with <code data-omnivore-anchor-idx="323" class="hljs language-armasm"><span data-omnivore-anchor-idx="324" class="hljs-symbol">Ctrl</span>+Alt+<span data-omnivore-anchor-idx="325" class="hljs-built_in">F7</span></code>. Once you’re logged in, you can continue to tweak your NixOS configuration as you want. However, I generally recommend keeping enabled services at a minimum, and setting up opt-in state first.</p>
<h2 data-omnivore-anchor-idx="326" id="darling-erasure">Darling Erasure</h2>
<p data-omnivore-anchor-idx="327">Now that we’re comfortable in our desktop environment of choice (mine is XMonad), we can move onto the opt-in state setup. First, we need to find out what state exists in the first place. Seeing what has changed since we took the blank snapshot seems like a good way to do this.</p>
<p data-omnivore-anchor-idx="328">Taking a diff between the root subvolume and the root-blank subvolume (in btrfs, snapshots are just subvolumes) can be done with a script based off of the answers to <a data-omnivore-anchor-idx="329" href="https://serverfault.com/questions/399894/does-btrfs-have-an-efficient-way-to-compare-snapshots">this serverfault question</a>.</p>
<pre data-omnivore-anchor-idx="330"><code data-omnivore-anchor-idx="331" class="hljs language-bash language-nginx"><span data-omnivore-anchor-idx="332" class="hljs-meta">#!/usr/bin/env bash</span>
<span data-omnivore-anchor-idx="333" class="hljs-comment"># fs-diff.sh</span>
<span data-omnivore-anchor-idx="334" class="hljs-built_in">set</span> -euo pipefail

OLD_TRANSID=$(sudo btrfs subvolume find-new /mnt/root-blank 9999999)
OLD_TRANSID=<span data-omnivore-anchor-idx="335" class="hljs-variable">${OLD_TRANSID#transid marker was }</span>

sudo btrfs subvolume find-new <span data-omnivore-anchor-idx="336" class="hljs-string">"/mnt/root"</span> <span data-omnivore-anchor-idx="337" class="hljs-string">"<span data-omnivore-anchor-idx="338" class="hljs-variable">$OLD_TRANSID</span>"</span> |
sed <span data-omnivore-anchor-idx="339" class="hljs-string">'$d'</span> |
cut -f17- -d<span data-omnivore-anchor-idx="340" class="hljs-string">' '</span> |
sort |
uniq |
<span data-omnivore-anchor-idx="341" class="hljs-keyword">while</span> <span data-omnivore-anchor-idx="342" class="hljs-built_in">read</span> path; <span data-omnivore-anchor-idx="343" class="hljs-keyword">do</span>
  path=<span data-omnivore-anchor-idx="344" class="hljs-string">"/<span data-omnivore-anchor-idx="345" class="hljs-variable">$path</span>"</span>
  <span data-omnivore-anchor-idx="346" class="hljs-keyword">if</span> [ -L <span data-omnivore-anchor-idx="347" class="hljs-string">"<span data-omnivore-anchor-idx="348" class="hljs-variable">$path</span>"</span> ]; <span data-omnivore-anchor-idx="349" class="hljs-keyword">then</span>
    : <span data-omnivore-anchor-idx="350" class="hljs-comment"># The path is a symbolic link, so is probably handled by NixOS already</span>
  <span data-omnivore-anchor-idx="351" class="hljs-keyword">elif</span> [ -d <span data-omnivore-anchor-idx="352" class="hljs-string">"<span data-omnivore-anchor-idx="353" class="hljs-variable">$path</span>"</span> ]; <span data-omnivore-anchor-idx="354" class="hljs-keyword">then</span>
    : <span data-omnivore-anchor-idx="355" class="hljs-comment"># The path is a directory, ignore</span>
  <span data-omnivore-anchor-idx="356" class="hljs-keyword">else</span>
    <span data-omnivore-anchor-idx="357" class="hljs-built_in">echo</span> <span data-omnivore-anchor-idx="358" class="hljs-string">"<span data-omnivore-anchor-idx="359" class="hljs-variable">$path</span>"</span>
  <span data-omnivore-anchor-idx="360" class="hljs-keyword">fi</span>
<span data-omnivore-anchor-idx="361" class="hljs-keyword">done</span></code></pre>
<p data-omnivore-anchor-idx="362">Then, all it takes to find out which files now exist in the root subvolume is:</p>
<pre data-omnivore-anchor-idx="363"><code data-omnivore-anchor-idx="364" class="hljs language-jboss-cli language-stata">sudo mkdir <span data-omnivore-anchor-idx="365" class="hljs-string">/mnt</span>
sudo mount -o subvol=/ <span data-omnivore-anchor-idx="366" class="hljs-string">/dev/mapper/enc</span> <span data-omnivore-anchor-idx="367" class="hljs-string">/mnt</span>
<span data-omnivore-anchor-idx="368" class="hljs-string">./fs-diff.sh</span></code></pre>
<p data-omnivore-anchor-idx="369">This may show a surprisingly small list of files, or possible something fairly lengthy, depending on your configuration. We’ll first tackle NetworkManager, so we don’t have to re-type passwords to Wi-Fi access points after every reboot. While <a data-omnivore-anchor-idx="370" href="https://grahamc.com/blog/erase-your-darlings">grahamc’s original blog post</a> suggests that simply persisting <code data-omnivore-anchor-idx="371" class="hljs language-awk language-clean"><span data-omnivore-anchor-idx="372" class="hljs-regexp">/etc/</span>NetworkManager<span data-omnivore-anchor-idx="373" class="hljs-regexp">/system-connections</span></code> by moving it to somewhere in <code data-omnivore-anchor-idx="374" class="hljs language-jboss-cli"><span data-omnivore-anchor-idx="375" class="hljs-string">/persist</span></code> and creating a symlink is enough, this was not enough to get it to work on my XMonad setup. I ended up with something like this, symlinking a few files in <code data-omnivore-anchor-idx="376" class="hljs language-crystal language-actionscript">/var/<span data-omnivore-anchor-idx="377" class="hljs-class"><span data-omnivore-anchor-idx="378" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="379" class="hljs-title">NetworkManager</span></span></code> as well.</p>
<pre data-omnivore-anchor-idx="380"><code data-omnivore-anchor-idx="381" class="hljs language-abnf language-nix">  environment.etc = {
    <span data-omnivore-anchor-idx="382" class="hljs-string">"NetworkManager/system-connections"</span>.source = <span data-omnivore-anchor-idx="383" class="hljs-string">"/persist/etc/NetworkManager/system-connections"</span><span data-omnivore-anchor-idx="384" class="hljs-comment">;</span>
  }<span data-omnivore-anchor-idx="385" class="hljs-comment">;</span>
  systemd.tmpfiles.rules = [
    <span data-omnivore-anchor-idx="386" class="hljs-string">"L /var/lib/NetworkManager/secret_key - - - - /persist/var/lib/NetworkManager/secret_key"</span>
    <span data-omnivore-anchor-idx="387" class="hljs-string">"L /var/lib/NetworkManager/seen-bssids - - - - /persist/var/lib/NetworkManager/seen-bssids"</span>
    <span data-omnivore-anchor-idx="388" class="hljs-string">"L /var/lib/NetworkManager/timestamps - - - - /persist/var/lib/NetworkManager/timestamps"</span>
  ]<span data-omnivore-anchor-idx="389" class="hljs-comment">;</span></code></pre>
<p data-omnivore-anchor-idx="390">Now you might have noticed that the NixOS configuration itself lives in <code data-omnivore-anchor-idx="391" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="392" class="hljs-regexp">/etc/</span>nixos<span data-omnivore-anchor-idx="393" class="hljs-regexp">/</span></code>, which will be deleted if left there. After adding a few things, I ended up with a configuration like this.</p>
<pre data-omnivore-anchor-idx="394"><code data-omnivore-anchor-idx="395" class="hljs language-nix language-gradle"> environment.<span data-omnivore-anchor-idx="396" class="hljs-attr">etc</span> = {
    nixos.<span data-omnivore-anchor-idx="397" class="hljs-attr">source</span> = <span data-omnivore-anchor-idx="398" class="hljs-string">"/persist/etc/nixos"</span>;
    <span data-omnivore-anchor-idx="399" class="hljs-string">"NetworkManager/system-connections"</span>.<span data-omnivore-anchor-idx="400" class="hljs-attr">source</span> = <span data-omnivore-anchor-idx="401" class="hljs-string">"/persist/etc/NetworkManager/system-connections"</span>;
    adjtime.<span data-omnivore-anchor-idx="402" class="hljs-attr">source</span> = <span data-omnivore-anchor-idx="403" class="hljs-string">"/persist/etc/adjtime"</span>;
    NIXOS.<span data-omnivore-anchor-idx="404" class="hljs-attr">source</span> = <span data-omnivore-anchor-idx="405" class="hljs-string">"/persist/etc/NIXOS"</span>;
    machine-id.<span data-omnivore-anchor-idx="406" class="hljs-attr">source</span> = <span data-omnivore-anchor-idx="407" class="hljs-string">"/persist/etc/machine-id"</span>;
  };
  systemd.tmpfiles.<span data-omnivore-anchor-idx="408" class="hljs-attr">rules</span> = [
    <span data-omnivore-anchor-idx="409" class="hljs-string">"L /var/lib/NetworkManager/secret_key - - - - /persist/var/lib/NetworkManager/secret_key"</span>
    <span data-omnivore-anchor-idx="410" class="hljs-string">"L /var/lib/NetworkManager/seen-bssids - - - - /persist/var/lib/NetworkManager/seen-bssids"</span>
    <span data-omnivore-anchor-idx="411" class="hljs-string">"L /var/lib/NetworkManager/timestamps - - - - /persist/var/lib/NetworkManager/timestamps"</span>
  ];
  security.sudo.<span data-omnivore-anchor-idx="412" class="hljs-attr">extraConfig</span> = <span data-omnivore-anchor-idx="413" class="hljs-string">''
    # rollback results in sudo lectures after each reboot
    Defaults lecture = never
  ''</span>;</code></pre>
<p data-omnivore-anchor-idx="414">Rolling back the root subvolume is a little bit involved when compared to zfs, but can be achieved with this config.</p>
<pre data-omnivore-anchor-idx="415"><code data-omnivore-anchor-idx="416" class="hljs language-bash language-crystal">  <span data-omnivore-anchor-idx="417" class="hljs-comment"># Note `lib.mkBefore` is used instead of `lib.mkAfter` here.</span>
  boot.initrd.postDeviceCommands = pkgs.lib.mkBefore <span data-omnivore-anchor-idx="418" class="hljs-string">''</span>
    mkdir -p /mnt

    <span data-omnivore-anchor-idx="419" class="hljs-comment"># We first mount the btrfs root to /mnt</span>
    <span data-omnivore-anchor-idx="420" class="hljs-comment"># so we can manipulate btrfs subvolumes.</span>
    mount -o subvol=/ /dev/mapper/enc /mnt

    <span data-omnivore-anchor-idx="421" class="hljs-comment"># While we're tempted to just delete /root and create</span>
    <span data-omnivore-anchor-idx="422" class="hljs-comment"># a new snapshot from /root-blank, /root is already</span>
    <span data-omnivore-anchor-idx="423" class="hljs-comment"># populated at this point with a number of subvolumes,</span>
    <span data-omnivore-anchor-idx="424" class="hljs-comment"># which makes `btrfs subvolume delete` fail.</span>
    <span data-omnivore-anchor-idx="425" class="hljs-comment"># So, we remove them first.</span>
    <span data-omnivore-anchor-idx="426" class="hljs-comment">#</span>
    <span data-omnivore-anchor-idx="427" class="hljs-comment"># /root contains subvolumes:</span>
    <span data-omnivore-anchor-idx="428" class="hljs-comment"># - /root/var/lib/portables</span>
    <span data-omnivore-anchor-idx="429" class="hljs-comment"># - /root/var/lib/machines</span>
    <span data-omnivore-anchor-idx="430" class="hljs-comment">#</span>
    <span data-omnivore-anchor-idx="431" class="hljs-comment"># I suspect these are related to systemd-nspawn, but</span>
    <span data-omnivore-anchor-idx="432" class="hljs-comment"># since I don't use it I'm not 100% sure.</span>
    <span data-omnivore-anchor-idx="433" class="hljs-comment"># Anyhow, deleting these subvolumes hasn't resulted</span>
    <span data-omnivore-anchor-idx="434" class="hljs-comment"># in any issues so far, except for fairly</span>
    <span data-omnivore-anchor-idx="435" class="hljs-comment"># benign-looking errors from systemd-tmpfiles.</span>
    btrfs subvolume list -o /mnt/root |
    cut -f9 -d<span data-omnivore-anchor-idx="436" class="hljs-string">' '</span> |
    <span data-omnivore-anchor-idx="437" class="hljs-keyword">while</span> <span data-omnivore-anchor-idx="438" class="hljs-built_in">read</span> subvolume; <span data-omnivore-anchor-idx="439" class="hljs-keyword">do</span>
      <span data-omnivore-anchor-idx="440" class="hljs-built_in">echo</span> <span data-omnivore-anchor-idx="441" class="hljs-string">"deleting /<span data-omnivore-anchor-idx="442" class="hljs-variable">$subvolume</span> subvolume..."</span>
      btrfs subvolume delete <span data-omnivore-anchor-idx="443" class="hljs-string">"/mnt/<span data-omnivore-anchor-idx="444" class="hljs-variable">$subvolume</span>"</span>
    <span data-omnivore-anchor-idx="445" class="hljs-keyword">done</span> &amp;&amp;
    <span data-omnivore-anchor-idx="446" class="hljs-built_in">echo</span> <span data-omnivore-anchor-idx="447" class="hljs-string">"deleting /root subvolume..."</span> &amp;&amp;
    btrfs subvolume delete /mnt/root

    <span data-omnivore-anchor-idx="448" class="hljs-built_in">echo</span> <span data-omnivore-anchor-idx="449" class="hljs-string">"restoring blank /root subvolume..."</span>
    btrfs subvolume snapshot /mnt/root-blank /mnt/root

    <span data-omnivore-anchor-idx="450" class="hljs-comment"># Once we're done rolling back to a blank snapshot,</span>
    <span data-omnivore-anchor-idx="451" class="hljs-comment"># we can unmount /mnt and continue on the boot process.</span>
    umount /mnt
  <span data-omnivore-anchor-idx="452" class="hljs-string">''</span>;</code></pre>
<p data-omnivore-anchor-idx="453">While NixOS will take care of creating the specified symlinks, we need to move the relevant file and directories to where the symlinks are pointing at after running <code data-omnivore-anchor-idx="454" class="hljs language-ebnf language-nginx"><span data-omnivore-anchor-idx="455" class="hljs-attribute">sudo nixos-rebuild boot</span></code> and before rebooting.</p>
<pre data-omnivore-anchor-idx="456"><code data-omnivore-anchor-idx="457" class="hljs language-crystal language-dts">sudo nixos-rebuild boot

sudo mkdir -p /persist/etc/NetworkManager
sudo cp -r {,<span data-omnivore-anchor-idx="458" class="hljs-regexp">/persist}/etc</span><span data-omnivore-anchor-idx="459" class="hljs-regexp">/NetworkManager/system</span>-connections
sudo mkdir -p /persist/var/<span data-omnivore-anchor-idx="460" class="hljs-class"><span data-omnivore-anchor-idx="461" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="462" class="hljs-title">NetworkManager</span></span>
sudo cp /var/<span data-omnivore-anchor-idx="463" class="hljs-class"><span data-omnivore-anchor-idx="464" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="465" class="hljs-title">NetworkManager</span>/{<span data-omnivore-anchor-idx="466" class="hljs-title">secret_key</span>,<span data-omnivore-anchor-idx="467" class="hljs-title">seen</span>-<span data-omnivore-anchor-idx="468" class="hljs-title">bssids</span>,<span data-omnivore-anchor-idx="469" class="hljs-title">timestamps</span>} /<span data-omnivore-anchor-idx="470" class="hljs-title">persist</span>/<span data-omnivore-anchor-idx="471" class="hljs-title">var</span>/<span data-omnivore-anchor-idx="472" class="hljs-title">lib</span>/<span data-omnivore-anchor-idx="473" class="hljs-title">NetworkManager</span>/</span>

sudo cp {,<span data-omnivore-anchor-idx="474" class="hljs-regexp">/persist}/etc</span><span data-omnivore-anchor-idx="475" class="hljs-regexp">/nixos
sudo cp {,/persist</span>}/etc/adjtime
sudo cp {,<span data-omnivore-anchor-idx="476" class="hljs-regexp">/persist}/etc</span><span data-omnivore-anchor-idx="477" class="hljs-regexp">/NIXOS</span></code></pre>
<p data-omnivore-anchor-idx="478">Before rebooting, make sure that your user credentials are appropriately handled. Be especially careful<a data-omnivore-anchor-idx="479" href="#fn4" id="fnref4" role="doc-noteref"><sup data-omnivore-anchor-idx="480">4</sup></a> when setting <code data-omnivore-anchor-idx="481" class="hljs language-css"><span data-omnivore-anchor-idx="482" class="hljs-selector-tag">users</span><span data-omnivore-anchor-idx="483" class="hljs-selector-class">.mutableUsers</span></code> to false and using <code data-omnivore-anchor-idx="484" class="hljs language-css language-applescript"><span data-omnivore-anchor-idx="485" class="hljs-selector-tag">users</span><span data-omnivore-anchor-idx="486" class="hljs-selector-class">.extraUsers</span>.&lt;<span data-omnivore-anchor-idx="487" class="hljs-selector-tag">name</span>?&gt;<span data-omnivore-anchor-idx="488" class="hljs-selector-class">.passwordFile</span></code>, as these settings are some of the few in NixOS which can lock you out across NixOS configurations and require non-trivial recovery work or a reinstall. If you want declerative user management, I recommend using <code data-omnivore-anchor-idx="489" class="hljs language-css language-applescript"><span data-omnivore-anchor-idx="490" class="hljs-selector-tag">users</span><span data-omnivore-anchor-idx="491" class="hljs-selector-class">.extraUsers</span>.&lt;<span data-omnivore-anchor-idx="492" class="hljs-selector-tag">name</span>?&gt;<span data-omnivore-anchor-idx="493" class="hljs-selector-class">.hashedPasswords</span></code>, but this has it’s own downsides as well.<a data-omnivore-anchor-idx="494" href="#fn5" id="fnref5" role="doc-noteref"><sup data-omnivore-anchor-idx="495">5</sup></a></p>
<p data-omnivore-anchor-idx="496">Take another deep breath.</p>
<pre data-omnivore-anchor-idx="497"><code data-omnivore-anchor-idx="498" class="hljs language-ebnf"><span data-omnivore-anchor-idx="499" class="hljs-attribute">reboot</span></code></pre>
<p data-omnivore-anchor-idx="500">If something goes wrong and <code data-omnivore-anchor-idx="501" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="502" class="hljs-regexp">/mnt/</span>root</code> isn’t deleted, <code data-omnivore-anchor-idx="503" class="hljs language-armasm language-awk"><span data-omnivore-anchor-idx="504" class="hljs-keyword">btrfs </span><span data-omnivore-anchor-idx="505" class="hljs-keyword">subvolume </span>snapshot /mnt/root-<span data-omnivore-anchor-idx="506" class="hljs-keyword">blank </span>/mnt/root</code> will just create a snapshot under <code data-omnivore-anchor-idx="507" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="508" class="hljs-regexp">/mnt/</span>root</code>, so a quick hack to check if rolling back failed without consulting <code data-omnivore-anchor-idx="509" class="hljs language-ebnf language-mipsasm"><span data-omnivore-anchor-idx="510" class="hljs-attribute">journalctl -b</span></code> is to see if <code data-omnivore-anchor-idx="511" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="512" class="hljs-regexp">/mnt/</span>root<span data-omnivore-anchor-idx="513" class="hljs-regexp">/root-blank</span></code> exists.<a data-omnivore-anchor-idx="514" href="#fn6" id="fnref6" role="doc-noteref"><sup data-omnivore-anchor-idx="515">6</sup></a></p>
<h2 data-omnivore-anchor-idx="516" id="adding-nixos-services-case-study-docker-and-lxd">Adding NixOS Services Case Study (Docker and LXD)</h2>
<p data-omnivore-anchor-idx="517">As much as Nix and NixOS are attractive for everyday use, sometimes the time it takes to get some language or package running on NixOS just doesn’t seem worth it. That’s when container runtimes like Docker and LXD can help. These tools can act as an escape hatch to get some software working quickly on your machine.</p>
<p data-omnivore-anchor-idx="518">Here, we’ll go through the workflow for getting NixOS services to work with opt-in state, with Docker and LXD as examples.</p>
<p data-omnivore-anchor-idx="519">First, let’s get Docker and LXD running to inspect what kind of state they have. Thanks to NixOS, this is a just a few lines of configuration.</p>
<pre data-omnivore-anchor-idx="520"><code data-omnivore-anchor-idx="521" class="hljs language-nix language-routeros">  <span data-omnivore-anchor-idx="522" class="hljs-attr">virtualisation</span> = {
     docker.<span data-omnivore-anchor-idx="523" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="524" class="hljs-literal">true</span>;
    <span data-omnivore-anchor-idx="525" class="hljs-attr">lxd</span> = {
      <span data-omnivore-anchor-idx="526" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="527" class="hljs-literal">true</span>;
      <span data-omnivore-anchor-idx="528" class="hljs-attr">recommendedSysctlSettings</span> = <span data-omnivore-anchor-idx="529" class="hljs-literal">true</span>;
    };
  };</code></pre>
<pre data-omnivore-anchor-idx="530"><code data-omnivore-anchor-idx="531" class="hljs language-actionscript language-angelscript">sudo nixos-rebuild <span data-omnivore-anchor-idx="532" class="hljs-keyword">switch</span></code></pre>
<p data-omnivore-anchor-idx="533">This will install, set up, and start both Docker and LXD on our machine. With <code data-omnivore-anchor-idx="534" class="hljs language-css language-dos"><span data-omnivore-anchor-idx="535" class="hljs-selector-tag">fs-diff</span><span data-omnivore-anchor-idx="536" class="hljs-selector-class">.sh</span></code> we can see a few relevant files and directories show up.</p>
<pre data-omnivore-anchor-idx="537"><code data-omnivore-anchor-idx="538" class="hljs language-dts language-groovy"><span data-omnivore-anchor-idx="539" class="hljs-meta-keyword">/etc/</span>docker/key.json
...
<span data-omnivore-anchor-idx="540" class="hljs-meta-keyword">/var/</span>lib<span data-omnivore-anchor-idx="541" class="hljs-meta-keyword">/docker/</span>...
<span data-omnivore-anchor-idx="542" class="hljs-meta-keyword">/var/</span>lib<span data-omnivore-anchor-idx="543" class="hljs-meta-keyword">/lxd/</span>...</code></pre>
<p data-omnivore-anchor-idx="544">Some quick googling tells us that <code data-omnivore-anchor-idx="545" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="546" class="hljs-regexp">/etc/</span>docker<span data-omnivore-anchor-idx="547" class="hljs-regexp">/key.json</span></code> is generated on every boot, so it seems like we don’t need to keep this around. On the other hand, <code data-omnivore-anchor-idx="548" class="hljs language-crystal language-actionscript">/var/<span data-omnivore-anchor-idx="549" class="hljs-class"><span data-omnivore-anchor-idx="550" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="551" class="hljs-title">docker</span></span></code> and <code data-omnivore-anchor-idx="552" class="hljs language-crystal language-actionscript">/var/<span data-omnivore-anchor-idx="553" class="hljs-class"><span data-omnivore-anchor-idx="554" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="555" class="hljs-title">lxd</span></span></code> seem important, so let’s adjust our config accordingly.</p>
<pre data-omnivore-anchor-idx="556"><code data-omnivore-anchor-idx="557" class="hljs language-abnf language-nix">  systemd.tmpfiles.rules = [
    <span data-omnivore-anchor-idx="558" class="hljs-string">"L /var/lib/NetworkManager/secret_key - - - - /persist/var/lib/NetworkManager/secret_key"</span>
    <span data-omnivore-anchor-idx="559" class="hljs-string">"L /var/lib/NetworkManager/seen-bssids - - - - /persist/var/lib/NetworkManager/seen-bssids"</span>
    <span data-omnivore-anchor-idx="560" class="hljs-string">"L /var/lib/NetworkManager/timestamps - - - - /persist/var/lib/NetworkManager/timestamps"</span>
    <span data-omnivore-anchor-idx="561" class="hljs-string">"L /var/lib/lxd - - - - /persist/var/lib/lxd"</span>
    <span data-omnivore-anchor-idx="562" class="hljs-string">"L /var/lib/docker - - - - /persist/var/lib/docker"</span>
  ]<span data-omnivore-anchor-idx="563" class="hljs-comment">;</span></code></pre>
<p data-omnivore-anchor-idx="564">Now, stop the two services and copy over the directories.</p>
<pre data-omnivore-anchor-idx="565"><code data-omnivore-anchor-idx="566" class="hljs language-crystal language-awk">sudo mkdir -p /persist/var/<span data-omnivore-anchor-idx="567" class="hljs-class"><span data-omnivore-anchor-idx="568" class="hljs-keyword">lib</span>/</span>

sudo systemctl stop lxd
sudo cp -r {,<span data-omnivore-anchor-idx="569" class="hljs-regexp">/persist}/var</span><span data-omnivore-anchor-idx="570" class="hljs-regexp">/lib/lxd</span>

sudo systemctl stop docker
sudo cp -r {,<span data-omnivore-anchor-idx="571" class="hljs-regexp">/persist}/var</span><span data-omnivore-anchor-idx="572" class="hljs-regexp">/lib/docker</span>

sudo nixos-rebuild boot
reboot</code></pre>
<p data-omnivore-anchor-idx="573">If all goes well, running the <code data-omnivore-anchor-idx="574" class="hljs language-css language-dos"><span data-omnivore-anchor-idx="575" class="hljs-selector-tag">fs-diff</span><span data-omnivore-anchor-idx="576" class="hljs-selector-class">.sh</span></code> after reboot shouldn’t show persisted directories <code data-omnivore-anchor-idx="577" class="hljs language-crystal language-actionscript">/var/<span data-omnivore-anchor-idx="578" class="hljs-class"><span data-omnivore-anchor-idx="579" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="580" class="hljs-title">lxd</span></span></code> and <code data-omnivore-anchor-idx="581" class="hljs language-crystal language-actionscript">/var/<span data-omnivore-anchor-idx="582" class="hljs-class"><span data-omnivore-anchor-idx="583" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="584" class="hljs-title">docker</span></span></code> since they should be symlinks which are created during the boot process.</p>
<p data-omnivore-anchor-idx="585">Docker should work without any problems at this point, but we LXD needs some additional configuration. LXD requires a storage pool to operate, so we create a subvolume for LXD, and mount it in <code data-omnivore-anchor-idx="586" class="hljs language-jboss-cli"><span data-omnivore-anchor-idx="587" class="hljs-string">/persist</span></code>.</p>
<pre data-omnivore-anchor-idx="588"><code data-omnivore-anchor-idx="589" class="hljs language-jboss-cli language-groovy">sudo mount -o subvol=/ <span data-omnivore-anchor-idx="590" class="hljs-string">/mnt</span>
sudo btrfs subvolume create <span data-omnivore-anchor-idx="591" class="hljs-string">/mnt/lxd</span>
sudo umount <span data-omnivore-anchor-idx="592" class="hljs-string">/mnt</span>
sudo mkdir <span data-omnivore-anchor-idx="593" class="hljs-string">/persist/lxd</span>
sudo mount -o subvol=lxd <span data-omnivore-anchor-idx="594" class="hljs-string">/dev/mapper/enc</span> <span data-omnivore-anchor-idx="595" class="hljs-string">/persist/lxd</span></code></pre>
<p data-omnivore-anchor-idx="596">Once the subvolume is ready, we run <code data-omnivore-anchor-idx="597" class="hljs language-ebnf language-kotlin"><span data-omnivore-anchor-idx="598" class="hljs-attribute">lxd init</span></code> and answer the questions in the following manner.</p>
<pre data-omnivore-anchor-idx="599"><code data-omnivore-anchor-idx="600" class="hljs language-routeros language-sql">$ lxd init
Would you like <span data-omnivore-anchor-idx="601" class="hljs-keyword">to</span> use LXD clustering? (<span data-omnivore-anchor-idx="602" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="603" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="604" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="605" class="hljs-literal">no</span>]: <span data-omnivore-anchor-idx="606" class="hljs-literal">no</span>
<span data-omnivore-anchor-idx="607" class="hljs-keyword">Do</span> you want <span data-omnivore-anchor-idx="608" class="hljs-keyword">to</span> configure a new storage pool? (<span data-omnivore-anchor-idx="609" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="610" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="611" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="612" class="hljs-literal">yes</span>]:
Name of the new storage<span data-omnivore-anchor-idx="613" class="hljs-built_in"> pool </span>[<span data-omnivore-anchor-idx="614" class="hljs-attribute">default</span>=default]:
Name of the storage backend <span data-omnivore-anchor-idx="615" class="hljs-keyword">to</span> use (btrfs, dir, lvm) [<span data-omnivore-anchor-idx="616" class="hljs-attribute">default</span>=btrfs]:
Would you like <span data-omnivore-anchor-idx="617" class="hljs-keyword">to</span> create a new btrfs subvolume under /var/lib/lxd? (<span data-omnivore-anchor-idx="618" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="619" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="620" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="621" class="hljs-literal">yes</span>]: <span data-omnivore-anchor-idx="622" class="hljs-literal">no</span>
Create a new BTRFS pool? (<span data-omnivore-anchor-idx="623" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="624" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="625" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="626" class="hljs-literal">yes</span>]: <span data-omnivore-anchor-idx="627" class="hljs-literal">no</span>
Name of the existing BTRFS<span data-omnivore-anchor-idx="628" class="hljs-built_in"> pool </span><span data-omnivore-anchor-idx="629" class="hljs-keyword">or</span> dataset: /persist/lxd
Would you like <span data-omnivore-anchor-idx="630" class="hljs-keyword">to</span> connect <span data-omnivore-anchor-idx="631" class="hljs-keyword">to</span> a MAAS server? (<span data-omnivore-anchor-idx="632" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="633" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="634" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="635" class="hljs-literal">no</span>]:
Would you like <span data-omnivore-anchor-idx="636" class="hljs-keyword">to</span> create a new local<span data-omnivore-anchor-idx="637" class="hljs-built_in"> network </span>bridge? (<span data-omnivore-anchor-idx="638" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="639" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="640" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="641" class="hljs-literal">yes</span>]:
What should the new<span data-omnivore-anchor-idx="642" class="hljs-built_in"> bridge </span>be called? [<span data-omnivore-anchor-idx="643" class="hljs-attribute">default</span>=lxdbr0]:
What IPv4<span data-omnivore-anchor-idx="644" class="hljs-built_in"> address </span>should be used? (CIDR subnet notation, “auto” <span data-omnivore-anchor-idx="645" class="hljs-keyword">or</span> “none”) [<span data-omnivore-anchor-idx="646" class="hljs-attribute">default</span>=auto]:
What<span data-omnivore-anchor-idx="647" class="hljs-built_in"> IPv6 address </span>should be used? (CIDR subnet notation, “auto” <span data-omnivore-anchor-idx="648" class="hljs-keyword">or</span> “none”) [<span data-omnivore-anchor-idx="649" class="hljs-attribute">default</span>=auto]:
Would you like LXD <span data-omnivore-anchor-idx="650" class="hljs-keyword">to</span> be available over the network? (<span data-omnivore-anchor-idx="651" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="652" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="653" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="654" class="hljs-literal">no</span>]:
Would you like stale cached images <span data-omnivore-anchor-idx="655" class="hljs-keyword">to</span> be updated automatically? (<span data-omnivore-anchor-idx="656" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="657" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="658" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="659" class="hljs-literal">yes</span>]
Would you like a YAML <span data-omnivore-anchor-idx="660" class="hljs-string">"lxd init"</span> preseed <span data-omnivore-anchor-idx="661" class="hljs-keyword">to</span> be printed? (<span data-omnivore-anchor-idx="662" class="hljs-literal">yes</span>/<span data-omnivore-anchor-idx="663" class="hljs-literal">no</span>) [<span data-omnivore-anchor-idx="664" class="hljs-attribute">default</span>=<span data-omnivore-anchor-idx="665" class="hljs-literal">no</span>]:</code></pre>
<p data-omnivore-anchor-idx="666">Remember to add the relevant information to <code data-omnivore-anchor-idx="667" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="668" class="hljs-regexp">/etc/</span>nixos<span data-omnivore-anchor-idx="669" class="hljs-regexp">/hardware-configuration.nix</span></code> so NixOS will mount the subvolume where LXD expects (i.e.&nbsp;<code data-omnivore-anchor-idx="670" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="671" class="hljs-regexp">/persist/</span>lxd</code>).</p>
<pre data-omnivore-anchor-idx="672"><code data-omnivore-anchor-idx="673" class="hljs language-abnf language-nix">  fileSystems.<span data-omnivore-anchor-idx="674" class="hljs-string">"/persist/lxd"</span> =
    { device = <span data-omnivore-anchor-idx="675" class="hljs-string">"/dev/disk/by-uuid/f73c53b7-ae6c-4240-89c3-511ad918edcc"</span><span data-omnivore-anchor-idx="676" class="hljs-comment">;</span>
      fsType = <span data-omnivore-anchor-idx="677" class="hljs-string">"btrfs"</span><span data-omnivore-anchor-idx="678" class="hljs-comment">;</span>
      options = [ <span data-omnivore-anchor-idx="679" class="hljs-string">"subvol=lxd"</span> <span data-omnivore-anchor-idx="680" class="hljs-string">"compress=zstd"</span> <span data-omnivore-anchor-idx="681" class="hljs-string">"noatime"</span> ]<span data-omnivore-anchor-idx="682" class="hljs-comment">;</span>
    }<span data-omnivore-anchor-idx="683" class="hljs-comment">;</span></code></pre>
<p data-omnivore-anchor-idx="684">EDIT 2020-01-26: Added persistence for <code data-omnivore-anchor-idx="685" class="hljs language-applescript language-awk">/etc/machine-<span data-omnivore-anchor-idx="686" class="hljs-built_in">id</span></code>, which fixes an issue where journalctl fails to find logs from past boots, among various others. Thanks j-hui for pointing this out!</p>
<p data-omnivore-anchor-idx="687"><small data-omnivore-anchor-idx="688"> Thanks to cannorin and __pandaman64__ for comments and suggestions. </small></p>
<section data-omnivore-anchor-idx="689" role="doc-endnotes">
<hr data-omnivore-anchor-idx="690">
<ol data-omnivore-anchor-idx="691">
<li data-omnivore-anchor-idx="692" id="fn1" role="doc-endnote"><p data-omnivore-anchor-idx="693">When using a Windows or macOS laptop, I find myself reinstalling the OS every so often to restore the machine to a clean state. Why go through this trouble if you can get your OS to do this on every boot?<a data-omnivore-anchor-idx="694" href="#fnref1" role="doc-backlink">↩︎</a></p></li>
<li data-omnivore-anchor-idx="695" id="fn2" role="doc-endnote"><p data-omnivore-anchor-idx="696">Sadly, we stop short of FDE and settle for only encrypting the btrfs volume, as encrypting <code data-omnivore-anchor-idx="697" class="hljs language-jboss-cli language-stata"><span data-omnivore-anchor-idx="698" class="hljs-string">/boot</span></code> seems <a data-omnivore-anchor-idx="699" href="https://elvishjerricco.github.io/2018/12/06/encrypted-boot-on-zfs-with-nixos.html">much more complicated</a> than I’m willing to experiment with. It’s unfortunate that desktop Linux security severely lags behind smartphones, where FDE is the norm rather than the exception, for example.<a data-omnivore-anchor-idx="700" href="#fnref2" role="doc-backlink">↩︎</a></p></li>
<li data-omnivore-anchor-idx="701" id="fn3" role="doc-endnote"><p data-omnivore-anchor-idx="702">Note that I’m creating a swap partition despite having 32GB of RAM. Contrary to popular belief, you should still create swap partitions on systems with “enough RAM”. See this blog post for details: <a data-omnivore-anchor-idx="703" href="https://chrisdown.name/2018/01/02/in-defence-of-swap.html">In defence of swap: common misconceptions</a><a data-omnivore-anchor-idx="704" href="#fnref3" role="doc-backlink">↩︎</a></p></li>
<li data-omnivore-anchor-idx="705" id="fn4" role="doc-endnote"><p data-omnivore-anchor-idx="706"><a data-omnivore-anchor-idx="707" href="https://github.com/NixOS/nixpkgs/issues/4990#issuecomment-63238644">You may need to add <code data-omnivore-anchor-idx="708" class="hljs language-ini language-abnf"><span data-omnivore-anchor-idx="709" class="hljs-attr">neededForBoot</span> = <span data-omnivore-anchor-idx="710" class="hljs-literal">true</span><span data-omnivore-anchor-idx="711" class="hljs-comment">;</span></code> to <code data-omnivore-anchor-idx="712" class="hljs language-jboss-cli"><span data-omnivore-anchor-idx="713" class="hljs-string">/persist</span></code></a>, but I haven’t verified this first-hand.<a data-omnivore-anchor-idx="714" href="#fnref4" role="doc-backlink">↩︎</a></p></li>
<li data-omnivore-anchor-idx="715" id="fn5" role="doc-endnote"><p data-omnivore-anchor-idx="716">Using <code data-omnivore-anchor-idx="717" class="hljs language-ebnf"><span data-omnivore-anchor-idx="718" class="hljs-attribute">hashedPasswords</span></code> has two drawbacks off the top of my head:</p>
<ul data-omnivore-anchor-idx="719">
<li data-omnivore-anchor-idx="720">Since your configuration is kept in the Nix store, other users can read your hashed password and attempt to crack it. Note this does not happen when <code data-omnivore-anchor-idx="721" class="hljs language-ini language-nix"><span data-omnivore-anchor-idx="722" class="hljs-attr">users.mutableUsers</span> = <span data-omnivore-anchor-idx="723" class="hljs-literal">false</span><span data-omnivore-anchor-idx="724" class="hljs-comment">;</span></code> since <code data-omnivore-anchor-idx="725" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="726" class="hljs-regexp">/etc/</span>shadow</code> is only root-readable.</li>
<li data-omnivore-anchor-idx="727">Putting your configuration.nix in a public repository has similar problems. I feel this is a bigger problem, since you can no longer just <code data-omnivore-anchor-idx="728" class="hljs language-crmsh language-awk">git <span data-omnivore-anchor-idx="729" class="hljs-keyword">clone</span> <span data-omnivore-anchor-idx="730" class="hljs-title">https</span>://github.com/user/dotfiles-repo</code> which may somewhat complicate your initial setup process.</li>
</ul>
<a data-omnivore-anchor-idx="731" href="#fnref5" role="doc-backlink">↩︎</a></li>
<li data-omnivore-anchor-idx="732" id="fn6" role="doc-endnote"><p data-omnivore-anchor-idx="733">Something like <code data-omnivore-anchor-idx="734" class="hljs language-armasm language-autohotkey">[ -d /root-<span data-omnivore-anchor-idx="735" class="hljs-keyword">blank </span>] &amp;&amp; notify-send -u critical <span data-omnivore-anchor-idx="736" class="hljs-string">"opt-in state"</span> <span data-omnivore-anchor-idx="737" class="hljs-string">"rollback failed"</span></code> would be nice to run after logging in.<a data-omnivore-anchor-idx="738" href="#fnref6" role="doc-backlink">↩︎</a></p></li>
</ol>
</section>
<a data-omnivore-anchor-idx="739" href="https://mt-caret.github.io/blog/index.html">index</a>

</article></DIV></DIV>



# links
[Read on Omnivore](https://omnivore.app/me/encypted-btrfs-root-with-opt-in-state-on-nix-os-18ede22c556)
[Read Original](https://mt-caret.github.io/blog/posts/2020-06-29-optin-state.html)

<iframe src="https://mt-caret.github.io/blog/posts/2020-06-29-optin-state.html"  width="800" height="500"></iframe>
