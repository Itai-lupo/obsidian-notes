---
id: 25b73b68-6de5-11ee-9d64-2362deb31755
title: vkspec
tags:
  - programing
  - game_engine
  - vulkan
  - graphic_API
date: 2023-10-18 21:35:44
state: READING
---

# vkspec by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> 

## note
>[!note] 
>   note test 

# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```



# Highlights

> [!cite]- hen using binary semaphores, the application must ensure that command buffer submissions will be able to complete without any subsequent operations by the application on any queue. After any call to vkQueueSubmit (or other queue operation), for every queued wait on a semaphore created with a VkSemaphoreType of VK_SEMAPHORE_TYPE_BINARY there must be a prior signal of that 
>>[!note] 
>>   test change
many 
lines
test
is
good?
> 
   #vulkan  #graphic_API  #programing  #game_engine  [link to](https://omnivore.app/me/vkspec-18b4412b739#dd6faf47-084b-4fb8-89d1-ac307647004d)

> [!cite]- re-signal behavior is well-defined and applications can submit work via vkQueueSubmit defining a timeline semaphore wait operation before submitting a corresponding semaphore signal operation. For each t 
> 
   [link to](https://omnivore.app/me/vkspec-18b4412b739#94305afe-43a4-41b6-aff0-c9b8e601d2df)

> [!cite]- • VUID-vkCmdExecuteCommands-commandBuffer-06534 If vkCmdExecuteCommands is being called within a render pass instance and any recorded command in commandBuffer in the current subpass will read from an image subresource 
>>[!note] 
>>   test2
multi line test
> 
   [link to](https://omnivore.app/me/vkspec-18b4412b739#d99f70a6-58d3-4103-9b7a-336410a812c0)


# links
[Read on Omnivore](https://omnivore.app/me/vkspec-18b4412b739)
[Read Original](https://registry.khronos.org/vulkan/specs/1.3-extensions/pdf/vkspec.pdf)

<iframe src="https://registry.khronos.org/vulkan/specs/1.3-extensions/pdf/vkspec.pdf"  width="800" height="500"></iframe>
