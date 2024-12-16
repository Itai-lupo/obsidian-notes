---
id: fe465245-d245-4dc3-bd9f-81e00d2b1d50
title: Application Isolation using NixOS Containers
author: Marcin Sucharski
tags:
  - linux
  - nixos
  - docker
date: 2024-05-29 20:14:02
date_published: 2021-08-30 00:26:41
words_count: 4864
state: COMPLETED
---

# Application Isolation using NixOS Containers by Marcin Sucharski
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Nowadays, if you use a computer, you are likely to run untrusted code and work with untrusted data.
Everyday scenarios include executing a JavaScript code in a browser and opening an email in an email client.
While any modern web browser and email client will provide some sandboxing, this is not a general case for most software.
I find software development to be particularly risky because, as software developers, we tend to use various third party code from public repositories.
In this post, I’m describing an approach to sandboxing specific to the NixOS.
I found it surprisingly easy and flexible, so I thought that I might write about it. :)


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
<DIV id="readability-content"><DIV data-omnivore-anchor-idx="1" class="page" id="readability-page-1"><div data-omnivore-anchor-idx="2"><p data-omnivore-anchor-idx="3"> <span data-omnivore-anchor-idx="4">· 24 min read</span></p><div data-omnivore-anchor-idx="5"><p data-omnivore-anchor-idx="6">Nowadays, if you use a computer, you are likely to run untrusted code and work with untrusted data.
Everyday scenarios include executing a JavaScript code in a browser and opening an email in an email client.
While any modern web browser and email client will provide some sandboxing, this is not a general case for most software.
I find software development to be particularly risky because, as software developers, we tend to use various third party code from public repositories.</p><p data-omnivore-anchor-idx="7">In this post, I’m describing an approach to sandboxing specific to the NixOS.
I found it surprisingly easy and flexible, so I thought that I might write about it. :)</p><p data-omnivore-anchor-idx="8">Please be aware that the risks described above are not theoretical.
There were cases where attackers introduced malicious code to a public repository.
Or when legit software decided to wipe <code data-omnivore-anchor-idx="9" class="hljs language-undefined">/</code> directory due to a bug.
I think it’s safe to assume that something alike will happen again in the future.</p><p data-omnivore-anchor-idx="10">As a software developer, I want to sandbox my environment, so an IDE, build tools and software I write, do not have access to my documents and other projects.
In this post, I will show you a solution that I found acceptable both from a security standpoint and comfort of use.
The approach is generic: it enables isolating development workflow and any software, such as browser or email client.</p><p data-omnivore-anchor-idx="11"><strong data-omnivore-anchor-idx="12">Keep in mind that the <em data-omnivore-anchor-idx="13">security standpoint</em> refers to my requirements. I’ll try to emphasize potential attack vectors, but I’m not a security expert.</strong></p><p data-omnivore-anchor-idx="14">I have tested multiple approaches to this problem, and the one mentioned in the title works best for me so far.
For completeness, let me list my requirements and tried solutions.
Yours are undoubtedly different, so keep that in mind. ;-)</p><h3 data-omnivore-anchor-idx="15" id="requirements">Requirements <a data-omnivore-anchor-idx="16" href="#requirements">🔗</a></h3><ul data-omnivore-anchor-idx="17"><li data-omnivore-anchor-idx="18"><strong data-omnivore-anchor-idx="19">Isolated filesystem</strong> — files from the host (especially <code data-omnivore-anchor-idx="20" class="hljs language-arduino language-jboss-cli">/<span data-omnivore-anchor-idx="21" class="hljs-built_in">home</span></code>) should not be accessible by development tools unless explicitly allowed.</li><li data-omnivore-anchor-idx="22"><strong data-omnivore-anchor-idx="23">Support IDEs I like</strong> — I want to use tools that enable me to work efficiently. Most notably, I like IDEs from JetBrains (<a data-omnivore-anchor-idx="24" href="https://www.jetbrains.com/idea/">IntelliJ Idea</a>), so its support is my must-have.</li><li data-omnivore-anchor-idx="25"><strong data-omnivore-anchor-idx="26">Performance</strong> — I’m sensitive to latency when typing. Any solution with noticeable latency will annoy me, and in the end, I won’t be using it.</li><li data-omnivore-anchor-idx="27"><strong data-omnivore-anchor-idx="28">Consistent settings</strong> — it would be nice to have a similar configuration (shell, shortcuts, etc.) in every project.</li><li data-omnivore-anchor-idx="29"><strong data-omnivore-anchor-idx="30">Multiple projects</strong> — it should be possible to work with numerous isolated projects with minimal effort. Projects should not be aware of each other.</li><li data-omnivore-anchor-idx="31"><strong data-omnivore-anchor-idx="32">Various machines</strong> — it should be possible to keep similar environments on multiple physical devices with minimal effort.</li></ul><h3 data-omnivore-anchor-idx="33" id="tested-solutions">Tested solutions <a data-omnivore-anchor-idx="34" href="#tested-solutions">🔗</a></h3><h4 data-omnivore-anchor-idx="35" id="separate-virtual-machine-for-each-project">Separate virtual machine for each project <a data-omnivore-anchor-idx="36" href="#separate-virtual-machine-for-each-project">🔗</a></h4><p data-omnivore-anchor-idx="37">It’s the most straightforward approach if you want something quick.
In addition, it provides excellent isolation between host and guest.
(Boundary between both machines is well-defined.)</p><p data-omnivore-anchor-idx="38">However, it has two caveats: performance and consistent settings.
While consistent settings can be achieved through some configuration tools, be it Ansible or NixOS config, the performance problem is pretty complex.
The most critical factor is graphics performance, and in my experience, it is the hardest to solve.
Although VGA passthrough is possible (I have been gaming in VM using such setup), it is hardware-specific, and in my experience, it had some quirks even when it worked.
In other cases, we are stuck with <code data-omnivore-anchor-idx="39" class="hljs language-ebnf"><span data-omnivore-anchor-idx="40" class="hljs-attribute">virtio-gpu</span></code> which is nice, but I did feel input lag when using it with IntelliJ Idea.<sup data-omnivore-anchor-idx="41" id="fnref:1"><a data-omnivore-anchor-idx="42" href="#fn:1" role="doc-noteref">1</a></sup></p><p data-omnivore-anchor-idx="43">Also, other factors, such as <a data-omnivore-anchor-idx="44" href="https://superuser.com/questions/1246958/qemu-kvm-lvm-performance-of-block-device-drive-vs-file-image">block device configuration</a>, are non-trivial to configure and may affect performance.</p><h4 data-omnivore-anchor-idx="45" id="remote-development">Remote development <a data-omnivore-anchor-idx="46" href="#remote-development">🔗</a></h4><p data-omnivore-anchor-idx="47">Probably mostly known thanks to <a data-omnivore-anchor-idx="48" href="https://code.visualstudio.com/docs/remote/remote-overview">built-in support in Visual Studio Code</a>.
Not everyone knows that JetBrains offers a similar solution for their products and, in theory, any Java application.
<a data-omnivore-anchor-idx="49" href="https://jetbrains.com/projector/">JetBrains Projector</a> enables running IDE on any network-accessible computer (local VM, container, remote VM) and uses it through a web browser or native app.</p><p data-omnivore-anchor-idx="50">I’m really looking forward to this project.
However, I had some rendering issues at this point, so I will wait till it matures.
The input latency has impressed me: it was surprisingly good even with emulated network throttling in Firefox.</p><p data-omnivore-anchor-idx="51">I kind of believe that remote development is the future of software development.
Its perfect implementation would allow seamless development from a workstation, an iPad, and a smartphone with an external screen and keyboard (think of Linux On Dex / Samsung Dex).
Imagine a world where developers do not need to carry a notebook because a smartphone connected to a docking station gives you everything necessary. ;-)</p><h4 data-omnivore-anchor-idx="52" id="other">Other <a data-omnivore-anchor-idx="53" href="#other">🔗</a></h4><p data-omnivore-anchor-idx="54">Most of my approaches can be classified as one of the previous points.
If you are interested, you can also look at:</p><ul data-omnivore-anchor-idx="55"><li data-omnivore-anchor-idx="56"><a data-omnivore-anchor-idx="57" href="https://spectrum-os.org/">Spectrum</a> — Nix-based OS similar to <a data-omnivore-anchor-idx="58" href="https://www.qubes-os.org/">Qubes OS</a>. However, instead of doing everything inside a virtual machine, this project attempts to leverage Wayland’s capabilities to run graphical applications with native performance and secure them using solutions similar to Chrome OS.</li><li data-omnivore-anchor-idx="59"><a data-omnivore-anchor-idx="60" href="https://en.wikipedia.org/wiki/Remote_Desktop_Protocol">RDP</a> — in my experience, too slow for any real work.</li><li data-omnivore-anchor-idx="61"><a data-omnivore-anchor-idx="62" href="https://www.docker.com/">Docker</a> / <a data-omnivore-anchor-idx="63" href="https://podman.io/">Podman</a> — not designed for this use-case which results in complexities in handling file permission (when sharing with the host). Not every tool can be easily configured during container build, which results in an additional state that should be preserved when we want to update the container. Quickly gets very complex.</li><li data-omnivore-anchor-idx="64"><a data-omnivore-anchor-idx="65" href="https://flatpak.org/">Flatpak</a> / <a data-omnivore-anchor-idx="66" href="https://snapcraft.io/">Snap</a> — a lot of applications have almost no isolation from the host. Most, if not all, development tools have access to files in <code data-omnivore-anchor-idx="67" class="hljs language-arduino language-jboss-cli">/<span data-omnivore-anchor-idx="68" class="hljs-built_in">home</span></code> (sometimes with a deny list). Also, it’s difficult to create multiple instances of the same application for various contexts (think of working on projects for another client using the same IDE).</li></ul><h4 data-omnivore-anchor-idx="69" id="nixos-containers">NixOS containers <a data-omnivore-anchor-idx="70" href="#nixos-containers">🔗</a></h4><p data-omnivore-anchor-idx="71">This is what this post is all about.
I’ll show you how to create isolated environments using <a data-omnivore-anchor-idx="72" href="https://nixos.org/manual/nixos/stable/index.html#sec-declarative-containers">declarative containers</a>.
You can see the final result in the following video:</p><video data-omnivore-anchor-idx="73" controls preload="metadata" src="https://msucharski.eu/posts/application-isolation-nixos-containers/application-isolation-nixos-containers-1918x1056.mp4#t=0.001" width="1918" height="1056"></video><p data-omnivore-anchor-idx="74">Let’s start!</p><h2 data-omnivore-anchor-idx="75" id="high-level-design">High-level design <a data-omnivore-anchor-idx="76" href="#high-level-design">🔗</a></h2><p data-omnivore-anchor-idx="77">The basic idea is to build several containers with a configuration similar to the host but with a few tweaks:</p><ul data-omnivore-anchor-idx="78"><li data-omnivore-anchor-idx="79">A container has a different set of applications. Some of them may be the same as in the host (usual stuff like a terminal emulator, <code data-omnivore-anchor-idx="80" class="hljs language-ebnf"><span data-omnivore-anchor-idx="81" class="hljs-attribute">jq</span></code>, etc.), and others may be completely different (VSCode installed only inside a container).</li><li data-omnivore-anchor-idx="82">A container does not run compositor. Instead, it uses one provided by the host, through the Wayland socket or X11 socket.</li><li data-omnivore-anchor-idx="83">A container does not manage any secrets nor have root / sudo access. It means that any substantial change to container configuration has to be done from the outside. Also, any, for example, git operations, commit signing, etc., should be done from the host.</li></ul><p data-omnivore-anchor-idx="84">If we visualize it, we may think of the following picture:</p><picture data-omnivore-anchor-idx="85"><img data-omnivore-anchor-idx="86" data-omnivore-original-src="https://msucharski.eu/posts/application-isolation-nixos-containers/nixos-containers-hll-603x663.svg" alt="High Level design visualization" src="https://proxy-prod.omnivore-image-cache.app/603x663,shZVnj4ONxOTpQZqq5dCAxKCJekIDU0otGCXJJJN4ESM/https://msucharski.eu/posts/application-isolation-nixos-containers/nixos-containers-hll-603x663.svg" loading="lazy" width="603" height="663"></picture><p data-omnivore-anchor-idx="87">Blue rectangles represent — somewhat abstract — structure of Nix configuration parts.
I try to reify it by associating every blue rectangle/part with Nix modules.
Remember that there is only one <code data-omnivore-anchor-idx="88" class="hljs language-css language-pgsql"><span data-omnivore-anchor-idx="89" class="hljs-selector-tag">configuration</span><span data-omnivore-anchor-idx="90" class="hljs-selector-class">.nix</span></code> for the host, and containers are part of the host configuration.
Nonetheless, I find this logical separation easier to reason about.</p><h2 data-omnivore-anchor-idx="91" id="implementation">Implementation <a data-omnivore-anchor-idx="92" href="#implementation">🔗</a></h2><p data-omnivore-anchor-idx="93">I assume that you already have basic NixOS knowledge, so I won’t describe splitting configuration into multiple files.<sup data-omnivore-anchor-idx="94" id="fnref:2"><a data-omnivore-anchor-idx="95" href="#fn:2" role="doc-noteref">2</a></sup>
In my setup, I have a <code data-omnivore-anchor-idx="96" class="hljs language-css"><span data-omnivore-anchor-idx="97" class="hljs-selector-tag">desktop</span><span data-omnivore-anchor-idx="98" class="hljs-selector-class">.nix</span></code> and a <code data-omnivore-anchor-idx="99" class="hljs language-css"><span data-omnivore-anchor-idx="100" class="hljs-selector-tag">desktop-host</span><span data-omnivore-anchor-idx="101" class="hljs-selector-class">.nix</span></code>.
The first one contains the common configuration, which I expect to be consistent across all machines/containers/VM-s, and the second one should be applied only to the host.</p><p data-omnivore-anchor-idx="102">An important aspect of consistent settings across host/containers is dotfiles configuration.
While NixOS, by default, provides excellent means to configure “global” things, it lacks options to configure software per user.<sup data-omnivore-anchor-idx="103" id="fnref:3"><a data-omnivore-anchor-idx="104" href="#fn:3" role="doc-noteref">3</a></sup>
Fortunately, this problem has been solved by the Nix community through <a data-omnivore-anchor-idx="105" href="https://github.com/nix-community/home-manager">Home Manager</a>.</p><h3 data-omnivore-anchor-idx="106" id="automatic-home-dotfiles-configuration-through-the-home-manager">Automatic home dotfiles configuration through the Home Manager <a data-omnivore-anchor-idx="107" href="#automatic-home-dotfiles-configuration-through-the-home-manager">🔗</a></h3><p data-omnivore-anchor-idx="108">Usually, a user manually runs Home Manager.
However, in the case of automatically configured containers, we would prefer to avoid manual work, so after the <code data-omnivore-anchor-idx="109" class="hljs language-actionscript language-angelscript">nixos-rebuild <span data-omnivore-anchor-idx="110" class="hljs-keyword">switch</span></code>, a new home configuration should also be applied.
I don’t think it is widely known, but we can achieve this through the following code in <code data-omnivore-anchor-idx="111" class="hljs language-css language-pgsql"><span data-omnivore-anchor-idx="112" class="hljs-selector-tag">configuration</span><span data-omnivore-anchor-idx="113" class="hljs-selector-class">.nix</span></code>:</p><div data-omnivore-anchor-idx="114"><pre data-omnivore-anchor-idx="115" tabindex="0"><code data-omnivore-anchor-idx="116" class="hljs language-nix language-puppet">{ config, ... }:

