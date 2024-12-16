---
id: 68ff0f14-3f95-48fe-96a0-0b9553186fea
title: Rootless Podman and Docker-Compose on NixOS · Carlos Vaz
author: Carlos Vaz
tags:
  - docker
  - nixos
date: 2024-08-20 21:33:59
date_published: 2023-08-06 03:00:00
words_count: 477
state: INBOX
---

# Rootless Podman and Docker-Compose on NixOS · Carlos Vaz by Carlos Vaz
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> At my university’s Computer Science and Engineering department, we want to allow students to use containers in the lab computers while not giving them root priviliges, as running Docker usually requires.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
<DIV id="readability-content"><DIV data-omnivore-anchor-idx="1" class="page" id="readability-page-1"><article data-omnivore-anchor-idx="2">
    <header data-omnivore-anchor-idx="3">
      
      
      
        
      
      
    </header>
    <div data-omnivore-anchor-idx="4">
        <p data-omnivore-anchor-idx="5">At my university’s Computer Science and Engineering department, we want to allow students to use containers in the lab computers while not giving them root priviliges, as running Docker usually requires.</p>
<p data-omnivore-anchor-idx="6">In the past, on our Ubuntu systems, we had a setup of rootless-Docker I’m not sure ever worked properly.
There also seems to exist an option on NixOS to enable rootless-Docker, but we also had some issues in using it.</p>
<p data-omnivore-anchor-idx="7">So we went with Podman, a Docker alternative that’s more ready to be run rootless by design.
Also, Docker can just be aliased to Podman and the experience is so identical that the students may not even notice that they’re not running Docker proper.</p>
<p data-omnivore-anchor-idx="8">Enabling Podman on NixOS is quite trivial but having it work in a rootless environment requires more configuration:</p>
<div data-omnivore-anchor-idx="9"><pre data-omnivore-anchor-idx="10" tabindex="0"><code data-omnivore-anchor-idx="11" class="hljs language-nix language-routeros">{ config, lib, pkgs, ... }:

{
  <span data-omnivore-anchor-idx="12" class="hljs-attr">virtualisation</span> = {
    containers.<span data-omnivore-anchor-idx="13" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="14" class="hljs-literal">true</span>;
    containers.storage.<span data-omnivore-anchor-idx="15" class="hljs-attr">settings</span> = {
      <span data-omnivore-anchor-idx="16" class="hljs-attr">storage</span> = {
        <span data-omnivore-anchor-idx="17" class="hljs-attr">driver</span> = <span data-omnivore-anchor-idx="18" class="hljs-string">"overlay"</span>;
        <span data-omnivore-anchor-idx="19" class="hljs-attr">runroot</span> = <span data-omnivore-anchor-idx="20" class="hljs-string">"/run/containers/storage"</span>;
        <span data-omnivore-anchor-idx="21" class="hljs-attr">graphroot</span> = <span data-omnivore-anchor-idx="22" class="hljs-string">"/var/lib/containers/storage"</span>;
        <span data-omnivore-anchor-idx="23" class="hljs-attr">rootless_storage_path</span> = <span data-omnivore-anchor-idx="24" class="hljs-string">"/tmp/containers-$USER"</span>;
        options.overlay.<span data-omnivore-anchor-idx="25" class="hljs-attr">mountopt</span> = <span data-omnivore-anchor-idx="26" class="hljs-string">"nodev,metacopy=on"</span>;
      };
    };

    oci-containers.<span data-omnivore-anchor-idx="27" class="hljs-attr">backend</span> = <span data-omnivore-anchor-idx="28" class="hljs-string">"podman"</span>;
    <span data-omnivore-anchor-idx="29" class="hljs-attr">podman</span> = {
      <span data-omnivore-anchor-idx="30" class="hljs-attr">enable</span> = <span data-omnivore-anchor-idx="31" class="hljs-literal">true</span>;
      <span data-omnivore-anchor-idx="32" class="hljs-attr">enableNvidia</span> = <span data-omnivore-anchor-idx="33" class="hljs-literal">true</span>;
      <span data-omnivore-anchor-idx="34" class="hljs-attr">dockerCompat</span> = <span data-omnivore-anchor-idx="35" class="hljs-literal">true</span>;
      <span data-omnivore-anchor-idx="36" class="hljs-comment"># extraPackages = [ pkgs.zfs ]; # Required if the host is running ZFS</span>
    };
  };

  environment.<span data-omnivore-anchor-idx="37" class="hljs-attr">systemPackages</span> = <span data-omnivore-anchor-idx="38" class="hljs-keyword">with</span> pkgs; [ docker-compose ];
  environment.<span data-omnivore-anchor-idx="39" class="hljs-attr">extraInit</span> = <span data-omnivore-anchor-idx="40" class="hljs-string">''
    if [ -z "$DOCKER_HOST" -a -n "$XDG_RUNTIME_DIR" ]; then
      export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/podman/podman.sock"
    fi
  ''</span>;
}
</code></pre></div><p data-omnivore-anchor-idx="41">We set the <code data-omnivore-anchor-idx="42" class="hljs language-undefined">DOCKER_HOST</code> environment variable on user login so that <code data-omnivore-anchor-idx="43" class="hljs language-ebnf"><span data-omnivore-anchor-idx="44" class="hljs-attribute">docker-compose</span></code> works using the rootless Podman socket.</p>
<p data-omnivore-anchor-idx="45">Because students log into our lab computers using Kerberos, they don’t have <code data-omnivore-anchor-idx="46" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="47" class="hljs-regexp">/etc/</span>subuid</code> and <code data-omnivore-anchor-idx="48" class="hljs language-awk language-dts"><span data-omnivore-anchor-idx="49" class="hljs-regexp">/etc/</span>subgid</code> entries automatically created for them.
So, in this particular setup, we also have a <code data-omnivore-anchor-idx="50" class="hljs language-undefined">pam_exec</code> hook to create the entries for them, otherwise Podman won’t work.</p>
<div data-omnivore-anchor-idx="51"><pre data-omnivore-anchor-idx="52" tabindex="0"><code data-omnivore-anchor-idx="53" class="hljs language-routeros language-crystal">{
  # subidappend is a<span data-omnivore-anchor-idx="54" class="hljs-built_in"> script </span>we wrote that adds subuid <span data-omnivore-anchor-idx="55" class="hljs-keyword">and</span> subgid entries on<span data-omnivore-anchor-idx="56" class="hljs-built_in"> user </span>login
  security.pam.services.login.text = lib.mkDefault (lib.mkAfter <span data-omnivore-anchor-idx="57" class="hljs-string">''</span>
    session optional pam_exec.so <span data-omnivore-anchor-idx="58" class="hljs-variable">${pkgs.subidappend}</span>/bin/subidappend
  <span data-omnivore-anchor-idx="59" class="hljs-string">''</span>);

  security.pam.services.sshd.text = lib.mkDefault (lib.mkAfter <span data-omnivore-anchor-idx="60" class="hljs-string">''</span>
    session optional pam_exec.so <span data-omnivore-anchor-idx="61" class="hljs-variable">${pkgs.subidappend}</span>/bin/subidappend
  <span data-omnivore-anchor-idx="62" class="hljs-string">''</span>);

  # Clean subuids <span data-omnivore-anchor-idx="63" class="hljs-keyword">and</span> gids on boot
  systemd.tmpfiles.rules =
    [ <span data-omnivore-anchor-idx="64" class="hljs-string">"f+  /etc/subuid 0644 root root -"</span> <span data-omnivore-anchor-idx="65" class="hljs-string">"f+  /etc/subgid 0644 root root -"</span> ];
}
</code></pre></div><p data-omnivore-anchor-idx="66">We find this setup to be quite robust, it tends to just work with most Docker workflows, with the execption of using ports under 1024.</p>
<p data-omnivore-anchor-idx="67">This allows students to run almost everything they wish to run on the lab computers, while still not having root privileges.
The Nix package manager also helps with this.
More importantly, students can now easily run services like Nginx and PostgreSQL, which are not trivial at all to run on the host system without root.</p>
<h2 data-omnivore-anchor-idx="68" id="references">References <span data-omnivore-anchor-idx="69"><a data-omnivore-anchor-idx="70" href="#references" aria-label="Anchor">#</a></span></h2><ul data-omnivore-anchor-idx="71">
<li data-omnivore-anchor-idx="72"><a data-omnivore-anchor-idx="73" href="https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md" target="_blank" rel="noreferrer">https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md</a></li>
<li data-omnivore-anchor-idx="74"><a data-omnivore-anchor-idx="75" href="https://major.io/p/rootless-container-management-with-docker-compose-and-podman/" target="_blank" rel="noreferrer">https://major.io/p/rootless-container-management-with-docker-compose-and-podman/</a></li>
<li data-omnivore-anchor-idx="76"><a data-omnivore-anchor-idx="77" href="https://nixos.wiki/wiki/Podman" target="_blank" rel="noreferrer">https://nixos.wiki/wiki/Podman</a></li>
</ul>

      </div>
    
  </article></DIV></DIV>



# links
[Read on Omnivore](https://omnivore.app/me/rootless-podman-and-docker-compose-on-nix-os-carlos-vaz-1917111390a)
[Read Original](https://carjorvaz.com/posts/rootless-podman-and-docker-compose-on-nixos/)

<iframe src="https://carjorvaz.com/posts/rootless-podman-and-docker-compose-on-nixos/"  width="800" height="500"></iframe>
