---
id: 34a61fe2-6d1b-11ee-a592-5bd5feb02079
title: Optimisations
tags:
  - programing
  - Data-Oriented_Design
date: 2023-10-17 21:30:10
date_published: 2018-10-08 03:00:00
words_count: 8326
state: INBOX
---

# Optimisations by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Optimisations


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  
**Subsections** 
* [When should we optimise?](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00910000000000000000)
* [Feedback](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00920000000000000000)  
   * [Know your limits](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00921000000000000000)
* [A strategy](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00930000000000000000)  
   * [Define the problem](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00931000000000000000)  
   * [Measure](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00932000000000000000)  
   * [Analyse](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00933000000000000000)  
   * [Implement](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00934000000000000000)  
   * [Confirm](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00935000000000000000)  
   * [Summary](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00936000000000000000)
* [Tables](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00940000000000000000)
* [Transforms](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00950000000000000000)
* [Spatial sets](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00960000000000000000)
* [Lazy evaluation](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00970000000000000000)
* [Necessity](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00980000000000000000)
* [Varying length sets](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION00990000000000000000)
* [Joins as intersections](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION009100000000000000000)
* [Data-driven techniques](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION009110000000000000000)  
   * [SIMD](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION009111000000000000000)
* [Structs of arrays](https://www.dataorienteddesign.com/dodbook/node9.html#SECTION009120000000000000000)

---

##   
Optimisations and Implementations

When optimising software, you have to know what is causing the software to run slower than you need it to run. We find in most cases, data movement is what really costs us the most. Data movement is where most of the energy goes when processing data. Calculating solutions to functions, or running an algorithm on the data uses less energy. It is the fulfillment of the request for data in the first place that appears to be the largest cost. As this is most definitely true about our current architectures, we find implicit or calculable information is often much more useful than cached values or explicit state data.

If we start our game development by organising our data into arrays, we open ourselves up to many opportunities for optimisation. Starting with such a problem agnostic layout, we can pick and choose from tools we've created for other tasks, at worst elevating the solution to a template or a strategy, before applying it to both the old and new use cases.

In Out of the Tar Pit\[#!TarPit!#\], it's considered poor form to add state and complexity for the sake of performance until late in the development of the solution. By using arrays to solve the problem, and side-effect free transforms on those tables, performance improvements can be made across systems in general. The improvements can be applied at many sites in the program with little fear of incompatibility, and a conviction that we're not adding state, but augmenting the language in which we work.

The bane of many projects, and the cause of their lateness, has been the insistence on not doing optimisation prematurely. The reason optimisation at late stages is so difficult is that many pieces of software are built up with instances of objects everywhere, even when not needed. Many issues with object-oriented design are caused by the idea that an instance is the unit of processing. Object-oriented development practices tend to assume the instance is the unit on which code will work, and techniques and standards of practice treat collections of objects as collections of individuals.

When the basic assumption is that an object is a unique and special thing with its own purpose, then the instructions to carry out what it needs to do, will necessarily be selected in some way dependent on the object. Accessing instructions via the vtable pointer is the usual method by which operations are selected. The greater threat is when five, ten, or a hundred individual instances, which could have been represented as a group, a swarm, or merely an increment on a value, are processed as a sequence of individuals. There are many cases where an object exists just because it seemed to match the real world concept it was trying to represent at the scale of the developer implementing it, rather than because it needed to function as a unique individual element of which the user would be aware. It's easy to get caught up implementing features from the perspective of what they are, rather than how they are perceived.

## When should we optimise? 

When should optimisation be done? When is it truly premature? The answer lies in data of a different sort. Premature optimisation is when you optimise something without knowing whether it will make a difference. If you attempt to optimise something because in your mind it will \`\`speed things up a bit", then it can be considered premature, as it's not apparent there is anything to optimise.

Let's be clear here, without the data to show that a game is running slow, or running out of memory, then all optimisations are premature. If an application has not been profiled, but feels slow, sluggish, or erratic, then anything you do cannot be objectively defined as improving it, and any improvements you attempt to do cannot be anything but premature optimisations. The only way to stop premature optimisation is to start with real data. If your application seems slow, and has been profiled, and what is considered unacceptable is a clearly defined statement based on data, then anything you do to improve the solution will not be premature, because it has been measured, and can be evaluated in terms of failure, success, or progress.

Given that we think we will need to optimise at some point, and we know optimising without profiling is not actually optimising, the next question becomes clear. When should you start profiling? When should you start work on your profiling framework? How much game content is enough to warrant testing performance? How much of the game's mechanics should be in before you start testing them for performance spikes?

Consider a different question. Is the performance of your final product optional? Would you be able to release the game if you knew it had sections which ran at 5fps on certain hardware? If you answer that it's probably okay for your game to run at around 30fps, then that's a metric, even if it's quite imprecise. How do you know your game already isn't running at 5fps on one of your target audience's hardware configurations? If you believe there are lower limits to frame-rate, and upper limits to your memory usage, if there is an expected maximum time for a level to load before it's just assumed to be stuck, or a strong belief the game should at least not kill the battery on a phone when it's running, then you have, in at least some respect, agreed that performance is not optional.

If performance is not optional, and it requires real work to optimise, then start asking yourself a different set of questions. How long can you delay profiling? How much art or other content can you afford to redo? How many features are you willing to work on without knowing if they can be included in the final game? How long can you work without feedback on whether any of what you have done, can be included in the final product?

## Feedback 

Not knowing you are writing poor performance code doesn't just hurt your application. By not having feedback on their work, developers cannot get better, and myths and techniques which do not work are reinforced and perpetuated. Daniel Kahneman, in his book Thinking, Fast and Slow\[#!thinkingfastandslow!#\], provides some evidence that you can learn well from immediate reactions, but cannot easily pick up skills when the feedback is longer in arriving. In one part, he puts it in terms of psychotherapists being able to acquire strong intuitive skills in patient interaction, as they are able to observe the patient's immediate reactions, but they are less likely to be able to build strong intuitions for identifying the appropriate treatment for a patient, as the feedback is not always available, not always complete, and often delayed. Choosing to work without feedback would make no sense, but there is little option for many game developers, as third party engines offer very little in the way of feedback mechanisms for those learning or starting out on their projects. They do not provide mechanisms to apply budgets to separate aspects of their engines, other than the coarse grain of CPU, GPU, Physics, render, etc. They provide lots of tools to help fix performance when it has been identified as an issue, but can often provide feedback which is incomplete, or inaccurate to the final form of the product, as built-in profiling tools are not always available in fully optimised publishing ready builds.

You must get feedback on what is going on, as otherwise there is a risk the optimisations you will need to do will consume any polish time you have. Make sure your feedback is complete and immediate where possible. Adding metrics on the status of the performance of your game will help with this. Instant feedback on success or failure of optimisations helps mitigate the sunk cost fallacy that can intrude on rational discourse about a direction taken. If a developer has a belief in a way of doing things, but it's not helping, then it's better to know sooner rather than later. Even the most entrenched in their ways are more approachable with raw data, as curiosity is a good tonic for a developer with a wounded ego. If you haven't invested a lot of time and effort into an approach, then the feedback is even easier to integrate, as you're going to be more willing to throw the work away and figure out how to do it differently.

You also need to get the feedback about the right thing. If you find you've been optimising your game for a silky smooth frame rate and you think you have an average frame rate of 60fps, and yet your customers and testers keep coming back with comments about nasty frame spikes and dropout, then it could be that you're not profiling the right thing, or not profiling the right way. Sometimes it can be that you have to profile a game while it is being played. Sometimes it can be as simple as remembering to profile frame times on a per frame basis, not just an average.

Profiling doesn't have to be about frame rate. A frame isn't a slow thing, something in that frame was slow. An old-fashioned, but powerful way to develop software, is to provide budgets to systems and departments. We're not talking about financial budgets here, but instead time, memory, bandwidth, disk space, or other limits which affect the final product directly. If you give your frame a budget of 16ms, and you don't go over, you have a 60fps game, no ifs, no buts. If you decide you want to maintain good level load times, and set yourself a budget of 4 seconds to load level data, then as long as you don't go over, no one is going to complain about your load times.

Beyond games, if you have a web-based retail site, you might want to be aware of latency, as it has an effect on your users. It was revealed in a presentation in 2008 by Greg Linden that for every additional 100ms of latency, Amazon would experience a loss of 1% in sales. It was also revealed that Google had statistics showing a 20% drop in site traffic was experienced when they added just half a second of latency to page generation. Most scarily of all was a comment from TABB group in 2008, where they mention company wrecking levels of costs.

> TABB Group estimates that if a broker's electronic trading platform is 5 milliseconds behind the competition, it could lose at least 1% of its flow; that's $4 million in revenues per millisecond. Up to 10 milliseconds of latency could result in a 10% drop in revenues. From there it gets worse. If a broker is 100 milliseconds slower than the fastest broker, it may as well shut down its FIX engine and become a floor broker. 

[8.1](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2213) 

If latency, throughput, frame times, memory usage, or another resource is your limit, then budget for it. What would cripple your business? Are you measuring it? How long can you go without checking that you're not already out of business?

## Know your limits 

Building budgets into how you work means, you can set realistic budgets for systems early and have them work at a certain level throughout development knowing they will not cause grief later in development. On a project without budgets, frame spikes may only become apparent near release dates as it is only then that all systems are coming together to create the final product. A system which was assumed to be quite cheap, could cause frame spikes in the final product, without any evidence being previously apparent. When you finally find out which system causes the spikes, it may be that it was caused by a change from a very long time ago, but as resources were plentiful in the early times of development on the project, the spikes caused by the system would have gone completely unnoticed, flying under the radar. If you give your systems budgets, violations can be recorded and raised as issues immediately. If you do this, then problems can be caught at the moment they are created, and the cause is usually within easy reach.

Build or get yourself a profiler that runs all the time. Ensure your profiler can report the overall state of the game when the frame time goes over budget. It's highly beneficial to make it respond to any single system going over budget. Sometimes you need the data from a number of frames around when a violation occurred to really figure out what is going on. If you have AI in your game, consider running continuous testing to capture performance issues as fast as your build machine churns out testable builds. In all cases, unless you're letting real testers run your profiler, you're never going to get real world profiling data. If real testers are going to be using your profiling system, it's worth considering how you gather data from it. If it's possible for you, see if you can get automatically generated profile data sent back to an analytics or metrics server, to capture issues without requiring user intervention.

## A strategy for optimisation 

You can't just open up an editor and start optimising. You need a strategy. In this section, we walk through just one such strategy. The steps have parallels in industries outside game development, where large companies such as Toyota optimise as part of their business model. Toyota has refined their techniques for ensuring maximum performance and growth, and the Toyota Production System has been the driving idea behind the Lean manufacturing method for the reduction of waste. There are other techniques available, but this subset of steps shares much with many of them.

## Define the problem 

Define your problem. Find out what it is you think is bad. Define it in terms of what is factual, and what is assumed to be a final good solution. This can be as simple as saying the problem is that the game is running at 25fps, and you need it to be at 30fps. Stick to clear, objective language.

It's important to not include any guesses in this step, so statements which include ideas on what or how to optimise should be prohibited. Consider writing it from the point of view of someone using the application, not from the perspective of the developer. This is sometimes called quality criteria, or customer requirements.

## Measure 

Measure what you need to measure. Unlike measuring randomly, targeted measuring is better for figuring out what is actually going on, as you are less likely to find a pattern in irrelevant data. P-hacking or data dredging can lead you to false convictions about causes of problems.

At this stage, you also need to get an idea of the quality of your measurements. Run your tests, but then run them again to make sure they're reproducible. If you can't reproduce the same results before you have made changes, then how are you going to be sure the changes you have made, have had any effect?

## Analyse 

The first step in most informal optimisation strategies: the guessing phase. This is when you come up with ideas about what could be the problem and suggest different ways to tackle the problem. In the informal optimisation process, you pick the idea which seems best, or at least the most fun to implement.

In this more formal strategy, we analyse what we have measured. Sometimes it's apparent from this step that the measurements didn't provide enough direction to come up with a good optimisation plan. If your analysis proves you don't have good data, the next step should be to rectify your ability to capture useful data. Don't tackle optimisation without understanding the cost associated with failing to understand the problem.

This is also the stage to make predictions. Estimate the expected impact of an improvement you plan to make. Don't just lightly guess, have a really good go at guessing with some number crunching. You won't be able to do it after the implementation, as you will have too much knowledge to make an honest guess. You will be suffering what some call the curse of knowledge. By doing this, you can learn about how good you are at estimating the impact of your optimisations, but also, you can get an idea of the relative impact of your change before you begin work.

## Implement 

The second step in most informal optimisation strategies; the implementation phase. This is when you make the changes you think will fix the problem.

If possible, do an experimental implementation of the optimisation to your solution. A program is a solution to a problem, it is a strategy to solve a data transform, and you should remember that when designing your experiment.

Before you consider the local version to be working, and indeed, worth working on, you must prove it's useful. Check the measurements you get from the localised experiment are in line with your expectations as measured from the integrated version.

If your optimisation is going to be perfect first time, then the experimental implementation will only be used as a proof that the process can be repeated and can be applicable in other circumstances. It will only really be useful as a teaching tool for others, in helping them understand the costs of the original process and the expected improvement under similar constraints.

If you are not sure the optimisation will work out first time, then the time saved by not doing a full implementation can be beneficial, as a localised experiment can be worked on faster. It can also be a good place to start when trying to build an example for third parties to provide support, as a smaller example of the problem will be easier to communicate through.

## Confirm 

This step is critical in more ways than expected. Some may think it an optional step, but it is essential for retaining the valuable information you will have generated while doing the optimisation.

Create a report of what you have done, and what you have found. The benefits of doing this are twofold. First, you have the benefit of sharing knowledge of a technique for optimisation, which clearly can help others hitting the same kind of issue. The second is that creating the report can identify any errors of measurement, or any steps which can be tested to ensure they were actually pertinent to the final changes committed.

In a report, others can point out any illogical leaps of reasoning, which can lead to even better understanding and can also help deny any false assumptions from building up in your understanding of how the machine really works. Writing a report can be a powerful experience that will give you valuable mental building blocks and the ability to better explain what happens under certain conditions.

## Summary 

Above all things, keep track. If you can, do your optimisation work in isolation of a working test bed. Make sure your timings are reproducible even if you have to get up to date with the rest of the project due to having to work on a bug or feature. Making sure you keep track of what you are doing with notes can help you understand what was in your head when you made earlier changes, and what you might not have thought about.

It is important to keep trying to improve your ability to see; to observe. You cannot make measurable progress if you cannot measure, and you cannot tell you have made an improvement without tools for identifying the improvement. Improve your tools for measuring when you can. Look for ways to look. Whenever you find that there was no way to know with the tools you had available, either find the tools you need or if you can't find them, attempt to make them yourself. If you cannot make them yourself, petition others, or commission someone else to create them. Don't give in to hopeful optimisations, because they will teach you bad habits and you will learn false facts from random chance proving you right.

## Tables 

To keep things simple, advice from multiple sources indicate that keeping your data as vectors has a lot of positive benefits. There are some reasons to use something other than the STL, but learn its quirks, and you can avoid a lot of the issues. Whether you use std::vector, or roll your own dynamically sized array, it is a good starting place for any future optimisations. Most of the processing you will do will be reading an array, transforming one array into another, or modifying a table in place. In all these cases, a simple array will suffice for most tasks.

Moving to arrays is good, moving to structure-of-arrays can be better. Not always. It's very much worth considering the access patterns for your data. If you can't consider the access patterns, and change is costly, choose based on some other criteria, such as readability.

Another reason to move away from arrays of objects, or arrays of structures, is to keep the memory accesses specific to their tasks. When thinking about how to structure your data, it's important to think about what data will be loaded and what data will be stored. CPUs are optimised for certain patterns of memory activity. Many CPUs have a cost associated with changing from read operations to write operations. To help the CPU not have to transition between read and write, it can be beneficial to arrange writing to memory in a very predictable and serial manner. An example of hot cold separation that doesn't take into account the importance of writing can be seen in the example code in listing[![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:hotcoldwrite) that attempts to update values which are used both for read and write, but are close neighbours of data which is only used for reading.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Mixing hot reads wi...
...d cold writes},label=src:hotcoldwrite]{src/OPT-hotcoldwrite.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x309,sbMVrOQv2dt2773VRVlNncM4oFpfwa1hHJU_xvacmULU/https://www.dataorienteddesign.com/dodbook/img38.png)   

The code in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:writeseperate) shows a significant performance improvement.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Ensuring each strea...
... continuous},label=src:writeseperate]{src/OPT-writeseparate.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/594x208,sAx-Y1L-ZGuWsdNVuKzldhOagbosZY_svWTVul3oDNoQ/https://www.dataorienteddesign.com/dodbook/img39.png)   

For the benefit of your cache, structs of arrays can be more cache-friendly if the data is not strongly related both for reading and writing. It's important to remember this is only true when the data is not always accessed as a unit, as one advocate of the data-oriented design movement assumed that structures of arrays were intrinsically cache-friendly, then put the x,y, and z coordinates in separate arrays of floats. It is possible to benefit from having each element in its own array when you utilise SIMD operations on larger lists. However, if you need to access the x,y, or z of an element in an array, then you more than likely need to access the other two axes as well. This means that for every element you will be loading three cache lines of float data, not one. If the operation involves a lot of other values, then this may overfill the cache. This is why it is important to think about where the data is coming from, how it is related, and how it will be used. Data-oriented design is not just a set of simple rules to convert from one style to another. Learn to see the connections between data. In this case, we see that in some circumstances, it's better to keep your vector as three or four floats if it's not commonly used as a value in an operation that will be optimised with SIMD instructions.

There are other reasons why you might prefer to not store data in trivial SoA format, such as if the data is commonly subject to insertions and deletions. Keeping free lists around to stop deletions from mutating the arrays can help alleviate the pressure, but being unable to guarantee every element requires processing moves away from simple homogeneous transformations which are often the point of such data layout changes.

If you use dynamic arrays, and you need to delete elements from them, and these tables refer to each other through some IDs, then you may need a way to splice the tables together in order to process them as you may want to keep them sorted to assist with zipping operations. If the tables are sorted by the same value, then it can be written out as a simple merge operation, such as in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#lst:joinmerge).

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Zipping together mu...
...e tables by merging},label=lst:joinmerge]{src/ZippingTables.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/594x192,spcQFYVH1yx6DEbpOv-E84nEcxrwlmt_5eqKWS_TecaY/https://www.dataorienteddesign.com/dodbook/img40.png)   

This works as long as the == operator knows about the table types and can find the specific column to check against, and as long as the tables are sorted based on this same column. But what about the case where the tables are zipped together without being the sorted by the same columns? For example, if you have a lot of entities which refer to a modelID, and you have a lot of mesh-texture combinations which refer to the same modelID, then you will likely need to zip together the matching rows for the orientation of the entity, the modelID in the entity render data, and the mesh and texture combinations in the models. The simplest way to program a solution to this is to loop through each table in turn looking for matches such as in Listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#lst:joinloop). This solution, though simple to write, is incredibly inefficient, and should be avoided where possible. But as with all things, there are exceptions. In some situations, very small tables might be more efficient this way, as they will remain resident, and sorting them could cost more time.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Join by looping through all tables},label=lst:joinloop]{src/NaiveZippingTables.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/594x171,sc4R9ROrVDxpXsGWH4yMrnIWfxeAx2gHndmBSPSons0M/https://www.dataorienteddesign.com/dodbook/img41.png)   

Another thing you have to learn about when working with data which is joined on different columns is the use of join strategies. In databases, a join strategy is used to reduce the total number of operations when querying across multiple tables. When joining tables on a column (or key made up of multiple columns), you have a number of choices about how you approach the problem. In our trivial coded attempt, you can see we simply iterate over the whole table for each table involved in the join, which ends up being O(![$ nmo$](https://proxy-prod.omnivore-image-cache.app/35x16,sSeZgUgFPgtrApgAJKgimuZlwzJIf3FNLaqN55QbcUN8/https://www.dataorienteddesign.com/dodbook/img42.png)) or ![$ \mathcal{O}(n^{3})$](https://proxy-prod.omnivore-image-cache.app/46x33,s6kxwrcoD8ol5WS8w5kVrCYQd9TbhxGTiDqItQk95dHc/https://www.dataorienteddesign.com/dodbook/img43.png)for roughly same size tables. This is no good for large tables, but for small ones it's fine. You have to know your data to decide whether your tables are big[8.2](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2173) or not. If your tables are too big to use such a trivial join, then you will need an alternative strategy.

You can join by iteration, or you can join by lookup[8.3](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2174), or you can even join once and keep a join cache around. Keeping the join cache around makes it appear as if you can operate on the tables as if they are sorted in multiple ways at the same time.

It's perfectly feasible to add auxiliary data which will allow for traversal of a table in a different order. We add join caches in the same way databases allow for any number of indexes into a table. Each index is created and kept up to date as the table is modified. In our case, we implement each index the way we need to. Maybe some tables are written to in bursts, and an insertion sort would be slow, it might be better to sort on first read, or trash the whole index on modify. In other cases, the sorting might be better done on write, as the writes are infrequent, or always interleaved with many reads.

## Transforms 

Taking the concept of schemas a step further, a static schema definition can allow for a different approach to iterators. Instead of iterating over a container, giving access to an element, a schema iterator can become an accessor for a set of tables, meaning the merging work can be done during iteration, generating a context upon which the transform operates. This would benefit large, complex merges which do little with the data, as there would be less memory usage creating temporary tables. It would not benefit complex transforms as it would reduce the likelihood that the next set of data is in cache ready for the next cycle.

Another aspect of transforms is the separation of what from how. That is, separating the gathering or loading of data we will transform from the code which ultimately performs the operations on the data. In some languages, introducing map and reduce is part of the basic syllabus, in C++, not so much. This is probably because lists aren't part of the base language, and without that, it's hard to introduce powerful tools which require them. These tools, map and reduce, can be the basis of a purely transform and flow driven program. Turning a large set of data into a single result sounds eminently serial, however, as long as one of the steps, the reduce step, is associative, then you can reduce in parallel for a significant portion of the reduction.

A simple reduce, one made to create a final total from a mapping which produces values of zero or one for all matching elements, can be processed as a less and less parallel tree of reductions. In the first step, all reductions produce the total of all odd-even pairs of elements and produce a new list which goes through the same process. This list reduction continues until there is only one item left remaining. Of course, this particular reduction is of very little use, as each reduction is so trivial, you'd be better off assigning an ![$ n^$](https://proxy-prod.omnivore-image-cache.app/14x16,sB7rPByF3__H76yCfyRp0WBDCuqcZx8R0KCXiN6_kE90/https://www.dataorienteddesign.com/dodbook/img34.png)thof the workload to each of the ![$ n$](https://proxy-prod.omnivore-image-cache.app/13x16,sEcieC_1P3VSto4p4EBKjvIjB7IDWT-WMniFzrQQrAh4/https://www.dataorienteddesign.com/dodbook/img32.png) cores and doing one final summing. A more complex, but equally useful reduction would be the concatenation of a chain of matrices. Matrices are associative even if they are not commutative, and as such, the chain can be reduced in parallel the same way building the total worked. By maintaining the order during reduction you can apply parallel processing to many things which would normally seem serial, so long as they are associative in the reduce step. Not only matrix concatenation, but also products of floating point values such as colour modulation by multiple causes such as light, diffuse, or gameplay related tinting. Building text strings can be associative, as can be building lists.

## Spatial sets for collisions 

In collision detection, there is often a broad-phase step which can massively reduce the number of potential collisions we check against. When ray casting, it's often useful to find the potential intersection via an octree, BSP, or other spatial query accelerator. When running pathfinding, sometimes it's useful to look up local nodes to help choose a starting node for your journey.

All spatial data-stores accelerate queries by letting them do less. They are based on some spatial criteria and return a reduced set which is shorter and thus less expensive to transform into new data.

Existing libraries which support spatial partitioning have to try to work with arbitrary structures, but because all our data is already organised by table, writing adaptors for any possible table layout is made simpler. Writing generic algorithms becomes easier without any of the side effects normally associated with writing code that is used in multiple places. Using the table-based approach, because of its intention agnosticism (that is, the spatial system has no idea it's being used on data which doesn't technically belong in space), we can use spatial partitioning algorithms in unexpected places, such as assigning audio channels by not only their distance from the listener, but also their volume and importance. Making a 5 dimensional spatial partitioning system, or even an ![$ n$](https://proxy-prod.omnivore-image-cache.app/13x16,sEcieC_1P3VSto4p4EBKjvIjB7IDWT-WMniFzrQQrAh4/https://www.dataorienteddesign.com/dodbook/img32.png) dimensional one, would be an investment. It would only have to be written once and have unit tests written once, before it could be used and trusted to do some very strange things. Spatially partitioning by the quest progress for tasks to do seems a little overkill, but getting the set of all nearby interesting entities by their location, threat, and reward, seems like something an AI might consider useful.

## Lazy evaluation for the masses 

When optimising object-oriented code, it's quite common to find local caches of completed calculations hidden in mutable member variables. One trick found in most updating hierarchies is the dirty bit, the flag that says whether the child or parent members of a tree have decided this object needs updating. When traversing the hierarchy, this dirty bit causes branching based on data which has only just loaded, usually meaning there is no chance to guess the outcome and thus in most cases, causes memory to be read in preparation, when it's not required.

If your calculation is expensive, then you might not want to go the route that render engines now use. In render engines, it's often cheaper to do every scene matrix concatenation every frame than it is only doing the ones necessary and figuring out if they are.

For example, in the Pitfalls of Object-Oriented Programming\[#!Pitfalls!#\] presentation by Tony Albrecht, in the early slides he declares that checking a dirty flag is less useful than not checking it, as when it does fail (the case where the object is not dirty) the calculation that would have taken 12 cycles is dwarfed by the cost of a branch misprediction (23-24 cycles). Things always move on, and in the later talk Pitfalls revisited\[#!Pitfalls2017!#\], he notes that the previous improvement gained through manual devirtualization no longer provides any benefit. Whether it was the improvements in the compiler or the change in hardware, reality will always trump experience.

If your calculation is expensive, you don't want to bog down the game with a large number of checks to see if the value needs updating. This is the point at which existence-based-processing comes into its own again as existence in the dirty table implies it needs updating, and as a dirty element is updated it can be pushing new dirty elements onto the end of the table, even prefetching if it can improve bandwidth.

## Necessity, or not getting what you didn't ask for 

When you normalise your data you reduce the chance of another multifaceted problem of object-oriented development. C++'s implementation of objects forces unrelated data to share cache lines.

Objects collect their data by the class, but many objects, by design, contain more than one role's worth of data. This is because object-oriented development doesn't naturally allow for objects to be recomposed based on their role in a transaction, and also because C++ needed to provide a method by which you could have object-oriented programming while keeping the system level memory allocations overloadable in a simple way. Most classes contain more than just the bare minimum, either because of inheritance or because of the many contexts in which an object can play a part. Unless you have very carefully laid out a class, many operations which require only a small amount of information from the class will load a lot of unnecessary data into the cache in order to do so. Only using a very small amount of the loaded data is one of the most common sins of the object-oriented programmer.

Every virtual call loads in the cache line that contains the virtual-table pointer of the instance. If the function doesn't use any of the class's early data, then that will be cache line utilisation in the region of only 4%. That's a memory throughput waste, and cannot be recovered without rethinking how you dispatch your functions. Adding a final keyword to your class can help when your class calls into its own virtual functions, but cannot help when they are called via a base type.

In practice, only after the function has loaded, can the CPU load the data it wants to work on, which can be scattered across the memory allocated for the class too. It won't know what data it needs until it has decoded the instructions from the function pointed to by the virtual table entry. 

## Varying length sets 

Throughout the techniques so far, there's been an implied table structure to the data. Each row is a struct, or each table is a row of columns of data, depending on the need of the transforms. When working with stream processing, for example, with shaders, we would normally use fixed size buffers. Most work done with stream processing has this same limitation, we tend to have a fixed number of elements for both sides.

For filtering where the input is known to be a superset of the output, there can be a strong case for an annealing structure. Outputting to multiple separate vectors, and concatenating them in a final reduce. Each transform thread has its own output vector, the reduce step would first generate a total and a start position for each reduce entry and then processes the list of reduces onto the final contiguous memory. A parallel prefix sum would work well here, but simple linear passes would suffice.

If the filtering was a stage in a radix sort, counting sort, or something which uses a similar histogram for generating offsets, then a parallel prefix sum would reduce the latency to generate the offsets. A prefix sum is the running total of a list of values. The radix sort output histogram is a great example because the bucket counts indicate the starting points through the sum of all histogram buckets that come prior. ![$ o_n = \sum_{i=0}^{n-1} b_i$](https://proxy-prod.omnivore-image-cache.app/98x39,sgWrwCJUCtMlaDf0sG7aYA9pwlGTSB6MVPUQd-cogCno/https://www.dataorienteddesign.com/dodbook/img44.png). This is easy to generate in serial form, but in parallel, we have to consider the minimum required operations to produce the final result. In this case, we can remember that the longest chain will be the value of the last offset, which is a sum of all the elements. This is normally optimised by summing in a binary tree fashion. Dividing and conquering: first summing all odd numbered slots with all even numbered slots, then doing the same, but for only the outputs of the previous stage.

![$\displaystyle \xymatrix{
A \ar[d] \ar[dr] & B \ar[d] & C \ar[d] \ar[dr] & D \a...
... \ar[d] & ab \ar[d] \ar[drr] & c \ar[d] & cd \ar[d] \\
a & ab & abc & abcd }
$](https://proxy-prod.omnivore-image-cache.app/236x252,s94l_S9fFHt4O9uB28DdLrIfM31iQlRalj8-14ta_Dlw/https://www.dataorienteddesign.com/dodbook/img45.png) 

Then once you have the last element, backfill all the other elements you didn't finish on your way to making the last element. When you come to write this in code, you will find these backfilled values can be done in parallel while making the longest chain. They have no dependency on the final value so can be given over to another process, or managed by some clever use of SIMD.

![$\displaystyle \xymatrix{
a \ar[d] & ab \ar[d] \ar[dr] & c \ar[d] & abcd \ar[d] \\
a & ab & abc & abcd }
$](https://proxy-prod.omnivore-image-cache.app/233x135,sSgS8AoF4ObLHANUWz1S4vF3TXtgM_3ZjkS1IEAvotJE/https://www.dataorienteddesign.com/dodbook/img46.png) 

Parallel prefix sums provide a way to reduce latency, but are not a general solution which is better than doing a linear prefix sum. A linear prefix sum uses far fewer machine resources to do the same thing, so if you can handle the latency, then simplify your code and do the sum linearly.

Also, for cases where the entity count can rise and fall, you need a way of adding and deleting without causing any hiccups. For this, if you intend to transform your data in place, you need to handle the case where one thread can be reading and using the data you're deleting. To do this in a system where objects' existence was based on their memory being allocated, it would be very hard to delete objects that were being referenced by other transforms. You could use smart pointers, but in a multi-threaded environment, smart pointers cost a mutex to be thread safe for every reference and dereference. This is a high cost to pay, so how do we avoid it? There are at least two ways.

Don't have a mutex. One way to avoid the mutex is to use a smart pointer type which is bound to a single thread. In some game engines, there are smart pointer types that instead of keeping a mutex, store an identifier for the thread they belong to. This is so they can assert every access is made by the same thread. For performance considerations, this data doesn't need to be present in release builds, as the checks are done to protect against misuse at runtime caused by decisions made at compile time. For example, if you know the data should not be used outside of the audio subsystem, and the audio subsystem is running on a single thread of its own, lock it down and tie the memory allocation to the audio thread. Any time the audio system memory is accessed outside of the audio thread, it's either because the audio system is exposing memory to the outside systems or it's doing more work than it should in any callback functions. In either case, the assert will catch the bad behaviour, and fixes can be made to the code to counter the general issue, not the specific case.

Don't delete. If you are deleting in a system that is constantly changing, then you would normally use pools anyway. By explicitly not deleting, by doing something else instead, you change the way all code accesses data. You change what the data represents. If you need an entity to exist, such as a CarDriverAI, then it can stack up on your table of CarDriverAIs while it's in use, but the moment it's not in use, it won't get deleted, but instead marked as not used. This is not the same as deleting, because you're saying the entity is still valid, won't crash your transform, but it can be skipped as if it were not there until you get around to overwriting it with the latest request for a CarDriverAI. Keeping dead entities around can be as cheap as keeping pools for your components, as long as there are only a few dead entities in your tables.

## Joins as intersections 

Sometimes, normalisation can mean you need to join tables together to create the right situation for a query. Unlike RDBMS queries, we can organise our queries much more carefully and use the algorithm from merge sort to help us zip together two tables. As an alternative, we don't have to output to a table, it could be a pass-through transform which takes more than one table and generates a new stream into another transform. For example, per entityRenderable, join with entityPosition by entityID, to transform with AddRenderCall( Renderable, Position ).

## Data-driven techniques 

Apart from finite state machines, there are some other common forms of data-driven coding practices. Some are not very obvious, such as callbacks. Some are very obvious, such as scripting. In both these cases, data causing the flow of code to change will cause the same kind of cache and pipeline problems as seen in virtual calls and finite state machines.

Callbacks can be made safer by using triggers from event subscription tables. Rather than have a callback which fires off when a job is done, have an event table for done jobs so callbacks can be called once the whole run is finished. For example, if a scoring system has a callback from \`\`badGuyDies", then in an object-oriented message watcher you would have the scorer increment its internal score whenever it received the message that a badGuyDies. Instead, run each of the callbacks in the callback table once the whole set of badGuys has been checked for death. If you do that and execute every time all the badGuys have had their tick, then you can add points once for all badGuys killed. That means one read for the internal state, and one write. Much better than multiple reads and writes accumulating a final score.

For scripting, if you have scripts which run over multiple entities, consider how the graphics kernels operate with branches, sometimes using predication and doing both sides of a branch before selecting a solution. This would allow you to reduce the number of branches caused merely by interpreting the script on demand. If you go one step further an actually build SIMD into the scripting core, then you might find you can use scripts for a very large number of entities compared to traditional per entity serial scripting. If your SIMD operations operate over the whole collection of entities, then you will pay almost no price for script interpretation[8.4](https://www.dataorienteddesign.com/dodbook/footnode.html#foot2214).

## SIMD 

SIMD operations can be very beneficial as long as you have a decent chunk of work to do, such as making an operation that handles updating positions of particles (see listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:SIMD-particles)). This example of SIMDifying some code is straightforward, and in tests ran about four times faster than both the array of structs code and the naïve struct of arrays code.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Simple particle update with SIMD},label=src:SIMD-particles]{src/SIMD_particles.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x480,sB1wQaFv4eB6pLTTiHX150LiVNO0hUB_qwgW4jHQ9At8/https://www.dataorienteddesign.com/dodbook/img47.png)   

In many optimising compilers, simple vectorisation is carried out by default, but only as far as the compiler can figure things out. It's not often very easy to figure these things out.

SIMD operations on machines which support SSE, allow you to get more data into the CPU in one go. Many people started out by putting their 3D vectors into SIMD units, but that doesn't allow full utilisation of the SIMD pipeline. The example loads in four different particles at the same time, and updates them all at the same time too. This very simple technique also means you don't have to do anything clever with the data layout, as you can just use a naïve struct of arrays to prepare for SIMDification once you find it has become a bottleneck.

## Structs of arrays 

In addition to all the other benefits of keeping your runtime data in a database style format, there is the opportunity to take advantage of structures of arrays rather than arrays of structures. SoA has been coined as a term to describe an access pattern for object data. It is okay to keep hot and cold data side by side in an SoA object as data is pulled into the cache by necessity rather than by accidental physical location.

If your animation timekey/value class resembles this:

  
![\begin{lstlisting}[caption=animation timekey/value class]
struct Keyframe
{
flo...
...,y,z;
};
struct Stream
{
Keyframe *keyframes;
int numKeys;
};
\end{lstlisting}](https://proxy-prod.omnivore-image-cache.app/590x162,suAJxHzk6GgaQiSccTPkJ-bXqSeWYWVQmmXdfpk61I9Y/https://www.dataorienteddesign.com/dodbook/img48.png)   

then when you iterate over a large collection of them, all the data has to be pulled into the cache at once. If we assume that a cache line is 64 bytes, and the size of floats is 4 bytes, the Keyframe struct is 16 bytes. This means that every time you look up a key time, you accidentally pull in four keys and all the associated keyframe data. If you are doing a binary search of a 128 key stream, it could mean you end up loading 64 bytes of data and only using 4 bytes of it in up to 5 of the steps. If you change the data layout so the searching takes place in one array, and the data is stored separately, then you get structures that look like this:

  
![\begin{lstlisting}[caption=struct of arrays]
struct KeyData
{
float x,y,z;
// ...
...;
struct stream
{
float *times;
KeyData *values;
numKeys;
};
\end{lstlisting}](https://proxy-prod.omnivore-image-cache.app/594x190,spV7umfm2QJ06t7y3OqvLL6H8Mu-qqpfdNP55i1qz5a4/https://www.dataorienteddesign.com/dodbook/img49.png)   

Doing this means that for a 128 key stream, the key times only take up 8 cache lines in total, and a binary search is going to pull in at most three of them, and the data lookup is guaranteed to only require one, or two at most if your data straddles two cache lines due to choosing memory space efficiency over performance.

Database technology was here first. In DBMS terms, it's called column-oriented databases and they provide better throughput for data processing over traditional row-oriented relational databases simply because irrelevant data is not loaded when doing column aggregations or filtering. There are other features that make column-store databases more efficient, such as allowing them to collect many keys under one value instead of having a key value 1:1 mapping, but database advances are always being made, and it's worth hunting down current literature to see what else might be worth migrating to your codebase.

Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  



# links
[Read on Omnivore](https://omnivore.app/me/optimisations-18b3ee70b0f)
[Read Original](https://www.dataorienteddesign.com/dodbook/node9.html)

<iframe src="https://www.dataorienteddesign.com/dodbook/node9.html"  width="800" height="500"></iframe>
