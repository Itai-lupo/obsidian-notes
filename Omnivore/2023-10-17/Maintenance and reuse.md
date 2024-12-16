---
id: 2a48f43e-6d1b-11ee-838d-f7e72f148863
title: Maintenance and reuse
tags:
  - programing
  - Data-Oriented_Design
date: 2023-10-17 21:29:53
date_published: 2018-10-08 03:00:00
words_count: 3075
state: INBOX
---

# Maintenance and reuse by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Maintenance and reuse


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  
**Subsections** 
* [Cosmic hierarchies](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001110000000000000000)
* [Debugging](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001120000000000000000)  
   * [Lifetimes](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001121000000000000000)  
   * [Avoiding pointers](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001122000000000000000)  
   * [Bad State](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001123000000000000000)
* [Reusability](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001130000000000000000)
* [Reusable functions](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001140000000000000000)
* [Unit testing](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001150000000000000000)
* [Refactoring](https://www.dataorienteddesign.com/dodbook/node11.html#SECTION001160000000000000000)

---

When object-oriented design was first promoted, it was said to be easier to modify and extend existing code bases than the more traditional procedural approach. Though it is not true in practice, it is often cited by object-oriented developers when reading about other programming paradigms. Regardless of their level of expertise, an object-oriented programmer will very likely cite the extensible, encapsulating nature of object-oriented development as a boon when it comes to working on larger projects.

Highly experienced but more objective developers have admitted or even written about how object-oriented C++ is not highly suited to big projects with lots of dependencies, but can be used as long as you follow strict guidelines such as those found in the Large-scale C++ book\[#!LargeScaleCpp!#\]. For those who cannot immediately see the benefit of the data-oriented development paradigm with respect to maintenance and evolutionary development, this chapter covers why it is easier than working with objects.

## Cosmic hierarchies 

Whatever you call them, be it Cosmic Base Class, Root of all Evil, Gotcha #97, or CObject, having a base class that everything derives from has pretty much been a universal failure point in large C++ projects. The language does not naturally support introspection or duck typing, so it has difficulty utilising CObjects effectively. If we have a database driven approach, the idea of a cosmic base class might make a subtle entrance right at the beginning by appearing as the entity to which all other components are adjectives about, thus not letting anything be anything other than an entity. Although component-based engines can often be found sporting an EntityID as their owner, not all require owners. Not all have only one owner. When you normalise databases, you find you have a collection of different entity types. In our level file example, we saw how the objects we started with turned into a MeshID, TextureID, RoomID, and a PickupID. We even saw the emergence through necessity of a DoorID. If we pile all these Ids into a central EntityID, the system should work fine, but it's not a necessary step. A lot of entity systems do take this approach, but as is the case with most movements, the first swing away from danger often swings too far. The balance is to be found in practical examples of data normalisation provided by the database industry.

## Debugging 

The prime causes of bugs are the unexpected side effects of a transform or an unexpected corner case where a conditional didn't return the correct value. In object-oriented programming, this can manifest in many ways, from an exception caused by de-referencing a null, to ignoring the interactions of the player because the game logic hadn't noticed it was meant to be interactive.

Holding the state of a system in your head, and playing computer to figure out what is going on, is where we get the idea that programmers absolutely need to be in the zone to get any real work done. The reality is probably far less thrilling. The reality is closer to the fear that programmers only need to be in the zone if the code is nearing deadly levels of complexity.

## Lifetimes 

One of the most common causes of the null dereference is when an object's lifetime is handled by a separate object to the one manipulating it. For example, if you are playing a game where the badguys can die, you have to be careful to update all the objects that are using them whenever the badguy gets deleted, otherwise, you can end up dereferencing invalid memory which can lead to dereferencing null pointers because the class has destructed. Data-oriented development tends towards this being impossible as the existence of an entity in an array implies its processability, and if you leave part of an entity around in a table, you haven't deleted the entity fully. This is a different kind of bug, but it's not a crash bug, and it's easier to find and kill as it's just making sure that when an entity is destroyed, all the tables it can be part of also destroy their elements too.

## Avoiding pointers 

When looking for data-oriented solutions to programming problems, we often find pointers aren't required, and often make the solution harder to scale. Using pointers where null values are possible implies each pointer doesn't only have the value of the object being pointed at, but also implies a boolean value for whether or not the instance exists. Removing this unnecessary extra feature can remove bugs, save time, and reduce complexity.

## Bad State 

Bugs have a lot to do with not being in the right state. Debugging, therefore, becomes a case of finding out how the game got into its current, broken state.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Modifying state can shadow history},label=src:history]{src/MAINT_history.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/594x231,s1u858q9a80tglD8LK8kRq40ZKEpfy-PejJvLw-HEBlQ/https://www.dataorienteddesign.com/dodbook/img61.png)   

Whenever you assign a value to a variable, you are destroying history. Take the example in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:history). The ideal of having only one return statement in a function can cause this kind of error with greater frequency than expected. Having more than one return point has its own problems. What's important is once you have got to the end of the function, it's hard to figure out what it was that caused it to fail validation. You can't even breakpoint the bail points. The recursive example is even more dangerous, as there's a whole tree of objects and it will recurse through all of them before returning, regardless of value, and again, is impossible to breakpoint.

