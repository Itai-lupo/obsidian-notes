---
id: 3c0b520c-6d1b-11ee-a41a-578dca4cbbef
title: Searching
tags:
  - programing
  - Data-Oriented_Design
date: 2023-10-17 21:30:23
date_published: 2018-10-08 03:00:00
words_count: 3154
state: INBOX
---

# Searching by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Searching


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  
**Subsections** 
* [Indexes](https://www.dataorienteddesign.com/dodbook/node7.html#SECTION00710000000000000000)
* [Data-oriented Lookup](https://www.dataorienteddesign.com/dodbook/node7.html#SECTION00720000000000000000)
* [Finding low and high](https://www.dataorienteddesign.com/dodbook/node7.html#SECTION00730000000000000000)
* [Finding random](https://www.dataorienteddesign.com/dodbook/node7.html#SECTION00740000000000000000)

---

When looking for specific data, it's very important to remember why you're doing it. If the search is not necessary, then that's your biggest possible saving. Finding if a row exists in a table will be slow if approached naïvely. You can manually add searching helpers such as binary trees, hash tables, or just keep your table sorted by using ordered insertion whenever you add to the table. If you're looking to do the latter, this could slow things down, as ordered inserts aren't normally concurrent, and adding extra helpers is normally a manual task. In this chapter, we find ways to combat all these problems.

## Indexes 

Database management systems have long held the concept of an index. Traditionally, they were automatically added when a DBMS noticed a particular query had been run a large number of times. We can use this idea and implement a just-in-time indexing system in our games to provide the same kinds of performance improvement.

In SQL, every time you want to find out if an element exists, or even just generate a subset like when you need to find all the entities in a certain range, you will have to build it as a query. The query exists as an entity of a kind, and helps build intuition into the DBMS.

The query that creates the row or table generation can be thought of as an object which can hang around in case it's used again, and can transform itself depending on how it's used over time. Starting out as a simple linear search query (if the data is not already sorted), the process can find out that it's being used quite often through internal telemetry, and be able to discover that it generally returns a simply tunable set of results, such as the first N items in a sorted list. After some predefined threshold number of operations, lifetime, or other metric, it would be valuable for the query object to hook itself into the tables it references. Hooking into the insertion, modification, and deletion would allow the query to update its answers, rather than run the full query again each time it's asked.

This kind of smart object is what object-oriented programming can bring to data-oriented design. It can be a significant saving in some cases, but it can also be safe, due to its optionality.

If we build generalised backends to handle building queries into these tables, they can provide multiple benefits. Not only can we expect garbage collection of indexes which aren't in use, but they can also make the programs in some way self-documenting and self-profiling. If we study the logs of what tables had pushed for building indexes for their queries, then we can see data hotspots and where there is room for improvement. It may even be possible to have the code self-document what optimisation steps should be taken.

## Data-oriented Lookup 

The first step in any data-oriented approach to searching is to understand the difference between the search criteria, and the data dependencies of the search criteria. Object-oriented solutions to searching often ask the object whether or not it satisfies some criteria. Because the object is asked a question, there can be a lot of code required, memory indirectly accessed, and cache lines filled but hardly utilised. Even outside of object-oriented code-bases, there's still a lot of poor utilisation of memory bandwidth. In listing[![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:binarykeylookup), there is an example of simple binary search for a key in a naïve implementation of an animation container. This kind of data access pattern is common in animation libraries, but also in many hand-rolled structures which look up entries that are trivially sorted along an axis.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Binary search throu...
...bjects},label=src:binarykeylookup]{src/SRCH_BinaryKeyLookup.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x270,sX7E8s6izGORV_OnhRM8ow20vB9peKvn5DVyjx-hAPUg/https://www.dataorienteddesign.com/dodbook/img27.png)   

We can improve on this very quickly by understanding the dependence on the producer and the consumer of the process. Listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:binarytimelookup), is a quick rewrite that saves us a lot of memory requests by moving out to a partial structure-of-arrays approach. The data layout stems from recognising what data is needed to satisfy the requirements of the program.

First, we consider what we have to work with as inputs, and then what we need to provide as outputs. The only input we have is a time value in the form of a float, and the only value we need to return in this instance is an animation key. The animation key we need to return is dependent on data internal to our system, and we are allowing ourselves the opportunity to rearrange the data any way we like. As we know the input will be compared to the key times, but not any of the rest of the key data, we can extract the key times to a separate array. We don't need to access just one part of the animation key when we find the one we want to return, but instead, we want to return the whole key. Given that, it makes sense to keep the animation key data as an array of structures so we access fewer cache lines when returning the final value.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Binary search throu...
...lues},label=src:binarytimelookup]{src/SRCH_BinaryTimeLookup.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x270,sJa4Tdy_ML1rekVjSDRj0O1XgSlWusy3rvnhT_QjCncg/https://www.dataorienteddesign.com/dodbook/img28.png)   

It is faster on most hardware, but why is it faster? The first impression most people get is that we've moved the keys from nearby the returned data, ensuring we have another fetch before we have the chance to return. Sometimes it pays to think a bit further than what looks right at first glance. Let's look at the data layout of the AnimKeys.

| t                 | tx                | ty                | tz                | sx                | sy                | sz                | rs                |          |
| ----------------- | ----------------- | ----------------- | ----------------- | ----------------- | ----------------- | ----------------- | ----------------- | -------- |
| ri                | rj                | rk                | \[HTML\]000000 t  | \[HTML\]000000 tx | \[HTML\]000000 ty | \[HTML\]000000 tz | \[HTML\]000000 sx | <#3834#> |
| \[HTML\]000000 sy | \[HTML\]000000 sz | \[HTML\]000000 rs | \[HTML\]000000 ri | \[HTML\]000000 rj | \[HTML\]000000 rk | t                 | tx                |          |
| ty                | tz                | sx                | sy                | sz                | rs                | ri                | rj                | <#3844#> |
| rk                | \[HTML\]000000 t  | \[HTML\]000000 tx | \[HTML\]000000 ty | \[HTML\]000000 tz | \[HTML\]000000 sx | \[HTML\]000000 sy | \[HTML\]000000 sz |          |
| \[HTML\]000000 rs | \[HTML\]000000 ri | \[HTML\]000000 rj | \[HTML\]000000 rk | t                 | .                 | .                 | .                 | <#3862#> |

Primarily, the processing we want to be doing is all about finding the index of the key by hunting for through values in a list of times. In the extracted times code, we're no longer looking for a whole struct by one of its members in an array of structs. This is faster because the cache will be filled with mostly pertinent data during the hunt phase. In the original layout, we one or two key times per cache line. In the updated code, we see 16 key times per cache line.

| t0 | \[HTML\]000000  t1 | t2  | \[HTML\]000000  t3  | t4  | \[HTML\]000000  t5  | t6  | \[HTML\]000000  t7  |          |
| -- | ------------------ | --- | ------------------- | --- | ------------------- | --- | ------------------- | -------- |
| t8 | \[HTML\]000000  t9 | t10 | \[HTML\]000000  t11 | t12 | \[HTML\]000000  t13 | t14 | \[HTML\]000000  t15 | <#3884#> |

There are ways to organise the data better still, but any more optimisation requires a complexity or space time trade off. A basic binary search will home in on the correct data quite quickly, but each of the first steps will cause a new cache line to be read in. If you know how big your cache line is, then you can check all the values that have been loaded for free while you wait for the next cache line to load in. Once you have got near the destination, most of the data you need is in the cache and all you're doing from then on is making sure you have found the right key. In a cache line aware engine, all this can be done behind the scenes with a well-optimised search algorithm usable all over the game code. It is worth mentioning again, every time you break out into larger data structures, you deny your proven code the chance to be reused.

A binary search is one of the best search algorithms for using the smallest number of ![$ instructions$](https://proxy-prod.omnivore-image-cache.app/91x16,sdSeLOkhZ592en3u6RvZNr046TEu4PO1MEUmiAhzFxYE/https://www.dataorienteddesign.com/dodbook/img29.png) to find a key value. But if you want the fastest algorithm, you must look at what takes time, and often, it's not the instructions. Loading a whole cache line of information and doing as much as you can with that would be a lot more helpful than using the smallest number of instructions. It is worth considering that two different data layouts for an algorithm could have more impact than the algorithm used.

As a comparison to the previous animation key finding code, a third solution was developed which attempted to utilise the remaining cache line space in the structure. The structure that contained the number of keys, and the two pointers to the times and the key data, had quite a bit of space left on the cache line. One of the biggest costs on the PS3 and Xbox360 was poor cache line utilisation, or CLU. In modern CPUs, it's not quite as bad, partially because the cache lines are smaller, but it's still worth thinking about what you get to read for free with each request. In this particular case, there was enough cache line left to store another 11 floating point values, which are used as a place to store something akin to skip-list.

| times | keys              | n  | \[HTML\]000000  s0 | s1 | \[HTML\]000000  s2 |    |                     |          |
| ----- | ----------------- | -- | ------------------ | -- | ------------------ | -- | ------------------- | -------- |
| s3    | \[HTML\]000000 s4 | s5 | \[HTML\]000000 s6  | s7 | \[HTML\]000000  s8 | s9 | \[HTML\]000000  s10 | <#3902#> |

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Better cache line utilisation},label=src:animclu]{src/SRCH_LinearSkipping.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x374,sqHQSVRBANgef5rDN6vLf6GllEHh16QDdMzP9cfgf6Ig/https://www.dataorienteddesign.com/dodbook/img30.png)   

Using the fact that these keys would be loaded into memory, we give ourselves the opportunity to interrogate some data for free. In listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:animclu)you can see it uses a linear search instead of a binary search, and yet it still manages to make the original binary search look slow by comparison, and we must assume, as with most things on modern machines, it is because the path the code is taking is using the resources better, rather than being better in a theoretical way, or using fewer instructions.

