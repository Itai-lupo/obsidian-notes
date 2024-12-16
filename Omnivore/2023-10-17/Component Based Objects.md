---
id: 4385c648-6d1b-11ee-a475-bfb68f7e64a7
title: Component Based Objects
tags:
  - programing
  - Data-Oriented_Design
date: 2023-10-17 21:30:35
date_published: 2018-10-08 03:00:00
words_count: 3344
state: INBOX
---

# Component Based Objects by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Component Based Objects


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  
**Subsections** 
* [Components in the wild](https://www.dataorienteddesign.com/dodbook/node5.html#SECTION00510000000000000000)
* [Away from the hierarchy](https://www.dataorienteddesign.com/dodbook/node5.html#SECTION00520000000000000000)
* [Towards managers](https://www.dataorienteddesign.com/dodbook/node5.html#SECTION00530000000000000000)
* [There is no entity](https://www.dataorienteddesign.com/dodbook/node5.html#SECTION00540000000000000000)

---

A component-oriented design is a good start for high-level data-oriented design. Developing with components can put you in the right frame of mind to avoid linking together concepts needlessly. Objects built this way can more easily be processed by type, instead of by instance, which can lead to them being easier to profile. Entity systems built around them are often found in game development as a way to provide data-driven functionality packs for entities, allowing for designer control over what would normally be in the realm of a programmer. Not only are component based entities better for rapid design changes, but they also stymie the chances of getting bogged down into monolithic objects, as most game designers would demand more components with new features over extending the scope of existing components. This is because most new designs need iterating on, and extending an existing component by code to introduce design changes wouldn't allow game designers to switch back and forth trying out different things as easily. It's usually more flexible to add another component as an extension or as an alternative.

A problem that comes up with talking about component-oriented development is how many different types of entity component systems there are. To help clear the ambiguity, we shall describe some different ways in which component-oriented designs work.

The first kind of component-oriented approach most people use is a compound object. There are a few engines that use them this way, and most of them use the power of their scripting language to help them achieve a flexible, and designer friendly way to edit and create objects out of components. For example, Unity's GameObject is a base entity type which can include components by adding them to that particular instance's list of components. They are all built onto the core entity object, and they refer to each other through it. This approach means every entity still tends to update via iteration over root instances, not iteration over systems.

Common dialogue around creating compound objects frequently refers to using components to make up an object directly by including them as members of the object. Though this is better than a monolithic class, it is not yet a fully component based approach. This technique uses components to make the object more readable, and potentially more reusable and robust to change. These systems are extensible enough to support large ecosystems of components shareable between projects. The Unity Asset Store proves the worth of components from the point of view of rapid development.

When you introduce component based entities, you have an opportunity to turn the idea of how you define an object on its head. The normal approach to defining an object in object-oriented design is to name it, then fill out the details as and when they become necessary. For example, your car object is defined as a Car, if not extending Vehicle, then at least including some data about what physics and meshes are needed, with construction arguments for wheels and body shell model assets etc, possibly changing class dependent on whether it's an AI or player car. In component-oriented design, objects aren't so rigidly defined, and don't so much become defined after they are named, as much as a definition is selected or compiled, and then tagged with a name if necessary. For example, instancing a physics component with four-wheel physics, instancing a renderable for each part (wheels, shell, suspension) adding an AI or player component to control the inputs for the physics component, all adds up to something which we can tag as a Car, or leave as is and it becomes something implicit rather than explicit and immutable.

A truly component based object is nothing more than the sum of its parts. This means the definition of a component based object is also nothing more than an inventory with some construction arguments. This object or definition agnostic approach makes refactoring and redesigning a much simpler exercise. Unity's ECS provides such a solution. In the ECS, entities are intangible and implicit, and the components are first class citizens.

## Components in the wild 

Component based approaches to development have been tried and tested. Many high-profile studios have used component driven entity systems to great success[4.1](https://www.dataorienteddesign.com/dodbook/footnode.html#foot1314), and this was in part due to their developer's unspoken understanding that objects aren't a good place to store all your data and traits. For some, it was the opportunity to present the complexity of what makes up an entity through simpler pieces, so designers and modders would be able to reason about how their changes fit within the game framework. For some, it was about giving power over to performance, where components are more easily moved to a structure-of-arrays approach to processing.

Gas Powered Games' Dungeon Siege Architecture is probably the earliest published document about a game company using a component based approach. If you get a chance, you should read the article\[#!GasPowered!#\] to see where things really kicked off. The article explains that using components means the entity type[4.2](https://www.dataorienteddesign.com/dodbook/footnode.html#foot1316) doesn't need to have the ability to do anything. Instead, all the attributes and functionality come from the components of which the entity is made.

The list of reasons to move to a manager driven, component based approach are numerous, and we shall attempt to cover at least a few. We will talk about the benefits of clear update sequences. We will mention how components can make it easier to debug. We will talk about the problem of objects applying meaning to data, causing coupling, and therefore with the dissolution of the object as the central entity, how the tyranny of the instance is mitigated.

In this section, we'll show how we can take an existing class and rewrite it in a component based fashion. We're going to tackle a fairly typical complex object, the Player class. Normally these classes get messy and out of hand quite quickly. We're going to assume it's a Player class designed for a generic 3rd person action game, and take a typically messy class as our starting point. We shall use listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:monolithicplayer) as a reference example of one such class.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Monolithic Player class},label=src:monolithicplayer]{src/COMP_Monolithic.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x708,slLiQ1mGEAhw_e4YNFLaDJT_HNQKdEH5fqFnOWSbilQg/https://www.dataorienteddesign.com/dodbook/img18.png)   

This example class includes many of the types of things found in games, where the codebase has grown organically. It's common for the Player class to have lots of helper functions to make writing game code easier. Helper functions typically consider the Player as an instance in itself, from data in save through to rendering on screen. It's not unusual for the Player class to touch nearly every aspect of a game, as the human player is the target of the code in the first place, the Player class is going to reference nearly everything too.

AI characters will have similarly gnarly looking classes if they are generalised rather than specialised. Specialising AI was more commonplace when games needed to fit in smaller machines, but now, because the Player class has to interact with many of them over the course of the game, they tend to be unified into one type just like the player, if not the same as the player, to help simplify the code that allows them to interact. As of writing, the way in which AI is differentiated is mostly by data, with behaviour trees taking the main stage for driving how AI thinks about its world. Behaviour trees are another concept subject to various interpretations, so some forms are data-oriented design friendly, and others are not.

## Away from the hierarchy 

A recurring theme in articles and post-mortems from people moving from object-oriented hierarchies of gameplay classes to a component based approach is the transitional states of turning their classes into containers of smaller objects, an approach often called composition. This transitional form takes an existing class and finds the boundaries between concepts internal to the class and attempts to refactor them out into new classes which can be owned or pointed to by the original class. From our monolithic player class, we can see there are lots of things that are not directly related, but that does not mean they are not linked together.

Object-oriented hierarchies are is-a relationships, and components and composition oriented designs are traditionally thought of as has-arelationships. Moving from one to the other can be thought of as delegating responsibility or moving away from being locked into what you are, but having a looser role and keeping the specialisation until further down the tree. Composition clears up most of the common cases of diamond inheritance issues, as capabilities of the classes are added by accretion as much as they are added by overriding. 

The first move we need to make will be to take related pieces of our monolithic class and move them into their own classes, along the lines of composing, changing the class from owning all the data and the actions that modify the data into having instances which contain data and delegating actions down into those specialised structures where possible. We move the data out into separate structures so they can be more easily combined into new classes later. We will initially only separate by categories we perceive as being the boundaries between systems. For example, we separate rendering from controller input, from gameplay details such as inventory, and we split out animation from all.

Taking a look at the results of splitting the player class up, such as in listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:compositeplayer), it's possible to make some initial assessments of how this may turn out. We can see how a first pass of building a class out of smaller classes can help organise the data into distinct, purpose oriented collections, but we can also see the reason why a class ends up being a tangled mess. When you think about the needs of each of the pieces, what their data requirements are, the coupling can become evident. The rendering functions need access to the player's position as well as the model, and the gameplay functions such as Shoot(Vec target) need access to the inventory as well as setting animations and dealing damage. Taking damage will need access to the animations and health. Things are already seeming more difficult to handle than expected, but what's really happening here is that it's becoming clear that code needs to cut across different pieces of data. With just this first pass, we can start to see that functionality and data don't belong together.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Composite Player class},label=src:compositeplayer]{src/COMP_Composite.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x586,ske3FkxRgfIPsSKtvtSX3QV5GyTiBKUwvGcRRHci7mD0/https://www.dataorienteddesign.com/dodbook/img19.png)   

In this first step, we made the player class a container for the components. Currently, the player has the components, and the player class has to be instantiated to make a player exist. To allow for the cleanest separation into components in the most reusable way, it's worth attempting to move components into being managed by managers, and not handled or updated by their entities. In doing this, there will also be a benefit of cache locality when we're iterating over multiple entities doing related tasks when we move them away from their owners.

This is where it gets a bit philosophical. Each system has an idea of the data it needs in order to function, and even though they will overlap, they will not share all data. Consider what it is that a serialisation system needs to know about a character. It is unlikely to care about the current state of the animation system, but it will care about inventory. The rendering system will care about position and animation, but won't care about the current amount of ammo. The UI rendering code won't even care about where the player is, but will care about inventory and their health and damage. This difference of interest is at the heart of why putting all the data in one class isn't a good long-term solution.

The functionality of a class, or an object, comes from how the internal state is interpreted, and how the changes to state over time are interpreted too. The relationship between facts is part of the problem domain and could be called meaning, but the facts are only raw data. This separation of fact from meaning is not possible with an object-oriented approach, which is why every time a fact acquires a new meaning, the meaning has to be implemented as part of the class containing the fact. Dissolving the class, extracting the facts and keeping them as separate components, has given us the chance to move away from classes that instill permanent meaning at the expense of occasionally having to look up facts via less direct methods. Rather than store all the possibly associated data by meaning, we choose to only add meaning when necessary. We add meaning when it is part of the immediate problem we are trying to solve.

## Towards managers 

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Manager ticked components},label=src:managers]{src/COMP_Managers.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x658,sw1R1TCBNXtwGIwz-h8tKiK_XtBHkOouC2fTp4jSmoTc/https://www.dataorienteddesign.com/dodbook/img20.png)   

After splitting your classes up into components, you might find your classes look more awkward now they are accessing variables hidden away in new structures. But it's not your classes that should be looking up variables, but instead transforms on the classes. A common operation such as rendering requires the position and the model information, but it also requires access to the renderer. Such object boundary crossing access is seen as a compromise during game development, but here it can be seen as the method by which we move away from a class-centric approach to a data-oriented approach. We will aim at transforming our data into render requests which affect the graphics pipeline without referring to data unimportant to the renderer.

Referring to listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:managers), we move to no longer having a player update, but instead an update for each component that makes up the player. This way, everyone entity's physics is updated before it is rendered, or could be updated while the rendering is happening on another thread. All entity's controls (whether they be player or AI) can be updated before they are animated. Having the managers control when the code is executed is a large part of the leap towards fully parallelisable code. This is where performance can be gained with more confidence that it's not negatively impacting other areas. Analysing which components need updating every frame, and which can be updated less frequently leads to optimisations that unlock components from each other.