<span data-omnivore-anchor-idx="117" class="hljs-keyword">let</span>
  <span data-omnivore-anchor-idx="118" class="hljs-attr">home-manager</span> = <span data-omnivore-anchor-idx="119" class="hljs-built_in">builtins</span>.fetchGit {
    <span data-omnivore-anchor-idx="120" class="hljs-attr">url</span> = <span data-omnivore-anchor-idx="121" class="hljs-string">"https://github.com/rycee/home-manager.git"</span>;
    <span data-omnivore-anchor-idx="122" class="hljs-attr">ref</span> = <span data-omnivore-anchor-idx="123" class="hljs-string">"release-21.05"</span>;
    <span data-omnivore-anchor-idx="124" class="hljs-attr">rev</span> = <span data-omnivore-anchor-idx="125" class="hljs-string">"35a24648d155843a4d162de98c17b1afd5db51e4"</span>;
  };
<span data-omnivore-anchor-idx="126" class="hljs-keyword">in</span> {
  <span data-omnivore-anchor-idx="127" class="hljs-attr">imports</span> = [ (<span data-omnivore-anchor-idx="128" class="hljs-built_in">import</span> <span data-omnivore-anchor-idx="129" class="hljs-string">"<span data-omnivore-anchor-idx="130" class="hljs-subst">${home-manager}</span>/nixos"</span>) ];
    
  <span data-omnivore-anchor-idx="131" class="hljs-attr">home-manager</span> = {
    users.<span data-omnivore-anchor-idx="132" class="hljs-attr">myuser</span> = {
      <span data-omnivore-anchor-idx="133" class="hljs-comment"># standard Home Manager configuration</span>
    };
  };
}
</code></pre></div><p data-omnivore-anchor-idx="134">An important consequence of this approach is manual Home Manager version management.
From time to time, we need to run:</p><div data-omnivore-anchor-idx="135"><pre data-omnivore-anchor-idx="136" tabindex="0"><code data-omnivore-anchor-idx="137" class="hljs language-arduino language-ada">nix-prefetch-github nix-community <span data-omnivore-anchor-idx="138" class="hljs-built_in">home</span>-manager --rev <span data-omnivore-anchor-idx="139" class="hljs-built_in">release</span><span data-omnivore-anchor-idx="140" class="hljs-number">-21.05</span>
</code></pre></div><p data-omnivore-anchor-idx="141">and update revision.</p><p data-omnivore-anchor-idx="142">This might be a problem because by default (as of July 2021), Home Manager uses private <code data-omnivore-anchor-idx="143" class="hljs language-ebnf"><span data-omnivore-anchor-idx="144" class="hljs-attribute">pkgs</span></code> instance, which may result in using old software version by mistake.
One way to avoid this is to set the <code data-omnivore-anchor-idx="145" class="hljs language-ini language-arduino"><span data-omnivore-anchor-idx="146" class="hljs-attr">home-manager.useGlobalPkgs</span> = <span data-omnivore-anchor-idx="147" class="hljs-literal">true</span></code>, which will tell Home Manager to use global <code data-omnivore-anchor-idx="148" class="hljs language-ebnf"><span data-omnivore-anchor-idx="149" class="hljs-attribute">pkgs</span></code> configured on system level.</p><h3 data-omnivore-anchor-idx="150" id="base-configuration">Base configuration <a data-omnivore-anchor-idx="151" href="#base-configuration">🔗</a></h3><p data-omnivore-anchor-idx="152">I’ve prepared a basic NixOS configuration upon which further work will be built.
At this point, there is no configuration related to containers.
It consists of several files to clearly separate configurations that should be common or host-only:</p><ul data-omnivore-anchor-idx="153"><li data-omnivore-anchor-idx="154"><code data-omnivore-anchor-idx="155" class="hljs language-css language-pgsql"><span data-omnivore-anchor-idx="156" class="hljs-selector-tag">configuration</span><span data-omnivore-anchor-idx="157" class="hljs-selector-class">.nix</span></code> — configuration root, specific to the host machine.</li><li data-omnivore-anchor-idx="158"><code data-omnivore-anchor-idx="159" class="hljs language-css"><span data-omnivore-anchor-idx="160" class="hljs-selector-tag">desktop-host</span><span data-omnivore-anchor-idx="161" class="hljs-selector-class">.nix</span></code> — system configuration consistent across machines but not present in the containers.</li><li data-omnivore-anchor-idx="162"><code data-omnivore-anchor-idx="163" class="hljs language-css"><span data-omnivore-anchor-idx="164" class="hljs-selector-tag">desktop</span><span data-omnivore-anchor-idx="165" class="hljs-selector-class">.nix</span></code> — system configuration consistent across machines and containers.</li><li data-omnivore-anchor-idx="166"><code data-omnivore-anchor-idx="167" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="168" class="hljs-built_in">home</span>-host.nix</code> — home/dotfiles configuration consistent across machines, but not present in the containers.</li><li data-omnivore-anchor-idx="169"><code data-omnivore-anchor-idx="170" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="171" class="hljs-built_in">home</span>.nix</code> — home/dotfiles configuration consistent across machines and containers.</li><li data-omnivore-anchor-idx="172"><code data-omnivore-anchor-idx="173" class="hljs language-css language-mel"><span data-omnivore-anchor-idx="174" class="hljs-selector-tag">hardware-configuration</span><span data-omnivore-anchor-idx="175" class="hljs-selector-class">.nix</span></code> — manually crafted file to allow easy testing inside a virtual machine.</li></ul><p data-omnivore-anchor-idx="176">For reference, here is the initial configuration that we will work on:</p><p data-omnivore-anchor-idx="177"><code data-omnivore-anchor-idx="178" class="hljs language-css language-pgsql"><span data-omnivore-anchor-idx="179" class="hljs-selector-tag">configuration</span><span data-omnivore-anchor-idx="180" class="hljs-selector-class">.nix</span></code>:</p><div data-omnivore-anchor-idx="181"><pre data-omnivore-anchor-idx="182" tabindex="0"><code data-omnivore-anchor-idx="183" class="hljs language-pf language-nix">{ pkgs, ... }:

{
  imports = [
    ./hardware-configuration.nix
    ./desktop-host.nix
  ];

  networking.hostId = <span data-omnivore-anchor-idx="184" class="hljs-string">"12345678"</span>;
  networking.hostName = <span data-omnivore-anchor-idx="185" class="hljs-string">"isolationExample"</span>;

  system.<span data-omnivore-anchor-idx="186" class="hljs-keyword">state</span>Version = <span data-omnivore-anchor-idx="187" class="hljs-string">"21.05"</span>;
}
</code></pre></div><p data-omnivore-anchor-idx="188"><code data-omnivore-anchor-idx="189" class="hljs language-css"><span data-omnivore-anchor-idx="190" class="hljs-selector-tag">desktop-host</span><span data-omnivore-anchor-idx="191" class="hljs-selector-class">.nix</span></code>:</p><div data-omnivore-anchor-idx="192"><pre data-omnivore-anchor-idx="193" tabindex="0"><code data-omnivore-anchor-idx="194" class="hljs language-nix language-puppet">{ pkgs, ... }:

<span data-omnivore-anchor-idx="195" class="hljs-keyword">let</span>
  <span data-omnivore-anchor-idx="196" class="hljs-attr">home-manager</span> = <span data-omnivore-anchor-idx="197" class="hljs-built_in">builtins</span>.fetchGit {
    <span data-omnivore-anchor-idx="198" class="hljs-attr">url</span> = <span data-omnivore-anchor-idx="199" class="hljs-string">"https://github.com/rycee/home-manager.git"</span>;
    <span data-omnivore-anchor-idx="200" class="hljs-attr">ref</span> = <span data-omnivore-anchor-idx="201" class="hljs-string">"release-21.05"</span>;
    <span data-omnivore-anchor-idx="202" class="hljs-attr">rev</span> = <span data-omnivore-anchor-idx="203" class="hljs-string">"35a24648d155843a4d162de98c17b1afd5db51e4"</span>;
  };
<span data-omnivore-anchor-idx="204" class="hljs-keyword">in</span> {
  <span data-omnivore-anchor-idx="205" class="hljs-attr">imports</span> = [
    (<span data-omnivore-anchor-idx="206" class="hljs-built_in">import</span> <span data-omnivore-anchor-idx="207" class="hljs-string">"<span data-omnivore-anchor-idx="208" class="hljs-subst">${home-manager}</span>/nixos"</span>)
    ./desktop.nix
  ];

  <span data-omnivore-anchor-idx="209" class="hljs-attr">home-manager</span> = {
    <span data-omnivore-anchor-idx="210" class="hljs-attr">useGlobalPkgs</span> = <span data-omnivore-anchor-idx="211" class="hljs-literal">true</span>;
    users.<span data-omnivore-anchor-idx="212" class="hljs-attr">myuser</span> = {
      <span data-omnivore-anchor-idx="213" class="hljs-attr">imports</span> = [ ./home-host.nix ];
    };
  };
}
</code></pre></div><p data-omnivore-anchor-idx="214"><code data-omnivore-anchor-idx="215" class="hljs language-css"><span data-omnivore-anchor-idx="216" class="hljs-selector-tag">desktop</span><span data-omnivore-anchor-idx="217" class="hljs-selector-class">.nix</span></code>:</p><div data-omnivore-anchor-idx="218"><pre data-omnivore-anchor-idx="219" tabindex="0"><code data-omnivore-anchor-idx="220" class="hljs language-routeros language-nix">{ pkgs, <span data-omnivore-anchor-idx="221" class="hljs-built_in">..</span>. }:

