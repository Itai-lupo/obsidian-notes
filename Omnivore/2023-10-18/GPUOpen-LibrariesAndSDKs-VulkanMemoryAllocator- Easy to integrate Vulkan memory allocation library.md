---
id: 5550e3f0-6dd7-11ee-b833-ff5324f6e4ee
title: "GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator: Easy to integrate Vulkan memory allocation library"
tags:
  - programing
  - game_engine
  - vulkan
  - graphic_API
  - tools_to_use
date: 2023-10-18 19:57:47
words_count: 1551
state: INBOX
---

# GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator: Easy to integrate Vulkan memory allocation library by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Easy to integrate Vulkan memory allocation library - GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator: Easy to integrate Vulkan memory allocation library


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## [Vulkan Memory Allocator](#vulkan-memory-allocator)

Easy to integrate Vulkan memory allocation library.

**Documentation:** Browse online: [Vulkan Memory Allocator](https://gpuopen-librariesandsdks.github.io/VulkanMemoryAllocator/html/) (generated from Doxygen-style comments in [include/vk\_mem\_alloc.h](https://github.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator/blob/master/include/vk%5Fmem%5Falloc.h))

**License:** MIT. See [LICENSE.txt](https://github.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator/blob/master/LICENSE.txt)

**Changelog:** See [CHANGELOG.md](https://github.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator/blob/master/CHANGELOG.md)

**Product page:** [Vulkan Memory Allocator on GPUOpen](https://gpuopen.com/gaming-product/vulkan-memory-allocator/)

**Build status:**

* Windows: [![Build status](https://proxy-prod.omnivore-image-cache.app/0x0,sY-ojAvf3iplwtKrmWiFeE4xJTUyWho6SO2hqgr8jgc0/https://camo.githubusercontent.com/bf1520fe3e06f8caa6f8be911370a1055a417900b9d2abc28e29de5b2c82bcce/68747470733a2f2f63692e6170707665796f722e636f6d2f6170692f70726f6a656374732f7374617475732f34766c63726230656d6b61696f32706e2f6272616e63682f6d61737465723f7376673d74727565)](https://ci.appveyor.com/project/adam-sawicki-amd/vulkanmemoryallocator/branch/master)
* Linux: [![Build Status](https://proxy-prod.omnivore-image-cache.app/0x0,sAwXSAYRBQYZeGkQf_I00nrA0E4FLVVGuMvj7DOI-TWk/https://camo.githubusercontent.com/c475dcedc8fd94eb466d6384598bf52ff67b6d7a3a93dd445a5064e002f921c4/68747470733a2f2f6170702e7472617669732d63692e636f6d2f4750554f70656e2d4c6962726172696573416e6453444b732f56756c6b616e4d656d6f7279416c6c6f6361746f722e7376673f6272616e63683d6d6173746572)](https://app.travis-ci.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator)

[![Average time to resolve an issue](https://proxy-prod.omnivore-image-cache.app/0x0,sgI6051KbZUEWitBRap2jHn6qaXbbRf6-kXkYgdGowgc/https://camo.githubusercontent.com/915c02577616a3726b0a6a3ce07a08e8875d9f5dfec6246f0e399cdd63cd6088/687474703a2f2f697369746d61696e7461696e65642e636f6d2f62616467652f7265736f6c7574696f6e2f4750554f70656e2d4c6962726172696573416e6453444b732f56756c6b616e4d656d6f7279416c6c6f6361746f722e737667)](http://isitmaintained.com/project/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator "Average time to resolve an issue")

## [Problem](#problem)

Memory allocation and resource (buffer and image) creation in Vulkan is difficult (comparing to older graphics APIs, like D3D11 or OpenGL) for several reasons:

* It requires a lot of boilerplate code, just like everything else in Vulkan, because it is a low-level and high-performance API.
* There is additional level of indirection: `VkDeviceMemory` is allocated separately from creating `VkBuffer`/`VkImage` and they must be bound together.
* Driver must be queried for supported memory heaps and memory types. Different GPU vendors provide different types of it.
* It is recommended to allocate bigger chunks of memory and assign parts of them to particular resources, as there is a limit on maximum number of memory blocks that can be allocated.

## [Features](#features)

This library can help game developers to manage memory allocations and resource creation by offering some higher-level functions:

1. Functions that help to choose correct and optimal memory type based on intended usage of the memory.  
   * Required or preferred traits of the memory are expressed using higher-level description comparing to Vulkan flags.
2. Functions that allocate memory blocks, reserve and return parts of them (`VkDeviceMemory` \+ offset + size) to the user.  
   * Library keeps track of allocated memory blocks, used and unused ranges inside them, finds best matching unused ranges for new allocations, respects all the rules of alignment and buffer/image granularity.
3. Functions that can create an image/buffer, allocate memory for it and bind them together - all in one call.

Additional features:

* Well-documented - description of all functions and structures provided, along with chapters that contain general description and example code.
* Thread-safety: Library is designed to be used in multithreaded code. Access to a single device memory block referred by different buffers and textures (binding, mapping) is synchronized internally. Memory mapping is reference-counted.
* Configuration: Fill optional members of `VmaAllocatorCreateInfo` structure to provide custom CPU memory allocator, pointers to Vulkan functions and other parameters.
* Customization and integration with custom engines: Predefine appropriate macros to provide your own implementation of all external facilities used by the library like assert, mutex, atomic.
* Support for memory mapping, reference-counted internally. Support for persistently mapped memory: Just allocate with appropriate flag and access the pointer to already mapped memory.
* Support for non-coherent memory. Functions that flush/invalidate memory. `nonCoherentAtomSize` is respected automatically.
* Support for resource aliasing (overlap).
* Support for sparse binding and sparse residency: Convenience functions that allocate or free multiple memory pages at once.
* Custom memory pools: Create a pool with desired parameters (e.g. fixed or limited maximum size) and allocate memory out of it.
* Linear allocator: Create a pool with linear algorithm and use it for much faster allocations and deallocations in free-at-once, stack, double stack, or ring buffer fashion.
* Support for Vulkan 1.0, 1.1, 1.2, 1.3.
* Support for extensions (and equivalent functionality included in new Vulkan versions):  
   * VK\_KHR\_dedicated\_allocation: Just enable it and it will be used automatically by the library.  
   * VK\_KHR\_buffer\_device\_address: Flag `VK_MEMORY_ALLOCATE_DEVICE_ADDRESS_BIT_KHR` is automatically added to memory allocations where needed.  
   * VK\_EXT\_memory\_budget: Used internally if available to query for current usage and budget. If not available, it falls back to an estimation based on memory heap sizes.  
   * VK\_EXT\_memory\_priority: Set `priority` of allocations or custom pools and it will be set automatically using this extension.  
   * VK\_AMD\_device\_coherent\_memory
* Defragmentation of GPU and CPU memory: Let the library move data around to free some memory blocks and make your allocations better compacted.
* Statistics: Obtain brief or detailed statistics about the amount of memory used, unused, number of allocated blocks, number of allocations etc. - globally, per memory heap, and per memory type.
* Debug annotations: Associate custom `void* pUserData` and debug `char* pName` with each allocation.
* JSON dump: Obtain a string in JSON format with detailed map of internal state, including list of allocations, their string names, and gaps between them.
* Convert this JSON dump into a picture to visualize your memory. See [tools/GpuMemDumpVis](https://github.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator/blob/master/tools/GpuMemDumpVis/README.md).
* Debugging incorrect memory usage: Enable initialization of all allocated memory with a bit pattern to detect usage of uninitialized or freed memory. Enable validation of a magic number after every allocation to detect out-of-bounds memory corruption.
* Support for interoperability with OpenGL.
* Virtual allocator: Interface for using core allocation algorithm to allocate any custom data, e.g. pieces of one large buffer.

## [Prerequisites](#prerequisites)

* Self-contained C++ library in single header file. No external dependencies other than standard C and C++ library and of course Vulkan. Some features of C++14 used. STL containers, RTTI, or C++ exceptions are not used.
* Public interface in C, in same convention as Vulkan API. Implementation in C++.
* Error handling implemented by returning `VkResult` error codes - same way as in Vulkan.
* Interface documented using Doxygen-style comments.
* Platform-independent, but developed and tested on Windows using Visual Studio. Continuous integration setup for Windows and Linux. Used also on Android, MacOS, and other platforms.

## [Example](#example)

Basic usage of this library is very simple. Advanced features are optional. After you created global `VmaAllocator` object, a complete code needed to create a buffer may look like this:

VkBufferCreateInfo bufferInfo = { VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO };
bufferInfo.size = 65536;
bufferInfo.usage = VK_BUFFER_USAGE_VERTEX_BUFFER_BIT | VK_BUFFER_USAGE_TRANSFER_DST_BIT;

VmaAllocationCreateInfo allocInfo = {};
allocInfo.usage = VMA_MEMORY_USAGE_AUTO;

VkBuffer buffer;
VmaAllocation allocation;
vmaCreateBuffer(allocator, &bufferInfo, &allocInfo, &buffer, &allocation, nullptr);

With this one function call:

1. `VkBuffer` is created.
2. `VkDeviceMemory` block is allocated if needed.
3. An unused region of the memory block is bound to this buffer.

`VmaAllocation` is an object that represents memory assigned to this buffer. It can be queried for parameters like `VkDeviceMemory` handle and offset.

## [How to build](#how-to-build)

On Windows it is recommended to use [CMake GUI](https://cmake.org/runningcmake/).

Alternatively you can generate/open a Visual Studio from the command line:

# By default CMake picks the newest version of Visual Studio it can use
cmake -S .  -B build -D VMA_BUILD_SAMPLES=ON
cmake --open build

On Linux:

cmake -S . -B build
# Since VMA has no source files, you can skip to installation immediately
cmake --install build --prefix build/install

## [How to use](#how-to-use)

After calling either `find_package` or `add_subdirectory` simply link the library. This automatically handles configuring the include directory. Example:

find_package(VulkanMemoryAllocator CONFIG REQUIRED)
target_link_libraries(YourGameEngine PRIVATE GPUOpen::VulkanMemoryAllocator)

For more info on using CMake visit the official [CMake documentation](https://cmake.org/cmake/help/latest/index.html).

## [Building using vcpkg](#building-using-vcpkg)

You can download and install VulkanMemoryAllocator using the [vcpkg](https://github.com/Microsoft/vcpkg) dependency manager:

```jboss-cli
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh
./vcpkg integrate install
./vcpkg install vulkan-memory-allocator

```

The VulkanMemoryAllocator port in vcpkg is kept up to date by Microsoft team members and community contributors. If the version is out of date, please [create an issue or pull request](https://github.com/Microsoft/vcpkg) on the vcpkg repository.

## [Binaries](#binaries)

The release comes with precompiled binary executable for "VulkanSample" application which contains test suite. It is compiled using Visual Studio 2019, so it requires appropriate libraries to work, including "MSVCP140.dll", "VCRUNTIME140.dll", "VCRUNTIME140\_1.dll". If the launch fails with error message telling about those files missing, please download and install [Microsoft Visual C++ Redistributable for Visual Studio 2015, 2017 and 2019](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads), "x64" version.

## [Read more](#read-more)

See **[Documentation](https://gpuopen-librariesandsdks.github.io/VulkanMemoryAllocator/html/)**.

## [Software using this library](#software-using-this-library)

* **[X-Plane](https://x-plane.com/)**
* **[Detroit: Become Human](https://gpuopen.com/learn/porting-detroit-3/)**
* **[Vulkan Samples](https://github.com/LunarG/VulkanSamples)** \- official Khronos Vulkan samples. License: Apache-style.
* **[Anvil](https://github.com/GPUOpen-LibrariesAndSDKs/Anvil)** \- cross-platform framework for Vulkan. License: MIT.
* **[Filament](https://github.com/google/filament)** \- physically based rendering engine for Android, Windows, Linux and macOS, from Google. Apache License 2.0.
* **[Atypical Games - proprietary game engine](https://developer.samsung.com/galaxy-gamedev/gamedev-blog/infinitejet.html)**
* **[Flax Engine](https://flaxengine.com/)**
* **[Godot Engine](https://github.com/godotengine/godot/)** \- multi-platform 2D and 3D game engine. License: MIT.
* **[Lightweight Java Game Library (LWJGL)](https://www.lwjgl.org/)** \- includes binding of the library for Java. License: BSD.
* **[LightweightVK](https://github.com/corporateshark/lightweightvk)** \- lightweight C++ bindless Vulkan 1.3 wrapper. License: MIT.
* **[PowerVR SDK](https://github.com/powervr-graphics/Native%5FSDK)** \- C++ cross-platform 3D graphics SDK, from Imagination. License: MIT.
* **[Skia](https://github.com/google/skia)** \- complete 2D graphic library for drawing Text, Geometries, and Images, from Google.
* **[The Forge](https://github.com/ConfettiFX/The-Forge)** \- cross-platform rendering framework. Apache License 2.0.
* **[VK9](https://github.com/disks86/VK9)** \- Direct3D 9 compatibility layer using Vulkan. Zlib lincese.
* **[vkDOOM3](https://github.com/DustinHLand/vkDOOM3)** \- Vulkan port of GPL DOOM 3 BFG Edition. License: GNU GPL.
* **[vkQuake2](https://github.com/kondrak/vkQuake2)** \- vanilla Quake 2 with Vulkan support. License: GNU GPL.
* **[Vulkan Best Practice for Mobile Developers](https://github.com/ARM-software/vulkan%5Fbest%5Fpractice%5Ffor%5Fmobile%5Fdevelopers)** from ARM. License: MIT.
* **[RPCS3](https://github.com/RPCS3/rpcs3)** \- PlayStation 3 emulator/debugger. License: GNU GPLv2.
* **[PPSSPP](https://github.com/hrydgard/ppsspp)** \- Playstation Portable emulator/debugger. License: GNU GPLv2+.
* **[Wicked Engine![](https://proxy-prod.omnivore-image-cache.app/0x0,sadNVaHodwuMjJulPcGIt3xS1O0pJ8mMdpwqjFiqetQc/https://github.com/turanszkij/WickedEngine/raw/master/Content/logo_small.png)](https://github.com/turanszkij/WickedEngine)** \- 3D engine with modern graphics

[Many other projects on GitHub](https://github.com/search?q=AMD%5FVULKAN%5FMEMORY%5FALLOCATOR%5FH&type=Code) and some game development studios that use Vulkan in their games.

## [See also](#see-also)

* **[D3D12 Memory Allocator](https://github.com/GPUOpen-LibrariesAndSDKs/D3D12MemoryAllocator)** \- equivalent library for Direct3D 12\. License: MIT.
* **[Awesome Vulkan](https://github.com/vinjn/awesome-vulkan)** \- a curated list of awesome Vulkan libraries, debuggers and resources.
* **[vcpkg](https://github.com/Microsoft/vcpkg)** dependency manager from Microsoft also offers a port of this library.
* **[VulkanMemoryAllocator-Hpp](https://github.com/YaaZ/VulkanMemoryAllocator-Hpp)** \- C++ binding for this library. License: CC0-1.0.
* **[PyVMA](https://github.com/realitix/pyvma)** \- Python wrapper for this library. Author: Jean-Sébastien B. (@realitix). License: Apache 2.0.
* **[vk-mem](https://github.com/gwihlidal/vk-mem-rs)** \- Rust binding for this library. Author: Graham Wihlidal. License: Apache 2.0 or MIT.
* **[Haskell bindings](https://hackage.haskell.org/package/VulkanMemoryAllocator)**, **[github](https://github.com/expipiplus1/vulkan/tree/master/VulkanMemoryAllocator)** \- Haskell bindings for this library. Author: Ellie Hermaszewska (@expipiplus1). License BSD-3-Clause.
* **[vma\_sample\_sdl](https://github.com/rextimmy/vma%5Fsample%5Fsdl)** \- SDL port of the sample app of this library (with the goal of running it on multiple platforms, including MacOS). Author: @rextimmy. License: MIT.
* **[vulkan-malloc](https://github.com/dylanede/vulkan-malloc)** \- Vulkan memory allocation library for Rust. Based on version 1 of this library. Author: Dylan Ede (@dylanede). License: MIT / Apache 2.0.



# links
[Read on Omnivore](https://omnivore.app/me/gpu-open-libraries-and-sd-ks-vulkan-memory-allocator-easy-to-int-18b43b8d2d6)
[Read Original](https://github.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator)

<iframe src="https://github.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator"  width="800" height="500"></iframe>
