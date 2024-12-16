---
id: aa1adccc-d456-4262-bbc1-5c625bf48b05
title: A Fast, Compliant JSON Pull Parser for Writing Robust Applications - Jonathan Müller - CppCon 2023
author: CppCon
tags:
  - programing
  - cppcon
  - cpp
  - youtube
date: 2024-01-08 20:28:36
words_count: 17
state: INBOX
---

# A Fast, Compliant JSON Pull Parser for Writing Robust Applications - Jonathan Müller - CppCon 2023 by CppCon
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A Fast, Compliant JSON Pull Parser for Writing Robust Applications - Jonathan Müller - CppCon 2023

## note
>[!note] 
>   
There are, by now, several well-established C++ JSON libraries, for example, boost.JSON, rapidjson, and simdjson. C++ developers can choose between DOM parsers, SAX parsers, and pull parsers. DOM parsers are by design slow and use a lot of memory, SAX parsers are clumsy to use and the only well-known pull parser simdjson does not fully validate JSON documents and also has high non-constant memory usage. Our open-source JSON parser fills the gap between the existing parser libraries. It is a fully validating, fast, pull parser with O(1) memory usage.

Its main contribution, however, is the API design. All existing parsers verify that a parsed document is valid JSON. But most applications require the data to have a specific structure, for example, that an object has specific required keys while other keys may be optional. Their associated values in turn are expected to be, for example, strings, objects or arrays. Currently, developers need to implement their own checks and their own error handling on top of the existing parser APIs.

Our API forces developers to express these semantical constraints, providing automatic error handling in return. The resulting code concisely documents the required JSON structure and always handles errors correctly. We have found this to be extremely useful in practice.

This talk will show the JSON parser API in practice, compare it to the established parsers, and will demonstrate some elegant generic programming C++ techniques to beginners and intermediate C++ developers.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[A Fast, Compliant JSON Pull Parser for Writing Robust Applications - Jonathan Müller - CppCon 2023](https://www.youtube.com/watch?v=%5FGrHKyUYyRc)

By [CppCon](https://www.youtube.com/@CppCon)



# links
[Read on Omnivore](https://omnivore.app/me/https-www-youtube-com-watch-v-gr-h-ky-u-yy-rc-18cea556cc5)
[Read Original](https://www.youtube.com/watch?v=_GrHKyUYyRc)

<iframe src="https://www.youtube.com/watch?v=_GrHKyUYyRc"  width="800" height="500"></iframe>
