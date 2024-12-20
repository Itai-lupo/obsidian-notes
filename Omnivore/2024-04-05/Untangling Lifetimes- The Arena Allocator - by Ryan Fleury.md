---
id: 531f8b2b-8aff-44cb-a8cc-5b005459335f
title: "Untangling Lifetimes: The Arena Allocator - by Ryan Fleury"
author: Ryan Fleury
tags:
  - programing
  - game_engine
  - memory_management
  - c
date: 2024-04-05 20:21:37
date_published: 2022-09-24 01:12:46
words_count: 8405
state: INBOX
---

# Untangling Lifetimes: The Arena Allocator - by Ryan Fleury by Ryan Fleury
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Making performant dynamic manual memory management in C feel almost like garbage collection.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
### Making performant dynamic manual memory management in C feel almost like garbage collection.

In every instance when I’ve said that I prefer to write my software in C, the response is—normally—raised eyebrows. Several dominant memes in the programming world make my position unpopular, and thus uncommon to find. I regularly hear, “why would you write new code in an unsafe systems language?”, “performance isn’t everything!”, and perhaps the most common, **“why subject yourself to the requirement of manually managing memory?”**.

The perception that manual memory management is difficult to do, difficult to do _correctly_, and thus inherently bug-prone and unstable is common. Through my years in a university computer science program, this way of thinking was peddled repeatedly. Learning how to manage memory in C was an endeavor to “learn how things work”, strictly for academic purposes. The idea that anyone would ever _actually_ do manual memory management in C _these days_ was just unthinkable—I mean, after all, it’s _current year_, and everyone knows that once it’s _current year_, an arbitrary set of ideas that I don’t like become intrinsically false.

Education around memory management—as it was presented to me—was purely a historical, academic endeavor. How did the Linux kernel originally do memory management? Let’s do an assignment on that subject so you can see how _gross_ it is! Eww, look at that `malloc`! Weird! Oh, don’t forget to `free` it! But don’t worry, kiddo; in next class, you can return to your “safe” and “managed” padded-room languages where bugs and instabilities are “impossible” (or so they claim).

After you’ve been exposed to the dark underworld of “manual memory management in C”, your professor will rescue you, and introduce automatic reference counting, RAII, and/or garbage collectors as the “solutions”.

As you may be able to tell from my tone, I think this way of thinking is nonsensical. It’s not that I think the “normal” methods of memory management in C are fine—in fact, quite the opposite—but instead it’s that I don’t think more complex compilers nor language features are required in order to find a dramatically better alternative. And, in keeping with a core principle of mine—maintaining the possibility of self-reliance through simple, rewritable systems, instead of increasingly complex tools—I think better (yet simpler) alternatives are _the only path forward_.

In this post, I’ll be presenting an alternative to the traditional strategy of manual memory management that I’ve had success with: the _arena allocator_. But first, let’s analyze “manual memory management in C” as it is normally presented—the classic `malloc` and `free` interface—and its consequences.

`malloc`—which is short for “**m**emory **alloc**ate”—is an API to which you pass some number of bytes that you need for a dynamic allocation, and returns to you a pointer to a block of memory that supports that many validly-accessible bytes.

The symmetric counterpart to `malloc`, `free`, just expects a pointer that you got from `malloc`, and it guarantees that whatever block of memory that pointer points to will be made available for subsequent calls to `malloc`.

The `malloc` and `free` interface was built to support usage code that wants to dynamically allocate blocks of memory of arbitrarily-different _sizes_, with each allocation having an arbitrarily-different _lifetime_. There is no restriction on either of those two factors, meaning the following usages are all valid:

```cpp
void *p1 = malloc(512);
void *p2 = malloc(64);
void *p3 = malloc(1024*1024);
void *p4 = malloc(7);
free(p1);
free(p2);
free(p3);
free(p4);
```

```cpp
void *p1 = malloc(512);
void *p2 = malloc(64);
void *p3 = malloc(1024*1024);
void *p4 = malloc(7);
free(p4);
free(p3);
free(p2);
free(p1);
```

```angelscript
void *p1 = malloc(512);
void *p2 = malloc(64);
void *p3 = malloc(1024*1024);
void *p4 = malloc(7);
// (no freeing whatsoever)
```

```cpp
void *p1 = malloc(512);
free(p1);
void *p2 = malloc(64); // part of p1 used here?
void *p3 = malloc(1024*1024);
free(p2);
free(p3);
void *p4 = malloc(7); // part of p1/p2 used here?
free(p4);
```

`malloc` and `free`—as an _interface_—attempt to enforce _very little_ on the calling code. They form an _entirely_ _generic memory allocator_.

The primary—and quite understandable—criticism people have of `malloc` and `free`, or what they call “manual memory management in C”, is that using it for granular allocations with varying lifetimes across several layers in a codebase can easily lead to a rat’s nest of complexity. In these rat’s nests, it’s easy to accidentally `free` the same pointer twice, to access memory in a block that has already been `free`’d, to forget to `free` a pointer altogether (causing a leak), or to force your program to suffer computationally because of a need to `free` each small allocation in, for instance, a complex data structure with many nontrivial links between nodes.

The worst of these mistakes can lead to serious security and reliability issues. Imagine that memory is allocated with `malloc`, then freed _once_, then mistakenly freed again. An allocation may occur between the first and second call to `free`, which possibly reuses the already-released (at that point in time) memory. Because the usage rules of `malloc` and `free` have been broken, the allocator’s _implementation_ and _user_ disagree on an important detail—whether or not the allocation reusing portions of the first is allocated or not.

As I’ll present in this post, these rat’s nests can be avoided. But why, then, are they seemingly so common in C codebases, and why is there a dominant perception that they are unavoidable without more complex compiler and language features?

## The Link Between Interface, Implementation, and Usage