{
  users.users.myuser = {
    uid = 1000;
    isNormalUser = <span data-omnivore-anchor-idx="222" class="hljs-literal">true</span>;
    initialPassword = <span data-omnivore-anchor-idx="223" class="hljs-string">"secret"</span>;
    extraGroups = [ <span data-omnivore-anchor-idx="224" class="hljs-string">"wheel"</span> ];
  };

  fonts.fonts = with pkgs; [
    dejavu_fonts  #<span data-omnivore-anchor-idx="225" class="hljs-built_in"> Default </span>font used by Alacritty.
  ];
}
</code></pre></div><p data-omnivore-anchor-idx="226"><code data-omnivore-anchor-idx="227" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="228" class="hljs-built_in">home</span>-host.nix</code>:</p><div data-omnivore-anchor-idx="229"><pre data-omnivore-anchor-idx="230" tabindex="0"><code data-omnivore-anchor-idx="231" class="hljs language-routeros language-nix">{ pkgs, <span data-omnivore-anchor-idx="232" class="hljs-built_in">..</span>. }:

{
  imports = [ ./home.nix ];

  # Example<span data-omnivore-anchor-idx="233" class="hljs-built_in"> user </span>configuration that should <span data-omnivore-anchor-idx="234" class="hljs-keyword">not</span> be present <span data-omnivore-anchor-idx="235" class="hljs-keyword">in</span> a container.
  programs.git = {
    <span data-omnivore-anchor-idx="236" class="hljs-builtin-name">enable</span> = <span data-omnivore-anchor-idx="237" class="hljs-literal">true</span>;
    userName = <span data-omnivore-anchor-idx="238" class="hljs-string">"My User"</span>;
  };

  programs.ssh = {
    <span data-omnivore-anchor-idx="239" class="hljs-builtin-name">enable</span> = <span data-omnivore-anchor-idx="240" class="hljs-literal">true</span>;

    matchBlocks = {
      hostThatShouldNotBeKnownByContainer = {
       <span data-omnivore-anchor-idx="241" class="hljs-built_in"> user </span>= <span data-omnivore-anchor-idx="242" class="hljs-string">"secret"</span>;
        hostname = <span data-omnivore-anchor-idx="243" class="hljs-string">"doNotExpose"</span>;
       <span data-omnivore-anchor-idx="244" class="hljs-built_in"> port </span>= 2020;
      };
    };
  };
}
</code></pre></div><p data-omnivore-anchor-idx="245"><code data-omnivore-anchor-idx="246" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="247" class="hljs-built_in">home</span>.nix</code>:</p><div data-omnivore-anchor-idx="248"><pre data-omnivore-anchor-idx="249" tabindex="0"><code data-omnivore-anchor-idx="250" class="hljs language-routeros language-nix">{ pkgs, <span data-omnivore-anchor-idx="251" class="hljs-built_in">..</span>. }:

{
  programs.bash.<span data-omnivore-anchor-idx="252" class="hljs-builtin-name">enable</span> = <span data-omnivore-anchor-idx="253" class="hljs-literal">true</span>;

  wayland.windowManager.sway = {
    <span data-omnivore-anchor-idx="254" class="hljs-builtin-name">enable</span> = <span data-omnivore-anchor-idx="255" class="hljs-literal">true</span>;
    wrapperFeatures.gtk = <span data-omnivore-anchor-idx="256" class="hljs-literal">true</span>;

   <span data-omnivore-anchor-idx="257" class="hljs-built_in"> config </span>= {
      # Use Alt/Meta instead of Super <span data-omnivore-anchor-idx="258" class="hljs-keyword">to</span> decrease the chance of conflict with host key mappings.
      modifier = <span data-omnivore-anchor-idx="259" class="hljs-string">"Mod1"</span>;

      # <span data-omnivore-anchor-idx="260" class="hljs-keyword">And</span> use terminal with some sane defaults.
      terminal = <span data-omnivore-anchor-idx="261" class="hljs-string">"alacritty"</span>;
    };
  };

  home.packages = with pkgs; [
    alacritty
  ];

  gtk.<span data-omnivore-anchor-idx="262" class="hljs-builtin-name">enable</span> = <span data-omnivore-anchor-idx="263" class="hljs-literal">true</span>;
}
</code></pre></div><p data-omnivore-anchor-idx="264"><code data-omnivore-anchor-idx="265" class="hljs language-css language-mel"><span data-omnivore-anchor-idx="266" class="hljs-selector-tag">hardware-configuration</span><span data-omnivore-anchor-idx="267" class="hljs-selector-class">.nix</span></code>:</p><div data-omnivore-anchor-idx="268"><pre data-omnivore-anchor-idx="269" tabindex="0"><code data-omnivore-anchor-idx="270" class="hljs language-nix language-verilog">{ pkgs, ... }:

{
  <span data-omnivore-anchor-idx="271" class="hljs-comment"># In actual configuration, use file generated by nixos-generate-config.</span>
  <span data-omnivore-anchor-idx="272" class="hljs-attr">virtualisation</span> = {
    <span data-omnivore-anchor-idx="273" class="hljs-attr">writableStoreUseTmpfs</span> = <span data-omnivore-anchor-idx="274" class="hljs-literal">false</span>;

    <span data-omnivore-anchor-idx="275" class="hljs-attr">memorySize</span> = <span data-omnivore-anchor-idx="276" class="hljs-string">"2g"</span>;
    <span data-omnivore-anchor-idx="277" class="hljs-attr">qemu</span> = {
      <span data-omnivore-anchor-idx="278" class="hljs-attr">options</span> = [
        <span data-omnivore-anchor-idx="279" class="hljs-string">"-vga virtio"</span>
        <span data-omnivore-anchor-idx="280" class="hljs-string">"-display gtk,gl=on"</span>
      ];
    };
  };

  hardware.<span data-omnivore-anchor-idx="281" class="hljs-attr">opengl</span> = {
    <span data-omnivore-anchor-idx="282" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="283" class="hljs-literal">true</span>;
  };
}
</code></pre></div><p data-omnivore-anchor-idx="284">To test this configuration, you can run:</p><div data-omnivore-anchor-idx="285"><pre data-omnivore-anchor-idx="286" tabindex="0"><code data-omnivore-anchor-idx="287" class="hljs language-applescript language-dockerfile"><span data-omnivore-anchor-idx="288" class="hljs-comment"># Build VM:</span>
nixos-rebuild -I nixos-config=./configuration.nix build-vm
<span data-omnivore-anchor-idx="289" class="hljs-comment"># Run VM:</span>
./<span data-omnivore-anchor-idx="290" class="hljs-literal">result</span>/bin/<span data-omnivore-anchor-idx="291" class="hljs-built_in">run</span>-isolationExample-vm
</code></pre></div><p data-omnivore-anchor-idx="292">This command will create a <code data-omnivore-anchor-idx="293" class="hljs language-applescript language-ebnf"><span data-omnivore-anchor-idx="294" class="hljs-literal">result</span></code> symlink with a configured virtual machine.
After invoking the second command, a QEMU window will appear, and the VM will boot.
You can log in as <code data-omnivore-anchor-idx="295" class="hljs language-ebnf"><span data-omnivore-anchor-idx="296" class="hljs-attribute">myuser</span></code> with a password <code data-omnivore-anchor-idx="297" class="hljs language-ebnf"><span data-omnivore-anchor-idx="298" class="hljs-attribute">secret</span></code>.
After that, try starting <a data-omnivore-anchor-idx="299" href="https://swaywm.org/">Sway</a> window manager by running <code data-omnivore-anchor-idx="300" class="hljs language-bash language-ebnf"><span data-omnivore-anchor-idx="301" class="hljs-built_in">exec</span> sway</code>.
You should see an empty grey screen with a status bar at the bottom.
After that, start the terminal by pressing <code data-omnivore-anchor-idx="302" class="hljs language-mathematica language-x86asm">Mod1+<span data-omnivore-anchor-idx="303" class="hljs-keyword">Enter</span></code> / <code data-omnivore-anchor-idx="304" class="hljs language-mathematica language-x86asm">Alt+<span data-omnivore-anchor-idx="305" class="hljs-keyword">Enter</span></code> and shut down the machine with <code data-omnivore-anchor-idx="306" class="hljs language-ebnf"><span data-omnivore-anchor-idx="307" class="hljs-attribute">poweroff</span></code>.</p><p data-omnivore-anchor-idx="308">I must admit that I have encountered a bug with the mouse cursor inside QEMU.
It was upside-down and had a vertical offset, so clicking was a bit harder.
I’m not sure if it is specific to my machine, so you may or may not encounter such behavior.
Either way: don’t worry. It won’t prevent us from testing container isolation. :-)</p><h3 data-omnivore-anchor-idx="309" id="running-cli-applications-inside-the-container">Running CLI applications inside the container <a data-omnivore-anchor-idx="310" href="#running-cli-applications-inside-the-container">🔗</a></h3><p data-omnivore-anchor-idx="311">Let’s start with the simplest scenario: running a simple console application inside the container.
In the example, I will use <code data-omnivore-anchor-idx="312" class="hljs language-ebnf language-vim"><span data-omnivore-anchor-idx="313" class="hljs-attribute">vim</span></code> because it allows editing files, so filesystem isolation can be easily verified.</p><p data-omnivore-anchor-idx="314">All necessary changes have to be made inside <code data-omnivore-anchor-idx="315" class="hljs language-css"><span data-omnivore-anchor-idx="316" class="hljs-selector-tag">desktop-host</span><span data-omnivore-anchor-idx="317" class="hljs-selector-class">.nix</span></code>.
The crucial part is:</p><div data-omnivore-anchor-idx="318"><pre data-omnivore-anchor-idx="319" tabindex="0"><code data-omnivore-anchor-idx="320" class="hljs language-routeros language-nix">{ pkgs, lib, <span data-omnivore-anchor-idx="321" class="hljs-built_in">..</span>. }:

{
  # <span data-omnivore-anchor-idx="322" class="hljs-built_in">..</span>.
  
  # (1)
  containers.cliExample = let
    userName = <span data-omnivore-anchor-idx="323" class="hljs-string">"myuser"</span>;
  <span data-omnivore-anchor-idx="324" class="hljs-keyword">in</span> {
   <span data-omnivore-anchor-idx="325" class="hljs-built_in"> config </span>= {
      # (2)
      imports = [
        (import <span data-omnivore-anchor-idx="326" class="hljs-string">"<span data-omnivore-anchor-idx="327" class="hljs-variable">${home-manager}</span>/nixos"</span>)
        ./desktop.nix
      ];

      # (3)
      home-manager = {
        useGlobalPkgs = <span data-omnivore-anchor-idx="328" class="hljs-literal">true</span>;
        users.myuser = {
          imports = [ ./home.nix ];
        };
      };
      
      # (4)
      users.users.<span data-omnivore-anchor-idx="329" class="hljs-string">"<span data-omnivore-anchor-idx="330" class="hljs-variable">${userName}</span>"</span>.extraGroups = lib.mkForce [];

      # (5)
      systemd.services.fix-nix-dirs = let
        profileDir = <span data-omnivore-anchor-idx="331" class="hljs-string">"/nix/var/nix/profiles/per-user/<span data-omnivore-anchor-idx="332" class="hljs-variable">${userName}</span>"</span>;
        gcrootsDir = <span data-omnivore-anchor-idx="333" class="hljs-string">"/nix/var/nix/gcroots/per-user/<span data-omnivore-anchor-idx="334" class="hljs-variable">${userName}</span>"</span>;
      <span data-omnivore-anchor-idx="335" class="hljs-keyword">in</span> {
       <span data-omnivore-anchor-idx="336" class="hljs-built_in"> script </span>= <span data-omnivore-anchor-idx="337" class="hljs-string">''</span>
          #!<span data-omnivore-anchor-idx="338" class="hljs-variable">${pkgs.stdenv.shell}</span>
          <span data-omnivore-anchor-idx="339" class="hljs-builtin-name">set</span> -euo pipefail

          mkdir -p <span data-omnivore-anchor-idx="340" class="hljs-variable">${profileDir}</span> <span data-omnivore-anchor-idx="341" class="hljs-variable">${gcrootsDir}</span>
          chown <span data-omnivore-anchor-idx="342" class="hljs-variable">${userName}</span>:root <span data-omnivore-anchor-idx="343" class="hljs-variable">${profileDir}</span> <span data-omnivore-anchor-idx="344" class="hljs-variable">${gcrootsDir}</span>
        <span data-omnivore-anchor-idx="345" class="hljs-string">''</span>;
        wantedBy = [ <span data-omnivore-anchor-idx="346" class="hljs-string">"multi-user.target"</span> ];
        serviceConfig = {
         <span data-omnivore-anchor-idx="347" class="hljs-built_in"> Type </span>= <span data-omnivore-anchor-idx="348" class="hljs-string">"oneshot"</span>;
        };
      };
      
      # (6)
      environment.systemPackages = with pkgs; [ vim ];
    };
  };
}
</code></pre></div><p data-omnivore-anchor-idx="349">That’s a rather large chunk of code so let’s describe what each part does:</p><ul data-omnivore-anchor-idx="350"><li data-omnivore-anchor-idx="351">(1) Declare container <code data-omnivore-anchor-idx="352" class="hljs language-ebnf"><span data-omnivore-anchor-idx="353" class="hljs-attribute">cliExample</span></code>. No magic here at this point.</li><li data-omnivore-anchor-idx="354">(2) Replicate shared desktop configuration by importing <code data-omnivore-anchor-idx="355" class="hljs language-css"><span data-omnivore-anchor-idx="356" class="hljs-selector-tag">desktop</span><span data-omnivore-anchor-idx="357" class="hljs-selector-class">.nix</span></code>. Also, import the Home Manager to enable its use inside the container.</li><li data-omnivore-anchor-idx="358">(3) Replicate shared home configuration by importing <code data-omnivore-anchor-idx="359" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="360" class="hljs-built_in">home</span>.nix</code> as Home Manager configuration. Again, <code data-omnivore-anchor-idx="361" class="hljs language-ebnf"><span data-omnivore-anchor-idx="362" class="hljs-attribute">useGlobalPkgs</span></code> is specified to use the same packages as the host.</li><li data-omnivore-anchor-idx="363">(4) Disable extra groups for the user. I do not want user inside the container to have access to the <code data-omnivore-anchor-idx="364" class="hljs language-ebnf"><span data-omnivore-anchor-idx="365" class="hljs-attribute">wheel</span></code> group. Even more: I am yet to find a use-case where I need access to any specific group inside the container!</li><li data-omnivore-anchor-idx="366">(5) Unfortunately, Home Manager did not work inside the container due to missing <code data-omnivore-anchor-idx="367" class="hljs language-ebnf"><span data-omnivore-anchor-idx="368" class="hljs-attribute">profiles</span></code> and <code data-omnivore-anchor-idx="369" class="hljs language-ebnf"><span data-omnivore-anchor-idx="370" class="hljs-attribute">gcroots</span></code> directories for the user. These are not created on container startup (in the host’s nix store, you will find <code data-omnivore-anchor-idx="371" class="hljs language-axapta language-ebnf">per-<span data-omnivore-anchor-idx="372" class="hljs-keyword">container</span></code> directories, which are then mounted inside containers). This systemd unit solves the issue by creating them. It could be improved by specifying Home Manager’s systemd unit in <code data-omnivore-anchor-idx="373" class="hljs language-ebnf"><span data-omnivore-anchor-idx="374" class="hljs-attribute">wantedBy</span></code>, but depending on <code data-omnivore-anchor-idx="375" class="hljs language-aspectj language-cmake">multi-user.<span data-omnivore-anchor-idx="376" class="hljs-keyword">target</span></code> was more straightforward, and I haven’t run into race condition yet.</li><li data-omnivore-anchor-idx="377">(6) Customization to the container configuration, i.e., installing vim. :)</li></ul><p data-omnivore-anchor-idx="378">After rebuilding the virtual machine, we can log into it and try the following commands:</p><div data-omnivore-anchor-idx="379"><pre data-omnivore-anchor-idx="380" tabindex="0"><code data-omnivore-anchor-idx="381" class="hljs language-nginx language-coffeescript"><span data-omnivore-anchor-idx="382" class="hljs-comment"># Start the container:</span>
<span data-omnivore-anchor-idx="383" class="hljs-attribute">systemctl</span> start container<span data-omnivore-anchor-idx="384" class="hljs-variable">@cliExample</span>.service
<span data-omnivore-anchor-idx="385" class="hljs-comment"># Enter shell inside container:</span>
machinectl shell myuser<span data-omnivore-anchor-idx="386" class="hljs-variable">@cliExample</span>
</code></pre></div><p data-omnivore-anchor-idx="387">(If you run these commands as a regular user instead of root, you will be asked for the user password due to polkit authentication.)</p><p data-omnivore-anchor-idx="388">The first thing you may notice inside the container is a change in the shell prompt.
Hostname has changed from <code data-omnivore-anchor-idx="389" class="hljs language-ebnf"><span data-omnivore-anchor-idx="390" class="hljs-attribute">isolationExample</span></code> to <code data-omnivore-anchor-idx="391" class="hljs language-ebnf"><span data-omnivore-anchor-idx="392" class="hljs-attribute">cliExample</span></code> — this clearly indicates that we are inside the container.</p><p data-omnivore-anchor-idx="393">The second thing you will notice when you try to run <code data-omnivore-anchor-idx="394" class="hljs language-ebnf language-vim"><span data-omnivore-anchor-idx="395" class="hljs-attribute">vim</span></code>: it works perfectly inside the container and is missing on the host.
This means that configuration for the container is, in fact, different from the host’s configuration.
Another difference is the <code data-omnivore-anchor-idx="396" class="hljs language-arcade language-arduino">~<span data-omnivore-anchor-idx="397" class="hljs-regexp">/.ssh/</span>config</code> file that is present on the host (because its configuration is in <code data-omnivore-anchor-idx="398" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="399" class="hljs-built_in">home</span>-host.nix</code>) and is missing in the container.
Exactly as planned!
However, if we look into, for example, <code data-omnivore-anchor-idx="400" class="hljs language-arduino language-lua">~/.<span data-omnivore-anchor-idx="401" class="hljs-built_in">config</span>/sway/<span data-omnivore-anchor-idx="402" class="hljs-built_in">config</span></code>, we will see that its contents are exactly the same on the host and inside the container.
This proves that we can specify if a configuration is shared or specific to the host/container.</p><p data-omnivore-anchor-idx="403">Remember that even though the ssh config is not directly visible in the container, the file can still be accessed by the container.
<strong data-omnivore-anchor-idx="404">Host and container share the same Nix store!</strong>
This is a strong reason not to store any real secrets inside the Nix store.
You can test it by invoking <code data-omnivore-anchor-idx="405" class="hljs language-arcade language-arduino">realpath ~<span data-omnivore-anchor-idx="406" class="hljs-regexp">/.ssh/</span>config</code> on the host and passing the result as an argument to the <code data-omnivore-anchor-idx="407" class="hljs language-ebnf language-matlab"><span data-omnivore-anchor-idx="408" class="hljs-attribute">cat</span></code> inside the container.</p><p data-omnivore-anchor-idx="409">The third test is similar to the second and can be performed by simple <code data-omnivore-anchor-idx="410" class="hljs language-cmake language-stata">vim ~/<span data-omnivore-anchor-idx="411" class="hljs-keyword">test</span>-<span data-omnivore-anchor-idx="412" class="hljs-keyword">file</span></code> inside the container.
(If you don’t like <code data-omnivore-anchor-idx="413" class="hljs language-ebnf language-vim"><span data-omnivore-anchor-idx="414" class="hljs-attribute">vim</span></code>, you can use <code data-omnivore-anchor-idx="415" class="hljs language-stata language-cmake"><span data-omnivore-anchor-idx="416" class="hljs-keyword">cat</span> <span data-omnivore-anchor-idx="417" class="hljs-string">"test"</span> &gt; ~/<span data-omnivore-anchor-idx="418" class="hljs-keyword">test</span>-<span data-omnivore-anchor-idx="419" class="hljs-keyword">file</span></code>.)
The file will be visible only from the container’s shell.
This gives us hope that container cannot (easily) manipulate the host’s filesystem.</p><h3 data-omnivore-anchor-idx="420" id="extending-the-configuration-to-graphical-applications">Extending the configuration to graphical applications <a data-omnivore-anchor-idx="421" href="#extending-the-configuration-to-graphical-applications">🔗</a></h3><p data-omnivore-anchor-idx="422">The primary goal was to run a graphical application inside an environment isolated from the host system but share some configuration parts.
Apparently, it is straightforward to achieve.
Again, let’s see changes in the <code data-omnivore-anchor-idx="423" class="hljs language-css"><span data-omnivore-anchor-idx="424" class="hljs-selector-tag">desktop-host</span><span data-omnivore-anchor-idx="425" class="hljs-selector-class">.nix</span></code>:</p><div data-omnivore-anchor-idx="426"><pre data-omnivore-anchor-idx="427" tabindex="0"><code data-omnivore-anchor-idx="428" class="hljs language-nix language-routeros">{ config, pkgs, lib, ... }:

{
  <span data-omnivore-anchor-idx="429" class="hljs-comment"># ...</span>
  containers.<span data-omnivore-anchor-idx="430" class="hljs-attr">graphicalExample</span> = <span data-omnivore-anchor-idx="431" class="hljs-keyword">let</span>
    <span data-omnivore-anchor-idx="432" class="hljs-attr">hostCfg</span> = config;
    <span data-omnivore-anchor-idx="433" class="hljs-attr">userName</span> = <span data-omnivore-anchor-idx="434" class="hljs-string">"myuser"</span>;
    <span data-omnivore-anchor-idx="435" class="hljs-attr">userUid</span> = hostCfg.users.users.<span data-omnivore-anchor-idx="436" class="hljs-string">"<span data-omnivore-anchor-idx="437" class="hljs-subst">${userName}</span>"</span>.uid;
  <span data-omnivore-anchor-idx="438" class="hljs-keyword">in</span> {
    <span data-omnivore-anchor-idx="439" class="hljs-comment"># (1)</span>
    <span data-omnivore-anchor-idx="440" class="hljs-attr">bindMounts</span> = {
      <span data-omnivore-anchor-idx="441" class="hljs-attr">waylandDisplay</span> = <span data-omnivore-anchor-idx="442" class="hljs-keyword">rec</span> {
        <span data-omnivore-anchor-idx="443" class="hljs-attr">hostPath</span> = <span data-omnivore-anchor-idx="444" class="hljs-string">"/run/user/<span data-omnivore-anchor-idx="445" class="hljs-subst">${<span data-omnivore-anchor-idx="446" class="hljs-built_in">toString</span> userUid}</span>"</span>;
        <span data-omnivore-anchor-idx="447" class="hljs-attr">mountPoint</span> = hostPath;
      };
      <span data-omnivore-anchor-idx="448" class="hljs-attr">x11Display</span> = <span data-omnivore-anchor-idx="449" class="hljs-keyword">rec</span> {
        <span data-omnivore-anchor-idx="450" class="hljs-attr">hostPath</span> = <span data-omnivore-anchor-idx="451" class="hljs-string">"/tmp/.X11-unix"</span>;
        <span data-omnivore-anchor-idx="452" class="hljs-attr">mountPoint</span> = hostPath;
        <span data-omnivore-anchor-idx="453" class="hljs-attr">isReadOnly</span> = <span data-omnivore-anchor-idx="454" class="hljs-literal">true</span>;
      };
    };

    <span data-omnivore-anchor-idx="455" class="hljs-attr">config</span> = {
      <span data-omnivore-anchor-idx="456" class="hljs-comment"># ...</span>
      
      <span data-omnivore-anchor-idx="457" class="hljs-comment"># (2)</span>
      hardware.<span data-omnivore-anchor-idx="458" class="hljs-attr">opengl</span> = {
        <span data-omnivore-anchor-idx="459" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="460" class="hljs-literal">true</span>;
        <span data-omnivore-anchor-idx="461" class="hljs-attr">extraPackages</span> = hostCfg.hardware.opengl.extraPackages;
      };

      <span data-omnivore-anchor-idx="462" class="hljs-comment"># (3)</span>
      environment.<span data-omnivore-anchor-idx="463" class="hljs-attr">systemPackages</span> = <span data-omnivore-anchor-idx="464" class="hljs-keyword">with</span> pkgs; [
        vim
        jetbrains.idea-community
      ];

      <span data-omnivore-anchor-idx="465" class="hljs-attr">home-manager</span> = {
        <span data-omnivore-anchor-idx="466" class="hljs-attr">useGlobalPkgs</span> = <span data-omnivore-anchor-idx="467" class="hljs-literal">true</span>;
        users.<span data-omnivore-anchor-idx="468" class="hljs-attr">myuser</span> = {
          <span data-omnivore-anchor-idx="469" class="hljs-attr">imports</span> = [ ./home.nix ];

          <span data-omnivore-anchor-idx="470" class="hljs-comment"># (4)</span>
          home.<span data-omnivore-anchor-idx="471" class="hljs-attr">sessionVariables</span> = {
            <span data-omnivore-anchor-idx="472" class="hljs-attr">WAYLAND_DISPLAY</span>                     = <span data-omnivore-anchor-idx="473" class="hljs-string">"wayland-1"</span>;
            <span data-omnivore-anchor-idx="474" class="hljs-attr">QT_QPA_PLATFORM</span>                     = <span data-omnivore-anchor-idx="475" class="hljs-string">"wayland"</span>;
            <span data-omnivore-anchor-idx="476" class="hljs-attr">QT_WAYLAND_DISABLE_WINDOWDECORATION</span> = <span data-omnivore-anchor-idx="477" class="hljs-string">"1"</span>;
            <span data-omnivore-anchor-idx="478" class="hljs-attr">SDL_VIDEODRIVER</span>                     = <span data-omnivore-anchor-idx="479" class="hljs-string">"wayland"</span>;
            <span data-omnivore-anchor-idx="480" class="hljs-attr">CLUTTER_BACKEND</span>                     = <span data-omnivore-anchor-idx="481" class="hljs-string">"wayland"</span>;
            <span data-omnivore-anchor-idx="482" class="hljs-attr">MOZ_ENABLE_WAYLAND</span>                  = <span data-omnivore-anchor-idx="483" class="hljs-string">"1"</span>;
            <span data-omnivore-anchor-idx="484" class="hljs-attr">_JAVA_AWT_WM_NONREPARENTING</span>         = <span data-omnivore-anchor-idx="485" class="hljs-string">"1"</span>;
            <span data-omnivore-anchor-idx="486" class="hljs-attr">_JAVA_OPTIONS</span>                       = <span data-omnivore-anchor-idx="487" class="hljs-string">"-Dawt.useSystemAAFontSettings=lcd"</span>;
            <span data-omnivore-anchor-idx="488" class="hljs-attr">XDG_RUNTIME_DIR</span>                     = <span data-omnivore-anchor-idx="489" class="hljs-string">"/run/user/<span data-omnivore-anchor-idx="490" class="hljs-subst">${<span data-omnivore-anchor-idx="491" class="hljs-built_in">toString</span> userUid}</span>"</span>;
            <span data-omnivore-anchor-idx="492" class="hljs-attr">DISPLAY</span>                             = <span data-omnivore-anchor-idx="493" class="hljs-string">":0"</span>;
          };
        };
      };
    };
  };
}
</code></pre></div><p data-omnivore-anchor-idx="494">First (1), we specify bind mounts from host to container.
In this case, we are mounting the Wayland socket and X11 socket.
If you have researched application sandboxing on Linux before, you will immediately notice the caveat of this approach: binding the X11 socket.
It effectively gives access to any application running under X11 both on the host and other containers.
Running Wayland compositor on host gives a lot in terms of isolation here.
Also, if you are sure that you won’t be running any X11 applications inside the container, you may skip mounting the X11 socket.</p><p data-omnivore-anchor-idx="495">Another issue is bind mounting Wayland socket directly.
It is not as bad as X11, but some proxy compositor (like <a data-omnivore-anchor-idx="496" href="https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/sommelier/">Sommelier</a>) would be preferable.</p><p data-omnivore-anchor-idx="497">To properly support graphics, we also need OpenGL support (3).
We are enabling it and copying <code data-omnivore-anchor-idx="498" class="hljs language-ebnf"><span data-omnivore-anchor-idx="499" class="hljs-attribute">extraPackages</span></code> from the host configuration.
This will ensure that we have all the necessary libraries inside the container.</p><p data-omnivore-anchor-idx="500">Next (3), we’re adding new packages to the <code data-omnivore-anchor-idx="501" class="hljs language-ebnf"><span data-omnivore-anchor-idx="502" class="hljs-attribute">systemPackages</span></code> list.
As I mentioned earlier, my favorite IDE is IntelliJ Idea, so I used the community edition as an example.
In addition, Alacritty is provided inside the container from <code data-omnivore-anchor-idx="503" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="504" class="hljs-built_in">home</span>.nix</code>, so we have both X11 (Idea) and Wayland (Alacritty) applications available.</p><p data-omnivore-anchor-idx="505">Last (4), there is environment variables configuration.
Most of them are needed for proper Wayland handling (especially <code data-omnivore-anchor-idx="506" class="hljs language-undefined">WAYLAND_DISPLAY</code>) and X11 (<code data-omnivore-anchor-idx="507" class="hljs language-ebnf language-gams"><span data-omnivore-anchor-idx="508" class="hljs-attribute">DISPLAY</span></code>).
<code data-omnivore-anchor-idx="509" class="hljs language-autohotkey language-sqf">_JAV<span data-omnivore-anchor-idx="510" class="hljs-built_in">A_AWT</span>_WM_NONREPARENTING</code> is needed for IntelliJ to work under Sway.</p><p data-omnivore-anchor-idx="511">Now it’s time to try this new thing!
Accessing shell inside the container will be a bit different now:</p><div data-omnivore-anchor-idx="512"><pre data-omnivore-anchor-idx="513" tabindex="0"><code data-omnivore-anchor-idx="514" class="hljs language-sql language-livecodeserver"><span data-omnivore-anchor-idx="515" class="hljs-comment"># Start the container:</span>
systemctl <span data-omnivore-anchor-idx="516" class="hljs-keyword">start</span> <span data-omnivore-anchor-idx="517" class="hljs-keyword">container</span>@graphicalExample.service
<span data-omnivore-anchor-idx="518" class="hljs-comment"># Enter shell inside container:</span>
machinectl shell myuser@graphicalExample /usr/<span data-omnivore-anchor-idx="519" class="hljs-keyword">bin</span>/env bash <span data-omnivore-anchor-idx="520" class="hljs-comment">--login</span>
</code></pre></div><p data-omnivore-anchor-idx="521">You can see that the login shell is forced here.
This is necessary for Home Manager’s <code data-omnivore-anchor-idx="522" class="hljs language-ebnf"><span data-omnivore-anchor-idx="523" class="hljs-attribute">sessionVariables</span></code> configuration to be applied.
Inside the container, you can try running both <code data-omnivore-anchor-idx="524" class="hljs language-ebnf"><span data-omnivore-anchor-idx="525" class="hljs-attribute">alacritty</span></code> and <code data-omnivore-anchor-idx="526" class="hljs language-ebnf"><span data-omnivore-anchor-idx="527" class="hljs-attribute">idea-community</span></code>.
Each of them should work as expected, which means we have all basics covered. ;-)</p><h4 data-omnivore-anchor-idx="528" id="the-xdg_runtime_dirs-permission">The <code data-omnivore-anchor-idx="529" class="hljs language-undefined">XDG_RUNTIME_DIR</code>’s permission <a data-omnivore-anchor-idx="530" href="#the-xdg_runtime_dirs-permission">🔗</a></h4><p data-omnivore-anchor-idx="531">An unfortunate consequence of bind mounting directories to the <code data-omnivore-anchor-idx="532" class="hljs language-dockerfile language-nsis">/<span data-omnivore-anchor-idx="533" class="hljs-keyword">run</span><span data-omnivore-anchor-idx="534" class="bash">/user/<span data-omnivore-anchor-idx="535" class="hljs-variable">${userUid}</span></span></code> is the forced creation of this directory during container initialization.
In normal circumstances, this is handled by the systemd upon user login.
However, our use-case container runtime (<code data-omnivore-anchor-idx="536" class="hljs language-ebnf"><span data-omnivore-anchor-idx="537" class="hljs-attribute">systemd-nspawn</span></code> is container runtime behind the NixOS containers) has to create it to mount sockets.
There are two possible ways to solve this:</p><ul data-omnivore-anchor-idx="538"><li data-omnivore-anchor-idx="539">Fix permissions manually during the container’s startup.</li><li data-omnivore-anchor-idx="540">Mount sockets after the container’s creation. <code data-omnivore-anchor-idx="541" class="hljs language-ebnf"><span data-omnivore-anchor-idx="542" class="hljs-attribute">systemd-nspawn</span></code> provides such functionality.</li></ul><p data-omnivore-anchor-idx="543">In my opinion, the first option is more straightforward, so I will show it here.
All we have to do is create an additional systemd unit that will change the permissions of this directory.
The code looks like this:</p><div data-omnivore-anchor-idx="544"><pre data-omnivore-anchor-idx="545" tabindex="0"><code data-omnivore-anchor-idx="546" class="hljs language-routeros language-nix">{ config, pkgs, lib, <span data-omnivore-anchor-idx="547" class="hljs-built_in">..</span>. }:

<span data-omnivore-anchor-idx="548" class="hljs-comment"># ...</span>