When you encapsulate your state, you hide internal changes. This quickly leads to adding lots of debugging logs. Instead of hiding, data-oriented suggests keeping data in simple forms. Potentially, leaving it around longer than required can lead to highly simplified transform inspection. If you have a transform that appears to work, but for one odd case it doesn't, the simplicity of adding an assert and not deleting the input data can reduce the amount of guesswork and toil required to generate the reproduction required to understand the bug and make a clean fix. If you keep most of your transforms as one-way, that is to say, they take from one source, and produce or update another, then even if you run the code multiple times it will still produce the same results as it would have the first time. The transform is idempotent. This useful property allows you to find a bug symptom, then rewind and trace through the causes without having to attempt to rebuild the initial state.

One way of keeping your code idempotent is to write your transforms in a single assignment style. If you operate with multiple transforms but all leading to predicated join points, you can guarantee yourself some timings, and you can look back at what caused the final state to turn out like it did without even rewinding. If your conditions are condition tables, just leave the inputs around until validity checks have been completed then you have the ability to go into any live system and check how it arrived at that state. This alone should reduce any investigation time to a minimum.

## Reusability 

A feature commonly cited by the object-oriented developers which seems to be missing from data-oriented development is reusability. The idea that you won't be able to take already written libraries of code and use them again, or on multiple projects, because the design is partially within the implementation. To be sure, once you start optimising your code to the particular features of a software project, you do end up with code which cannot be reused. While developing data-oriented projects, the assumed inability to reuse source code would be significant, but it is also highly unlikely. The truth is found when considering the true meaning of reusability.

Reusability is not fundamentally concerned with reusing source files or libraries. Reusability is the ability to maintain an investment in information, or the invention of more vocabulary with which to communicate intention, such as with the STL, or with other libraries of structural code. In the primary example of reuse as sequences of actions, this is a wealth of knowledge for the entity that owns the development IP and is very nearly what patents are built on. In the latter, the vocabulary is often stumbled upon, rather than truly invented.

Copyright law has made it hard to see what resources have value in reuse, as it maintains the source as the object of its discussion rather than the intellectual property represented by the source. The reason for this is that ideas cannot be copyrighted, so by maintaining this stance, the copyrighter keeps hold of this tenuous link to a right to withhold information. Reusability comes from being aware of the information contained within the medium it is stored. In our case, it is normally stored as source code, but the information is not the source code. With object-oriented development, the source can be adapted (adapter pattern) to any project we wish to venture. However, the source is not the information. The information is the order and existence of tasks that can and will be performed on the data. Viewing the information this way leads to an understanding that any reusability a programming technique can provide comes down to its mutability of inputs and outputs. Its willingness to adapt a set of temporally coupled tasks into a new usage framework is how you can find out how well it functions reusably.

In object-oriented development, you apply the information inherent in the code by adapting a class that does the job, or wrapper it, or use an agent. In data-oriented development, you copy the functions and schema and transform into and out of the input and output data structures around the time you apply the information contained in the data-oriented transform.

Even though, at first sight, data-oriented code doesn't appear as reusable on the outside, the fact is, it maintains the same amount of information in a simpler form, so it's more reusable as it doesn't carry the baggage of related data or functions like object-oriented programming, and doesn't require complex transforms to generate the input and extract from the output like procedural programming tends to generate due to the normalising.

Duck typing, not normally available in object-oriented programming due to a stricter set of rules on how to interface between data, can be implemented with templates to great effect, turning code which might not be obviously reusable into a simple strategy, or a sequence of transforms which can be applied to data or structures of any type, as long as they maintain a naming convention.