`malloc` and `free` enforce _very little_ on their usage code, so there is a _large space of possibilities_ in how `malloc` and `free` are used (as the number of constraints increases, the number of solutions decreases). Many of those possibilities are the ever-common rat’s nests. The natural path for many C codebases is simply that of least (initial) resistance, which is to assume `malloc` and `free` as a suitable memory allocation interface (which is not necessarily unreasonable, given a lack of data), and so they will adopt it as a pattern. In the case of `malloc` and `free`, that means adopting a large space of possibilities—including the subset of those possibilities which include misuse, or explosions of complexity (“rat’s nests”).

There is a philosophy of abstraction in the programming world that believes in providing a certain desirable (for one reason or another) interface _irrespective_ of the implications that interface has on its implementation. It is this philosophy that also claims that an interface can remain stable even with the implementation of the interface wildly changing. For some reason, it took several years before I became aware that the reality is precisely the opposite—an _interface_ and its _implementation_ are intrinsically related in subtle ways.

There is, of course, some degree to which an interface may remain stable with modifications to its implementation, but when the _nature of the implementation_ must change, the _interface_ must also fundamentally change, at least to avoid introducing unnecessary distortions to a problem (for instance, an interface being simply malformed for a given implementation, result in performance issues, bugs, underpowered APIs, and so on). The interface certainly hides _some details_, but it also _explicitly does not_ hide others—in fact, an interface itself is _defined by_ exposed guarantees or constraints, which both the user of the interface and the implementation must agree upon. There is certainly a more precise way to formally demonstrate this, but for now, I’ll leave it at that.

`malloc` and `free` serve as a useful example of how an interface’s definition is closely related with both its usage patterns and implementation. The fine-grained control over an individual allocation’s size and lifetime—to allow for arbitrarily overlapping lifetimes with arbitrarily different sizes—result in very few constraints on the usage code. This causes, firstly, complications in the implementation of the allocator. While that causes performance problems (and thus has caused a popular meme that “dynamic allocation in a hot loop is bad”), the worst of the issues arise in the patterns relating to usage of a `malloc` and `free` style interface.

Iterating all of these patterns would be impossible, but I’ve gathered a few for this post to help illustrate the issue.

### Pattern I: The False Binary of Stack vs. Heap

You’ll notice that—in all conversations about manual memory management in C—the _common case_ of memory allocation is never discussed, because it mostly stays in the background, is trivial to use, and more-or-less works correctly and invisibly: the stack.

Sometimes, however, the stack is not an option—I’ll get more into that later. But when `malloc` and `free` (or equivalent) have been adopted as the default memory allocation pattern in a codebase, they are the first choice whenever the stack stops being an option. This is a common pattern in several C codebases in the wild, which—knowingly or not—have been corrupted by object-oriented thinking, even if their writers do not explicitly think that is the style of thinking they are using. When an individual allocation doesn’t work on the stack, for whatever reason, the author of the codebase in question is often taught that the only other option is to use “heap allocation”, which to most people means “use `malloc`”. So, instead of using the _stack allocator_, they will switch to the _extremely generic heap allocator,_ often being unaware that these are not the only two choices.

As such, these codebases will have de facto objects, and these objects will generally have some initialization mechanism, and some deinitialization mechanism. If the codebase adopts a rule that suggests these objects may be allocated and deallocated in the same way an individual `malloc` allocation may be allocated and deallocated (which is the natural path of least resistance, which requires the fewest new possibly-bad assumptions), then the object’s interface will _wrap_ the `malloc` and `free` interface, and follow the same rules pertaining to lifetimes:

```cpp
struct MyObject
{
  int x; // imagine some heavy weight stuff here!
};

MyObject *MyObjectAlloc(void)
{
  MyObject *obj = malloc(sizeof(MyObject));
  // other important initialization/mallocs happen here!
  return obj;
}

void MyObjectRelease(MyObject *object)
{
  // other important deinit/frees happen here!
  free(object);
}
```

When the above style of interface becomes a _rule_ within a codebase, it is frequently built _by default_ without accounting for a number of actual constraints which may have otherwise simplified the problem:

* When does usage code actually need a `MyObject`?
* How many of them does it need?
* Is a `MyObject` only required given the presence of another object?
* How easily can you predict how many are needed?
* If multiple, are they freed all at once, or one at a time? In what order?
* How important is it that a `MyObject` is released at all?
* Is it important to be able to keep track of all `MyObject` allocations independently from other allocations?

When such questions are ignored, the above pattern of wrapping a totally-generic allocation/deallocation interface becomes _common parlance_ in a codebase, which leads to a proliferation of code that must assume full responsibility for finely-managing the lifetime of any individual object that doesn’t fit stack allocation (either because it has dynamic runtime requirements, `alloca` is not an option, it’s too large, or it doesn’t have lifetime requirements that fit the stack). This leads to this pattern being used even for _very granular “objects”_, which _explodes_ the number of actual dynamic allocations and deallocations, and makes it far more likely that a programming mistake occurs. Pairing a single `malloc` with a single `free` is easy—pairing 1,000 `malloc`s with 1,000 `free`s—especially when many of those individual `malloc`s have dependencies on others—is dramatically more difficult to write _once_, and especially more difficult to _maintain overtime_.

### Pattern II: Lifetime Soup

If the problem of managing 1,000 (or 10,000, or 100,000) various lifetimes wasn’t enough of a problem for you, now consider that these lifetimes often have complex _dependencies_ on one another. Eventually, there is a _graph_ of lifetimes, each node (lifetime) in which relies on certain assumptions about some number of other lifetimes. “Object A”, within its own lifetime, will refer to “Object B”—care, then, must be taken to ensure that, for instance, “Object B” is not freed before it is accessed through “Object A”.