{
  # <span data-omnivore-anchor-idx="549" class="hljs-built_in">..</span>.

  containers.graphicalExample = let
    hostCfg =<span data-omnivore-anchor-idx="550" class="hljs-built_in"> config;
</span>    userName = <span data-omnivore-anchor-idx="551" class="hljs-string">"myuser"</span>;
    userUid = hostCfg.users.users.<span data-omnivore-anchor-idx="552" class="hljs-string">"<span data-omnivore-anchor-idx="553" class="hljs-variable">${userName}</span>"</span>.uid;
  <span data-omnivore-anchor-idx="554" class="hljs-keyword">in</span> {
    # <span data-omnivore-anchor-idx="555" class="hljs-built_in">..</span>.

   <span data-omnivore-anchor-idx="556" class="hljs-built_in"> config </span>= {
      # <span data-omnivore-anchor-idx="557" class="hljs-built_in">..</span>.
      
      systemd.services.fix-run-permission = {
       <span data-omnivore-anchor-idx="558" class="hljs-built_in"> script </span>= <span data-omnivore-anchor-idx="559" class="hljs-string">''</span>
          #!<span data-omnivore-anchor-idx="560" class="hljs-variable">${pkgs.stdenv.shell}</span>
          <span data-omnivore-anchor-idx="561" class="hljs-builtin-name">set</span> -euo pipefail

          chown <span data-omnivore-anchor-idx="562" class="hljs-variable">${userName}</span>:users /run/user/<span data-omnivore-anchor-idx="563" class="hljs-variable">${toString userUid}</span>
          chmod <span data-omnivore-anchor-idx="564" class="hljs-attribute">u</span>=rwx /run/user/<span data-omnivore-anchor-idx="565" class="hljs-variable">${toString userUid}</span>
        <span data-omnivore-anchor-idx="566" class="hljs-string">''</span>;
        wantedBy = [ <span data-omnivore-anchor-idx="567" class="hljs-string">"multi-user.target"</span> ];
        serviceConfig = {
         <span data-omnivore-anchor-idx="568" class="hljs-built_in"> Type </span>= <span data-omnivore-anchor-idx="569" class="hljs-string">"oneshot"</span>;
        };
      };
    };
  };
}
</code></pre></div><h4 data-omnivore-anchor-idx="570" id="gpu-acceleration">GPU acceleration <a data-omnivore-anchor-idx="571" href="#gpu-acceleration">🔗</a></h4><p data-omnivore-anchor-idx="572">In the configuration’s current state, we can run graphical applications.
However, you can notice that there is no hardware acceleration inside the container!
When we look into the output of <code data-omnivore-anchor-idx="573" class="hljs language-ebnf"><span data-omnivore-anchor-idx="574" class="hljs-attribute">glxinfo</span></code> (I’ve created a separate container for this purpose with the <code data-omnivore-anchor-idx="575" class="hljs language-ebnf"><span data-omnivore-anchor-idx="576" class="hljs-attribute">glxinfo</span></code> installed), we see the following result:</p><div data-omnivore-anchor-idx="577"><pre data-omnivore-anchor-idx="578" tabindex="0"><code data-omnivore-anchor-idx="579" class="hljs language-yaml language-angelscript"><span data-omnivore-anchor-idx="580" class="hljs-string">...</span>
<span data-omnivore-anchor-idx="581" class="hljs-string">Extended</span> <span data-omnivore-anchor-idx="582" class="hljs-string">renderer</span> <span data-omnivore-anchor-idx="583" class="hljs-string">info</span> <span data-omnivore-anchor-idx="584" class="hljs-string">(GLX_MESA_query_renderer):</span>
    <span data-omnivore-anchor-idx="585" class="hljs-attr">Vendor:</span> <span data-omnivore-anchor-idx="586" class="hljs-string">Mesa/X.org</span> <span data-omnivore-anchor-idx="587" class="hljs-string">(0xffffffff)</span>
    <span data-omnivore-anchor-idx="588" class="hljs-attr">Device:</span> <span data-omnivore-anchor-idx="589" class="hljs-string">llvmpipe</span> <span data-omnivore-anchor-idx="590" class="hljs-string">(LLVM</span> <span data-omnivore-anchor-idx="591" class="hljs-number">11.1</span><span data-omnivore-anchor-idx="592" class="hljs-number">.0</span><span data-omnivore-anchor-idx="593" class="hljs-string">,</span> <span data-omnivore-anchor-idx="594" class="hljs-number">256</span> <span data-omnivore-anchor-idx="595" class="hljs-string">bits)</span> <span data-omnivore-anchor-idx="596" class="hljs-string">(0xffffffff)</span>
    <span data-omnivore-anchor-idx="597" class="hljs-attr">Version:</span> <span data-omnivore-anchor-idx="598" class="hljs-number">21.1</span><span data-omnivore-anchor-idx="599" class="hljs-number">.4</span>
    <span data-omnivore-anchor-idx="600" class="hljs-attr">Accelerated:</span> <span data-omnivore-anchor-idx="601" class="hljs-literal">no</span>
<span data-omnivore-anchor-idx="602" class="hljs-string">...</span>
</code></pre></div><p data-omnivore-anchor-idx="603">It tells us that the <a data-omnivore-anchor-idx="604" href="https://docs.mesa3d.org/drivers/llvmpipe.html">llvmpipe</a> driver is in use.
The llvmpipe driver is a software rasterizer.
To get hardware acceleration, we need to share <a data-omnivore-anchor-idx="605" href="https://en.wikipedia.org/wiki/Direct_Rendering_Infrastructure">DRI</a> devices.
These are living under <code data-omnivore-anchor-idx="606" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="607" class="hljs-regexp">/dev/</span>dri</code> directory.</p><p data-omnivore-anchor-idx="608"><strong data-omnivore-anchor-idx="609">Sharing DRI devices to the container opens a new attack area. I haven’t researched this, but I don’t see how we could stop the container from reading screen buffer if it has access to the GPU. Thus, I would be against sharing <code data-omnivore-anchor-idx="610" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="611" class="hljs-regexp">/dev/</span>dri</code> in the general case.</strong></p><p data-omnivore-anchor-idx="612">If you are still interested, here is code that will share <code data-omnivore-anchor-idx="613" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="614" class="hljs-regexp">/dev/</span>dri</code> to the container:</p><div data-omnivore-anchor-idx="615"><pre data-omnivore-anchor-idx="616" tabindex="0"><code data-omnivore-anchor-idx="617" class="hljs language-crystal language-nix">{ config, pkgs, <span data-omnivore-anchor-idx="618" class="hljs-class"><span data-omnivore-anchor-idx="619" class="hljs-keyword">lib</span>, ... }:</span>

{
  <span data-omnivore-anchor-idx="620" class="hljs-comment"># ...</span>
  containers.graphicalExample = let
    <span data-omnivore-anchor-idx="621" class="hljs-comment"># ...</span>
  in {
    bindMounts = {
      dri = rec {
        hostPath = <span data-omnivore-anchor-idx="622" class="hljs-string">"/dev/dri"</span>;
        mountPoint = hostPath;
      };
    };
    
    <span data-omnivore-anchor-idx="623" class="hljs-comment"># ...</span>
  };
}
</code></pre></div><p data-omnivore-anchor-idx="624">After binding the DRI device to the container, you will see output from the <code data-omnivore-anchor-idx="625" class="hljs language-ebnf"><span data-omnivore-anchor-idx="626" class="hljs-attribute">glxinfo</span></code>, which will look like this:</p><div data-omnivore-anchor-idx="627"><pre data-omnivore-anchor-idx="628" tabindex="0"><code data-omnivore-anchor-idx="629" class="hljs language-yaml language-angelscript"><span data-omnivore-anchor-idx="630" class="hljs-string">...</span>
<span data-omnivore-anchor-idx="631" class="hljs-string">Extended</span> <span data-omnivore-anchor-idx="632" class="hljs-string">renderer</span> <span data-omnivore-anchor-idx="633" class="hljs-string">info</span> <span data-omnivore-anchor-idx="634" class="hljs-string">(GLX_MESA_query_renderer):</span>
    <span data-omnivore-anchor-idx="635" class="hljs-attr">Vendor:</span> <span data-omnivore-anchor-idx="636" class="hljs-string">AMD</span> <span data-omnivore-anchor-idx="637" class="hljs-string">(0x1002)</span>
    <span data-omnivore-anchor-idx="638" class="hljs-attr">Device:</span> <span data-omnivore-anchor-idx="639" class="hljs-string">Radeon</span> <span data-omnivore-anchor-idx="640" class="hljs-string">RX550/550</span> <span data-omnivore-anchor-idx="641" class="hljs-string">Series</span> <span data-omnivore-anchor-idx="642" class="hljs-string">(POLARIS12,</span> <span data-omnivore-anchor-idx="643" class="hljs-string">DRM</span> <span data-omnivore-anchor-idx="644" class="hljs-number">3.40</span><span data-omnivore-anchor-idx="645" class="hljs-number">.0</span><span data-omnivore-anchor-idx="646" class="hljs-string">,</span> <span data-omnivore-anchor-idx="647" class="hljs-number">5.10</span><span data-omnivore-anchor-idx="648" class="hljs-number">.57</span><span data-omnivore-anchor-idx="649" class="hljs-string">,</span> <span data-omnivore-anchor-idx="650" class="hljs-string">LLVM</span> <span data-omnivore-anchor-idx="651" class="hljs-number">11.1</span><span data-omnivore-anchor-idx="652" class="hljs-number">.0</span><span data-omnivore-anchor-idx="653" class="hljs-string">)</span> <span data-omnivore-anchor-idx="654" class="hljs-string">(0x699f)</span>
    <span data-omnivore-anchor-idx="655" class="hljs-attr">Version:</span> <span data-omnivore-anchor-idx="656" class="hljs-number">21.1</span><span data-omnivore-anchor-idx="657" class="hljs-number">.4</span>
    <span data-omnivore-anchor-idx="658" class="hljs-attr">Accelerated:</span> <span data-omnivore-anchor-idx="659" class="hljs-literal">yes</span>
<span data-omnivore-anchor-idx="660" class="hljs-string">...</span>
</code></pre></div><p data-omnivore-anchor-idx="661">I am yet to research ways to virtualize a GPU on top of a hardware GPU with consumer-grade hardware.
I know that the QEMU does something similar with <code data-omnivore-anchor-idx="662" class="hljs language-ebnf"><span data-omnivore-anchor-idx="663" class="hljs-attribute">virtio-gpu</span></code>/<code data-omnivore-anchor-idx="664" class="hljs language-ebnf"><span data-omnivore-anchor-idx="665" class="hljs-attribute">virgl</span></code>.
Nonetheless, I’ve noticed the lack of hardware acceleration by an accident (smooth scrolling in the Visual Studio Code doesn’t work without it), so currently, I’m working with a software rasterizer.</p><p data-omnivore-anchor-idx="666">Note for the Nvidia users with proprietary drivers: I have not tested them, but I’m pretty confident that something will break.
My suggestion is to use the open-source drivers and, preferably, hardware with proper support from its company.</p><p data-omnivore-anchor-idx="667">There are still some usability improvements we can make.
After all, it’s pretty tedious to manually run <code data-omnivore-anchor-idx="668" class="hljs language-ebnf"><span data-omnivore-anchor-idx="669" class="hljs-attribute">systemctl</span></code> or <code data-omnivore-anchor-idx="670" class="hljs language-ebnf"><span data-omnivore-anchor-idx="671" class="hljs-attribute">machinectl</span></code> commands each time you want to run something inside a container.</p><h3 data-omnivore-anchor-idx="672" id="application-launcher">Application launcher <a data-omnivore-anchor-idx="673" href="#application-launcher">🔗</a></h3><p data-omnivore-anchor-idx="674">It would be perfect if the application inside a specific container could be run using your application launcher of choice.
While it won’t be as straightforward as running applications on host — we have to specify in which container we want to run it — it still will be a significant UX improvement.
For the article’s purposes, I will be using <a data-omnivore-anchor-idx="675" href="https://hg.sr.ht/~scoopta/wofi">wofi</a>.
It is similar to <a data-omnivore-anchor-idx="676" href="https://github.com/davatorium/rofi">rofi</a> but built for Wayland.</p><p data-omnivore-anchor-idx="677">First, we need to add an application launcher to the <code data-omnivore-anchor-idx="678" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="679" class="hljs-built_in">home</span>.nix</code> configuration.
It is pretty simple:</p><div data-omnivore-anchor-idx="680"><pre data-omnivore-anchor-idx="681" tabindex="0"><code data-omnivore-anchor-idx="682" class="hljs language-routeros language-nix">{ pkgs, <span data-omnivore-anchor-idx="683" class="hljs-built_in">..</span>. }:

{
  # <span data-omnivore-anchor-idx="684" class="hljs-built_in">..</span>.
  wayland.windowManager.sway = {
    # <span data-omnivore-anchor-idx="685" class="hljs-built_in">..</span>.
   <span data-omnivore-anchor-idx="686" class="hljs-built_in"> config </span>= {
      # <span data-omnivore-anchor-idx="687" class="hljs-built_in">..</span>.

      # Application launcher.
      menu = <span data-omnivore-anchor-idx="688" class="hljs-string">"<span data-omnivore-anchor-idx="689" class="hljs-variable">${pkgs.wofi}</span>/bin/wofi --show run"</span>;
      
      window.titlebar = <span data-omnivore-anchor-idx="690" class="hljs-literal">true</span>;
    };
  };
  
  # <span data-omnivore-anchor-idx="691" class="hljs-built_in">..</span>.
}
</code></pre></div><p data-omnivore-anchor-idx="692">You can check if it’s working by pressing <code data-omnivore-anchor-idx="693" class="hljs language-undefined">Mod1+d</code> / <code data-omnivore-anchor-idx="694" class="hljs language-undefined">Alt+d</code> inside the virtual machine.
I also added the <code data-omnivore-anchor-idx="695" class="hljs language-coffeescript language-css"><span data-omnivore-anchor-idx="696" class="hljs-built_in">window</span>.titlebar</code> property, because titlebars disappeared for some reason after changing the <code data-omnivore-anchor-idx="697" class="hljs language-ebnf language-mel"><span data-omnivore-anchor-idx="698" class="hljs-attribute">menu</span></code>’s value.
Kind of magic I don’t want to investigate.</p><p data-omnivore-anchor-idx="699">Next, add a graphical polkit agent to be able to authenticate.
With container configuration, we can affect the system in many ways (i.e., mount root directory inside a container), requiring elevated privileges.
I will add it as a user systemd service inside the <code data-omnivore-anchor-idx="700" class="hljs language-arduino language-css"><span data-omnivore-anchor-idx="701" class="hljs-built_in">home</span>-host.nix</code>:</p><div data-omnivore-anchor-idx="702"><pre data-omnivore-anchor-idx="703" tabindex="0"><code data-omnivore-anchor-idx="704" class="hljs language-routeros language-nix">{ pkgs, <span data-omnivore-anchor-idx="705" class="hljs-built_in">..</span>. }:

{
  # <span data-omnivore-anchor-idx="706" class="hljs-built_in">..</span>.

  systemd.user.services.polkit-agent = {
    Unit = {
      Description = <span data-omnivore-anchor-idx="707" class="hljs-string">"Runs polkit authentication agent"</span>;
      PartOf = <span data-omnivore-anchor-idx="708" class="hljs-string">"graphical-session.target"</span>;
    };

    Install = {
      WantedBy = [<span data-omnivore-anchor-idx="709" class="hljs-string">"graphical-session.target"</span>];
    };

   <span data-omnivore-anchor-idx="710" class="hljs-built_in"> Service </span>= {
      ExecStart = <span data-omnivore-anchor-idx="711" class="hljs-string">"<span data-omnivore-anchor-idx="712" class="hljs-variable">${pkgs.polkit_gnome}</span>/libexec/polkit-gnome-authentication-agent-1"</span>;
      RestartSec = 5;
      Restart = <span data-omnivore-anchor-idx="713" class="hljs-string">"always"</span>;
    };
  };
}
</code></pre></div><p data-omnivore-anchor-idx="714">Finally, let’s prepare an executable for running things inside the container.
I will define it in <code data-omnivore-anchor-idx="715" class="hljs language-css"><span data-omnivore-anchor-idx="716" class="hljs-selector-tag">desktop-host</span><span data-omnivore-anchor-idx="717" class="hljs-selector-class">.nix</span></code>:</p><div data-omnivore-anchor-idx="718"><pre data-omnivore-anchor-idx="719" tabindex="0"><code data-omnivore-anchor-idx="720" class="hljs language-bash language-routeros">{ config, pkgs, lib, ... }:

<span data-omnivore-anchor-idx="721" class="hljs-comment"># ...</span>
{
  <span data-omnivore-anchor-idx="722" class="hljs-comment"># ...</span>

  environment.systemPackages = <span data-omnivore-anchor-idx="723" class="hljs-built_in">let</span>
    userName = <span data-omnivore-anchor-idx="724" class="hljs-string">"myuser"</span>;
    containerName = <span data-omnivore-anchor-idx="725" class="hljs-string">"graphicalExample"</span>;
    hostLauncher = pkgs.writeScriptBin <span data-omnivore-anchor-idx="726" class="hljs-string">"<span data-omnivore-anchor-idx="727" class="hljs-variable">${containerName}</span>-launcher"</span> <span data-omnivore-anchor-idx="728" class="hljs-string">''</span>
      <span data-omnivore-anchor-idx="729" class="hljs-comment">#!${pkgs.stdenv.shell}</span>
      <span data-omnivore-anchor-idx="730" class="hljs-built_in">set</span> -euo pipefail

      <span data-omnivore-anchor-idx="731" class="hljs-keyword">if</span> [[ <span data-omnivore-anchor-idx="732" class="hljs-string">"<span data-omnivore-anchor-idx="733" class="hljs-variable">$(systemctl is-active container@${containerName}.service)</span>"</span> != <span data-omnivore-anchor-idx="734" class="hljs-string">"active"</span> ]]; <span data-omnivore-anchor-idx="735" class="hljs-keyword">then</span>
        systemctl start container@<span data-omnivore-anchor-idx="736" class="hljs-variable">${containerName}</span>.service
      <span data-omnivore-anchor-idx="737" class="hljs-keyword">fi</span>

      <span data-omnivore-anchor-idx="738" class="hljs-built_in">exec</span> machinectl shell <span data-omnivore-anchor-idx="739" class="hljs-variable">${userName}</span>@<span data-omnivore-anchor-idx="740" class="hljs-variable">${containerName}</span> /usr/bin/env bash --login -c <span data-omnivore-anchor-idx="741" class="hljs-string">"exec <span data-omnivore-anchor-idx="742" class="hljs-variable">${pkgs.wofi}</span>/bin/wofi --show run"</span>
    <span data-omnivore-anchor-idx="743" class="hljs-string">''</span>;
  <span data-omnivore-anchor-idx="744" class="hljs-keyword">in</span> [ hostLauncher ];
}
</code></pre></div><p data-omnivore-anchor-idx="745">It will start the container if it is not running and then execute <code data-omnivore-anchor-idx="746" class="hljs language-ebnf"><span data-omnivore-anchor-idx="747" class="hljs-attribute">wofi</span></code> inside.
You can test it in the virtual machine by searching for <code data-omnivore-anchor-idx="748" class="hljs language-ebnf"><span data-omnivore-anchor-idx="749" class="hljs-attribute">graphicalExample-launcher</span></code> in the host’s <code data-omnivore-anchor-idx="750" class="hljs language-ebnf"><span data-omnivore-anchor-idx="751" class="hljs-attribute">wofi</span></code> and then running it.</p><p data-omnivore-anchor-idx="752">It would be better to use actual desktop items.
However, when I tried them, they messed something with environment variables inside the container.
As a result, it should be possible to use the desktop item as launcher on the host almost directly but, using it inside the container would require some debugging.
Anyway, I still consider it a significant UX improvement over manually calling <code data-omnivore-anchor-idx="753" class="hljs language-ebnf"><span data-omnivore-anchor-idx="754" class="hljs-attribute">systemctl</span></code> and <code data-omnivore-anchor-idx="755" class="hljs language-ebnf"><span data-omnivore-anchor-idx="756" class="hljs-attribute">machinectl</span></code>.</p><h3 data-omnivore-anchor-idx="757" id="sharing-files-between-the-host-and-a-container">Sharing files between the host and a container <a data-omnivore-anchor-idx="758" href="#sharing-files-between-the-host-and-a-container">🔗</a></h3><p data-omnivore-anchor-idx="759">For containers to be of any use, we need to share meaningful data with them.
We can use mentioned earlier <code data-omnivore-anchor-idx="760" class="hljs language-ebnf"><span data-omnivore-anchor-idx="761" class="hljs-attribute">bindMounts</span></code>.
It would allow us to, for example, bind <code data-omnivore-anchor-idx="762" class="hljs language-applescript language-arcade">~/Projects/<span data-omnivore-anchor-idx="763" class="hljs-keyword">first</span></code> to <code data-omnivore-anchor-idx="764" class="hljs language-cmake language-haml">~/<span data-omnivore-anchor-idx="765" class="hljs-keyword">Project</span></code> inside the container.</p><p data-omnivore-anchor-idx="766">Another approach is to leverage the knowledge that containers’ data resides in <code data-omnivore-anchor-idx="767" class="hljs language-crystal language-actionscript">/var/<span data-omnivore-anchor-idx="768" class="hljs-class"><span data-omnivore-anchor-idx="769" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="770" class="hljs-title">containers</span></span></code>.
We can then issue on the host command like:</p><div data-omnivore-anchor-idx="771"><pre data-omnivore-anchor-idx="772" tabindex="0"><code data-omnivore-anchor-idx="773" class="hljs language-crystal language-groovy">git clone ~<span data-omnivore-anchor-idx="774" class="hljs-regexp">/Projects/first</span> /var/<span data-omnivore-anchor-idx="775" class="hljs-class"><span data-omnivore-anchor-idx="776" class="hljs-keyword">lib</span>/<span data-omnivore-anchor-idx="777" class="hljs-title">containers</span>/<span data-omnivore-anchor-idx="778" class="hljs-title">firstContainer</span>/<span data-omnivore-anchor-idx="779" class="hljs-title">home</span>/<span data-omnivore-anchor-idx="780" class="hljs-title">myuser</span>/<span data-omnivore-anchor-idx="781" class="hljs-title">Project</span></span>
</code></pre></div><p data-omnivore-anchor-idx="782">Although using separate <a data-omnivore-anchor-idx="783" href="https://git-scm.com/docs/git#Documentation/git.txt---git-dirltpathgt">git-dir</a> and <a data-omnivore-anchor-idx="784" href="https://git-scm.com/docs/git#Documentation/git.txt---work-treeltpathgt">work-tree</a> might be more convenient here.<sup data-omnivore-anchor-idx="785" id="fnref:4"><a data-omnivore-anchor-idx="786" href="#fn:4" role="doc-noteref">4</a></sup></p><h3 data-omnivore-anchor-idx="787" id="nixos-config-usability">NixOS config usability <a data-omnivore-anchor-idx="788" href="#nixos-config-usability">🔗</a></h3><p data-omnivore-anchor-idx="789">There is a bit of boilerplate code around container configuration.
This is not a problem as long as there is only one container.
However, the point was to have multiple isolated environments.
Personally, I have created a custom Nix module providing the necessary functionality.
Unfortunately, it is ugly and buggy, so I think it will be better for the NixOS community if I won’t share it
(Maybe one day I will decide to publish it as a warning.)</p><p data-omnivore-anchor-idx="790">Anyway, in principle, its usage looks like this:</p><div data-omnivore-anchor-idx="791"><pre data-omnivore-anchor-idx="792" tabindex="0"><code data-omnivore-anchor-idx="793" class="hljs language-nix language-routeros">{ pkgs, ... }:

{
  <span data-omnivore-anchor-idx="794" class="hljs-attr">betterContainers</span> = <span data-omnivore-anchor-idx="795" class="hljs-keyword">rec</span> {
    <span data-omnivore-anchor-idx="796" class="hljs-attr">base</span> = {
      <span data-omnivore-anchor-idx="797" class="hljs-attr">userName</span> = <span data-omnivore-anchor-idx="798" class="hljs-string">"user"</span>;
      <span data-omnivore-anchor-idx="799" class="hljs-attr">desktopLauncher</span> = <span data-omnivore-anchor-idx="800" class="hljs-string">"<span data-omnivore-anchor-idx="801" class="hljs-subst">${pkgs.wofi}</span>/bin/wofi --show run"</span>;
      
      <span data-omnivore-anchor-idx="802" class="hljs-attr">config</span> = {
        <span data-omnivore-anchor-idx="803" class="hljs-comment"># A shared configuration for all containers.</span>
      };
    };
    
    <span data-omnivore-anchor-idx="804" class="hljs-attr">containers</span> = <span data-omnivore-anchor-idx="805" class="hljs-keyword">let</span>
      <span data-omnivore-anchor-idx="806" class="hljs-comment"># Traits with a shared configuration. Implementation is skipped.</span>
      <span data-omnivore-anchor-idx="807" class="hljs-attr">baseDevTrait</span> = { };
      <span data-omnivore-anchor-idx="808" class="hljs-attr">jvmDevTrait</span> = {  };
      <span data-omnivore-anchor-idx="809" class="hljs-attr">golangDevTrait</span> = { };
      <span data-omnivore-anchor-idx="810" class="hljs-attr">nodejsDevTrait</span> = { };
      
      <span data-omnivore-anchor-idx="811" class="hljs-comment"># Function to provide FHS with all packages inside the environment.</span>
      <span data-omnivore-anchor-idx="812" class="hljs-comment"># Useful when working on projects without Nix support.</span>
      <span data-omnivore-anchor-idx="813" class="hljs-comment"># Provides `enter-fhs` binary, which enters the FHS environment.</span>
      <span data-omnivore-anchor-idx="814" class="hljs-comment">#</span>
      <span data-omnivore-anchor-idx="815" class="hljs-comment"># Implementation is skipped.</span>
      <span data-omnivore-anchor-idx="816" class="hljs-attr">withFhs</span> = traits: { };
      
      <span data-omnivore-anchor-idx="817" class="hljs-comment"># Templates</span>
      <span data-omnivore-anchor-idx="818" class="hljs-attr">webdevTemplate</span> = withFhs [baseDevTrait golangDevTrait jvmDevTrait nodejsDevTrait];
    <span data-omnivore-anchor-idx="819" class="hljs-keyword">in</span> {
      <span data-omnivore-anchor-idx="820" class="hljs-attr">someWebProject</span> = {
        <span data-omnivore-anchor-idx="821" class="hljs-attr">desktopRunner</span> = <span data-omnivore-anchor-idx="822" class="hljs-string">"enter-fhs -c \"</span>${base.desktopRunner}\<span data-omnivore-anchor-idx="823" class="hljs-string">""</span>;
        <span data-omnivore-anchor-idx="824" class="hljs-attr">config</span> = webdevTemplate;
      };

      blog.<span data-omnivore-anchor-idx="825" class="hljs-attr">config</span> = withFhs [
        jvmDevTrait
        golangDevTrait
        {
          home-manager.users.<span data-omnivore-anchor-idx="826" class="hljs-string">"<span data-omnivore-anchor-idx="827" class="hljs-subst">${base.userName}</span>"</span>.home.<span data-omnivore-anchor-idx="828" class="hljs-attr">packages</span> = [ pkgs.hugo ];
        }
      ];
    };
  };
}
</code></pre></div><h2 data-omnivore-anchor-idx="829" id="systemd-nspawn"><code data-omnivore-anchor-idx="830" class="hljs language-ebnf"><span data-omnivore-anchor-idx="831" class="hljs-attribute">systemd-nspawn</span></code> <a data-omnivore-anchor-idx="832" href="#systemd-nspawn">🔗</a></h2><p data-omnivore-anchor-idx="833">NixOS’s declarative containers run on top of <a data-omnivore-anchor-idx="834" href="https://www.freedesktop.org/software/systemd/man/systemd-nspawn.html">systemd-nspawn</a>.
Details of this container management tool are definitely out of the scope of this article.
However, I think it provides several exciting capabilities.</p><p data-omnivore-anchor-idx="835">Let’s start with the <code data-omnivore-anchor-idx="836" class="hljs language-ebnf"><span data-omnivore-anchor-idx="837" class="hljs-attribute">systemd-cgls</span></code> command.
It will show control groups in the system — including a group created for a container.</p><picture data-omnivore-anchor-idx="838"><source data-omnivore-anchor-idx="839" srcset="https://proxy-prod.omnivore-image-cache.app/1145x0,sjYcGP8eMtuyCnknlucRtdFTi7cEUmEazRk5AaNmcwEg/https://msucharski.eu/posts/application-isolation-nixos-containers/systemd-cgls-1145x1236.avif 1145w," type="image/avif"><source data-omnivore-anchor-idx="840" srcset="https://proxy-prod.omnivore-image-cache.app/1145x0,sMEnv64bQQtlGsUyH4Btn3ESZU3AD2Awn93dL9bO5b78/https://msucharski.eu/posts/application-isolation-nixos-containers/systemd-cgls-1145x1236.webp 1145w," type="image/webp"><img data-omnivore-anchor-idx="841" data-omnivore-original-src="https://msucharski.eu/posts/application-isolation-nixos-containers/systemd-cgls-1145x1236.png" alt="systemd-cgls output" src="https://proxy-prod.omnivore-image-cache.app/1145x1236,sd-OcuV0gKCugIrFri650U92p18qKVSdiNKGvhdcaeOk/https://msucharski.eu/posts/application-isolation-nixos-containers/systemd-cgls-1145x1236.png" loading="lazy" width="1145" height="1236"></picture><p data-omnivore-anchor-idx="842">In the image, we see the <code data-omnivore-anchor-idx="843" class="hljs language-css language-pgsql"><span data-omnivore-anchor-idx="844" class="hljs-selector-tag">machine</span><span data-omnivore-anchor-idx="845" class="hljs-selector-class">.slice</span></code> and nested <code data-omnivore-anchor-idx="846" class="hljs language-css language-mel"><span data-omnivore-anchor-idx="847" class="hljs-selector-tag">container</span>@<span data-omnivore-anchor-idx="848" class="hljs-keyword">graphicalExample</span>.<span data-omnivore-anchor-idx="849" class="hljs-keyword">service</span></code>.
The nested entry is our container!
Using <code data-omnivore-anchor-idx="850" class="hljs language-ebnf"><span data-omnivore-anchor-idx="851" class="hljs-attribute">systemd-cgls</span></code>, we can check what processes are running inside the container without explicitly running anything inside the container.</p><p data-omnivore-anchor-idx="852">Another great tool is the <code data-omnivore-anchor-idx="853" class="hljs language-ebnf"><span data-omnivore-anchor-idx="854" class="hljs-attribute">systemd-cgtop</span></code>.
While the <code data-omnivore-anchor-idx="855" class="hljs language-ebnf"><span data-omnivore-anchor-idx="856" class="hljs-attribute">systemd-cgls</span></code> gives us an excellent overview of <em data-omnivore-anchor-idx="857">what</em> is running inside a container, the <code data-omnivore-anchor-idx="858" class="hljs language-ebnf"><span data-omnivore-anchor-idx="859" class="hljs-attribute">cgtop</span></code> variant shows us the resource usage of each control group.</p><picture data-omnivore-anchor-idx="860"><source data-omnivore-anchor-idx="861" srcset="https://proxy-prod.omnivore-image-cache.app/1079x0,sBGmsQPiAl_ujlTIfkxXDxW40G1WQF8rXkj-8GZ_-CsI/https://msucharski.eu/posts/application-isolation-nixos-containers/systemd-cgtop-1079x618.avif 1079w," type="image/avif"><source data-omnivore-anchor-idx="862" srcset="https://proxy-prod.omnivore-image-cache.app/1079x0,s0y5hpw0y-rlmagHpFrZlk_rhCVQ-nsk9X2CO0tQTGbg/https://msucharski.eu/posts/application-isolation-nixos-containers/systemd-cgtop-1079x618.webp 1079w," type="image/webp"><img data-omnivore-anchor-idx="863" data-omnivore-original-src="https://msucharski.eu/posts/application-isolation-nixos-containers/systemd-cgtop-1079x618.png" alt="systemd-cgtop --order=memory output" src="https://proxy-prod.omnivore-image-cache.app/1079x618,szc7lqg2eWrHfxPp04ctFl5StwcztS8ZJro-itqNMlhs/https://msucharski.eu/posts/application-isolation-nixos-containers/systemd-cgtop-1079x618.png" loading="lazy" width="1079" height="618"></picture><p data-omnivore-anchor-idx="864">In the picture above, we see the output of <code data-omnivore-anchor-idx="865" class="hljs language-routeros language-stata">systemd-cgtop <span data-omnivore-anchor-idx="866" class="hljs-attribute">--order</span>=memory</code>.
Unsurprisingly, the <code data-omnivore-anchor-idx="867" class="hljs language-ebnf"><span data-omnivore-anchor-idx="868" class="hljs-attribute">graphicalExample</span></code> container is using the majority of memory.
This usage might have something to do with IntelliJ running in the background. ;-)</p><p data-omnivore-anchor-idx="869">Last but not least: the <code data-omnivore-anchor-idx="870" class="hljs language-diff language-haml"><span data-omnivore-anchor-idx="871" class="hljs-deletion">-M</span></code> / <code data-omnivore-anchor-idx="872" class="hljs language-ada language-applescript"><span data-omnivore-anchor-idx="873" class="hljs-comment">--machine</span></code> switch.
It works, for example, with <code data-omnivore-anchor-idx="874" class="hljs language-ebnf"><span data-omnivore-anchor-idx="875" class="hljs-attribute">systemctl</span></code> and <code data-omnivore-anchor-idx="876" class="hljs language-ebnf"><span data-omnivore-anchor-idx="877" class="hljs-attribute">journalctl</span></code>.
We use it to specify the machine (in our case: a container) to work with.
In the case of the <code data-omnivore-anchor-idx="878" class="hljs language-ebnf"><span data-omnivore-anchor-idx="879" class="hljs-attribute">journalctl</span></code> the command may look like (as root):</p><div data-omnivore-anchor-idx="880"><pre data-omnivore-anchor-idx="881" tabindex="0"><code data-omnivore-anchor-idx="882" class="hljs language-ebnf language-mipsasm"><span data-omnivore-anchor-idx="883" class="hljs-attribute">journalctl -M graphicalExample</span>
</code></pre></div><p data-omnivore-anchor-idx="884">The result will be similar to the traditional <code data-omnivore-anchor-idx="885" class="hljs language-ebnf"><span data-omnivore-anchor-idx="886" class="hljs-attribute">journalctl</span></code>.
However, in this case we will see the logs from the container.</p><h2 data-omnivore-anchor-idx="887" id="conclusion">Conclusion <a data-omnivore-anchor-idx="888" href="#conclusion">🔗</a></h2><p data-omnivore-anchor-idx="889">The final source code for the provided example can be found in the <a data-omnivore-anchor-idx="890" href="https://github.com/marcin-sucharski/application-isolation-nixos-containers">repository on Github</a>.
It is the same code as presented in the article.
There are separate commits for different stages of the blog post, so you may want to look into diffs if applied changes are not clear from the text.</p><p data-omnivore-anchor-idx="891">As I mentioned initially: I’m not a security expert, so you must decide if this solution fits your security model.
To make it easier for you, I tried to emphasize obvious security issues (shared X11 socket, to some extent: shared Wayland socket, shared Nix store).
There are also possible improvements/considerations not mentioned yet:</p><ul data-omnivore-anchor-idx="892"><li data-omnivore-anchor-idx="893">Network isolation: you can define a separate network for declarative containers, even to the point of completely disabling networking for the container.</li><li data-omnivore-anchor-idx="894">Syscall filtering: as far as I know, <code data-omnivore-anchor-idx="895" class="hljs language-ebnf"><span data-omnivore-anchor-idx="896" class="hljs-attribute">systemd-nspawn</span></code> (container manager used internally by NixOS Containers) does some syscall filtering. I have not investigated to what extent.</li></ul><p data-omnivore-anchor-idx="897">I hope this post was helpful or at least interesting. ;-)</p><div data-omnivore-anchor-idx="898" role="doc-endnotes"><hr data-omnivore-anchor-idx="899"><ol data-omnivore-anchor-idx="900"><li data-omnivore-anchor-idx="901" id="fn:1"><p data-omnivore-anchor-idx="902">I explicitly mentioned IntelliJ Idea because I also tried Visual Studio Code, and the experience was way better under <code data-omnivore-anchor-idx="903" class="hljs language-ebnf"><span data-omnivore-anchor-idx="904" class="hljs-attribute">virtio-gpu</span></code> than IJ.&nbsp;<a data-omnivore-anchor-idx="905" href="#fnref:1" role="doc-backlink">↩︎</a></p></li><li data-omnivore-anchor-idx="906" id="fn:2"><p data-omnivore-anchor-idx="907">If not, you might be interested in reading <a data-omnivore-anchor-idx="908" href="https://nixos.org/manual/nixos/stable/">NixOS Manual</a> and <a data-omnivore-anchor-idx="909" href="https://nixos.org/guides/nix-pills/">Nix Pills</a>.&nbsp;<a data-omnivore-anchor-idx="910" href="#fnref:2" role="doc-backlink">↩︎</a></p></li><li data-omnivore-anchor-idx="911" id="fn:3"><p data-omnivore-anchor-idx="912">I’m aware that you can provide in <code data-omnivore-anchor-idx="913" class="hljs language-css language-pgsql"><span data-omnivore-anchor-idx="914" class="hljs-selector-tag">configuration</span><span data-omnivore-anchor-idx="915" class="hljs-selector-class">.nix</span></code> list of packages per user but, there is no option to create appropriate dotfiles on per-user basis.&nbsp;<a data-omnivore-anchor-idx="916" href="#fnref:3" role="doc-backlink">↩︎</a></p></li><li data-omnivore-anchor-idx="917" id="fn:4"><p data-omnivore-anchor-idx="918">Keep git-dir on the host and work-dir in the container, so the container does not issue any git commands and won’t add anything malicious to git hooks. As a con, you will lose git integration in the IDE. There is no free lunch.&nbsp;<a data-omnivore-anchor-idx="919" href="#fnref:4" role="doc-backlink">↩︎</a></p></li></ol></div></div></div></DIV></DIV>



# links
[Read on Omnivore](https://omnivore.app/me/https-msucharski-eu-posts-application-isolation-nixos-containers-18fc5582310)
[Read Original](https://msucharski.eu/posts/application-isolation-nixos-containers/)

<iframe src="https://msucharski.eu/posts/application-isolation-nixos-containers/"  width="800" height="500"></iframe>
