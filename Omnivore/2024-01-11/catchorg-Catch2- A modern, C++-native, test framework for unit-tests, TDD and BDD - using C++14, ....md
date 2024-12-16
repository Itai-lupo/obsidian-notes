---
id: 8131918c-cee0-4f30-98ce-627991909134
title: "catchorg/Catch2: A modern, C++-native, test framework for unit-tests, TDD and BDD - using C++14, C++17 and later (C++11 support is in v2.x branch, and C++03 on the Catch1.x branch)"
tags:
  - cpp
  - tools_to_use
date: 2024-01-11 23:24:20
words_count: 354
state: INBOX
---

# catchorg/Catch2: A modern, C++-native, test framework for unit-tests, TDD and BDD - using C++14, C++17 and later (C++11 support is in v2.x branch, and C++03 on the Catch1.x branch) by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> A modern, C++-native, test framework for unit-tests, TDD and BDD - using C++14, C++17 and later (C++11 support is in v2.x branch, and C++03 on the Catch1.x branch) - catchorg/Catch2: A modern, C++-...


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[![Catch2 logo](https://proxy-prod.omnivore-image-cache.app/0x0,sI_0ZYeYx8JvdtVKNVHQZHdlrD09eX1TLNRfMLVAimgM/https://github.com/catchorg/Catch2/raw/devel/data/artwork/catch2-logo-small-with-background.png)](https://github.com/catchorg/Catch2/blob/devel/data/artwork/catch2-logo-small-with-background.png)

[![Github Releases](https://proxy-prod.omnivore-image-cache.app/0x0,sWHO2NLa3EblX-4aupmHU6r-gbYglnwv9JIUtXEY9obY/https://camo.githubusercontent.com/ce0f6350e3a069d7a938dba7c801e4c8d1313f4b4359ab6eef1c14dfb300661c/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f72656c656173652f63617463686f72672f6361746368322e737667)](https://github.com/catchorg/catch2/releases) [![Linux build status](https://proxy-prod.omnivore-image-cache.app/0x0,sOyy8XshfmtudaUm4Xw3yIQrBQguyIyjPuUxwMfSzrIk/https://github.com/catchorg/Catch2/actions/workflows/linux-simple-builds.yml/badge.svg)](https://github.com/catchorg/Catch2/actions/workflows/linux-simple-builds.yml) [![Linux build status](https://proxy-prod.omnivore-image-cache.app/0x0,sziGazhUuTbLm1JOZt-PzMYm7jhLpNtYV_O0qPMJ7Sqg/https://github.com/catchorg/Catch2/actions/workflows/linux-other-builds.yml/badge.svg)](https://github.com/catchorg/Catch2/actions/workflows/linux-other-builds.yml) [![MacOS build status](https://proxy-prod.omnivore-image-cache.app/0x0,sXrc8yaxTwKB7P1MeN9l8HqyZPxK7P6yPlon0l14X7k4/https://github.com/catchorg/Catch2/actions/workflows/mac-builds.yml/badge.svg)](https://github.com/catchorg/Catch2/actions/workflows/mac-builds.yml) [![Build Status](https://proxy-prod.omnivore-image-cache.app/0x0,saivXB98kSpExx9TwQlc_8hdH39YHMO-i5xbM92ym9HM/https://camo.githubusercontent.com/07ff295644a3c8ff813e5c682bfb012cc14c2516e6d6f53dd873a4ef870d58a4/68747470733a2f2f63692e6170707665796f722e636f6d2f6170692f70726f6a656374732f7374617475732f6769746875622f63617463686f72672f4361746368323f7376673d74727565266272616e63683d646576656c)](https://ci.appveyor.com/project/catchorg/catch2) [![Code Coverage](https://proxy-prod.omnivore-image-cache.app/0x0,sxMFibJuDo2Ftt_BU9P_FQQJI7j2xht8ETvtnV0I5hdI/https://camo.githubusercontent.com/ac49804d5fe6487cd1080a1f4a6667c03112503b3cb1ec317861191f35fcf153/68747470733a2f2f636f6465636f762e696f2f67682f63617463686f72672f4361746368322f6272616e63682f646576656c2f67726170682f62616467652e737667)](https://codecov.io/gh/catchorg/Catch2) [![Try online](https://proxy-prod.omnivore-image-cache.app/0x0,shtO-J8hhRQwa8B03wxE0qV98Ka025PRrJeoWEdj6qXU/https://camo.githubusercontent.com/bce7782b04362d4618e15af221ed0289a1fe26efa0fa75e892f76c3810acd022/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f7472792d6f6e6c696e652d626c75652e737667)](https://godbolt.org/z/EdoY15q9G) [![Join the chat in Discord: https://discord.gg/4CWS9zD](https://proxy-prod.omnivore-image-cache.app/0x0,sstHYcJay2OkKkZi0IKIWBpIV5rSGHRJAvleklZcjXIo/https://camo.githubusercontent.com/8279c4fe48dd0ca500398b2ce8ec04511f776aea3f98e6071b0ba60e4cc03e89/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446973636f72642d43686174212d627269676874677265656e2e737667)](https://discord.gg/4CWS9zD)

## What is Catch2?

Catch2 is mainly a unit testing framework for C++, but it also provides basic micro-benchmarking features, and simple BDD macros.

Catch2's main advantage is that using it is both simple and natural. Test names do not have to be valid identifiers, assertions look like normal C++ boolean expressions, and sections provide a nice and local way to share set-up and tear-down code in tests.

**Example unit test**

#include <catch2/catch_test_macros.hpp>

#include <cstdint>

uint32_t factorial( uint32_t number ) {
    return number <= 1 ? number : factorial(number-1) * number;
}

TEST_CASE( "Factorials are computed", "[factorial]" ) {
    REQUIRE( factorial( 1) == 1 );
    REQUIRE( factorial( 2) == 2 );
    REQUIRE( factorial( 3) == 6 );
    REQUIRE( factorial(10) == 3'628'800 );
}

**Example microbenchmark**

#include <catch2/catch_test_macros.hpp>
#include <catch2/benchmark/catch_benchmark.hpp>

#include <cstdint>

uint64_t fibonacci(uint64_t number) {
    return number < 2 ? number : fibonacci(number - 1) + fibonacci(number - 2);
}

TEST_CASE("Benchmark Fibonacci", "[!benchmark]") {
    REQUIRE(fibonacci(5) == 5);

    REQUIRE(fibonacci(20) == 6'765);
    BENCHMARK("fibonacci 20") {
        return fibonacci(20);
    };

    REQUIRE(fibonacci(25) == 75'025);
    BENCHMARK("fibonacci 25") {
        return fibonacci(25);
    };
}

_Note that benchmarks are not run by default, so you need to run it explicitly with the `[!benchmark]` tag._

## Catch2 v3 has been released!

You are on the `devel` branch, where the v3 version is being developed. v3 brings a bunch of significant changes, the big one being that Catch2 is no longer a single-header library. Catch2 now behaves as a normal library, with multiple headers and separately compiled implementation.

The documentation is slowly being updated to take these changes into account, but this work is currently still ongoing.

For migrating from the v2 releases to v3, you should look at [our documentation](https://github.com/catchorg/Catch2/blob/devel/docs/migrate-v2-to-v3.md#top). It provides a simple guidelines on getting started, and collects most common migration problems.

For the previous major version of Catch2 [look into the v2.x branch here on GitHub](https://github.com/catchorg/Catch2/tree/v2.x).

## How to use it

This documentation comprises these three parts:

* [Why do we need yet another C++ Test Framework?](https://github.com/catchorg/Catch2/blob/devel/docs/why-catch.md#top)
* [Tutorial](https://github.com/catchorg/Catch2/blob/devel/docs/tutorial.md#top) \- getting started
* [Reference section](https://github.com/catchorg/Catch2/blob/devel/docs/Readme.md#top) \- all the details

## More

* Issues and bugs can be raised on the [Issue tracker on GitHub](https://github.com/catchorg/Catch2/issues)
* For discussion or questions please use [our Discord](https://discord.gg/4CWS9zD)
* See who else is using Catch2 in [Open Source Software](https://github.com/catchorg/Catch2/blob/devel/docs/opensource-users.md#top)or [commercially](https://github.com/catchorg/Catch2/blob/devel/docs/commercial-users.md#top).



# links
[Read on Omnivore](https://omnivore.app/me/catchorg-catch-2-a-modern-c-native-test-framework-for-unit-tests-18cfa69645f)
[Read Original](https://github.com/catchorg/Catch2)

<iframe src="https://github.com/catchorg/Catch2"  width="800" height="500"></iframe>