If there is no organizing principle around managing these relationships and their corresponding lifetimes, through a number of subtle mistakes (that often do not arise immediately) a codebase quickly turns into a sludge, where important work is constantly deferred behind bugfixing or maintenance work—or, worse, where important work occurs _before_ bugfixing and maintenance work, and thus bugs and maintenance issues accumulate over time.

### Pattern III: Religiously Freeing Memory (`free` Isn’t Free)

What a memory leak _literally is_ on a modern computer is very often glossed over in programming education. It is very frequently perceived as a scary no-no—if your program has a leak, it’s a bad program, and you’re a bad programmer, and you will go to programmer hell!

With this perception, programmers will often carefully `free` allocations in their program _to the point of religiosity_, even when doing so is _strictly worse_ than never writing a single line of cleanup code.

To clear this up, I’ll first explain—literally—what happens when you allocate something with `malloc` on a computer these days, and then subsequently what happens when you fail to call `free` with a pointer returned to you from `malloc`.

When you first call `malloc`, you’re ultimately just calling a function that was implemented by whoever wrote the implementation of the C runtime library that you’re using. The person who wrote that code had a task—implement a dynamic memory allocator, given the constraints in the C specification. So, their job is to return you a pointer to a block of memory that’s at least as large as what you asked for, and then to also be able to release that memory (make it available for re-allocation in a later `malloc`) in the `free` implementation.

On a modern machine like the computer or phone you’re reading this on, at some point the allocator will ask the _operating system_ for memory dynamically. Part of the utility of the C runtime library is, at the end of the day, simply abstracting over operating-system-specific code. To do this, it will request that the operating system maps new pages into the relevant virtual address space (by calling an operating system API, like `VirtualAlloc` on Windows). The pointer that `malloc` returns to you is not _literally an address_ of any physical memory—it’s instead an address in your own _virtual address space_. The operating system, then, manages a mapping data structure, called a “page table”, which maps _virtual_ addresses into _physical_ addresses.

Being called by `VirtualAlloc` (or similar), the operating system will make adjustments to that mapping data structure, which changes the mapping between sections of a virtual address space and physical pages in memory. After that is complete, the operating system—whenever it chooses to schedule your program’s thread—can then prepare the memory management unit (MMU) accordingly, so that whenever your thread asks about an address, it can map to the appropriate physical address.

The main point being, whenever a process crashes (hits a hardware-level exception, like a page fault) or normally exits, the operating system continues running (or, at least, it had better), and has a whole understanding of what pages in your program’s virtual address space were mapped to physical memory addresses. So the _operating system_ is able—and really, required, in the presence of code that cannot be trusted to never crash—to “release” the physical pages that your process originally asked for.

So, tying that all together, what happens when you never call `free` with a pointer that was returned to you by `malloc`? The first obvious point is that—of course—the `malloc`/`free` allocator fails to ever see the pointer again, and so it assumes it is still “allocated” by the usage code, which means that memory can never be reused again for another `malloc` allocation. _That_ is what is called a “memory leak”. On the program exiting or crashing, no resources are truly “leaked”.

Now, to clarify, a leak may actually be a problem. For instance, if you’re building a program that runs “forever” to interact with the user through a graphical user interface, and on every frame, you call `malloc` several times and never `free` the memory you allocate, your program will leak some number of bytes _per frame_. Considering that—at least in dynamic scenarios—your program will be chugging through a frame around 60, 120, 144 times per second, that leak will likely add up fairly quickly. It’s possible that such a leak would prohibit normal usage of the program—for instance, after 30 minutes, an allocation failure occurs, or the operating system spends far too much time paging in memory from disk to allow your program’s memory usage to continuously grow.

On the other hand, however, a leak is very often _not a problem_—for example, when allocating memory that needs to be allocated for the duration of the program, or if you expect the program to only boot up and perform a task, then to close.

In other words, you may treat the operating system as “the ultimate garbage collector”—`free`ing memory when it is unnecessary will simply waste both your and the user’s time, and lead to code complexity and bugs that would otherwise not exist. Unfortunately, many popular programming education resources teach that cleanup code is _always necessary_. This is false.

### Pattern IV: Lifetime Beginning/Ending Asymmetry

The `malloc` and `free` interface is symmetric—for each call to `malloc` that returns a pointer to memory that must be freed, there will be one call to `free`. So for instance, if memory for an entity in a game world is `malloc`’d when the entity is spawned, then it will be `free`’d when the entity is killed or deleted.

A problem arises when the manner in which memory is acquired does not match the manner in which it is ultimately released. For example, if I load a level in my game engine’s level editor, and for each entity that is spawned some number of `malloc`s occur, and for each entity I spawn while editing the level some more `malloc`s occur, then I want to unload that level and load a different one, then there is no “free all of the memory I allocated for this level” button. Each `malloc` must receive its symmetric `free`, and so I must iterate all of the entities and `free` each result that was returned to me from `malloc`.

There is no “`malloc` checker” in C compilers, and there is no obvious element of incorrectness that comes from forgetting to `free` something in such a codepath (unlike the element of incorrectness you’d quickly find on forgetting to _allocate_ something), and so it’s quite easy to allow the “free everything” path to become out-of-sync with the “allocate one thing” path. This leads to both bugs and leaks—and, of course, it contributes to the sum-total of code required to implement something.

## Abstraction Through Obfuscation

The above patterns are surely not exhaustive, but they hopefully provide a decent picture of how the _nature of an interface_ like `malloc` and `free` can spiral into an out-of-control mess, where bugs and leaks regularly arise. This mess will ultimately result in a decline in software quality, an increase in iteration time, and thus a decline in one’s ability to meaningfully work on a project (other than purely maintaining its inertia—for instance, by fixing a leak reported by a customer).

### Generating Inconvenient Code: RAII