In many component systems that allow scripting languages to define the actions taken by components or their entities, performance can fall foul of the same inefficiencies present in an object-oriented program design. Notably, the dependency inversion practice of calling Tick or Updatefunctions will often have to be sandboxed in some way which will lead to error checking and other safety measures wrapping the internal call. There is a good example of this being an issue with the older versions of Unity, where their component based approach allowed every instance to have its own script which would have its own call from the core of Unity on every frame. The main cost appeared to be transitioning in and out of the scripting language, crossing the boundary between the C++ at the core, and the script that described the behaviour of the component. In his article 10,000 Update() calls\[#!TenKUpdate!#\], Valentin Simonov provided information on why the move to managers makes so much sense, giving details on what is costing the most when utilising dependency inversion to drive your general code update strategies. The main cost was in moving between the different areas of code, but even without having to straddle the language barrier, managers make sense as they ensure updates to components happen in sync.

What happens when we let more than just the player use these arrays? Normally we'd have some separate logic for handling player fire until we refactored the weapons to be generic weapons with NPCs using the same code for weapons probably by having a new weapon class that can be pointed to by the player or an NPC, but instead what we have here is a way to split off the weapon firing code in such a way as to allow the player and the NPC to share firing code without inventing a new class to hold the firing. In fact, what we've done is split the firing up into the different tasks it really contains.

Tasks are good for parallel processing, and with component based objects, we open up the opportunity to move most of our previously class oriented processes out, and into more generic tasks that can be dished out to whatever CPU or co-processor can handle them.

## There is no entity 

What happens when we completely remove the Player class? If an entity can be represented by its collection of components, does it need any further identity than those self same components? Like the values in the rows of a table, the components describe a single instance, but also like the rows in a table, the table is also a set. In the universe of possibilities of component combinations, the components which make up the entity are not facts about the entity, but are the entity, and are the only identity the entity needs. As an entity is its current configuration of components, then there is the possibility of removing the core Player class completely. Removing this class can mean we no longer think of the player as being the centre of the game, but because the class no longer exists, it means the code is no longer tied to a specific singular entity. Listing [![[*]](https://proxy-prod.omnivore-image-cache.app/0x0,s991B_8tWlmrBvK-UCjL4pMAooHEKDYOteLTX2TtxPcY/https://www.dataorienteddesign.com/dodbook/icons/crossref.png)](#src:sparse) shows a rough example of how you might develop this kind of setup.

  
![\begin{linespread}{0.75}\lstinputlisting[language=C,caption={Sparse arrays for components},label=src:sparse]{src/COMP_Sparse.cpp}\end{linespread}](https://proxy-prod.omnivore-image-cache.app/595x265,srJGXjiOKEL5cztcwoniAfvJ_J03Q3Hn7hsHZGb_BPTI/https://www.dataorienteddesign.com/dodbook/img21.png)   

Moving away from compile-time defined classes means many other classes can be invented without adding much code. Allowing scripts to generate new classes of entity by composition or prototyping increases their power dramatically, and cleanly increase the apparent complexity of the game without adding more actual complexity. Finally, all the different entities in the game will now run the same code at the same time, which simplifies and centralises your processing code, leading to more opportunity to share optimisations, and fewer places for bugs to hide.

Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  



# links
[Read on Omnivore](https://omnivore.app/me/component-based-objects-18b3ee76c8e)
[Read Original](https://www.dataorienteddesign.com/dodbook/node5.html)

<iframe src="https://www.dataorienteddesign.com/dodbook/node5.html"  width="800" height="500"></iframe>
