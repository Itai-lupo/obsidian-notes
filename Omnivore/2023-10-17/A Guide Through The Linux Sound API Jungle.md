---
id: bdcb74bc-6d1a-11ee-892a-9fcaf772417b
title: A Guide Through The Linux Sound API Jungle
author: Lennart Poettering
tags:
  - programing
  - game_engine
  - sound
  - linux
date: 2023-10-17 21:26:51
words_count: 3040
state: INBOX
---

# A Guide Through The Linux Sound API Jungle by Lennart Poettering
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Posts and writings by Lennart Poettering


# content

At the [Audio MC](http://lwn.net/Articles/299211/) at the [Linux Plumbers Conference](http://linuxplumbersconf.org/) one thing became very clear: it is very difficult for programmers to figure out which audio API to use for which purpose and which API not to use when doing audio programming on Linux. So here's my try to guide you through this jungle:

### What do you want to do?

_I want to write a media-player-like application!_

Use GStreamer! (Unless your focus is only KDE in which cases Phonon might be an alternative.)

_I want to add event sounds to my application!_

Use libcanberra, install your sound files according to the XDG Sound Theming/Naming Specifications! (Unless your focus is only KDE in which case KNotify might be an alternative although it has a different focus.)

_I want to do professional audio programming, hard-disk recording, music synthesizing, MIDI interfacing!_

Use JACK and/or the full ALSA interface.

_I want to do basic PCM audio playback/capturing!_

Use the _safe_ ALSA subset.

_I want to add sound to my game!_

Use the audio API of SDL for full-screen games, libcanberra for simple games with standard UIs such as Gtk+.

_I want to write a mixer application!_

Use the layer you want to support directly: if you want to support enhanced desktop software mixers, use the PulseAudio volume control APIs. If you want to support hardware mixers, use the ALSA mixer APIs.

_I want to write audio software for the plumbing layer!_

Use the full ALSA stack.

_I want to write audio software for embedded applications!_

For technical appliances usually the _safe_ ALSA subset is a good choice, this however depends highly on your use-case.

### You want to know more about the different sound APIs?

_GStreamer_

[GStreamer](http://www.gstreamer.net/) is the de-facto standard media streaming system for Linux desktops. It supports decoding and encoding of audio and video streams. You can use it for a wide range of purposes from simple audio file playback to elaborate network streaming setups. GStreamer supports a wide range of CODECs and audio backends. GStreamer is not particularly suited for basic PCM playback or low-latency/realtime applications. GStreamer is portable and not limited in its use to Linux. Among the supported backends are ALSA, OSS, PulseAudio. \[[Programming Manuals and References](http://gstreamer.freedesktop.org/documentation/)\]

_libcanberra_

[libcanberra](http://0pointer.de/lennart/projects/libcanberra/)is an abstract event sound API. It implements the [XDG Sound Theme and Naming Specifications](http://www.freedesktop.org/wiki/Specifications/sound-theme-spec). libcanberra is a blessed GNOME dependency, but itself has no dependency on GNOME/Gtk/GLib and can be used with other desktop environments as well. In addition to an easy interface for playing sound files, libcanberra provides caching (which is very useful for networked thin clients) and allows passing of various meta data to the underlying audio system which then can be used to enhance user experience (such as positional event sounds) and for improving accessibility. libcanberra supports multiple backends and is portable beyond Linux. Among the supported backends are ALSA, OSS, PulseAudio, GStreamer. \[[API Reference](http://0pointer.de/lennart/projects/libcanberra/gtkdoc/)\]

_JACK_

[JACK](http://jackaudio.org/) is a sound system for connecting professional audio production applications and hardware output. It's focus is low-latency and application interconnection. It is not useful for normal desktop or embedded use. It is not an API that is particularly useful if all you want to do is simple PCM playback. JACK supports multiple backends, although ALSA is best supported. JACK is portable beyond Linux. Among the supported backends are ALSA, OSS. \[[API Reference](http://jackaudio.org/files/docs/html/index.html)\]

_Full ALSA_

[ALSA](http://www.alsa-project.org/) is the Linux API for doing PCM playback and recording. ALSA is very focused on hardware devices, although other backends are supported as well (to a limit degree, see below). ALSA as a name is used both for the Linux audio kernel drivers and a user-space library that wraps these. ALSA -- the library -- is comprehensive, and portable (to a limited degree). The full ALSA API can appear very complex and is large. However it supports almost everything modern sound hardware can provide. Some of the functionality of the ALSA API is limited in its use to actual hardware devices supported by the Linux kernel (in contrast to software sound servers and sound drivers implemented in user-space such as those for Bluetooth and FireWire audio -- among others) and Linux specific drivers. \[[API Reference](http://www.alsa-project.org/alsa-doc/alsa-lib/)\]

_Safe ALSA_

Only a subset of the full ALSA API works on all backends ALSA supports. It is highly recommended to stick to this _safe_ subset if you do ALSA programming to keep programs portable, future-proof and compatible with sound servers, Bluetooth audio and FireWire audio. See below for more details about which functions of ALSA are considered safe. The _safe_ ALSA API is a suitable abstraction for basic, portable PCM playback and recording -- not just for ALSA kernel driver supported devices. Among the supported backends are ALSA kernel driver devices, OSS, PulseAudio, JACK.

_Phonon_ and _KNotify_

[Phonon](http://phonon.kde.org/) is high-level abstraction for media streaming systems such as GStreamer, but goes a bit further than that. It supports multiple backends. KNotify is a system for "notifications", which goes beyond mere event sounds. However it does not support the XDG Sound Theming/Naming Specifications at this point, and also doesn't support caching or passing of event meta-data to an underlying sound system. KNotify supports multiple backends for audio playback via Phonon. Both APIs are KDE/Qt specific and should not be used outside of KDE/Qt applications. \[[Phonon API Reference](http://api.kde.org/4.0-api/kdelibs-apidocs/phonon/html/index.html)\] \[[KNotify API Reference](http://api.kde.org/4.x-api/kdebase-runtime-apidocs/knotify/html/index.html)\] 

_SDL_

[SDL](http://www.libsdl.org/) is a portable API primarily used for full-screen game development. Among other stuff it includes a portable audio interface. Among others SDL support OSS, PulseAudio, ALSA as backends. \[[API Reference](http://www.libsdl.org/cgi/docwiki.cgi)\]

_PulseAudio_

[PulseAudio](http://pulseaudio.org/) is a sound system for Linux desktops and embedded environments that runs in user-space and (usually) on top of ALSA. PulseAudio supports network transparency, per-application volumes, spatial events sounds, allows switching of sound streams between devices on-the-fly, policy decisions, and many other high-level operations. PulseAudio adds a [glitch-free](http://0pointer.de/blog/projects/pulse-glitch-free.html)audio playback model to the Linux audio stack. PulseAudio is not useful in professional audio production environments. PulseAudio is portable beyond Linux. PulseAudio has a native API and also supports the _safe_ subset of ALSA, in addition to limited, LD\_PRELOAD-based OSS compatibility. Among others PulseAudio supports OSS and ALSA as backends and provides connectivity to JACK. \[[API Reference](http://0pointer.de/lennart/projects/pulseaudio/doxygen/)\]

_OSS_

The [Open Sound System](http://www.opensound.com/) is a low-level PCM API supported by a variety of Unixes including Linux. It started out as the standard Linux audio system and is supported on current Linux kernels in the API version 3 as OSS3\. OSS3 is considered obsolete and has been fully replaced by ALSA. A successor to OSS3 called OSS4 is available but plays virtually no role on Linux and is not supported in standard kernels or by any of the relevant distributions. The OSS API is very low-level, based around direct kernel interfacing using ioctl()s. It it is hence awkward to use and can practically not be virtualized for usage on non-kernel audio systems like sound servers (such as PulseAudio) or user-space sound drivers (such as Bluetooth or FireWire audio). OSS3's timing model cannot properly be mapped to software sound servers at all, and is also problematic on non-PCI hardware such as USB audio. Also, OSS does not do sample type conversion, remapping or resampling if necessary. This means that clients that properly want to support OSS need to include a complete set of converters/remappers/resamplers for the case when the hardware does not natively support the requested sampling parameters. With modern sound cards it is very common to support only S32LE samples at 48KHz and nothing else. If an OSS client assumes it can always play back S16LE samples at 44.1KHz it will thus fail. OSS3 is portable to other Unix-like systems, various differences however apply. OSS also doesn't support surround sound and other functionality of modern sounds systems properly. **OSS should be considered obsolete and not be used in new applications.** ALSA and PulseAudio have limited LD\_PRELOAD-based compatibility with OSS. \[[Programming Guide](http://www.opensound.com/pguide/oss.pdf)\]

All sound systems and APIs listed above are supported in all relevant current distributions. For libcanberra support the newest development release of your distribution might be necessary.

All sound systems and APIs listed above are suitable for development for commercial (read: closed source) applications, since they are licensed under LGPL or more liberal licenses or no client library is involved.

### You want to know why and when you should use a specific sound API?

_GStreamer_

GStreamer is best used for very high-level needs: i.e. you want to play an audio file or video stream and do not care about all the tiny details down to the PCM or codec level.

_libcanberra_

libcanberra is best used when adding sound feedback to user input in UIs. It can also be used to play simple sound files for notification purposes.

_JACK_

JACK is best used in professional audio production and where interconnecting applications is required.

_Full ALSA_

The full ALSA interface is best used for software on "plumbing layer" or when you want to make use of very specific hardware features, which might be need for audio production purposes.

_Safe ALSA_

The _safe_ ALSA interface is best used for software that wants to output/record basic PCM data from hardware devices or software sound systems.

_Phonon_ and _KNotify_

Phonon and KNotify should only be used in KDE/Qt applications and only for high-level media playback, resp. simple audio notifications.

_SDL_

SDL is best used in full-screen games.

_PulseAudio_

For now, the PulseAudio API should be used only for applications that want to expose sound-server-specific functionality (such as mixers) or when a PCM output abstraction layer is already available in your application and it thus makes sense to add an additional backend to it for PulseAudio to keep the stack of audio layers minimal.

_OSS_

OSS should not be used for new programs.

### You want to know more about the _safe_ ALSA subset?

Here's a list of DOS and DONTS in the ALSA API if you care about that you application stays future-proof and works fine with non-hardware backends or backends for user-space sound drivers such as Bluetooth and FireWire audio. Some of these recommendations apply for people using the full ALSA API as well, since some functionality should be considered obsolete for all cases.

If your application's code does not follow these rules, you must have a very good reason for that. Otherwise your code should simply be considered**broken**!

DONTS:

* Do **not** use "async handlers", e.g. viasnd\_async\_add\_pcm\_handler() and friends. Asynchronous handlers are implemented using POSIX signals, which is a very questionable use of them, especially from libraries and plugins. Even when you don't want to limit yourself to the _safe_ ALSA subset it is highly recommended not to use this functionality. [Read this for a longer explanation why signals for audio IO are evil.](http://mailman.alsa-project.org/pipermail/alsa-devel/2008-May/008030.html)
* Do **not** parse the ALSA configuration file yourself or with any of the ALSA functions such as snd\_config\_xxx(). If you need to enumerate audio devices use snd\_device\_name\_hint()(and related functions). That is the only API that also supports enumerating non-hardware audio devices and audio devices with drivers implemented in userspace.
* Do **not** parse any of the files from/proc/asound/. Those files only include information about kernel sound drivers -- user-space plugins are not listed there. Also, the set of kernel devices might differ from the way they are presented in user-space. (i.e. sub-devices are mapped in different ways to actual user-space devices such as surround51 an suchlike.
* Do **not** rely on stable device indexes from ALSA. Nowadays they depend on the initialization order of the drivers during boot-up time and are thus not stable.
* Do **not** use the snd\_card\_xxx() APIs. For enumerating use snd\_device\_name\_hint() (and related functions). snd\_card\_xxx() is obsolete. It will only list kernel hardware devices. User-space devices such as sound servers, Bluetooth audio are not included. snd\_card\_load() is completely obsolete in these days.
* Do **not** hard-code device strings, especially nothw:0 or plughw:0 or even dmix \-- these devices define no channel mapping and are mapped to raw kernel devices. It is highly recommended to use exclusively default as device string. If specific channel mappings are required the correct device strings should befront for stereo, surround40 for Surround 4.0,surround41, surround51, and so on. Unfortunately at this point ALSA does not define standard device names with channel mappings for non-kernel devices. This means default may only be used safely for mono and stereo streams. You should probably prefix your device string with plug: to make sure ALSA transparently reformats/remaps/resamples your PCM stream for you if the hardware/backend does not support your sampling parameters natively.
* Do **not** assume that any particular sample type is supported except the following ones: U8, S16\_LE, S16\_BE, S32\_LE, S32\_BE, FLOAT\_LE, FLOAT\_BE, MU\_LAW, A\_LAW.
* Do **not** use snd\_pcm\_avail\_update() for synchronization purposes. It should be used exclusively to query the amount of bytes that may be written/read right now. Do **not** usesnd\_pcm\_delay() to query the fill level of your playback buffer. It should be used exclusively for synchronisation purposes. Make sure you fully understand the difference, and note that the two functions return values that are not necessarily directly connected!
* Do **not** assume that the mixer controls always know dB information.
* Do **not** assume that all devices support MMAP style buffer access.
* Do **not** assume that the hardware pointer inside the (possibly mmaped) playback buffer is the actual position of the sample in the DAC. There might be an extra latency involved.
* Do **not** try to recover with your own code from ALSA error conditions such as buffer under-runs. Use snd\_pcm\_recover() instead.
* Do **not** touch buffering/period metrics unless you have specific latency needs. Develop defensively, handling correctly the case when the backend cannot fulfill your buffering metrics requests. Be aware that the buffering metrics of the playback buffer only indirectly influence the overall latency in many cases. i.e. setting the buffer size to a fixed value might actually result in practical latencies that are much higher.
* Do **not** assume that snd\_pcm\_rewind() is available and works and to which degree.
* Do **not** assume that the time when a PCM stream can receive new data is strictly dependant on the sampling and buffering parameters and the resulting average throughput. Always make sure to supply new audio data to the device when it asks for it by signalling "writability" on the fd. (And similarly for capturing)
* Do **not** use the "simple" interface snd\_spcm\_xxx().
* Do **not** use any of the functions marked as "obsolete".
* Do **not** use the timer, midi, rawmidi, hwdep subsystems.

DOS:

* Use snd\_device\_name\_hint() for enumerating audio devices.
* Use snd\_smixer\_xx() instead of raw snd\_ctl\_xxx()
* For synchronization purposes use snd\_pcm\_delay().
* For checking buffer playback/capture fill level use snd\_pcm\_update\_avail().
* Use snd\_pcm\_recover() to recover from errors returned by any of the ALSA functions.
* If possible use the largest buffer sizes the device supports to maximize power saving and drop-out safety. Use snd\_pcm\_rewind() if you need to react to user input quickly.

### FAQ

What about ESD and NAS?

ESD and NAS are obsolete, both as API and as sound daemon. Do not develop for it any further.

ALSA isn't portable!

That's not true! Actually the user-space library is relatively portable, it even includes a backend for OSS sound devices. There is no real reason that would disallow using the ALSA libraries on other Unixes as well.

Portability is key to me! What can I do?

Unfortunately no truly portable (i.e. to Win32) PCM API is available right now that I could truly recommend. The systems shown above are more or less portable at least to Unix-like operating systems. That does not mean however that there are suitable backends for all of them available. If you care about portability to Win32 and MacOS you probably have to find a solution outside of the recommendations above, or contribute the necessary backends/portability fixes. None of the systems (with the exception of OSS) is truly bound to Linux or Unix-like kernels.

What about PortAudio?

I don't think that PortAudio is very good API for Unix-like operating systems. I cannot recommend it, but it's your choice.

Oh, why do you hate OSS4 so much?

I don't hate anything or anyone. I just don't think OSS4 is a serious option, especially not on Linux. On Linux, it is also completely redundant due to ALSA.

You idiot, you have no clue!

You are right, I totally don't. But that doesn't hinder me from recommending things. Ha!

Hey I wrote/know this tiny new project which is an awesome abstraction layer for audio/media!

Sorry, that's not sufficient. I only list software here that is known to be sufficiently relevant and sufficiently well maintained.

### Final Words

Of course these recommendations are very basic and are only intended to lead into the right direction. For each use-case different necessities apply and hence options that I did not consider here might become viable. It's up to you to decide how much of what I wrote here actually applies to your application.

This summary only includes software systems that are considered stable and universally available at the time of writing. In the future I hope to introduce a more suitable and portable replacement for the _safe_ ALSA subset of functions. I plan to update this text from time to time to keep things up-to-date.

If you feel that I forgot a use case or an important API, then please contact me or leave a comment. However, I think the summary above is sufficiently comprehensive and if an entry is missing I most likely deliberately left it out.

(Also note that I am upstream for both PulseAudio and libcanberra and did some minor contributions to ALSA, GStreamer and some other of the systems listed above. Yes, I am biased.)

Oh, and please syndicate this, digg it. I'd like to see this guide to be well-known all around the Linux community. Thank you!



# links
[Read on Omnivore](https://omnivore.app/me/a-guide-through-the-linux-sound-api-jungle-18b3ee4002a)
[Read Original](https://0pointer.de/blog/projects/guide-to-sound-apis.html)

<iframe src="https://0pointer.de/blog/projects/guide-to-sound-apis.html"  width="800" height="500"></iframe>
