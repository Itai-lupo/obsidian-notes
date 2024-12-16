---
id: 30de7ea4-6d1b-11ee-94c9-3340a1218723
title: Helping the compiler
tags:
  - programing
  - Data-Oriented_Design
date: 2023-10-17 21:30:04
date_published: 2018-10-08 03:00:00
words_count: 4264
state: INBOX
---

# Helping the compiler by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Helping the compiler


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  
**Subsections** 
* [Reducing order dependence](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001010000000000000000)
* [Reducing memory dependency](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001020000000000000000)
* [Write buffer awareness](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001030000000000000000)
* [Aliasing](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001040000000000000000)
* [Return value optimisation](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001050000000000000000)
* [Cache line utilisation](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001060000000000000000)
* [False sharing](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001070000000000000000)
* [Speculative execution awareness](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001080000000000000000)
* [Branch prediction](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION001090000000000000000)
* [Don't get evicted](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION0010100000000000000000)
* [Auto vectorisation](https://www.dataorienteddesign.com/dodbook/node10.html#SECTION0010110000000000000000)

---

Compilers are rather good at optimising code, but there are ways in which we code that make things harder. There are tricks we use that break assumptions the compiler can make. In this section, we will look at some of the things we do that we should try not to, and we look at how to introduce some habits that will make it easier for the compiler to do what we mean, not what we say.

## Reducing order dependence 

If the compiler is unable to deduce that the order of operations is not important to you, then it won't be able to do work ahead of schedule. When composing the translated code into intermediate representation form, there's a quality some compilers use called static single assignment form, or SSA. The idea is that you never modify variables once they are initially assigned, and instead create new ones when a modification becomes required. Although you cannot actually use this in loops, as any operations which carry through would require the assigned value to change, you can get close to it, and in doing so, you can help the compiler understand what you mean when you are modifying and assigning values. Skimming the available features and tutorials in languages such as Haskell, Erlang, and Single-Assignment C can give you the necessary hints to write your code in a single assignment manner.

Writing code like this means you will see where the compiler has to branch more easily, but also, you can make your writes more explicit, which means that where a compiler might have had to break away from writing to memory, you can force it to write in all cases, making your processing more homogeneous, and therefore more likely to stream better.

## Reducing memory dependency 

Linked lists are expensive due to dependencies, but dependencies of a different sort. Memory being slow, you want to be able to load it in time for your operations, but when the address you need to load is itself still being loaded, you can't cheat anymore. Pointer driven tree algorithms are slow, not because of the memory lookups, but because the memory lookups are chained together.

If you want to make your map or set implementation run faster, move to a wide node algorithm such as a B-tree, or B\*-tree. Hopefully, at some point soon, the STL will allow you to chose the method by which std::map andstd::set are implemented.

When you have an entity component system using the compositional style, and you have a pointer based composition, then the two layers of pointers to get to the component is slowing you down. If you have pointers inside those components, you're just compounding the problem.

Attempt where possible to reduce the number of hops to get to the data you need. Each hop that depends on previous data is potentially a stall waiting for main memory.

## Write buffer awareness 

When writing, the same issues need to be considered as when reading. Try to keep things contiguous where possible. Try to keep modified values separated from read-only values, and also from write-only values.

In short, write contiguously, in large amounts at a time, and use all the bytes, not a small part of them. We need to try to do this, as not only does it help with activation and deactivation of different memory pages, but also opens up opportunities for the compiler to optimise.

When you have a cache, sometimes it's important to find ways to bypass it. If you know that you won't be using the data you're loading more than once or at least not soon enough to benefit from caching, then it can be useful to find ways to avoid polluting the cache. When you write your transforms in simple ways, it can help the compiler promote your operations from ones which pollute the cache, to instructions that bypass the cache completely. These streaming operations benefit the caches by not evicting randomly accessed memory.

In the article What every programmer should know about memory\[#!WEPSKAM!#\], Ulrich Drepper talks about many aspects of memory which are interesting to get the most out of your computer hardware. In the article, he used the term non-temporality to describe the kinds of operations we call streaming. These non-temporal memory operations help because they bypass the cache completely, which naïvely would seem to be a poor choice, but as the name suggests, streaming data is not likely to be recalled into registers any time soon, so having it available in the cache is pointless, and merely evicts potentially useful data. Streaming operations, therefore, allow you some control over what you consider important to be in cache, and what is almost certainly not.

## Aliasing 

Aliasing is when it's possible for pointers to reference the same memory, and therefore require reloading between reads if the other pointer has been written to. A simple example could be where the value we're looking for is specified by reference, rather than by value, so if any functions that could potentially affect the memory being referred to by that lookup reference, then the reference must be re-read before doing a comparison. The very fact it is a pointer, rather than a value, is what causes the issue.

A reason to work with data in an immutable way comes in the form of preparations for optimisation. C++, as a language, provides a lot of ways for the programmer to shoot themselves in the foot, and one of the best is that pointers to memory can cause unexpected side effects when used without caution. Consider this piece of code:

  
![\begin{lstlisting}[caption=byte copying]
char buffer[ 100 ];
buffer[0] = 'X';
memcpy( buffer+1, buffer, 98 );
buffer[ 99 ] = '\0';
\end{lstlisting}](https://proxy-prod.omnivore-image-cache.app/590x92,sDL7WhHsE8A_FcEsWp9k0TRfnDMPd_-yneKU8bE0NSYw/https://www.dataorienteddesign.com/dodbook/img50.png)   

This is perfectly correct code if you just want to get a string filled with 99 'X's. However, because this is possible, memcpy has to copy one byte at a time. To speed up copying, you normally load in a lot of memory locations at once, then save them out once they are all in the cache. If your input data can be modified by writes to your output buffer, then you have to tread very carefully. Now consider this:

  
![\begin{lstlisting}[caption=trivially parallelisable code]
int q=10;
int p[10];
for( int i = 0; i < q; ++i )
p[i] = i;
\end{lstlisting}](https://proxy-prod.omnivore-image-cache.app/590x92,sTi1Zihxdg-MCaQ8k-EFkHzYlWgEQ6LaLodbBc8mpjUU/https://www.dataorienteddesign.com/dodbook/img51.png)   

The compiler can figure out that q is unaffected, and can happily unroll this loop or replace the check against q with a register value. However, looking at this code instead:

  
![\begin{lstlisting}[caption=potentially aliased int]
void foo( int* p, const int ...
...i < q; ++i)
p[i] = i;
}
\par
int q=10;
int p[10];
foo( p, q );
\end{lstlisting}](https://proxy-prod.omnivore-image-cache.app/590x162,sADhxorvaKWJTfdvpfYaehvvxrdUp7Op3UoGsYKbeM3A/https://www.dataorienteddesign.com/dodbook/img52.png)   

The compiler cannot tell that q is unaffected by operations on p, so it has to store p and reload q every time it checks the end of the loop. This is called aliasing, where the address of two variables that are in use are not known to be different, so to ensure functionally correct code, the variables have to be handled as if they might be at the same address.

## Return value optimisation 

If you want to return multiple values, the normal way is to return via reference arguments, or by filling out an object passed by reference. In many cases, return by value can be very cheap as many compilers can turn it into a non-copy operation.

When a function attempts to return a structure by constructing the value in place during the return, it is allowed to move the construction straight into the value that will receive it, without doing a copy at all.

Utilising std::pair or other small temporary structs can help by making more of your code run on value types, which are not only inherently easier to reason about, but also easier to optimise by a compiler.

## Cache line utilisation 

It is a truth universally acknowledged that a single memory request will always read in at least one complete cache line. That complete cache line will contain multiple bytes of data. At the time of writing this book, the most common cache line size seems to have stabilized at 64 bytes. With this information, we can speculate about what data will be cheap to access purely by their location relative to other data.

In Searching (Chapter [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](https://www.dataorienteddesign.com/dodbook/node7.html#chap:search)), we utilise this information to decide the location and quantity of data that is available for creating the rapid lookup table included in the example that uses a two-layer linear search that turns out to be faster than a binary search.

When you have an object you will be loading into memory, calculate the difference between a cache line and the size of the object. That difference is how much memory you have left to place data you can read for free. Use this space to answer the common questions you have about the class, and you will often see speedups as there will be no extra memory accesses.

For example, consider a codebase that partially migrated to components, and still has an entity class which points to optional rows in component arrays. In this case, we can cache the fact the entity has elements in those arrays in the latter part of the entity class as a bitset. This would mean the entity on entity interactions could save doing a lookup into the arrays if there was no matching row. It can also improve render performance as the renderer can immediately tell that there is no damage done, so will just show a full health icon or nothing at all.

In the example code in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:speculativewaste) in Chapter [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#chapter:sourcecode), an attempt is made to use more of an object's initial cache line to answer questions about the rest of the object, and you can see various levels of success in the results. In the case of fully caching the result, a massive improvement was gained. If the result cannot be quickly calculated and needs to be calculated on demand, caching that there was something to do was a factor of four improvement. Caching the result when you can, had differing levels of performance improvement, based on the likelihood of hitting a cached response. In all, using the extra data you have on your cache line is always an improvement over simple checking.

i5-4430 @ 3.00GHz
Average 11.31ms [Simple, check the map]
Average  9.62ms [Partially cached query (25%)]
Average  8.77ms [Partially cached presence (50%)]
Average  3.71ms [Simple, cache presence]
Average  1.51ms [Partially cached query (95%)]
Average  0.30ms [Fully cached query]

So, in summary, keep in mind, every time you load any memory at all, you are loading in a full cache line of bytes. Currently, with 64-byte cache lines, that's a 4x4 matrix of floats, 8 doubles, 16 ints, a 64 character ASCII string, or 512 bits.

## False sharing 

When a CPU core shares no resources with another, it can always operate at full speed independently, right? Well, sometimes no. Even if the CPU core is working on independent data, there are times it can get choked up on the cache.

On the opposite side of the same issue as writing linearly, when you are writing out data to the same cache line, it can interfere with threading. Due to the advancement of compilers, it seems this happens far less frequently than it should, and when attempting to reproduce the issue to give ideas on the effect it can have, only by turning off optimisations is it possible to witness the effect with trivial examples.

The idea is that multiple threads will want to read from and write to the same cache line, but not necessarily the same memory addresses in the cache line. It's relatively easy to avoid this by ensuring any rapidly updated variables are kept local to the thread, whether on the stack or in thread local storage. Other data, as long as it's not updated regularly, is highly unlikely to cause a collision.

There has been a lot of talk about this particular problem, but the real-world is different from the real-world problems supposed. Always check your problems are real after optimisation, as well as before, as even the high and mighty have fallen for this as a cause of massive grief.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={False sharing},label=src:FalseSharing]{src/HELP_FalseSharing.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x324,sDMG978FqAdcxvxaG7_rqK_D4d8kM9IIiwVtHCBAbuoA/https://www.dataorienteddesign.com/dodbook/img53.png)   

So, how can you tell if this problem is real or not? If your multi-threaded code is not growing at a linear rate of processing as you add cores, then you might be suffering from false sharing, look at the where your threads are writing, and try to remove the writes from shared memory where possible until the last step. The common example given is of adding up some arrays and updating the sum value in some global shared location, such as in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:FalseSharing).

In the FalseSharing function, the sums are written to as a shared resource, and each thread will cause the cache to clean up and handle that line being dirty for each of the other cores before they can update their elements in the cache line. In the second function, LocalAccumulator, each thread sums up their series before writing out the result.

## Speculative execution awareness 

Speculative execution helps as it executes instructions and prepares data before we arrive at where we might need them, effectively allowing us to do work before we know we need it, but sometimes it could have a detrimental effect. For example, consider the codebase mentioned previously, that had partially migrated to components. The bit arrays of which optional tables it was currently resident could lead, through speculation, to loading in details about those arrays. With speculative execution, you will need to watch out for the code accidentally prefetching data because it was waiting to find out the result of a comparison. These speculative operations have been in the news with SPECTRE and MELTDOWN vulnerabilities.

These branch prediction caused reads can be reduced by pre-calculating predicates where possible, storing the result of doing a common query in your rows is a big win for most machines and a massive one for machines with poor memory latency or high CPU bandwidth to memory bandwidth ratios. Moving to techniques where branch mispredictions cause the smallest side-effects to the data is a generally good idea. Even caching only when you can, storing the result back in the initial section, can save bandwidth over time.

In the cache line utilisation section, the numbers showed that the possibility of getting data seemed to affect how fast the process went, much more than it would be expected, which leads to a belief that speculative loads of unnecessary data were potentially harming overall throughput.

Even if all you are able to cache is whether a query will return a result, it can be beneficial. Avoiding lookups into complex data structures by keeping data on whether or not there are entries matching that description can give speed boosts with very few detrimental side-effects.

## Branch prediction 

One of the main causes of stalling in CPUs comes down to not having any work to do, or having to unravel what they have already done because they predicted badly. If code is speculatively executed, and requests memory that is not needed, then the load has become a wasteful use of memory bandwidth. Any work done will be rejected and the correct work has to be started or continued. To get around this issue, there are ways to make code branch free, but another way is to understand the branch prediction mechanism of the CPU and help it out.

If you make prediction trivial, then the predictor will get it right most of the time. If you ensure the conditions are consistently true or false in large chunks, the predictor will make fewer mistakes. A trivial example such as in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:trivialbranch) will predict to either do or not do the accumulation, based on the incoming data. The work being done here can be optimised away by most compilers using a conditional move instruction if the CPU supports it. If you make the work done a little more realistic, then even with full optimisations turned on, you can see a very large difference[9.1](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2533) if you can sort the data so the branches are much more predictable. The other thing to remember is that if the compiler can help you, let it. The optimised trivial example is only trivial in comparison to other common workloads, but if your actual work is trivially optimised into a conditional execution, then sorting your data will be a waste of effort.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Doing work based on data},label=src:trivialbranch]{src/HELP_Branch.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/590x127,sy3ExXueBiO75xgq0r01dOBpqOEvSBcflyrp4TrNtB0A/https://www.dataorienteddesign.com/dodbook/img54.png)   

i5-4430 @ 3.00GHz
Average  4.40ms [Random branching]
Average  1.15ms [Sorted branching]
Average  0.80ms [Trivial Random branching]
Average  0.76ms [Trivial Sorted branching]

Branching happens because of data, and remember the reason why branching is bad is not that jumps are expensive, but the work being done because of a misprediction will have to be undone. Because of this, it's valuable to remember that a vtable pointer is data too. When you don't batch update, you won't be getting the most out of your branch predictor, but even if you don't hit the branch predictor at all, you may still be committing to sequences of instructions based on data.

## Don't get evicted 

If you're working with others, as many are, then perhaps the simplest solution to a lot of issues with poor cache performance has to take into account other areas of the code. If you're working on a multi-core machine (you are, unless we went back in time), then there's a good chance that all processes are sharing and contending for the caches on the machine. Your code will be evicted from the cache, there is no doubt. So will your data. To reduce the chance or frequency of your code and data being evicted, keep both code and data small and process in bursts when you can.

It's very simple advice. Not only is small code less likely to be evicted, but if it's done in bursts it will have had a chance to get a reasonable amount of work before being overwritten. Some cache architectures don't have any way to tell if the elements in the cache have been used recently, so they rely on when they were added as a metric for what should be evicted first. In particular, some Intel CPUs can have their L1 and L2 cache lines evicted because of L3 needing to evict, but L3 doesn't have full access to LRU information. The Intel CPUs in question have some other magic that reduces the likelihood of this happening, but it does happen.

To that end, try to find ways to guarantee to the compiler that you are working with aligned data, in arrays that are multiples of 4 or 8, or 16, so the compiler doesn't need to add preambles and postamble code to handle unaligned, or irregularly sized arrays. It can be better to have 3 more dead elements in an array and handle it as an array of length ![$ N * 4$](https://proxy-prod.omnivore-image-cache.app/41x15,s_ahxSBB0w9K0oiClO6I9Poo9NOS6NFcA0XlHKPiFg3Q/https://www.dataorienteddesign.com/dodbook/img55.png).

## Auto vectorisation 

Auto vectorisation will help your applications run faster just by enabling it and forming your code in such a way that it is possible for the compiler to make safe assumptions, and change the instructions from scalar to vector.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Trivial amplification function},label=src:AVamplify]{src/HELP_AutoVecTrivial.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/590x97,sYMJXTSEezcRDZ75Ch-7xTSlfGmkmAQHAU7836TEPil0/https://www.dataorienteddesign.com/dodbook/img56.png)   

There are many trivial examples of things which can be cleanly vectorised. The first example is found in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:AVamplify), which is simple enough to be vectorised by most compilers when optimisations are turned on. The issue is that there are few guarantees with the code, so even though it can be quite fast to process the data, this code will take up a lot more space than is necessary in the instruction cache.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Amplification funct...
...alignment hints},label=src:AVhinted]{src/HELP_AutoVecHinted.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/590x127,sDS36R9LPxHMtbckXa20-w7L-lFAjmcZWe9BU4UBhX2o/https://www.dataorienteddesign.com/dodbook/img57.png)   

If you can add some simple guarantees, such as by using aligned pointers, and by giving the compiler some guarantees about the number of elements, then you can cut the size of the emitted assembly, which on a per case basis won't help, but over a large codebase, it will increase the effectiveness of your instruction cache as the number of instructions to be decoded is slashed. Listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:AVhinted) isn't faster in isolated test beds, but the size of the final executable will be smaller, as the generated code is less than half the size. This is a problem with micro-benchmarks, they can't always show how systems work together or fight against each other. In real-world tests, fixing up the alignment of pointers can improve performance dramatically. In small test beds, memory throughput is normally the only bottleneck.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Breaking out, breaks vectorisation},label=src:AVbreak]{src/HELP_AutoVecCountable.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/594x147,sd145vPrLJAgFNvxEu8NbnOFvnwpLzi01spTDV5unP9E/https://www.dataorienteddesign.com/dodbook/img58.png)   

A thing to watch out for is making sure the loops are trivial and always run their course. If a loop has to break based on data, then it won't be able to commit to doing all elements of the processing, and that means it has to do each element at a time. In listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:AVbreak) the introduction of a break based on the data turns the function from a fast parallel SIMD operation auto-vectorisable loop, into a single stepping loop. Note that branching in and of itself does not cause a breakdown in vectorisation, but the fact the loop is exited based on data. For example, in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:AVpredicate), the branch can be turned into other operations. It's also the case that calling out to a function can often break the vectorisation, as side effects cannot normally be guaranteed. If the function is a constexpr, then there's a much better chance it can be consumed into the body of the loop, and won't break vectorisation. On some compilers, there are certain mathematical functions which are available in a vectorised form, such as min, abs, sqrt, tan, pow, etc. Find out what your compiler can vectorise. It can often help to write your series of operations out longhand to some extent, as trying to shorten the C++ code, can lead to slight ambiguities with what the compiler is allowed to do. One thing to watch out for in particular is making sure you always write out. If you only write part of the output stream, then it won't be able to write out whole SIMD data types, so write out to your output variable, even if it means reading it in, just to write it out again.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Vectorising an if},label=src:AVpredicate]{src/HELP_AutoVecPredicate.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/594x169,sE8m2rSZoCiNebH3IpapXXV7ox-46FD3TLGnjDs5TJwE/https://www.dataorienteddesign.com/dodbook/img59.png)   

Aliasing can also affect auto vectorisation, as when pointers can overlap, there could be dependencies between different members of the same SIMD register. Consider the listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:AValias), where the first version of the function increments each member by its direct neighbour. This function is pointless but serves us as an example. The function will create a pairwise sum all the way to the end float by float. As such, it cannot be trivially vectorised. The second function, though equally pointless, makes large enough steps that auto vectorisation can find a way to calculate multiple values per step.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Aliasing affecting vectorisation},label=src:AValias]{src/HELP_AutoVecAlias.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/594x170,sqoIu7zg7beiiGtWlIsObi44sZ_E7Agiz-ecx037snAU/https://www.dataorienteddesign.com/dodbook/img60.png)   

Different compilers will manage different amounts of vectorisation based on the way you write your code, but in general, the simpler you write your code, the more likely the compiler will be able to optimise your source.

Over the next decade, compilers will get better and better. Clang already attempts to unroll loops far more than GCC does, and many new ways to detect and optimise simple code will likely appear. At the time of writing, the online Compiler Explorer provided by Matt Godbolt[9.2](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2565), provides a good way to see how your code will be compiled into assembly, so you can see what can and will be vectorised, optimised out, rearranged, or otherwise mutated into the machine-readable form. Remember that the number of assembly instructions is not a good metric for fast code, that SIMD operations are not inherently faster in all cases, and measuring the code running cannot be replaced by stroking your chin[9.3](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2566)while thinking about whether the instructions look cool, and you should be okay.

Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  



# links
[Read on Omnivore](https://omnivore.app/me/helping-the-compiler-18b3ee6f22b)
[Read Original](https://www.dataorienteddesign.com/dodbook/node10.html)

<iframe src="https://www.dataorienteddesign.com/dodbook/node10.html"  width="800" height="500"></iframe>
