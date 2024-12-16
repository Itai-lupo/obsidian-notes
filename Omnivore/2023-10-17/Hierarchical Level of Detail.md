---
id: 3f334cfa-6d1b-11ee-bb95-a3752041d96a
title: Hierarchical Level of Detail
tags:
  - programing
  - Data-Oriented_Design
date: 2023-10-17 21:31:21
date_published: 2018-10-08 03:00:00
words_count: 5172
state: INBOX
---

# Hierarchical Level of Detail by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Hierarchical Level of Detail


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  
**Subsections** 
* [Existence](https://www.dataorienteddesign.com/dodbook/node6.html#SECTION00610000000000000000)
* [Mementos](https://www.dataorienteddesign.com/dodbook/node6.html#SECTION00620000000000000000)
* [JIT mementos](https://www.dataorienteddesign.com/dodbook/node6.html#SECTION00630000000000000000)
* [Alternative axes](https://www.dataorienteddesign.com/dodbook/node6.html#SECTION00640000000000000000)  
   * [The true measure](https://www.dataorienteddesign.com/dodbook/node6.html#SECTION00641000000000000000)  
   * [Beyond space](https://www.dataorienteddesign.com/dodbook/node6.html#SECTION00642000000000000000)
* [Collective LOD](https://www.dataorienteddesign.com/dodbook/node6.html#SECTION00650000000000000000)

---

Consoles and graphics cards are not generally bottlenecked at the polygon rendering stage in the pipeline. Usually, they are bandwidth bound. If there is a lot of alpha blending, it's often fill-rate issues. For the most part, graphics chips spend a lot of their time reading textures, and texture bandwidth often becomes the bottleneck. Because of this, the old way of doing level of detail with multiple meshes with decreasing numbers of polygons is never going to be as good as a technique which takes into account the actual data required of the level of detail used in each renderable. The vast majority of stalls when rendering come from driver side processing, or from processing too much for what you want to actually render. Hierarchical level of detail can fix the problem of high primitive count which causes more driver calls than necessary.

The basic approach for art is to make optimisations by grouping and merging many low level of detail meshes into one single low level of detail mesh. This reduces the time spent in the setup of render calls which is beneficial in situations where driver calls are costly. In a typical very large scale environment, a hierarchical level of detail approach to game content can reduce the workload on a game engine by an order of magnitude as the number of entities in the scene considered for processing and rendering drops significantly.

Even though the number of polygons rendered may be exactly the same, or maybe even higher, the fact that the engine usually is only handling roughly the same number of entities at once on average increases stability and allows for more accurately targeted optimisations of both art and code.

## Existence from Null to Infinity 

If we consider that entities can be implicit based on their attributes, we can utilise the technique of hierarchical level of detail to offer up some optimisations for our code. In traditional level of detail techniques, as we move further away from the object or entity of interest, we lose details and fidelity. We might reduce polygon count, or texture sizes, or even the number of bones in a skeleton that drives the skinned mesh. Game logic can also degrade. Moving away from an entity, it might switch to a much coarser grain time step. It's not unheard of for behaviours of AI to migrate from a 50hz update to a 1hz update. In a hierarchical level of detail implementation, as the entity becomes closer, or more apparent to the player, it might be that only at that point does it even begin to exist.

Consider a shooter game where you are defending a base from incoming attacks. You are manning an anti-air turret, and the attackers come in squadrons of aircraft, you can see them all coming at once, over ten thousand aircraft in all, and up to a hundred at once in each squadron. You have to shoot them down or be inundated with gunfire and bombs, taking out both you and the base you are defending.

Running full AI, with swarming for motion and avoidance for your slower moving ordnance might be too much if it was run on all ten thousand ships every tick, but you don't need to. The basic assumption made by most AI programmers is that unless they are within attacking range, then they don't need to be running AI. This is true and offers an immediate speedup compared to the naïve approach. Hierarchical LOD provides another way to think about this, by changing the number of entities based on how they are perceived by the player. For want of a better term, collective lodding  is a name that describes what is happening behind the scenes a little better. Sometimes there is no hierarchy, and yet, there can still be a change in the manner in which the elements are referenced between the levels of detail. The term collective lodding is inspired by the concept of a collective term. A murder of crows is a computational element, but each crow is a lower level of detail sub-element of the collective.

![$\displaystyle \xymatrix{
& Murder \ar[dl] \ar[d] \ar[dr] & \\
Crow & Crow & Crow }
$](https://proxy-prod.omnivore-image-cache.app/245x135,sTDvZLdqCNw3JggvTWfF0L5ungaacPvMNOeWNqO5jwDU/https://www.dataorienteddesign.com/dodbook/img22.png) 

In the collective lodding version of the base defender game, there are a few wave entities which project squadron blips on the radar. The squadrons don't exist as their own entities until they get close enough. Once a wave's squadron is within range, the wave will decrease its squadron count and pop out a new squadron entity. The newly created squadron entity shows blips on the radar for each of its component aircraft. The aircraft don't exist yet, but they are implicit in the squadron in the same way the squadron was implicit in the wave. The wave continues to pop Squadrons as they come into range, and once its internal count has dropped to zero, it can delete itself as it now represents no entities. As a squadron comes into even closer range, it pops out its aircraft into their own entities and eventually deletes itself. As the aircraft get closer, traditional level of detail techniques kick in and their renderables are allowed to switch to higher resolution and their AI is allowed to run at a higher intelligence setting.

![$\displaystyle \xymatrix{
& Blip \ar[dl] \ar[d] \ar[dr] & \\
Squadron & Squad...
...craft \ar[dl] \ar[d] \ar[dr] & Aircraft \\
EjectingPilot & Fuselage & Wing }
$](https://proxy-prod.omnivore-image-cache.app/347x398,s3citE7XZQm04ix_u0J3k3qecqbAM93oFn6CmHiXu5Hk/https://www.dataorienteddesign.com/dodbook/img23.png) 

When the aircraft are shot at, they switch to a taken damage type. They are full health enemy aircraft unless they take damage. If an AI reacts to damage with fear, they may eject, adding another entity to the world. If the wing of the plane is shot off, then that also becomes a new entity in the world. Once a plane has crashed, it can delete its entity and replace it with a smoking wreck entity that will be much simpler to process than an aerodynamic simulation, faked or not.

If things get out of hand and the player can't keep the aircraft at bay and their numbers increase in size so much that any normal level of detail system can't kick in to mitigate it, collective lodding can still help by returning aircraft to squadrons and flying them around the base attacking as a group, rather than as individual aircraft. In the board game Warhammer Fantasy Battle, there were often so many troops firing arrows at each other, that players would often think of attacks by squads as being collections of attacks, and not actually roll for each individual soldier, rat, orc or whatever it was, but instead counted up how many troops they had, and rolled that many dice to see how many attacks got through. This is what is meant by attacking as a squadron. The aircraft no longer attack, instead, the likelihood an attack will succeed is calculated, dice are rolled, and that many attacks get through. The level of detail heuristic can be tuned so the nearest and front-most squadron are always the highest level of detail, effectively making them roll individually, and the ones behind the player maintain a very simplistic representation.

This is game development smoke and mirrors as a basic game engine element. In the past we have reduced the number of concurrent attacking AI[5.1](https://www.dataorienteddesign.com/dodbook/footnode.html#foot1448), reduced the number of cars on screen by staggering the lineup over the whole race track[5.2](https://www.dataorienteddesign.com/dodbook/footnode.html#foot1449), and we've literally combined people together into one person instead of having loads of people on screen at once[5.3](https://www.dataorienteddesign.com/dodbook/footnode.html#foot1450). This kind of reduction of processing is commonplace. Now consider using it everywhere appropriate, not just when a player is not looking.

## Mementos 

Reducing detail introduces an old problem, though. Changing level of detail in game logic systems, AI and such, brings with it the loss of high detail history. In this case, we need a way to store what is needed to maintain a highly cohesive player experience. If a high detail squadron in front of the player goes out of sight and another squadron takes their place, we still want any damage done to the first group to reappear when they come into sight again. Imagine if you had shot out the glass on all the aircraft and when they came round again, it was all back the way it was when they first arrived. A cosmetic effect, but one that is jarring and makes it harder to suspend disbelief.

When a high detail entity drops to a lower level of detail, it should store a memento, a small, well-compressed nugget of data that contains all the necessary information in order to rebuild the higher detail entity from the lower detail one. When the squadron drops out of sight, it stores a memento containing compressed information about the amount of damage, where it was damaged, and rough positions of all the aircraft in the squadron. When the squadron comes into view once more, it can read this data and generate the high detail entities back in the state they were before. Lossy compression is fine for most things, it doesn't matter precisely which windows, or how they were cracked, maybe just that about ![$ 2/3$](https://proxy-prod.omnivore-image-cache.app/28x31,suS3B62RI-xEHZfxBDN3lURfe1OBCNAj0G5qVRlpkR1Q/https://www.dataorienteddesign.com/dodbook/img24.png) of the windows were broken.

![$\displaystyle \xymatrix{
HighDetail \ar[dr]^{store} && HighDetail \\
& Memento \ar[ur]^{extract} & }
$](https://proxy-prod.omnivore-image-cache.app/344x140,sxcwwtyTF9nHScxAW9VZmyyrT5GpHmnGlBJTRltw33-g/https://www.dataorienteddesign.com/dodbook/img25.png) 

Another example is in a city-based free-roaming game. If AIs are allowed to enter vehicles and get out of them, then there is a good possibility you can reduce processing time by removing the AIs from the world when they enter a vehicle. If they are a passenger, then they only need enough information to rebuild them and nothing else. If they are the driver, then you might want to create a new driver type based on some attributes of the pedestrian before making the memento for when they exit the vehicle.

If a vehicle reaches a certain distance away from the player, then you can delete it. To keep performance high, you can change the priorities of vehicles that have mementos so they try to lose sight of the player thus allowing for earlier removal from the game. Optimisations like this are hard to coordinate in object-oriented systems as internal inspection of types isn't encouraged. Some games get around it by designing in ways to reset memento data as a gameplay element. The game Zelda: Breath of the Wild resets monsters during a Blood Moon, and by doing so, you as a player, are not surprised when you return to camps to find all the monsters are just as you left them.

## JIT mementos 

If a vehicle that has been created as part of the ambient population is suddenly required to take on a more important role, such as the car being involved in a firefight, it needs to gain detail. This detail must come from somewhere and must be convincing. It is important to generate new entities which don't seem overly generic or unlikely, given what the player knows about the game so far. Generating that data can be thought of as providing a memento to read from just in time. Just in time mementos, or JIT mementos, offers a way to create fake mementos that can provide continuity by utilising pseudo-random generators or hash functions to create suitable information on demand without relying on storing data anywhere. Instead, they rely only on information provided implicitly by the entity in need of it.

Instead of generating new characters from a global random number generator, it is possible to seed the generator with details about the thing that needs generation. For example, you want to generate a driver and some passengers, as you're about to get close enough to a car to need to render the people inside it. Just creating random characters from a set of lookup tables is good, but if you drive past them far enough for them to get out of rendering range, and then return, the people in the car might not look the same anymore as they had to be regenerated. Instead, generate the driver and passengers using some other unique attribute, such as the license plate, as a seed. This way, while you have not affected the result of generating the memento, you have no memory overhead to store it, and no object lifetime to worry about either, as it can always be reproduced from nothing again.

![$\displaystyle \xymatrix{
& Vehicle \ar[dl]_{seed} & \\
PassengerStub \ar[dr]_{seed} \ar@{=>}[rr] && Character \\
& Memento \ar[ur]_{extract} & }
$](https://proxy-prod.omnivore-image-cache.app/360x259,sCTjuYxRg2Fyw9b1R2sPsI_gw-PDe9ab9Cerk91QLgks/https://www.dataorienteddesign.com/dodbook/img26.png) 

This technique is used all the time in landscape generators, where the landscape is seeded from the x,y location in the map, so why not use it when generating the weather for day 107 of the game? When generating Perlin noise, many algorithms call upon a noise function, but to have a reproducible landscape, the noise function must be a repeatable function, so it can create the same results over and over again. If you're generating a landscape, it's preferred for the noise function to be coherent, that is, for small variances in the input function, only small changes should be observed in the output. We don't need such qualities when generating JIT mementos, and a hash function which varies wildly with even the smallest change in the input will suffice.

An example of using this to create a JIT memento might be to generate a house for a given landscape. First, take any normal random number generator and seed it with the location of the building. Given the landscape the house is on, select from a building template and start generating random numbers to answer questions about the house the same way loading a file off disk answers questions about the object. How large is the house? Is it small, medium, large? Generate a random number and select one answer. How many rooms does it have based on the size? 2 or 3 for small, or (int)(7 + rand \* 10) for large. The point is, once you have seeded the random number generator, you're going to get the same results back every time you run through the same process. Every time you visit the house at {223.17,-100.5}, you're going to see the same 4 (or more) walls, and it will have the same paint job, broken windows, or perfect idyllic little frog pond in the back garden.

JIT mementos can be the basis of a highly textured environment with memento style sheets or style guides which can direct a feel bias for any mementos generated in those virtual spaces. Imagine a city style guide that specifies rules for occupants of cars. The style guide might claim that businessmen might share, but are much less likely to, that families have children in the back seats with an older adult driving. It might declare that young adults tend to drive around in pairs. Style guides help add believability to any generated data. Add in local changes such as having types of car linked to types of drivers. Have convertibles driven by well-dressed types or kids, low riders driven almost exclusively by their stereotypical owner, and imports and modded cars driven by young adults. In a space game, dirty hairy pilots of cargo ships, well turned out officers commanding yachts, rough and ready mercenaries in everything from a single seater to a dreadnought. Then, once you have the flavour in place, allow for a little surprise to bring it to life fully.

JIT mementos are a good way to keep the variety up, and style guides bias that so it comes without the impression that everyone is different so everyone is the same. When these biases are played out without being strictly adhered to, you can build a more textured environment. If your environment is heavily populated with completely different people all the time, there is nothing to hold onto, no patterns to recognise. When there are no patterns, the mind tends to see noise or consider it to be a samey soup. Even the most varied virtual worlds look bland when there is too much content all in the same place. Walk along the street and see if you can spot any identical paving slabs. You probably can, but also see the little bits of damage, decay, dirt, mistakes, and blemishes. To make an environment believable, you have to make it look like someone took a lot of effort trying to make it all conform.

## Alternative axes 

As with all things, take away an assumption and you can find other uses for a tool. Whenever you read about, or work with a level of detail system, you will be aware that the constraint on what level of detail is shown has always been some distance function in space. It's now time to take the assumption, discard it, and analyse what is really happening.

First, we find that if we take away the assumption of distance, we can infer the conditional as some kind of linear measure. This value normally comes from a function which takes the camera position and finds the relative distance to the entity under consideration. What we may also realise when discarding the distance assumption is a more fundamental understanding of what we are trying to do. We are using a single runtime variable to control the presentation state of the entities of our game. We use runtime variables to control the state of many parts of our game already, but in this case, there is a passive presentation response to the variable, or axis being monitored. The presentation is usually some graphical, or logical level of detail, but it could be something as important to the entity as its own existence.

## The true measure 

Distance is the measure we normally use to identify what level of detail something should be at, but it's not the metric we really need, it's just very closely related. In fact, it's inversely related. The true metric of level of detail should be how much of our perception an entity is taking up. If an entity is very large, and far away, it takes up as much of our perception as something small and nearby. All this time we have talked about hierarchical level of detail the elephant in the room has been the language used. We had waves on our radar. They took up as much perception attention as a single squadron, and a single squadron took up as much perceptual space as a single aircraft when it was in firing range.

Understand this concept: level of detail should be defined by how the player perceives a thing, at the range it is at. If you internalise this, you will be on your way to making good decisions about where the boundaries are between your levels of detail.

## Beyond space 

Let's now consider what other variables we can calculate that present an opportunity to remove details from the game's representation. We should consider anything which presents an opportunity to no longer process data unnecessarily. If some element of a game is not the player's current concern, or will fade from memory soon enough, we can dissolve it away. If we consider the probability of the player caring about a thing as a metric, then we begin to think about recollection and attention as measurable quantities we can use to drive how we end up representing it.

An entity that you know has the player's attention, but is hidden, maintains a large stake on the player's perception. That stake allows the entity to maintain a higher priority on level of detail than it would otherwise deserve. For example, a character the player is chasing in an assassination game, may be spotted only once at the beginning of the mission, but will have to remain at a high consistency of attribute throughout the mission, as they are the object the player cares about the most, coming second only to primitive needs such as survival. Even if the character slips into the crowd, and is not seen again until much later, they must look just like they did when you first caught sight of them.

Ask the question, how long until a player forgets about something that might otherwise be important? This information will help reduce memory usage as much as distance. If you have ever played Grand Theft Auto IV, you might have noticed that the cars can disappear just by not looking at them. As you turn around a few times you might notice the cars seem to be different each time you face their way. This is a stunning use of temporal level of detail. Cars which have been bumped into or driven and parked by the player remain where they were, because, in essence, the player put them there. Because the player has interacted with them, they are likely to remember they are there. However, ambient vehicles, whether they are police cruisers or civilian vehicles, are less important and don't normally get to keep any special status so can vanish when the player looks away.

At the opposite end of the scale, some games remember everything you have done. Kill enemies in the first few minutes of your game, loot their corpses, and chuck items around, then come back a hundred hours later and the items are still wherever you left them. Games like this store vast amounts of tiny details, and these details need careful storage otherwise they would cause continual and crushing performance degradation. Using spatially mapped mementos is one approach that can attempt to rationalise this kind of level of attention to player game interaction.

In addition to time-since-seen, some elements may base their level of detail on how far a player has progressed in the game, or how many of something a player has, or how many times they have done it. For example, a typical bartering animation might be cut shorter and shorter as the game uses the axis ofhow many recent barters to draw back the length of any non-interactive sections which could be caused by the event. This can be done simply, and the player will be thankful. Consider allowing multi-item transactions only after a certain number of single transactions have happened. In effect, you could set up gameplay elements, reactions to situations, triggers for tutorials, reminders, or extensions to gameplay options all through these abstracted level of detail style axes. Handling the idea of player expertise through axes of level of detail of gameplay mechanic depth or complexity.

This way of manipulating the present state of the game is safer from transition errors. These are errors that happen because going from one state to another may have set something to true when transitioning one direction, but might not set it back to false when transitioning the other way. You can think of the states as being implicit on the axis. When state is modified, it's prone to being modified incorrectly, or not modified at the right time. If state is tied to other variables, that is, if state is a function of other state, then it's less prone to inconsistency.

An example of where transition errors occur is in menu systems where all transitions should be reversible, sometimes you may find that going down two levels of menu, but back only one level, takes you back to where you started. For example, entering the options menu, then entering an adjust volume slider, but backing out of the slider might take you out of the options menu altogether. These bugs are common in UI code as there are large numbers of different layers of interaction. Player input is often captured in obscure ways compared to gameplay input response. A common problem with menus is one of ownership of the input for a particular frame. For example, if a player hits both the forward and backward button at the same time, a state machine UI might choose to enter whichever transition response comes first. Another might manage to accept the forward event, only to have the next menu accept the back event, but worst of all might be the unlikely, but seen in the wild, menu transitioning to two different menus at the same time. Sometimes the menu may transition due to external forces, and if there is player input captured in a different thread of execution, the game state can become disjoint and unresponsive. Consider a network game's lobby, where if everyone is ready to play, but the host of the game disconnects while you are entering into the options screen prior to game launch, in a traditional state-machine like approach to menus, where should the player return to once they exit the options screen? The lobby would normally have dropped you back to a server search screen, but in this case, the lobby has gone away to be replaced with nothing. This is where having simple axes instead of state machines can prove to be simpler to the point of being less buggy and more responsive.

## Collective lodding - or how to reduce your instance count. 

It's an ugly term, and I hope one day someone comes up with a better one, but it's a technique that didn't need a name until people stopped doing it. Over the time it has taken to write this book, games have started to have too many instances. We're not talking about games that have hundreds of enemy spacecraft, battling each other in a desperate fight for superiority, firing off missile after missile, generating visual effects which spawn multiple GPU particles. We're talking about simple seeming games. We're talking about your average gardening simulator, where for some reason, every leaf on your plants is modeled as an instance, and every insect going around pollinating is an instance, and every plot of land in which your plants can grow is an instance, and every seed you sew is an instance, and each have their own lifetimes, components, animations, and their own internal state adding to the ever-growing complexity of the system as a whole.

I have a fictional farming game, where I harvest wheat. I have a field which is 100 by 100 tiles, each with wheat growing. In some games, those wheat tiles would be instances, and the wheat on the tiles would be instances too. There's little reason for this, as we can reduce the field down to some very small data. What do we actually need to know about the field and the wheat? Do we need to know the position of the wheat? We don't, because it's in a tiled grid. Do we need to know if the tile has wheat or not? Yes, but it doesn't need an object instance to tell us that. Do we need an object to render the wheat? It needs to blow in the wind, so don't we need to have it keep track of where it is to blow around and maintain momentum? No, because in almost all cases, cheating at this kind of thing is cheap and believable. Grass rendering works fine without an instance per blade of grass. The right data format for a field full of wheat could be as simple as 10,000 unsigned chars, with zero being no wheat, and values from 1 to 100 being how grown it is. The wheat doesn't have positions. The positions have wheat.

If you have a stack of blocks in Minecraft, you don't have 64 instances in your inventory slot, you just have a type, and a multiple. You have a stack. If you have a stack of plates in a restaurant sim, you don't have 10 plate instances, you have a stack of plates object with an int saying how many plates there currently are.

The underlying principle of this is making sure you have slots in the world, whether hand placed, or generated in a pattern, and keeping track of what's in them, rather than placing things in the world directly. Refer to things by how a stranger would name them. When you ask someone what is in a room, they won't say a sofa, a bookshelf, an armchair, another armchair, a coffee table, a TV stand, more bookshelves. No, they will say furniture. Look at your game from the outside. Use how the players describe what is on screen. Look at how they describe their inventory. Look at how they describe the game, understand their mental model, match that, and you will find a strong correlation to what is taking up the players perception space.

When normalising your data, look at how your rows are aligned to some kind of container. If you have any form of grid, from 1D to 4D, it's worth looking at how you can utilise it. Don't ignore other tesselations, such as triangle grids, or hexagon grids. Hexagon grids, in particular, get a bad name, but they can be represented by a square grid with different traversal functions. Don't give up just because the literal grid is irregular either, in some grid-based games, the centres of the cells are perturbed to give a more natural look, but the game code can be strict grid-based, leading to better solution space, and more likely easier for the player to reason about what they can and can't do.

Online release of Data-Oriented Design :   
This is the free, online, reduced version. Some inessential chapters are excluded from this version, but in the spirit of this being an education resource, the essentials are present for anyone wanting to learn about data-oriented design.  
Expect some odd formatting and some broken images and listings as this is auto generated and the Latex to html converters available are not perfect. If the source code listing is broken, you should be able to find the referenced source on [github](https://github.com/raspofabs/dodbooksourcecode/). If you like what you read here, consider purchasing the real paper book from [here](https://www.amazon.com/dp/1916478700), as not only will it look a lot better, but it will help keep this version online for those who cannot afford to buy it. Please send any feedback to [support@dataorienteddesign.com](mailto:support@dataorienteddesign.com)  



# links
[Read on Omnivore](https://omnivore.app/me/hierarchical-level-of-detail-18b3ee81fbf)
[Read Original](https://www.dataorienteddesign.com/dodbook/node6.html)

<iframe src="https://www.dataorienteddesign.com/dodbook/node6.html"  width="800" height="500"></iframe>