One attempted solution to this problem found in the modern programming world is to introduce compiler and language features to _automatically generate_ “inconvenient code”—in this case, that being the code responsible for correctly calling initialization and deinitialization code (which may include allocations and deallocations).

This is done in the C++ world through RAII—whenever an object goes out of scope, either by being initially allocated on the stack, explicitly allocated (in C++, through `new` and `delete`), or by being within another object that is going out of scope, some code will automatically be called, which is responsible for cleanup (the _destructor_). When an object’s lifetime _starts_, then some other code will automatically be called, which is responsible for initialization (the _constructor_). 

The constructor and destructor of an object mark the beginning and ending (respectively) of that object’s _lifetime_. The fact that this has the same overhead that `malloc` and `free` had is not relevant—it is purely trying to automate the generation of some code by assuming initialization and deinitialization are coupled with an object’s _lifetime_. This, of course, does not eliminate all possible bugs (misuse is still possible, and often not checkable in a language like C++)—so, this idea is often paired in newer languages with heavier (and more complex) compile-time checking features, which attempt to both automate this code generation, and prohibit misuse.

### The Enforcement Bureaucracy: Garbage Collection

Another attempted solution is _garbage collection_, which is a large enforcement structure that tracks everything and interrupts productive work in order to perform its function (much like a government agency, except in this case, the garbage collector is ostensibly doing something approximating useful work—although both function by stealing valuable resources involuntarily). A garbage collector will periodically interrupt a running program—which is running normally—to explore the set of individual `malloc`\-style allocations (objects) and find which of them are still being referenced somewhere in live data structures, thus detecting the termination of some allocation _lifetimes_, and being able to release those allocations. In many cases, garbage collectors do actually perform their function, although nevertheless it’s still possible to produce de facto leaks, by mistakenly holding an unnecessary reference to an object, which prohibits the garbage collector from releasing it.

### An Alternative Approach: Change The Problem’s Nature

The above solution attempts see the problem as fundamentally an _automation_ or _checking_ problem. It isn’t simply that memory management was being approached in an entirely wrong way—instead, the `malloc` and `free` rat’s nest is simply a part of the memory management problem’s intrinsic nature, and so _tooling_ must simply aid the programmer in making fewer mistakes.

This view follows quite naturally from another aspect of modern programming thinking (and education), which claims many problems are _gross_ and _complex_, and thus we need _abstraction_ to make them _appear simpler_. It’s not, advocates of this philosophy claim, that the problems themselves should be simplified—they are, on the other hand, _intrinsically complex_, and it is the job of tooling to make them appear less complex.

I don’t agree with this view for a number of reasons. Firstly, complexity hidden by an interface (be it an API or a tool’s controls) does not simply disappear—it can be detected through performance problems, subtle bugs, and a lack of composability. Secondly, there is not a single _user_ and a single _producer_ in computing—the ecosystem is a complex graph of interdependent problems. There are “leaf nodes” in this graph, where produced software has no dependents—this would be, for instance, a game that never has any of its code reused. But the _vast majority_ of the graph is producing software that must be composed with other software in unpredictable ways, and that production occurs by composing other _dependency_ software in unpredictable ways. So _complexity_ introduced at any point in this graph does not simply disappear—instead, it _compounds_. It is no coincidence that modern software—after many decades of cruft accumulation and software composition—seems to be slower, buggier, less reliable, and more frustrating to use than it should be.

Nevertheless, this view is dominant in the programming sphere at large, and as such is responsible for a host of solutions that don’t mind _adding_ complexity to the problem.

My approach, on the other hand, is this: instead of _assuming_ that `malloc` and `free` were the correct low-level operations, we can _change the memory allocation interface_—tweaking what the user and implementation agree on—to simplify the problem and eliminate many of the problems found in the traditional `malloc` and `free` style of memory management.

What, exactly, does that approach look like? To begin understanding it, let’s take a look at another style of memory management in C that _does not_ have the same problems that `malloc` and `free` do: the stack.

## Memory “Management” With The Stack

As I mentioned earlier, the primary focus of criticism on memory management in C is on the `malloc` and `free` interface, and _not_ the stack. That is for a good reason—using the stack correctly is remarkably simple. Misusing it is, of course, still possible. But after a new C programmer learns a few simple rules, it’s not particularly difficult to avoid almost all mistakes.

With stack allocation, the idea is simple: multiple allocation lifetimes—all using a single block of memory—may be in-flight at a single time, but the _end_ of a lifetime may _never cross_ the beginning of another lifetime. This means that several _nested_ allocation lifetimes may exist, but it is not an entirely arbitrary timeline of overlapping allocation lifetimes (as in the case of `malloc` and `free`).

This rule can be clearly visualized by looking at virtually any CPU profiler, many of which make use of what’s called a “flame graph”:

[![](https://proxy-prod.omnivore-image-cache.app/786x209,s-WHaeMpCLtpPr_SRQepIuOaCyx--E38MseXFqnbVWXw/https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6b30c2a-bcdc-428c-a200-800614adb51e_786x209.png)](https://substackcdn.com/image/fetch/f%5Fauto,q%5Fauto:good,fl%5Fprogressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6b30c2a-bcdc-428c-a200-800614adb51e%5F786x209.png)

Each block in the above picture corresponds with one of these lifetimes. Once a lifetime has been entered, its _parent lifetime_ cannot end until _it first ends_.

When a new lifetime opens—delimited by the `{` symbol in C’s syntax—that signifies a new “scope” on the stack. When a lifetime closes—delimited by the `}` symbol—the lifetime began by the corresponding `{` symbol is terminated. Any variables declared within those two symbols “belong” to that lifetime.

The syntax makes the rule of a lifetime’s _end_ not crossing another lifetime’s _beginning_ quite clear. The following is a valid case of multiple lifetimes:

```angelscript
// lifetime A
{
  int x = 0; // an integer is allocated in this scope
  int y = 0; // another integer is allocated in this scope

  // lifetime B
  {
    int z = 0; // an integer is allocated in this scope
  } // end of lifetime B

} // end of lifetime A
```

But the following idea is not valid (and cannot even be expressed within the grammar):

```angelscript
// lifetime A
{
  int x = 0; // an integer is allocated in this scope
  int y = 0; // another integer is allocated in this scope

  // lifetime B
  {
    int z = 0; // an integer is allocated in this scope

} // end of lifetime A
  
  } // end of lifetime B
```

The reasons why this cannot be expressed in C’s grammar are clear when considering the compiler tasked with parsing the above text. Because whitespace is insignificant in C, the first `}` encountered will be identified as closing `lifetime B`, and so it can not be interpreted as ending `lifetime A`.

The inability of the grammar to express that concept is ultimately irrelevant, though (you can imagine a language’s syntax that _does_ make such a concept expressible)—what’s more interesting is the implications that this rule has on the “stack allocator”.

First what’s notable is that the concept of a _lifetime_ has become detached from individual allocations, and is now delimited _independently_ from allocations. When an allocation occurs (a variable is declared on the stack), its lifetime is chosen by virtue of which scope it is placed within. This is unlike `malloc` and `free`, which offers per-individual-allocation lifetime control. This allows an individual lifetime to be used to group _many_ allocations into a single common case. Note that, additionally, this fits the “asymmetric allocation and deallocation” pattern I mentioned earlier—allocations can occur within a scope in sporadic ways, but all end together simultaneously (quite similar to the aforementioned “unloading a level in my game’s level editor” example).

Secondly, because of the rule that lifetimes within the stack may only exist entirely within other lifetimes, implementing a stack allocator is trivial. All you need is a single block of memory and a single integer:

```angelscript
U8 *stack_memory = ...;
U64 stack_alloc_pos = ...;

// allocating 64 bytes on the stack:
void *ptr = stack_memory + stack_alloc_pos; // `ptr` points to 64 bytes
stack_alloc_pos += 64;

// popping 64 bytes from the stack:
stack_alloc_pos -= 64;
```

To create a “sub-lifetime”, the “allocation position” (`stack_alloc_pos`) needs to simply be remembered _before_ the sub-lifetime begins, and then it must be restored when the sub-lifetime ends:

```nix
U8 *stack_memory = ...;
U64 stack_alloc_pos = ...;

U64 restore_stack_alloc_pos = stack_alloc_pos;
{
  // in here, increment stack_alloc_pos as needed!
}
stack_alloc_pos = restore_stack_alloc_pos;
```

You can also imagine “freeing” _everything_ in the entire stack block, just by setting `stack_alloc_pos` to `0`.

The above is expressed in C syntax, but if you dig into what stack allocation _actually means_ at the assembly level, you’ll find that C’s stack is implemented much like this. Notice how computationally trivial it is to perform both allocations and deallocations on the stack.

That is all well and good, and it’s great that the stack is so simple, and that it’s trivial to use it. But the stack is not an option in many cases—that is, after all, why `malloc` and `free` are often used as “the alternative”.

_Why is the stack not an option in some cases, though_?

## When The Stack Fails

Let’s form an example where the stack would simply not work. Let’s start with the simplest example:

[![](https://proxy-prod.omnivore-image-cache.app/386x209,seAwv55AL5fRWax2SGFb9b91lVehvqNlbIqqECyEHnK8/https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7645f757-da4b-47b6-b700-fa051c3fd0fb_386x209.png)](https://substackcdn.com/image/fetch/f%5Fauto,q%5Fauto:good,fl%5Fprogressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7645f757-da4b-47b6-b700-fa051c3fd0fb%5F386x209.png)

In the above image, I’m _beginning_ a lifetime at the red `{` character, and _ending_ that lifetime at the red `}` character. This clearly breaks the rules of the stack, because the lifetime I am attempting to form does not fit within the _parent lifetimes_ I am attempting to begin or end the lifetime within.

Note that _this lifetime can still be expressed_ in this timeline! I would simply need to begin the lifetime _several ancestor scopes higher_, and end the lifetime at that same level. But, doing that is often _still_ not an option, because of _composability_.

In the below picture, the top red rectangle delimits _one layer_ of code, and the bottom delimits _another layer_ of code. Imagine that the top layer is some high-level application code, and the bottom layer is a helper library for parsing a file format.

[![](https://proxy-prod.omnivore-image-cache.app/702x194,szzR-7FA7hVQbEL97qtK7lDbpFkMRv3b3yDAvUxgJ8nA/https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fac7969bb-7204-46da-91b1-1edc93cd52b0_702x194.png)](https://substackcdn.com/image/fetch/f%5Fauto,q%5Fauto:good,fl%5Fprogressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fac7969bb-7204-46da-91b1-1edc93cd52b0%5F702x194.png)

Memory allocation is almost always coupled with the particular details of a task, and this is especially true in parsing, so in order for the _application code_ (top) to call into the _parsing code_ (bottom), the _application code_ would need to do all of the memory allocation, somehow without doing any of the work involved in usefully using or filling that memory.

While that may be in principle feasible (even though in many practical scenarios, it’s _not_ feasible), we can still form a case that is _not_ theoretically feasible at all, by introducing another overlapping lifetime:

[![](https://proxy-prod.omnivore-image-cache.app/702x194,sLrUtgtusdnpf1Q-dQ-M1ngwXp_EVMHxcAePPLZ5DTHY/https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F9bb24b7d-6cc2-4bd8-b694-858cbb910a82_702x194.png)](https://substackcdn.com/image/fetch/f%5Fauto,q%5Fauto:good,fl%5Fprogressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F9bb24b7d-6cc2-4bd8-b694-858cbb910a82%5F702x194.png)

In this case, it’s impossible to keep the same order of events, while keeping both lifetimes in the same stack. In cases like this, the stack stops being an option.

But now, consider this: can you tackle the same lifetime problems as above, but _with the ability to construct as many independent stacks as you need_? The answer being “yes, of course”—now, solving each problem is trivial. Some lifetimes must simply belong to different stacks than others.

This is the approach of the arena allocator: take the absurdly simple linear allocator, which offers lightning fast allocation and deallocation, eliminating per-allocation freeing requirements, first being proved out by the stack, and make that a formal allocator concept—the “arena”. Usage code can make as many arenas as necessary, and choose them at will for specific allocations.

An arena allocator’s fundamental API, then, may look like this:

```reasonml
// create or destroy a 'stack' - an "arena"
Arena *ArenaAlloc(void);
void ArenaRelease(Arena *arena);

// push some bytes onto the 'stack' - the way to allocate
void *ArenaPush(Arena *arena, U64 size);
void *ArenaPushZero(Arena *arena, U64 size);

// some macro helpers that I've found nice:
#define PushArray(arena, type, count) (type *)ArenaPush((arena), sizeof(type)*(count))
#define PushArrayZero(arena, type, count) (type *)ArenaPushZero((arena), sizeof(type)*(count))
#define PushStruct(arena, type) PushArray((arena), (type), 1)
#define PushStructZero(arena, type) PushArrayZero((arena), (type), 1)

// pop some bytes off the 'stack' - the way to free
void ArenaPop(Arena *arena, U64 size);

// get the # of bytes currently allocated.
U64 ArenaGetPos(Arena *arena);

// also some useful popping helpers:
void ArenaSetPosBack(Arena *arena, U64 pos);
void ArenaClear(Arena *arena);
```

Notice that, _at the limit_, this allocator becomes equivalent to `malloc` and `free`. To see this, consider that each `malloc` and `free` can simply be identified as beginning and ending their own little “stack”, where it’s only used for a single allocation. Using an arena in such a way—while it works—is not where this style of allocator will make an obvious difference.

The key point, I’ve found, is that _in virtually every case_, programs do not operate at such a limit. You don’t form a new scope for each new variable you declare on the stack—similarly, you don’t need an arena for each new allocation with a stack-breaking lifetime requirement. In almost every case, _a large number of allocations_ can be bucketed into the _same arena_. And in those cases, once your arenas are set up accordingly, the requirement to _deallocate any allocation_ disappears (other than the deallocation of the arena in its entirety, if required). Once you’ve performed an allocation, you’ve chosen an arena, and by virtue of that, the allocation’s corresponding memory will be made available again in accordance with the _arena’s_ overarching lifetime.

By getting _just a bit more organized_ about which arena we choose for an allocation, we’ve freed ourselves from the burden of `free`ing all of our dynamic allocations. We’ve also made it much easier to, for instance, track memory usage in our application, or bucket all allocations for a particular purpose, which may be useful for debugging or performance—we now have a fairly obvious path to determine which arena a given allocation is _within_, and to free _all_ allocations in any arena we choose, irrespective of _who_ pushed _what_ onto the arena, _when_, and _in what order_.

A very high level description of an arena is “a handle to which allocations are bound”. When an allocation occurs, it is “bound” to an “arena handle”. This makes it easily expressible to, for instance, clear all allocations “bound” to an “arena handle”.

## Arena Parameterization

One useful property of arenas is that they gracefully propagate through several layers in a codebase. This occurs through the parameterization of codepaths with the arena they use to perform allocations.

```pgsql
// the function is *asking the user* where to allocate
ComplexStructure *MakeComplexStructure(Arena *arena);
```

It is trivial, then, to identify which functions are performing allocations. And because, in an API like the above, the arena is a required parameter, the caller must choose an arena, and thus determine the lifetime of any persistent allocations.

For instance, imagine that there is a file format which encodes a tree structure (like JSON, or [Metadesk](https://dion.systems/metadesk)). A parser for that file format will produce a complex tree structure, perhaps with pointers linking various tree nodes together. With arenas, that parsing API can be a function that takes `(Arena*, String8)` → `(Node)` (where a single `Node` contains pointers to, for instance, its children nodes). The _usage code_ passes an arena where it’d like the results allocated, instead of—for instance—having to carefully free the resultant structure at a later time. By choosing an arena, the freeing work is complete.

This simplifies _all codepaths_ in this system. The parsing code becomes simpler, because it does not have to have any cleanup code whatsoever.The calling code becomes simpler, because it does not have to manage the lifetime of the parsed tree independently. And finally, the allocator code itself remains nearly trivial, and lightning fast.

Contrast this with a `malloc`\-style interface propagated throughout the system. Because of the allocator’s _assumption_ of arbitrary lifetimes and arbitrary sizes, the allocator code itself becomes more complex (it is a generic heap-style allocator); the calling code becomes more complex (it must manage the lifetime of the parsed structure); and the parser code becomes more complex (it must provide a careful freeing routine). So, this is not merely a _choice_—the arena solution is simpler and faster by _every important metric_.

## Composition With More Complex Allocators

As I’ve mentioned, a key concept behind the arena is _grouping lifetimes together_. But that, sometimes, is not as simple as it seems.

For instance, imagine I’ve allocated storage for 1,000 entities in my game’s level editor on an arena. But now, I’d like to go and _remove one_ out of the middle. If each entity were `malloc`’d, then all I would need to do is `free` the allocation for the entity in the middle. But if that storage is directly on an arena, how might that work?

Recall what “freeing memory” _literally means_—it means informing whatever allocator you allocated memory from that _the memory you allocated is now available_ for future allocations, and you don’t plan on using anymore (at least, before allocating something new).

This desired behavior—of reusing memory that has been released—is still possible with an arena. To demonstrate the concept, I’ll provide a simple _growable pool allocator_ implementation _that composes with an arena_.

A pool allocator only offers allocations of a fixed size, but with each allocation having an arbitrarily-different lifetime from all other allocations. So, it’s much simpler to implement than a fully generic `malloc`\-style allocator, which makes it useful to demonstrate my point of “compositions with arenas”. That being said, keep in mind that `malloc`\-style allocators can _still_ be implemented as a composition with an arena—I’ve implemented a number of more sophisticated allocators as compositions with arenas, including `malloc`\-style allocators, a quad-tree allocator, and others.

But in any case, here is what a simple pool allocator will look like:

```xl
struct Entity
{
  Entity *next;
  Vec2F32 position;
  Vec2F32 velocity;
  // some more stuff in here
};

struct GameState
{
  Arena *permanent_arena;
  Entity *first_free_entity;
};

Entity *EntityAlloc(GameState *game_state)
{
  // first, try to grab the top of the free list...
  Entity *result = game_state->first_free_entity;
  if(result != 0)
  {
    game_state->first_free_entity = game_state->first_free_entity->next;
    MemoryZeroStruct(result);
  }

  // if the free list was empty, push a new entity onto the arena
  else
  {
    result = PushStructZero(game_state->permanent_arena, Entity);
  }

  return result;
}

void EntityRelease(GameState *game_state, Entity *entity)
{
  // releasing -> push onto free list. next allocation
  // will take the top of the free list, not push onto
  // the arena.
  entity->next = game_state->first_free_entity;
  game_state->first_free_entity = entity;
}
```

## A Survey Of Arena Specializations

Arenas are an extremely versatile building block. To aid in furthering understanding of just how versatile they are, I’ve gathered a number of scenarios—perhaps non-obvious to some readers—in which an arena clicks perfectly into place.

### Frame Arenas

In games and graphical applications, programs are organized at a top-level by a loop. This loop performs the same operations repeatedly, in order to communicate to the user, and receive information from the user. On each iteration of this loop, a _frame_ is produced.

It’s very common to have per-frame concepts in this scenario. For instance, you might be building a user interface every frame, or producing a batch of drawing commands. In such cases, it’s useful to have a lifetime that exists for the duration of a single frame. This can easily be implemented with an arena. The arena itself would be allocated permanently, but at the beginning of each frame, it has its allocation counter reset to 0 (e.g. via the `ArenaClear` API I described above). So, if in application code you’d like to dynamically allocate a few complicated strings for the purposes of rendering, you can simply use the frame arena, and know that the memory will be released at an appropriate time.

It’s also very common to refer to the _previous frame’s_ state on any given frame. This can be done with a simple extension to the “frame arena” idea—instead of having a single frame arena, have _two_, and switch between them each frame (in effect, “double-buffering” the frame arena). This allows safe references to the prior frame’s state.

### Per-Thread Scratch Arenas

You may now see that the stack, as it is normally understood in C, is almost like a specialized per-thread arena. It’s very common to use the stack as a sort of “scratch arena”, by “pushing” (declaring) a temporary buffer in a local scope, and using it to do some useful work. While that is ultimately true, there are a few limitations of the stack that make it underpowered.

First of all, the stack is coupled with the _call stack_—so it’s not possible to, for example, push something onto the stack, and return back to a function’s caller, while keeping that allocation there (without making some brittle assumptions that inevitably break).

Secondly, the stack cannot compose with any code you’ve written that uses arenas. So if you’d like to, for instance, call a function with a signature like `Node *ParseString(Arena *arena, String8 string)`, there isn’t really a way to tell the function to use the _stack_—it is written to use `arena`.

This is where _per-thread scratch arenas_ become useful. These are simply thread-local arenas, which can be retrieved at any time. They can then be used with the “temporary sub-lifetime” trick I introduced earlier, with an additional API layered over the core arena API:

```cpp
struct ArenaTemp
{
  Arena *arena;
  U64 pos;
};

ArenaTemp ArenaTempBegin(Arena *arena); // grabs arena's position
void ArenaTempEnd(ArenaTemp temp);      // restores arena's position
```

The API to retrieve a scratch arena, then, can _almost_ be the following:

```reasonml
ArenaTemp GetScratch(void); // grabs a thread-local scratch arena
#define ReleaseScratch(t) ArenaTempEnd(t)
```

Although the above is not quite sufficient. The reason why is quite subtle, but let me explain with an example:

```reasonml
void *FunctionA(Arena *arena)
{
  ArenaTemp scratch = GetScratch();
  void *result = PushArrayZero(arena, U8, 1024);
  // fill result...
  ReleaseScratch(scratch);
  return result;
}

void FunctionB(void)
{
  ArenaTemp scratch = GetScratch();
  void *result = FunctionA(scratch.arena);
  // use result
  ReleaseScratch(scratch);
}
```

Notice that, in the above case, if there is only a single per-thread scratch arena, both `FunctionA` _and_ `FunctionB` grab the _same scratch arena_. The difference is that, in `FunctionA`, it is treating `scratch.arena` _differently_ than `arena`. `scratch.arena` is an arena it’s using for temporary work that it expects to disappear before returning—`arena` is where it is allocating _persistent results_ for the caller.

But, because `scratch.arena` _is_ `arena`, the result memory is actually freed before returning to the caller.

So, another rule must be adopted. When `GetScratch` is called, it must take any arenas being used for _persistent_ allocations, to ensure that it returns a different arena, to avoid mixing _persistent_ allocations with _scratch_ allocations. The API, then, becomes the following:

```reasonml
ArenaTemp GetScratch(Arena **conflicts, U64 conflict_count); // grabs a thread-local scratch arena
#define ReleaseScratch(t) ArenaTempEnd(t)
```

If only a single “persistent” arena is present at any point in any codepath (e.g. a caller never passes in two arenas), then you will not need more than two scratch arenas. Those two scratch arenas can be used for arbitrarily-deep call stacks, because each frame in any call stack will _alternate_ between using a single arena for persistent allocations, and the other for scratch allocations.

This issue is, as I said, very subtle, and it does require an extra rule that makes scratch arenas _slightly more complex_ to use correctly. But, the day-to-day habit of using scratch arenas is still not particularly difficult to follow: “If you want a scratch arena, and an arena is already in scope for persistent allocations, then pass it into `GetScratch`. If you _introduce_ an arena parameterization into an already-written codepath, then find all instances of `GetScratch` and update them accordingly”.

### Dynamic Array Arenas

As I’ll explain in the _Implementation Notes_, an arena implementation can have a strategy for _growing_ and _shrinking_ (while not relocating existing allocations). This makes them useful for storing collections of information where the size is not known upfront.

Depending on the exact growth strategy, this either makes arenas a suitable _replacement_ for dynamic arrays, _or_ a perfect implementation of one. Because the specifics of this style of arena usage are tightly coupled with implementation details, I’ll just mention this for now, and hopefully the _Implementation Notes_ will illuminate the parts I’m glossing over at the moment.

## Implementation Notes

I’ve already introduced the basic mechanism for implementing an arena, when I described how the stack works. An arena works in precisely the same way (although you can play with the details—for example, auto-aligning allocations).

There is one aspect I’ve not yet covered, however, which is _what happens when the arena runs out of storage_. There are a number of strategies one might employ in tackling this scenario, depending on their particular case.

One strategy is to simply pre-allocate a single fixed-size block of memory for an arena, and abort when storage runs out, because the project has strict memory usage requirements (if it’s, for example, on an embedded device).

The more common case, though, is that you’re writing code for, say, a modern consumer desktop computer, or a modern game console. In this case, it’s much easier to have a strategy for _growing the arena’s storage_ when it runs out.

One strategy is to spread the arena across a variably-sized linked list of large blocks. If there is not enough room for a new allocation on an arena, your implementation falls back to asking the operating system for a new block, and then begins allocating on the new block. When the arena’s allocation position is pushed far back enough, it can return to the previous block. This notably, eliminates the guarantee of _memory contiguity_ within the arena, which makes the arena unusable for implementing a dynamic array, because a dynamic array can be trivially accessed with a single offset into a single block. In this case, to access an arbitrary offset in the storage, you first would need to scan the chain of blocks. This is likely not prohibitively expensive, and the exact performance characteristics can be tweaked by changing the block size—but it does mean using it is more nuanced than just a single block of memory.

Another fancier strategy is to take advantage of modern MMUs and 64-bit CPUs (which are virtually ubiquitous these days). On modern PCs, for instance, it’s likely that you have 48 bits (256 terabytes!) of virtual address space at your disposal. This means, functionally, that you can still have arenas _both_ grow dynamically, _and_ work with just a single block (and thus maintain the guarantee of memory contiguity). Instead of committing _physical storage_ for the entire block upfront (e.g. by using `malloc` for the storage), the implementation simply _reserves_ _the_ _address range_ in your virtual address space (e.g. by using `VirtualAlloc` on Windows). Then, when the arena reaches a new page in the _virtual address space range_ that has not been backed by physical memory, it will request more physical memory from the operating system. In this case, you still must decide on an upper-bound for your arena storage, but because of the power of exponentiation, this upper-bound can be ridiculously large (say, 64 gigabytes). So, in short, reserve a massive upper-bound of contiguous virtual address space, then commit physical pages as needed.

Finally, it’s easy to compose all of the above strategies, or make them all available in various scenarios, through the same API. So, don’t assume they’re mutually exclusive!

Before choosing any strategy, carefully consider which platforms you’re writing for, and the real constraints on your solution. For example, my understanding is that the Nintendo Switch has 38 bits of virtual address space. The magic growing arena can still _work_ here, but you’ll have a tighter constraint on address space.

## Closing Thoughts

Learning how to work with arenas entirely revolutionized my experience with writing code in C. I almost never think about memory management, these days—it is not particularly more cumbersome than writing in a garbage-collected scripting language. Unlike such a language, however, I know where my memory is coming from, and when it’ll be “released”, and what that even means.

Making memory management dramatically easier didn’t take a gigantic, complex compiler, it didn’t take a garbage collector, and it didn’t require sacrificing contact with the lower level. It was, actually, precisely the opposite—it came through _harmonizing_ the lower level requirements _with_ the higher level requirements, and considering the problem from first principles. It is for this reason that I strongly dislike the average modern programmer’s conception of “high-level vs. low-level”, and how the “lower level details” are considered gross, inconvenient, and annoying. The lower level details are nothing to shy away from—they’re a necessary part of the reality of the problem, and by giving them their due time, both high-level code and low-level code can benefit.

I hope this post provided a useful expansion to your programming toolbox. Good luck programming!

_**Note:** The application template repository in my [Code Depot](https://git.rfleury.com/)—available only to paid subscribers—contains an example arena implementation following the strategies mentioned in this post._

If you enjoyed this post, please consider subscribing. Thanks for reading.

\-Ryan



# links
[Read on Omnivore](https://omnivore.app/me/untangling-lifetimes-the-arena-allocator-by-ryan-fleury-18eaf46f0dd)
[Read Original](https://www.rfleury.com/p/untangling-lifetimes-the-arena-allocator)

<iframe src="https://www.rfleury.com/p/untangling-lifetimes-the-arena-allocator"  width="800" height="500"></iframe>
