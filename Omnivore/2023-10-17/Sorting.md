---
id: 385a4988-6d1b-11ee-b5d3-93c68c182312
title: Sorting
tags:
  - programing
  - Data-Oriented_Design
date: 2023-10-17 21:30:17
date_published: 2018-10-08 03:00:00
words_count: 2699
state: INBOX
---

# Sorting by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Sorting


# content

Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  
**Subsections** 
* [Do you need to?](https://www.dataorienteddesign.com/dodbook/node8.html#SECTION00810000000000000000)
* [Maintaining](https://www.dataorienteddesign.com/dodbook/node8.html#SECTION00820000000000000000)
* [Sorting for your platform](https://www.dataorienteddesign.com/dodbook/node8.html#SECTION00830000000000000000)

---

For some subsystems, sorting is a highly important function. Sorting the primitive render calls so they render from front to back for opaque objects can have a massive impact on GPU performance, so it's worth doing. Sorting the primitive render calls so they render from back to front for alpha blended objects is usually a necessity. Sorting sound channels by their amplitude over their sample position is a good indicator of priority.

Whatever you need to sort for, make sure you need to sort first, as usually, sorting is a highly memory intense business.

## Do you need to? 

There are some algorithms which seem to require sorted data, but don't, and some which require sorted data but don't seem to. Be sure you know whether you need to before you make any false moves.

A common use of sorting in games is in the render pass where some engine programmers recommend having all your render calls sorted by a high bit count key generated from a combination of depth, mesh, material, shader, and other flags such as whether the call is alpha blended. This then allows the renderer to adjust the sort at runtime to get the most out of the bandwidth available. In the case of the rendering list sort, you could run the whole list through a general sorting algorithm, but in reality, there's no reason to sort the alpha blended objects with the opaque objects, so in many cases you can take a first step of putting the list into two separate buckets, and save some work overall. Also, choose your sorting algorithm wisely. With opaque objects, the most important part is usually sorting by textures then by depth, but that can change with how much your fill rate is being trashed by overwriting the same pixel multiple times. If your overdraw doesn't matter too much but your texture uploads do, then you probably want to radix sort your calls. With alpha blended calls, you just have to sort by depth, so choose an algorithm which handles your case best. Be aware of how accurately you need your data to be sorted. Some sorts are stable, others unstable. Unstable sorts are usually a little quicker. For analogue ranges, a quick sort or a merge sort usually offer slow but guaranteed accurate sorting. For discrete ranges of large ![$ n$](https://proxy-prod.omnivore-image-cache.app/13x16,sEcieC_1P3VSto4p4EBKjvIjB7IDWT-WMniFzrQQrAh4/https://www.dataorienteddesign.com/dodbook/img32.png), a radix sort is very hard to beat. If you know your range of values, then a counting sort is a very fast two pass sort, for example, sorting by material, shader, or other input buffer index.

When sorting, it's also very important to be aware of algorithms that can sort a range only partially. If you only need the lowest or highest![$ n$](https://proxy-prod.omnivore-image-cache.app/13x16,sEcieC_1P3VSto4p4EBKjvIjB7IDWT-WMniFzrQQrAh4/https://www.dataorienteddesign.com/dodbook/img32.png) items of an ![$ m$](https://proxy-prod.omnivore-image-cache.app/18x16,sUbEweOBc0rOl2zX6jIgU1IY49m7fYU-FnY2mjIcg8Bo/https://www.dataorienteddesign.com/dodbook/img33.png) long array, you can use a different type of algorithm to find the ![$ n^$](https://proxy-prod.omnivore-image-cache.app/14x16,sB7rPByF3__H76yCfyRp0WBDCuqcZx8R0KCXiN6_kE90/https://www.dataorienteddesign.com/dodbook/img34.png)th item, then sort all the items greater or less than the returned pivot. In some selection algorithms you will end with some guarantees about the data. Notably, quickselect will result in the ![$ n^$](https://proxy-prod.omnivore-image-cache.app/14x16,sB7rPByF3__H76yCfyRp0WBDCuqcZx8R0KCXiN6_kE90/https://www.dataorienteddesign.com/dodbook/img34.png)th item by sorting criteria residing in the ![$ n^$](https://proxy-prod.omnivore-image-cache.app/14x16,sB7rPByF3__H76yCfyRp0WBDCuqcZx8R0KCXiN6_kE90/https://www.dataorienteddesign.com/dodbook/img34.png)th position. Once complete, all items either side remain unsorted in their sub-ranges, but are guaranteed to be less than or more than the pivot, depending on the side of the pivot they fall.

If you have a general range of items which need to be sorted in two different ways, you can either sort with a specialised comparison function in a one-hit sort, or you can sort hierarchically. This can be beneficial when the order of items is less important for a subset of the whole range. The render queue is still a good example. If you split your sort into different sub-sorts, it makes it possible to profile each part of the sort, which can lead to beneficial discoveries.

You don't need to write your own algorithms to do this either. Most of the ideas presented here can be implemented using the STL, using the functions in algorithms. You can use std::partial\_sort to find and sort the first![$ n$](https://proxy-prod.omnivore-image-cache.app/13x16,sEcieC_1P3VSto4p4EBKjvIjB7IDWT-WMniFzrQQrAh4/https://www.dataorienteddesign.com/dodbook/img32.png) elements, you can use std::nth\_element to find the ![$ n^$](https://proxy-prod.omnivore-image-cache.app/14x16,sB7rPByF3__H76yCfyRp0WBDCuqcZx8R0KCXiN6_kE90/https://www.dataorienteddesign.com/dodbook/img34.png)th value as if the container was sorted. Using std::partition andstd::stable\_partition allow you to split a range by a criteria, effectively sorting a range into two sub-ranges. 

It's important to be aware of the contracts of these algorithms, as something as simple as the erase/remove process can be very expensive if you use it without being aware that remove will shuffle all your data down, as it is required to maintain order. If there was one algorithm you should add to your collection, it would be your own version of remove which does not guarantee maintaining order. Listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:unstableremove) shows one such implementation.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={A basic implementat...
...table\_remove}},label=src:unstableremove]{src/SORT_unstable.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/594x137,s-R6_PsyEpaV-0wKuxqdVgp2om8TeLsND-1NlPftydIE/https://www.dataorienteddesign.com/dodbook/img35.png)   

## Maintain by insertion sort or parallel merge sort 

Depending on what you need the list sorted for, you could sort while modifying. If the sort is for some AI function that cares about priority, then you may as well insertion sort as the base heuristic commonly has completely orthogonal inputs. If the inputs are related, then a post insertion table wide sort might be in order, but there's little call for a full-scale sort.

If you really do need a full sort, then use an algorithm which likes being parallel. Merge sort and quick sort are somewhat serial in that they end or start with a single thread doing all the work, but there are variants which work well with multiple processing threads, and for small datasets there are special sorting network techniques which can be faster than better algorithms just because they fit the hardware so well[7.1](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2024).

## Sorting for your platform 

Always remember that in data-oriented development you must look to the data for information before deciding which way you're going to write the code. What does the data look like? For rendering, there is a large amount of data with different axes for sorting. If your renderer is sorting by mesh and material, to reduce vertex and texture uploads, then the data will show that there are a number of render calls which share texture data, and a number of render calls which share vertex data. Finding out which way to sort first could be figured out by calculating the time it takes to upload a texture, how long it takes to upload a mesh, how many extra uploads are required for each, then calculating the total scene time, but mostly, profiling is the only way to be sure. If you want to be able to profile and get feedback quickly or allow for runtime changes in case your game has such varying asset profiles that there is no one solution to fit all, having some flexibility of sorting criteria is extremely useful and sometimes necessary. Fortunately, it can be made just as quick as any inflexible sorting technique, bar a small setup cost.

Radix sort is the fastest serial sort. If you can do it, radix sort is very fast because it generates a list of starting points for data of different values in a first pass, then operates using that data in a second pass. This allows the sorter to drop their contents into containers based on a translation table, a table that returns an offset for a given data value. If you build a list from a known small value space, then radix sort can operate very fast to give a coarse first pass. The reason radix sort is serial, is that it has to modify the table it is reading from in order to update the offsets for the next element that will be put in the same bucket. If you ran multiple threads giving them part of the work each, then you would find they were non-linearly increasing in throughput as they would be contending to write and read from the same memory, and you don't want to have to use atomic updates in your sorting algorithm.

It is possible to make this last stage of the process parallel by having each sorter ignore any values it reads which are outside its working set, meaning each worker reads through the entire set of values gathering for their bucket, but there is still a small chance of non-linear performance due to having to write to nearby memory on different threads. During the time the worker collects the elements for its bucket, it could be generating the counts for the next radix in the sequence, only requiring a summing before use in the next pass of the data, mitigating the cost of iterating over the whole set with every worker.

If your data is not simple enough to radix sort, you might be better off using a merge sort or a quicksort, but there are other sorts that work very well if you know the length of your sortable buffer at compile time, such as sorting networks. Through merge-sort is not itself a concurrent algorithm, the many early merges can be run in parallel, only the final merge is serial, and with a quick pre-parse of the to-be-merged data, you can finalise with two threads rather than one by starting from both ends (you need to make sure the mergers don't run out of data). Though quick sort is not a concurrent algorithm each of the substages can be run in parallel. These algorithms are inherently serial, but can be turned into partially parallelisable algorithms with ![$ \mathcal{O}(\log{}n)$](https://proxy-prod.omnivore-image-cache.app/62x31,sHzj7CX8w-Vy43hi46M6ldKbsk7v271uDa7aFMoFZWV4/https://www.dataorienteddesign.com/dodbook/img4.png)latency.

When your n is small enough, a traditionally good technique is to write an in-place bubble sort. The algorithm is so simple, it is hard to write wrong, and because of the small number of swaps required, the time taken to set up a better sort could be better spent elsewhere. Another argument for rewriting such trivial code is that inline implementations can be small enough for the whole of the data and the algorithm to fit in cache[7.2](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2017). As the negative impact of the inefficiency of the bubble sort is negligible over such a small ![$ n$](https://proxy-prod.omnivore-image-cache.app/13x16,sEcieC_1P3VSto4p4EBKjvIjB7IDWT-WMniFzrQQrAh4/https://www.dataorienteddesign.com/dodbook/img32.png), it is hardly ever frowned upon to do this. In some cases, the fact that there are fewer instructions can be more important than the operational efficiency, as instruction eviction could cost more than the time saved by the better algorithm. As always, measure so you can be certain.

If you've been developing data-oriented, you'll have a transform which takes a table of ![$ n$](https://proxy-prod.omnivore-image-cache.app/13x16,sEcieC_1P3VSto4p4EBKjvIjB7IDWT-WMniFzrQQrAh4/https://www.dataorienteddesign.com/dodbook/img32.png) and produces the sorted version of it. The algorithm doesn't have to be great to be better than bubble sort, but notice it doesn't cost any development time to use a better algorithm as the data is in the right shape already. Data-oriented development naturally leads us to reuse of good algorithms.

When looking for the right algorithm, it's worth knowing about more than you are presented during any coursework, and look into the more esoteric forms. For sorting, sometimes you want an algorithm that always sorts in the same amount of time, and when you do, you can't use any of the standard quick sorts, radix sorts, bubble or other. Merge sort tends to have good performance, but to get truly stable times when sorting, you may need to resort to sorting networks.

Sorting networks work by implementing the sort in a static manner. They have input data and run swap if necessary functions on pairs of values of the input data before outputting the final. The simplest sorting network is two inputs.

![$\displaystyle \xymatrix{
A \ar[r] & \ar[r] \ar[dr] & \ar[r] & A' \\
B \ar[r] & \ar[r] \ar[ur] & \ar[r] & B' }
$](https://proxy-prod.omnivore-image-cache.app/187x136,sZ84iiifpFtUAb94NTnANXaVhqMo7t3yPJQUW5ZryOrk/https://www.dataorienteddesign.com/dodbook/img36.png) 

If the values entering are in order, the sorting crossover does nothing. If the values are out of order, then the sorting crossover causes the values to swap. This can be implemented as branch-free writes:

a' \<= MAX(a,b)
b' \<= MIN(a,b)

This is fast on any hardware. The MAX and MIN functions will need different implementations for each platform and data type, but in general, branch-free code executes a little faster than code that includes branches. In most current compilers, the MIN and MAX functions will be promoted to intrinsics if they can be, but you might need to finesse the data so the value is part of the key, so it is sorted along with the keys.

Introducing more elements:

![$\displaystyle \xymatrix{
A \ar[r] & \ar[r]^1 \ar[ddr] & \ar[r]^2 \ar[dr] & \ar...
...& C' \\
D \ar[r] & \ar[r] \ar[uur] & \ar[r] \ar[ur] & \ar[r] & \ar[r] & D' }
$](https://proxy-prod.omnivore-image-cache.app/284x376,sgWCSZlleSGlucvHkQq-7RuXyMxQJoLb9kRlmafGrzTw/https://www.dataorienteddesign.com/dodbook/img37.png) 

What you may notice here is that the critical path is not long (just three stages in total), the first stage is two concurrent sortings of A/C, and B/D pairs. The second stage, sorting A/B, and C/D pairs. The final cleanup sorts the B/C pair. As these are all branch-free functions, the performance is regular over all data permutations. With such a regular performance profile, we can use the sort in ways where the variability of sorting time length gets in the way, such as just-in-time sorting for subsections of rendering. If we had radix sorted our renderables, we can network sort any final required ordering as we can guarantee a consistent timing.

a' \<= MAX(a,c)
b' \<= MIN(b,d)
c' \<= MAX(a,c)
d' \<= MIN(b,d)
a'' \<= MAX(a',b')
b'' \<= MIN(a',b')
c'' \<= MAX(c',d')
d'' \<= MIN(c',d')
b''' \<= MIN(b'',c'')
c''' \<= MAX(b'',c'')

Sorting networks are somewhat like predication, the branch-free way of handling conditional calculations. Because sorting networks use a min/max function, rather than a conditional swap, they gain the same benefits when it comes to the actual sorting of individual elements. Given that sorting networks can be faster than radix sort for certain implementations, it goes without saying that for some types of calculation, predication, even long chains of it, will be faster than code that branches to save processing time. Just such an example exists in the Pitfalls of Object Oriented Programming\[#!Pitfalls!#\] presentation, concluding that lazy evaluation costs more than the job it tried to avoid. I have no hard evidence for it yet, but I believe a lot of AI code could benefit the same, in that it would be wise to gather information even when you are not sure you need it, as gathering it might be quicker than deciding not to. For example, seeing if someone is in your field of vision, and is close enough, might be small enough that it can be done for all AI rather than just the ones requiring it, or those that require it occasionally.

Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  



# links
[Read on Omnivore](https://omnivore.app/me/sorting-18b3ee7235a)
[Read Original](https://www.dataorienteddesign.com/dodbook/node8.html)

<iframe src="https://www.dataorienteddesign.com/dodbook/node8.html"  width="800" height="500"></iframe>