The object-oriented C++ idea of reusability is a mixture of information and architecture. Developing from a data-oriented transform centric viewpoint, architecture just seems like a lot of fluff code. The only good architecture that's worth saving is the actualisation of data-flow and transform. There are situations where an object-oriented module can be used again, but they are few and far between because of the inherent difficulty interfacing object-oriented projects with each other.

The most reusable object-oriented code appears as interfaces to agents into a much more complex system. The best example of an object-oriented approach that made everything easier to handle, that was highly reusable, and was fully encapsulated was the FILE type from stdio.h which is used as an agent into whatever the platform and OS would need to open, access, write, and read to and from a file on the system.

## Reusable functions 

Apart from the freedom of extension when it comes to keeping all your data in simple linear arrangements, there is also an implicit tendency to turn out accidentally reusable solutions to problems. This is caused by the data being formatted much more rigidly, and therefore when it fits, can almost be seen as a type of duck-typing. If the data can fit a transform, a transform should be able to act on it. Some would argue, just because the types match, it doesn't mean the function will create the expected outcome, but in addition to this being avoidable by not reusing code you don't understand, in some cases, all you need is to know the signature to understand the transform. As an extreme example, it's possible to understand a fair number of Haskell functions purely based on their arguments. Finally, because the code becomes much more penetrable, it takes less time to look at what a transform is doing before committing to reusing it in your own code.

Because the data is built in the same way each time, handled with transforms and always being held in the same types of container, there is a very good chance there are multiple design agnostic optimisations which can be applied to many parts of the code. General purpose sorting, counting, searches and spatial awareness systems can be attached to new data without calling for OOP adapters or implementing interfaces so Strategies can run over them. This is why it's possible to have generalised query optimisations in databases, and if you start to develop your code this way, you can carry your optimisations with you across more projects.

## Unit testing 

Unit testing can be very helpful when developing games, but because of the object-oriented paradigm making programmers think about code as representations of objects, and not as data transforms, it's hard to see what can be tested. Linking together unrelated concepts into the same object and requiring complex setup state before a test can be carried out, has given unit testing a stunted start in games as object-oriented programming caused simple tests to be hard to write. Making tests is further complicated by the addition of the non-obvious nature of how objects are transformed when they represent entities in a game world. It can be very hard to write unit tests unless you've been working with them for a while, and the main point of unit tests is that someone who doesn't fully grok the system can make changes without falling foul of making things worse.

Unit testing is mostly useful during refactorings, taking a game or engine from one code and data layout into another one, ready for future changes. Usually, this is done because the data is in the wrong shape, which in itself is harder to do if you normalise your data as you're more likely to have left the data in an unconfigured form. There will obviously be times when even normalised data is not sufficient, such as when the design of the game changes sufficient to render the original data-analysis incorrect, or at the very least, ineffective or inefficient.

Unit testing is simple with data-oriented technique because you are already concentrating on the transform. Generating tables of test data would be part of your development, so leaving some in as unit tests would be simple, if not part of the process of developing the game. Using unit tests to help guide the code could be considered to be partial following the test-driven development technique, a proven good way to generate efficient and clear code.

Remember, when you're doing data-oriented development your game is entirely driven by stateful data and stateless transforms. It is very simple to produce unit tests for your transforms. You don't even need a framework, just an input and output table and then a comparison function to check the transform produced the right data.

## Refactoring 

During refactoring, it's always important to know you've not broken anything by changing the code. Allowing for such simple unit testing gets you halfway there. Another advantage of data-oriented development is that, at every turn, it peels away the unnecessary elements. You might find refactoring is more a case of switching out the order of transforms than changing how things are represented. Refactoring normally involves some new data representation, but as long as you build your structures with normalisation in mind, there's going to be little need of that. When it is needed, tools for converting from one schema to another could be written once and used many times.

It might come to pass, as you work with normalised data, that you realise the reason you were refactoring so much in the first place, was that you had embedded meaning in the code by putting the data in objects with names, and methods that did things to the objects, rather than transformed the data.

Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  



# links
[Read on Omnivore](https://omnivore.app/me/maintenance-and-reuse-18b3ee6c71b)
[Read Original](https://www.dataorienteddesign.com/dodbook/node11.html)

<iframe src="https://www.dataorienteddesign.com/dodbook/node11.html"  width="800" height="500"></iframe>