i5-4430 @ 3.00GHz
Average 13.71ms [Full anim key - linear search]
Average 11.13ms [Full anim key - binary search]
Average  8.23ms [Data only key - linear search]
Average  7.79ms [Data only key - binary search]
Average  1.63ms [Pre-indexed - binary search]
Average  1.45ms [Pre-indexed - linear search]

If the reason for your search is simpler, such as checking for existence, then there are even faster alternatives. Bloom filters offer a constant time lookup. Even though it produces some false positives, it can be tweaked to generate a reasonable answer hit rate for very large sets. In particular, if you are checking for which table a row exists in, then bloom filters work very well, by providing data about which tables to look in, usually only returning the correct table, but sometimes more than one. The engineers at Google have used bloom filters to help mitigate the costs of something of a write-ahead approach with their BigTable technology\[#!GoogleBigTable!#\], and use bloom filters to quickly find out if data requests should lookup their values in recent change tables, or should go straight to the backing store.

In relational databases, indexes are added to tables at runtime when there are multiple queries that could benefit from their presence. For our data-oriented approach, there will always be some way to speed up a search but only by looking at the data. If the data is not already sorted, then an index is a simple way to find the specific item we need. If the data is already sorted, but needs even faster access, then a search tree optimised for the cache line size would help.

Most data isn't this simple to optimise. But importantly, when there is a lot of data, it usually is simple to learn patterns from it. A lot of the time, we have to work with spatial data, but because we use objects, it's hard to strap on an efficient spatial reference container after the fact. It's virtually impossible to add one at runtime to an externally defined class of objects.

Adding spatial partitioning when your data is in a simple data format like rows allows us to generate spatial containers or lookup systems that will be easy to maintain and optimise for each particular situation. Because of the inherent reusability in data-oriented transforms, we can write some very highly optimised routines for the high-level programmers.

## Finding lowest or highest is a sorting problem 

In some circumstances, you don't even really need to search. If the reason for searching is to find something within a range, such as finding the closest food, or shelter, or cover, then the problem isn't really one of searching, but one of sorting. In the first few runs of a query, the search might literally do a real search to find the results, but if it's run often enough, there is no reason not to promote the query to a runtime-updating sorted-subset of some other tables' data. If you need the nearest three elements, then you keep a sorted list of the nearest three elements, and when an element has an update, insertion or deletion, you can update the sorted three with that information. For insertions or modifications which bring elements that are not in the set closer, you can check whether the element is closer and pop the lowest before adding the new element to the sorted best. If there is a deletion or a modification that makes one in the sorted set a contender for elimination, a quick check of the rest of the elements to find a new best set might be necessary. If you keep a larger than necessary set of best values, however, then you might find this never happens.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={keeping more than you need},label=src:keepingthree]{src/SRCH_BestThree.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x273,s4IAgXm6Nuo49oK1MPkUvuqxs59YXUvjr8ma0w0kdAw4/https://www.dataorienteddesign.com/dodbook/img31.png)   

The trick is to find, at runtime, the best value to use that covers the solution requirement. The only way to do that is to check the data at runtime. For this, either keep logs or run the tests with dynamic resizing based on feedback from the table's query optimiser.

## Finding random is a hash/tree issue 

For some tables, the values change very often. For a tree representation to be high performance, it's best not to have a high number of modifications as each one could trigger the need for a rebalance. Of course, if you do all your modifications in one stage of processing, then rebalance, and then all your reads in another, then you're probably going to be okay still using a tree.

The C++ standard template library implementation of map for your compiler might not work well even when committing all modifications in one go, but a more cache line aware implementation of a tree, such as a B-tree, may help you. A B-tree has much wider nodes, and therefore is much shallower. It also has a much lower chance of making multiple changes at once under insert and delete operations, as each node has a much higher capacity. Typically, you will see some form of balancing going on in a red-black tree every other insert or delete, but in most B-tree implementations, you will have tree rotations occur relative to the width of the node, and nodes can be very wide. For example, it's not unusual to have nodes with 8 child nodes.

If you have many different queries on some data, you can end up with multiple different indexes. How frequently the entries are changed should influence how you store your index data. Keeping a tree around for each query could become expensive, but would be cheaper than a hash table in many implementations. Hash tables become cheaper where there are many modifications interspersed with lookups, trees are cheaper where the data is mostly static, or at least hangs around in one form for a while over multiple reads.

When the data becomes constant, a perfect hash can trump a tree. Perfect hash tables use pre-calculated hash functions to generate an index and don't require any space other than what is used to store the constants and the array of pointers or offsets into the original table. If you have the time, then you might find a perfect hash that returns the actual indexes. It's not often you have that long though.

For example, what if we need to find the position of someone given their name? The players won't normally be sorted by name, so we need a name to player lookup. This data is mostly constant during the game so would be better to find a way to directly access it. A single lookup will almost always trump following a pointer chain, so a hash to find an array entry is likely to be the best fit. Consider a normal hash table, where each slot contains either the element you're looking for, or a different element, and a way of calculating the next slot you should check. If you know you want to do one and only one lookup, you can make each of your hash buckets as large as a cache line. That way you can benefit from free memory lookups.

Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  



# links
[Read on Omnivore](https://omnivore.app/me/searching-18b3ee73b8d)
[Read Original](https://www.dataorienteddesign.com/dodbook/node7.html)

<iframe src="https://www.dataorienteddesign.com/dodbook/node7.html"  width="800" height="500"></iframe>
