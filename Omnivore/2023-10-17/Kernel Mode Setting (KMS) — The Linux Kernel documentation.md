---
id: 76ecc618-6d1a-11ee-b9ac-37db18cb6eda
title: Kernel Mode Setting (KMS) — The Linux Kernel documentation
tags:
  - programing
  - game_engine
  - linux
date: 2023-10-17 21:24:51
words_count: 39665
state: INBOX
---

# Kernel Mode Setting (KMS) — The Linux Kernel documentation by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Drivers must initialize the mode setting core by calling
drm_mode_config_init() on the DRM device. The function
initializes the struct drm_device
mode_config field and never fails. Once done, mode configuration must
be setup by initializing the following fields.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Drivers must initialize the mode setting core by calling[drm\_mode\_config\_init()](#c.drm%5Fmode%5Fconfig%5Finit "drm_mode_config_init") on the DRM device. The function initializes the `struct drm_device`mode\_config field and never fails. Once done, mode configuration must be setup by initializing the following fields.

* int min\_width, min\_height; int max\_width, max\_height; Minimum and maximum width and height of the frame buffers in pixel units.
* struct drm\_mode\_config\_funcs \*funcs; Mode setting functions.

## Overview[¶](#overview "Permalink to this headline")

![KMS Display Pipeline](https://proxy-prod.omnivore-image-cache.app/0x0,s7D3xlHe642DjsnJIDPfHa4lp1i742CV_AwKQxY-HCRc/https://www.kernel.org/doc/html/v4.15/_images/DOT-dade12aa9127c64406e41cdf8d7f80694c134db2.svg)

KMS Display Pipeline Overview

The basic object structure KMS presents to userspace is fairly simple. Framebuffers (represented by [struct drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer"), see [Frame Buffer Abstraction](#frame-buffer-abstraction)) feed into planes. One or more (or even no) planes feed their pixel data into a CRTC (represented by [structdrm\_crtc](#c.drm%5Fcrtc "drm_crtc"), see [CRTC Abstraction](#crtc-abstraction)) for blending. The precise blending step is explained in more detail in [Plane Composition Properties](#plane-composition-properties) and related chapters.

For the output routing the first step is encoders (represented by[struct drm\_encoder](#c.drm%5Fencoder "drm_encoder"), see [Encoder Abstraction](#encoder-abstraction)). Those are really just internal artifacts of the helper libraries used to implement KMS drivers. Besides that they make it unecessarily more complicated for userspace to figure out which connections between a CRTC and a connector are possible, and what kind of cloning is supported, they serve no purpose in the userspace API. Unfortunately encoders have been exposed to userspace, hence can’t remove them at this point. Futhermore the exposed restrictions are often wrongly set by drivers, and in many cases not powerful enough to express the real restrictions. A CRTC can be connected to multiple encoders, and for an active CRTC there must be at least one encoder.

The final, and real, endpoint in the display chain is the connector (represented by [struct drm\_connector](#c.drm%5Fconnector "drm_connector"), see [Connector Abstraction](#connector-abstraction)). Connectors can have different possible encoders, but the kernel driver selects which encoder to use for each connector. The use case is DVI, which could switch between an analog and a digital encoder. Encoders can also drive multiple different connectors. There is exactly one active connector for every active encoder.

Internally the output pipeline is a bit more complex and matches today’s hardware more closely:

![KMS Output Pipeline](https://proxy-prod.omnivore-image-cache.app/0x0,sdVHDfrEY55LBcfQm2Pi6gbPfEA8XfwaZ9n813huA36g/https://www.kernel.org/doc/html/v4.15/_images/DOT-6445c75fc4859992454fd377127d4d309e82f09a.svg)

KMS Output Pipeline

Internally two additional helper objects come into play. First, to be able to share code for encoders (sometimes on the same SoC, sometimes off-chip) one or more [Bridges](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#drm-bridges) (represented by [struct drm\_bridge](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fbridge "drm_bridge")) can be linked to an encoder. This link is static and cannot be changed, which means the cross-bar (if there is any) needs to be mapped between the CRTC and any encoders. Often for drivers with bridges there’s no code left at the encoder level. Atomic drivers can leave out all the encoder callbacks to essentially only leave a dummy routing object behind, which is needed for backwards compatibility since encoders are exposed to userspace.

The second object is for panels, represented by [struct drm\_panel](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fpanel "drm_panel"), see [Panel Helper Reference](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#drm-panel-helper). Panels do not have a fixed binding point, but are generally linked to the driver private structure that embeds[struct drm\_connector](#c.drm%5Fconnector "drm_connector").

Note that currently the bridge chaining and interactions with connectors and panels are still in-flux and not really fully sorted out yet.

## KMS Core Structures and Functions[¶](#kms-core-structures-and-functions "Permalink to this headline")

struct `drm_mode_config_funcs`[¶](#c.drm%5Fmode%5Fconfig%5Ffuncs "Permalink to this definition")

basic driver provided mode setting functions

**Definition**

struct drm_mode_config_funcs {
  struct drm_framebuffer *(* fb_create) (struct drm_device *dev,struct drm_file *file_priv, const struct drm_mode_fb_cmd2 *mode_cmd);
  const struct drm_format_info *(* get_format_info) (const struct drm_mode_fb_cmd2 *mode_cmd);
  void (* output_poll_changed) (struct drm_device *dev);
  int (* atomic_check) (struct drm_device *dev, struct drm_atomic_state *state);
  int (* atomic_commit) (struct drm_device *dev,struct drm_atomic_state *state, bool nonblock);
  struct drm_atomic_state *(* atomic_state_alloc) (struct drm_device *dev);
  void (* atomic_state_clear) (struct drm_atomic_state *state);
  void (* atomic_state_free) (struct drm_atomic_state *state);
};

**Members**

`fb_create`

Create a new framebuffer object. The core does basic checks on the requested metadata, but most of that is left to the driver. See`struct drm_mode_fb_cmd2` for details.

If the parameters are deemed valid and the backing storage objects in the underlying memory manager all exist, then the driver allocates a new [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") structure, subclassed to contain driver-specific information (like the internal native buffer object references). It also needs to fill out all relevant metadata, which should be done by calling [drm\_helper\_mode\_fill\_fb\_struct()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fhelper%5Fmode%5Ffill%5Ffb%5Fstruct "drm_helper_mode_fill_fb_struct").

The initialization is finalized by calling [drm\_framebuffer\_init()](#c.drm%5Fframebuffer%5Finit "drm_framebuffer_init"), which registers the framebuffer and makes it accessible to other threads.

RETURNS:

A new framebuffer with an initial reference count of 1 or a negative error code encoded with `ERR_PTR()`.

`get_format_info`

Allows a driver to return custom format information for special fb layouts (eg. ones with auxiliary compression control planes).

RETURNS:

The format information specific to the given fb metadata, or NULL if none is found.

`output_poll_changed`

Callback used by helpers to inform the driver of output configuration changes.

Drivers implementing fbdev emulation with the helpers can call drm\_fb\_helper\_hotplug\_changed from this hook to inform the fbdev helper of output changes.

FIXME:

Except that there’s no vtable for device-level helper callbacks there’s no reason this is a core function.

`atomic_check`

This is the only hook to validate an atomic modeset update. This function must reject any modeset and state changes which the hardware or driver doesn’t support. This includes but is of course not limited to:

> * Checking that the modes, framebuffers, scaling and placement requirements and so on are within the limits of the hardware.
> * Checking that any hidden shared resources are not oversubscribed. This can be shared PLLs, shared lanes, overall memory bandwidth, display fifo space (where shared between planes or maybe even CRTCs).
> * Checking that virtualized resources exported to userspace are not oversubscribed. For various reasons it can make sense to expose more planes, crtcs or encoders than which are physically there. One example is dual-pipe operations (which generally should be hidden from userspace if when lockstepped in hardware, exposed otherwise), where a plane might need 1 hardware plane (if it’s just on one pipe), 2 hardware planes (when it spans both pipes) or maybe even shared a hardware plane with a 2nd plane (if there’s a compatible plane requested on the area handled by the other pipe).
> * Check that any transitional state is possible and that if requested, the update can indeed be done in the vblank period without temporarily disabling some functions.
> * Check any other constraints the driver or hardware might have.
> * This callback also needs to correctly fill out the [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state")in this update to make sure that [drm\_atomic\_crtc\_needs\_modeset()](#c.drm%5Fatomic%5Fcrtc%5Fneeds%5Fmodeset "drm_atomic_crtc_needs_modeset")reflects the nature of the possible update and returns true if and only if the update cannot be applied without tearing within one vblank on that CRTC. The core uses that information to reject updates which require a full modeset (i.e. blanking the screen, or at least pausing updates for a substantial amount of time) if userspace has disallowed that in its request.
> * The driver also does not need to repeat basic input validation like done for the corresponding legacy entry points. The core does that before calling this hook.

See the documentation of **atomic\_commit** for an exhaustive list of error conditions which don’t have to be checked at the in this callback.

See the documentation for [struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") for how exactly an atomic modeset update is described.

Drivers using the atomic helpers can implement this hook using[drm\_atomic\_helper\_check()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fcheck "drm_atomic_helper_check"), or one of the exported sub-functions of it.

RETURNS:

0 on success or one of the below negative error codes:

> * \-EINVAL, if any of the above constraints are violated.
> * \-EDEADLK, when returned from an attempt to acquire an additional[drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") through [drm\_modeset\_lock()](#c.drm%5Fmodeset%5Flock "drm_modeset_lock").
> * \-ENOMEM, if allocating additional state sub-structures failed due to lack of memory.
> * \-EINTR, -EAGAIN or -ERESTARTSYS, if the IOCTL should be restarted. This can either be due to a pending signal, or because the driver needs to completely bail out to recover from an exceptional situation like a GPU hang. From a userspace point all errors are treated equally.

`atomic_commit`

This is the only hook to commit an atomic modeset update. The core guarantees that **atomic\_check** has been called successfully before calling this function, and that nothing has been changed in the interim.

See the documentation for [struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") for how exactly an atomic modeset update is described.

Drivers using the atomic helpers can implement this hook using[drm\_atomic\_helper\_commit()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fcommit "drm_atomic_helper_commit"), or one of the exported sub-functions of it.

Nonblocking commits (as indicated with the nonblock parameter) must do any preparatory work which might result in an unsuccessful commit in the context of this callback. The only exceptions are hardware errors resulting in -EIO. But even in that case the driver must ensure that the display pipe is at least running, to avoid compositors crashing when pageflips don’t work. Anything else, specifically committing the update to the hardware, should be done without blocking the caller. For updates which do not require a modeset this must be guaranteed.

The driver must wait for any pending rendering to the new framebuffers to complete before executing the flip. It should also wait for any pending rendering from other drivers if the underlying buffer is a shared dma-buf. Nonblocking commits must not wait for rendering in the context of this callback.

An application can request to be notified when the atomic commit has completed. These events are per-CRTC and can be distinguished by the CRTC index supplied in `drm_event` to userspace.

The drm core will supply a `struct drm_event` in each CRTC’s[drm\_crtc\_state.event](#c.drm%5Fcrtc%5Fstate "drm_crtc_state"). See the documentation for[drm\_crtc\_state.event](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") for more details about the precise semantics of this event.

NOTE:

Drivers are not allowed to shut down any display pipe successfully enabled through an atomic commit on their own. Doing so can result in compositors crashing if a page flip is suddenly rejected because the pipe is off.

RETURNS:

0 on success or one of the below negative error codes:

> * \-EBUSY, if a nonblocking updated is requested and there is an earlier updated pending. Drivers are allowed to support a queue of outstanding updates, but currently no driver supports that. Note that drivers must wait for preceding updates to complete if a synchronous update is requested, they are not allowed to fail the commit in that case.
> * \-ENOMEM, if the driver failed to allocate memory. Specifically this can happen when trying to pin framebuffers, which must only be done when committing the state.
> * \-ENOSPC, as a refinement of the more generic -ENOMEM to indicate that the driver has run out of vram, iommu space or similar GPU address space needed for framebuffer.
> * \-EIO, if the hardware completely died.
> * \-EINTR, -EAGAIN or -ERESTARTSYS, if the IOCTL should be restarted. This can either be due to a pending signal, or because the driver needs to completely bail out to recover from an exceptional situation like a GPU hang. From a userspace point of view all errors are treated equally.

This list is exhaustive. Specifically this hook is not allowed to return -EINVAL (any invalid requests should be caught in**atomic\_check**) or -EDEADLK (this function must not acquire additional modeset locks).

`atomic_state_alloc`

This optional hook can be used by drivers that want to subclass struct[drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") to be able to track their own driver-private global state easily. If this hook is implemented, drivers must also implement **atomic\_state\_clear** and **atomic\_state\_free**.

RETURNS:

A new [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") on success or NULL on failure.

`atomic_state_clear`

This hook must clear any driver private state duplicated into the passed-in [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state"). This hook is called when the caller encountered a [drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") deadlock and needs to drop all already acquired locks as part of the deadlock avoidance dance implemented in [drm\_modeset\_backoff()](#c.drm%5Fmodeset%5Fbackoff "drm_modeset_backoff").

Any duplicated state must be invalidated since a concurrent atomic update might change it, and the drm atomic interfaces always apply updates as relative changes to the current state.

Drivers that implement this must call [drm\_atomic\_state\_default\_clear()](#c.drm%5Fatomic%5Fstate%5Fdefault%5Fclear "drm_atomic_state_default_clear")to clear common state.

`atomic_state_free`

This hook needs driver private resources and the [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state")itself. Note that the core first calls [drm\_atomic\_state\_clear()](#c.drm%5Fatomic%5Fstate%5Fclear "drm_atomic_state_clear") to avoid code duplicate between the clear and free hooks.

Drivers that implement this must call[drm\_atomic\_state\_default\_release()](#c.drm%5Fatomic%5Fstate%5Fdefault%5Frelease "drm_atomic_state_default_release") to release common resources.

**Description**

Some global (i.e. not per-CRTC, connector, etc) mode setting functions that involve drivers.

struct `drm_mode_config`[¶](#c.drm%5Fmode%5Fconfig "Permalink to this definition")

Mode configuration control structure

**Definition**

struct drm_mode_config {
  struct mutex mutex;
  struct drm_modeset_lock connection_mutex;
  struct drm_modeset_acquire_ctx * acquire_ctx;
  struct mutex idr_mutex;
  struct idr crtc_idr;
  struct idr tile_idr;
  struct mutex fb_lock;
  int num_fb;
  struct list_head fb_list;
  spinlock_t connector_list_lock;
  int num_connector;
  struct ida connector_ida;
  struct list_head connector_list;
  struct llist_head connector_free_list;
  struct work_struct connector_free_work;
  int num_encoder;
  struct list_head encoder_list;
  int num_total_plane;
  struct list_head plane_list;
  int num_crtc;
  struct list_head crtc_list;
  struct list_head property_list;
  int min_width;
  int min_height;
  int max_width;
  int max_height;
  const struct drm_mode_config_funcs * funcs;
  resource_size_t fb_base;
  bool poll_enabled;
  bool poll_running;
  bool delayed_event;
  struct delayed_work output_poll_work;
  struct mutex blob_lock;
  struct list_head property_blob_list;
  struct drm_property * edid_property;
  struct drm_property * dpms_property;
  struct drm_property * path_property;
  struct drm_property * tile_property;
  struct drm_property * link_status_property;
  struct drm_property * plane_type_property;
  struct drm_property * prop_src_x;
  struct drm_property * prop_src_y;
  struct drm_property * prop_src_w;
  struct drm_property * prop_src_h;
  struct drm_property * prop_crtc_x;
  struct drm_property * prop_crtc_y;
  struct drm_property * prop_crtc_w;
  struct drm_property * prop_crtc_h;
  struct drm_property * prop_fb_id;
  struct drm_property * prop_in_fence_fd;
  struct drm_property * prop_out_fence_ptr;
  struct drm_property * prop_crtc_id;
  struct drm_property * prop_active;
  struct drm_property * prop_mode_id;
  struct drm_property * dvi_i_subconnector_property;
  struct drm_property * dvi_i_select_subconnector_property;
  struct drm_property * tv_subconnector_property;
  struct drm_property * tv_select_subconnector_property;
  struct drm_property * tv_mode_property;
  struct drm_property * tv_left_margin_property;
  struct drm_property * tv_right_margin_property;
  struct drm_property * tv_top_margin_property;
  struct drm_property * tv_bottom_margin_property;
  struct drm_property * tv_brightness_property;
  struct drm_property * tv_contrast_property;
  struct drm_property * tv_flicker_reduction_property;
  struct drm_property * tv_overscan_property;
  struct drm_property * tv_saturation_property;
  struct drm_property * tv_hue_property;
  struct drm_property * scaling_mode_property;
  struct drm_property * aspect_ratio_property;
  struct drm_property * degamma_lut_property;
  struct drm_property * degamma_lut_size_property;
  struct drm_property * ctm_property;
  struct drm_property * gamma_lut_property;
  struct drm_property * gamma_lut_size_property;
  struct drm_property * suggested_x_property;
  struct drm_property * suggested_y_property;
  struct drm_property * non_desktop_property;
  uint32_t preferred_depth;
  uint32_t prefer_shadow;
  bool async_page_flip;
  bool allow_fb_modifiers;
  uint32_t cursor_width;
  uint32_t cursor_height;
  const struct drm_mode_config_helper_funcs * helper_private;
};

**Members**

`mutex`

This is the big scary modeset BKL which protects everything that isn’t protect otherwise. Scope is unclear and fuzzy, try to remove anything from under it’s protection and move it into more well-scoped locks.

The one important thing this protects is the use of **acquire\_ctx**.

`connection_mutex`

This protects connector state and the connector to encoder to CRTC routing chain.

For atomic drivers specifically this protects [drm\_connector.state](#c.drm%5Fconnector "drm_connector").

`acquire_ctx`

Global implicit acquire context used by atomic drivers for legacy IOCTLs. Deprecated, since implicit locking contexts make it impossible to use driver-private [struct drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock"). Users of this must hold **mutex**.

`idr_mutex`

Mutex for KMS ID allocation and management. Protects both **crtc\_idr**and **tile\_idr**.

`crtc_idr`

Main KMS ID tracking object. Use this idr for all IDs, fb, crtc, connector, modes - just makes life easier to have only one.

`tile_idr`

Use this idr for allocating new IDs for tiled sinks like use in some high-res DP MST screens.

`fb_lock`

Mutex to protect fb the global **fb\_list** and **num\_fb**.

`num_fb`

Number of entries on **fb\_list**.

`fb_list`

List of all [struct drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer").

`connector_list_lock`

Protects **num\_connector** and**connector\_list** and **connector\_free\_list**.

`num_connector`

Number of connectors on this device. Protected by**connector\_list\_lock**.

`connector_ida`

ID allocator for connector indices.

`connector_list`

List of connector objects linked with [drm\_connector.head](#c.drm%5Fconnector "drm_connector"). Protected by **connector\_list\_lock**. Only use [drm\_for\_each\_connector\_iter()](#c.drm%5Ffor%5Feach%5Fconnector%5Fiter "drm_for_each_connector_iter") and[struct drm\_connector\_list\_iter](#c.drm%5Fconnector%5Flist%5Fiter "drm_connector_list_iter") to walk this list.

`connector_free_list`

List of connector objects linked with [drm\_connector.free\_head](#c.drm%5Fconnector "drm_connector"). Protected by **connector\_list\_lock**. Used by[drm\_for\_each\_connector\_iter()](#c.drm%5Ffor%5Feach%5Fconnector%5Fiter "drm_for_each_connector_iter") and[struct drm\_connector\_list\_iter](#c.drm%5Fconnector%5Flist%5Fiter "drm_connector_list_iter") to savely free connectors using**connector\_free\_work**.

`connector_free_work`

Work to clean up **connector\_free\_list**.

`num_encoder`

Number of encoders on this device. This is invariant over the lifetime of a device and hence doesn’t need any locks.

`encoder_list`

List of encoder objects linked with [drm\_encoder.head](#c.drm%5Fencoder "drm_encoder"). This is invariant over the lifetime of a device and hence doesn’t need any locks.

`num_total_plane`

Number of universal (i.e. with primary/curso) planes on this device. This is invariant over the lifetime of a device and hence doesn’t need any locks.

`plane_list`

List of plane objects linked with [drm\_plane.head](#c.drm%5Fplane "drm_plane"). This is invariant over the lifetime of a device and hence doesn’t need any locks.

`num_crtc`

Number of CRTCs on this device linked with [drm\_crtc.head](#c.drm%5Fcrtc "drm_crtc"). This is invariant over the lifetime of a device and hence doesn’t need any locks.

`crtc_list`

List of CRTC objects linked with [drm\_crtc.head](#c.drm%5Fcrtc "drm_crtc"). This is invariant over the lifetime of a device and hence doesn’t need any locks.

`property_list`

List of property type objects linked with [drm\_property.head](#c.drm%5Fproperty "drm_property"). This is invariant over the lifetime of a device and hence doesn’t need any locks.

`min_width`

minimum pixel width on this device

`min_height`

minimum pixel height on this device

`max_width`

maximum pixel width on this device

`max_height`

maximum pixel height on this device

`funcs`

core driver provided mode setting functions

`fb_base`

base address of the framebuffer

`poll_enabled`

track polling support for this device

`poll_running`

track polling status for this device

`delayed_event`

track delayed poll uevent deliver for this device

`output_poll_work`

delayed work for polling in process context

`blob_lock`

Mutex for blob property allocation and management, protects**property\_blob\_list** and [drm\_file.blobs](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file").

`property_blob_list`

List of all the blob property objects linked with[drm\_property\_blob.head](#c.drm%5Fproperty%5Fblob "drm_property_blob"). Protected by **blob\_lock**.

`edid_property`

Default connector property to hold the EDID of the currently connected sink, if any.

`dpms_property`

Default connector property to control the connector’s DPMS state.

`path_property`

Default connector property to hold the DP MST path for the port.

`tile_property`

Default connector property to store the tile position of a tiled screen, for sinks which need to be driven with multiple CRTCs.

`link_status_property`

Default connector property for link status of a connector

`plane_type_property`

Default plane property to differentiate CURSOR, PRIMARY and OVERLAY legacy uses of planes.

`prop_src_x`

Default atomic plane property for the plane source position in the connected [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer").

`prop_src_y`

Default atomic plane property for the plane source position in the connected [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer").

`prop_src_w`

Default atomic plane property for the plane source position in the connected [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer").

`prop_src_h`

Default atomic plane property for the plane source position in the connected [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer").

`prop_crtc_x`

Default atomic plane property for the plane destination position in the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") is is being shown on.

`prop_crtc_y`

Default atomic plane property for the plane destination position in the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") is is being shown on.

`prop_crtc_w`

Default atomic plane property for the plane destination position in the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") is is being shown on.

`prop_crtc_h`

Default atomic plane property for the plane destination position in the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") is is being shown on.

`prop_fb_id`

Default atomic plane property to specify the[drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer").

`prop_in_fence_fd`

Sync File fd representing the incoming fences for a Plane.

`prop_out_fence_ptr`

Sync File fd pointer representing the outgoing fences for a CRTC. Userspace should provide a pointer to a value of type s32, and then cast that pointer to u64.

`prop_crtc_id`

Default atomic plane property to specify the[drm\_crtc](#c.drm%5Fcrtc "drm_crtc").

`prop_active`

Default atomic CRTC property to control the active state, which is the simplified implementation for DPMS in atomic drivers.

`prop_mode_id`

Default atomic CRTC property to set the mode for a CRTC. A 0 mode implies that the CRTC is entirely disabled - all connectors must be of and active must be set to disabled, too.

`dvi_i_subconnector_property`

Optional DVI-I property to differentiate between analog or digital mode.

`dvi_i_select_subconnector_property`

Optional DVI-I property to select between analog or digital mode.

`tv_subconnector_property`

Optional TV property to differentiate between different TV connector types.

`tv_select_subconnector_property`

Optional TV property to select between different TV connector types.

`tv_mode_property`

Optional TV property to select the output TV mode.

`tv_left_margin_property`

Optional TV property to set the left margin.

`tv_right_margin_property`

Optional TV property to set the right margin.

`tv_top_margin_property`

Optional TV property to set the right margin.

`tv_bottom_margin_property`

Optional TV property to set the right margin.

`tv_brightness_property`

Optional TV property to set the brightness.

`tv_contrast_property`

Optional TV property to set the contrast.

`tv_flicker_reduction_property`

Optional TV property to control the flicker reduction mode.

`tv_overscan_property`

Optional TV property to control the overscan setting.

`tv_saturation_property`

Optional TV property to set the saturation.

`tv_hue_property`

Optional TV property to set the hue.

`scaling_mode_property`

Optional connector property to control the upscaling, mostly used for built-in panels.

`aspect_ratio_property`

Optional connector property to control the HDMI infoframe aspect ratio setting.

`degamma_lut_property`

Optional CRTC property to set the LUT used to convert the framebuffer’s colors to linear gamma.

`degamma_lut_size_property`

Optional CRTC property for the size of the degamma LUT as supported by the driver (read-only).

`ctm_property`

Optional CRTC property to set the matrix used to convert colors after the lookup in the degamma LUT.

`gamma_lut_property`

Optional CRTC property to set the LUT used to convert the colors, after the CTM matrix, to the gamma space of the connected screen.

`gamma_lut_size_property`

Optional CRTC property for the size of the gamma LUT as supported by the driver (read-only).

`suggested_x_property`

Optional connector property with a hint for the position of the output on the host’s screen.

`suggested_y_property`

Optional connector property with a hint for the position of the output on the host’s screen.

`non_desktop_property`

Optional connector property with a hint that device isn’t a standard display, and the console/desktop, should not be displayed on it.

`preferred_depth`

preferred RBG pixel depth, used by fb helpers

`prefer_shadow`

hint to userspace to prefer shadow-fb rendering

`async_page_flip`

Does this device support async flips on the primary plane?

`allow_fb_modifiers`

Whether the driver supports fb modifiers in the ADDFB2.1 ioctl call.

`cursor_width`

hint to userspace for max cursor width

`cursor_height`

hint to userspace for max cursor height

`helper_private`

mid-layer private data

**Description**

Core mode resource tracking structure. All CRTC, encoders, and connectors enumerated by the driver are added here, as are global properties. Some global restrictions are also here, e.g. dimension restrictions.

void `drm_mode_config_reset`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmode%5Fconfig%5Freset "Permalink to this definition")

call ->reset callbacks

**Parameters**

`struct drm_device * dev`

drm device

**Description**

This functions calls all the crtc’s, encoder’s and connector’s ->reset callback. Drivers can use this in e.g. their driver load or resume code to reset hardware and software state.

void `drm_mode_config_init`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmode%5Fconfig%5Finit "Permalink to this definition")

initialize DRM mode\_configuration structure

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

Initialize **dev**‘s mode\_config structure, used for tracking the graphics configuration of **dev**.

Since this initializes the modeset locks, no locking is possible. Which is no problem, since this should happen single threaded at init time. It is the driver’s problem to ensure this guarantee.

void `drm_mode_config_cleanup`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmode%5Fconfig%5Fcleanup "Permalink to this definition")

free up DRM mode\_config info

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

Free up all the connectors and CRTCs associated with this DRM device, then free up the framebuffers and associated buffer objects.

Note that since this /should/ happen single-threaded at driver/device teardown time, no locking is required. It’s the driver’s job to ensure that this guarantee actually holds true.

FIXME: cleanup any dangling user buffer objects too

## Modeset Base Object Abstraction[¶](#modeset-base-object-abstraction "Permalink to this headline")

![Mode Objects and Properties](https://proxy-prod.omnivore-image-cache.app/0x0,sVkvt3FNCe1LXQxA4q2ZAgQfWljv6qagZPo0QL3Y2Z84/https://www.kernel.org/doc/html/v4.15/_images/DOT-1eee3f74bb2de20b2b68c4aa6c9c1cabe5078857.svg)

Mode Objects and Properties

The base structure for all KMS objects is [struct drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object"). One of the base services it provides is tracking properties, which are especially important for the atomic IOCTL (see [Atomic Mode Setting](#atomic-mode-setting)). The somewhat surprising part here is that properties are not directly instantiated on each object, but free-standing mode objects themselves, represented by [struct drm\_property](#c.drm%5Fproperty "drm_property"), which only specify the type and value range of a property. Any given property can be attached multiple times to different objects using [drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property").

struct `drm_mode_object`[¶](#c.drm%5Fmode%5Fobject "Permalink to this definition")

base structure for modeset objects

**Definition**

struct drm_mode_object {
  uint32_t id;
  uint32_t type;
  struct drm_object_properties * properties;
  struct kref refcount;
  void (* free_cb) (struct kref *kref);
};

**Members**

`id`

userspace visible identifier

`type`

type of the object, one of DRM\_MODE\_OBJECT\_\*

`properties`

properties attached to this object, including values

`refcount`

reference count for objects which with dynamic lifetime

`free_cb`

free function callback, only set for objects with dynamic lifetime

**Description**

Base structure for modeset objects visible to userspace. Objects can be looked up using [drm\_mode\_object\_find()](#c.drm%5Fmode%5Fobject%5Ffind "drm_mode_object_find"). Besides basic uapi interface properties like **id** and **type** it provides two services:

* It tracks attached properties and their values. This is used by [drm\_crtc](#c.drm%5Fcrtc "drm_crtc"),[drm\_plane](#c.drm%5Fplane "drm_plane") and [drm\_connector](#c.drm%5Fconnector "drm_connector"). Properties are attached by calling[drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property") before the object is visible to userspace.
* For objects with dynamic lifetimes (as indicated by a non-NULL **free\_cb**) it provides reference counting through [drm\_mode\_object\_get()](#c.drm%5Fmode%5Fobject%5Fget "drm_mode_object_get") and[drm\_mode\_object\_put()](#c.drm%5Fmode%5Fobject%5Fput "drm_mode_object_put"). This is used by [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer"), [drm\_connector](#c.drm%5Fconnector "drm_connector")and [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob"). These objects provide specialized reference counting wrappers.

struct `drm_object_properties`[¶](#c.drm%5Fobject%5Fproperties "Permalink to this definition")

property tracking for [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object")

**Definition**

struct drm_object_properties {
  int count;
  struct drm_property * properties;
  uint64_t values;
};

**Members**

`count`

number of valid properties, must be less than or equal to DRM\_OBJECT\_MAX\_PROPERTY.

`properties`

Array of pointers to [drm\_property](#c.drm%5Fproperty "drm_property").

NOTE: if we ever start dynamically destroying properties (ie. not at [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup") time), then we’d have to do a better job of detaching property from mode objects to avoid dangling property pointers:

`values`

Array to store the property values, matching **properties**. Do not read/write values directly, but use[drm\_object\_property\_get\_value()](#c.drm%5Fobject%5Fproperty%5Fget%5Fvalue "drm_object_property_get_value") and [drm\_object\_property\_set\_value()](#c.drm%5Fobject%5Fproperty%5Fset%5Fvalue "drm_object_property_set_value").

Note that atomic drivers do not store mutable properties in this array, but only the decoded values in the corresponding state structure. The decoding is done using the [drm\_crtc.atomic\_get\_property](#c.drm%5Fcrtc "drm_crtc") and[drm\_crtc.atomic\_set\_property](#c.drm%5Fcrtc "drm_crtc") hooks for [struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc"). For[struct drm\_plane](#c.drm%5Fplane "drm_plane") the hooks are [drm\_plane\_funcs.atomic\_get\_property](#c.drm%5Fplane%5Ffuncs "drm_plane_funcs") and[drm\_plane\_funcs.atomic\_set\_property](#c.drm%5Fplane%5Ffuncs "drm_plane_funcs"). And for [struct drm\_connector](#c.drm%5Fconnector "drm_connector")the hooks are [drm\_connector\_funcs.atomic\_get\_property](#c.drm%5Fconnector%5Ffuncs "drm_connector_funcs") and[drm\_connector\_funcs.atomic\_set\_property](#c.drm%5Fconnector%5Ffuncs "drm_connector_funcs") .

Hence atomic drivers should not use [drm\_object\_property\_set\_value()](#c.drm%5Fobject%5Fproperty%5Fset%5Fvalue "drm_object_property_set_value")and [drm\_object\_property\_get\_value()](#c.drm%5Fobject%5Fproperty%5Fget%5Fvalue "drm_object_property_get_value") on mutable objects, i.e. those without the DRM\_MODE\_PROP\_IMMUTABLE flag set.

void `drm_mode_object_reference`(struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* _obj_)[¶](#c.drm%5Fmode%5Fobject%5Freference "Permalink to this definition")

acquire a mode object reference

**Parameters**

`struct drm_mode_object * obj`

DRM mode object

**Description**

This is a compatibility alias for [drm\_mode\_object\_get()](#c.drm%5Fmode%5Fobject%5Fget "drm_mode_object_get") and should not be used by new code.

void `drm_mode_object_unreference`(struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* _obj_)[¶](#c.drm%5Fmode%5Fobject%5Funreference "Permalink to this definition")

release a mode object reference

**Parameters**

`struct drm_mode_object * obj`

DRM mode object

**Description**

This is a compatibility alias for [drm\_mode\_object\_put()](#c.drm%5Fmode%5Fobject%5Fput "drm_mode_object_put") and should not be used by new code.

struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* `drm_mode_object_find`(struct drm\_device \* _dev_, struct [drm\_file](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file") \* _file\_priv_, uint32\_t _id_, uint32\_t _type_)[¶](#c.drm%5Fmode%5Fobject%5Ffind "Permalink to this definition")

look up a drm object with static lifetime

**Parameters**

`struct drm_device * dev`

drm device

`struct drm_file * file_priv`

drm file

`uint32_t id`

id of the mode object

`uint32_t type`

type of the mode object

**Description**

This function is used to look up a modeset object. It will acquire a reference for reference counted objects. This reference must be dropped again by callind [drm\_mode\_object\_put()](#c.drm%5Fmode%5Fobject%5Fput "drm_mode_object_put").

void `drm_mode_object_put`(struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* _obj_)[¶](#c.drm%5Fmode%5Fobject%5Fput "Permalink to this definition")

release a mode object reference

**Parameters**

`struct drm_mode_object * obj`

DRM mode object

**Description**

This function decrements the object’s refcount if it is a refcounted modeset object. It is a no-op on any other object. This is used to drop references acquired with [drm\_mode\_object\_get()](#c.drm%5Fmode%5Fobject%5Fget "drm_mode_object_get").

void `drm_mode_object_get`(struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* _obj_)[¶](#c.drm%5Fmode%5Fobject%5Fget "Permalink to this definition")

acquire a mode object reference

**Parameters**

`struct drm_mode_object * obj`

DRM mode object

**Description**

This function increments the object’s refcount if it is a refcounted modeset object. It is a no-op on any other object. References should be dropped again by calling [drm\_mode\_object\_put()](#c.drm%5Fmode%5Fobject%5Fput "drm_mode_object_put").

void `drm_object_attach_property`(struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* _obj_, struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _property_, uint64\_t _init\_val_)[¶](#c.drm%5Fobject%5Fattach%5Fproperty "Permalink to this definition")

attach a property to a modeset object

**Parameters**

`struct drm_mode_object * obj`

drm modeset object

`struct drm_property * property`

property to attach

`uint64_t init_val`

initial value of the property

**Description**

This attaches the given property to the modeset object with the given initial value. Currently this function cannot fail since the properties are stored in a statically sized array.

int `drm_object_property_set_value`(struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* _obj_, struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _property_, uint64\_t _val_)[¶](#c.drm%5Fobject%5Fproperty%5Fset%5Fvalue "Permalink to this definition")

set the value of a property

**Parameters**

`struct drm_mode_object * obj`

drm mode object to set property value for

`struct drm_property * property`

property to set

`uint64_t val`

value the property should be set to

**Description**

This function sets a given property on a given object. This function only changes the software state of the property, it does not call into the driver’s ->set\_property callback.

Note that atomic drivers should not have any need to call this, the core will ensure consistency of values reported back to userspace through the appropriate ->atomic\_get\_property callback. Only legacy drivers should call this function to update the tracked value (after clamping and other restrictions have been applied).

**Return**

Zero on success, error code on failure.

int `drm_object_property_get_value`(struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* _obj_, struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _property_, uint64\_t \* _val_)[¶](#c.drm%5Fobject%5Fproperty%5Fget%5Fvalue "Permalink to this definition")

retrieve the value of a property

**Parameters**

`struct drm_mode_object * obj`

drm mode object to get property value from

`struct drm_property * property`

property to retrieve

`uint64_t * val`

storage for the property value

**Description**

This function retrieves the softare state of the given property for the given property. Since there is no driver callback to retrieve the current property value this might be out of sync with the hardware, depending upon the driver and property.

Atomic drivers should never call this function directly, the core will read out property values through the various ->atomic\_get\_property callbacks.

**Return**

Zero on success, error code on failure.

## Atomic Mode Setting[¶](#atomic-mode-setting "Permalink to this headline")

![Mode Objects and Properties](https://proxy-prod.omnivore-image-cache.app/0x0,sz2ss0PI5FIlsn45o3crkNn2H_lAzkq1IkF_P_mku4zc/https://www.kernel.org/doc/html/v4.15/_images/DOT-69c6997054dbfdfb0892fa0cab076cfd8074c7ed.svg)

Mode Objects and Properties

Atomic provides transactional modeset (including planes) updates, but a bit differently from the usual transactional approach of try-commit and rollback:

* Firstly, no hardware changes are allowed when the commit would fail. This allows us to implement the DRM\_MODE\_ATOMIC\_TEST\_ONLY mode, which allows userspace to explore whether certain configurations would work or not.
* This would still allow setting and rollback of just the software state, simplifying conversion of existing drivers. But auditing drivers for correctness of the atomic\_check code becomes really hard with that: Rolling back changes in data structures all over the place is hard to get right.
* Lastly, for backwards compatibility and to support all use-cases, atomic updates need to be incremental and be able to execute in parallel. Hardware doesn’t always allow it, but where possible plane updates on different CRTCs should not interfere, and not get stalled due to output routing changing on different CRTCs.

Taken all together there’s two consequences for the atomic design:

* The overall state is split up into per-object state structures:[struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") for planes, [structdrm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") for CRTCs and [structdrm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") for connectors. These are the only objects with userspace-visible and settable state. For internal state drivers can subclass these structures through embeddeding, or add entirely new state structures for their globally shared hardware functions.
* An atomic update is assembled and validated as an entirely free-standing pile of structures within the [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state")container. Again drivers can subclass that container for their own state structure tracking needs. Only when a state is committed is it applied to the driver and modeset objects. This way rolling back an update boils down to releasing memory and unreferencing objects like framebuffers.

Read on in this chapter, and also in [Atomic Modeset Helper Functions Reference](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#drm-atomic-helper) for more detailed coverage of specific topics.

### Atomic Mode Setting Function Reference[¶](#atomic-mode-setting-function-reference "Permalink to this headline")

struct `drm_crtc_commit`[¶](#c.drm%5Fcrtc%5Fcommit "Permalink to this definition")

track modeset commits on a CRTC

**Definition**

struct drm_crtc_commit {
  struct drm_crtc * crtc;
  struct kref ref;
  struct completion flip_done;
  struct completion hw_done;
  struct completion cleanup_done;
  struct list_head commit_entry;
  struct drm_pending_vblank_event * event;
};

**Members**

`crtc`

DRM CRTC for this commit.

`ref`

Reference count for this structure. Needed to allow blocking on completions without the risk of the completion disappearing meanwhile.

`flip_done`

Will be signaled when the hardware has flipped to the new set of buffers. Signals at the same time as when the drm event for this commit is sent to userspace, or when an out-fence is singalled. Note that for most hardware, in most cases this happens after **hw\_done** is signalled.

`hw_done`

Will be signalled when all hw register changes for this commit have been written out. Especially when disabling a pipe this can be much later than than **flip\_done**, since that can signal already when the screen goes black, whereas to fully shut down a pipe more register I/O is required.

Note that this does not need to include separately reference-counted resources like backing storage buffer pinning, or runtime pm management.

`cleanup_done`

Will be signalled after old buffers have been cleaned up by calling[drm\_atomic\_helper\_cleanup\_planes()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fcleanup%5Fplanes "drm_atomic_helper_cleanup_planes"). Since this can only happen after a vblank wait completed it might be a bit later. This completion is useful to throttle updates and avoid hardware updates getting ahead of the buffer cleanup too much.

`commit_entry`

Entry on the per-CRTC [drm\_crtc.commit\_list](#c.drm%5Fcrtc "drm_crtc"). Protected by $drm\_crtc.commit\_lock.

`event`

[drm\_pending\_vblank\_event](#c.drm%5Fpending%5Fvblank%5Fevent "drm_pending_vblank_event") pointer to clean up private events.

**Description**

This structure is used to track pending modeset changes and atomic commit on a per-CRTC basis. Since updating the list should never block this structure is reference counted to allow waiters to safely wait on an event to complete, without holding any locks.

It has 3 different events in total to allow a fine-grained synchronization between outstanding updates:

atomic commit thread                    hardware

write new state into hardware   ---->   ...
signal hw_done
                                        switch to new state on next
...                                     v/hblank

wait for buffers to show up             ...

...                                     send completion irq
                                        irq handler signals flip_done
cleanup old buffers

signal cleanup_done

wait for flip_done              <----
clean up atomic state

The important bit to know is that cleanup\_done is the terminal event, but the ordering between flip\_done and hw\_done is entirely up to the specific driver and modeset state change.

For an implementation of how to use this look at[drm\_atomic\_helper\_setup\_commit()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fsetup%5Fcommit "drm_atomic_helper_setup_commit") from the atomic helper library.

struct `drm_private_state_funcs`[¶](#c.drm%5Fprivate%5Fstate%5Ffuncs "Permalink to this definition")

atomic state functions for private objects

**Definition**

struct drm_private_state_funcs {
  struct drm_private_state *(* atomic_duplicate_state) (struct drm_private_obj *obj);
  void (* atomic_destroy_state) (struct drm_private_obj *obj, struct drm_private_state *state);
};

**Members**

`atomic_duplicate_state`

Duplicate the current state of the private object and return it. It is an error to call this before obj->state has been initialized.

RETURNS:

Duplicated atomic state or NULL when obj->state is not initialized or allocation failed.

`atomic_destroy_state`

Frees the private object state created with **atomic\_duplicate\_state**.

**Description**

These hooks are used by atomic helpers to create, swap and destroy states of private objects. The structure itself is used as a vtable to identify the associated private object type. Each private object type that needs to be added to the atomic states is expected to have an implementation of these hooks and pass a pointer to it’s drm\_private\_state\_funcs struct to[drm\_atomic\_get\_private\_obj\_state()](#c.drm%5Fatomic%5Fget%5Fprivate%5Fobj%5Fstate "drm_atomic_get_private_obj_state").

struct `drm_atomic_state`[¶](#c.drm%5Fatomic%5Fstate "Permalink to this definition")

the global state object for atomic updates

**Definition**

struct drm_atomic_state {
  struct kref ref;
  struct drm_device * dev;
  bool allow_modeset:1;
  bool legacy_cursor_update:1;
  bool async_update:1;
  struct __drm_planes_state * planes;
  struct __drm_crtcs_state * crtcs;
  int num_connector;
  struct __drm_connnectors_state * connectors;
  int num_private_objs;
  struct __drm_private_objs_state * private_objs;
  struct drm_modeset_acquire_ctx * acquire_ctx;
  struct drm_crtc_commit * fake_commit;
  struct work_struct commit_work;
};

**Members**

`ref`

count of all references to this state (will not be freed until zero)

`dev`

parent DRM device

`allow_modeset`

allow full modeset

`legacy_cursor_update`

hint to enforce legacy cursor IOCTL semantics

`async_update`

hint for asynchronous plane update

`planes`

pointer to array of structures with per-plane data

`crtcs`

pointer to array of CRTC pointers

`num_connector`

size of the **connectors** and **connector\_states** arrays

`connectors`

pointer to array of structures with per-connector data

`num_private_objs`

size of the **private\_objs** array

`private_objs`

pointer to array of private object pointers

`acquire_ctx`

acquire context for this atomic modeset state update

`fake_commit`

Used for signaling unbound planes/connectors. When a connector or plane is not bound to any CRTC, it’s still important to preserve linearity to prevent the atomic states from being freed to early.

This commit (if set) is not bound to any crtc, but will be completed when[drm\_atomic\_helper\_commit\_hw\_done()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fcommit%5Fhw%5Fdone "drm_atomic_helper_commit_hw_done") is called.

`commit_work`

Work item which can be used by the driver or helpers to execute the commit without blocking.

struct [drm\_crtc\_commit](#c.drm%5Fcrtc%5Fcommit "drm_crtc_commit") \* `drm_crtc_commit_get`(struct [drm\_crtc\_commit](#c.drm%5Fcrtc%5Fcommit "drm_crtc_commit") \* _commit_)[¶](#c.drm%5Fcrtc%5Fcommit%5Fget "Permalink to this definition")

acquire a reference to the CRTC commit

**Parameters**

`struct drm_crtc_commit * commit`

CRTC commit

**Description**

Increases the reference of **commit**.

**Return**

The pointer to **commit**, with reference increased.

void `drm_crtc_commit_put`(struct [drm\_crtc\_commit](#c.drm%5Fcrtc%5Fcommit "drm_crtc_commit") \* _commit_)[¶](#c.drm%5Fcrtc%5Fcommit%5Fput "Permalink to this definition")

release a reference to the CRTC commmit

**Parameters**

`struct drm_crtc_commit * commit`

CRTC commit

**Description**

This releases a reference to **commit** which is freed after removing the final reference. No locking required and callable from any context.

struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* `drm_atomic_state_get`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fstate%5Fget "Permalink to this definition")

acquire a reference to the atomic state

**Parameters**

`struct drm_atomic_state * state`

The atomic state

**Description**

Returns a new reference to the **state**

void `drm_atomic_state_put`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fstate%5Fput "Permalink to this definition")

release a reference to the atomic state

**Parameters**

`struct drm_atomic_state * state`

The atomic state

**Description**

This releases a reference to **state** which is freed after removing the final reference. No locking required and callable from any context.

struct [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") \* `drm_atomic_get_existing_crtc_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fatomic%5Fget%5Fexisting%5Fcrtc%5Fstate "Permalink to this definition")

get crtc state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_crtc * crtc`

crtc to grab

**Description**

This function returns the crtc state for the given crtc, or NULL if the crtc is not part of the global atomic state.

This function is deprecated, **drm\_atomic\_get\_old\_crtc\_state** or**drm\_atomic\_get\_new\_crtc\_state** should be used instead.

struct [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") \* `drm_atomic_get_old_crtc_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fatomic%5Fget%5Fold%5Fcrtc%5Fstate "Permalink to this definition")

get old crtc state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_crtc * crtc`

crtc to grab

**Description**

This function returns the old crtc state for the given crtc, or NULL if the crtc is not part of the global atomic state.

struct [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") \* `drm_atomic_get_new_crtc_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fatomic%5Fget%5Fnew%5Fcrtc%5Fstate "Permalink to this definition")

get new crtc state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_crtc * crtc`

crtc to grab

**Description**

This function returns the new crtc state for the given crtc, or NULL if the crtc is not part of the global atomic state.

struct [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") \* `drm_atomic_get_existing_plane_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_)[¶](#c.drm%5Fatomic%5Fget%5Fexisting%5Fplane%5Fstate "Permalink to this definition")

get plane state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_plane * plane`

plane to grab

**Description**

This function returns the plane state for the given plane, or NULL if the plane is not part of the global atomic state.

This function is deprecated, **drm\_atomic\_get\_old\_plane\_state** or**drm\_atomic\_get\_new\_plane\_state** should be used instead.

struct [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") \* `drm_atomic_get_old_plane_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_)[¶](#c.drm%5Fatomic%5Fget%5Fold%5Fplane%5Fstate "Permalink to this definition")

get plane state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_plane * plane`

plane to grab

**Description**

This function returns the old plane state for the given plane, or NULL if the plane is not part of the global atomic state.

struct [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") \* `drm_atomic_get_new_plane_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_)[¶](#c.drm%5Fatomic%5Fget%5Fnew%5Fplane%5Fstate "Permalink to this definition")

get plane state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_plane * plane`

plane to grab

**Description**

This function returns the new plane state for the given plane, or NULL if the plane is not part of the global atomic state.

struct [drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") \* `drm_atomic_get_existing_connector_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fatomic%5Fget%5Fexisting%5Fconnector%5Fstate "Permalink to this definition")

get connector state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_connector * connector`

connector to grab

**Description**

This function returns the connector state for the given connector, or NULL if the connector is not part of the global atomic state.

This function is deprecated, **drm\_atomic\_get\_old\_connector\_state** or**drm\_atomic\_get\_new\_connector\_state** should be used instead.

struct [drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") \* `drm_atomic_get_old_connector_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fatomic%5Fget%5Fold%5Fconnector%5Fstate "Permalink to this definition")

get connector state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_connector * connector`

connector to grab

**Description**

This function returns the old connector state for the given connector, or NULL if the connector is not part of the global atomic state.

struct [drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") \* `drm_atomic_get_new_connector_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fatomic%5Fget%5Fnew%5Fconnector%5Fstate "Permalink to this definition")

get connector state, if it exists

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_connector * connector`

connector to grab

**Description**

This function returns the new connector state for the given connector, or NULL if the connector is not part of the global atomic state.

const struct [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") \* `__drm_atomic_get_current_plane_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_)[¶](#c.%5F%5Fdrm%5Fatomic%5Fget%5Fcurrent%5Fplane%5Fstate "Permalink to this definition")

get current plane state

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_plane * plane`

plane to grab

**Description**

This function returns the plane state for the given plane, either from**state**, or if the plane isn’t part of the atomic state update, from **plane**. This is useful in atomic check callbacks, when drivers need to peek at, but not change, state of other planes, since it avoids threading an error code back up the call chain.

WARNING:

Note that this function is in general unsafe since it doesn’t check for the required locking for access state structures. Drivers must ensure that it is safe to access the returned state structure through other means. One common example is when planes are fixed to a single CRTC, and the driver knows that the CRTC lock is held already. In that case holding the CRTC lock gives a read-lock on all planes connected to that CRTC. But if planes can be reassigned things get more tricky. In that case it’s better to use drm\_atomic\_get\_plane\_state and wire up full error handling.

**Return**

Read-only pointer to the current plane state.

`for_each_oldnew_connector_in_state`(_\_\_state_, _connector_, _old\_connector\_state_, _new\_connector\_state_, _\_\_i_)[¶](#c.for%5Feach%5Foldnew%5Fconnector%5Fin%5Fstate "Permalink to this definition")

iterate over all connectors in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`connector`

[struct drm\_connector](#c.drm%5Fconnector "drm_connector") iteration cursor

`old_connector_state`

[struct drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") iteration cursor for the old state

`new_connector_state`

[struct drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") iteration cursor for the new state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all connectors in an atomic update, tracking both old and new state. This is useful in places where the state delta needs to be considered, for example in atomic check functions.

`for_each_old_connector_in_state`(_\_\_state_, _connector_, _old\_connector\_state_, _\_\_i_)[¶](#c.for%5Feach%5Fold%5Fconnector%5Fin%5Fstate "Permalink to this definition")

iterate over all connectors in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`connector`

[struct drm\_connector](#c.drm%5Fconnector "drm_connector") iteration cursor

`old_connector_state`

[struct drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") iteration cursor for the old state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all connectors in an atomic update, tracking only the old state. This is useful in disable functions, where we need the old state the hardware is still in.

`for_each_new_connector_in_state`(_\_\_state_, _connector_, _new\_connector\_state_, _\_\_i_)[¶](#c.for%5Feach%5Fnew%5Fconnector%5Fin%5Fstate "Permalink to this definition")

iterate over all connectors in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`connector`

[struct drm\_connector](#c.drm%5Fconnector "drm_connector") iteration cursor

`new_connector_state`

[struct drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") iteration cursor for the new state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all connectors in an atomic update, tracking only the new state. This is useful in enable functions, where we need the new state the hardware should be in when the atomic commit operation has completed.

`for_each_oldnew_crtc_in_state`(_\_\_state_, _crtc_, _old\_crtc\_state_, _new\_crtc\_state_, _\_\_i_)[¶](#c.for%5Feach%5Foldnew%5Fcrtc%5Fin%5Fstate "Permalink to this definition")

iterate over all CRTCs in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`crtc`

[struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc") iteration cursor

`old_crtc_state`

[struct drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") iteration cursor for the old state

`new_crtc_state`

[struct drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") iteration cursor for the new state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all CRTCs in an atomic update, tracking both old and new state. This is useful in places where the state delta needs to be considered, for example in atomic check functions.

`for_each_old_crtc_in_state`(_\_\_state_, _crtc_, _old\_crtc\_state_, _\_\_i_)[¶](#c.for%5Feach%5Fold%5Fcrtc%5Fin%5Fstate "Permalink to this definition")

iterate over all CRTCs in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`crtc`

[struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc") iteration cursor

`old_crtc_state`

[struct drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") iteration cursor for the old state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all CRTCs in an atomic update, tracking only the old state. This is useful in disable functions, where we need the old state the hardware is still in.

`for_each_new_crtc_in_state`(_\_\_state_, _crtc_, _new\_crtc\_state_, _\_\_i_)[¶](#c.for%5Feach%5Fnew%5Fcrtc%5Fin%5Fstate "Permalink to this definition")

iterate over all CRTCs in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`crtc`

[struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc") iteration cursor

`new_crtc_state`

[struct drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") iteration cursor for the new state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all CRTCs in an atomic update, tracking only the new state. This is useful in enable functions, where we need the new state the hardware should be in when the atomic commit operation has completed.

`for_each_oldnew_plane_in_state`(_\_\_state_, _plane_, _old\_plane\_state_, _new\_plane\_state_, _\_\_i_)[¶](#c.for%5Feach%5Foldnew%5Fplane%5Fin%5Fstate "Permalink to this definition")

iterate over all planes in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`plane`

[struct drm\_plane](#c.drm%5Fplane "drm_plane") iteration cursor

`old_plane_state`

[struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") iteration cursor for the old state

`new_plane_state`

[struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") iteration cursor for the new state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all planes in an atomic update, tracking both old and new state. This is useful in places where the state delta needs to be considered, for example in atomic check functions.

`for_each_old_plane_in_state`(_\_\_state_, _plane_, _old\_plane\_state_, _\_\_i_)[¶](#c.for%5Feach%5Fold%5Fplane%5Fin%5Fstate "Permalink to this definition")

iterate over all planes in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`plane`

[struct drm\_plane](#c.drm%5Fplane "drm_plane") iteration cursor

`old_plane_state`

[struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") iteration cursor for the old state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all planes in an atomic update, tracking only the old state. This is useful in disable functions, where we need the old state the hardware is still in.

`for_each_new_plane_in_state`(_\_\_state_, _plane_, _new\_plane\_state_, _\_\_i_)[¶](#c.for%5Feach%5Fnew%5Fplane%5Fin%5Fstate "Permalink to this definition")

iterate over all planes in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`plane`

[struct drm\_plane](#c.drm%5Fplane "drm_plane") iteration cursor

`new_plane_state`

[struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") iteration cursor for the new state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all planes in an atomic update, tracking only the new state. This is useful in enable functions, where we need the new state the hardware should be in when the atomic commit operation has completed.

`for_each_oldnew_private_obj_in_state`(_\_\_state_, _obj_, _old\_obj\_state_, _new\_obj\_state_, _\_\_i_)[¶](#c.for%5Feach%5Foldnew%5Fprivate%5Fobj%5Fin%5Fstate "Permalink to this definition")

iterate over all private objects in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`obj`

`struct drm_private_obj` iteration cursor

`old_obj_state`

`struct drm_private_state` iteration cursor for the old state

`new_obj_state`

`struct drm_private_state` iteration cursor for the new state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all private objects in an atomic update, tracking both old and new state. This is useful in places where the state delta needs to be considered, for example in atomic check functions.

`for_each_old_private_obj_in_state`(_\_\_state_, _obj_, _old\_obj\_state_, _\_\_i_)[¶](#c.for%5Feach%5Fold%5Fprivate%5Fobj%5Fin%5Fstate "Permalink to this definition")

iterate over all private objects in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`obj`

`struct drm_private_obj` iteration cursor

`old_obj_state`

`struct drm_private_state` iteration cursor for the old state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all private objects in an atomic update, tracking only the old state. This is useful in disable functions, where we need the old state the hardware is still in.

`for_each_new_private_obj_in_state`(_\_\_state_, _obj_, _new\_obj\_state_, _\_\_i_)[¶](#c.for%5Feach%5Fnew%5Fprivate%5Fobj%5Fin%5Fstate "Permalink to this definition")

iterate over all private objects in an atomic update

**Parameters**

`__state`

[struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointer

`obj`

`struct drm_private_obj` iteration cursor

`new_obj_state`

`struct drm_private_state` iteration cursor for the new state

`__i`

int iteration cursor, for macro-internal use

**Description**

This iterates over all private objects in an atomic update, tracking only the new state. This is useful in enable functions, where we need the new state the hardware should be in when the atomic commit operation has completed.

bool `drm_atomic_crtc_needs_modeset`(const struct [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") \* _state_)[¶](#c.drm%5Fatomic%5Fcrtc%5Fneeds%5Fmodeset "Permalink to this definition")

compute combined modeset need

**Parameters**

`const struct drm_crtc_state * state`

[drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") for the CRTC

**Description**

To give drivers flexibility [struct drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") has 3 booleans to track whether the state CRTC changed enough to need a full modeset cycle: mode\_changed, active\_changed and connectors\_changed. This helper simply combines these three to compute the overall need for a modeset for **state**.

The atomic helper code sets these booleans, but drivers can and should change them appropriately to accurately represent whether a modeset is really needed. In general, drivers should avoid full modesets whenever possible.

For example if the CRTC mode has changed, and the hardware is able to enact the requested mode change without going through a full modeset, the driver should clear mode\_changed in its [drm\_mode\_config\_funcs.atomic\_check](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs")implementation.

void `drm_atomic_state_default_release`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fstate%5Fdefault%5Frelease "Permalink to this definition")

release memory initialized by drm\_atomic\_state\_init

**Parameters**

`struct drm_atomic_state * state`

atomic state

**Description**

Free all the memory allocated by drm\_atomic\_state\_init. This is useful for drivers that subclass the atomic state.

int `drm_atomic_state_init`(struct drm\_device \* _dev_, struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fstate%5Finit "Permalink to this definition")

init new atomic state

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_atomic_state * state`

atomic state

**Description**

Default implementation for filling in a new atomic state. This is useful for drivers that subclass the atomic state.

struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* `drm_atomic_state_alloc`(struct drm\_device \* _dev_)[¶](#c.drm%5Fatomic%5Fstate%5Falloc "Permalink to this definition")

allocate atomic state

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

This allocates an empty atomic state to track updates.

void `drm_atomic_state_default_clear`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fstate%5Fdefault%5Fclear "Permalink to this definition")

clear base atomic state

**Parameters**

`struct drm_atomic_state * state`

atomic state

**Description**

Default implementation for clearing atomic state. This is useful for drivers that subclass the atomic state.

void `drm_atomic_state_clear`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fstate%5Fclear "Permalink to this definition")

clear state object

**Parameters**

`struct drm_atomic_state * state`

atomic state

**Description**

When the w/w mutex algorithm detects a deadlock we need to back off and drop all locks. So someone else could sneak in and change the current modeset configuration. Which means that all the state assembled in **state** is no longer an atomic update to the current state, but to some arbitrary earlier state. Which could break assumptions the driver’s[drm\_mode\_config\_funcs.atomic\_check](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs") likely relies on.

Hence we must clear all cached state and completely start over, using this function.

void `__drm_atomic_state_free`(struct kref \* _ref_)[¶](#c.%5F%5Fdrm%5Fatomic%5Fstate%5Ffree "Permalink to this definition")

free all memory for an atomic state

**Parameters**

`struct kref * ref`

This atomic state to deallocate

**Description**

This frees all memory associated with an atomic state, including all the per-object state for planes, crtcs and connectors.

struct [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") \* `drm_atomic_get_crtc_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fatomic%5Fget%5Fcrtc%5Fstate "Permalink to this definition")

get crtc state

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_crtc * crtc`

crtc to get state object for

**Description**

This function returns the crtc state for the given crtc, allocating it if needed. It will also grab the relevant crtc lock to make sure that the state is consistent.

**Return**

Either the allocated state or the error code encoded into the pointer. When the error is EDEADLK then the w/w mutex code has detected a deadlock and the entire atomic sequence must be restarted. All other errors are fatal.

int `drm_atomic_set_mode_for_crtc`(struct [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") \* _state_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fatomic%5Fset%5Fmode%5Ffor%5Fcrtc "Permalink to this definition")

set mode for CRTC

**Parameters**

`struct drm_crtc_state * state`

the CRTC whose incoming state to update

`const struct drm_display_mode * mode`

kernel-internal mode to use for the CRTC, or NULL to disable

**Description**

Set a mode (originating from the kernel) on the desired CRTC state and update the enable property.

**Return**

Zero on success, error code on failure. Cannot return -EDEADLK.

int `drm_atomic_set_mode_prop_for_crtc`(struct [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") \* _state_, struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* _blob_)[¶](#c.drm%5Fatomic%5Fset%5Fmode%5Fprop%5Ffor%5Fcrtc "Permalink to this definition")

set mode for CRTC

**Parameters**

`struct drm_crtc_state * state`

the CRTC whose incoming state to update

`struct drm_property_blob * blob`

pointer to blob property to use for mode

**Description**

Set a mode (originating from a blob property) on the desired CRTC state. This function will take a reference on the blob property for the CRTC state, and release the reference held on the state’s existing mode property, if any was set.

**Return**

Zero on success, error code on failure. Cannot return -EDEADLK.

int `drm_atomic_crtc_set_property`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, struct [drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") \* _state_, struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _property_, uint64\_t _val_)[¶](#c.drm%5Fatomic%5Fcrtc%5Fset%5Fproperty "Permalink to this definition")

set property on CRTC

**Parameters**

`struct drm_crtc * crtc`

the drm CRTC to set a property on

`struct drm_crtc_state * state`

the state object to update with the new property value

`struct drm_property * property`

the property to set

`uint64_t val`

the new property value

**Description**

This function handles generic/core properties and calls out to driver’s[drm\_crtc\_funcs.atomic\_set\_property](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs") for driver properties. To ensure consistent behavior you must call this function rather than the driver hook directly.

**Return**

Zero on success, error code on failure

struct [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") \* `drm_atomic_get_plane_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_)[¶](#c.drm%5Fatomic%5Fget%5Fplane%5Fstate "Permalink to this definition")

get plane state

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_plane * plane`

plane to get state object for

**Description**

This function returns the plane state for the given plane, allocating it if needed. It will also grab the relevant plane lock to make sure that the state is consistent.

**Return**

Either the allocated state or the error code encoded into the pointer. When the error is EDEADLK then the w/w mutex code has detected a deadlock and the entire atomic sequence must be restarted. All other errors are fatal.

void `drm_atomic_private_obj_init`(struct drm\_private\_obj \* _obj_, struct drm\_private\_state \* _state_, const struct [drm\_private\_state\_funcs](#c.drm%5Fprivate%5Fstate%5Ffuncs "drm_private_state_funcs") \* _funcs_)[¶](#c.drm%5Fatomic%5Fprivate%5Fobj%5Finit "Permalink to this definition")

initialize private object

**Parameters**

`struct drm_private_obj * obj`

private object

`struct drm_private_state * state`

initial private object state

`const struct drm_private_state_funcs * funcs`

pointer to the struct of function pointers that identify the object type

**Description**

Initialize the private object, which can be embedded into any driver private object that needs its own atomic state.

void `drm_atomic_private_obj_fini`(struct drm\_private\_obj \* _obj_)[¶](#c.drm%5Fatomic%5Fprivate%5Fobj%5Ffini "Permalink to this definition")

finalize private object

**Parameters**

`struct drm_private_obj * obj`

private object

**Description**

Finalize the private object.

struct drm\_private\_state \* `drm_atomic_get_private_obj_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct drm\_private\_obj \* _obj_)[¶](#c.drm%5Fatomic%5Fget%5Fprivate%5Fobj%5Fstate "Permalink to this definition")

get private object state

**Parameters**

`struct drm_atomic_state * state`

global atomic state

`struct drm_private_obj * obj`

private object to get the state for

**Description**

This function returns the private object state for the given private object, allocating the state if needed. It does not grab any locks as the caller is expected to care of any required locking.

**Return**

Either the allocated state or the error code encoded into a pointer.

struct [drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") \* `drm_atomic_get_connector_state`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fatomic%5Fget%5Fconnector%5Fstate "Permalink to this definition")

get connector state

**Parameters**

`struct drm_atomic_state * state`

global atomic state object

`struct drm_connector * connector`

connector to get state object for

**Description**

This function returns the connector state for the given connector, allocating it if needed. It will also grab the relevant connector lock to make sure that the state is consistent.

**Return**

Either the allocated state or the error code encoded into the pointer. When the error is EDEADLK then the w/w mutex code has detected a deadlock and the entire atomic sequence must be restarted. All other errors are fatal.

int `drm_atomic_set_crtc_for_plane`(struct [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") \* _plane\_state_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fatomic%5Fset%5Fcrtc%5Ffor%5Fplane "Permalink to this definition")

set crtc for plane

**Parameters**

`struct drm_plane_state * plane_state`

the plane whose incoming state to update

`struct drm_crtc * crtc`

crtc to use for the plane

**Description**

Changing the assigned crtc for a plane requires us to grab the lock and state for the new crtc, as needed. This function takes care of all these details besides updating the pointer in the state object itself.

**Return**

0 on success or can fail with -EDEADLK or -ENOMEM. When the error is EDEADLK then the w/w mutex code has detected a deadlock and the entire atomic sequence must be restarted. All other errors are fatal.

void `drm_atomic_set_fb_for_plane`(struct [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") \* _plane\_state_, struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fatomic%5Fset%5Ffb%5Ffor%5Fplane "Permalink to this definition")

set framebuffer for plane

**Parameters**

`struct drm_plane_state * plane_state`

atomic state object for the plane

`struct drm_framebuffer * fb`

fb to use for the plane

**Description**

Changing the assigned framebuffer for a plane requires us to grab a reference to the new fb and drop the reference to the old fb, if there is one. This function takes care of all these details besides updating the pointer in the state object itself.

void `drm_atomic_set_fence_for_plane`(struct [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") \* _plane\_state_, struct [dma\_fence](https://www.kernel.org/doc/html/v4.15/driver-api/dma-buf.html#c.dma%5Ffence "dma_fence") \* _fence_)[¶](#c.drm%5Fatomic%5Fset%5Ffence%5Ffor%5Fplane "Permalink to this definition")

set fence for plane

**Parameters**

`struct drm_plane_state * plane_state`

atomic state object for the plane

`struct dma_fence * fence`

dma\_fence to use for the plane

**Description**

Helper to setup the plane\_state fence in case it is not set yet. By using this drivers doesn’t need to worry if the user choose implicit or explicit fencing.

This function will not set the fence to the state if it was set via explicit fencing interfaces on the atomic ioctl. In that case it will drop the reference to the fence as we are not storing it anywhere. Otherwise, if [drm\_plane\_state.fence](#c.drm%5Fplane%5Fstate "drm_plane_state") is not set this function we just set it with the received implicit fence. In both cases this function consumes a reference for **fence**.

int `drm_atomic_set_crtc_for_connector`(struct [drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") \* _conn\_state_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fatomic%5Fset%5Fcrtc%5Ffor%5Fconnector "Permalink to this definition")

set crtc for connector

**Parameters**

`struct drm_connector_state * conn_state`

atomic state object for the connector

`struct drm_crtc * crtc`

crtc to use for the connector

**Description**

Changing the assigned crtc for a connector requires us to grab the lock and state for the new crtc, as needed. This function takes care of all these details besides updating the pointer in the state object itself.

**Return**

0 on success or can fail with -EDEADLK or -ENOMEM. When the error is EDEADLK then the w/w mutex code has detected a deadlock and the entire atomic sequence must be restarted. All other errors are fatal.

int `drm_atomic_add_affected_connectors`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fatomic%5Fadd%5Faffected%5Fconnectors "Permalink to this definition")

add connectors for crtc

**Parameters**

`struct drm_atomic_state * state`

atomic state

`struct drm_crtc * crtc`

DRM crtc

**Description**

This function walks the current configuration and adds all connectors currently using **crtc** to the atomic configuration **state**. Note that this function must acquire the connection mutex. This can potentially cause unneeded seralization if the update is just for the planes on one crtc. Hence drivers and helpers should only call this when really needed (e.g. when a full modeset needs to happen due to some change).

**Return**

0 on success or can fail with -EDEADLK or -ENOMEM. When the error is EDEADLK then the w/w mutex code has detected a deadlock and the entire atomic sequence must be restarted. All other errors are fatal.

int `drm_atomic_add_affected_planes`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fatomic%5Fadd%5Faffected%5Fplanes "Permalink to this definition")

add planes for crtc

**Parameters**

`struct drm_atomic_state * state`

atomic state

`struct drm_crtc * crtc`

DRM crtc

**Description**

This function walks the current configuration and adds all planes currently used by **crtc** to the atomic configuration **state**. This is useful when an atomic commit also needs to check all currently enabled plane on**crtc**, e.g. when changing the mode. It’s also useful when re-enabling a CRTC to avoid special code to force-enable all planes.

Since acquiring a plane state will always also acquire the w/w mutex of the current CRTC for that plane (if there is any) adding all the plane states for a CRTC will not reduce parallism of atomic updates.

**Return**

0 on success or can fail with -EDEADLK or -ENOMEM. When the error is EDEADLK then the w/w mutex code has detected a deadlock and the entire atomic sequence must be restarted. All other errors are fatal.

int `drm_atomic_check_only`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fcheck%5Fonly "Permalink to this definition")

check whether a given config would work

**Parameters**

`struct drm_atomic_state * state`

atomic configuration to check

**Description**

Note that this function can return -EDEADLK if the driver needed to acquire more locks but encountered a deadlock. The caller must then do the usual w/w backoff dance and restart. All other errors are fatal.

**Return**

0 on success, negative error code on failure.

int `drm_atomic_commit`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fcommit "Permalink to this definition")

commit configuration atomically

**Parameters**

`struct drm_atomic_state * state`

atomic configuration to check

**Description**

Note that this function can return -EDEADLK if the driver needed to acquire more locks but encountered a deadlock. The caller must then do the usual w/w backoff dance and restart. All other errors are fatal.

This function will take its own reference on **state**. Callers should always release their reference with [drm\_atomic\_state\_put()](#c.drm%5Fatomic%5Fstate%5Fput "drm_atomic_state_put").

**Return**

0 on success, negative error code on failure.

int `drm_atomic_nonblocking_commit`(struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fnonblocking%5Fcommit "Permalink to this definition")

atomic nonblocking commit

**Parameters**

`struct drm_atomic_state * state`

atomic configuration to check

**Description**

Note that this function can return -EDEADLK if the driver needed to acquire more locks but encountered a deadlock. The caller must then do the usual w/w backoff dance and restart. All other errors are fatal.

This function will take its own reference on **state**. Callers should always release their reference with [drm\_atomic\_state\_put()](#c.drm%5Fatomic%5Fstate%5Fput "drm_atomic_state_put").

**Return**

0 on success, negative error code on failure.

void `drm_state_dump`(struct drm\_device \* _dev_, struct [drm\_printer](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fprinter "drm_printer") \* _p_)[¶](#c.drm%5Fstate%5Fdump "Permalink to this definition")

dump entire device atomic state

**Parameters**

`struct drm_device * dev`

the drm device

`struct drm_printer * p`

where to print the state to

**Description**

Just for debugging. Drivers might want an option to dump state to dmesg in case of error irq’s. (Hint, you probably want to ratelimit this!)

The caller must [drm\_modeset\_lock\_all()](#c.drm%5Fmodeset%5Flock%5Fall "drm_modeset_lock_all"), or if this is called from error irq handler, it should not be enabled by default. (Ie. if you are debugging errors you might not care that this is racey. But calling this without all modeset locks held is not inherently safe.)

void `drm_atomic_clean_old_fb`(struct drm\_device \* _dev_, unsigned _plane\_mask_, int _ret_)[¶](#c.drm%5Fatomic%5Fclean%5Fold%5Ffb "Permalink to this definition")

* Unset old\_fb pointers and set plane->fb pointers.

**Parameters**

`struct drm_device * dev`

drm device to check.

`unsigned plane_mask`

plane mask for planes that were updated.

`int ret`

return value, can be -EDEADLK for a retry.

**Description**

Before doing an update [drm\_plane.old\_fb](#c.drm%5Fplane "drm_plane") is set to [drm\_plane.fb](#c.drm%5Fplane "drm_plane"), but before dropping the locks old\_fb needs to be set to NULL and plane->fb updated. This is a common operation for each atomic update, so this call is split off as a helper.

## CRTC Abstraction[¶](#crtc-abstraction "Permalink to this headline")

A CRTC represents the overall display pipeline. It receives pixel data from[drm\_plane](#c.drm%5Fplane "drm_plane") and blends them together. The [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") is also attached to the CRTC, specifying display timings. On the output side the data is fed to one or more [drm\_encoder](#c.drm%5Fencoder "drm_encoder"), which are then each connected to one[drm\_connector](#c.drm%5Fconnector "drm_connector").

To create a CRTC, a KMS drivers allocates and zeroes an instances of[struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc") (possibly as part of a larger structure) and registers it with a call to [drm\_crtc\_init\_with\_planes()](#c.drm%5Fcrtc%5Finit%5Fwith%5Fplanes "drm_crtc_init_with_planes").

The CRTC is also the entry point for legacy modeset operations, see[drm\_crtc\_funcs.set\_config](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs"), legacy plane operations, see[drm\_crtc\_funcs.page\_flip](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs") and [drm\_crtc\_funcs.cursor\_set2](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs"), and other legacy operations like [drm\_crtc\_funcs.gamma\_set](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs"). For atomic drivers all these features are controlled through [drm\_property](#c.drm%5Fproperty "drm_property") and[drm\_mode\_config\_funcs.atomic\_check](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs") and [drm\_mode\_config\_funcs.atomic\_check](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs").

### CRTC Functions Reference[¶](#crtc-functions-reference "Permalink to this headline")

struct `drm_crtc_state`[¶](#c.drm%5Fcrtc%5Fstate "Permalink to this definition")

mutable CRTC state

**Definition**

struct drm_crtc_state {
  struct drm_crtc * crtc;
  bool enable;
  bool active;
  bool planes_changed:1;
  bool mode_changed:1;
  bool active_changed:1;
  bool connectors_changed:1;
  bool zpos_changed:1;
  bool color_mgmt_changed:1;
  u32 plane_mask;
  u32 connector_mask;
  u32 encoder_mask;
  struct drm_display_mode adjusted_mode;
  struct drm_display_mode mode;
  struct drm_property_blob * mode_blob;
  struct drm_property_blob * degamma_lut;
  struct drm_property_blob * ctm;
  struct drm_property_blob * gamma_lut;
  u32 target_vblank;
  u32 pageflip_flags;
  struct drm_pending_vblank_event * event;
  struct drm_crtc_commit * commit;
  struct drm_atomic_state * state;
};

**Members**

`crtc`

backpointer to the CRTC

`enable`

whether the CRTC should be enabled, gates all other state

`active`

whether the CRTC is actively displaying (used for DPMS)

`planes_changed`

planes on this crtc are updated

`mode_changed`

**mode** or **enable** has been changed

`active_changed`

**active** has been toggled.

`connectors_changed`

connectors to this crtc have been updated

`zpos_changed`

zpos values of planes on this crtc have been updated

`color_mgmt_changed`

color management properties have changed (degamma or gamma LUT or CSC matrix)

`plane_mask`

bitmask of (1 << drm\_plane\_index(plane)) of attached planes

`connector_mask`

bitmask of (1 << drm\_connector\_index(connector)) of attached connectors

`encoder_mask`

bitmask of (1 << drm\_encoder\_index(encoder)) of attached encoders

`adjusted_mode`

Internal display timings which can be used by the driver to handle differences between the mode requested by userspace in **mode** and what is actually programmed into the hardware. It is purely driver implementation defined what exactly this adjusted mode means. Usually it is used to store the hardware display timings used between the CRTC and encoder blocks.

`mode`

Display timings requested by userspace. The driver should try to match the refresh rate as close as possible (but note that it’s undefined what exactly is close enough, e.g. some of the HDMI modes only differ in less than 1% of the refresh rate). The active width and height as observed by userspace for positioning planes must match exactly.

For external connectors where the sink isn’t fixed (like with a built-in panel), this mode here should match the physical mode on the wire to the last details (i.e. including sync polarities and everything).

`mode_blob`

[drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") for **mode**

`degamma_lut`

Lookup table for converting framebuffer pixel data before apply the color conversion matrix **ctm**. See [drm\_crtc\_enable\_color\_mgmt()](#c.drm%5Fcrtc%5Fenable%5Fcolor%5Fmgmt "drm_crtc_enable_color_mgmt"). The blob (if not NULL) is an array of `struct drm_color_lut`.

`ctm`

Color transformation matrix. See [drm\_crtc\_enable\_color\_mgmt()](#c.drm%5Fcrtc%5Fenable%5Fcolor%5Fmgmt "drm_crtc_enable_color_mgmt"). The blob (if not NULL) is a `struct drm_color_ctm`.

`gamma_lut`

Lookup table for converting pixel data after the color conversion matrix **ctm**. See [drm\_crtc\_enable\_color\_mgmt()](#c.drm%5Fcrtc%5Fenable%5Fcolor%5Fmgmt "drm_crtc_enable_color_mgmt"). The blob (if not NULL) is an array of `struct drm_color_lut`.

`target_vblank`

Target vertical blank period when a page flip should take effect.

`pageflip_flags`

DRM\_MODE\_PAGE\_FLIP\_\* flags, as passed to the page flip ioctl. Zero in any other case.

`event`

Optional pointer to a DRM event to signal upon completion of the state update. The driver must send out the event when the atomic commit operation completes. There are two cases:

> * The event is for a CRTC which is being disabled through this atomic commit. In that case the event can be send out any time after the hardware has stopped scanning out the current framebuffers. It should contain the timestamp and counter for the last vblank before the display pipeline was shut off. The simplest way to achieve that is calling [drm\_crtc\_send\_vblank\_event()](#c.drm%5Fcrtc%5Fsend%5Fvblank%5Fevent "drm_crtc_send_vblank_event")somewhen after [drm\_crtc\_vblank\_off()](#c.drm%5Fcrtc%5Fvblank%5Foff "drm_crtc_vblank_off") has been called.
> * For a CRTC which is enabled at the end of the commit (even when it undergoes an full modeset) the vblank timestamp and counter must be for the vblank right before the first frame that scans out the new set of buffers. Again the event can only be sent out after the hardware has stopped scanning out the old buffers.
> * Events for disabled CRTCs are not allowed, and drivers can ignore that case.

This can be handled by the [drm\_crtc\_send\_vblank\_event()](#c.drm%5Fcrtc%5Fsend%5Fvblank%5Fevent "drm_crtc_send_vblank_event") function, which the driver should call on the provided event upon completion of the atomic commit. Note that if the driver supports vblank signalling and timestamping the vblank counters and timestamps must agree with the ones returned from page flip events. With the current vblank helper infrastructure this can be achieved by holding a vblank reference while the page flip is pending, acquired through[drm\_crtc\_vblank\_get()](#c.drm%5Fcrtc%5Fvblank%5Fget "drm_crtc_vblank_get") and released with [drm\_crtc\_vblank\_put()](#c.drm%5Fcrtc%5Fvblank%5Fput "drm_crtc_vblank_put"). Drivers are free to implement their own vblank counter and timestamp tracking though, e.g. if they have accurate timestamp registers in hardware.

For hardware which supports some means to synchronize vblank interrupt delivery with committing display state there’s also[drm\_crtc\_arm\_vblank\_event()](#c.drm%5Fcrtc%5Farm%5Fvblank%5Fevent "drm_crtc_arm_vblank_event"). See the documentation of that function for a detailed discussion of the constraints it needs to be used safely.

If the device can’t notify of flip completion in a race-free way at all, then the event should be armed just after the page flip is committed. In the worst case the driver will send the event to userspace one frame too late. This doesn’t allow for a real atomic update, but it should avoid tearing.

`commit`

This tracks how the commit for this update proceeds through the various phases. This is never cleared, except when we destroy the state, so that subsequent commits can synchronize with previous ones.

`state`

backpointer to global drm\_atomic\_state

**Description**

Note that the distinction between **enable** and **active** is rather subtile: Flipping **active** while **enable** is set without changing anything else may never return in a failure from the [drm\_mode\_config\_funcs.atomic\_check](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs")callback. Userspace assumes that a DPMS On will always succeed. In other words: **enable** controls resource assignment, **active** controls the actual hardware state.

The three booleans active\_changed, connectors\_changed and mode\_changed are intended to indicate whether a full modeset is needed, rather than strictly describing what has changed in a commit. See also: [drm\_atomic\_crtc\_needs\_modeset()](#c.drm%5Fatomic%5Fcrtc%5Fneeds%5Fmodeset "drm_atomic_crtc_needs_modeset")

struct `drm_crtc_funcs`[¶](#c.drm%5Fcrtc%5Ffuncs "Permalink to this definition")

control CRTCs for a given device

**Definition**

struct drm_crtc_funcs {
  void (* reset) (struct drm_crtc *crtc);
  int (* cursor_set) (struct drm_crtc *crtc, struct drm_file *file_priv, uint32_t handle, uint32_t width, uint32_t height);
  int (* cursor_set2) (struct drm_crtc *crtc, struct drm_file *file_priv,uint32_t handle, uint32_t width, uint32_t height, int32_t hot_x, int32_t hot_y);
  int (* cursor_move) (struct drm_crtc *crtc, int x, int y);
  int (* gamma_set) (struct drm_crtc *crtc, u16 *r, u16 *g, u16 *b,uint32_t size, struct drm_modeset_acquire_ctx *ctx);
  void (* destroy) (struct drm_crtc *crtc);
  int (* set_config) (struct drm_mode_set *set, struct drm_modeset_acquire_ctx *ctx);
  int (* page_flip) (struct drm_crtc *crtc,struct drm_framebuffer *fb,struct drm_pending_vblank_event *event,uint32_t flags, struct drm_modeset_acquire_ctx *ctx);
  int (* page_flip_target) (struct drm_crtc *crtc,struct drm_framebuffer *fb,struct drm_pending_vblank_event *event,uint32_t flags, uint32_t target, struct drm_modeset_acquire_ctx *ctx);
  int (* set_property) (struct drm_crtc *crtc, struct drm_property *property, uint64_t val);
  struct drm_crtc_state *(* atomic_duplicate_state) (struct drm_crtc *crtc);
  void (* atomic_destroy_state) (struct drm_crtc *crtc, struct drm_crtc_state *state);
  int (* atomic_set_property) (struct drm_crtc *crtc,struct drm_crtc_state *state,struct drm_property *property, uint64_t val);
  int (* atomic_get_property) (struct drm_crtc *crtc,const struct drm_crtc_state *state,struct drm_property *property, uint64_t *val);
  int (* late_register) (struct drm_crtc *crtc);
  void (* early_unregister) (struct drm_crtc *crtc);
  int (* set_crc_source) (struct drm_crtc *crtc, const char *source, size_t *values_cnt);
  void (* atomic_print_state) (struct drm_printer *p, const struct drm_crtc_state *state);
  u32 (* get_vblank_counter) (struct drm_crtc *crtc);
  int (* enable_vblank) (struct drm_crtc *crtc);
  void (* disable_vblank) (struct drm_crtc *crtc);
};

**Members**

`reset`

Reset CRTC hardware and software state to off. This function isn’t called by the core directly, only through [drm\_mode\_config\_reset()](#c.drm%5Fmode%5Fconfig%5Freset "drm_mode_config_reset"). It’s not a helper hook only for historical reasons.

Atomic drivers can use [drm\_atomic\_helper\_crtc\_reset()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fcrtc%5Freset "drm_atomic_helper_crtc_reset") to reset atomic state using this hook.

`cursor_set`

Update the cursor image. The cursor position is relative to the CRTC and can be partially or fully outside of the visible area.

Note that contrary to all other KMS functions the legacy cursor entry points don’t take a framebuffer object, but instead take directly a raw buffer object id from the driver’s buffer manager (which is either GEM or TTM for current drivers).

This entry point is deprecated, drivers should instead implement universal plane support and register a proper cursor plane using[drm\_crtc\_init\_with\_planes()](#c.drm%5Fcrtc%5Finit%5Fwith%5Fplanes "drm_crtc_init_with_planes").

This callback is optional

RETURNS:

0 on success or a negative error code on failure.

`cursor_set2`

Update the cursor image, including hotspot information. The hotspot must not affect the cursor position in CRTC coordinates, but is only meant as a hint for virtualized display hardware to coordinate the guests and hosts cursor position. The cursor hotspot is relative to the cursor image. Otherwise this works exactly like **cursor\_set**.

This entry point is deprecated, drivers should instead implement universal plane support and register a proper cursor plane using[drm\_crtc\_init\_with\_planes()](#c.drm%5Fcrtc%5Finit%5Fwith%5Fplanes "drm_crtc_init_with_planes").

This callback is optional.

RETURNS:

0 on success or a negative error code on failure.

`cursor_move`

Update the cursor position. The cursor does not need to be visible when this hook is called.

This entry point is deprecated, drivers should instead implement universal plane support and register a proper cursor plane using[drm\_crtc\_init\_with\_planes()](#c.drm%5Fcrtc%5Finit%5Fwith%5Fplanes "drm_crtc_init_with_planes").

This callback is optional.

RETURNS:

0 on success or a negative error code on failure.

`gamma_set`

Set gamma on the CRTC.

This callback is optional.

Atomic drivers who want to support gamma tables should implement the atomic color management support, enabled by calling[drm\_crtc\_enable\_color\_mgmt()](#c.drm%5Fcrtc%5Fenable%5Fcolor%5Fmgmt "drm_crtc_enable_color_mgmt"), which then supports the legacy gamma interface through the [drm\_atomic\_helper\_legacy\_gamma\_set()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Flegacy%5Fgamma%5Fset "drm_atomic_helper_legacy_gamma_set")compatibility implementation.

`destroy`

Clean up plane resources. This is only called at driver unload time through [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup") since a CRTC cannot be hotplugged in DRM.

`set_config`

This is the main legacy entry point to change the modeset state on a CRTC. All the details of the desired configuration are passed in a[struct drm\_mode\_set](#c.drm%5Fmode%5Fset "drm_mode_set") \- see there for details.

Drivers implementing atomic modeset should use[drm\_atomic\_helper\_set\_config()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fset%5Fconfig "drm_atomic_helper_set_config") to implement this hook.

RETURNS:

0 on success or a negative error code on failure.

`page_flip`

Legacy entry point to schedule a flip to the given framebuffer.

Page flipping is a synchronization mechanism that replaces the frame buffer being scanned out by the CRTC with a new frame buffer during vertical blanking, avoiding tearing (except when requested otherwise through the DRM\_MODE\_PAGE\_FLIP\_ASYNC flag). When an application requests a page flip the DRM core verifies that the new frame buffer is large enough to be scanned out by the CRTC in the currently configured mode and then calls this hook with a pointer to the new frame buffer.

The driver must wait for any pending rendering to the new framebuffer to complete before executing the flip. It should also wait for any pending rendering from other drivers if the underlying buffer is a shared dma-buf.

An application can request to be notified when the page flip has completed. The drm core will supply a `struct drm_event` in the event parameter in this case. This can be handled by the[drm\_crtc\_send\_vblank\_event()](#c.drm%5Fcrtc%5Fsend%5Fvblank%5Fevent "drm_crtc_send_vblank_event") function, which the driver should call on the provided event upon completion of the flip. Note that if the driver supports vblank signalling and timestamping the vblank counters and timestamps must agree with the ones returned from page flip events. With the current vblank helper infrastructure this can be achieved by holding a vblank reference while the page flip is pending, acquired through [drm\_crtc\_vblank\_get()](#c.drm%5Fcrtc%5Fvblank%5Fget "drm_crtc_vblank_get") and released with[drm\_crtc\_vblank\_put()](#c.drm%5Fcrtc%5Fvblank%5Fput "drm_crtc_vblank_put"). Drivers are free to implement their own vblank counter and timestamp tracking though, e.g. if they have accurate timestamp registers in hardware.

This callback is optional.

NOTE:

Very early versions of the KMS ABI mandated that the driver must block (but not reject) any rendering to the old framebuffer until the flip operation has completed and the old framebuffer is no longer visible. This requirement has been lifted, and userspace is instead expected to request delivery of an event and wait with recycling old buffers until such has been received.

RETURNS:

0 on success or a negative error code on failure. Note that if a page flip operation is already pending the callback should return -EBUSY. Pageflips on a disabled CRTC (either by setting a NULL mode or just runtime disabled through DPMS respectively the new atomic “ACTIVE” state) should result in an -EINVAL error code. Note that[drm\_atomic\_helper\_page\_flip()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fpage%5Fflip "drm_atomic_helper_page_flip") checks this already for atomic drivers.

`page_flip_target`

Same as **page\_flip** but with an additional parameter specifying the absolute target vertical blank period (as reported by[drm\_crtc\_vblank\_count()](#c.drm%5Fcrtc%5Fvblank%5Fcount "drm_crtc_vblank_count")) when the flip should take effect.

Note that the core code calls drm\_crtc\_vblank\_get before this entry point, and will call drm\_crtc\_vblank\_put if this entry point returns any non-0 error code. It’s the driver’s responsibility to call drm\_crtc\_vblank\_put after this entry point returns 0, typically when the flip completes.

`set_property`

This is the legacy entry point to update a property attached to the CRTC.

This callback is optional if the driver does not support any legacy driver-private properties. For atomic drivers it is not used because property handling is done entirely in the DRM core.

RETURNS:

0 on success or a negative error code on failure.

`atomic_duplicate_state`

Duplicate the current atomic state for this CRTC and return it. The core and helpers guarantee that any atomic state duplicated with this hook and still owned by the caller (i.e. not transferred to the driver by calling [drm\_mode\_config\_funcs.atomic\_commit](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs")) will be cleaned up by calling the **atomic\_destroy\_state** hook in this structure.

Atomic drivers which don’t subclass [struct drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") should use[drm\_atomic\_helper\_crtc\_duplicate\_state()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fcrtc%5Fduplicate%5Fstate "drm_atomic_helper_crtc_duplicate_state"). Drivers that subclass the state structure to extend it with driver-private state should use[\_\_drm\_atomic\_helper\_crtc\_duplicate\_state()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.%5F%5Fdrm%5Fatomic%5Fhelper%5Fcrtc%5Fduplicate%5Fstate "__drm_atomic_helper_crtc_duplicate_state") to make sure shared state is duplicated in a consistent fashion across drivers.

It is an error to call this hook before [drm\_crtc.state](#c.drm%5Fcrtc "drm_crtc") has been initialized correctly.

NOTE:

If the duplicate state references refcounted resources this hook must acquire a reference for each of them. The driver must release these references again in **atomic\_destroy\_state**.

RETURNS:

Duplicated atomic state or NULL when the allocation failed.

`atomic_destroy_state`

Destroy a state duplicated with **atomic\_duplicate\_state** and release or unreference all resources it references

`atomic_set_property`

Decode a driver-private property value and store the decoded value into the passed-in state structure. Since the atomic core decodes all standardized properties (even for extensions beyond the core set of properties which might not be implemented by all drivers) this requires drivers to subclass the state structure.

Such driver-private properties should really only be implemented for truly hardware/vendor specific state. Instead it is preferred to standardize atomic extension and decode the properties used to expose such an extension in the core.

Do not call this function directly, use[drm\_atomic\_crtc\_set\_property()](#c.drm%5Fatomic%5Fcrtc%5Fset%5Fproperty "drm_atomic_crtc_set_property") instead.

This callback is optional if the driver does not support any driver-private atomic properties.

NOTE:

This function is called in the state assembly phase of atomic modesets, which can be aborted for any reason (including on userspace’s request to just check whether a configuration would be possible). Drivers MUST NOT touch any persistent state (hardware or software) or data structures except the passed in **state** parameter.

Also since userspace controls in which order properties are set this function must not do any input validation (since the state update is incomplete and hence likely inconsistent). Instead any such input validation must be done in the various atomic\_check callbacks.

RETURNS:

0 if the property has been found, -EINVAL if the property isn’t implemented by the driver (which should never happen, the core only asks for properties attached to this CRTC). No other validation is allowed by the driver. The core already checks that the property value is within the range (integer, valid enum value, ...) the driver set when registering the property.

`atomic_get_property`

Reads out the decoded driver-private property. This is used to implement the GETCRTC IOCTL.

Do not call this function directly, use`drm_atomic_crtc_get_property()` instead.

This callback is optional if the driver does not support any driver-private atomic properties.

RETURNS:

0 on success, -EINVAL if the property isn’t implemented by the driver (which should never happen, the core only asks for properties attached to this CRTC).

`late_register`

This optional hook can be used to register additional userspace interfaces attached to the crtc like debugfs interfaces. It is called late in the driver load sequence from [drm\_dev\_register()](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdev%5Fregister "drm_dev_register"). Everything added from this callback should be unregistered in the early\_unregister callback.

Returns:

0 on success, or a negative error code on failure.

`early_unregister`

This optional hook should be used to unregister the additional userspace interfaces attached to the crtc from**late\_register**. It is called from [drm\_dev\_unregister()](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdev%5Funregister "drm_dev_unregister"), early in the driver unload sequence to disable userspace access before data structures are torndown.

`set_crc_source`

Changes the source of CRC checksums of frames at the request of userspace, typically for testing purposes. The sources available are specific of each driver and a `NULL` value indicates that CRC generation is to be switched off.

When CRC generation is enabled, the driver should call[drm\_crtc\_add\_crc\_entry()](https://www.kernel.org/doc/html/v4.15/gpu/drm-uapi.html#c.drm%5Fcrtc%5Fadd%5Fcrc%5Fentry "drm_crtc_add_crc_entry") at each frame, providing any information that characterizes the frame contents in the crcN arguments, as provided from the configured source. Drivers must accept an “auto” source name that will select a default source for this CRTC.

Note that “auto” can depend upon the current modeset configuration, e.g. it could pick an encoder or output specific CRC sampling point.

This callback is optional if the driver does not support any CRC generation functionality.

RETURNS:

0 on success or a negative error code on failure.

`atomic_print_state`

If driver subclasses [struct drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state"), it should implement this optional hook for printing additional driver specific state.

Do not call this directly, use `drm_atomic_crtc_print_state()`instead.

`get_vblank_counter`

Driver callback for fetching a raw hardware vblank counter for the CRTC. It’s meant to be used by new drivers as the replacement of[drm\_driver.get\_vblank\_counter](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") hook.

This callback is optional. If a device doesn’t have a hardware counter, the driver can simply leave the hook as NULL. The DRM core will account for missed vblank events while interrupts where disabled based on system timestamps.

Wraparound handling and loss of events due to modesetting is dealt with in the DRM core code, as long as drivers call[drm\_crtc\_vblank\_off()](#c.drm%5Fcrtc%5Fvblank%5Foff "drm_crtc_vblank_off") and [drm\_crtc\_vblank\_on()](#c.drm%5Fcrtc%5Fvblank%5Fon "drm_crtc_vblank_on") when disabling or enabling a CRTC.

See also `drm_device.vblank_disable_immediate` and`drm_device.max_vblank_count`.

Returns:

Raw vblank counter value.

`enable_vblank`

Enable vblank interrupts for the CRTC. It’s meant to be used by new drivers as the replacement of [drm\_driver.enable\_vblank](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") hook.

Returns:

Zero on success, appropriate errno if the vblank interrupt cannot be enabled.

`disable_vblank`

Disable vblank interrupts for the CRTC. It’s meant to be used by new drivers as the replacement of [drm\_driver.disable\_vblank](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") hook.

**Description**

The drm\_crtc\_funcs structure is the central CRTC management structure in the DRM. Each CRTC controls one or more connectors (note that the name CRTC is simply historical, a CRTC may control LVDS, VGA, DVI, TV out, etc. connectors, not just CRTs).

Each driver is responsible for filling out this structure at startup time, in addition to providing other modesetting features, like i2c and DDC bus accessors.

struct `drm_crtc`[¶](#c.drm%5Fcrtc "Permalink to this definition")

central CRTC control structure

**Definition**

struct drm_crtc {
  struct drm_device * dev;
  struct device_node * port;
  struct list_head head;
  char * name;
  struct drm_modeset_lock mutex;
  struct drm_mode_object base;
  struct drm_plane * primary;
  struct drm_plane * cursor;
  unsigned index;
  int cursor_x;
  int cursor_y;
  bool enabled;
  struct drm_display_mode mode;
  struct drm_display_mode hwmode;
  int x;
  int y;
  const struct drm_crtc_funcs * funcs;
  uint32_t gamma_size;
  uint16_t * gamma_store;
  const struct drm_crtc_helper_funcs * helper_private;
  struct drm_object_properties properties;
  struct drm_crtc_state * state;
  struct list_head commit_list;
  spinlock_t commit_lock;
#ifdef CONFIG_DEBUG_FS
  struct dentry * debugfs_entry;
#endif
  struct drm_crtc_crc crc;
  unsigned int fence_context;
  spinlock_t fence_lock;
  unsigned long fence_seqno;
  char timeline_name;
};

**Members**

`dev`

parent DRM device

`port`

OF node used by `drm_of_find_possible_crtcs()`

`head`

list management

`name`

human readable name, can be overwritten by the driver

`mutex`

This provides a read lock for the overall CRTC state (mode, dpms state, ...) and a write lock for everything which can be update without a full modeset (fb, cursor data, CRTC properties ...). A full modeset also need to grab [drm\_mode\_config.connection\_mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config").

For atomic drivers specifically this protects **state**.

`base`

base KMS object for ID tracking etc.

`primary`

primary plane for this CRTC

`cursor`

cursor plane for this CRTC

`index`

Position inside the mode\_config.list, can be used as an array index. It is invariant over the lifetime of the CRTC.

`cursor_x`

current x position of the cursor, used for universal cursor planes

`cursor_y`

current y position of the cursor, used for universal cursor planes

`enabled`

is this CRTC enabled?

`mode`

current mode timings

`hwmode`

mode timings as programmed to hw regs

`x`

x position on screen

`y`

y position on screen

`funcs`

CRTC control functions

`gamma_size`

size of gamma ramp

`gamma_store`

gamma ramp values

`helper_private`

mid-layer private data

`properties`

property tracking for this CRTC

`state`

Current atomic state for this CRTC.

This is protected by **mutex**. Note that nonblocking atomic commits access the current CRTC state without taking locks. Either by going through the [struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointers, see[for\_each\_oldnew\_crtc\_in\_state()](#c.for%5Feach%5Foldnew%5Fcrtc%5Fin%5Fstate "for_each_oldnew_crtc_in_state"), [for\_each\_old\_crtc\_in\_state()](#c.for%5Feach%5Fold%5Fcrtc%5Fin%5Fstate "for_each_old_crtc_in_state") and[for\_each\_new\_crtc\_in\_state()](#c.for%5Feach%5Fnew%5Fcrtc%5Fin%5Fstate "for_each_new_crtc_in_state"). Or through careful ordering of atomic commit operations as implemented in the atomic helpers, see[struct drm\_crtc\_commit](#c.drm%5Fcrtc%5Fcommit "drm_crtc_commit").

`commit_list`

List of [drm\_crtc\_commit](#c.drm%5Fcrtc%5Fcommit "drm_crtc_commit") structures tracking pending commits. Protected by **commit\_lock**. This list holds its own full reference, as does the ongoing commit.

“Note that the commit for a state change is also tracked in[drm\_crtc\_state.commit](#c.drm%5Fcrtc%5Fstate "drm_crtc_state"). For accessing the immediately preceding commit in an atomic update it is recommended to just use that pointer in the old CRTC state, since accessing that doesn’t need any locking or list-walking. **commit\_list** should only be used to stall for framebuffer cleanup that’s signalled through[drm\_crtc\_commit.cleanup\_done](#c.drm%5Fcrtc%5Fcommit "drm_crtc_commit").”

`commit_lock`

Spinlock to protect **commit\_list**.

`debugfs_entry`

Debugfs directory for this CRTC.

`crc`

Configuration settings of CRC capture.

`fence_context`

timeline context used for fence operations.

`fence_lock`

spinlock to protect the fences in the fence\_context.

`fence_seqno`

Seqno variable used as monotonic counter for the fences created on the CRTC’s timeline.

`timeline_name`

The name of the CRTC’s fence timeline.

**Description**

Each CRTC may have one or more connectors associated with it. This structure allows the CRTC to be controlled.

struct `drm_mode_set`[¶](#c.drm%5Fmode%5Fset "Permalink to this definition")

new values for a CRTC config change

**Definition**

struct drm_mode_set {
  struct drm_framebuffer * fb;
  struct drm_crtc * crtc;
  struct drm_display_mode * mode;
  uint32_t x;
  uint32_t y;
  struct drm_connector ** connectors;
  size_t num_connectors;
};

**Members**

`fb`

framebuffer to use for new config

`crtc`

CRTC whose configuration we’re about to change

`mode`

mode timings to use

`x`

position of this CRTC relative to **fb**

`y`

position of this CRTC relative to **fb**

`connectors`

array of connectors to drive with this CRTC if possible

`num_connectors`

size of **connectors** array

**Description**

This represents a modeset configuration for the legacy SETCRTC ioctl and is also used internally. Atomic drivers instead use [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state").

unsigned int `drm_crtc_index`(const struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Findex "Permalink to this definition")

find the index of a registered CRTC

**Parameters**

`const struct drm_crtc * crtc`

CRTC to find index for

**Description**

Given a registered CRTC, return the index of that CRTC within a DRM device’s list of CRTCs.

uint32\_t `drm_crtc_mask`(const struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fmask "Permalink to this definition")

find the mask of a registered CRTC

**Parameters**

`const struct drm_crtc * crtc`

CRTC to find mask for

**Description**

Given a registered CRTC, return the mask bit of that CRTC for an encoder’s possible\_crtcs field.

struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* `drm_crtc_find`(struct drm\_device \* _dev_, struct [drm\_file](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file") \* _file\_priv_, uint32\_t _id_)[¶](#c.drm%5Fcrtc%5Ffind "Permalink to this definition")

look up a CRTC object from its ID

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_file * file_priv`

drm file to check for lease against.

`uint32_t id`

[drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") ID

**Description**

This can be used to look up a CRTC from its userspace ID. Only used by drivers for legacy IOCTLs and interface, nowadays extensions to the KMS userspace interface should be done using [drm\_property](#c.drm%5Fproperty "drm_property").

`drm_for_each_crtc`(_crtc_, _dev_)[¶](#c.drm%5Ffor%5Feach%5Fcrtc "Permalink to this definition")

iterate over all CRTCs

**Parameters**

`crtc`

a [struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc") as the loop cursor

`dev`

the `struct drm_device`

**Description**

Iterate over all CRTCs of **dev**.

struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* `drm_crtc_from_index`(struct drm\_device \* _dev_, int _idx_)[¶](#c.drm%5Fcrtc%5Ffrom%5Findex "Permalink to this definition")

find the registered CRTC at an index

**Parameters**

`struct drm_device * dev`

DRM device

`int idx`

index of registered CRTC to find for

**Description**

Given a CRTC index, return the registered CRTC from DRM device’s list of CRTCs with matching index. This is the inverse of [drm\_crtc\_index()](#c.drm%5Fcrtc%5Findex "drm_crtc_index"). It’s useful in the vblank callbacks (like [drm\_driver.enable\_vblank](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") or[drm\_driver.disable\_vblank](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver")), since that still deals with indices instead of pointers to [struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc").”

int `drm_crtc_force_disable`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fforce%5Fdisable "Permalink to this definition")

Forcibly turn off a CRTC

**Parameters**

`struct drm_crtc * crtc`

CRTC to turn off

**Note**

This should only be used by non-atomic legacy drivers.

**Return**

Zero on success, error code on failure.

int `drm_crtc_force_disable_all`(struct drm\_device \* _dev_)[¶](#c.drm%5Fcrtc%5Fforce%5Fdisable%5Fall "Permalink to this definition")

Forcibly turn off all enabled CRTCs

**Parameters**

`struct drm_device * dev`

DRM device whose CRTCs to turn off

**Description**

Drivers may want to call this on unload to ensure that all displays are unlit and the GPU is in a consistent, low power state. Takes modeset locks.

**Note**

This should only be used by non-atomic legacy drivers. For an atomic version look at [drm\_atomic\_helper\_shutdown()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fshutdown "drm_atomic_helper_shutdown").

**Return**

Zero on success, error code on failure.

int `drm_crtc_init_with_planes`(struct drm\_device \* _dev_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _primary_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _cursor_, const struct [drm\_crtc\_funcs](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs") \* _funcs_, const char \* _name_, ...)[¶](#c.drm%5Fcrtc%5Finit%5Fwith%5Fplanes "Permalink to this definition")

Initialise a new CRTC object with specified primary and cursor planes.

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_crtc * crtc`

CRTC object to init

`struct drm_plane * primary`

Primary plane for CRTC

`struct drm_plane * cursor`

Cursor plane for CRTC

`const struct drm_crtc_funcs * funcs`

callbacks for the new CRTC

`const char * name`

printf style format string for the CRTC name, or NULL for default name

`...`

variable arguments

**Description**

Inits a new object created as base part of a driver crtc object. Drivers should use this function instead of [drm\_crtc\_init()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fcrtc%5Finit "drm_crtc_init"), which is only provided for backwards compatibility with drivers which do not yet support universal planes). For really simple hardware which has only 1 plane look at[drm\_simple\_display\_pipe\_init()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fsimple%5Fdisplay%5Fpipe%5Finit "drm_simple_display_pipe_init") instead.

**Return**

Zero on success, error code on failure.

void `drm_crtc_cleanup`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fcleanup "Permalink to this definition")

Clean up the core crtc usage

**Parameters**

`struct drm_crtc * crtc`

CRTC to cleanup

**Description**

This function cleans up **crtc** and removes it from the DRM mode setting core. Note that the function does _not_ free the crtc structure itself, this is the responsibility of the caller.

int `drm_mode_set_config_internal`(struct [drm\_mode\_set](#c.drm%5Fmode%5Fset "drm_mode_set") \* _set_)[¶](#c.drm%5Fmode%5Fset%5Fconfig%5Finternal "Permalink to this definition")

helper to call [drm\_mode\_config\_funcs.set\_config](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs")

**Parameters**

`struct drm_mode_set * set`

modeset config to set

**Description**

This is a little helper to wrap internal calls to the[drm\_mode\_config\_funcs.set\_config](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs") driver interface. The only thing it adds is correct refcounting dance.

This should only be used by non-atomic legacy drivers.

**Return**

Zero on success, negative errno on failure.

int `drm_crtc_check_viewport`(const struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, int _x_, int _y_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_, const struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fcrtc%5Fcheck%5Fviewport "Permalink to this definition")

Checks that a framebuffer is big enough for the CRTC viewport

**Parameters**

`const struct drm_crtc * crtc`

CRTC that framebuffer will be displayed on

`int x`

x panning

`int y`

y panning

`const struct drm_display_mode * mode`

mode that framebuffer will be displayed under

`const struct drm_framebuffer * fb`

framebuffer to check size of

## Frame Buffer Abstraction[¶](#frame-buffer-abstraction "Permalink to this headline")

Frame buffers are abstract memory objects that provide a source of pixels to scanout to a CRTC. Applications explicitly request the creation of frame buffers through the DRM\_IOCTL\_MODE\_ADDFB(2) ioctls and receive an opaque handle that can be passed to the KMS CRTC control, plane configuration and page flip functions.

Frame buffers rely on the underlying memory manager for allocating backing storage. When creating a frame buffer applications pass a memory handle (or a list of memory handles for multi-planar formats) through the`struct drm_mode_fb_cmd2` argument. For drivers using GEM as their userspace buffer management interface this would be a GEM handle. Drivers are however free to use their own backing storage object handles, e.g. vmwgfx directly exposes special TTM handles to userspace and so expects TTM handles in the create ioctl and not GEM handles.

Framebuffers are tracked with [struct drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer"). They are published using [drm\_framebuffer\_init()](#c.drm%5Fframebuffer%5Finit "drm_framebuffer_init") \- after calling that function userspace can use and access the framebuffer object. The helper function[drm\_helper\_mode\_fill\_fb\_struct()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fhelper%5Fmode%5Ffill%5Ffb%5Fstruct "drm_helper_mode_fill_fb_struct") can be used to pre-fill the required metadata fields.

The lifetime of a drm framebuffer is controlled with a reference count, drivers can grab additional references with [drm\_framebuffer\_get()](#c.drm%5Fframebuffer%5Fget "drm_framebuffer_get") and drop them again with [drm\_framebuffer\_put()](#c.drm%5Fframebuffer%5Fput "drm_framebuffer_put"). For driver-private framebuffers for which the last reference is never dropped (e.g. for the fbdev framebuffer when the struct [struct drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") is embedded into the fbdev helper struct) drivers can manually clean up a framebuffer at module unload time with [drm\_framebuffer\_unregister\_private()](#c.drm%5Fframebuffer%5Funregister%5Fprivate "drm_framebuffer_unregister_private"). But doing this is not recommended, and it’s better to have a normal free-standing [structdrm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer").

### Frame Buffer Functions Reference[¶](#frame-buffer-functions-reference "Permalink to this headline")

struct `drm_framebuffer_funcs`[¶](#c.drm%5Fframebuffer%5Ffuncs "Permalink to this definition")

framebuffer hooks

**Definition**

struct drm_framebuffer_funcs {
  void (* destroy) (struct drm_framebuffer *framebuffer);
  int (* create_handle) (struct drm_framebuffer *fb,struct drm_file *file_priv, unsigned int *handle);
  int (* dirty) (struct drm_framebuffer *framebuffer,struct drm_file *file_priv, unsigned flags,unsigned color, struct drm_clip_rect *clips, unsigned num_clips);
};

**Members**

`destroy`

Clean up framebuffer resources, specifically also unreference the backing storage. The core guarantees to call this function for every framebuffer successfully created by calling[drm\_mode\_config\_funcs.fb\_create](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs"). Drivers must also call[drm\_framebuffer\_cleanup()](#c.drm%5Fframebuffer%5Fcleanup "drm_framebuffer_cleanup") to release DRM core resources for this framebuffer.

`create_handle`

Create a buffer handle in the driver-specific buffer manager (either GEM or TTM) valid for the passed-in [struct drm\_file](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file"). This is used by the core to implement the GETFB IOCTL, which returns (for sufficiently priviledged user) also a native buffer handle. This can be used for seamless transitions between modesetting clients by copying the current screen contents to a private buffer and blending between that and the new contents.

GEM based drivers should call [drm\_gem\_handle\_create()](https://www.kernel.org/doc/html/v4.15/gpu/drm-mm.html#c.drm%5Fgem%5Fhandle%5Fcreate "drm_gem_handle_create") to create the handle.

RETURNS:

0 on success or a negative error code on failure.

`dirty`

Optional callback for the dirty fb IOCTL.

Userspace can notify the driver via this callback that an area of the framebuffer has changed and should be flushed to the display hardware. This can also be used internally, e.g. by the fbdev emulation, though that’s not the case currently.

See documentation in drm\_mode.h for the struct drm\_mode\_fb\_dirty\_cmd for more information as all the semantics and arguments have a one to one mapping on this function.

RETURNS:

0 on success or a negative error code on failure.

struct `drm_framebuffer`[¶](#c.drm%5Fframebuffer "Permalink to this definition")

frame buffer object

**Definition**

struct drm_framebuffer {
  struct drm_device * dev;
  struct list_head head;
  struct drm_mode_object base;
  const struct drm_format_info * format;
  const struct drm_framebuffer_funcs * funcs;
  unsigned int pitches;
  unsigned int offsets;
  uint64_t modifier;
  unsigned int width;
  unsigned int height;
  int flags;
  int hot_x;
  int hot_y;
  struct list_head filp_head;
  struct drm_gem_object * obj;
};

**Members**

`dev`

DRM device this framebuffer belongs to

`head`

Place on the [drm\_mode\_config.fb\_list](#c.drm%5Fmode%5Fconfig "drm_mode_config"), access protected by[drm\_mode\_config.fb\_lock](#c.drm%5Fmode%5Fconfig "drm_mode_config").

`base`

base modeset object structure, contains the reference count.

`format`

framebuffer format information

`funcs`

framebuffer vfunc table

`pitches`

Line stride per buffer. For userspace created object this is copied from drm\_mode\_fb\_cmd2.

`offsets`

Offset from buffer start to the actual pixel data in bytes, per buffer. For userspace created object this is copied from drm\_mode\_fb\_cmd2.

Note that this is a linear offset and does not take into account tiling or buffer laytou per **modifier**. It meant to be used when the actual pixel data for this framebuffer plane starts at an offset, e.g. when multiple planes are allocated within the same backing storage buffer object. For tiled layouts this generally means it**offsets** must at least be tile-size aligned, but hardware often has stricter requirements.

This should not be used to specifiy x/y pixel offsets into the buffer data (even for linear buffers). Specifying an x/y pixel offset is instead done through the source rectangle in [struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state").

`modifier`

Data layout modifier. This is used to describe tiling, or also special layouts (like compression) of auxiliary buffers. For userspace created object this is copied from drm\_mode\_fb\_cmd2.

`width`

Logical width of the visible area of the framebuffer, in pixels.

`height`

Logical height of the visible area of the framebuffer, in pixels.

`flags`

Framebuffer flags like DRM\_MODE\_FB\_INTERLACED or DRM\_MODE\_FB\_MODIFIERS.

`hot_x`

X coordinate of the cursor hotspot. Used by the legacy cursor IOCTL when the driver supports cursor through a DRM\_PLANE\_TYPE\_CURSOR universal plane.

`hot_y`

Y coordinate of the cursor hotspot. Used by the legacy cursor IOCTL when the driver supports cursor through a DRM\_PLANE\_TYPE\_CURSOR universal plane.

`filp_head`

Placed on [drm\_file.fbs](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file"), protected by [drm\_file.fbs\_lock](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file").

`obj`

GEM objects backing the framebuffer, one per plane (optional).

This is used by the GEM framebuffer helpers, see e.g.[drm\_gem\_fb\_create()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fgem%5Ffb%5Fcreate "drm_gem_fb_create").

**Description**

Note that the fb is refcounted for the benefit of driver internals, for example some hw, disabling a CRTC/plane is asynchronous, and scanout does not actually complete until the next vblank. So some cleanup (like releasing the reference(s) on the backing GEM bo(s)) should be deferred. In cases like this, the driver would like to hold a ref to the fb even though it has already been removed from userspace perspective. See [drm\_framebuffer\_get()](#c.drm%5Fframebuffer%5Fget "drm_framebuffer_get") and[drm\_framebuffer\_put()](#c.drm%5Fframebuffer%5Fput "drm_framebuffer_put").

The refcount is stored inside the mode object **base**.

void `drm_framebuffer_get`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Fget "Permalink to this definition")

acquire a framebuffer reference

**Parameters**

`struct drm_framebuffer * fb`

DRM framebuffer

**Description**

This function increments the framebuffer’s reference count.

void `drm_framebuffer_put`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Fput "Permalink to this definition")

release a framebuffer reference

**Parameters**

`struct drm_framebuffer * fb`

DRM framebuffer

**Description**

This function decrements the framebuffer’s reference count and frees the framebuffer if the reference count drops to zero.

void `drm_framebuffer_reference`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Freference "Permalink to this definition")

acquire a framebuffer reference

**Parameters**

`struct drm_framebuffer * fb`

DRM framebuffer

**Description**

This is a compatibility alias for [drm\_framebuffer\_get()](#c.drm%5Fframebuffer%5Fget "drm_framebuffer_get") and should not be used by new code.

void `drm_framebuffer_unreference`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Funreference "Permalink to this definition")

release a framebuffer reference

**Parameters**

`struct drm_framebuffer * fb`

DRM framebuffer

**Description**

This is a compatibility alias for [drm\_framebuffer\_put()](#c.drm%5Fframebuffer%5Fput "drm_framebuffer_put") and should not be used by new code.

uint32\_t `drm_framebuffer_read_refcount`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Fread%5Frefcount "Permalink to this definition")

read the framebuffer reference count.

**Parameters**

`struct drm_framebuffer * fb`

framebuffer

**Description**

This functions returns the framebuffer’s reference count.

void `drm_framebuffer_assign`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \*\* _p_, struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Fassign "Permalink to this definition")

store a reference to the fb

**Parameters**

`struct drm_framebuffer ** p`

location to store framebuffer

`struct drm_framebuffer * fb`

new framebuffer (maybe NULL)

**Description**

This functions sets the location to store a reference to the framebuffer, unreferencing the framebuffer that was previously stored in that location.

int `drm_framebuffer_init`(struct drm\_device \* _dev_, struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_, const struct [drm\_framebuffer\_funcs](#c.drm%5Fframebuffer%5Ffuncs "drm_framebuffer_funcs") \* _funcs_)[¶](#c.drm%5Fframebuffer%5Finit "Permalink to this definition")

initialize a framebuffer

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_framebuffer * fb`

framebuffer to be initialized

`const struct drm_framebuffer_funcs * funcs`

... with these functions

**Description**

Allocates an ID for the framebuffer’s parent mode object, sets its mode functions & device file and adds it to the master fd list.

IMPORTANT: This functions publishes the fb and makes it available for concurrent access by other users. Which means by this point the fb \_must\_ be fully set up - since all the fb attributes are invariant over its lifetime, no further locking but only correct reference counting is required.

**Return**

Zero on success, error code on failure.

struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* `drm_framebuffer_lookup`(struct drm\_device \* _dev_, struct [drm\_file](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file") \* _file\_priv_, uint32\_t _id_)[¶](#c.drm%5Fframebuffer%5Flookup "Permalink to this definition")

look up a drm framebuffer and grab a reference

**Parameters**

`struct drm_device * dev`

drm device

`struct drm_file * file_priv`

drm file to check for lease against.

`uint32_t id`

id of the fb object

**Description**

If successful, this grabs an additional reference to the framebuffer - callers need to make sure to eventually unreference the returned framebuffer again, using [drm\_framebuffer\_put()](#c.drm%5Fframebuffer%5Fput "drm_framebuffer_put").

void `drm_framebuffer_unregister_private`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Funregister%5Fprivate "Permalink to this definition")

unregister a private fb from the lookup idr

**Parameters**

`struct drm_framebuffer * fb`

fb to unregister

**Description**

Drivers need to call this when cleaning up driver-private framebuffers, e.g. those used for fbdev. Note that the caller must hold a reference of it’s own, i.e. the object may not be destroyed through this call (since it’ll lead to a locking inversion).

**NOTE**

This function is deprecated. For driver-private framebuffers it is not recommended to embed a framebuffer struct info fbdev struct, instead, a framebuffer pointer is preferred and [drm\_framebuffer\_put()](#c.drm%5Fframebuffer%5Fput "drm_framebuffer_put") should be called when the framebuffer is to be cleaned up.

void `drm_framebuffer_cleanup`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Fcleanup "Permalink to this definition")

remove a framebuffer object

**Parameters**

`struct drm_framebuffer * fb`

framebuffer to remove

**Description**

Cleanup framebuffer. This function is intended to be used from the drivers[drm\_framebuffer\_funcs.destroy](#c.drm%5Fframebuffer%5Ffuncs "drm_framebuffer_funcs") callback. It can also be used to clean up driver private framebuffers embedded into a larger structure.

Note that this function does not remove the fb from active usage - if it is still used anywhere, hilarity can ensue since userspace could call getfb on the id and get back -EINVAL. Obviously no concern at driver unload time.

Also, the framebuffer will not be removed from the lookup idr - for user-created framebuffers this will happen in in the rmfb ioctl. For driver-private objects (e.g. for fbdev) drivers need to explicitly call drm\_framebuffer\_unregister\_private.

void `drm_framebuffer_remove`(struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_)[¶](#c.drm%5Fframebuffer%5Fremove "Permalink to this definition")

remove and unreference a framebuffer object

**Parameters**

`struct drm_framebuffer * fb`

framebuffer to remove

**Description**

Scans all the CRTCs and planes in **dev**‘s mode\_config. If they’re using **fb**, removes it, setting it to NULL. Then drops the reference to the passed-in framebuffer. Might take the modeset locks.

Note that this function optimizes the cleanup away if the caller holds the last reference to the framebuffer. It is also guaranteed to not take the modeset locks in this case.

int `drm_framebuffer_plane_width`(int _width_, const struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_, int _plane_)[¶](#c.drm%5Fframebuffer%5Fplane%5Fwidth "Permalink to this definition")

width of the plane given the first plane

**Parameters**

`int width`

width of the first plane

`const struct drm_framebuffer * fb`

the framebuffer

`int plane`

plane index

**Return**

The width of **plane**, given that the width of the first plane is **width**.

int `drm_framebuffer_plane_height`(int _height_, const struct [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") \* _fb_, int _plane_)[¶](#c.drm%5Fframebuffer%5Fplane%5Fheight "Permalink to this definition")

height of the plane given the first plane

**Parameters**

`int height`

height of the first plane

`const struct drm_framebuffer * fb`

the framebuffer

`int plane`

plane index

**Return**

The height of **plane**, given that the height of the first plane is **height**.

## DRM Format Handling[¶](#drm-format-handling "Permalink to this headline")

struct `drm_format_info`[¶](#c.drm%5Fformat%5Finfo "Permalink to this definition")

information about a DRM format

**Definition**

struct drm_format_info {
  u32 format;
  u8 depth;
  u8 num_planes;
  u8 cpp;
  u8 hsub;
  u8 vsub;
};

**Members**

`format`

4CC format identifier (DRM\_FORMAT\_\*)

`depth`

Color depth (number of bits per pixel excluding padding bits), valid for a subset of RGB formats only. This is a legacy field, do not use in new code and set to 0 for new formats.

`num_planes`

Number of color planes (1 to 3)

`cpp`

Number of bytes per pixel (per plane)

`hsub`

Horizontal chroma subsampling factor

`vsub`

Vertical chroma subsampling factor

struct `drm_format_name_buf`[¶](#c.drm%5Fformat%5Fname%5Fbuf "Permalink to this definition")

name of a DRM format

**Definition**

struct drm_format_name_buf {
  char str;
};

**Members**

`str`

string buffer containing the format name

uint32\_t `drm_mode_legacy_fb_format`(uint32\_t _bpp_, uint32\_t _depth_)[¶](#c.drm%5Fmode%5Flegacy%5Ffb%5Fformat "Permalink to this definition")

compute drm fourcc code from legacy description

**Parameters**

`uint32_t bpp`

bits per pixels

`uint32_t depth`

bit depth per pixel

**Description**

Computes a drm fourcc pixel format code for the given **bpp**/**depth** values. Useful in fbdev emulation code, since that deals in those values.

const char \* `drm_get_format_name`(uint32\_t _format_, struct [drm\_format\_name\_buf](#c.drm%5Fformat%5Fname%5Fbuf "drm_format_name_buf") \* _buf_)[¶](#c.drm%5Fget%5Fformat%5Fname "Permalink to this definition")

fill a string with a drm fourcc format’s name

**Parameters**

`uint32_t format`

format to compute name of

`struct drm_format_name_buf * buf`

caller-supplied buffer

const struct [drm\_format\_info](#c.drm%5Fformat%5Finfo "drm_format_info") \* `drm_format_info`(u32 _format_)

query information for a given format

**Parameters**

`u32 format`

pixel format (DRM\_FORMAT\_\*)

**Description**

The caller should only pass a supported pixel format to this function. Unsupported pixel formats will generate a warning in the kernel log.

**Return**

The instance of struct drm\_format\_info that describes the pixel format, or NULL if the format is unsupported.

const struct [drm\_format\_info](#c.drm%5Fformat%5Finfo "drm_format_info") \* `drm_get_format_info`(struct drm\_device \* _dev_, const struct drm\_mode\_fb\_cmd2 \* _mode\_cmd_)[¶](#c.drm%5Fget%5Fformat%5Finfo "Permalink to this definition")

query information for a given framebuffer configuration

**Parameters**

`struct drm_device * dev`

DRM device

`const struct drm_mode_fb_cmd2 * mode_cmd`

metadata from the userspace fb creation request

**Return**

The instance of struct drm\_format\_info that describes the pixel format, or NULL if the format is unsupported.

int `drm_format_num_planes`(uint32\_t _format_)[¶](#c.drm%5Fformat%5Fnum%5Fplanes "Permalink to this definition")

get the number of planes for format

**Parameters**

`uint32_t format`

pixel format (DRM\_FORMAT\_\*)

**Return**

The number of planes used by the specified pixel format.

int `drm_format_plane_cpp`(uint32\_t _format_, int _plane_)[¶](#c.drm%5Fformat%5Fplane%5Fcpp "Permalink to this definition")

determine the bytes per pixel value

**Parameters**

`uint32_t format`

pixel format (DRM\_FORMAT\_\*)

`int plane`

plane index

**Return**

The bytes per pixel value for the specified plane.

int `drm_format_horz_chroma_subsampling`(uint32\_t _format_)[¶](#c.drm%5Fformat%5Fhorz%5Fchroma%5Fsubsampling "Permalink to this definition")

get the horizontal chroma subsampling factor

**Parameters**

`uint32_t format`

pixel format (DRM\_FORMAT\_\*)

**Return**

The horizontal chroma subsampling factor for the specified pixel format.

int `drm_format_vert_chroma_subsampling`(uint32\_t _format_)[¶](#c.drm%5Fformat%5Fvert%5Fchroma%5Fsubsampling "Permalink to this definition")

get the vertical chroma subsampling factor

**Parameters**

`uint32_t format`

pixel format (DRM\_FORMAT\_\*)

**Return**

The vertical chroma subsampling factor for the specified pixel format.

int `drm_format_plane_width`(int _width_, uint32\_t _format_, int _plane_)[¶](#c.drm%5Fformat%5Fplane%5Fwidth "Permalink to this definition")

width of the plane given the first plane

**Parameters**

`int width`

width of the first plane

`uint32_t format`

pixel format

`int plane`

plane index

**Return**

The width of **plane**, given that the width of the first plane is **width**.

int `drm_format_plane_height`(int _height_, uint32\_t _format_, int _plane_)[¶](#c.drm%5Fformat%5Fplane%5Fheight "Permalink to this definition")

height of the plane given the first plane

**Parameters**

`int height`

height of the first plane

`uint32_t format`

pixel format

`int plane`

plane index

**Return**

The height of **plane**, given that the height of the first plane is **height**.

## Dumb Buffer Objects[¶](#dumb-buffer-objects "Permalink to this headline")

The KMS API doesn’t standardize backing storage object creation and leaves it to driver-specific ioctls. Furthermore actually creating a buffer object even for GEM-based drivers is done through a driver-specific ioctl - GEM only has a common userspace interface for sharing and destroying objects. While not an issue for full-fledged graphics stacks that include device-specific userspace components (in libdrm for instance), this limit makes DRM-based early boot graphics unnecessarily complex.

Dumb objects partly alleviate the problem by providing a standard API to create dumb buffers suitable for scanout, which can then be used to create KMS frame buffers.

To support dumb objects drivers must implement the [drm\_driver.dumb\_create](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver")operation. [drm\_driver.dumb\_destroy](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") defaults to [drm\_gem\_dumb\_destroy()](https://www.kernel.org/doc/html/v4.15/gpu/drm-mm.html#c.drm%5Fgem%5Fdumb%5Fdestroy "drm_gem_dumb_destroy") if not set and [drm\_driver.dumb\_map\_offset](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") defaults to[drm\_gem\_dumb\_map\_offset()](https://www.kernel.org/doc/html/v4.15/gpu/drm-mm.html#c.drm%5Fgem%5Fdumb%5Fmap%5Foffset "drm_gem_dumb_map_offset"). See the callbacks for further details.

Note that dumb objects may not be used for gpu acceleration, as has been attempted on some ARM embedded platforms. Such drivers really must have a hardware-specific ioctl to allocate suitable buffer objects.

## Plane Abstraction[¶](#plane-abstraction "Permalink to this headline")

A plane represents an image source that can be blended with or overlayed on top of a CRTC during the scanout process. Planes take their input data from a[drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") object. The plane itself specifies the cropping and scaling of that image, and where it is placed on the visible are of a display pipeline, represented by [drm\_crtc](#c.drm%5Fcrtc "drm_crtc"). A plane can also have additional properties that specify how the pixels are positioned and blended, like rotation or Z-position. All these properties are stored in [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state").

To create a plane, a KMS drivers allocates and zeroes an instances of[struct drm\_plane](#c.drm%5Fplane "drm_plane") (possibly as part of a larger structure) and registers it with a call to [drm\_universal\_plane\_init()](#c.drm%5Funiversal%5Fplane%5Finit "drm_universal_plane_init").

Cursor and overlay planes are optional. All drivers should provide one primary plane per CRTC to avoid surprising userspace too much. See enum drm\_plane\_type for a more in-depth discussion of these special uapi-relevant plane types. Special planes are associated with their CRTC by calling[drm\_crtc\_init\_with\_planes()](#c.drm%5Fcrtc%5Finit%5Fwith%5Fplanes "drm_crtc_init_with_planes").

The type of a plane is exposed in the immutable “type” enumeration property, which has one of the following values: “Overlay”, “Primary”, “Cursor”.

### Plane Functions Reference[¶](#plane-functions-reference "Permalink to this headline")

struct `drm_plane_state`[¶](#c.drm%5Fplane%5Fstate "Permalink to this definition")

mutable plane state

**Definition**

struct drm_plane_state {
  struct drm_plane * plane;
  struct drm_crtc * crtc;
  struct drm_framebuffer * fb;
  struct dma_fence * fence;
  int32_t crtc_x;
  int32_t crtc_y;
  uint32_t crtc_w;
  uint32_t crtc_h;
  uint32_t src_x;
  uint32_t src_y;
  uint32_t src_h;
  uint32_t src_w;
  unsigned int rotation;
  unsigned int zpos;
  unsigned int normalized_zpos;
  struct drm_rect src;
  struct drm_rect dst;
  bool visible;
  struct drm_crtc_commit * commit;
  struct drm_atomic_state * state;
};

**Members**

`plane`

backpointer to the plane

`crtc`

Currently bound CRTC, NULL if disabled. Do not this write directly, use [drm\_atomic\_set\_crtc\_for\_plane()](#c.drm%5Fatomic%5Fset%5Fcrtc%5Ffor%5Fplane "drm_atomic_set_crtc_for_plane")

`fb`

Currently bound framebuffer. Do not write this directly, use[drm\_atomic\_set\_fb\_for\_plane()](#c.drm%5Fatomic%5Fset%5Ffb%5Ffor%5Fplane "drm_atomic_set_fb_for_plane")

`fence`

Optional fence to wait for before scanning out **fb**. Do not write this directly, use [drm\_atomic\_set\_fence\_for\_plane()](#c.drm%5Fatomic%5Fset%5Ffence%5Ffor%5Fplane "drm_atomic_set_fence_for_plane")

`crtc_x`

Left position of visible portion of plane on crtc, signed dest location allows it to be partially off screen.

`crtc_y`

Upper position of visible portion of plane on crtc, signed dest location allows it to be partially off screen.

`crtc_w`

width of visible portion of plane on crtc

`crtc_h`

height of visible portion of plane on crtc

`src_x`

left position of visible portion of plane within plane (in 16.16)

`src_y`

upper position of visible portion of plane within plane (in 16.16)

`src_h`

height of visible portion of plane (in 16.16)

`src_w`

width of visible portion of plane (in 16.16)

`rotation`

rotation of the plane

`zpos`

priority of the given plane on crtc (optional) Note that multiple active planes on the same crtc can have an identical zpos value. The rule to solving the conflict is to compare the plane object IDs; the plane with a higher ID must be stacked on top of a plane with a lower ID.

`normalized_zpos`

normalized value of zpos: unique, range from 0 to N-1 where N is the number of active planes for given crtc. Note that the driver must call [drm\_atomic\_normalize\_zpos()](#c.drm%5Fatomic%5Fnormalize%5Fzpos "drm_atomic_normalize_zpos") to update this before it can be trusted.

`src`

clipped source coordinates of the plane (in 16.16)

`dst`

clipped destination coordinates of the plane

`visible`

Visibility of the plane. This can be false even if fb!=NULL and crtc!=NULL, due to clipping.

`commit`

Tracks the pending commit to prevent use-after-free conditions, and for async plane updates.

May be NULL.

`state`

backpointer to global drm\_atomic\_state

struct `drm_plane_funcs`[¶](#c.drm%5Fplane%5Ffuncs "Permalink to this definition")

driver plane control functions

**Definition**

struct drm_plane_funcs {
  int (* update_plane) (struct drm_plane *plane,struct drm_crtc *crtc, struct drm_framebuffer *fb,int crtc_x, int crtc_y,unsigned int crtc_w, unsigned int crtc_h,uint32_t src_x, uint32_t src_y,uint32_t src_w, uint32_t src_h, struct drm_modeset_acquire_ctx *ctx);
  int (* disable_plane) (struct drm_plane *plane, struct drm_modeset_acquire_ctx *ctx);
  void (* destroy) (struct drm_plane *plane);
  void (* reset) (struct drm_plane *plane);
  int (* set_property) (struct drm_plane *plane, struct drm_property *property, uint64_t val);
  struct drm_plane_state *(* atomic_duplicate_state) (struct drm_plane *plane);
  void (* atomic_destroy_state) (struct drm_plane *plane, struct drm_plane_state *state);
  int (* atomic_set_property) (struct drm_plane *plane,struct drm_plane_state *state,struct drm_property *property, uint64_t val);
  int (* atomic_get_property) (struct drm_plane *plane,const struct drm_plane_state *state,struct drm_property *property, uint64_t *val);
  int (* late_register) (struct drm_plane *plane);
  void (* early_unregister) (struct drm_plane *plane);
  void (* atomic_print_state) (struct drm_printer *p, const struct drm_plane_state *state);
  bool (* format_mod_supported) (struct drm_plane *plane, uint32_t format, uint64_t modifier);
};

**Members**

`update_plane`

This is the legacy entry point to enable and configure the plane for the given CRTC and framebuffer. It is never called to disable the plane, i.e. the passed-in crtc and fb paramters are never NULL.

The source rectangle in frame buffer memory coordinates is given by the src\_x, src\_y, src\_w and src\_h parameters (as 16.16 fixed point values). Devices that don’t support subpixel plane coordinates can ignore the fractional part.

The destination rectangle in CRTC coordinates is given by the crtc\_x, crtc\_y, crtc\_w and crtc\_h parameters (as integer values). Devices scale the source rectangle to the destination rectangle. If scaling is not supported, and the source rectangle size doesn’t match the destination rectangle size, the driver must return a -<errorname>EINVAL</errorname> error.

Drivers implementing atomic modeset should use[drm\_atomic\_helper\_update\_plane()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fupdate%5Fplane "drm_atomic_helper_update_plane") to implement this hook.

RETURNS:

0 on success or a negative error code on failure.

`disable_plane`

This is the legacy entry point to disable the plane. The DRM core calls this method in response to a DRM\_IOCTL\_MODE\_SETPLANE IOCTL call with the frame buffer ID set to 0\. Disabled planes must not be processed by the CRTC.

Drivers implementing atomic modeset should use[drm\_atomic\_helper\_disable\_plane()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fdisable%5Fplane "drm_atomic_helper_disable_plane") to implement this hook.

RETURNS:

0 on success or a negative error code on failure.

`destroy`

Clean up plane resources. This is only called at driver unload time through [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup") since a plane cannot be hotplugged in DRM.

`reset`

Reset plane hardware and software state to off. This function isn’t called by the core directly, only through [drm\_mode\_config\_reset()](#c.drm%5Fmode%5Fconfig%5Freset "drm_mode_config_reset"). It’s not a helper hook only for historical reasons.

Atomic drivers can use [drm\_atomic\_helper\_plane\_reset()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fplane%5Freset "drm_atomic_helper_plane_reset") to reset atomic state using this hook.

`set_property`

This is the legacy entry point to update a property attached to the plane.

This callback is optional if the driver does not support any legacy driver-private properties. For atomic drivers it is not used because property handling is done entirely in the DRM core.

RETURNS:

0 on success or a negative error code on failure.

`atomic_duplicate_state`

Duplicate the current atomic state for this plane and return it. The core and helpers guarantee that any atomic state duplicated with this hook and still owned by the caller (i.e. not transferred to the driver by calling [drm\_mode\_config\_funcs.atomic\_commit](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs")) will be cleaned up by calling the **atomic\_destroy\_state** hook in this structure.

Atomic drivers which don’t subclass [struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state") should use[drm\_atomic\_helper\_plane\_duplicate\_state()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fplane%5Fduplicate%5Fstate "drm_atomic_helper_plane_duplicate_state"). Drivers that subclass the state structure to extend it with driver-private state should use[\_\_drm\_atomic\_helper\_plane\_duplicate\_state()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.%5F%5Fdrm%5Fatomic%5Fhelper%5Fplane%5Fduplicate%5Fstate "__drm_atomic_helper_plane_duplicate_state") to make sure shared state is duplicated in a consistent fashion across drivers.

It is an error to call this hook before [drm\_plane.state](#c.drm%5Fplane "drm_plane") has been initialized correctly.

NOTE:

If the duplicate state references refcounted resources this hook must acquire a reference for each of them. The driver must release these references again in **atomic\_destroy\_state**.

RETURNS:

Duplicated atomic state or NULL when the allocation failed.

`atomic_destroy_state`

Destroy a state duplicated with **atomic\_duplicate\_state** and release or unreference all resources it references

`atomic_set_property`

Decode a driver-private property value and store the decoded value into the passed-in state structure. Since the atomic core decodes all standardized properties (even for extensions beyond the core set of properties which might not be implemented by all drivers) this requires drivers to subclass the state structure.

Such driver-private properties should really only be implemented for truly hardware/vendor specific state. Instead it is preferred to standardize atomic extension and decode the properties used to expose such an extension in the core.

Do not call this function directly, use`drm_atomic_plane_set_property()` instead.

This callback is optional if the driver does not support any driver-private atomic properties.

NOTE:

This function is called in the state assembly phase of atomic modesets, which can be aborted for any reason (including on userspace’s request to just check whether a configuration would be possible). Drivers MUST NOT touch any persistent state (hardware or software) or data structures except the passed in **state** parameter.

Also since userspace controls in which order properties are set this function must not do any input validation (since the state update is incomplete and hence likely inconsistent). Instead any such input validation must be done in the various atomic\_check callbacks.

RETURNS:

0 if the property has been found, -EINVAL if the property isn’t implemented by the driver (which shouldn’t ever happen, the core only asks for properties attached to this plane). No other validation is allowed by the driver. The core already checks that the property value is within the range (integer, valid enum value, ...) the driver set when registering the property.

`atomic_get_property`

Reads out the decoded driver-private property. This is used to implement the GETPLANE IOCTL.

Do not call this function directly, use`drm_atomic_plane_get_property()` instead.

This callback is optional if the driver does not support any driver-private atomic properties.

RETURNS:

0 on success, -EINVAL if the property isn’t implemented by the driver (which should never happen, the core only asks for properties attached to this plane).

`late_register`

This optional hook can be used to register additional userspace interfaces attached to the plane like debugfs interfaces. It is called late in the driver load sequence from [drm\_dev\_register()](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdev%5Fregister "drm_dev_register"). Everything added from this callback should be unregistered in the early\_unregister callback.

Returns:

0 on success, or a negative error code on failure.

`early_unregister`

This optional hook should be used to unregister the additional userspace interfaces attached to the plane from**late\_register**. It is called from [drm\_dev\_unregister()](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdev%5Funregister "drm_dev_unregister"), early in the driver unload sequence to disable userspace access before data structures are torndown.

`atomic_print_state`

If driver subclasses [struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state"), it should implement this optional hook for printing additional driver specific state.

Do not call this directly, use `drm_atomic_plane_print_state()`instead.

`format_mod_supported`

This optional hook is used for the DRM to determine if the given format/modifier combination is valid for the plane. This allows the DRM to generate the correct format bitmask (which formats apply to which modifier).

Returns:

True if the given modifier is valid for that format on the plane. False otherwise.

enum `drm_plane_type`[¶](#c.drm%5Fplane%5Ftype "Permalink to this definition")

uapi plane type enumeration

**Constants**

`DRM_PLANE_TYPE_OVERLAY`

Overlay planes represent all non-primary, non-cursor planes. Some drivers refer to these types of planes as “sprites” internally.

`DRM_PLANE_TYPE_PRIMARY`

Primary planes represent a “main” plane for a CRTC. Primary planes are the planes operated upon by CRTC modesetting and flipping operations described in the [drm\_crtc\_funcs.page\_flip](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs") and[drm\_crtc\_funcs.set\_config](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs") hooks.

`DRM_PLANE_TYPE_CURSOR`

Cursor planes represent a “cursor” plane for a CRTC. Cursor planes are the planes operated upon by the DRM\_IOCTL\_MODE\_CURSOR and DRM\_IOCTL\_MODE\_CURSOR2 IOCTLs.

**Description**

For historical reasons not all planes are made the same. This enumeration is used to tell the different types of planes apart to implement the different uapi semantics for them. For userspace which is universal plane aware and which is using that atomic IOCTL there’s no difference between these planes (beyong what the driver and hardware can support of course).

For compatibility with legacy userspace, only overlay planes are made available to userspace by default. Userspace clients may set the DRM\_CLIENT\_CAP\_UNIVERSAL\_PLANES client capability bit to indicate that they wish to receive a universal plane list containing all plane types. See also[drm\_for\_each\_legacy\_plane()](#c.drm%5Ffor%5Feach%5Flegacy%5Fplane "drm_for_each_legacy_plane").

WARNING: The values of this enum is UABI since they’re exposed in the “type” property.

struct `drm_plane`[¶](#c.drm%5Fplane "Permalink to this definition")

central DRM plane control structure

**Definition**

struct drm_plane {
  struct drm_device * dev;
  struct list_head head;
  char * name;
  struct drm_modeset_lock mutex;
  struct drm_mode_object base;
  uint32_t possible_crtcs;
  uint32_t * format_types;
  unsigned int format_count;
  bool format_default;
  struct drm_crtc * crtc;
  struct drm_framebuffer * fb;
  struct drm_framebuffer * old_fb;
  const struct drm_plane_funcs * funcs;
  struct drm_object_properties properties;
  enum drm_plane_type type;
  unsigned index;
  const struct drm_plane_helper_funcs * helper_private;
  struct drm_plane_state * state;
  struct drm_property * zpos_property;
  struct drm_property * rotation_property;
};

**Members**

`dev`

DRM device this plane belongs to

`head`

for list management

`name`

human readable name, can be overwritten by the driver

`mutex`

Protects modeset plane state, together with the [drm\_crtc.mutex](#c.drm%5Fcrtc "drm_crtc") of CRTC this plane is linked to (when active, getting activated or getting disabled).

For atomic drivers specifically this protects **state**.

`base`

base mode object

`possible_crtcs`

pipes this plane can be bound to

`format_types`

array of formats supported by this plane

`format_count`

number of formats supported

`format_default`

driver hasn’t supplied supported formats for the plane

`crtc`

currently bound CRTC

`fb`

currently bound fb

`old_fb`

Temporary tracking of the old fb while a modeset is ongoing. Used by[drm\_mode\_set\_config\_internal()](#c.drm%5Fmode%5Fset%5Fconfig%5Finternal "drm_mode_set_config_internal") to implement correct refcounting.

`funcs`

helper functions

`properties`

property tracking for this plane

`type`

type of plane (overlay, primary, cursor)

`index`

Position inside the mode\_config.list, can be used as an array index. It is invariant over the lifetime of the plane.

`helper_private`

mid-layer private data

`state`

Current atomic state for this plane.

This is protected by **mutex**. Note that nonblocking atomic commits access the current plane state without taking locks. Either by going through the [struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") pointers, see[for\_each\_oldnew\_plane\_in\_state()](#c.for%5Feach%5Foldnew%5Fplane%5Fin%5Fstate "for_each_oldnew_plane_in_state"), [for\_each\_old\_plane\_in\_state()](#c.for%5Feach%5Fold%5Fplane%5Fin%5Fstate "for_each_old_plane_in_state") and[for\_each\_new\_plane\_in\_state()](#c.for%5Feach%5Fnew%5Fplane%5Fin%5Fstate "for_each_new_plane_in_state"). Or through careful ordering of atomic commit operations as implemented in the atomic helpers, see[struct drm\_crtc\_commit](#c.drm%5Fcrtc%5Fcommit "drm_crtc_commit").

`zpos_property`

zpos property for this plane

`rotation_property`

rotation property for this plane

unsigned int `drm_plane_index`(struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_)[¶](#c.drm%5Fplane%5Findex "Permalink to this definition")

find the index of a registered plane

**Parameters**

`struct drm_plane * plane`

plane to find index for

**Description**

Given a registered plane, return the index of that plane within a DRM device’s list of planes.

struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* `drm_plane_find`(struct drm\_device \* _dev_, struct [drm\_file](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file") \* _file\_priv_, uint32\_t _id_)[¶](#c.drm%5Fplane%5Ffind "Permalink to this definition")

find a [drm\_plane](#c.drm%5Fplane "drm_plane")

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_file * file_priv`

drm file to check for lease against.

`uint32_t id`

plane id

**Description**

Returns the plane with **id**, NULL if it doesn’t exist. Simple wrapper around[drm\_mode\_object\_find()](#c.drm%5Fmode%5Fobject%5Ffind "drm_mode_object_find").

`drm_for_each_plane_mask`(_plane_, _dev_, _plane\_mask_)[¶](#c.drm%5Ffor%5Feach%5Fplane%5Fmask "Permalink to this definition")

iterate over planes specified by bitmask

**Parameters**

`plane`

the loop cursor

`dev`

the DRM device

`plane_mask`

bitmask of plane indices

**Description**

Iterate over all planes specified by bitmask.

`drm_for_each_legacy_plane`(_plane_, _dev_)[¶](#c.drm%5Ffor%5Feach%5Flegacy%5Fplane "Permalink to this definition")

iterate over all planes for legacy userspace

**Parameters**

`plane`

the loop cursor

`dev`

the DRM device

**Description**

Iterate over all legacy planes of **dev**, excluding primary and cursor planes. This is useful for implementing userspace apis when userspace is not universal plane aware. See also [enum drm\_plane\_type](#c.drm%5Fplane%5Ftype "drm_plane_type").

`drm_for_each_plane`(_plane_, _dev_)[¶](#c.drm%5Ffor%5Feach%5Fplane "Permalink to this definition")

iterate over all planes

**Parameters**

`plane`

the loop cursor

`dev`

the DRM device

**Description**

Iterate over all planes of **dev**, include primary and cursor planes.

int `drm_universal_plane_init`(struct drm\_device \* _dev_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_, uint32\_t _possible\_crtcs_, const struct [drm\_plane\_funcs](#c.drm%5Fplane%5Ffuncs "drm_plane_funcs") \* _funcs_, const uint32\_t \* _formats_, unsigned int _format\_count_, const uint64\_t \* _format\_modifiers_, enum [drm\_plane\_type](#c.drm%5Fplane%5Ftype "drm_plane_type") _type_, const char \* _name_, ...)[¶](#c.drm%5Funiversal%5Fplane%5Finit "Permalink to this definition")

Initialize a new universal plane object

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_plane * plane`

plane object to init

`uint32_t possible_crtcs`

bitmask of possible CRTCs

`const struct drm_plane_funcs * funcs`

callbacks for the new plane

`const uint32_t * formats`

array of supported formats (DRM\_FORMAT\_\*)

`unsigned int format_count`

number of elements in **formats**

`const uint64_t * format_modifiers`

array of struct drm\_format modifiers terminated by DRM\_FORMAT\_MOD\_INVALID

`enum drm_plane_type type`

type of plane (overlay, primary, cursor)

`const char * name`

printf style format string for the plane name, or NULL for default name

`...`

variable arguments

**Description**

Initializes a plane object of type **type**.

**Return**

Zero on success, error code on failure.

int `drm_plane_init`(struct drm\_device \* _dev_, struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_, uint32\_t _possible\_crtcs_, const struct [drm\_plane\_funcs](#c.drm%5Fplane%5Ffuncs "drm_plane_funcs") \* _funcs_, const uint32\_t \* _formats_, unsigned int _format\_count_, bool _is\_primary_)[¶](#c.drm%5Fplane%5Finit "Permalink to this definition")

Initialize a legacy plane

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_plane * plane`

plane object to init

`uint32_t possible_crtcs`

bitmask of possible CRTCs

`const struct drm_plane_funcs * funcs`

callbacks for the new plane

`const uint32_t * formats`

array of supported formats (DRM\_FORMAT\_\*)

`unsigned int format_count`

number of elements in **formats**

`bool is_primary`

plane type (primary vs overlay)

**Description**

Legacy API to initialize a DRM plane.

New drivers should call [drm\_universal\_plane\_init()](#c.drm%5Funiversal%5Fplane%5Finit "drm_universal_plane_init") instead.

**Return**

Zero on success, error code on failure.

void `drm_plane_cleanup`(struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_)[¶](#c.drm%5Fplane%5Fcleanup "Permalink to this definition")

Clean up the core plane usage

**Parameters**

`struct drm_plane * plane`

plane to cleanup

**Description**

This function cleans up **plane** and removes it from the DRM mode setting core. Note that the function does _not_ free the plane structure itself, this is the responsibility of the caller.

struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* `drm_plane_from_index`(struct drm\_device \* _dev_, int _idx_)[¶](#c.drm%5Fplane%5Ffrom%5Findex "Permalink to this definition")

find the registered plane at an index

**Parameters**

`struct drm_device * dev`

DRM device

`int idx`

index of registered plane to find for

**Description**

Given a plane index, return the registered plane from DRM device’s list of planes with matching index. This is the inverse of [drm\_plane\_index()](#c.drm%5Fplane%5Findex "drm_plane_index").

void `drm_plane_force_disable`(struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_)[¶](#c.drm%5Fplane%5Fforce%5Fdisable "Permalink to this definition")

Forcibly disable a plane

**Parameters**

`struct drm_plane * plane`

plane to disable

**Description**

Forces the plane to be disabled.

Used when the plane’s current framebuffer is destroyed, and when restoring fbdev mode.

Note that this function is not suitable for atomic drivers, since it doesn’t wire through the lock acquisition context properly and hence can’t handle retries or driver private locks. You probably want to use[drm\_atomic\_helper\_disable\_plane()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fdisable%5Fplane "drm_atomic_helper_disable_plane") or[drm\_atomic\_helper\_disable\_planes\_on\_crtc()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fdisable%5Fplanes%5Fon%5Fcrtc "drm_atomic_helper_disable_planes_on_crtc") instead.

int `drm_mode_plane_set_obj_prop`(struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_, struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _property_, uint64\_t _value_)[¶](#c.drm%5Fmode%5Fplane%5Fset%5Fobj%5Fprop "Permalink to this definition")

set the value of a property

**Parameters**

`struct drm_plane * plane`

drm plane object to set property value for

`struct drm_property * property`

property to set

`uint64_t value`

value the property should be set to

**Description**

This functions sets a given property on a given plane object. This function calls the driver’s ->set\_property callback and changes the software state of the property if the callback succeeds.

**Return**

Zero on success, error code on failure.

## Display Modes Function Reference[¶](#display-modes-function-reference "Permalink to this headline")

enum `drm_mode_status`[¶](#c.drm%5Fmode%5Fstatus "Permalink to this definition")

hardware support status of a mode

**Constants**

`MODE_OK`

Mode OK

`MODE_HSYNC`

hsync out of range

`MODE_VSYNC`

vsync out of range

`MODE_H_ILLEGAL`

mode has illegal horizontal timings

`MODE_V_ILLEGAL`

mode has illegal horizontal timings

`MODE_BAD_WIDTH`

requires an unsupported linepitch

`MODE_NOMODE`

no mode with a matching name

`MODE_NO_INTERLACE`

interlaced mode not supported

`MODE_NO_DBLESCAN`

doublescan mode not supported

`MODE_NO_VSCAN`

multiscan mode not supported

`MODE_MEM`

insufficient video memory

`MODE_VIRTUAL_X`

mode width too large for specified virtual size

`MODE_VIRTUAL_Y`

mode height too large for specified virtual size

`MODE_MEM_VIRT`

insufficient video memory given virtual size

`MODE_NOCLOCK`

no fixed clock available

`MODE_CLOCK_HIGH`

clock required is too high

`MODE_CLOCK_LOW`

clock required is too low

`MODE_CLOCK_RANGE`

clock/mode isn’t in a ClockRange

`MODE_BAD_HVALUE`

horizontal timing was out of range

`MODE_BAD_VVALUE`

vertical timing was out of range

`MODE_BAD_VSCAN`

VScan value out of range

`MODE_HSYNC_NARROW`

horizontal sync too narrow

`MODE_HSYNC_WIDE`

horizontal sync too wide

`MODE_HBLANK_NARROW`

horizontal blanking too narrow

`MODE_HBLANK_WIDE`

horizontal blanking too wide

`MODE_VSYNC_NARROW`

vertical sync too narrow

`MODE_VSYNC_WIDE`

vertical sync too wide

`MODE_VBLANK_NARROW`

vertical blanking too narrow

`MODE_VBLANK_WIDE`

vertical blanking too wide

`MODE_PANEL`

exceeds panel dimensions

`MODE_INTERLACE_WIDTH`

width too large for interlaced mode

`MODE_ONE_WIDTH`

only one width is supported

`MODE_ONE_HEIGHT`

only one height is supported

`MODE_ONE_SIZE`

only one resolution is supported

`MODE_NO_REDUCED`

monitor doesn’t accept reduced blanking

`MODE_NO_STEREO`

stereo modes not supported

`MODE_NO_420`

ycbcr 420 modes not supported

`MODE_STALE`

mode has become stale

`MODE_BAD`

unspecified reason

`MODE_ERROR`

error condition

**Description**

This enum is used to filter out modes not supported by the driver/hardware combination.

struct `drm_display_mode`[¶](#c.drm%5Fdisplay%5Fmode "Permalink to this definition")

DRM kernel-internal display mode structure

**Definition**

struct drm_display_mode {
  struct list_head head;
  struct drm_mode_object base;
  char name;
  enum drm_mode_status status;
  unsigned int type;
  int clock;
  int hdisplay;
  int hsync_start;
  int hsync_end;
  int htotal;
  int hskew;
  int vdisplay;
  int vsync_start;
  int vsync_end;
  int vtotal;
  int vscan;
  unsigned int flags;
  int width_mm;
  int height_mm;
  int crtc_clock;
  int crtc_hdisplay;
  int crtc_hblank_start;
  int crtc_hblank_end;
  int crtc_hsync_start;
  int crtc_hsync_end;
  int crtc_htotal;
  int crtc_hskew;
  int crtc_vdisplay;
  int crtc_vblank_start;
  int crtc_vblank_end;
  int crtc_vsync_start;
  int crtc_vsync_end;
  int crtc_vtotal;
  int * private;
  int private_flags;
  int vrefresh;
  int hsync;
  enum hdmi_picture_aspect picture_aspect_ratio;
};

**Members**

`head`

struct list\_head for mode lists.

`base`

A display mode is a normal modeset object, possibly including public userspace id.

FIXME:

This can probably be removed since the entire concept of userspace managing modes explicitly has never landed in upstream kernel mode setting support.

`name`

Human-readable name of the mode, filled out with [drm\_mode\_set\_name()](#c.drm%5Fmode%5Fset%5Fname "drm_mode_set_name").

`status`

Status of the mode, used to filter out modes not supported by the hardware. See enum [drm\_mode\_status](#c.drm%5Fmode%5Fstatus "drm_mode_status").

`type`

A bitmask of flags, mostly about the source of a mode. Possible flags are:

> * DRM\_MODE\_TYPE\_BUILTIN: Meant for hard-coded modes, effectively unused.
> * DRM\_MODE\_TYPE\_PREFERRED: Preferred mode, usually the native resolution of an LCD panel. There should only be one preferred mode per connector at any given time.
> * DRM\_MODE\_TYPE\_DRIVER: Mode created by the driver, which is all of them really. Drivers must set this bit for all modes they create and expose to userspace.

Plus a big list of flags which shouldn’t be used at all, but are still around since these flags are also used in the userspace ABI:

> * DRM\_MODE\_TYPE\_DEFAULT: Again a leftover, use DRM\_MODE\_TYPE\_PREFERRED instead.
> * DRM\_MODE\_TYPE\_CLOCK\_C and DRM\_MODE\_TYPE\_CRTC\_C: Define leftovers which are stuck around for hysterical raisins only. No one has an idea what they were meant for. Don’t use.
> * DRM\_MODE\_TYPE\_USERDEF: Mode defined by userspace, again a vestige from older kms designs where userspace had to first add a custom mode to the kernel’s mode list before it could use it. Don’t use.

`clock`

Pixel clock in kHz.

`hdisplay`

horizontal display size

`hsync_start`

horizontal sync start

`hsync_end`

horizontal sync end

`htotal`

horizontal total size

`hskew`

horizontal skew?!

`vdisplay`

vertical display size

`vsync_start`

vertical sync start

`vsync_end`

vertical sync end

`vtotal`

vertical total size

`vscan`

vertical scan?!

`flags`

Sync and timing flags:

> * DRM\_MODE\_FLAG\_PHSYNC: horizontal sync is active high.
> * DRM\_MODE\_FLAG\_NHSYNC: horizontal sync is active low.
> * DRM\_MODE\_FLAG\_PVSYNC: vertical sync is active high.
> * DRM\_MODE\_FLAG\_NVSYNC: vertical sync is active low.
> * DRM\_MODE\_FLAG\_INTERLACE: mode is interlaced.
> * DRM\_MODE\_FLAG\_DBLSCAN: mode uses doublescan.
> * DRM\_MODE\_FLAG\_CSYNC: mode uses composite sync.
> * DRM\_MODE\_FLAG\_PCSYNC: composite sync is active high.
> * DRM\_MODE\_FLAG\_NCSYNC: composite sync is active low.
> * DRM\_MODE\_FLAG\_HSKEW: hskew provided (not used?).
> * DRM\_MODE\_FLAG\_BCAST: not used?
> * DRM\_MODE\_FLAG\_PIXMUX: not used?
> * DRM\_MODE\_FLAG\_DBLCLK: double-clocked mode.
> * DRM\_MODE\_FLAG\_CLKDIV2: half-clocked mode.

Additionally there’s flags to specify how 3D modes are packed:

> * DRM\_MODE\_FLAG\_3D\_NONE: normal, non-3D mode.
> * DRM\_MODE\_FLAG\_3D\_FRAME\_PACKING: 2 full frames for left and right.
> * DRM\_MODE\_FLAG\_3D\_FIELD\_ALTERNATIVE: interleaved like fields.
> * DRM\_MODE\_FLAG\_3D\_LINE\_ALTERNATIVE: interleaved lines.
> * DRM\_MODE\_FLAG\_3D\_SIDE\_BY\_SIDE\_FULL: side-by-side full frames.
> * DRM\_MODE\_FLAG\_3D\_L\_DEPTH: ?
> * DRM\_MODE\_FLAG\_3D\_L\_DEPTH\_GFX\_GFX\_DEPTH: ?
> * DRM\_MODE\_FLAG\_3D\_TOP\_AND\_BOTTOM: frame split into top and bottom parts.
> * DRM\_MODE\_FLAG\_3D\_SIDE\_BY\_SIDE\_HALF: frame split into left and right parts.

`width_mm`

Addressable size of the output in mm, projectors should set this to 0.

`height_mm`

Addressable size of the output in mm, projectors should set this to 0.

`crtc_clock`

Actual pixel or dot clock in the hardware. This differs from the logical **clock** when e.g. using interlacing, double-clocking, stereo modes or other fancy stuff that changes the timings and signals actually sent over the wire.

This is again in kHz.

Note that with digital outputs like HDMI or DP there’s usually a massive confusion between the dot clock and the signal clock at the bit encoding level. Especially when a 8b/10b encoding is used and the difference is exactly a factor of 10.

`crtc_hdisplay`

hardware mode horizontal display size

`crtc_hblank_start`

hardware mode horizontal blank start

`crtc_hblank_end`

hardware mode horizontal blank end

`crtc_hsync_start`

hardware mode horizontal sync start

`crtc_hsync_end`

hardware mode horizontal sync end

`crtc_htotal`

hardware mode horizontal total size

`crtc_hskew`

hardware mode horizontal skew?!

`crtc_vdisplay`

hardware mode vertical display size

`crtc_vblank_start`

hardware mode vertical blank start

`crtc_vblank_end`

hardware mode vertical blank end

`crtc_vsync_start`

hardware mode vertical sync start

`crtc_vsync_end`

hardware mode vertical sync end

`crtc_vtotal`

hardware mode vertical total size

`private`

Pointer for driver private data. This can only be used for mode objects passed to drivers in modeset operations. It shouldn’t be used by atomic drivers since they can store any additional data by subclassing state structures.

`private_flags`

Similar to **private**, but just an integer.

`vrefresh`

Vertical refresh rate, for debug output in human readable form. Not used in a functional way.

This value is in Hz.

`hsync`

Horizontal refresh rate, for debug output in human readable form. Not used in a functional way.

This value is in kHz.

`picture_aspect_ratio`

Field for setting the HDMI picture aspect ratio of a mode.

**Description**

The horizontal and vertical timings are defined per the following diagram.

          Active                 Front           Sync           Back
         Region                 Porch                          Porch
<-----------------------><----------------><-------------><-------------->
  //////////////////////|
 ////////////////////// |
//////////////////////  |..................               ................
                                           _______________
<----- [hv]display ----->
<------------- [hv]sync_start ------------>
<--------------------- [hv]sync_end --------------------->
<-------------------------------- [hv]total ----------------------------->*

This structure contains two copies of timings. First are the plain timings, which specify the logical mode, as it would be for a progressive 1:1 scanout at the refresh rate userspace can observe through vblank timestamps. Then there’s the hardware timings, which are corrected for interlacing, double-clocking and similar things. They are provided as a convenience, and can be appropriately computed using [drm\_mode\_set\_crtcinfo()](#c.drm%5Fmode%5Fset%5Fcrtcinfo "drm_mode_set_crtcinfo").

For printing you can use `DRM_MODE_FMT` and [DRM\_MODE\_ARG()](#c.DRM%5FMODE%5FARG "DRM_MODE_ARG").

`DRM_MODE_FMT`()[¶](#c.DRM%5FMODE%5FFMT "Permalink to this definition")

printf string for [struct drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode")

**Parameters**

`DRM_MODE_ARG`(_m_)[¶](#c.DRM%5FMODE%5FARG "Permalink to this definition")

printf arguments for [struct drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode")

**Parameters**

`m`

display mode

bool `drm_mode_is_stereo`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fis%5Fstereo "Permalink to this definition")

check for stereo mode flags

**Parameters**

`const struct drm_display_mode * mode`

drm\_display\_mode to check

**Return**

True if the mode is one of the stereo modes (like side-by-side), false if not.

void `drm_mode_debug_printmodeline`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fdebug%5Fprintmodeline "Permalink to this definition")

print a mode to dmesg

**Parameters**

`const struct drm_display_mode * mode`

mode to print

**Description**

Describe **mode** using DRM\_DEBUG.

struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* `drm_mode_create`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmode%5Fcreate "Permalink to this definition")

create a new display mode

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

Create a new, cleared drm\_display\_mode with kzalloc, allocate an ID for it and return it.

**Return**

Pointer to new mode on success, NULL on error.

void `drm_mode_destroy`(struct drm\_device \* _dev_, struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fdestroy "Permalink to this definition")

remove a mode

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_display_mode * mode`

mode to remove

**Description**

Release **mode**‘s unique ID, then free it **mode** structure itself using kfree.

void `drm_mode_probed_add`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_, struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fprobed%5Fadd "Permalink to this definition")

add a mode to a connector’s probed\_mode list

**Parameters**

`struct drm_connector * connector`

connector the new mode

`struct drm_display_mode * mode`

mode data

**Description**

Add **mode** to **connector**‘s probed\_mode list for later use. This list should then in a second step get filtered and all the modes actually supported by the hardware moved to the **connector**‘s modes list.

struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* `drm_cvt_mode`(struct drm\_device \* _dev_, int _hdisplay_, int _vdisplay_, int _vrefresh_, bool _reduced_, bool _interlaced_, bool _margins_)[¶](#c.drm%5Fcvt%5Fmode "Permalink to this definition")

create a modeline based on the CVT algorithm

**Parameters**

`struct drm_device * dev`

drm device

`int hdisplay`

hdisplay size

`int vdisplay`

vdisplay size

`int vrefresh`

vrefresh rate

`bool reduced`

whether to use reduced blanking

`bool interlaced`

whether to compute an interlaced mode

`bool margins`

whether to add margins (borders)

**Description**

This function is called to generate the modeline based on CVT algorithm according to the hdisplay, vdisplay, vrefresh. It is based from the VESA(TM) Coordinated Video Timing Generator by Graham Loveridge April 9, 2003 available at<http://www.elo.utfsm.cl/~elo212/docs/CVTd6r1.xls>

And it is copied from xf86CVTmode in xserver/hw/xfree86/modes/xf86cvt.c. What I have done is to translate it by using integer calculation.

**Return**

The modeline based on the CVT algorithm stored in a drm\_display\_mode object. The display mode object is allocated with [drm\_mode\_create()](#c.drm%5Fmode%5Fcreate "drm_mode_create"). Returns NULL when no mode could be allocated.

struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* `drm_gtf_mode_complex`(struct drm\_device \* _dev_, int _hdisplay_, int _vdisplay_, int _vrefresh_, bool _interlaced_, int _margins_, int _GTF\_M_, int _GTF\_2C_, int _GTF\_K_, int _GTF\_2J_)[¶](#c.drm%5Fgtf%5Fmode%5Fcomplex "Permalink to this definition")

create the modeline based on the full GTF algorithm

**Parameters**

`struct drm_device * dev`

drm device

`int hdisplay`

hdisplay size

`int vdisplay`

vdisplay size

`int vrefresh`

vrefresh rate.

`bool interlaced`

whether to compute an interlaced mode

`int margins`

desired margin (borders) size

`int GTF_M`

extended GTF formula parameters

`int GTF_2C`

extended GTF formula parameters

`int GTF_K`

extended GTF formula parameters

`int GTF_2J`

extended GTF formula parameters

**Description**

GTF feature blocks specify C and J in multiples of 0.5, so we pass them in here multiplied by two. For a C of 40, pass in 80.

**Return**

The modeline based on the full GTF algorithm stored in a drm\_display\_mode object. The display mode object is allocated with [drm\_mode\_create()](#c.drm%5Fmode%5Fcreate "drm_mode_create"). Returns NULL when no mode could be allocated.

struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* `drm_gtf_mode`(struct drm\_device \* _dev_, int _hdisplay_, int _vdisplay_, int _vrefresh_, bool _interlaced_, int _margins_)[¶](#c.drm%5Fgtf%5Fmode "Permalink to this definition")

create the modeline based on the GTF algorithm

**Parameters**

`struct drm_device * dev`

drm device

`int hdisplay`

hdisplay size

`int vdisplay`

vdisplay size

`int vrefresh`

vrefresh rate.

`bool interlaced`

whether to compute an interlaced mode

`int margins`

desired margin (borders) size

**Description**

return the modeline based on GTF algorithm

This function is to create the modeline based on the GTF algorithm. Generalized Timing Formula is derived from:

> 

And it is copied from the file of xserver/hw/xfree86/modes/xf86gtf.c. What I have done is to translate it by using integer calculation. I also refer to the function of fb\_get\_mode in the file of drivers/video/fbmon.c

Standard GTF parameters:

M = 600
C = 40
K = 128
J = 20

**Return**

The modeline based on the GTF algorithm stored in a drm\_display\_mode object. The display mode object is allocated with [drm\_mode\_create()](#c.drm%5Fmode%5Fcreate "drm_mode_create"). Returns NULL when no mode could be allocated.

void `drm_display_mode_from_videomode`(const struct videomode \* _vm_, struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _dmode_)[¶](#c.drm%5Fdisplay%5Fmode%5Ffrom%5Fvideomode "Permalink to this definition")

fill in **dmode** using **vm**,

**Parameters**

`const struct videomode * vm`

videomode structure to use as source

`struct drm_display_mode * dmode`

drm\_display\_mode structure to use as destination

**Description**

Fills out **dmode** using the display mode specified in **vm**.

void `drm_display_mode_to_videomode`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _dmode_, struct videomode \* _vm_)[¶](#c.drm%5Fdisplay%5Fmode%5Fto%5Fvideomode "Permalink to this definition")

fill in **vm** using **dmode**,

**Parameters**

`const struct drm_display_mode * dmode`

drm\_display\_mode structure to use as source

`struct videomode * vm`

videomode structure to use as destination

**Description**

Fills out **vm** using the display mode specified in **dmode**.

void `drm_bus_flags_from_videomode`(const struct videomode \* _vm_, u32 \* _bus\_flags_)[¶](#c.drm%5Fbus%5Fflags%5Ffrom%5Fvideomode "Permalink to this definition")

extract information about pixelclk and DE polarity from videomode and store it in a separate variable

**Parameters**

`const struct videomode * vm`

videomode structure to use

`u32 * bus_flags`

information about pixelclk and DE polarity will be stored here

**Description**

Sets DRM\_BUS\_FLAG\_DE\_(LOW|HIGH) and DRM\_BUS\_FLAG\_PIXDATA\_(POS|NEG)EDGE in **bus\_flags** according to DISPLAY\_FLAGS found in **vm**

int `of_get_drm_display_mode`(struct device\_node \* _np_, struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _dmode_, u32 \* _bus\_flags_, int _index_)[¶](#c.of%5Fget%5Fdrm%5Fdisplay%5Fmode "Permalink to this definition")

get a drm\_display\_mode from devicetree

**Parameters**

`struct device_node * np`

device\_node with the timing specification

`struct drm_display_mode * dmode`

will be set to the return value

`u32 * bus_flags`

information about pixelclk and DE polarity

`int index`

index into the list of display timings in devicetree

**Description**

This function is expensive and should only be used, if only one mode is to be read from DT. To get multiple modes start with of\_get\_display\_timings and work with that instead.

**Return**

0 on success, a negative errno code when no of videomode node was found.

void `drm_mode_set_name`(struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fset%5Fname "Permalink to this definition")

set the name on a mode

**Parameters**

`struct drm_display_mode * mode`

name will be set in this mode

**Description**

Set the name of **mode** to a standard format which is <hdisplay>x<vdisplay> with an optional ‘i’ suffix for interlaced modes.

int `drm_mode_hsync`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fhsync "Permalink to this definition")

get the hsync of a mode

**Parameters**

`const struct drm_display_mode * mode`

mode

**Return**

**modes**‘s hsync rate in kHz, rounded to the nearest integer. Calculates the value first if it is not yet set.

int `drm_mode_vrefresh`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fvrefresh "Permalink to this definition")

get the vrefresh of a mode

**Parameters**

`const struct drm_display_mode * mode`

mode

**Return**

**modes**‘s vrefresh rate in Hz, rounded to the nearest integer. Calculates the value first if it is not yet set.

void `drm_mode_get_hv_timing`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_, int \* _hdisplay_, int \* _vdisplay_)[¶](#c.drm%5Fmode%5Fget%5Fhv%5Ftiming "Permalink to this definition")

Fetches hdisplay/vdisplay for given mode

**Parameters**

`const struct drm_display_mode * mode`

mode to query

`int * hdisplay`

hdisplay value to fill in

`int * vdisplay`

vdisplay value to fill in

**Description**

The vdisplay value will be doubled if the specified mode is a stereo mode of the appropriate layout.

void `drm_mode_set_crtcinfo`(struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _p_, int _adjust\_flags_)[¶](#c.drm%5Fmode%5Fset%5Fcrtcinfo "Permalink to this definition")

set CRTC modesetting timing parameters

**Parameters**

`struct drm_display_mode * p`

mode

`int adjust_flags`

a combination of adjustment flags

**Description**

Setup the CRTC modesetting timing parameters for **p**, adjusting if necessary.

* The CRTC\_INTERLACE\_HALVE\_V flag can be used to halve vertical timings of interlaced modes.
* The CRTC\_STEREO\_DOUBLE flag can be used to compute the timings for buffers containing two eyes (only adjust the timings when needed, eg. for “frame packing” or “side by side full”).
* The CRTC\_NO\_DBLSCAN and CRTC\_NO\_VSCAN flags request that adjustment _not_be performed for doublescan and vscan > 1 modes respectively.

void `drm_mode_copy`(struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _dst_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _src_)[¶](#c.drm%5Fmode%5Fcopy "Permalink to this definition")

copy the mode

**Parameters**

`struct drm_display_mode * dst`

mode to overwrite

`const struct drm_display_mode * src`

mode to copy

**Description**

Copy an existing mode into another mode, preserving the object id and list head of the destination mode.

struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* `drm_mode_duplicate`(struct drm\_device \* _dev_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fduplicate "Permalink to this definition")

allocate and duplicate an existing mode

**Parameters**

`struct drm_device * dev`

drm\_device to allocate the duplicated mode for

`const struct drm_display_mode * mode`

mode to duplicate

**Description**

Just allocate a new mode, copy the existing mode into it, and return a pointer to it. Used to create new instances of established modes.

**Return**

Pointer to duplicated mode on success, NULL on error.

bool `drm_mode_equal`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode1_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode2_)[¶](#c.drm%5Fmode%5Fequal "Permalink to this definition")

test modes for equality

**Parameters**

`const struct drm_display_mode * mode1`

first mode

`const struct drm_display_mode * mode2`

second mode

**Description**

Check to see if **mode1** and **mode2** are equivalent.

**Return**

True if the modes are equal, false otherwise.

bool `drm_mode_equal_no_clocks`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode1_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode2_)[¶](#c.drm%5Fmode%5Fequal%5Fno%5Fclocks "Permalink to this definition")

test modes for equality

**Parameters**

`const struct drm_display_mode * mode1`

first mode

`const struct drm_display_mode * mode2`

second mode

**Description**

Check to see if **mode1** and **mode2** are equivalent, but don’t check the pixel clocks.

**Return**

True if the modes are equal, false otherwise.

bool `drm_mode_equal_no_clocks_no_stereo`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode1_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode2_)[¶](#c.drm%5Fmode%5Fequal%5Fno%5Fclocks%5Fno%5Fstereo "Permalink to this definition")

test modes for equality

**Parameters**

`const struct drm_display_mode * mode1`

first mode

`const struct drm_display_mode * mode2`

second mode

**Description**

Check to see if **mode1** and **mode2** are equivalent, but don’t check the pixel clocks nor the stereo layout.

**Return**

True if the modes are equal, false otherwise.

enum [drm\_mode\_status](#c.drm%5Fmode%5Fstatus "drm_mode_status") `drm_mode_validate_basic`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fvalidate%5Fbasic "Permalink to this definition")

make sure the mode is somewhat sane

**Parameters**

`const struct drm_display_mode * mode`

mode to check

**Description**

Check that the mode timings are at least somewhat reasonable. Any hardware specific limits are left up for each driver to check.

**Return**

The mode status

enum [drm\_mode\_status](#c.drm%5Fmode%5Fstatus "drm_mode_status") `drm_mode_validate_size`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_, int _maxX_, int _maxY_)[¶](#c.drm%5Fmode%5Fvalidate%5Fsize "Permalink to this definition")

make sure modes adhere to size constraints

**Parameters**

`const struct drm_display_mode * mode`

mode to check

`int maxX`

maximum width

`int maxY`

maximum height

**Description**

This function is a helper which can be used to validate modes against size limitations of the DRM device/connector. If a mode is too big its status member is updated with the appropriate validation failure code. The list itself is not changed.

**Return**

The mode status

enum [drm\_mode\_status](#c.drm%5Fmode%5Fstatus "drm_mode_status") `drm_mode_validate_ycbcr420`(const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_, struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fmode%5Fvalidate%5Fycbcr420 "Permalink to this definition")

add ‘ycbcr420-only’ modes only when allowed

**Parameters**

`const struct drm_display_mode * mode`

mode to check

`struct drm_connector * connector`

drm connector under action

**Description**

This function is a helper which can be used to filter out any YCBCR420 only mode, when the source doesn’t support it.

**Return**

The mode status

void `drm_mode_prune_invalid`(struct drm\_device \* _dev_, struct list\_head \* _mode\_list_, bool _verbose_)[¶](#c.drm%5Fmode%5Fprune%5Finvalid "Permalink to this definition")

remove invalid modes from mode list

**Parameters**

`struct drm_device * dev`

DRM device

`struct list_head * mode_list`

list of modes to check

`bool verbose`

be verbose about it

**Description**

This helper function can be used to prune a display mode list after validation has been completed. All modes who’s status is not MODE\_OK will be removed from the list, and if **verbose** the status code and mode name is also printed to dmesg.

void `drm_mode_sort`(struct list\_head \* _mode\_list_)[¶](#c.drm%5Fmode%5Fsort "Permalink to this definition")

sort mode list

**Parameters**

`struct list_head * mode_list`

list of drm\_display\_mode structures to sort

**Description**

Sort **mode\_list** by favorability, moving good modes to the head of the list.

void `drm_mode_connector_list_update`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fmode%5Fconnector%5Flist%5Fupdate "Permalink to this definition")

update the mode list for the connector

**Parameters**

`struct drm_connector * connector`

the connector to update

**Description**

This moves the modes from the **connector** probed\_modes list to the actual mode list. It compares the probed mode against the current list and only adds different/new modes.

This is just a helper functions doesn’t validate any modes itself and also doesn’t prune any invalid modes. Callers need to do that themselves.

bool `drm_mode_parse_command_line_for_connector`(const char \* _mode\_option_, struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_, struct drm\_cmdline\_mode \* _mode_)[¶](#c.drm%5Fmode%5Fparse%5Fcommand%5Fline%5Ffor%5Fconnector "Permalink to this definition")

parse command line modeline for connector

**Parameters**

`const char * mode_option`

optional per connector mode option

`struct drm_connector * connector`

connector to parse modeline for

`struct drm_cmdline_mode * mode`

preallocated drm\_cmdline\_mode structure to fill out

**Description**

This parses **mode\_option** command line modeline for modes and options to configure the connector. If **mode\_option** is NULL the default command line modeline in fb\_mode\_option will be parsed instead.

This uses the same parameters as the fb modedb.c, except for an extra force-enable, force-enable-digital and force-disable bit at the end:

<xres>x<yres>\[M\]\[R\]\[-<bpp>\]\[@<refresh>\]\[i\]\[m\]\[eDd\]

The intermediate drm\_cmdline\_mode structure is required to store additional options from the command line modline like the force-enable/disable flag.

**Return**

True if a valid modeline has been parsed, false otherwise.

struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* `drm_mode_create_from_cmdline_mode`(struct drm\_device \* _dev_, struct drm\_cmdline\_mode \* _cmd_)[¶](#c.drm%5Fmode%5Fcreate%5Ffrom%5Fcmdline%5Fmode "Permalink to this definition")

convert a command line modeline into a DRM display mode

**Parameters**

`struct drm_device * dev`

DRM device to create the new mode for

`struct drm_cmdline_mode * cmd`

input command line modeline

**Return**

Pointer to converted mode on success, NULL on error.

bool `drm_mode_is_420_only`(const struct [drm\_display\_info](#c.drm%5Fdisplay%5Finfo "drm_display_info") \* _display_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fis%5F420%5Fonly "Permalink to this definition")

if a given videomode can be only supported in YCBCR420 output format

**Parameters**

`const struct drm_display_info * display`

display under action

`const struct drm_display_mode * mode`

video mode to be tested.

**Return**

true if the mode can be supported in YCBCR420 format false if not.

bool `drm_mode_is_420_also`(const struct [drm\_display\_info](#c.drm%5Fdisplay%5Finfo "drm_display_info") \* _display_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fis%5F420%5Falso "Permalink to this definition")

if a given videomode can be supported in YCBCR420 output format also (along with RGB/YCBCR444/422)

**Parameters**

`const struct drm_display_info * display`

display under action.

`const struct drm_display_mode * mode`

video mode to be tested.

**Return**

true if the mode can be support YCBCR420 format false if not.

bool `drm_mode_is_420`(const struct [drm\_display\_info](#c.drm%5Fdisplay%5Finfo "drm_display_info") \* _display_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fmode%5Fis%5F420 "Permalink to this definition")

if a given videomode can be supported in YCBCR420 output format

**Parameters**

`const struct drm_display_info * display`

display under action.

`const struct drm_display_mode * mode`

video mode to be tested.

**Return**

true if the mode can be supported in YCBCR420 format false if not.

## Connector Abstraction[¶](#connector-abstraction "Permalink to this headline")

In DRM connectors are the general abstraction for display sinks, and include als fixed panels or anything else that can display pixels in some form. As opposed to all other KMS objects representing hardware (like CRTC, encoder or plane abstractions) connectors can be hotplugged and unplugged at runtime. Hence they are reference-counted using [drm\_connector\_get()](#c.drm%5Fconnector%5Fget "drm_connector_get") and[drm\_connector\_put()](#c.drm%5Fconnector%5Fput "drm_connector_put").

KMS driver must create, initialize, register and attach at a [structdrm\_connector](#c.drm%5Fconnector "drm_connector") for each such sink. The instance is created as other KMS objects and initialized by setting the following fields. The connector is initialized with a call to [drm\_connector\_init()](#c.drm%5Fconnector%5Finit "drm_connector_init") with a pointer to the[struct drm\_connector\_funcs](#c.drm%5Fconnector%5Ffuncs "drm_connector_funcs") and a connector type, and then exposed to userspace with a call to [drm\_connector\_register()](#c.drm%5Fconnector%5Fregister "drm_connector_register").

Connectors must be attached to an encoder to be used. For devices that map connectors to encoders 1:1, the connector should be attached at initialization time with a call to [drm\_mode\_connector\_attach\_encoder()](#c.drm%5Fmode%5Fconnector%5Fattach%5Fencoder "drm_mode_connector_attach_encoder"). The driver must also set the [drm\_connector.encoder](#c.drm%5Fconnector "drm_connector") field to point to the attached encoder.

For connectors which are not fixed (like built-in panels) the driver needs to support hotplug notifications. The simplest way to do that is by using the probe helpers, see [drm\_kms\_helper\_poll\_init()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fkms%5Fhelper%5Fpoll%5Finit "drm_kms_helper_poll_init") for connectors which don’t have hardware support for hotplug interrupts. Connectors with hardware hotplug support can instead use e.g. [drm\_helper\_hpd\_irq\_event()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fhelper%5Fhpd%5Firq%5Fevent "drm_helper_hpd_irq_event").

### Connector Functions Reference[¶](#connector-functions-reference "Permalink to this headline")

enum `drm_connector_status`[¶](#c.drm%5Fconnector%5Fstatus "Permalink to this definition")

status for a [drm\_connector](#c.drm%5Fconnector "drm_connector")

**Constants**

`connector_status_connected`

The connector is definitely connected to a sink device, and can be enabled.

`connector_status_disconnected`

The connector isn’t connected to a sink device which can be autodetect. For digital outputs like DP or HDMI (which can be realiable probed) this means there’s really nothing there. It is driver-dependent whether a connector with this status can be lit up or not.

`connector_status_unknown`

The connector’s status could not be reliably detected. This happens when probing would either cause flicker (like load-detection when the connector is in use), or when a hardware resource isn’t available (like when load-detection needs a free CRTC). It should be possible to light up the connector with one of the listed fallback modes. For default configuration userspace should only try to light up connectors with unknown status when there’s not connector with **connector\_status\_connected**.

**Description**

This enum is used to track the connector status. There are no separate #defines for the uapi!

struct `drm_scrambling`[¶](#c.drm%5Fscrambling "Permalink to this definition")

**Definition**

struct drm_scrambling {
  bool supported;
  bool low_rates;
};

**Members**

`supported`

scrambling supported for rates > 340 Mhz.

`low_rates`

scrambling supported for rates <= 340 Mhz.

struct `drm_hdmi_info`[¶](#c.drm%5Fhdmi%5Finfo "Permalink to this definition")

runtime information about the connected HDMI sink

**Definition**

struct drm_hdmi_info {
  struct drm_scdc scdc;
  unsigned long y420_vdb_modes;
  unsigned long y420_cmdb_modes;
  u64 y420_cmdb_map;
  u8 y420_dc_modes;
};

**Members**

`scdc`

sink’s scdc support and capabilities

`y420_vdb_modes`

bitmap of modes which can support ycbcr420 output only (not normal RGB/YCBCR444/422 outputs). There are total 107 VICs defined by CEA-861-F spec, so the size is 128 bits to map upto 128 VICs;

`y420_cmdb_modes`

bitmap of modes which can support ycbcr420 output also, along with normal HDMI outputs. There are total 107 VICs defined by CEA-861-F spec, so the size is 128 bits to map upto 128 VICs;

`y420_cmdb_map`

bitmap of SVD index, to extraxt vcb modes

`y420_dc_modes`

bitmap of deep color support index

**Description**

Describes if a given display supports advanced HDMI 2.0 features. This information is available in CEA-861-F extension blocks (like HF-VSDB).

enum `drm_link_status`[¶](#c.drm%5Flink%5Fstatus "Permalink to this definition")

connector’s link\_status property value

**Constants**

`DRM_LINK_STATUS_GOOD`

DP Link is Good as a result of successful link training

`DRM_LINK_STATUS_BAD`

DP Link is BAD as a result of link training failure

**Description**

This enum is used as the connector’s link status property value. It is set to the values defined in uapi.

struct `drm_display_info`[¶](#c.drm%5Fdisplay%5Finfo "Permalink to this definition")

runtime data about the connected sink

**Definition**

struct drm_display_info {
  char name;
  unsigned int width_mm;
  unsigned int height_mm;
  unsigned int pixel_clock;
  unsigned int bpc;
  enum subpixel_order subpixel_order;
#define DRM_COLOR_FORMAT_RGB444               (1\\\lt;\\\lt;0
#define DRM_COLOR_FORMAT_YCRCB444     (1\\\lt;\\\lt;1
#define DRM_COLOR_FORMAT_YCRCB422     (1\\\lt;\\\lt;2
#define DRM_COLOR_FORMAT_YCRCB420     (1\\\lt;\\\lt;3
  u32 color_formats;
  const u32 * bus_formats;
  unsigned int num_bus_formats;
#define DRM_BUS_FLAG_DE_LOW           (1\\\lt;\\\lt;0
#define DRM_BUS_FLAG_DE_HIGH          (1\\\lt;\\\lt;1
#define DRM_BUS_FLAG_PIXDATA_POSEDGE  (1\\\lt;\\\lt;2
#define DRM_BUS_FLAG_PIXDATA_NEGEDGE  (1\\\lt;\\\lt;3
#define DRM_BUS_FLAG_DATA_MSB_TO_LSB  (1\\\lt;\\\lt;4
#define DRM_BUS_FLAG_DATA_LSB_TO_MSB  (1\\\lt;\\\lt;5
  u32 bus_flags;
  int max_tmds_clock;
  bool dvi_dual;
  u8 edid_hdmi_dc_modes;
  u8 cea_rev;
  struct drm_hdmi_info hdmi;
  bool non_desktop;
};

**Members**

`name`

Name of the display.

`width_mm`

Physical width in mm.

`height_mm`

Physical height in mm.

`pixel_clock`

Maximum pixel clock supported by the sink, in units of 100Hz. This mismatches the clock in [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") (which is in kHZ), because that’s what the EDID uses as base unit.

`bpc`

Maximum bits per color channel. Used by HDMI and DP outputs.

`subpixel_order`

Subpixel order of LCD panels.

`color_formats`

HDMI Color formats, selects between RGB and YCrCb modes. Used DRM\_COLOR\_FORMAT\_ defines, which are \_not\_ the same ones as used to describe the pixel format in framebuffers, and also don’t match the formats in **bus\_formats** which are shared with v4l.

`bus_formats`

Pixel data format on the wire, somewhat redundant with**color\_formats**. Array of size **num\_bus\_formats** encoded using MEDIA\_BUS\_FMT\_ defines shared with v4l and media drivers.

`num_bus_formats`

Size of **bus\_formats** array.

`bus_flags`

Additional information (like pixel signal polarity) for the pixel data on the bus, using DRM\_BUS\_FLAGS\_ defines.

`max_tmds_clock`

Maximum TMDS clock rate supported by the sink in kHz. 0 means undefined.

`dvi_dual`

Dual-link DVI sink?

`edid_hdmi_dc_modes`

Mask of supported hdmi deep color modes. Even more stuff redundant with **bus\_formats**.

`cea_rev`

CEA revision of the HDMI sink.

`hdmi`

advance features of a HDMI sink.

`non_desktop`

Non desktop display (HMD).

**Description**

Describes a given display (e.g. CRT or flat panel) and its limitations. For fixed display sinks like built-in panels there’s not much difference between this and [struct drm\_connector](#c.drm%5Fconnector "drm_connector"). But for sinks with a real cable this structure is meant to describe all the things at the other end of the cable.

For sinks which provide an EDID this can be filled out by calling[drm\_add\_edid\_modes()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fadd%5Fedid%5Fmodes "drm_add_edid_modes").

struct `drm_tv_connector_state`[¶](#c.drm%5Ftv%5Fconnector%5Fstate "Permalink to this definition")

TV connector related states

**Definition**

struct drm_tv_connector_state {
  enum drm_mode_subconnector subconnector;
  struct margins;
  unsigned int mode;
  unsigned int brightness;
  unsigned int contrast;
  unsigned int flicker_reduction;
  unsigned int overscan;
  unsigned int saturation;
  unsigned int hue;
};

**Members**

`subconnector`

selected subconnector

`margins`

left/right/top/bottom margins

`mode`

TV mode

`brightness`

brightness in percent

`contrast`

contrast in percent

`flicker_reduction`

flicker reduction in percent

`overscan`

overscan in percent

`saturation`

saturation in percent

`hue`

hue in percent

struct `drm_connector_state`[¶](#c.drm%5Fconnector%5Fstate "Permalink to this definition")

mutable connector state

**Definition**

struct drm_connector_state {
  struct drm_connector * connector;
  struct drm_crtc * crtc;
  struct drm_encoder * best_encoder;
  enum drm_link_status link_status;
  struct drm_atomic_state * state;
  struct drm_crtc_commit * commit;
  struct drm_tv_connector_state tv;
  enum hdmi_picture_aspect picture_aspect_ratio;
  unsigned int scaling_mode;
};

**Members**

`connector`

backpointer to the connector

`crtc`

CRTC to connect connector to, NULL if disabled.

Do not change this directly, use [drm\_atomic\_set\_crtc\_for\_connector()](#c.drm%5Fatomic%5Fset%5Fcrtc%5Ffor%5Fconnector "drm_atomic_set_crtc_for_connector")instead.

`best_encoder`

can be used by helpers and drivers to select the encoder

`link_status`

Connector link\_status to keep track of whether link is GOOD or BAD to notify userspace if retraining is necessary.

`state`

backpointer to global drm\_atomic\_state

`commit`

Tracks the pending commit to prevent use-after-free conditions.

Is only set when **crtc** is NULL.

`tv`

TV connector state

`picture_aspect_ratio`

Connector property to control the HDMI infoframe aspect ratio setting.

The `DRM_MODE_PICTURE_ASPECT_`\* values much match the values for `enum hdmi_picture_aspect`

`scaling_mode`

Connector property to control the upscaling, mostly used for built-in panels.

struct `drm_connector_funcs`[¶](#c.drm%5Fconnector%5Ffuncs "Permalink to this definition")

control connectors on a given device

**Definition**

struct drm_connector_funcs {
  int (* dpms) (struct drm_connector *connector, int mode);
  void (* reset) (struct drm_connector *connector);
  enum drm_connector_status (* detect) (struct drm_connector *connector, bool force);
  void (* force) (struct drm_connector *connector);
  int (* fill_modes) (struct drm_connector *connector, uint32_t max_width, uint32_t max_height);
  int (* set_property) (struct drm_connector *connector, struct drm_property *property, uint64_t val);
  int (* late_register) (struct drm_connector *connector);
  void (* early_unregister) (struct drm_connector *connector);
  void (* destroy) (struct drm_connector *connector);
  struct drm_connector_state *(* atomic_duplicate_state) (struct drm_connector *connector);
  void (* atomic_destroy_state) (struct drm_connector *connector, struct drm_connector_state *state);
  int (* atomic_set_property) (struct drm_connector *connector,struct drm_connector_state *state,struct drm_property *property, uint64_t val);
  int (* atomic_get_property) (struct drm_connector *connector,const struct drm_connector_state *state,struct drm_property *property, uint64_t *val);
  void (* atomic_print_state) (struct drm_printer *p, const struct drm_connector_state *state);
};

**Members**

`dpms`

Legacy entry point to set the per-connector DPMS state. Legacy DPMS is exposed as a standard property on the connector, but diverted to this callback in the drm core. Note that atomic drivers don’t implement the 4 level DPMS support on the connector any more, but instead only have an on/off “ACTIVE” property on the CRTC object.

This hook is not used by atomic drivers, remapping of the legacy DPMS property is entirely handled in the DRM core.

RETURNS:

0 on success or a negative error code on failure.

`reset`

Reset connector hardware and software state to off. This function isn’t called by the core directly, only through [drm\_mode\_config\_reset()](#c.drm%5Fmode%5Fconfig%5Freset "drm_mode_config_reset"). It’s not a helper hook only for historical reasons.

Atomic drivers can use [drm\_atomic\_helper\_connector\_reset()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fconnector%5Freset "drm_atomic_helper_connector_reset") to reset atomic state using this hook.

`detect`

Check to see if anything is attached to the connector. The parameter force is set to false whilst polling, true when checking the connector due to a user request. force can be used by the driver to avoid expensive, destructive operations during automated probing.

This callback is optional, if not implemented the connector will be considered as always being attached.

FIXME:

Note that this hook is only called by the probe helper. It’s not in the helper library vtable purely for historical reasons. The only DRM core entry point to probe connector state is **fill\_modes**.

Note that the helper library will already hold[drm\_mode\_config.connection\_mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config"). Drivers which need to grab additional locks to avoid races with concurrent modeset changes need to use[drm\_connector\_helper\_funcs.detect\_ctx](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fconnector%5Fhelper%5Ffuncs "drm_connector_helper_funcs") instead.

RETURNS:

drm\_connector\_status indicating the connector’s status.

`force`

This function is called to update internal encoder state when the connector is forced to a certain state by userspace, either through the sysfs interfaces or on the kernel cmdline. In that case the**detect** callback isn’t called.

FIXME:

Note that this hook is only called by the probe helper. It’s not in the helper library vtable purely for historical reasons. The only DRM core entry point to probe connector state is **fill\_modes**.

`fill_modes`

Entry point for output detection and basic mode validation. The driver should reprobe the output if needed (e.g. when hotplug handling is unreliable), add all detected modes to [drm\_connector.modes](#c.drm%5Fconnector "drm_connector")and filter out any the device can’t support in any configuration. It also needs to filter out any modes wider or higher than the parameters max\_width and max\_height indicate.

The drivers must also prune any modes no longer valid from[drm\_connector.modes](#c.drm%5Fconnector "drm_connector"). Furthermore it must update[drm\_connector.status](#c.drm%5Fconnector "drm_connector") and [drm\_connector.edid](#c.drm%5Fconnector "drm_connector"). If no EDID has been received for this output connector->edid must be NULL.

Drivers using the probe helpers should use[drm\_helper\_probe\_single\_connector\_modes()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fhelper%5Fprobe%5Fsingle%5Fconnector%5Fmodes "drm_helper_probe_single_connector_modes") or`drm_helper_probe_single_connector_modes_nomerge()` to implement this function.

RETURNS:

The number of modes detected and filled into [drm\_connector.modes](#c.drm%5Fconnector "drm_connector").

`set_property`

This is the legacy entry point to update a property attached to the connector.

This callback is optional if the driver does not support any legacy driver-private properties. For atomic drivers it is not used because property handling is done entirely in the DRM core.

RETURNS:

0 on success or a negative error code on failure.

`late_register`

This optional hook can be used to register additional userspace interfaces attached to the connector, light backlight control, i2c, DP aux or similar interfaces. It is called late in the driver load sequence from [drm\_connector\_register()](#c.drm%5Fconnector%5Fregister "drm_connector_register") when registering all the core drm connector interfaces. Everything added from this callback should be unregistered in the early\_unregister callback.

This is called while holding [drm\_connector.mutex](#c.drm%5Fconnector "drm_connector").

Returns:

0 on success, or a negative error code on failure.

`early_unregister`

This optional hook should be used to unregister the additional userspace interfaces attached to the connector from`late_register()`. It is called from [drm\_connector\_unregister()](#c.drm%5Fconnector%5Funregister "drm_connector_unregister"), early in the driver unload sequence to disable userspace access before data structures are torndown.

This is called while holding [drm\_connector.mutex](#c.drm%5Fconnector "drm_connector").

`destroy`

Clean up connector resources. This is called at driver unload time through [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup"). It can also be called at runtime when a connector is being hot-unplugged for drivers that support connector hotplugging (e.g. DisplayPort MST).

`atomic_duplicate_state`

Duplicate the current atomic state for this connector and return it. The core and helpers guarantee that any atomic state duplicated with this hook and still owned by the caller (i.e. not transferred to the driver by calling [drm\_mode\_config\_funcs.atomic\_commit](#c.drm%5Fmode%5Fconfig%5Ffuncs "drm_mode_config_funcs")) will be cleaned up by calling the **atomic\_destroy\_state** hook in this structure.

Atomic drivers which don’t subclass [struct drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state") should use[drm\_atomic\_helper\_connector\_duplicate\_state()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fconnector%5Fduplicate%5Fstate "drm_atomic_helper_connector_duplicate_state"). Drivers that subclass the state structure to extend it with driver-private state should use[\_\_drm\_atomic\_helper\_connector\_duplicate\_state()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.%5F%5Fdrm%5Fatomic%5Fhelper%5Fconnector%5Fduplicate%5Fstate "__drm_atomic_helper_connector_duplicate_state") to make sure shared state is duplicated in a consistent fashion across drivers.

It is an error to call this hook before [drm\_connector.state](#c.drm%5Fconnector "drm_connector") has been initialized correctly.

NOTE:

If the duplicate state references refcounted resources this hook must acquire a reference for each of them. The driver must release these references again in **atomic\_destroy\_state**.

RETURNS:

Duplicated atomic state or NULL when the allocation failed.

`atomic_destroy_state`

Destroy a state duplicated with **atomic\_duplicate\_state** and release or unreference all resources it references

`atomic_set_property`

Decode a driver-private property value and store the decoded value into the passed-in state structure. Since the atomic core decodes all standardized properties (even for extensions beyond the core set of properties which might not be implemented by all drivers) this requires drivers to subclass the state structure.

Such driver-private properties should really only be implemented for truly hardware/vendor specific state. Instead it is preferred to standardize atomic extension and decode the properties used to expose such an extension in the core.

Do not call this function directly, use`drm_atomic_connector_set_property()` instead.

This callback is optional if the driver does not support any driver-private atomic properties.

NOTE:

This function is called in the state assembly phase of atomic modesets, which can be aborted for any reason (including on userspace’s request to just check whether a configuration would be possible). Drivers MUST NOT touch any persistent state (hardware or software) or data structures except the passed in **state** parameter.

Also since userspace controls in which order properties are set this function must not do any input validation (since the state update is incomplete and hence likely inconsistent). Instead any such input validation must be done in the various atomic\_check callbacks.

RETURNS:

0 if the property has been found, -EINVAL if the property isn’t implemented by the driver (which shouldn’t ever happen, the core only asks for properties attached to this connector). No other validation is allowed by the driver. The core already checks that the property value is within the range (integer, valid enum value, ...) the driver set when registering the property.

`atomic_get_property`

Reads out the decoded driver-private property. This is used to implement the GETCONNECTOR IOCTL.

Do not call this function directly, use`drm_atomic_connector_get_property()` instead.

This callback is optional if the driver does not support any driver-private atomic properties.

RETURNS:

0 on success, -EINVAL if the property isn’t implemented by the driver (which shouldn’t ever happen, the core only asks for properties attached to this connector).

`atomic_print_state`

If driver subclasses [struct drm\_connector\_state](#c.drm%5Fconnector%5Fstate "drm_connector_state"), it should implement this optional hook for printing additional driver specific state.

Do not call this directly, use `drm_atomic_connector_print_state()`instead.

**Description**

Each CRTC may have one or more connectors attached to it. The functions below allow the core DRM code to control connectors, enumerate available modes, etc.

struct `drm_connector`[¶](#c.drm%5Fconnector "Permalink to this definition")

central DRM connector control structure

**Definition**

struct drm_connector {
  struct drm_device * dev;
  struct device * kdev;
  struct device_attribute * attr;
  struct list_head head;
  struct drm_mode_object base;
  char * name;
  struct mutex mutex;
  unsigned index;
  int connector_type;
  int connector_type_id;
  bool interlace_allowed;
  bool doublescan_allowed;
  bool stereo_allowed;
  bool ycbcr_420_allowed;
  bool registered;
  struct list_head modes;
  enum drm_connector_status status;
  struct list_head probed_modes;
  struct drm_display_info display_info;
  const struct drm_connector_funcs * funcs;
  struct drm_property_blob * edid_blob_ptr;
  struct drm_object_properties properties;
  struct drm_property * scaling_mode_property;
  struct drm_property_blob * path_blob_ptr;
  struct drm_property_blob * tile_blob_ptr;
#define DRM_CONNECTOR_POLL_HPD (1 \\\lt;\\\lt; 0
#define DRM_CONNECTOR_POLL_CONNECT (1 \\\lt;\\\lt; 1
#define DRM_CONNECTOR_POLL_DISCONNECT (1 \\\lt;\\\lt; 2
  uint8_t polled;
  int dpms;
  const struct drm_connector_helper_funcs * helper_private;
  struct drm_cmdline_mode cmdline_mode;
  enum drm_connector_force force;
  bool override_edid;
#define DRM_CONNECTOR_MAX_ENCODER 3
  uint32_t encoder_ids;
  struct drm_encoder * encoder;
#define MAX_ELD_BYTES 128
  uint8_t eld;
  bool latency_present;
  int video_latency;
  int audio_latency;
  int null_edid_counter;
  unsigned bad_edid_counter;
  bool edid_corrupt;
  struct dentry * debugfs_entry;
  struct drm_connector_state * state;
  bool has_tile;
  struct drm_tile_group * tile_group;
  bool tile_is_single_monitor;
  uint8_t num_h_tile;
  uint8_t num_v_tile;
  uint8_t tile_h_loc;
  uint8_t tile_v_loc;
  uint16_t tile_h_size;
  uint16_t tile_v_size;
  struct llist_node free_node;
};

**Members**

`dev`

parent DRM device

`kdev`

kernel device for sysfs attributes

`attr`

sysfs attributes

`head`

list management

`base`

base KMS object

`name`

human readable name, can be overwritten by the driver

`mutex`

Lock for general connector state, but currently only protects**registered**. Most of the connector state is still protected by[drm\_mode\_config.mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config").

`index`

Compacted connector index, which matches the position inside the mode\_config.list for drivers not supporting hot-add/removing. Can be used as an array index. It is invariant over the lifetime of the connector.

`connector_type`

one of the DRM\_MODE\_CONNECTOR\_<foo> types from drm\_mode.h

`connector_type_id`

index into connector type enum

`interlace_allowed`

can this connector handle interlaced modes?

`doublescan_allowed`

can this connector handle doublescan?

`stereo_allowed`

can this connector handle stereo modes?

`ycbcr_420_allowed`

This bool indicates if this connector is capable of handling YCBCR 420 output. While parsing the EDID blocks, its very helpful to know, if the source is capable of handling YCBCR 420 outputs.

`registered`

Is this connector exposed (registered) with userspace? Protected by **mutex**.

`modes`

Modes available on this connector (from `fill_modes()` \+ user). Protected by [drm\_mode\_config.mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config").

`status`

One of the drm\_connector\_status enums (connected, not, or unknown). Protected by [drm\_mode\_config.mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config").

`probed_modes`

These are modes added by probing with DDC or the BIOS, before filtering is applied. Used by the probe helpers. Protected by[drm\_mode\_config.mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config").

`display_info`

Display information is filled from EDID information when a display is detected. For non hot-pluggable displays such as flat panels in embedded systems, the driver should initialize the[drm\_display\_info.width\_mm](#c.drm%5Fdisplay%5Finfo "drm_display_info") and [drm\_display\_info.height\_mm](#c.drm%5Fdisplay%5Finfo "drm_display_info") fields with the physical size of the display.

Protected by [drm\_mode\_config.mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config").

`funcs`

connector control functions

`edid_blob_ptr`

DRM property containing EDID if present

`properties`

property tracking for this connector

`scaling_mode_property`

Optional atomic property to control the upscaling.

`path_blob_ptr`

DRM blob property data for the DP MST path property.

`tile_blob_ptr`

DRM blob property data for the tile property (used mostly by DP MST). This is meant for screens which are driven through separate display pipelines represented by [drm\_crtc](#c.drm%5Fcrtc "drm_crtc"), which might not be running with genlocked clocks. For tiled panels which are genlocked, like dual-link LVDS or dual-link DSI, the driver should try to not expose the tiling and virtualize both [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") and [drm\_plane](#c.drm%5Fplane "drm_plane") if needed.

`polled`

Connector polling mode, a combination of

DRM\_CONNECTOR\_POLL\_HPD

The connector generates hotplug events and doesn’t need to be periodically polled. The CONNECT and DISCONNECT flags must not be set together with the HPD flag.

DRM\_CONNECTOR\_POLL\_CONNECT

Periodically poll the connector for connection.

DRM\_CONNECTOR\_POLL\_DISCONNECT

Periodically poll the connector for disconnection.

Set to 0 for connectors that don’t support connection status discovery.

`dpms`

current dpms state

`helper_private`

mid-layer private data

`cmdline_mode`

mode line parsed from the kernel cmdline for this connector

`force`

a DRM\_FORCE\_<foo> state for forced mode sets

`override_edid`

has the EDID been overwritten through debugfs for testing?

`encoder_ids`

valid encoders for this connector

`encoder`

encoder driving this connector, if any

`eld`

EDID-like data, if present

`latency_present`

AV delay info from ELD, if found

`video_latency`

video latency info from ELD, if found

`audio_latency`

audio latency info from ELD, if found

`null_edid_counter`

track sinks that give us all zeros for the EDID

`bad_edid_counter`

track sinks that give us an EDID with invalid checksum

`edid_corrupt`

indicates whether the last read EDID was corrupt

`debugfs_entry`

debugfs directory for this connector

`state`

Current atomic state for this connector.

This is protected by **drm\_mode\_config**.connection\_mutex. Note that nonblocking atomic commits access the current connector state without taking locks. Either by going through the [struct drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state")pointers, see [for\_each\_oldnew\_connector\_in\_state()](#c.for%5Feach%5Foldnew%5Fconnector%5Fin%5Fstate "for_each_oldnew_connector_in_state"),[for\_each\_old\_connector\_in\_state()](#c.for%5Feach%5Fold%5Fconnector%5Fin%5Fstate "for_each_old_connector_in_state") and[for\_each\_new\_connector\_in\_state()](#c.for%5Feach%5Fnew%5Fconnector%5Fin%5Fstate "for_each_new_connector_in_state"). Or through careful ordering of atomic commit operations as implemented in the atomic helpers, see[struct drm\_crtc\_commit](#c.drm%5Fcrtc%5Fcommit "drm_crtc_commit").

`has_tile`

is this connector connected to a tiled monitor

`tile_group`

tile group for the connected monitor

`tile_is_single_monitor`

whether the tile is one monitor housing

`num_h_tile`

number of horizontal tiles in the tile group

`num_v_tile`

number of vertical tiles in the tile group

`tile_h_loc`

horizontal location of this tile

`tile_v_loc`

vertical location of this tile

`tile_h_size`

horizontal size of this tile.

`tile_v_size`

vertical size of this tile.

`free_node`

List used only by `drm_connector_iter` to be able to clean up a connector from any context, in conjunction with[drm\_mode\_config.connector\_free\_work](#c.drm%5Fmode%5Fconfig "drm_mode_config").

**Description**

Each connector may be connected to one or more CRTCs, or may be clonable by another connector if they can share a CRTC. Each connector also has a specific position in the broader display (referred to as a ‘screen’ though it could span multiple monitors).

struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* `drm_connector_lookup`(struct drm\_device \* _dev_, struct [drm\_file](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file") \* _file\_priv_, uint32\_t _id_)[¶](#c.drm%5Fconnector%5Flookup "Permalink to this definition")

lookup connector object

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_file * file_priv`

drm file to check for lease against.

`uint32_t id`

connector object id

**Description**

This function looks up the connector object specified by id add takes a reference to it.

void `drm_connector_get`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fconnector%5Fget "Permalink to this definition")

acquire a connector reference

**Parameters**

`struct drm_connector * connector`

DRM connector

**Description**

This function increments the connector’s refcount.

void `drm_connector_put`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fconnector%5Fput "Permalink to this definition")

release a connector reference

**Parameters**

`struct drm_connector * connector`

DRM connector

**Description**

This function decrements the connector’s reference count and frees the object if the reference count drops to zero.

void `drm_connector_reference`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fconnector%5Freference "Permalink to this definition")

acquire a connector reference

**Parameters**

`struct drm_connector * connector`

DRM connector

**Description**

This is a compatibility alias for [drm\_connector\_get()](#c.drm%5Fconnector%5Fget "drm_connector_get") and should not be used by new code.

void `drm_connector_unreference`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fconnector%5Funreference "Permalink to this definition")

release a connector reference

**Parameters**

`struct drm_connector * connector`

DRM connector

**Description**

This is a compatibility alias for [drm\_connector\_put()](#c.drm%5Fconnector%5Fput "drm_connector_put") and should not be used by new code.

struct `drm_tile_group`[¶](#c.drm%5Ftile%5Fgroup "Permalink to this definition")

Tile group metadata

**Definition**

struct drm_tile_group {
  struct kref refcount;
  struct drm_device * dev;
  int id;
  u8 group_data;
};

**Members**

`refcount`

reference count

`dev`

DRM device

`id`

tile group id exposed to userspace

`group_data`

Sink-private data identifying this group

**Description**

**group\_data** corresponds to displayid vend/prod/serial for external screens with an EDID.

struct `drm_connector_list_iter`[¶](#c.drm%5Fconnector%5Flist%5Fiter "Permalink to this definition")

connector\_list iterator

**Definition**

struct drm_connector_list_iter {
};

**Members**

**Description**

This iterator tracks state needed to be able to walk the connector\_list within struct drm\_mode\_config. Only use together with[drm\_connector\_list\_iter\_begin()](#c.drm%5Fconnector%5Flist%5Fiter%5Fbegin "drm_connector_list_iter_begin"), [drm\_connector\_list\_iter\_end()](#c.drm%5Fconnector%5Flist%5Fiter%5Fend "drm_connector_list_iter_end") and[drm\_connector\_list\_iter\_next()](#c.drm%5Fconnector%5Flist%5Fiter%5Fnext "drm_connector_list_iter_next") respectively the convenience macro[drm\_for\_each\_connector\_iter()](#c.drm%5Ffor%5Feach%5Fconnector%5Fiter "drm_for_each_connector_iter").

`drm_for_each_connector_iter`(_connector_, _iter_)[¶](#c.drm%5Ffor%5Feach%5Fconnector%5Fiter "Permalink to this definition")

connector\_list iterator macro

**Parameters**

`connector`

[struct drm\_connector](#c.drm%5Fconnector "drm_connector") pointer used as cursor

`iter`

[struct drm\_connector\_list\_iter](#c.drm%5Fconnector%5Flist%5Fiter "drm_connector_list_iter")

**Description**

Note that **connector** is only valid within the list body, if you want to use**connector** after calling [drm\_connector\_list\_iter\_end()](#c.drm%5Fconnector%5Flist%5Fiter%5Fend "drm_connector_list_iter_end") then you need to grab your own reference first using [drm\_connector\_get()](#c.drm%5Fconnector%5Fget "drm_connector_get").

int `drm_connector_init`(struct drm\_device \* _dev_, struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_, const struct [drm\_connector\_funcs](#c.drm%5Fconnector%5Ffuncs "drm_connector_funcs") \* _funcs_, int _connector\_type_)[¶](#c.drm%5Fconnector%5Finit "Permalink to this definition")

Init a preallocated connector

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_connector * connector`

the connector to init

`const struct drm_connector_funcs * funcs`

callbacks for this connector

`int connector_type`

user visible type of the connector

**Description**

Initialises a preallocated connector. Connectors should be subclassed as part of driver connector objects.

**Return**

Zero on success, error code on failure.

int `drm_mode_connector_attach_encoder`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_, struct [drm\_encoder](#c.drm%5Fencoder "drm_encoder") \* _encoder_)[¶](#c.drm%5Fmode%5Fconnector%5Fattach%5Fencoder "Permalink to this definition")

attach a connector to an encoder

**Parameters**

`struct drm_connector * connector`

connector to attach

`struct drm_encoder * encoder`

encoder to attach **connector** to

**Description**

This function links up a connector to an encoder. Note that the routing restrictions between encoders and crtcs are exposed to userspace through the possible\_clones and possible\_crtcs bitmasks.

**Return**

Zero on success, negative errno on failure.

void `drm_connector_cleanup`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fconnector%5Fcleanup "Permalink to this definition")

cleans up an initialised connector

**Parameters**

`struct drm_connector * connector`

connector to cleanup

**Description**

Cleans up the connector but doesn’t free the object.

int `drm_connector_register`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fconnector%5Fregister "Permalink to this definition")

register a connector

**Parameters**

`struct drm_connector * connector`

the connector to register

**Description**

Register userspace interfaces for a connector

**Return**

Zero on success, error code on failure.

void `drm_connector_unregister`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fconnector%5Funregister "Permalink to this definition")

unregister a connector

**Parameters**

`struct drm_connector * connector`

the connector to unregister

**Description**

Unregister userspace interfaces for a connector

const char \* `drm_get_connector_status_name`(enum [drm\_connector\_status](#c.drm%5Fconnector%5Fstatus "drm_connector_status") _status_)[¶](#c.drm%5Fget%5Fconnector%5Fstatus%5Fname "Permalink to this definition")

return a string for connector status

**Parameters**

`enum drm_connector_status status`

connector status to compute name of

**Description**

In contrast to the other drm\_get\_\*\_name functions this one here returns a const pointer and hence is threadsafe.

void `drm_connector_list_iter_begin`(struct drm\_device \* _dev_, struct [drm\_connector\_list\_iter](#c.drm%5Fconnector%5Flist%5Fiter "drm_connector_list_iter") \* _iter_)[¶](#c.drm%5Fconnector%5Flist%5Fiter%5Fbegin "Permalink to this definition")

initialize a connector\_list iterator

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_connector_list_iter * iter`

connector\_list iterator

**Description**

Sets **iter** up to walk the [drm\_mode\_config.connector\_list](#c.drm%5Fmode%5Fconfig "drm_mode_config") of **dev**. **iter**must always be cleaned up again by calling [drm\_connector\_list\_iter\_end()](#c.drm%5Fconnector%5Flist%5Fiter%5Fend "drm_connector_list_iter_end"). Iteration itself happens using [drm\_connector\_list\_iter\_next()](#c.drm%5Fconnector%5Flist%5Fiter%5Fnext "drm_connector_list_iter_next") or[drm\_for\_each\_connector\_iter()](#c.drm%5Ffor%5Feach%5Fconnector%5Fiter "drm_for_each_connector_iter").

struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* `drm_connector_list_iter_next`(struct [drm\_connector\_list\_iter](#c.drm%5Fconnector%5Flist%5Fiter "drm_connector_list_iter") \* _iter_)[¶](#c.drm%5Fconnector%5Flist%5Fiter%5Fnext "Permalink to this definition")

return next connector

**Parameters**

`struct drm_connector_list_iter * iter`

connectr\_list iterator

**Description**

Returns the next connector for **iter**, or NULL when the list walk has completed.

void `drm_connector_list_iter_end`(struct [drm\_connector\_list\_iter](#c.drm%5Fconnector%5Flist%5Fiter "drm_connector_list_iter") \* _iter_)[¶](#c.drm%5Fconnector%5Flist%5Fiter%5Fend "Permalink to this definition")

tear down a connector\_list iterator

**Parameters**

`struct drm_connector_list_iter * iter`

connector\_list iterator

**Description**

Tears down **iter** and releases any resources (like [drm\_connector](#c.drm%5Fconnector "drm_connector") references) acquired while walking the list. This must always be called, both when the iteration completes fully or when it was aborted without walking the entire list.

const char \* `drm_get_subpixel_order_name`(enum subpixel\_order _order_)[¶](#c.drm%5Fget%5Fsubpixel%5Forder%5Fname "Permalink to this definition")

return a string for a given subpixel enum

**Parameters**

`enum subpixel_order order`

enum of subpixel\_order

**Description**

Note you could abuse this and return something out of bounds, but that would be a caller error. No unscrubbed user data should make it here.

int `drm_display_info_set_bus_formats`(struct [drm\_display\_info](#c.drm%5Fdisplay%5Finfo "drm_display_info") \* _info_, const u32 \* _formats_, unsigned int _num\_formats_)[¶](#c.drm%5Fdisplay%5Finfo%5Fset%5Fbus%5Fformats "Permalink to this definition")

set the supported bus formats

**Parameters**

`struct drm_display_info * info`

display info to store bus formats in

`const u32 * formats`

array containing the supported bus formats

`unsigned int num_formats`

the number of entries in the fmts array

**Description**

Store the supported bus formats in display info structure. See MEDIA\_BUS\_FMT\_\* definitions in include/uapi/linux/media-bus-format.h for a full list of available formats.

int `drm_mode_create_dvi_i_properties`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmode%5Fcreate%5Fdvi%5Fi%5Fproperties "Permalink to this definition")

create DVI-I specific connector properties

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

Called by a driver the first time a DVI-I connector is made.

int `drm_mode_create_tv_properties`(struct drm\_device \* _dev_, unsigned int _num\_modes_, const char \*const _modes_)[¶](#c.drm%5Fmode%5Fcreate%5Ftv%5Fproperties "Permalink to this definition")

create TV specific connector properties

**Parameters**

`struct drm_device * dev`

DRM device

`unsigned int num_modes`

number of different TV formats (modes) supported

`const char *const modes`

array of pointers to strings containing name of each format

**Description**

Called by a driver’s TV initialization routine, this function creates the TV specific connector properties for a given device. Caller is responsible for allocating a list of format names and passing them to this routine.

int `drm_mode_create_scaling_mode_property`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmode%5Fcreate%5Fscaling%5Fmode%5Fproperty "Permalink to this definition")

create scaling mode property

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

Called by a driver the first time it’s needed, must be attached to desired connectors.

Atomic drivers should use [drm\_connector\_attach\_scaling\_mode\_property()](#c.drm%5Fconnector%5Fattach%5Fscaling%5Fmode%5Fproperty "drm_connector_attach_scaling_mode_property")instead to correctly assign [drm\_connector\_state.picture\_aspect\_ratio](#c.drm%5Fconnector%5Fstate "drm_connector_state")in the atomic state.

int `drm_connector_attach_scaling_mode_property`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_, u32 _scaling\_mode\_mask_)[¶](#c.drm%5Fconnector%5Fattach%5Fscaling%5Fmode%5Fproperty "Permalink to this definition")

attach atomic scaling mode property

**Parameters**

`struct drm_connector * connector`

connector to attach scaling mode property on.

`u32 scaling_mode_mask`

or’ed mask of BIT(`DRM_MODE_SCALE_`\*).

**Description**

This is used to add support for scaling mode to atomic drivers. The scaling mode will be set to [drm\_connector\_state.picture\_aspect\_ratio](#c.drm%5Fconnector%5Fstate "drm_connector_state")and can be used from [drm\_connector\_helper\_funcs\->atomic\_check](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fconnector%5Fhelper%5Ffuncs "drm_connector_helper_funcs") for validation.

This is the atomic version of [drm\_mode\_create\_scaling\_mode\_property()](#c.drm%5Fmode%5Fcreate%5Fscaling%5Fmode%5Fproperty "drm_mode_create_scaling_mode_property").

**Return**

Zero on success, negative errno on failure.

int `drm_mode_create_aspect_ratio_property`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmode%5Fcreate%5Faspect%5Fratio%5Fproperty "Permalink to this definition")

create aspect ratio property

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

Called by a driver the first time it’s needed, must be attached to desired connectors.

**Return**

Zero on success, negative errno on failure.

int `drm_mode_create_suggested_offset_properties`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmode%5Fcreate%5Fsuggested%5Foffset%5Fproperties "Permalink to this definition")

create suggests offset properties

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

Create the the suggested x/y offset property for connectors.

int `drm_mode_connector_set_path_property`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_, const char \* _path_)[¶](#c.drm%5Fmode%5Fconnector%5Fset%5Fpath%5Fproperty "Permalink to this definition")

set tile property on connector

**Parameters**

`struct drm_connector * connector`

connector to set property on.

`const char * path`

path to use for property; must not be NULL.

**Description**

This creates a property to expose to userspace to specify a connector path. This is mainly used for DisplayPort MST where connectors have a topology and we want to allow userspace to give them more meaningful names.

**Return**

Zero on success, negative errno on failure.

int `drm_mode_connector_set_tile_property`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_)[¶](#c.drm%5Fmode%5Fconnector%5Fset%5Ftile%5Fproperty "Permalink to this definition")

set tile property on connector

**Parameters**

`struct drm_connector * connector`

connector to set property on.

**Description**

This looks up the tile information for a connector, and creates a property for userspace to parse if it exists. The property is of the form of 8 integers using ‘:’ as a separator.

**Return**

Zero on success, errno on failure.

int `drm_mode_connector_update_edid_property`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_, const struct edid \* _edid_)[¶](#c.drm%5Fmode%5Fconnector%5Fupdate%5Fedid%5Fproperty "Permalink to this definition")

update the edid property of a connector

**Parameters**

`struct drm_connector * connector`

drm connector

`const struct edid * edid`

new value of the edid property

**Description**

This function creates a new blob modeset object and assigns its id to the connector’s edid property.

**Return**

Zero on success, negative errno on failure.

void `drm_mode_connector_set_link_status_property`(struct [drm\_connector](#c.drm%5Fconnector "drm_connector") \* _connector_, uint64\_t _link\_status_)[¶](#c.drm%5Fmode%5Fconnector%5Fset%5Flink%5Fstatus%5Fproperty "Permalink to this definition")

Set link status property of a connector

**Parameters**

`struct drm_connector * connector`

drm connector

`uint64_t link_status`

new value of link status property (0: Good, 1: Bad)

**Description**

In usual working scenario, this link status property will always be set to “GOOD”. If something fails during or after a mode set, the kernel driver may set this link status property to “BAD”. The caller then needs to send a hotplug uevent for userspace to re-check the valid modes through GET\_CONNECTOR\_IOCTL and retry modeset.

**Note**

Drivers cannot rely on userspace to support this property and issue a modeset. As such, they may choose to handle issues (like re-training a link) without userspace’s intervention.

The reason for adding this property is to handle link training failures, but it is not limited to DP or link training. For example, if we implement asynchronous setcrtc, this property can be used to report any failures in that.

void `drm_mode_put_tile_group`(struct drm\_device \* _dev_, struct [drm\_tile\_group](#c.drm%5Ftile%5Fgroup "drm_tile_group") \* _tg_)[¶](#c.drm%5Fmode%5Fput%5Ftile%5Fgroup "Permalink to this definition")

drop a reference to a tile group.

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_tile_group * tg`

tile group to drop reference to.

**Description**

drop reference to tile group and free if 0.

struct [drm\_tile\_group](#c.drm%5Ftile%5Fgroup "drm_tile_group") \* `drm_mode_get_tile_group`(struct drm\_device \* _dev_, char _topology_)[¶](#c.drm%5Fmode%5Fget%5Ftile%5Fgroup "Permalink to this definition")

get a reference to an existing tile group

**Parameters**

`struct drm_device * dev`

DRM device

`char topology`

8-bytes unique per monitor.

**Description**

Use the unique bytes to get a reference to an existing tile group.

**Return**

tile group or NULL if not found.

struct [drm\_tile\_group](#c.drm%5Ftile%5Fgroup "drm_tile_group") \* `drm_mode_create_tile_group`(struct drm\_device \* _dev_, char _topology_)[¶](#c.drm%5Fmode%5Fcreate%5Ftile%5Fgroup "Permalink to this definition")

create a tile group from a displayid description

**Parameters**

`struct drm_device * dev`

DRM device

`char topology`

8-bytes unique per monitor.

**Description**

Create a tile group for the unique monitor, and get a unique identifier for the tile group.

**Return**

new tile group or error.

## Encoder Abstraction[¶](#encoder-abstraction "Permalink to this headline")

Encoders represent the connecting element between the CRTC (as the overall pixel pipeline, represented by [struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc")) and the connectors (as the generic sink entity, represented by [struct drm\_connector](#c.drm%5Fconnector "drm_connector")). An encoder takes pixel data from a CRTC and converts it to a format suitable for any attached connector. Encoders are objects exposed to userspace, originally to allow userspace to infer cloning and connector/CRTC restrictions. Unfortunately almost all drivers get this wrong, making the uabi pretty much useless. On top of that the exposed restrictions are too simple for today’s hardware, and the recommended way to infer restrictions is by using the DRM\_MODE\_ATOMIC\_TEST\_ONLY flag for the atomic IOCTL.

Otherwise encoders aren’t used in the uapi at all (any modeset request from userspace directly connects a connector with a CRTC), drivers are therefore free to use them however they wish. Modeset helper libraries make strong use of encoders to facilitate code sharing. But for more complex settings it is usually better to move shared code into a separate [drm\_bridge](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fbridge "drm_bridge"). Compared to encoders, bridges also have the benefit of being purely an internal abstraction since they are not exposed to userspace at all.

Encoders are initialized with [drm\_encoder\_init()](#c.drm%5Fencoder%5Finit "drm_encoder_init") and cleaned up using[drm\_encoder\_cleanup()](#c.drm%5Fencoder%5Fcleanup "drm_encoder_cleanup").

### Encoder Functions Reference[¶](#encoder-functions-reference "Permalink to this headline")

struct `drm_encoder_funcs`[¶](#c.drm%5Fencoder%5Ffuncs "Permalink to this definition")

encoder controls

**Definition**

struct drm_encoder_funcs {
  void (* reset) (struct drm_encoder *encoder);
  void (* destroy) (struct drm_encoder *encoder);
  int (* late_register) (struct drm_encoder *encoder);
  void (* early_unregister) (struct drm_encoder *encoder);
};

**Members**

`reset`

Reset encoder hardware and software state to off. This function isn’t called by the core directly, only through [drm\_mode\_config\_reset()](#c.drm%5Fmode%5Fconfig%5Freset "drm_mode_config_reset"). It’s not a helper hook only for historical reasons.

`destroy`

Clean up encoder resources. This is only called at driver unload time through [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup") since an encoder cannot be hotplugged in DRM.

`late_register`

This optional hook can be used to register additional userspace interfaces attached to the encoder like debugfs interfaces. It is called late in the driver load sequence from [drm\_dev\_register()](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdev%5Fregister "drm_dev_register"). Everything added from this callback should be unregistered in the early\_unregister callback.

Returns:

0 on success, or a negative error code on failure.

`early_unregister`

This optional hook should be used to unregister the additional userspace interfaces attached to the encoder from**late\_register**. It is called from [drm\_dev\_unregister()](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdev%5Funregister "drm_dev_unregister"), early in the driver unload sequence to disable userspace access before data structures are torndown.

**Description**

Encoders sit between CRTCs and connectors.

struct `drm_encoder`[¶](#c.drm%5Fencoder "Permalink to this definition")

central DRM encoder structure

**Definition**

struct drm_encoder {
  struct drm_device * dev;
  struct list_head head;
  struct drm_mode_object base;
  char * name;
  int encoder_type;
  unsigned index;
  uint32_t possible_crtcs;
  uint32_t possible_clones;
  struct drm_crtc * crtc;
  struct drm_bridge * bridge;
  const struct drm_encoder_funcs * funcs;
  const struct drm_encoder_helper_funcs * helper_private;
};

**Members**

`dev`

parent DRM device

`head`

list management

`base`

base KMS object

`name`

human readable name, can be overwritten by the driver

`encoder_type`

One of the DRM\_MODE\_ENCODER\_<foo> types in drm\_mode.h. The following encoder types are defined thus far:

* DRM\_MODE\_ENCODER\_DAC for VGA and analog on DVI-I/DVI-A.
* DRM\_MODE\_ENCODER\_TMDS for DVI, HDMI and (embedded) DisplayPort.
* DRM\_MODE\_ENCODER\_LVDS for display panels, or in general any panel with a proprietary parallel connector.
* DRM\_MODE\_ENCODER\_TVDAC for TV output (Composite, S-Video, Component, SCART).
* DRM\_MODE\_ENCODER\_VIRTUAL for virtual machine displays
* DRM\_MODE\_ENCODER\_DSI for panels connected using the DSI serial bus.
* DRM\_MODE\_ENCODER\_DPI for panels connected using the DPI parallel bus.
* DRM\_MODE\_ENCODER\_DPMST for special fake encoders used to allow mutliple DP MST streams to share one physical encoder.

`index`

Position inside the mode\_config.list, can be used as an array index. It is invariant over the lifetime of the encoder.

`possible_crtcs`

Bitmask of potential CRTC bindings, using[drm\_crtc\_index()](#c.drm%5Fcrtc%5Findex "drm_crtc_index") as the index into the bitfield. The driver must set the bits for all [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") objects this encoder can be connected to before calling [drm\_encoder\_init()](#c.drm%5Fencoder%5Finit "drm_encoder_init").

In reality almost every driver gets this wrong.

Note that since CRTC objects can’t be hotplugged the assigned indices are stable and hence known before registering all objects.

`possible_clones`

Bitmask of potential sibling encoders for cloning, using [drm\_encoder\_index()](#c.drm%5Fencoder%5Findex "drm_encoder_index") as the index into the bitfield. The driver must set the bits for all [drm\_encoder](#c.drm%5Fencoder "drm_encoder") objects which can clone a[drm\_crtc](#c.drm%5Fcrtc "drm_crtc") together with this encoder before calling[drm\_encoder\_init()](#c.drm%5Fencoder%5Finit "drm_encoder_init"). Drivers should set the bit representing the encoder itself, too. Cloning bits should be set such that when two encoders can be used in a cloned configuration, they both should have each another bits set.

In reality almost every driver gets this wrong.

Note that since encoder objects can’t be hotplugged the assigned indices are stable and hence known before registering all objects.

`crtc`

currently bound CRTC

`bridge`

bridge associated to the encoder

`funcs`

control functions

`helper_private`

mid-layer private data

**Description**

CRTCs drive pixels to encoders, which convert them into signals appropriate for a given connector or set of connectors.

unsigned int `drm_encoder_index`(struct [drm\_encoder](#c.drm%5Fencoder "drm_encoder") \* _encoder_)[¶](#c.drm%5Fencoder%5Findex "Permalink to this definition")

find the index of a registered encoder

**Parameters**

`struct drm_encoder * encoder`

encoder to find index for

**Description**

Given a registered encoder, return the index of that encoder within a DRM device’s list of encoders.

bool `drm_encoder_crtc_ok`(struct [drm\_encoder](#c.drm%5Fencoder "drm_encoder") \* _encoder_, struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fencoder%5Fcrtc%5Fok "Permalink to this definition")

can a given crtc drive a given encoder?

**Parameters**

`struct drm_encoder * encoder`

encoder to test

`struct drm_crtc * crtc`

crtc to test

**Description**

Returns false if **encoder** can’t be driven by **crtc**, true otherwise.

struct [drm\_encoder](#c.drm%5Fencoder "drm_encoder") \* `drm_encoder_find`(struct drm\_device \* _dev_, struct [drm\_file](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file") \* _file\_priv_, uint32\_t _id_)[¶](#c.drm%5Fencoder%5Ffind "Permalink to this definition")

find a [drm\_encoder](#c.drm%5Fencoder "drm_encoder")

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_file * file_priv`

drm file to check for lease against.

`uint32_t id`

encoder id

**Description**

Returns the encoder with **id**, NULL if it doesn’t exist. Simple wrapper around[drm\_mode\_object\_find()](#c.drm%5Fmode%5Fobject%5Ffind "drm_mode_object_find").

`drm_for_each_encoder_mask`(_encoder_, _dev_, _encoder\_mask_)[¶](#c.drm%5Ffor%5Feach%5Fencoder%5Fmask "Permalink to this definition")

iterate over encoders specified by bitmask

**Parameters**

`encoder`

the loop cursor

`dev`

the DRM device

`encoder_mask`

bitmask of encoder indices

**Description**

Iterate over all encoders specified by bitmask.

`drm_for_each_encoder`(_encoder_, _dev_)[¶](#c.drm%5Ffor%5Feach%5Fencoder "Permalink to this definition")

iterate over all encoders

**Parameters**

`encoder`

the loop cursor

`dev`

the DRM device

**Description**

Iterate over all encoders of **dev**.

int `drm_encoder_init`(struct drm\_device \* _dev_, struct [drm\_encoder](#c.drm%5Fencoder "drm_encoder") \* _encoder_, const struct [drm\_encoder\_funcs](#c.drm%5Fencoder%5Ffuncs "drm_encoder_funcs") \* _funcs_, int _encoder\_type_, const char \* _name_, ...)[¶](#c.drm%5Fencoder%5Finit "Permalink to this definition")

Init a preallocated encoder

**Parameters**

`struct drm_device * dev`

drm device

`struct drm_encoder * encoder`

the encoder to init

`const struct drm_encoder_funcs * funcs`

callbacks for this encoder

`int encoder_type`

user visible type of the encoder

`const char * name`

printf style format string for the encoder name, or NULL for default name

`...`

variable arguments

**Description**

Initialises a preallocated encoder. Encoder should be subclassed as part of driver encoder objects. At driver unload time [drm\_encoder\_cleanup()](#c.drm%5Fencoder%5Fcleanup "drm_encoder_cleanup") should be called from the driver’s [drm\_encoder\_funcs.destroy](#c.drm%5Fencoder%5Ffuncs "drm_encoder_funcs") hook.

**Return**

Zero on success, error code on failure.

void `drm_encoder_cleanup`(struct [drm\_encoder](#c.drm%5Fencoder "drm_encoder") \* _encoder_)[¶](#c.drm%5Fencoder%5Fcleanup "Permalink to this definition")

cleans up an initialised encoder

**Parameters**

`struct drm_encoder * encoder`

encoder to cleanup

**Description**

Cleans up the encoder but doesn’t free the object.

## KMS Initialization and Cleanup[¶](#kms-initialization-and-cleanup "Permalink to this headline")

A KMS device is abstracted and exposed as a set of planes, CRTCs, encoders and connectors. KMS drivers must thus create and initialize all those objects at load time after initializing mode setting.

### CRTCs ([struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc"))[¶](#crtcs-struct-drm-crtc "Permalink to this headline")

A CRTC is an abstraction representing a part of the chip that contains a pointer to a scanout buffer. Therefore, the number of CRTCs available determines how many independent scanout buffers can be active at any given time. The CRTC structure contains several fields to support this: a pointer to some video memory (abstracted as a frame buffer object), a display mode, and an (x, y) offset into the video memory to support panning or configurations where one piece of video memory spans multiple CRTCs.

#### CRTC Initialization[¶](#crtc-initialization "Permalink to this headline")

A KMS device must create and register at least one struct[struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc") instance. The instance is allocated and zeroed by the driver, possibly as part of a larger structure, and registered with a call to [drm\_crtc\_init()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fcrtc%5Finit "drm_crtc_init")with a pointer to CRTC functions.

### Cleanup[¶](#cleanup "Permalink to this headline")

The DRM core manages its objects’ lifetime. When an object is not needed anymore the core calls its destroy function, which must clean up and free every resource allocated for the object. Every`drm_*_init()` call must be matched with a corresponding`drm_*_cleanup()` call to cleanup CRTCs ([drm\_crtc\_cleanup()](#c.drm%5Fcrtc%5Fcleanup "drm_crtc_cleanup")), planes ([drm\_plane\_cleanup()](#c.drm%5Fplane%5Fcleanup "drm_plane_cleanup")), encoders ([drm\_encoder\_cleanup()](#c.drm%5Fencoder%5Fcleanup "drm_encoder_cleanup")) and connectors ([drm\_connector\_cleanup()](#c.drm%5Fconnector%5Fcleanup "drm_connector_cleanup")). Furthermore, connectors that have been added to sysfs must be removed by a call to[drm\_connector\_unregister()](#c.drm%5Fconnector%5Funregister "drm_connector_unregister") before calling[drm\_connector\_cleanup()](#c.drm%5Fconnector%5Fcleanup "drm_connector_cleanup").

Connectors state change detection must be cleanup up with a call to[drm\_kms\_helper\_poll\_fini()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fkms%5Fhelper%5Fpoll%5Ffini "drm_kms_helper_poll_fini").

### Output discovery and initialization example[¶](#output-discovery-and-initialization-example "Permalink to this headline")

void intel_crt_init(struct drm_device *dev)
{
    struct drm_connector *connector;
    struct intel_output *intel_output;

    intel_output = kzalloc(sizeof(struct intel_output), GFP_KERNEL);
    if (!intel_output)
        return;

    connector = &intel_output->base;
    drm_connector_init(dev, &intel_output->base,
               &intel_crt_connector_funcs, DRM_MODE_CONNECTOR_VGA);

    drm_encoder_init(dev, &intel_output->enc, &intel_crt_enc_funcs,
             DRM_MODE_ENCODER_DAC);

    drm_mode_connector_attach_encoder(&intel_output->base,
                      &intel_output->enc);

    /* Set up the DDC bus. */
    intel_output->ddc_bus = intel_i2c_create(dev, GPIOA, "CRTDDC_A");
    if (!intel_output->ddc_bus) {
        dev_printk(KERN_ERR, &dev->pdev->dev, "DDC bus registration "
               "failed.\n");
        return;
    }

    intel_output->type = INTEL_OUTPUT_ANALOG;
    connector->interlace_allowed = 0;
    connector->doublescan_allowed = 0;

    drm_encoder_helper_add(&intel_output->enc, &intel_crt_helper_funcs);
    drm_connector_helper_add(connector, &intel_crt_connector_helper_funcs);

    drm_connector_register(connector);
}

In the example above (taken from the i915 driver), a CRTC, connector and encoder combination is created. A device-specific i2c bus is also created for fetching EDID data and performing monitor detection. Once the process is complete, the new connector is registered with sysfs to make its properties available to applications.

## KMS Locking[¶](#kms-locking "Permalink to this headline")

As KMS moves toward more fine grained locking, and atomic ioctl where userspace can indirectly control locking order, it becomes necessary to use `ww_mutex` and acquire-contexts to avoid deadlocks. But because the locking is more distributed around the driver code, we want a bit of extra utility/tracking out of our acquire-ctx. This is provided by [struct drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") and [struct drm\_modeset\_acquire\_ctx](#c.drm%5Fmodeset%5Facquire%5Fctx "drm_modeset_acquire_ctx").

For basic principles of `ww_mutex`, see: Documentation/locking/ww-mutex-design.txt

The basic usage pattern is to:

drm_modeset_acquire_init(ctx, DRM_MODESET_ACQUIRE_INTERRUPTIBLE)
retry:
foreach (lock in random_ordered_set_of_locks) {
    ret = drm_modeset_lock(lock, ctx)
    if (ret == -EDEADLK) {
        ret = drm_modeset_backoff(ctx);
        if (!ret)
            goto retry;
    }
    if (ret)
        goto out;
}
... do stuff ...
out:
drm_modeset_drop_locks(ctx);
drm_modeset_acquire_fini(ctx);

If all that is needed is a single modeset lock, then the [structdrm\_modeset\_acquire\_ctx](#c.drm%5Fmodeset%5Facquire%5Fctx "drm_modeset_acquire_ctx") is not needed and the locking can be simplified by passing a NULL instead of ctx in the [drm\_modeset\_lock()](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") call or calling [drm\_modeset\_lock\_single\_interruptible()](#c.drm%5Fmodeset%5Flock%5Fsingle%5Finterruptible "drm_modeset_lock_single_interruptible"). To unlock afterwards call [drm\_modeset\_unlock()](#c.drm%5Fmodeset%5Funlock "drm_modeset_unlock").

On top of these per-object locks using `ww_mutex` there’s also an overall[drm\_mode\_config.mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config"), for protecting everything else. Mostly this means probe state of connectors, and preventing hotplug add/removal of connectors.

Finally there’s a bunch of dedicated locks to protect drm core internal lists and lookup data structures.

struct `drm_modeset_acquire_ctx`[¶](#c.drm%5Fmodeset%5Facquire%5Fctx "Permalink to this definition")

locking context (see ww\_acquire\_ctx)

**Definition**

struct drm_modeset_acquire_ctx {
  struct ww_acquire_ctx ww_ctx;
  struct drm_modeset_lock * contended;
  struct list_head locked;
  bool trylock_only;
  bool interruptible;
};

**Members**

`ww_ctx`

base acquire ctx

`contended`

used internally for -EDEADLK handling

`locked`

list of held locks

`trylock_only`

trylock mode used in atomic contexts/panic notifiers

`interruptible`

whether interruptible locking should be used.

**Description**

Each thread competing for a set of locks must use one acquire ctx. And if any lock fxn returns -EDEADLK, it must backoff and retry.

struct `drm_modeset_lock`[¶](#c.drm%5Fmodeset%5Flock "Permalink to this definition")

used for locking modeset resources.

**Definition**

struct drm_modeset_lock {
  struct ww_mutex mutex;
  struct list_head head;
};

**Members**

`mutex`

resource locking

`head`

used to hold it’s place on `drm_atomi_state.locked` list when part of an atomic update

**Description**

Used for locking CRTCs and other modeset resources.

void `drm_modeset_lock_fini`(struct [drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") \* _lock_)[¶](#c.drm%5Fmodeset%5Flock%5Ffini "Permalink to this definition")

cleanup lock

**Parameters**

`struct drm_modeset_lock * lock`

lock to cleanup

bool `drm_modeset_is_locked`(struct [drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") \* _lock_)[¶](#c.drm%5Fmodeset%5Fis%5Flocked "Permalink to this definition")

equivalent to [mutex\_is\_locked()](https://www.kernel.org/doc/html/v4.15/kernel-hacking/locking.html#c.mutex%5Fis%5Flocked "mutex_is_locked")

**Parameters**

`struct drm_modeset_lock * lock`

lock to check

void `drm_modeset_lock_all`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmodeset%5Flock%5Fall "Permalink to this definition")

take all modeset locks

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

This function takes all modeset locks, suitable where a more fine-grained scheme isn’t (yet) implemented. Locks must be dropped by calling the[drm\_modeset\_unlock\_all()](#c.drm%5Fmodeset%5Funlock%5Fall "drm_modeset_unlock_all") function.

This function is deprecated. It allocates a lock acquisition context and stores it in `drm_device.mode_config`. This facilitate conversion of existing code because it removes the need to manually deal with the acquisition context, but it is also brittle because the context is global and care must be taken not to nest calls. New code should use the[drm\_modeset\_lock\_all\_ctx()](#c.drm%5Fmodeset%5Flock%5Fall%5Fctx "drm_modeset_lock_all_ctx") function and pass in the context explicitly.

void `drm_modeset_unlock_all`(struct drm\_device \* _dev_)[¶](#c.drm%5Fmodeset%5Funlock%5Fall "Permalink to this definition")

drop all modeset locks

**Parameters**

`struct drm_device * dev`

DRM device

**Description**

This function drops all modeset locks taken by a previous call to the[drm\_modeset\_lock\_all()](#c.drm%5Fmodeset%5Flock%5Fall "drm_modeset_lock_all") function.

This function is deprecated. It uses the lock acquisition context stored in `drm_device.mode_config`. This facilitates conversion of existing code because it removes the need to manually deal with the acquisition context, but it is also brittle because the context is global and care must be taken not to nest calls. New code should pass the acquisition context directly to the [drm\_modeset\_drop\_locks()](#c.drm%5Fmodeset%5Fdrop%5Flocks "drm_modeset_drop_locks") function.

void `drm_warn_on_modeset_not_all_locked`(struct drm\_device \* _dev_)[¶](#c.drm%5Fwarn%5Fon%5Fmodeset%5Fnot%5Fall%5Flocked "Permalink to this definition")

check that all modeset locks are locked

**Parameters**

`struct drm_device * dev`

device

**Description**

Useful as a debug assert.

void `drm_modeset_acquire_init`(struct [drm\_modeset\_acquire\_ctx](#c.drm%5Fmodeset%5Facquire%5Fctx "drm_modeset_acquire_ctx") \* _ctx_, uint32\_t _flags_)[¶](#c.drm%5Fmodeset%5Facquire%5Finit "Permalink to this definition")

initialize acquire context

**Parameters**

`struct drm_modeset_acquire_ctx * ctx`

the acquire context

`uint32_t flags`

0 or `DRM_MODESET_ACQUIRE_INTERRUPTIBLE`

**Description**

When passing `DRM_MODESET_ACQUIRE_INTERRUPTIBLE` to **flags**, all calls to [drm\_modeset\_lock()](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") will perform an interruptible wait.

void `drm_modeset_acquire_fini`(struct [drm\_modeset\_acquire\_ctx](#c.drm%5Fmodeset%5Facquire%5Fctx "drm_modeset_acquire_ctx") \* _ctx_)[¶](#c.drm%5Fmodeset%5Facquire%5Ffini "Permalink to this definition")

cleanup acquire context

**Parameters**

`struct drm_modeset_acquire_ctx * ctx`

the acquire context

void `drm_modeset_drop_locks`(struct [drm\_modeset\_acquire\_ctx](#c.drm%5Fmodeset%5Facquire%5Fctx "drm_modeset_acquire_ctx") \* _ctx_)[¶](#c.drm%5Fmodeset%5Fdrop%5Flocks "Permalink to this definition")

drop all locks

**Parameters**

`struct drm_modeset_acquire_ctx * ctx`

the acquire context

**Description**

Drop all locks currently held against this acquire context.

int `drm_modeset_backoff`(struct [drm\_modeset\_acquire\_ctx](#c.drm%5Fmodeset%5Facquire%5Fctx "drm_modeset_acquire_ctx") \* _ctx_)[¶](#c.drm%5Fmodeset%5Fbackoff "Permalink to this definition")

deadlock avoidance backoff

**Parameters**

`struct drm_modeset_acquire_ctx * ctx`

the acquire context

**Description**

If deadlock is detected (ie. [drm\_modeset\_lock()](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") returns -EDEADLK), you must call this function to drop all currently held locks and block until the contended lock becomes available.

This function returns 0 on success, or -ERESTARTSYS if this context is initialized with `DRM_MODESET_ACQUIRE_INTERRUPTIBLE` and the wait has been interrupted.

void `drm_modeset_lock_init`(struct [drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") \* _lock_)[¶](#c.drm%5Fmodeset%5Flock%5Finit "Permalink to this definition")

initialize lock

**Parameters**

`struct drm_modeset_lock * lock`

lock to init

int `drm_modeset_lock`(struct [drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") \* _lock_, struct [drm\_modeset\_acquire\_ctx](#c.drm%5Fmodeset%5Facquire%5Fctx "drm_modeset_acquire_ctx") \* _ctx_)

take modeset lock

**Parameters**

`struct drm_modeset_lock * lock`

lock to take

`struct drm_modeset_acquire_ctx * ctx`

acquire ctx

**Description**

If **ctx** is not NULL, then its ww acquire context is used and the lock will be tracked by the context and can be released by calling[drm\_modeset\_drop\_locks()](#c.drm%5Fmodeset%5Fdrop%5Flocks "drm_modeset_drop_locks"). If -EDEADLK is returned, this means a deadlock scenario has been detected and it is an error to attempt to take any more locks without first calling [drm\_modeset\_backoff()](#c.drm%5Fmodeset%5Fbackoff "drm_modeset_backoff").

If the **ctx** is not NULL and initialized with`DRM_MODESET_ACQUIRE_INTERRUPTIBLE`, this function will fail with -ERESTARTSYS when interrupted.

If **ctx** is NULL then the function call behaves like a normal, uninterruptible non-nesting [mutex\_lock()](https://www.kernel.org/doc/html/v4.15/kernel-hacking/locking.html#c.mutex%5Flock "mutex_lock") call.

int `drm_modeset_lock_single_interruptible`(struct [drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") \* _lock_)[¶](#c.drm%5Fmodeset%5Flock%5Fsingle%5Finterruptible "Permalink to this definition")

take a single modeset lock

**Parameters**

`struct drm_modeset_lock * lock`

lock to take

**Description**

This function behaves as [drm\_modeset\_lock()](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") with a NULL context, but performs interruptible waits.

This function returns 0 on success, or -ERESTARTSYS when interrupted.

void `drm_modeset_unlock`(struct [drm\_modeset\_lock](#c.drm%5Fmodeset%5Flock "drm_modeset_lock") \* _lock_)[¶](#c.drm%5Fmodeset%5Funlock "Permalink to this definition")

drop modeset lock

**Parameters**

`struct drm_modeset_lock * lock`

lock to release

int `drm_modeset_lock_all_ctx`(struct drm\_device \* _dev_, struct [drm\_modeset\_acquire\_ctx](#c.drm%5Fmodeset%5Facquire%5Fctx "drm_modeset_acquire_ctx") \* _ctx_)[¶](#c.drm%5Fmodeset%5Flock%5Fall%5Fctx "Permalink to this definition")

take all modeset locks

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_modeset_acquire_ctx * ctx`

lock acquisition context

**Description**

This function takes all modeset locks, suitable where a more fine-grained scheme isn’t (yet) implemented.

Unlike [drm\_modeset\_lock\_all()](#c.drm%5Fmodeset%5Flock%5Fall "drm_modeset_lock_all"), it doesn’t take the [drm\_mode\_config.mutex](#c.drm%5Fmode%5Fconfig "drm_mode_config")since that lock isn’t required for modeset state changes. Callers which need to grab that lock too need to do so outside of the acquire context**ctx**.

Locks acquired with this function should be released by calling the[drm\_modeset\_drop\_locks()](#c.drm%5Fmodeset%5Fdrop%5Flocks "drm_modeset_drop_locks") function on **ctx**.

**Return**

0 on success or a negative error-code on failure.

## KMS Properties[¶](#kms-properties "Permalink to this headline")

### Property Types and Blob Property Support[¶](#property-types-and-blob-property-support "Permalink to this headline")

Properties as represented by [drm\_property](#c.drm%5Fproperty "drm_property") are used to extend the modeset interface exposed to userspace. For the atomic modeset IOCTL properties are even the only way to transport metadata about the desired new modeset configuration from userspace to the kernel. Properties have a well-defined value range, which is enforced by the drm core. See the documentation of the flags member of [struct drm\_property](#c.drm%5Fproperty "drm_property") for an overview of the different property types and ranges.

Properties don’t store the current value directly, but need to be instatiated by attaching them to a [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") with[drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property").

Property values are only 64bit. To support bigger piles of data (like gamma tables, color correction matrices or large structures) a property can instead point at a [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") with that additional data.

Properties are defined by their symbolic name, userspace must keep a per-object mapping from those names to the property ID used in the atomic IOCTL and in the get/set property IOCTL.

struct `drm_property_enum`[¶](#c.drm%5Fproperty%5Fenum "Permalink to this definition")

symbolic values for enumerations

**Definition**

struct drm_property_enum {
  uint64_t value;
  struct list_head head;
  char name;
};

**Members**

`value`

numeric property value for this enum entry

`head`

list of enum values, linked to [drm\_property.enum\_list](#c.drm%5Fproperty "drm_property")

`name`

symbolic name for the enum

**Description**

For enumeration and bitmask properties this structure stores the symbolic decoding for each value. This is used for example for the rotation property.

struct `drm_property`[¶](#c.drm%5Fproperty "Permalink to this definition")

modeset object property

**Definition**

struct drm_property {
  struct list_head head;
  struct drm_mode_object base;
  uint32_t flags;
  char name;
  uint32_t num_values;
  uint64_t * values;
  struct drm_device * dev;
  struct list_head enum_list;
};

**Members**

`head`

per-device list of properties, for cleanup.

`base`

base KMS object

`flags`

Property flags and type. A property needs to be one of the following types:

DRM\_MODE\_PROP\_RANGE

Range properties report their minimum and maximum admissible unsigned values. The KMS core verifies that values set by application fit in that range. The range is unsigned. Range properties are created using[drm\_property\_create\_range()](#c.drm%5Fproperty%5Fcreate%5Frange "drm_property_create_range").

DRM\_MODE\_PROP\_SIGNED\_RANGE

Range properties report their minimum and maximum admissible unsigned values. The KMS core verifies that values set by application fit in that range. The range is signed. Range properties are created using[drm\_property\_create\_signed\_range()](#c.drm%5Fproperty%5Fcreate%5Fsigned%5Frange "drm_property_create_signed_range").

DRM\_MODE\_PROP\_ENUM

Enumerated properties take a numerical value that ranges from 0 to the number of enumerated values defined by the property minus one, and associate a free-formed string name to each value. Applications can retrieve the list of defined value-name pairs and use the numerical value to get and set property instance values. Enum properties are created using [drm\_property\_create\_enum()](#c.drm%5Fproperty%5Fcreate%5Fenum "drm_property_create_enum").

DRM\_MODE\_PROP\_BITMASK

Bitmask properties are enumeration properties that additionally restrict all enumerated values to the 0..63 range. Bitmask property instance values combine one or more of the enumerated bits defined by the property. Bitmask properties are created using[drm\_property\_create\_bitmask()](#c.drm%5Fproperty%5Fcreate%5Fbitmask "drm_property_create_bitmask").

DRM\_MODE\_PROB\_OBJECT

Object properties are used to link modeset objects. This is used extensively in the atomic support to create the display pipeline, by linking [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") to [drm\_plane](#c.drm%5Fplane "drm_plane"), [drm\_plane](#c.drm%5Fplane "drm_plane") to[drm\_crtc](#c.drm%5Fcrtc "drm_crtc") and [drm\_connector](#c.drm%5Fconnector "drm_connector") to [drm\_crtc](#c.drm%5Fcrtc "drm_crtc"). An object property can only link to a specific type of [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object"), this limit is enforced by the core. Object properties are created using[drm\_property\_create\_object()](#c.drm%5Fproperty%5Fcreate%5Fobject "drm_property_create_object").

Object properties work like blob properties, but in a more general fashion. They are limited to atomic drivers and must have the DRM\_MODE\_PROP\_ATOMIC flag set.

DRM\_MODE\_PROP\_BLOB

Blob properties store a binary blob without any format restriction. The binary blobs are created as KMS standalone objects, and blob property instance values store the ID of their associated blob object. Blob properties are created by calling[drm\_property\_create()](#c.drm%5Fproperty%5Fcreate "drm_property_create") with DRM\_MODE\_PROP\_BLOB as the type.

Actual blob objects to contain blob data are created using[drm\_property\_create\_blob()](#c.drm%5Fproperty%5Fcreate%5Fblob "drm_property_create_blob"), or through the corresponding IOCTL.

Besides the built-in limit to only accept blob objects blob properties work exactly like object properties. The only reasons blob properties exist is backwards compatibility with existing userspace.

In addition a property can have any combination of the below flags:

DRM\_MODE\_PROP\_ATOMIC

Set for properties which encode atomic modeset state. Such properties are not exposed to legacy userspace.

DRM\_MODE\_PROP\_IMMUTABLE

Set for properties where userspace cannot be changed by userspace. The kernel is allowed to update the value of these properties. This is generally used to expose probe state to usersapce, e.g. the EDID, or the connector path property on DP MST sinks.

`name`

symbolic name of the properties

`num_values`

size of the **values** array.

`values`

Array with limits and values for the property. The interpretation of these limits is dependent upon the type per **flags**.

`dev`

DRM device

`enum_list`

List of `drm_prop_enum_list` structures with the symbolic names for enum and bitmask values.

**Description**

This structure represent a modeset object property. It combines both the name of the property with the set of permissible values. This means that when a driver wants to use a property with the same name on different objects, but with different value ranges, then it must create property for each one. An example would be rotation of [drm\_plane](#c.drm%5Fplane "drm_plane"), when e.g. the primary plane cannot be rotated. But if both the name and the value range match, then the same property structure can be instantiated multiple times for the same object. Userspace must be able to cope with this and cannot assume that the same symbolic property will have the same modeset object ID on all modeset objects.

Properties are created by one of the special functions, as explained in detail in the **flags** structure member.

To actually expose a property it must be attached to each object using[drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property"). Currently properties can only be attached to[drm\_connector](#c.drm%5Fconnector "drm_connector"), [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") and [drm\_plane](#c.drm%5Fplane "drm_plane").

Properties are also used as the generic metadatatransport for the atomic IOCTL. Everything that was set directly in structures in the legacy modeset IOCTLs (like the plane source or destination windows, or e.g. the links to the CRTC) is exposed as a property with the DRM\_MODE\_PROP\_ATOMIC flag set.

struct `drm_property_blob`[¶](#c.drm%5Fproperty%5Fblob "Permalink to this definition")

Blob data for [drm\_property](#c.drm%5Fproperty "drm_property")

**Definition**

struct drm_property_blob {
  struct drm_mode_object base;
  struct drm_device * dev;
  struct list_head head_global;
  struct list_head head_file;
  size_t length;
  unsigned char data;
};

**Members**

`base`

base KMS object

`dev`

DRM device

`head_global`

entry on the global blob list in[drm\_mode\_config.property\_blob\_list](#c.drm%5Fmode%5Fconfig "drm_mode_config").

`head_file`

entry on the per-file blob list in [drm\_file.blobs](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file") list.

`length`

size of the blob in bytes, invariant over the lifetime of the object

`data`

actual data, embedded at the end of this structure

**Description**

Blobs are used to store bigger values than what fits directly into the 64 bits available for a [drm\_property](#c.drm%5Fproperty "drm_property").

Blobs are reference counted using [drm\_property\_blob\_get()](#c.drm%5Fproperty%5Fblob%5Fget "drm_property_blob_get") and[drm\_property\_blob\_put()](#c.drm%5Fproperty%5Fblob%5Fput "drm_property_blob_put"). They are created using [drm\_property\_create\_blob()](#c.drm%5Fproperty%5Fcreate%5Fblob "drm_property_create_blob").

bool `drm_property_type_is`(struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _property_, uint32\_t _type_)[¶](#c.drm%5Fproperty%5Ftype%5Fis "Permalink to this definition")

check the type of a property

**Parameters**

`struct drm_property * property`

property to check

`uint32_t type`

property type to compare with

**Description**

This is a helper function becauase the uapi encoding of property types is a bit special for historical reasons.

struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* `drm_property_reference_blob`(struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* _blob_)[¶](#c.drm%5Fproperty%5Freference%5Fblob "Permalink to this definition")

acquire a blob property reference

**Parameters**

`struct drm_property_blob * blob`

DRM blob property

**Description**

This is a compatibility alias for [drm\_property\_blob\_get()](#c.drm%5Fproperty%5Fblob%5Fget "drm_property_blob_get") and should not be used by new code.

void `drm_property_unreference_blob`(struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* _blob_)[¶](#c.drm%5Fproperty%5Funreference%5Fblob "Permalink to this definition")

release a blob property reference

**Parameters**

`struct drm_property_blob * blob`

DRM blob property

**Description**

This is a compatibility alias for [drm\_property\_blob\_put()](#c.drm%5Fproperty%5Fblob%5Fput "drm_property_blob_put") and should not be used by new code.

struct [drm\_property](#c.drm%5Fproperty "drm_property") \* `drm_property_find`(struct drm\_device \* _dev_, struct [drm\_file](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Ffile "drm_file") \* _file\_priv_, uint32\_t _id_)[¶](#c.drm%5Fproperty%5Ffind "Permalink to this definition")

find property object

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_file * file_priv`

drm file to check for lease against.

`uint32_t id`

property object id

**Description**

This function looks up the property object specified by id and returns it.

struct [drm\_property](#c.drm%5Fproperty "drm_property") \* `drm_property_create`(struct drm\_device \* _dev_, int _flags_, const char \* _name_, int _num\_values_)[¶](#c.drm%5Fproperty%5Fcreate "Permalink to this definition")

create a new property type

**Parameters**

`struct drm_device * dev`

drm device

`int flags`

flags specifying the property type

`const char * name`

name of the property

`int num_values`

number of pre-defined values

**Description**

This creates a new generic drm property which can then be attached to a drm object with [drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property"). The returned property object must be freed with [drm\_property\_destroy()](#c.drm%5Fproperty%5Fdestroy "drm_property_destroy"), which is done automatically when calling [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup").

**Return**

A pointer to the newly created property on success, NULL on failure.

struct [drm\_property](#c.drm%5Fproperty "drm_property") \* `drm_property_create_enum`(struct drm\_device \* _dev_, int _flags_, const char \* _name_, const struct drm\_prop\_enum\_list \* _props_, int _num\_values_)[¶](#c.drm%5Fproperty%5Fcreate%5Fenum "Permalink to this definition")

create a new enumeration property type

**Parameters**

`struct drm_device * dev`

drm device

`int flags`

flags specifying the property type

`const char * name`

name of the property

`const struct drm_prop_enum_list * props`

enumeration lists with property values

`int num_values`

number of pre-defined values

**Description**

This creates a new generic drm property which can then be attached to a drm object with [drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property"). The returned property object must be freed with [drm\_property\_destroy()](#c.drm%5Fproperty%5Fdestroy "drm_property_destroy"), which is done automatically when calling [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup").

Userspace is only allowed to set one of the predefined values for enumeration properties.

**Return**

A pointer to the newly created property on success, NULL on failure.

struct [drm\_property](#c.drm%5Fproperty "drm_property") \* `drm_property_create_bitmask`(struct drm\_device \* _dev_, int _flags_, const char \* _name_, const struct drm\_prop\_enum\_list \* _props_, int _num\_props_, uint64\_t _supported\_bits_)[¶](#c.drm%5Fproperty%5Fcreate%5Fbitmask "Permalink to this definition")

create a new bitmask property type

**Parameters**

`struct drm_device * dev`

drm device

`int flags`

flags specifying the property type

`const char * name`

name of the property

`const struct drm_prop_enum_list * props`

enumeration lists with property bitflags

`int num_props`

size of the **props** array

`uint64_t supported_bits`

bitmask of all supported enumeration values

**Description**

This creates a new bitmask drm property which can then be attached to a drm object with [drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property"). The returned property object must be freed with [drm\_property\_destroy()](#c.drm%5Fproperty%5Fdestroy "drm_property_destroy"), which is done automatically when calling [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup").

Compared to plain enumeration properties userspace is allowed to set any or’ed together combination of the predefined property bitflag values

**Return**

A pointer to the newly created property on success, NULL on failure.

struct [drm\_property](#c.drm%5Fproperty "drm_property") \* `drm_property_create_range`(struct drm\_device \* _dev_, int _flags_, const char \* _name_, uint64\_t _min_, uint64\_t _max_)[¶](#c.drm%5Fproperty%5Fcreate%5Frange "Permalink to this definition")

create a new unsigned ranged property type

**Parameters**

`struct drm_device * dev`

drm device

`int flags`

flags specifying the property type

`const char * name`

name of the property

`uint64_t min`

minimum value of the property

`uint64_t max`

maximum value of the property

**Description**

This creates a new generic drm property which can then be attached to a drm object with [drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property"). The returned property object must be freed with [drm\_property\_destroy()](#c.drm%5Fproperty%5Fdestroy "drm_property_destroy"), which is done automatically when calling [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup").

Userspace is allowed to set any unsigned integer value in the (min, max) range inclusive.

**Return**

A pointer to the newly created property on success, NULL on failure.

struct [drm\_property](#c.drm%5Fproperty "drm_property") \* `drm_property_create_signed_range`(struct drm\_device \* _dev_, int _flags_, const char \* _name_, int64\_t _min_, int64\_t _max_)[¶](#c.drm%5Fproperty%5Fcreate%5Fsigned%5Frange "Permalink to this definition")

create a new signed ranged property type

**Parameters**

`struct drm_device * dev`

drm device

`int flags`

flags specifying the property type

`const char * name`

name of the property

`int64_t min`

minimum value of the property

`int64_t max`

maximum value of the property

**Description**

This creates a new generic drm property which can then be attached to a drm object with [drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property"). The returned property object must be freed with [drm\_property\_destroy()](#c.drm%5Fproperty%5Fdestroy "drm_property_destroy"), which is done automatically when calling [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup").

Userspace is allowed to set any signed integer value in the (min, max) range inclusive.

**Return**

A pointer to the newly created property on success, NULL on failure.

struct [drm\_property](#c.drm%5Fproperty "drm_property") \* `drm_property_create_object`(struct drm\_device \* _dev_, int _flags_, const char \* _name_, uint32\_t _type_)[¶](#c.drm%5Fproperty%5Fcreate%5Fobject "Permalink to this definition")

create a new object property type

**Parameters**

`struct drm_device * dev`

drm device

`int flags`

flags specifying the property type

`const char * name`

name of the property

`uint32_t type`

object type from DRM\_MODE\_OBJECT\_\* defines

**Description**

This creates a new generic drm property which can then be attached to a drm object with [drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property"). The returned property object must be freed with [drm\_property\_destroy()](#c.drm%5Fproperty%5Fdestroy "drm_property_destroy"), which is done automatically when calling [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup").

Userspace is only allowed to set this to any property value of the given**type**. Only useful for atomic properties, which is enforced.

**Return**

A pointer to the newly created property on success, NULL on failure.

struct [drm\_property](#c.drm%5Fproperty "drm_property") \* `drm_property_create_bool`(struct drm\_device \* _dev_, int _flags_, const char \* _name_)[¶](#c.drm%5Fproperty%5Fcreate%5Fbool "Permalink to this definition")

create a new boolean property type

**Parameters**

`struct drm_device * dev`

drm device

`int flags`

flags specifying the property type

`const char * name`

name of the property

**Description**

This creates a new generic drm property which can then be attached to a drm object with [drm\_object\_attach\_property()](#c.drm%5Fobject%5Fattach%5Fproperty "drm_object_attach_property"). The returned property object must be freed with [drm\_property\_destroy()](#c.drm%5Fproperty%5Fdestroy "drm_property_destroy"), which is done automatically when calling [drm\_mode\_config\_cleanup()](#c.drm%5Fmode%5Fconfig%5Fcleanup "drm_mode_config_cleanup").

This is implemented as a ranged property with only {0, 1} as valid values.

**Return**

A pointer to the newly created property on success, NULL on failure.

int `drm_property_add_enum`(struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _property_, int _index_, uint64\_t _value_, const char \* _name_)[¶](#c.drm%5Fproperty%5Fadd%5Fenum "Permalink to this definition")

add a possible value to an enumeration property

**Parameters**

`struct drm_property * property`

enumeration property to change

`int index`

index of the new enumeration

`uint64_t value`

value of the new enumeration

`const char * name`

symbolic name of the new enumeration

**Description**

This functions adds enumerations to a property.

It’s use is deprecated, drivers should use one of the more specific helpers to directly create the property with all enumerations already attached.

**Return**

Zero on success, error code on failure.

void `drm_property_destroy`(struct drm\_device \* _dev_, struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _property_)[¶](#c.drm%5Fproperty%5Fdestroy "Permalink to this definition")

destroy a drm property

**Parameters**

`struct drm_device * dev`

drm device

`struct drm_property * property`

property to destry

**Description**

This function frees a property including any attached resources like enumeration values.

struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* `drm_property_create_blob`(struct drm\_device \* _dev_, size\_t _length_, const void \* _data_)[¶](#c.drm%5Fproperty%5Fcreate%5Fblob "Permalink to this definition")

Create new blob property

**Parameters**

`struct drm_device * dev`

DRM device to create property for

`size_t length`

Length to allocate for blob data

`const void * data`

If specified, copies data into blob

**Description**

Creates a new blob property for a specified DRM device, optionally copying data. Note that blob properties are meant to be invariant, hence the data must be filled out before the blob is used as the value of any property.

**Return**

New blob property with a single reference on success, or an ERR\_PTR value on failure.

void `drm_property_blob_put`(struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* _blob_)[¶](#c.drm%5Fproperty%5Fblob%5Fput "Permalink to this definition")

release a blob property reference

**Parameters**

`struct drm_property_blob * blob`

DRM blob property

**Description**

Releases a reference to a blob property. May free the object.

struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* `drm_property_blob_get`(struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* _blob_)[¶](#c.drm%5Fproperty%5Fblob%5Fget "Permalink to this definition")

acquire blob property reference

**Parameters**

`struct drm_property_blob * blob`

DRM blob property

**Description**

Acquires a reference to an existing blob property. Returns **blob**, which allows this to be used as a shorthand in assignments.

struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* `drm_property_lookup_blob`(struct drm\_device \* _dev_, uint32\_t _id_)[¶](#c.drm%5Fproperty%5Flookup%5Fblob "Permalink to this definition")

look up a blob property and take a reference

**Parameters**

`struct drm_device * dev`

drm device

`uint32_t id`

id of the blob property

**Description**

If successful, this takes an additional reference to the blob property. callers need to make sure to eventually unreference the returned property again, using [drm\_property\_blob\_put()](#c.drm%5Fproperty%5Fblob%5Fput "drm_property_blob_put").

**Return**

NULL on failure, pointer to the blob on success.

int `drm_property_replace_global_blob`(struct drm\_device \* _dev_, struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \*\* _replace_, size\_t _length_, const void \* _data_, struct [drm\_mode\_object](#c.drm%5Fmode%5Fobject "drm_mode_object") \* _obj\_holds\_id_, struct [drm\_property](#c.drm%5Fproperty "drm_property") \* _prop\_holds\_id_)[¶](#c.drm%5Fproperty%5Freplace%5Fglobal%5Fblob "Permalink to this definition")

replace existing blob property

**Parameters**

`struct drm_device * dev`

drm device

`struct drm_property_blob ** replace`

location of blob property pointer to be replaced

`size_t length`

length of data for new blob, or 0 for no data

`const void * data`

content for new blob, or NULL for no data

`struct drm_mode_object * obj_holds_id`

optional object for property holding blob ID

`struct drm_property * prop_holds_id`

optional property holding blob ID**return** 0 on success or error on failure

**Description**

This function will replace a global property in the blob list, optionally updating a property which holds the ID of that property.

If length is 0 or data is NULL, no new blob will be created, and the holding property, if specified, will be set to 0.

Access to the replace pointer is assumed to be protected by the caller, e.g. by holding the relevant modesetting object lock for its parent.

For example, a drm\_connector has a ‘PATH’ property, which contains the ID of a blob property with the value of the MST path information. Calling this function with replace pointing to the connector’s path\_blob\_ptr, length and data set for the new path information, obj\_holds\_id set to the connector’s base object, and prop\_holds\_id set to the path property name, will perform a completely atomic update. The access to path\_blob\_ptr is protected by the caller holding a lock on the connector.

bool `drm_property_replace_blob`(struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \*\* _blob_, struct [drm\_property\_blob](#c.drm%5Fproperty%5Fblob "drm_property_blob") \* _new\_blob_)[¶](#c.drm%5Fproperty%5Freplace%5Fblob "Permalink to this definition")

replace a blob property

**Parameters**

`struct drm_property_blob ** blob`

a pointer to the member blob to be replaced

`struct drm_property_blob * new_blob`

the new blob to replace with

**Return**

true if the blob was in fact replaced.

### Standard Connector Properties[¶](#standard-connector-properties "Permalink to this headline")

DRM connectors have a few standardized properties:

EDID:

Blob property which contains the current EDID read from the sink. This is useful to parse sink identification information like vendor, model and serial. Drivers should update this property by calling[drm\_mode\_connector\_update\_edid\_property()](#c.drm%5Fmode%5Fconnector%5Fupdate%5Fedid%5Fproperty "drm_mode_connector_update_edid_property"), usually after having parsed the EDID using [drm\_add\_edid\_modes()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fadd%5Fedid%5Fmodes "drm_add_edid_modes"). Userspace cannot change this property.

DPMS:

Legacy property for setting the power state of the connector. For atomic drivers this is only provided for backwards compatibility with existing drivers, it remaps to controlling the “ACTIVE” property on the CRTC the connector is linked to. Drivers should never set this property directly, it is handled by the DRM core by calling the [drm\_connector\_funcs.dpms](#c.drm%5Fconnector%5Ffuncs "drm_connector_funcs")callback. For atomic drivers the remapping to the “ACTIVE” property is implemented in the DRM core. This is the only standard connector property that userspace can change.

Note that this property cannot be set through the MODE\_ATOMIC ioctl, userspace must use “ACTIVE” on the CRTC instead.

WARNING:

For userspace also running on legacy drivers the “DPMS” semantics are a lot more complicated. First, userspace cannot rely on the “DPMS” value returned by the GETCONNECTOR actually reflecting reality, because many drivers fail to update it. For atomic drivers this is taken care of in[drm\_atomic\_helper\_update\_legacy\_modeset\_state()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fupdate%5Flegacy%5Fmodeset%5Fstate "drm_atomic_helper_update_legacy_modeset_state").

The second issue is that the DPMS state is only well-defined when the connector is connected to a CRTC. In atomic the DRM core enforces that “ACTIVE” is off in such a case, no such checks exists for “DPMS”.

Finally, when enabling an output using the legacy SETCONFIG ioctl then “DPMS” is forced to ON. But see above, that might not be reflected in the software value on legacy drivers.

Summarizing: Only set “DPMS” when the connector is known to be enabled, assume that a successful SETCONFIG call also sets “DPMS” to on, and never read back the value of “DPMS” because it can be incorrect.

PATH:

Connector path property to identify how this sink is physically connected. Used by DP MST. This should be set by calling[drm\_mode\_connector\_set\_path\_property()](#c.drm%5Fmode%5Fconnector%5Fset%5Fpath%5Fproperty "drm_mode_connector_set_path_property"), in the case of DP MST with the path property the MST manager created. Userspace cannot change this property.

TILE:

Connector tile group property to indicate how a set of DRM connector compose together into one logical screen. This is used by both high-res external screens (often only using a single cable, but exposing multiple DP MST sinks), or high-res integrated panels (like dual-link DSI) which are not gen-locked. Note that for tiled panels which are genlocked, like dual-link LVDS or dual-link DSI, the driver should try to not expose the tiling and virtualize both [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") and [drm\_plane](#c.drm%5Fplane "drm_plane") if needed. Drivers should update this value using [drm\_mode\_connector\_set\_tile\_property()](#c.drm%5Fmode%5Fconnector%5Fset%5Ftile%5Fproperty "drm_mode_connector_set_tile_property"). Userspace cannot change this property.

link-status:

Connector link-status property to indicate the status of link. The default value of link-status is “GOOD”. If something fails during or after modeset, the kernel driver may set this to “BAD” and issue a hotplug uevent. Drivers should update this value using [drm\_mode\_connector\_set\_link\_status\_property()](#c.drm%5Fmode%5Fconnector%5Fset%5Flink%5Fstatus%5Fproperty "drm_mode_connector_set_link_status_property").

non\_desktop:

Indicates the output should be ignored for purposes of displaying a standard desktop environment or console. This is most likely because the output device is not rectilinear.

Connectors also have one standardized atomic property:

CRTC\_ID:

Mode object ID of the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") this connector should be connected to.

### Plane Composition Properties[¶](#plane-composition-properties "Permalink to this headline")

The basic plane composition model supported by standard plane properties only has a source rectangle (in logical pixels within the [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer")), with sub-pixel accuracy, which is scaled up to a pixel-aligned destination rectangle in the visible area of a [drm\_crtc](#c.drm%5Fcrtc "drm_crtc"). The visible area of a CRTC is defined by the horizontal and vertical visible pixels (stored in **hdisplay**and **vdisplay**) of the requested mode (stored in [drm\_crtc\_state.mode](#c.drm%5Fcrtc%5Fstate "drm_crtc_state")). These two rectangles are both stored in the [drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state").

For the atomic ioctl the following standard (atomic) properties on the plane object encode the basic plane composition model:

SRC\_X:

X coordinate offset for the source rectangle within the[drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer"), in 16.16 fixed point. Must be positive.

SRC\_Y:

Y coordinate offset for the source rectangle within the[drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer"), in 16.16 fixed point. Must be positive.

SRC\_W:

Width for the source rectangle within the [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer"), in 16.16 fixed point. SRC\_X plus SRC\_W must be within the width of the source framebuffer. Must be positive.

SRC\_H:

Height for the source rectangle within the [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer"), in 16.16 fixed point. SRC\_Y plus SRC\_H must be within the height of the source framebuffer. Must be positive.

CRTC\_X:

X coordinate offset for the destination rectangle. Can be negative.

CRTC\_Y:

Y coordinate offset for the destination rectangle. Can be negative.

CRTC\_W:

Width for the destination rectangle. CRTC\_X plus CRTC\_W can extend past the currently visible horizontal area of the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc").

CRTC\_H:

Height for the destination rectangle. CRTC\_Y plus CRTC\_H can extend past the currently visible vertical area of the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc").

FB\_ID:

Mode object ID of the [drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer") this plane should scan out.

CRTC\_ID:

Mode object ID of the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") this plane should be connected to.

Note that the source rectangle must fully lie within the bounds of the[drm\_framebuffer](#c.drm%5Fframebuffer "drm_framebuffer"). The destination rectangle can lie outside of the visible area of the current mode of the CRTC. It must be apprpriately clipped by the driver, which can be done by calling [drm\_plane\_helper\_check\_update()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fplane%5Fhelper%5Fcheck%5Fupdate "drm_plane_helper_check_update"). Drivers are also allowed to round the subpixel sampling positions appropriately, but only to the next full pixel. No pixel outside of the source rectangle may ever be sampled, which is important when applying more sophisticated filtering than just a bilinear one when scaling. The filtering mode when scaling is unspecified.

On top of this basic transformation additional properties can be exposed by the driver:

* Rotation is set up with [drm\_plane\_create\_rotation\_property()](#c.drm%5Fplane%5Fcreate%5Frotation%5Fproperty "drm_plane_create_rotation_property"). It adds a rotation and reflection step between the source and destination rectangles. Without this property the rectangle is only scaled, but not rotated or reflected.
* Z position is set up with [drm\_plane\_create\_zpos\_immutable\_property()](#c.drm%5Fplane%5Fcreate%5Fzpos%5Fimmutable%5Fproperty "drm_plane_create_zpos_immutable_property") and[drm\_plane\_create\_zpos\_property()](#c.drm%5Fplane%5Fcreate%5Fzpos%5Fproperty "drm_plane_create_zpos_property"). It controls the visibility of overlapping planes. Without this property the primary plane is always below the cursor plane, and ordering between all other planes is undefined.

Note that all the property extensions described here apply either to the plane or the CRTC (e.g. for the background color, which currently is not exposed and assumed to be black).

int `drm_plane_create_rotation_property`(struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_, unsigned int _rotation_, unsigned int _supported\_rotations_)[¶](#c.drm%5Fplane%5Fcreate%5Frotation%5Fproperty "Permalink to this definition")

create a new rotation property

**Parameters**

`struct drm_plane * plane`

drm plane

`unsigned int rotation`

initial value of the rotation property

`unsigned int supported_rotations`

bitmask of supported rotations and reflections

**Description**

This creates a new property with the selected support for transformations.

Since a rotation by 180° degress is the same as reflecting both along the x and the y axis the rotation property is somewhat redundant. Drivers can use[drm\_rotation\_simplify()](#c.drm%5Frotation%5Fsimplify "drm_rotation_simplify") to normalize values of this property.

The property exposed to userspace is a bitmask property (see[drm\_property\_create\_bitmask()](#c.drm%5Fproperty%5Fcreate%5Fbitmask "drm_property_create_bitmask")) called “rotation” and has the following bitmask enumaration values:

DRM\_MODE\_ROTATE\_0:

“rotate-0”

DRM\_MODE\_ROTATE\_90:

“rotate-90”

DRM\_MODE\_ROTATE\_180:

“rotate-180”

DRM\_MODE\_ROTATE\_270:

“rotate-270”

DRM\_MODE\_REFLECT\_X:

“reflect-x”

DRM\_MODE\_REFLECT\_Y:

“reflect-y”

Rotation is the specified amount in degrees in counter clockwise direction, the X and Y axis are within the source rectangle, i.e. the X/Y axis before rotation. After reflection, the rotation is applied to the image sampled from the source rectangle, before scaling it to fit the destination rectangle.

unsigned int `drm_rotation_simplify`(unsigned int _rotation_, unsigned int _supported\_rotations_)[¶](#c.drm%5Frotation%5Fsimplify "Permalink to this definition")

Try to simplify the rotation

**Parameters**

`unsigned int rotation`

Rotation to be simplified

`unsigned int supported_rotations`

Supported rotations

**Description**

Attempt to simplify the rotation to a form that is supported. Eg. if the hardware supports everything except DRM\_MODE\_REFLECT\_X one could call this function like this:

drm\_rotation\_simplify(rotation, DRM\_MODE\_ROTATE\_0 |

DRM\_MODE\_ROTATE\_90 | DRM\_MODE\_ROTATE\_180 | DRM\_MODE\_ROTATE\_270 | DRM\_MODE\_REFLECT\_Y);

to eliminate the DRM\_MODE\_ROTATE\_X flag. Depending on what kind of transforms the hardware supports, this function may not be able to produce a supported transform, so the caller should check the result afterwards.

int `drm_plane_create_zpos_property`(struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_, unsigned int _zpos_, unsigned int _min_, unsigned int _max_)[¶](#c.drm%5Fplane%5Fcreate%5Fzpos%5Fproperty "Permalink to this definition")

create mutable zpos property

**Parameters**

`struct drm_plane * plane`

drm plane

`unsigned int zpos`

initial value of zpos property

`unsigned int min`

minimal possible value of zpos property

`unsigned int max`

maximal possible value of zpos property

**Description**

This function initializes generic mutable zpos property and enables support for it in drm core. Drivers can then attach this property to planes to enable support for configurable planes arrangement during blending operation. Once mutable zpos property has been enabled, the DRM core will automatically calculate [drm\_plane\_state.normalized\_zpos](#c.drm%5Fplane%5Fstate "drm_plane_state") values. Usually min should be set to 0 and max to maximal number of planes for given crtc - 1.

If zpos of some planes cannot be changed (like fixed background or cursor/topmost planes), driver should adjust min/max values and assign those planes immutable zpos property with lower or higher values (for more information, see [drm\_plane\_create\_zpos\_immutable\_property()](#c.drm%5Fplane%5Fcreate%5Fzpos%5Fimmutable%5Fproperty "drm_plane_create_zpos_immutable_property") function). In such case driver should also assign proper initial zpos values for all planes in its `plane_reset()` callback, so the planes will be always sorted properly.

See also [drm\_atomic\_normalize\_zpos()](#c.drm%5Fatomic%5Fnormalize%5Fzpos "drm_atomic_normalize_zpos").

The property exposed to userspace is called “zpos”.

**Return**

Zero on success, negative errno on failure.

int `drm_plane_create_zpos_immutable_property`(struct [drm\_plane](#c.drm%5Fplane "drm_plane") \* _plane_, unsigned int _zpos_)[¶](#c.drm%5Fplane%5Fcreate%5Fzpos%5Fimmutable%5Fproperty "Permalink to this definition")

create immuttable zpos property

**Parameters**

`struct drm_plane * plane`

drm plane

`unsigned int zpos`

value of zpos property

**Description**

This function initializes generic immutable zpos property and enables support for it in drm core. Using this property driver lets userspace to get the arrangement of the planes for blending operation and notifies it that the hardware (or driver) doesn’t support changing of the planes’ order. For mutable zpos see [drm\_plane\_create\_zpos\_property()](#c.drm%5Fplane%5Fcreate%5Fzpos%5Fproperty "drm_plane_create_zpos_property").

The property exposed to userspace is called “zpos”.

**Return**

Zero on success, negative errno on failure.

int `drm_atomic_normalize_zpos`(struct drm\_device \* _dev_, struct [drm\_atomic\_state](#c.drm%5Fatomic%5Fstate "drm_atomic_state") \* _state_)[¶](#c.drm%5Fatomic%5Fnormalize%5Fzpos "Permalink to this definition")

calculate normalized zpos values for all crtcs

**Parameters**

`struct drm_device * dev`

DRM device

`struct drm_atomic_state * state`

atomic state of DRM device

**Description**

This function calculates normalized zpos value for all modified planes in the provided atomic state of DRM device.

For every CRTC this function checks new states of all planes assigned to it and calculates normalized zpos value for these planes. Planes are compared first by their zpos values, then by plane id (if zpos is equal). The plane with lowest zpos value is at the bottom. The [drm\_plane\_state.normalized\_zpos](#c.drm%5Fplane%5Fstate "drm_plane_state")is then filled with unique values from 0 to number of active planes in crtc minus one.

RETURNS Zero for success or -errno

### Color Management Properties[¶](#color-management-properties "Permalink to this headline")

Color management or color space adjustments is supported through a set of 5 properties on the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") object. They are set up by calling[drm\_crtc\_enable\_color\_mgmt()](#c.drm%5Fcrtc%5Fenable%5Fcolor%5Fmgmt "drm_crtc_enable_color_mgmt").

“DEGAMMA\_LUT”:

Blob property to set the degamma lookup table (LUT) mapping pixel data from the framebuffer before it is given to the transformation matrix. The data is interpreted as an array of `struct drm_color_lut` elements. Hardware might choose not to use the full precision of the LUT elements nor use all the elements of the LUT (for example the hardware might choose to interpolate between LUT\[0\] and LUT\[4\]).

Setting this to NULL (blob property value set to 0) means a linear/pass-thru gamma table should be used. This is generally the driver boot-up state too. Drivers can access this blob through[drm\_crtc\_state.degamma\_lut](#c.drm%5Fcrtc%5Fstate "drm_crtc_state").

“DEGAMMA\_LUT\_SIZE”:

Unsinged range property to give the size of the lookup table to be set on the DEGAMMA\_LUT property (the size depends on the underlying hardware). If drivers support multiple LUT sizes then they should publish the largest size, and sub-sample smaller sized LUTs (e.g. for split-gamma modes) appropriately.

“CTM”:

Blob property to set the current transformation matrix (CTM) apply to pixel data after the lookup through the degamma LUT and before the lookup through the gamma LUT. The data is interpreted as a struct`drm_color_ctm`.

Setting this to NULL (blob property value set to 0) means a unit/pass-thru matrix should be used. This is generally the driver boot-up state too. Drivers can access the blob for the color conversion matrix through [drm\_crtc\_state.ctm](#c.drm%5Fcrtc%5Fstate "drm_crtc_state").

“GAMMA\_LUT”:

Blob property to set the gamma lookup table (LUT) mapping pixel data after the transformation matrix to data sent to the connector. The data is interpreted as an array of `struct drm_color_lut` elements. Hardware might choose not to use the full precision of the LUT elements nor use all the elements of the LUT (for example the hardware might choose to interpolate between LUT\[0\] and LUT\[4\]).

Setting this to NULL (blob property value set to 0) means a linear/pass-thru gamma table should be used. This is generally the driver boot-up state too. Drivers can access this blob through[drm\_crtc\_state.gamma\_lut](#c.drm%5Fcrtc%5Fstate "drm_crtc_state").

“GAMMA\_LUT\_SIZE”:

Unsigned range property to give the size of the lookup table to be set on the GAMMA\_LUT property (the size depends on the underlying hardware). If drivers support multiple LUT sizes then they should publish the largest size, and sub-sample smaller sized LUTs (e.g. for split-gamma modes) appropriately.

There is also support for a legacy gamma table, which is set up by calling[drm\_mode\_crtc\_set\_gamma\_size()](#c.drm%5Fmode%5Fcrtc%5Fset%5Fgamma%5Fsize "drm_mode_crtc_set_gamma_size"). Drivers which support both should use[drm\_atomic\_helper\_legacy\_gamma\_set()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Flegacy%5Fgamma%5Fset "drm_atomic_helper_legacy_gamma_set") to alias the legacy gamma ramp with the “GAMMA\_LUT” property above.

clamp and round LUT entries

**Parameters**

`uint32_t user_input`

input value

`uint32_t bit_precision`

number of bits the hw LUT supports

**Description**

Extract a degamma/gamma LUT value provided by user (in the form of`drm_color_lut` entries) and round it to the precision supported by the hardware.

void `drm_crtc_enable_color_mgmt`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, uint _degamma\_lut\_size_, bool _has\_ctm_, uint _gamma\_lut\_size_)[¶](#c.drm%5Fcrtc%5Fenable%5Fcolor%5Fmgmt "Permalink to this definition")

enable color management properties

**Parameters**

`struct drm_crtc * crtc`

DRM CRTC

`uint degamma_lut_size`

the size of the degamma lut (before CSC)

`bool has_ctm`

whether to attach ctm\_property for CSC matrix

`uint gamma_lut_size`

the size of the gamma lut (after CSC)

**Description**

This function lets the driver enable the color correction properties on a CRTC. This includes 3 degamma, csc and gamma properties that userspace can set and 2 size properties to inform the userspace of the lut sizes. Each of the properties are optional. The gamma and degamma properties are only attached if their size is not 0 and ctm\_property is only attached if has\_ctm is true.

Drivers should use [drm\_atomic\_helper\_legacy\_gamma\_set()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Flegacy%5Fgamma%5Fset "drm_atomic_helper_legacy_gamma_set") to implement the legacy [drm\_crtc\_funcs.gamma\_set](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs") callback.

int `drm_mode_crtc_set_gamma_size`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, int _gamma\_size_)[¶](#c.drm%5Fmode%5Fcrtc%5Fset%5Fgamma%5Fsize "Permalink to this definition")

set the gamma table size

**Parameters**

`struct drm_crtc * crtc`

CRTC to set the gamma table size for

`int gamma_size`

size of the gamma table

**Description**

Drivers which support gamma tables should set this to the supported gamma table size when initializing the CRTC. Currently the drm core only supports a fixed gamma table size.

**Return**

Zero on success, negative errno on failure.

### Tile Group Property[¶](#tile-group-property "Permalink to this headline")

Tile groups are used to represent tiled monitors with a unique integer identifier. Tiled monitors using DisplayID v1.3 have a unique 8-byte handle, we store this in a tile group, so we have a common identifier for all tiles in a monitor group. The property is called “TILE”. Drivers can manage tile groups using [drm\_mode\_create\_tile\_group()](#c.drm%5Fmode%5Fcreate%5Ftile%5Fgroup "drm_mode_create_tile_group"), [drm\_mode\_put\_tile\_group()](#c.drm%5Fmode%5Fput%5Ftile%5Fgroup "drm_mode_put_tile_group") and[drm\_mode\_get\_tile\_group()](#c.drm%5Fmode%5Fget%5Ftile%5Fgroup "drm_mode_get_tile_group"). But this is only needed for internal panels where the tile group information is exposed through a non-standard way.

### Explicit Fencing Properties[¶](#explicit-fencing-properties "Permalink to this headline")

Explicit fencing allows userspace to control the buffer synchronization between devices. A Fence or a group of fences are transfered to/from userspace using Sync File fds and there are two DRM properties for that. IN\_FENCE\_FD on each DRM Plane to send fences to the kernel and OUT\_FENCE\_PTR on each DRM CRTC to receive fences from the kernel.

As a contrast, with implicit fencing the kernel keeps track of any ongoing rendering, and automatically ensures that the atomic update waits for any pending rendering to complete. For shared buffers represented with a [struct dma\_buf](https://www.kernel.org/doc/html/v4.15/driver-api/dma-buf.html#c.dma%5Fbuf "dma_buf") this is tracked in [struct reservation\_object](https://www.kernel.org/doc/html/v4.15/driver-api/dma-buf.html#c.reservation%5Fobject "reservation_object"). Implicit syncing is how Linux traditionally worked (e.g. DRI2/3 on X.org), whereas explicit fencing is what Android wants.

“IN\_FENCE\_FD”:

Use this property to pass a fence that DRM should wait on before proceeding with the Atomic Commit request and show the framebuffer for the plane on the screen. The fence can be either a normal fence or a merged one, the sync\_file framework will handle both cases and use a fence\_array if a merged fence is received. Passing -1 here means no fences to wait on.

If the Atomic Commit request has the DRM\_MODE\_ATOMIC\_TEST\_ONLY flag it will only check if the Sync File is a valid one.

On the driver side the fence is stored on the **fence** parameter of[struct drm\_plane\_state](#c.drm%5Fplane%5Fstate "drm_plane_state"). Drivers which also support implicit fencing should set the implicit fence using [drm\_atomic\_set\_fence\_for\_plane()](#c.drm%5Fatomic%5Fset%5Ffence%5Ffor%5Fplane "drm_atomic_set_fence_for_plane"), to make sure there’s consistent behaviour between drivers in precedence of implicit vs. explicit fencing.

“OUT\_FENCE\_PTR”:

Use this property to pass a file descriptor pointer to DRM. Once the Atomic Commit request call returns OUT\_FENCE\_PTR will be filled with the file descriptor number of a Sync File. This Sync File contains the CRTC fence that will be signaled when all framebuffers present on the Atomic Commit \* request for that given CRTC are scanned out on the screen.

The Atomic Commit request fails if a invalid pointer is passed. If the Atomic Commit request fails for any other reason the out fence fd returned will be -1\. On a Atomic Commit with the DRM\_MODE\_ATOMIC\_TEST\_ONLY flag the out fence will also be set to -1.

Note that out-fences don’t have a special interface to drivers and are internally represented by a [struct drm\_pending\_vblank\_event](#c.drm%5Fpending%5Fvblank%5Fevent "drm_pending_vblank_event") in struct[drm\_crtc\_state](#c.drm%5Fcrtc%5Fstate "drm_crtc_state"), which is also used by the nonblocking atomic commit helpers and for the DRM event handling for existing userspace.

### Existing KMS Properties[¶](#existing-kms-properties "Permalink to this headline")

The following table gives description of drm properties exposed by various modules/drivers.

| Owner Module/Drivers      | Group                       | Property Name           | Type                                                                                                             | Property Values                           | Object attached                                         | Description/Restrictions                                                                                                                                                                                                                                         |
| ------------------------- | --------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| |                         | “scaling mode”              | ENUM                    | { “None”, “Full”, “Center”, “Full aspect” }                                                                      | Connector                                 | Supported by: amdgpu, gma500, i915, nouveau and radeon. |                                                                                                                                                                                                                                                                  |
| |  DVI-I                  | “subconnector”              | ENUM                    | { “Unknown”, “DVI-D”, “DVI-A” }                                                                                  | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “select subconnector”       | ENUM                    | { “Automatic”, “DVI-D”, “DVI-A” }                                                                                | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  TV                     | “subconnector”              | ENUM                    | { “Unknown”, “Composite”, “SVIDEO”, “Component”, “SCART” }                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “select subconnector”       | ENUM                    | { “Automatic”, “Composite”, “SVIDEO”, “Component”, “SCART” }                                                     | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “mode”                      | ENUM                    | { “NTSC\_M”, “NTSC\_J”, “NTSC\_443”, “PAL\_B” } etc.                                                             | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “left margin”               | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “right margin”              | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “top margin”                | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “bottom margin”             | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “brightness”                | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “contrast”                  | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “flicker reduction”         | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “overscan”                  | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “saturation”                | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “hue”                       | RANGE                   | Min=0, Max=100                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  Virtual GPU            | “suggested X”               | RANGE                   | Min=0, Max=0xffffffff                                                                                            | Connector                                 | property to suggest an X offset for a connector         |                                                                                                                                                                                                                                                                  |
| |                         | “suggested Y”               | RANGE                   | Min=0, Max=0xffffffff                                                                                            | Connector                                 | property to suggest an Y offset for a connector         |                                                                                                                                                                                                                                                                  |
| |  Optional               | “aspect ratio”              | ENUM                    | { “None”, “4:3”, “16:9” }                                                                                        | Connector                                 | TDB                                                     |                                                                                                                                                                                                                                                                  |
| i915                      | Generic                     | “Broadcast RGB”         | ENUM                                                                                                             | { “Automatic”, “Full”, “Limited 16:235” } | Connector                                               | When this property is set to Limited 16:235 and CTM is set, the hardware will be programmed with the result of the multiplication of CTM by the limited range matrix to ensure the pixels normaly in the range 0..1.0 are remapped to the range 16/255..235/255. |
| |                         | “audio”                     | ENUM                    | { “force-dvi”, “off”, “auto”, “on” }                                                                             | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  SDVO-TV                | “mode”                      | ENUM                    | { “NTSC\_M”, “NTSC\_J”, “NTSC\_443”, “PAL\_B” } etc.                                                             | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “left\_margin”              | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “right\_margin”             | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “top\_margin”               | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “bottom\_margin”            | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “hpos”                      | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “vpos”                      | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “contrast”                  | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “saturation”                | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “hue”                       | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “sharpness”                 | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “flicker\_filter”           | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “flicker\_filter\_adaptive” | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “flicker\_filter\_2d”       | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “tv\_chroma\_filter”        | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “tv\_luma\_filter”          | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “dot\_crawl”                | RANGE                   | Min=0, Max=1                                                                                                     | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  SDVO-TV/LVDS           | “brightness”                | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| CDV gma-500               | Generic                     | “Broadcast RGB”         | ENUM                                                                                                             | { “Full”, “Limited 16:235” }              | Connector                                               | TBD                                                                                                                                                                                                                                                              |
| |                         | “Broadcast RGB”             | ENUM                    | { “off”, “auto”, “on” }                                                                                          | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| Poulsbo                   | Generic                     | “backlight”             | RANGE                                                                                                            | Min=0, Max=100                            | Connector                                               | TBD                                                                                                                                                                                                                                                              |
| |  SDVO-TV                | “mode”                      | ENUM                    | { “NTSC\_M”, “NTSC\_J”, “NTSC\_443”, “PAL\_B” } etc.                                                             | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “left\_margin”              | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “right\_margin”             | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “top\_margin”               | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “bottom\_margin”            | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “hpos”                      | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “vpos”                      | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “contrast”                  | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “saturation”                | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “hue”                       | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “sharpness”                 | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “flicker\_filter”           | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “flicker\_filter\_adaptive” | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “flicker\_filter\_2d”       | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “tv\_chroma\_filter”        | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “tv\_luma\_filter”          | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “dot\_crawl”                | RANGE                   | Min=0, Max=1                                                                                                     | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  SDVO-TV/LVDS           | “brightness”                | RANGE                   | Min=0, Max= SDVO dependent                                                                                       | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| armada                    | CRTC                        | “CSC\_YUV”              | ENUM                                                                                                             | { “Auto” , “CCIR601”, “CCIR709” }         | CRTC                                                    | TBD                                                                                                                                                                                                                                                              |
| |                         | “CSC\_RGB”                  | ENUM                    | { “Auto”, “Computer system”, “Studio” }                                                                          | CRTC                                      | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  Overlay                | “colorkey”                  | RANGE                   | Min=0, Max=0xffffff                                                                                              | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “colorkey\_min”             | RANGE                   | Min=0, Max=0xffffff                                                                                              | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “colorkey\_max”             | RANGE                   | Min=0, Max=0xffffff                                                                                              | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “colorkey\_val”             | RANGE                   | Min=0, Max=0xffffff                                                                                              | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “colorkey\_alpha”           | RANGE                   | Min=0, Max=0xffffff                                                                                              | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “colorkey\_mode”            | ENUM                    | { “disabled”, “Y component”, “U component” , “V component”, “RGB”, “R component”, “G component”, “B component” } | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “brightness”                | RANGE                   | Min=0, Max=256 + 255                                                                                             | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “contrast”                  | RANGE                   | Min=0, Max=0x7fff                                                                                                | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “saturation”                | RANGE                   | Min=0, Max=0x7fff                                                                                                | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| exynos                    | CRTC                        | “mode”                  | ENUM                                                                                                             | { “normal”, “blank” }                     | CRTC                                                    | TBD                                                                                                                                                                                                                                                              |
| i2c/ch7006\_drv           | Generic                     | “scale”                 | RANGE                                                                                                            | Min=0, Max=2                              | Connector                                               | TBD                                                                                                                                                                                                                                                              |
| |  TV                     | “mode”                      | ENUM                    | { “PAL”, “PAL-M”,”PAL-N”}, ”PAL-Nc” , “PAL-60”, “NTSC-M”, “NTSC-J” }                                             | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| nouveau                   | NV10 Overlay                | “colorkey”              | RANGE                                                                                                            | Min=0, Max=0x01ffffff                     | Plane                                                   | TBD                                                                                                                                                                                                                                                              |
| |                         | “contrast”                  | RANGE                   | Min=0, Max=8192-1                                                                                                | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “brightness”                | RANGE                   | Min=0, Max=1024                                                                                                  | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “hue”                       | RANGE                   | Min=0, Max=359                                                                                                   | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “saturation”                | RANGE                   | Min=0, Max=8192-1                                                                                                | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “iturbt\_709”               | RANGE                   | Min=0, Max=1                                                                                                     | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  Nv04 Overlay           | “colorkey”                  | RANGE                   | Min=0, Max=0x01ffffff                                                                                            | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “brightness”                | RANGE                   | Min=0, Max=1024                                                                                                  | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  Display                | “dithering mode”            | ENUM                    | { “auto”, “off”, “on” }                                                                                          | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “dithering depth”           | ENUM                    | { “auto”, “off”, “on”, “static 2x2”, “dynamic 2x2”, “temporal” }                                                 | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “underscan”                 | ENUM                    | { “auto”, “6 bpc”, “8 bpc” }                                                                                     | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “underscan hborder”         | RANGE                   | Min=0, Max=128                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “underscan vborder”         | RANGE                   | Min=0, Max=128                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “vibrant hue”               | RANGE                   | Min=0, Max=180                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “color vibrance”            | RANGE                   | Min=0, Max=200                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| omap                      | Generic                     | “zorder”                | RANGE                                                                                                            | Min=0, Max=3                              | CRTC, Plane                                             | TBD                                                                                                                                                                                                                                                              |
| qxl                       | Generic                     | “hotplug\_mode\_update” | RANGE                                                                                                            | Min=0, Max=1                              | Connector                                               | TBD                                                                                                                                                                                                                                                              |
| radeon                    | DVI-I                       | “coherent”              | RANGE                                                                                                            | Min=0, Max=1                              | Connector                                               | TBD                                                                                                                                                                                                                                                              |
| |  DAC enable load detect | “load detection”            | RANGE                   | Min=0, Max=1                                                                                                     | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  TV Standard            | “tv standard”               | ENUM                    | { “ntsc”, “pal”, “pal-m”, “pal-60”, “ntsc-j” , “scart-pal”, “pal-cn”, “secam” }                                  | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  legacy TMDS PLL detect | “tmds\_pll”                 | ENUM                    | { “driver”, “bios” }                                                                                             |                                           | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  Underscan              | “underscan”                 | ENUM                    | { “off”, “on”, “auto” }                                                                                          | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “underscan hborder”         | RANGE                   | Min=0, Max=128                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |                         | “underscan vborder”         | RANGE                   | Min=0, Max=128                                                                                                   | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  Audio                  | “audio”                     | ENUM                    | { “off”, “on”, “auto” }                                                                                          | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| |  FMT Dithering          | “dither”                    | ENUM                    | { “off”, “on” }                                                                                                  | Connector                                 | TBD                                                     |                                                                                                                                                                                                                                                                  |
| rcar-du                   | Generic                     | “alpha”                 | RANGE                                                                                                            | Min=0, Max=255                            | Plane                                                   | TBD                                                                                                                                                                                                                                                              |
| |                         | “colorkey”                  | RANGE                   | Min=0, Max=0x01ffffff                                                                                            | Plane                                     | TBD                                                     |                                                                                                                                                                                                                                                                  |

## Vertical Blanking[¶](#vertical-blanking "Permalink to this headline")

Vertical blanking plays a major role in graphics rendering. To achieve tear-free display, users must synchronize page flips and/or rendering to vertical blanking. The DRM API offers ioctls to perform page flips synchronized to vertical blanking and wait for vertical blanking.

The DRM core handles most of the vertical blanking management logic, which involves filtering out spurious interrupts, keeping race-free blanking counters, coping with counter wrap-around and resets and keeping use counts. It relies on the driver to generate vertical blanking interrupts and optionally provide a hardware vertical blanking counter.

Drivers must initialize the vertical blanking handling core with a call to[drm\_vblank\_init()](#c.drm%5Fvblank%5Finit "drm_vblank_init"). Minimally, a driver needs to implement[drm\_crtc\_funcs.enable\_vblank](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs") and [drm\_crtc\_funcs.disable\_vblank](#c.drm%5Fcrtc%5Ffuncs "drm_crtc_funcs") plus call[drm\_crtc\_handle\_vblank()](#c.drm%5Fcrtc%5Fhandle%5Fvblank "drm_crtc_handle_vblank") in it’s vblank interrupt handler for working vblank support.

Vertical blanking interrupts can be enabled by the DRM core or by drivers themselves (for instance to handle page flipping operations). The DRM core maintains a vertical blanking use count to ensure that the interrupts are not disabled while a user still needs them. To increment the use count, drivers call [drm\_crtc\_vblank\_get()](#c.drm%5Fcrtc%5Fvblank%5Fget "drm_crtc_vblank_get") and release the vblank reference again with[drm\_crtc\_vblank\_put()](#c.drm%5Fcrtc%5Fvblank%5Fput "drm_crtc_vblank_put"). In between these two calls vblank interrupts are guaranteed to be enabled.

On many hardware disabling the vblank interrupt cannot be done in a race-free manner, see [drm\_driver.vblank\_disable\_immediate](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") and[drm\_driver.max\_vblank\_count](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver"). In that case the vblank core only disables the vblanks after a timer has expired, which can be configured through the`vblankoffdelay` module parameter.

### Vertical Blanking and Interrupt Handling Functions Reference[¶](#vertical-blanking-and-interrupt-handling-functions-reference "Permalink to this headline")

struct `drm_pending_vblank_event`[¶](#c.drm%5Fpending%5Fvblank%5Fevent "Permalink to this definition")

pending vblank event tracking

**Definition**

struct drm_pending_vblank_event {
  struct drm_pending_event base;
  unsigned int pipe;
  u64 sequence;
  union event;
};

**Members**

`base`

Base structure for tracking pending DRM events.

`pipe`

[drm\_crtc\_index()](#c.drm%5Fcrtc%5Findex "drm_crtc_index") of the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") this event is for.

`sequence`

frame event should be triggered at

`event`

Actual event which will be sent to userspace.

struct `drm_vblank_crtc`[¶](#c.drm%5Fvblank%5Fcrtc "Permalink to this definition")

vblank tracking for a CRTC

**Definition**

struct drm_vblank_crtc {
  struct drm_device * dev;
  wait_queue_head_t queue;
  struct timer_list disable_timer;
  seqlock_t seqlock;
  u64 count;
  ktime_t time;
  atomic_t refcount;
  u32 last;
  unsigned int inmodeset;
  unsigned int pipe;
  int framedur_ns;
  int linedur_ns;
  struct drm_display_mode hwmode;
  bool enabled;
};

**Members**

`dev`

Pointer to the `drm_device`.

`queue`

Wait queue for vblank waiters.

`disable_timer`

Disable timer for the delayed vblank disabling hysteresis logic. Vblank disabling is controlled through the drm\_vblank\_offdelay module option and the setting of the`drm_device.max_vblank_count` value.

`seqlock`

Protect vblank count and time.

`count`

Current software vblank counter.

`time`

Vblank timestamp corresponding to **count**.

`refcount`

Number of users/waiters of the vblank interrupt. Only when this refcount reaches 0 can the hardware interrupt be disabled using**disable\_timer**.

`last`

Protected by `drm_device.vbl_lock`, used for wraparound handling.

`inmodeset`

Tracks whether the vblank is disabled due to a modeset. For legacy driver bit 2 additionally tracks whether an additional temporary vblank reference has been acquired to paper over the hardware counter resetting/jumping. KMS drivers should instead just call [drm\_crtc\_vblank\_off()](#c.drm%5Fcrtc%5Fvblank%5Foff "drm_crtc_vblank_off") and [drm\_crtc\_vblank\_on()](#c.drm%5Fcrtc%5Fvblank%5Fon "drm_crtc_vblank_on"), which explicitly save and restore the vblank count.

`pipe`

[drm\_crtc\_index()](#c.drm%5Fcrtc%5Findex "drm_crtc_index") of the [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") corresponding to this structure.

`framedur_ns`

Frame/Field duration in ns, used by[drm\_calc\_vbltimestamp\_from\_scanoutpos()](#c.drm%5Fcalc%5Fvbltimestamp%5Ffrom%5Fscanoutpos "drm_calc_vbltimestamp_from_scanoutpos") and computed by[drm\_calc\_timestamping\_constants()](#c.drm%5Fcalc%5Ftimestamping%5Fconstants "drm_calc_timestamping_constants").

`linedur_ns`

Line duration in ns, used by[drm\_calc\_vbltimestamp\_from\_scanoutpos()](#c.drm%5Fcalc%5Fvbltimestamp%5Ffrom%5Fscanoutpos "drm_calc_vbltimestamp_from_scanoutpos") and computed by[drm\_calc\_timestamping\_constants()](#c.drm%5Fcalc%5Ftimestamping%5Fconstants "drm_calc_timestamping_constants").

`hwmode`

Cache of the current hardware display mode. Only valid when **enabled**is set. This is used by helpers like[drm\_calc\_vbltimestamp\_from\_scanoutpos()](#c.drm%5Fcalc%5Fvbltimestamp%5Ffrom%5Fscanoutpos "drm_calc_vbltimestamp_from_scanoutpos"). We can’t just access the hardware mode by e.g. looking at [drm\_crtc\_state.adjusted\_mode](#c.drm%5Fcrtc%5Fstate "drm_crtc_state"), because that one is really hard to get from interrupt context.

`enabled`

Tracks the enabling state of the corresponding [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") to avoid double-disabling and hence corrupting saved state. Needed by drivers not using atomic KMS, since those might go through their CRTC disabling functions multiple times.

**Description**

This structure tracks the vblank state for one CRTC.

Note that for historical reasons - the vblank handling code is still shared with legacy/non-kms drivers - this is a free-standing structure not directly connected to [struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc"). But all public interface functions are taking a [struct drm\_crtc](#c.drm%5Fcrtc "drm_crtc") to hide this implementation detail.

u32 `drm_crtc_accurate_vblank_count`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Faccurate%5Fvblank%5Fcount "Permalink to this definition")

retrieve the master vblank counter

**Parameters**

`struct drm_crtc * crtc`

which counter to retrieve

**Description**

This function is similar to [drm\_crtc\_vblank\_count()](#c.drm%5Fcrtc%5Fvblank%5Fcount "drm_crtc_vblank_count") but this function interpolates to handle a race with vblank interrupts using the high precision timestamping support.

This is mostly useful for hardware that can obtain the scanout position, but doesn’t have a hardware frame counter.

int `drm_vblank_init`(struct drm\_device \* _dev_, unsigned int _num\_crtcs_)[¶](#c.drm%5Fvblank%5Finit "Permalink to this definition")

initialize vblank support

**Parameters**

`struct drm_device * dev`

DRM device

`unsigned int num_crtcs`

number of CRTCs supported by **dev**

**Description**

This function initializes vblank support for **num\_crtcs** display pipelines. Cleanup is handled by the DRM core, or through calling [drm\_dev\_fini()](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdev%5Ffini "drm_dev_fini") for drivers with a [drm\_driver.release](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") callback.

**Return**

Zero on success or a negative error code on failure.

wait\_queue\_head\_t \* `drm_crtc_vblank_waitqueue`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fvblank%5Fwaitqueue "Permalink to this definition")

get vblank waitqueue for the CRTC

**Parameters**

`struct drm_crtc * crtc`

which CRTC’s vblank waitqueue to retrieve

**Description**

This function returns a pointer to the vblank waitqueue for the CRTC. Drivers can use this to implement vblank waits using [wait\_event()](https://www.kernel.org/doc/html/v4.15/driver-api/basics.html#c.wait%5Fevent "wait_event") and related functions.

void `drm_calc_timestamping_constants`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, const struct [drm\_display\_mode](#c.drm%5Fdisplay%5Fmode "drm_display_mode") \* _mode_)[¶](#c.drm%5Fcalc%5Ftimestamping%5Fconstants "Permalink to this definition")

calculate vblank timestamp constants

**Parameters**

`struct drm_crtc * crtc`

drm\_crtc whose timestamp constants should be updated.

`const struct drm_display_mode * mode`

display mode containing the scanout timings

**Description**

Calculate and store various constants which are later needed by vblank and swap-completion timestamping, e.g, by[drm\_calc\_vbltimestamp\_from\_scanoutpos()](#c.drm%5Fcalc%5Fvbltimestamp%5Ffrom%5Fscanoutpos "drm_calc_vbltimestamp_from_scanoutpos"). They are derived from CRTC’s true scanout timing, so they take things like panel scaling or other adjustments into account.

bool `drm_calc_vbltimestamp_from_scanoutpos`(struct drm\_device \* _dev_, unsigned int _pipe_, int \* _max\_error_, ktime\_t \* _vblank\_time_, bool _in\_vblank\_irq_)[¶](#c.drm%5Fcalc%5Fvbltimestamp%5Ffrom%5Fscanoutpos "Permalink to this definition")

precise vblank timestamp helper

**Parameters**

`struct drm_device * dev`

DRM device

`unsigned int pipe`

index of CRTC whose vblank timestamp to retrieve

`int * max_error`

Desired maximum allowable error in timestamps (nanosecs) On return contains true maximum error of timestamp

`ktime_t * vblank_time`

Pointer to time which should receive the timestamp

`bool in_vblank_irq`

True when called from [drm\_crtc\_handle\_vblank()](#c.drm%5Fcrtc%5Fhandle%5Fvblank "drm_crtc_handle_vblank"). Some drivers need to apply some workarounds for gpu-specific vblank irq quirks if flag is set.

**Description**

Implements calculation of exact vblank timestamps from given drm\_display\_mode timings and current video scanout position of a CRTC. This can be directly used as the [drm\_driver.get\_vblank\_timestamp](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") implementation of a kms driver if [drm\_driver.get\_scanout\_position](https://www.kernel.org/doc/html/v4.15/gpu/drm-internals.html#c.drm%5Fdriver "drm_driver") is implemented.

The current implementation only handles standard video modes. For double scan and interlaced modes the driver is supposed to adjust the hardware mode (taken from [drm\_crtc\_state.adjusted](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") mode for atomic modeset drivers) to match the scanout position reported.

Note that atomic drivers must call [drm\_calc\_timestamping\_constants()](#c.drm%5Fcalc%5Ftimestamping%5Fconstants "drm_calc_timestamping_constants") before enabling a CRTC. The atomic helpers already take care of that in[drm\_atomic\_helper\_update\_legacy\_modeset\_state()](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms-helpers.html#c.drm%5Fatomic%5Fhelper%5Fupdate%5Flegacy%5Fmodeset%5Fstate "drm_atomic_helper_update_legacy_modeset_state").

**Return**

Returns true on success, and false on failure, i.e. when no accurate timestamp could be acquired.

u64 `drm_crtc_vblank_count`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fvblank%5Fcount "Permalink to this definition")

retrieve “cooked” vblank counter value

**Parameters**

`struct drm_crtc * crtc`

which counter to retrieve

**Description**

Fetches the “cooked” vblank count value that represents the number of vblank events since the system was booted, including lost events due to modesetting activity. Note that this timer isn’t correct against a racing vblank interrupt (since it only reports the software vblank counter), see[drm\_crtc\_accurate\_vblank\_count()](#c.drm%5Fcrtc%5Faccurate%5Fvblank%5Fcount "drm_crtc_accurate_vblank_count") for such use-cases.

**Return**

The software vblank counter.

u64 `drm_crtc_vblank_count_and_time`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, ktime\_t \* _vblanktime_)[¶](#c.drm%5Fcrtc%5Fvblank%5Fcount%5Fand%5Ftime "Permalink to this definition")

retrieve “cooked” vblank counter value and the system timestamp corresponding to that vblank counter value

**Parameters**

`struct drm_crtc * crtc`

which counter to retrieve

`ktime_t * vblanktime`

Pointer to time to receive the vblank timestamp.

**Description**

Fetches the “cooked” vblank count value that represents the number of vblank events since the system was booted, including lost events due to modesetting activity. Returns corresponding system timestamp of the time of the vblank interval that corresponds to the current vblank counter value.

void `drm_crtc_arm_vblank_event`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, struct [drm\_pending\_vblank\_event](#c.drm%5Fpending%5Fvblank%5Fevent "drm_pending_vblank_event") \* _e_)[¶](#c.drm%5Fcrtc%5Farm%5Fvblank%5Fevent "Permalink to this definition")

arm vblank event after pageflip

**Parameters**

`struct drm_crtc * crtc`

the source CRTC of the vblank event

`struct drm_pending_vblank_event * e`

the event to send

**Description**

A lot of drivers need to generate vblank events for the very next vblank interrupt. For example when the page flip interrupt happens when the page flip gets armed, but not when it actually executes within the next vblank period. This helper function implements exactly the required vblank arming behaviour.

**NOTE**

Drivers using this to send out the [drm\_crtc\_state.event](#c.drm%5Fcrtc%5Fstate "drm_crtc_state") as part of an atomic commit must ensure that the next vblank happens at exactly the same time as the atomic commit is committed to the hardware. This function itself does **not** protect against the next vblank interrupt racing with either this function call or the atomic commit operation. A possible sequence could be:

1. Driver commits new hardware state into vblank-synchronized registers.
2. A vblank happens, committing the hardware state. Also the corresponding vblank interrupt is fired off and fully processed by the interrupt handler.
3. The atomic commit operation proceeds to call [drm\_crtc\_arm\_vblank\_event()](#c.drm%5Fcrtc%5Farm%5Fvblank%5Fevent "drm_crtc_arm_vblank_event").
4. The event is only send out for the next vblank, which is wrong.

An equivalent race can happen when the driver calls[drm\_crtc\_arm\_vblank\_event()](#c.drm%5Fcrtc%5Farm%5Fvblank%5Fevent "drm_crtc_arm_vblank_event") before writing out the new hardware state.

The only way to make this work safely is to prevent the vblank from firing (and the hardware from committing anything else) until the entire atomic commit sequence has run to completion. If the hardware does not have such a feature (e.g. using a “go” bit), then it is unsafe to use this functions. Instead drivers need to manually send out the event from their interrupt handler by calling [drm\_crtc\_send\_vblank\_event()](#c.drm%5Fcrtc%5Fsend%5Fvblank%5Fevent "drm_crtc_send_vblank_event") and make sure that there’s no possible race with the hardware committing the atomic update.

Caller must hold a vblank reference for the event **e**, which will be dropped when the next vblank arrives.

void `drm_crtc_send_vblank_event`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_, struct [drm\_pending\_vblank\_event](#c.drm%5Fpending%5Fvblank%5Fevent "drm_pending_vblank_event") \* _e_)[¶](#c.drm%5Fcrtc%5Fsend%5Fvblank%5Fevent "Permalink to this definition")

helper to send vblank event after pageflip

**Parameters**

`struct drm_crtc * crtc`

the source CRTC of the vblank event

`struct drm_pending_vblank_event * e`

the event to send

**Description**

Updates sequence # and timestamp on event for the most recently processed vblank, and sends it to userspace. Caller must hold event lock.

See [drm\_crtc\_arm\_vblank\_event()](#c.drm%5Fcrtc%5Farm%5Fvblank%5Fevent "drm_crtc_arm_vblank_event") for a helper which can be used in certain situation, especially to send out events for atomic commit operations.

int `drm_crtc_vblank_get`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fvblank%5Fget "Permalink to this definition")

get a reference count on vblank events

**Parameters**

`struct drm_crtc * crtc`

which CRTC to own

**Description**

Acquire a reference count on vblank events to avoid having them disabled while in use.

**Return**

Zero on success or a negative error code on failure.

void `drm_crtc_vblank_put`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fvblank%5Fput "Permalink to this definition")

give up ownership of vblank events

**Parameters**

`struct drm_crtc * crtc`

which counter to give up

**Description**

Release ownership of a given vblank counter, turning off interrupts if possible. Disable interrupts after drm\_vblank\_offdelay milliseconds.

void `drm_wait_one_vblank`(struct drm\_device \* _dev_, unsigned int _pipe_)[¶](#c.drm%5Fwait%5Fone%5Fvblank "Permalink to this definition")

wait for one vblank

**Parameters**

`struct drm_device * dev`

DRM device

`unsigned int pipe`

CRTC index

**Description**

This waits for one vblank to pass on **pipe**, using the irq driver interfaces. It is a failure to call this when the vblank irq for **pipe** is disabled, e.g. due to lack of driver support or because the crtc is off.

This is the legacy version of [drm\_crtc\_wait\_one\_vblank()](#c.drm%5Fcrtc%5Fwait%5Fone%5Fvblank "drm_crtc_wait_one_vblank").

void `drm_crtc_wait_one_vblank`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fwait%5Fone%5Fvblank "Permalink to this definition")

wait for one vblank

**Parameters**

`struct drm_crtc * crtc`

DRM crtc

**Description**

This waits for one vblank to pass on **crtc**, using the irq driver interfaces. It is a failure to call this when the vblank irq for **crtc** is disabled, e.g. due to lack of driver support or because the crtc is off.

void `drm_crtc_vblank_off`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fvblank%5Foff "Permalink to this definition")

disable vblank events on a CRTC

**Parameters**

`struct drm_crtc * crtc`

CRTC in question

**Description**

Drivers can use this function to shut down the vblank interrupt handling when disabling a crtc. This function ensures that the latest vblank frame count is stored so that drm\_vblank\_on can restore it again.

Drivers must use this function when the hardware vblank counter can get reset, e.g. when suspending or disabling the **crtc** in general.

void `drm_crtc_vblank_reset`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fvblank%5Freset "Permalink to this definition")

reset vblank state to off on a CRTC

**Parameters**

`struct drm_crtc * crtc`

CRTC in question

**Description**

Drivers can use this function to reset the vblank state to off at load time. Drivers should use this together with the [drm\_crtc\_vblank\_off()](#c.drm%5Fcrtc%5Fvblank%5Foff "drm_crtc_vblank_off") and[drm\_crtc\_vblank\_on()](#c.drm%5Fcrtc%5Fvblank%5Fon "drm_crtc_vblank_on") functions. The difference compared to[drm\_crtc\_vblank\_off()](#c.drm%5Fcrtc%5Fvblank%5Foff "drm_crtc_vblank_off") is that this function doesn’t save the vblank counter and hence doesn’t need to call any driver hooks.

This is useful for recovering driver state e.g. on driver load, or on resume.

void `drm_crtc_vblank_on`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fvblank%5Fon "Permalink to this definition")

enable vblank events on a CRTC

**Parameters**

`struct drm_crtc * crtc`

CRTC in question

**Description**

This functions restores the vblank interrupt state captured with[drm\_crtc\_vblank\_off()](#c.drm%5Fcrtc%5Fvblank%5Foff "drm_crtc_vblank_off") again and is generally called when enabling **crtc**. Note that calls to [drm\_crtc\_vblank\_on()](#c.drm%5Fcrtc%5Fvblank%5Fon "drm_crtc_vblank_on") and [drm\_crtc\_vblank\_off()](#c.drm%5Fcrtc%5Fvblank%5Foff "drm_crtc_vblank_off") can be unbalanced and so can also be unconditionally called in driver load code to reflect the current hardware state of the crtc.

bool `drm_handle_vblank`(struct drm\_device \* _dev_, unsigned int _pipe_)[¶](#c.drm%5Fhandle%5Fvblank "Permalink to this definition")

handle a vblank event

**Parameters**

`struct drm_device * dev`

DRM device

`unsigned int pipe`

index of CRTC where this event occurred

**Description**

Drivers should call this routine in their vblank interrupt handlers to update the vblank counter and send any signals that may be pending.

This is the legacy version of [drm\_crtc\_handle\_vblank()](#c.drm%5Fcrtc%5Fhandle%5Fvblank "drm_crtc_handle_vblank").

bool `drm_crtc_handle_vblank`(struct [drm\_crtc](#c.drm%5Fcrtc "drm_crtc") \* _crtc_)[¶](#c.drm%5Fcrtc%5Fhandle%5Fvblank "Permalink to this definition")

handle a vblank event

**Parameters**

`struct drm_crtc * crtc`

where this event occurred

**Description**

Drivers should call this routine in their vblank interrupt handlers to update the vblank counter and send any signals that may be pending.

This is the native KMS version of [drm\_handle\_vblank()](#c.drm%5Fhandle%5Fvblank "drm_handle_vblank").

**Return**

True if the event was successfully handled, false on failure.



# links
[Read on Omnivore](https://omnivore.app/me/kernel-mode-setting-kms-the-linux-kernel-documentation-18b3ee229a6)
[Read Original](https://www.kernel.org/doc/html/v4.15/gpu/drm-kms.html)

<iframe src="https://www.kernel.org/doc/html/v4.15/gpu/drm-kms.html"  width="800" height="500"></iframe>
