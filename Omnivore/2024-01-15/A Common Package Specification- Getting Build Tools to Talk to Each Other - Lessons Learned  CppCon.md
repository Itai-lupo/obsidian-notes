---
id: d9f56291-2f91-46c5-9a6c-a4748d3b3fd4
title: "A Common Package Specification: Getting Build Tools to Talk to Each Other - Lessons Learned  CppCon"
author: CppCon
tags:
  - programing
  - cppcon
  - cpp
  - youtube
  - tools_to_use
date: 2024-01-15 21:33:29
words_count: 17
state: INBOX
---

# A Common Package Specification: Getting Build Tools to Talk to Each Other - Lessons Learned  CppCon by CppCon
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A Common Package Specification: Getting Build Tools to Talk to Each Other - Lessons Learned  CppCon

## note
>[!note] 
>   

There is a lot of previous work and proposals for a “Common Package Specification”, but there has been little implementation experience with real-world production usage at scale with feedback from diverse groups, something critical for such a specification to be technically viable. Some mechanisms like CMake exported targets/config files are becoming more popular with the continuous adoption of CMake, and pkg-config (.pc) files are also a popular mechanism in GNU systems, but those are still tool-specific and it is still not possible nowadays to consume pre-built binaries in a generic way by every build system.

Since the Conan C++ package manager was released 7 years ago, one of its main design goals was to be tool agnostic and let any package created with any build system to be usable by any other build system. This talk will describe the abstraction that has been and is widely used by +1500 open source Conan packages covering the vast majority of popular C and C++ open source libraries, and thousands of teams using it in production for their own private packages. Based on this experience and the lessons learned, the talk will describe how a “Common Package Specification” should look like:

- Representation of the different folders necessary to define a package: include directories, library directories, binary directories, build files directories, etc.
- How paths should be relative so binary redistribution and re-usage in other machines is possible.
- Representation of the different preprocessor definitions, compiler flags, sysroot.
- Representation of “components”, when a package contains more than one library that can be optionally created, optionally consumed, and includes relationships between components.
- Representation of custom build-system “properties”, that allows to customize some behaviors for specific build systems.
- Achieving scalability by decoupling the binary requirements from the consuming specification (this talk focus only on the second one)

While this basic “Common Package Specification” can be easily represented and serialized in a file, like json or yaml that travels together with the package, there are some implementations challenges that will be discussed:

- How such a generic package specification maps to the existing popular build systems, including CMake, MSBuild, Autotools, Meson, etc, and how this mapping can be leveraged for faster adoption.
- In some cases, the same binary can provide different information to consumers like different preprocessor directives, based on some user configuration. How could this problem be solved with the typical declarative syntax of formats like json or yaml?
- How the packages and the “Common Package Specification” files are found and used by the build system?
- Is it possible to “consume” a package while it is still under development, so it doesn’t have the artifacts to consume in typical “include”, “lib” folders, but in a developer “source” layout?
- What happens at runtime? Beyond the common PATH, LD_LIBRARY_PATH, etc, some packages need to have defined some environment variables to correctly work. Can this information be included in the “Common Package Specification” too?
- Common operations over specification files, like aggregation of components or merging (in the right order, following the topological order of the graph), necessary for build-systems like autotools or NMake.

This talk will summarize years of real world experience contributing towards the goal of having a “Common Package Specification” for C and C++, that will allow full interoperability between build systems and package managers, one of the most desired and demanded functionalities in the C++ tooling ecosystem.
---

# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[A Common Package Specification: Getting Build Tools to Talk to Each Other - Lessons Learned CppCon](https://www.youtube.com/watch?v=ZTjG8fy6Bek)

By [CppCon](https://www.youtube.com/@CppCon)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-z-tj-g-8-fy-6-bek-18d0e9d5625)
[Read Original](https://www.youtube.com/watch?v=ZTjG8fy6Bek)

<iframe src="https://www.youtube.com/watch?v=ZTjG8fy6Bek"  width="800" height="500"></iframe>
