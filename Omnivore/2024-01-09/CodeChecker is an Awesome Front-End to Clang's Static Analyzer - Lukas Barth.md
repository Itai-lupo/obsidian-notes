---
id: 90928f16-7706-4680-8f78-1e9ca5683977
title: CodeChecker is an Awesome Front-End to Clang's Static Analyzer | Lukas Barth
author: Lukas Barth
tags:
  - programing
  - cpp
  - tools_to_use
date: 2024-01-09 23:37:46
date_published: 2023-06-09 01:00:00
words_count: 3953
state: INBOX
---

# CodeChecker is an Awesome Front-End to Clang's Static Analyzer | Lukas Barth by Lukas Barth
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> This article shows how to use CodeChecker and Clang to perform static analysis on your C++ project.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
In fact, [CodeChecker](https://github.com/Ericsson/codechecker/) is much more than just a front-end to Clang’s Static Analyzer (`clangsa` from here on…) - but using it just to drive `clangsa` is already awesome enough that I think you should use it to hunt for bugs in your C++ projects.

In this article, I’ll show how to set up and use CodeChecker for a quick one-off analysis of a CMake based C++ project, and outline how to use CodeChecker in a collaborative setting with the option of integrating it into a CI system. If you are not on C++, CodeChecker might still be for you, as it also [supports multiple analyzers](https://codechecker.readthedocs.io/en/latest/supported%5Fcode%5Fanalyzers/) for e.g. Java, Python, Go, or JavaScript.

Table of Contents

* [Intro](#intro)
* [Setting up CodeChecker](#setting-up-codechecker)
* [Setting up Your Project](#sec-project-setup)
* [First CodeChecker Run](#first-codechecker-run)  
   * [Preparing the Compilation Database](#preparing-the-compilation-database)  
   * [Running the Analysis](#running-the-analysis)  
   * [A First Look at the Results](#a-first-look-at-the-results)  
   * [HTML to the Rescue](#sec-html)
* [CodeChecker server: An Interactive HTML GUI](#sec-server)
* [Interpreting the Results](#sec-interpreting)
* [Conclusion](#conclusion)

## Intro

CodeChecker is a Python tool that drives static analysis tools (not just `clangsa`, though that is what I’ll be focusing on in this article), and collects, visualizes and compares their results. If you want to use it in a non-automated way, you use it by running a sequence commands in your favorite shell.

This article is meant as a tutorial to get you to run your first analysis with CodeChecker. I’m making a few assumptions to keep this article from becoming too expansive: I’ll assume that you are working on Linux and that you have a recent-ish version Clang, Python 3 and the usual development tools installed. I’ll use a CMake based project as example, but it should be trivial to transfer this tutorial to most other build systems. CodeChecker has a lot of possibilities which I can not show in this article. If you want to get a fuller picture, please have a look at the [CodeChecker documentation](https://codechecker.readthedocs.io/en/latest/).

## Setting up CodeChecker

There are multiple ways of installing CodeChecker - again, please refer to [the documentation](https://codechecker.readthedocs.io/en/latest/#install-guide) for a fuller overview. To use CodeChecker manually from the command line, I prefer the installation via `pip`:

```erlang-repl
1> pip install --user codechecker

```

On a default Python 3 setup on Linux, this should leave you with an executable file `CodeChecker` in`~/.local/bin`.

CodeChecker relies on external tools (called `analyzers` in CodeChecker parlance) to actually analyze your code. By default, three such analyzers are preconfigured: `clangsa` (which is basically just Clang with a special command-line flag), [clang-tidy](https://clang.llvm.org/extra/clang-tidy/) and [Cppcheck](http://cppcheck.net/). However, CodeChecker might not know where the respective executables are located on your system, or you might not have all three installed. For example, I have various Clang versions installed (from [LLVM’s APT repository](https://apt.llvm.org/)), so I would like CodeChecker to use `/usr/bin/clang++-16` as `clangsa`.[1](#fn:1)

The only way to configure that right now is by editing the `package_layout.json` file bundled with CodeChecker.[2](#fn:2) If you installed via`pip` as shown above, that file should be under`~/.local/share/codechecker/config/package_layout.json`. This file should by default contain a snippet like this:

```basic
1…
2  "runtime":
3    "analyzers": {
4      "clangsa": "clang",
5      "clang-tidy": "clang-tidy",
6      "cppcheck": "cppcheck"
7    },
8…

```

By editing these lines, you can tell CodeChecker where to find these tools on your system. I only want to use `clang++-16` as `clangsa`, and for the moment don’t care about `clang-tidy` and`Cppcheck`, so I changed this to:

```basic
1…
2  "runtime":
3    "analyzers": {
4      "clangsa": "/usr/bin/clang++-16"
5    },
6…

```

## Setting up Your Project

Now that CodeChecker is ready to go, we need to get your project ready to be checked. As an example for this article, I will use [Ygg, my intrusive tree library](https://github.com/tinloaf/ygg). This library was one of my first serious C++ projects (and I have not looked at it in a while…), so I fully expect it to contain some problematic code for Clang to find. Also it is really template-heavy, so it should present an interesting challenge for the analyzer.

Ygg uses CMake as its build system. It’s a header-only library, but it still contains a couple of targets to be built: Some tests, some benchmarks, and some hello-world-ish examples.

The first thing we have to do is to actually get the builds up and running. Note that while you can compile Ygg with a variety of compilers, it is highly recommended to use the same compiler to build as we will use later to analyze Ygg. Since we will later use Clang 16 as analyzer, we’ll force CMake to use Clang 16 for building, too:

```angelscript
 1~/src/> git clone https://github.com/tinloaf/ygg.git ./ygg
 2~/src/> cd ygg
 3~/src/ygg> git submodule update --init
 4[…]
 5~/src/ygg> mkdir build
 6~/src/ygg> cd build
 7~/src/ygg/build> export CXX=/usr/bin/clang++-16
 8~/src/ygg/build> cmake ..
 9[…]
10-- The CXX compiler identification is Clang 16.0.5
11[…]
12~/src/ygg/build> make -j

```

A note on compilers

In theory, you don’t have to use Clang as a compiler in this step. The `CodeChecker log` command that we run later also understands e.g. GCC invocations. However, some build systems (such as Ygg’s) add special command-line flags depending on the compiler. Ygg adds the `-fno-new-ttp-matching` if it detects GCC to work around [a Boost bug](https://github.com/boostorg/icl/issues/21) (or is it a GCC bug?). These command-line flags will be recorded in the `compile_commands.json` database and later passed on to `clangsa`, which does not understand them.

Additionally, you should really also use the same Clang version for building as for analysis, especially if your project involves precompiled headers. Otherwise, the precompiled header will be built e.g. by Clang 15, and later Clang 16 will try to run an analysis with this PCH, which usually does not work.

So the recommendation is: Use the exact same Clang to build the project you want to analyze.

Now that we have a working build, we can tell CodeChecker about it. As many Clang tools do, CodeChecker relies on a [compilation database](https://clang.llvm.org/docs/HowToSetupToolingForLLVM.html). We could (in a CMake-based project) just generate this database by passing the `-DCMAKE_EXPORT_COMPILE_COMMANDS=ON` parameter to our `cmake`invocation. However, CodeChecker provides a better way: `CodeChecker log`, which will be the first actual CodeChecker command we run.

## First CodeChecker Run

### Preparing the Compilation Database

Let’s first create a working directory for all the files generated by CodeChecker:

Now we use `CodeChecker log` to create a compilation database of all files _built for a specific target_. To do that we just run `CodeChecker log -b '<our build command>' -o path/to/compilation_database`. So, in our case:

```jboss-cli
1~/src/ygg> cd build
2~/src/ygg/build> CodeChecker log -b 'make -j' -o ../check/compile_commands.json
3[…]

```

Let’s see:

```angelscript
1~/src/ygg/build> cd ../check/
2~/src/ygg/check> ls
3compile_commands.json
4~/src/ygg/check> cat compile_commands.json
5[
6]
7~/src/ygg/check>

```

_Wait a second!_ If you followed the steps of the tutorial up to here, the compilation database will be _empty_! Is `CodeChecker log` not very useful after all?

No, it’s actually doing exactly what it should: It records all files _built_. Since we already built everything in [the previous section](#sec-project-setup), nothing was built now, and nothing is recorded. This is very useful: If we are working on a project and we have already run CodeChecker previously, this allows us to only re-run CodeChecker on those files (resp. translation units…) which we changed! You will see that especially `clangsa` is not very fast, so this will come in very handy.

For now, we want a full compilation database, so let’s try this again, this time running `make clean` first:

```basic
1~/src/ygg> cd build
2~/src/ygg/build> make clean
3~/src/ygg/build> CodeChecker log -b 'make -j' -o ../check/compile_commands.json
4[…]
5~/src/ygg/build> wc -l ../check/compile_commands.json
6258 ../check/compile_commands.json

```

We have a compilation database and we are ready to run the first analysis!

### Running the Analysis

The command to run an analysis is `CodeChecker analyze`. It accepts a couple of command-line options, have a look at `CodeChecker analyze --help` for details. I will just be using two arguments:

* **\-o <report-dir>** specifies the output directory for report data. This is the only required named argument.
* **–ctu** enables Cross Translation Unit checks. A large part of the magic in `clangsa` happens by reasoning about code paths that can and cannot be taken. Many of these code paths will cross the boundaries of translation units, and are usually not visible to Clang tools, which work on one translation unit at a time. With CTU, `clangsa` and CodeChecker do some magic to enable some reasoning about code paths that cross TU boundaries. See [the corresponding LLVM documentation](https://clang.llvm.org/docs/analyzer/user-docs/CrossTranslationUnit.html) for details.

Aside from that required named option, `CodeChecker` expects the compilation database as positional argument. So, let’s create a directory for the output, and let’s analyze:

```angelscript
 1~/src/ygg> cd check
 2~/src/ygg/check> mkdir report
 3~/src/ygg/check> CodeChecker analyze --ctu -o report compile_commands.json
 5clangsa: […]
 7[INFO 2023-06-05 21:50] - Collecting data for ctu analysis.
 8[INFO 2023-06-05 21:50] - [1/19] example_rbtree.cpp
 9[…]
1011[INFO 2023-06-05 21:52] - Starting static analysis ...
12[INFO 2023-06-05 21:52] - [1/19] clangsa analyzed example_dump_to_dot.cpp successfully.
13[…]
14[INFO 2023-06-05 22:09] - ----==== Summary ====----
17[INFO 2023-06-05 22:09] - Total analyzed compilation commands: 19
18[INFO 2023-06-05 22:09] - ----=================----
19[…]

```

You see that it first lists all the enabled checkers, and then starts two passes over all translation units. In the first pass, it collect data for CTU, the second pass performs the actual analysis.[3](#fn:3)

Note that we did now run `clangsa` with the default list of checkers. A _checker_ of an analyzer can best be thought of as a certain type of bug that the analyzer can either search for or not. You can list all available checkers (of all available analyzers) by running

```angelscript
 1~/src/ygg/check> CodeChecker checkers
 2[…]
 3optin.cplusplus.UninitializedObject
 4  Status: enabled
 5  Analyzer: clangsa
 6  Description: Reports uninitialized fields after object construction
 7  Labels:
 8    doc_url:https://clang.llvm.org/docs/analyzer/checkers.html#optin-cplusplus-uninitializedobject-c
 9    profile:default
10    profile:extreme
11    profile:sensitive
12    severity:MEDIUM
13[…]

```

Each checker has a name (`optin.cplusplus.UninitializedObject` in the example) and a set of`profile:<something>` labels. Both names and labels can be used to enable or disable checkers. If you want to enable a certain checker, you can pass `-e <name or label>` to `CodeChecker analyze`, if you want to disable it, you can use `-d <name or label>`. So, as an example:

```groovy
1~/src/ygg/check> CodeChecker analyze -e profile:sensitive -d optin.cplusplus.UninitializedObject …

```

This would run an analysis with all the `profile:sensitive` checkers enabled (additionally to the default-enabled checkers), but `optin.cplusplus.UninitializedObject` being disabled.

Note that checkers starting with `alpha.` are considered under development and should probably not be enabled, and checkers starting with `core.` should never be disabled, since other checkers depend on them.

### A First Look at the Results

CodeChecker provides multiple ways of looking at the results. The first and quickest is by running`CodeChecker parse`, which will print human-readable results to the console. I don’t think it’s very useful when dealing with a project that yields many warnings, but it may be good if you fixed all the warnings in your project and re-run CodeChecker after some changes, or to get a quick first overview. For Ygg, it currently hits me with a wall of text:

```angelscript
1~/src/ygg/check> CodeChecker parse report | wc -l
21404

```

It spits out a lot of reports of this form:

```basic
1[LOW] ~/src/ygg/benchmark/bench_bst_delete.cpp:35:12: Value stored to '_' during its initialization is never read [deadcode.DeadStores]
2  for (auto _ : state) {

```

Just scrolling through these is not very useful. But at the very end it prints a nice statistic:

```angelscript
 1----==== Severity Statistics ====----
 2----------------------------
 3Severity | Number of reports
 4----------------------------
 5HIGH     |                 5
 6MEDIUM   |               227
 7LOW      |                90
 8----------------------------
 9----=================----
10
11----==== Checker Statistics ====----
12------------------------------------------------------------------
13Checker name                        | Severity | Number of reports
14------------------------------------------------------------------
15core.CallAndMessage                 | HIGH     |                 4
16cplusplus.NewDeleteLeaks            | HIGH     |                 1
17optin.cplusplus.UninitializedObject | MEDIUM   |               227
18deadcode.DeadStores                 | LOW      |                90
19------------------------------------------------------------------
20----=================----
21
22----==== File Statistics ====----
23--------------------------------------------
24File name                | Number of reports
25--------------------------------------------
26dynamic_segment_tree.cpp |                 2
27benchmark.h              |                 1
28[…]
29--------------------------------------------
30----=================----
31
32----======== Summary ========----
33-----------------------------------------------
34Number of processed analyzer result files | 19
35Number of analyzer reports                | 322
36-----------------------------------------------
37----=================----

```

### HTML to the Rescue

This is of course not the best that CodeChecker can do. Let’s create a nice HTML output by passing`-e html` (and `-o <output_dir>`) to `CodeChecker parse`:

```erlang-repl
1~/src/ygg/check> CodeChecker parse report -e html -o html_out
2[…]
3
4To view statistics in a browser run:
5> firefox /home/lukas/src/ygg/check/html_out/statistics.html
6
7To view the results in a browser run:
8> firefox /home/lukas/src/ygg/check/html_out/index.html

```

Let’s have a look at the main results view, which shows a nice table with each row representing one found (or rather: suspected) bug:

![A screenshot of an HTML page showing a table with the columns 'File', 'Severity', 'Checker Name', 'Message' and 'Bug path length'. Three rows are visible, each describing a bug found by clangsa.](https://proxy-prod.omnivore-image-cache.app/0x0,swPgReZaB4JCu7zEWg_XQKwIS6O9fx6Bg8pfeSomBOOk/https://www.lukas-barth.net/codechecker_clang_analyzer/screen_overview.png)

I have sorted the table by severity. You may notice that the two topmost bugs are not actually inside my own code, but under `~/opt/boost_install`, where a custom version of Boost lives. We see that `clangsa` does not only find (suspected) bugs in your own code, but potentially also in the libraries you use.

We can filter out these (suspected) bugs in external libraries by filtering on the file paths that we are interested in. CodeChecker offers two ways of doing that: With a simple `--file` filter argument (which accepts the usual globbing syntax), and a more flexible [skipfile system](https://codechecker.readthedocs.io/en/latest/analyzer/user%5Fguide/#skip). With Ygg, there are actually several paths I want to exclude:

* `~/opt/boost_install`
* `~/src/ygg/build/benchmark/gbenchmark`
* `~/src/ygg/build/test/gtest`

The latter two paths are builds of the Google Benchmark and Google Test libraries automatically performed while building Ygg. We solve this by creating this skipfile in `~/src/ygg/check/skip_parse`:

```crystal
1-/home/lukas/opt/boost_install/*
2-/home/lukas/src/ygg/build/benchmark/gbenchmark
3-/home/lukas/src/ygg/build/test/gtest

```

And with that, re-running the parse command as:

```elm
1~/src/ygg/check> CodeChecker parse report -e html -o html_out --skip skip_parse

```

This should give you the desired HTML page at `html_out/index.html`.

If you are happy with this workflow of manually creating a static HTML overview and filtering only via a skip file, you can now skip straight ahead to [Interpreting the Results](#sec-interpreting). Otherwise, read the next section about [the CodeChecker server](#sec-server) that not only brings a nice interactive GUI with extensive filtering capabilities, but also allows you to collaborate, keep track of bugs, false positives and their fixes, and much more.

## CodeChecker server: An Interactive HTML GUI

The CodeChecker server offers a way of uploading result folders to have the results permanently available, especially in a setting where multiple people want to work on the same code. There are a lot of configuration options, especially around authentication and whether to use a SQLite or PostgreSQL, which you should have a look at if you want to deploy this in a way that is accessible from outside your own machine - however, this would exceed the scope of this article.

For now, we start the CodeChecker server by simply running `CodeChecker server`. This starts a server in a way that is only accessible from your machine, without any required authentication:

```routeros
1~/> CodeChecker server
2[…]
3[INFO 2023-06-08 10:36] - Product 'Default' at '/home/lukas/.codechecker/Default.sqlite' created and set up.
4[…]
5[INFO 2023-06-08 10:36] - CodeChecker server's example configuration file created at '/home/lukas/.codechecker/server_config.json'
6[…]
7[INFO 2023-06-08 10:36] - Server waiting for client requests on [localhost:8001]

```

There’s more logging, but these lines highlight the most important aspects:

* A product `Default` is automatically created. The CodeChecker server partitions everything into products, so that you can use it with multiple codebases.
* By default, it uses `~/.codechecker/` as its storage directory. You can override this with `-w`.
* There is a configuration file at `${workdir}/server_config.json`.
* And the server listens on port `8001`.

If you point your browser to [http://localhost:8001](http://localhost:8001/), you should see something like this:

![A screenshot of the start page of CodeChecker server. It shows a table with a single row, the product 'Default', which still has zero 'Runs'.](https://proxy-prod.omnivore-image-cache.app/0x0,s_cXdW4ZlJie-Sl873M2KUMxc61YjD6C5H_5N1aNlH0I/https://www.lukas-barth.net/codechecker_clang_analyzer/server_start.png)

We see the created ‘Default’ product here (and buttons where we could create a different product, or where we can rename ‘Default’). In the column ‘Number of runs’, it shows a zero. A ‘run’ is one set of reports created by `CodeChecker analyze` that was uploaded to the server. To see something useful, we need to do just that via `CodeChecker store`. So, from the `check` directory in which we worked earlier, we run:

```angelscript
1~/src/ygg/check> CodeChecker store --name 'first_run' --url http://localhost:8001/Default ./report
2[INFO 2023-06-08 10:48] - Storing analysis results for run 'first_run'
3[…]

```

There should be a lot more logging, it should especially print out another set of statistics at the end. Note that we need to give a name to this run with the argument `--name`.[4](#fn:4)Also note that the upload URL contains the product name - so, if you created a different product (or changed the URL endpoint of Default), you need to replace ‘Default’ in the `--url` argument.

If you now reload the server website, you should see one run. Click on ‘Default’ and it should show you this:

![A screenshot of the 'runs' view in CodeChecker server. There is a single run, 'first_run'.](https://proxy-prod.omnivore-image-cache.app/0x0,smjcHbW5UuFAg3h7kpEZHJZ07BFZD5aYgSdWnDKzfy44/https://www.lukas-barth.net/codechecker_clang_analyzer/server_runs.png)

Open the run by clicking on `first_run`, and you see what I consider the ‘main view’ of CodeChecker server:

![The main view of CodeChecker server. On the left, there is a side bar with lots of filtering options. On the right, there is a table listing all the suspected bugs found in this run.](https://proxy-prod.omnivore-image-cache.app/0x0,sOBlja7jmpmCW6WVOBfov0nEQXfTnv1mSeJ-svYokVlA/https://www.lukas-barth.net/codechecker_clang_analyzer/server_main.png)

On the left, there is a column with extensive filtering capabilities. Because we reached this view by clicking on the `first_run` run, a filter for that run is preselected. Also, it by default only shows bugs which are in the “Unreviewed” or “Confirmed Bug” state. If we wanted to mimic the path filter from the [previous section](#sec-html), we could use the “Path” filters here. The first thing that I usually do is to add a “Severity” filter to have a look at the suspected bugs starting with “really bad” and ending with “not so bad”.

Clicking any of the rows in the table on the right takes you to a code listing similar to the one in the [static HTML case from the previous section](#sec-html). The most important difference is this menu bar on top of the listing:

![A menu bar with the buttons 'Report Info', 'Analysis Info', 'Set Cleanup Plan', 'Blame View' and 'Comments (0)', and a drop-down menu that currently shows 'Unreviewed'.](https://proxy-prod.omnivore-image-cache.app/0x0,sY98LlgI9J5A6uu5I1Pk0A30shlZErScfwtqfr1ASjxQ/https://www.lukas-barth.net/codechecker_clang_analyzer/server_menu.png)

This is where collaboration with your colleagues happens. You can start a comment thread to discuss this bug, change the bug’s state (it is currently in ‘Unreviewed’ state, other possible states are ‘Confirmed Bug’, ‘False Positive’ and ‘Intentional’), or even show a `git blame`.

CodeChecker server can do a lot more for you than what I have just outlined. It is especially powerful if one uses it continually, uploading updated analysis runs after the code was changed, which allows you to track how bugs where fixed (or new bugs where introduced) - but that would go beyond the scope of this tutorial. If you end up using CodeChecker server, you should especially have a look at the `CodeChecker cmd` invocation, which serves as a command-line interface to the CodeChecker server.

The most important task when working with CodeChecker still remains: Actually figuring out whether this is a bug, and how to fix it - check out [the next section](#sec-interpreting).

## Interpreting the Results

Opening one of the suspected-bug reports gives you a page with a code listing interspersed with little message bubbles that explain the code path that `clangsa` assumed to be taken:

![A screenshot of a code listing. The listing starts with a line 'if (lower_closed)', immediately followed by a message bubble stating 'Assuming lower_closed is true'.](https://proxy-prod.omnivore-image-cache.app/0x0,sJwE9JOdlT3Ti6FsoScOXLb9BthVn7bhsDYvrr25thgE/https://www.lukas-barth.net/codechecker_clang_analyzer/path_bubble.png)

This bubble tells us that the code path found by `clangsa` (and which leads to the suspected bug) goes through the `if`\-branch (the line `lower_node_it = this->t.lower_bound(lower);`). Often, the control flow that leads to the suspected bug is complex, i.e., multiple such control-flow assumptions are necessary (this is what the “Bug path length” column in the overview table says). To make it easier to trace the control flow, the annotations are numbered on their left side, and have little clickable arrows left and right that allow you to jump from one annotation to the previous or next.

Note that there often are some control-flow annotations that could be left out to reproduce the bug. In this example, I’m pretty sure this first (and second, third and fourth) of the control-flow assumptions could be left out without affecting the (suspected) bug.

Let’s try to analyze this example. I like to start at the very last annotation, which highlights the suspected bug and is easily recognizable because it is red:

![A screenshot of a code listing. A red message bubble with the text '1st function call argument is an uninitialized value' is visible.](https://proxy-prod.omnivore-image-cache.app/0x0,suWCKqo29yi3PhWCc1mv0YHPYawljhIpPTrSPuCT9Vrk/https://www.lukas-barth.net/codechecker_clang_analyzer/bug_bubble.png)

So in this example, Clang claims that `topmost_point` can be used uninitialized, which would in fact be UB. Let’s trace back. Annotations 6 and 7 look like this (with some irrelevant code cut out for clarity):

![A screenshot of a code listing. A blue message bubble with the number six and the text 'Assuming the condition is false' is visible right after a line 'if (...)'](https://proxy-prod.omnivore-image-cache.app/0x0,sx7ijXzQdxJktg7z8j0d1XQxggZyVT0eU_SCj2ahj6mQ/https://www.lukas-barth.net/codechecker_clang_analyzer/bubble_6.png)

![A screenshot of a code listing. A blue message bubble with the number seven and the text 'Assuming the condition is false' is visible right after a line 'if (...)'](https://proxy-prod.omnivore-image-cache.app/0x0,sgr2vmil1tNH8t04VXDArYH7ziILF7WiJo4WmSgSu79E/https://www.lukas-barth.net/codechecker_clang_analyzer/bubble_7.png)

The irony of my previous self placing the `// TODO can this ever be empty?` there… In fact, these two `if` blocks are the only places where `topmost_point` is ever initialized. Going one annotation further back shows us:

![A screenshot of a code listing. A blue message bubble with the number five and the text 'topmost_point declared without an initial value' is visible right after a line declaring the variable topmost_point.](https://proxy-prod.omnivore-image-cache.app/0x0,sGRteWPfuGCbw1ojK70HRtZNIDHOoJ1n-Tbkie2BTJbI/https://www.lukas-barth.net/codechecker_clang_analyzer/bubble_5.png)

… and that’s all there is that involves `topmost_point`. So, if `clangsa` is correct in its assumptions and it is indeed possible that both `if`\-blocks are not taken, this would in fact be UB.[5](#fn:5) Nice catch, `clangsa`!

## Conclusion

I think that CodeChecker and the static analyzers it orchestrates can be an incredibly valuable tool in software development, especially for hard-to-spot bugs. For example, the most common type of bug that I found with this so far are memory leaks in error handling procedures. These procedures run infrequently enough so that you don’t notice the memory leak immediately, and with a little bad luck they even only run in production[6](#fn:6), so that other tools like ASAN have no way of finding these.

Personally, I’m still only using CodeChecker on my own, we have no central running CodeChecker server instance at work, but I still use CodeChecker server to keep track of which bugs I reviewed, and which were fixed. Integrating this with a CI system would probably be a bit of work, but might be a valuable task for the future.

---

1. By default, CodeChecker uses plain `clang`, even for C++ sources - so the LLVM 16 equivalent would have been`/usr/bin/clang-16`. However, I had to switch it to `clang++-16` to work for me. [↩︎](#fnref:1)
2. As of 2023-06-05\. The CodeChecker folks [are working on making this a lot easier](https://github.com/Ericsson/codechecker/discussions/3929#discussioncomment-6089258). So depending on when you read this, check out if there’s an easier way by now. [↩︎](#fnref:2)
3. If you disabled CTU, you will of course only see a single pass. [↩︎](#fnref:3)
4. We could also have named that run already when running `CodeChecker analyze`, which also accepts a `--name` argument. [↩︎](#fnref:4)
5. I don’t think that is possible in this case, though. Again, it’s been a while since I wrote that code, but at least one of these so-called ‘contours’ of a dynamic segment tree should be non-empty. I’ll still have to look at this further. [↩︎](#fnref:5)
6. Of course we all have 100% line coverage in our tests, right? [↩︎](#fnref:6)

You can use your Mastodon account to reply to this [post](https://chaos.social/@tinloaf/110514922197400211).

### Reply to tinloaf's post

With an account on the Fediverse or Mastodon, you can respond to this post. Since Mastodon is decentralized, you can use your existing account hosted by another Mastodon server or compatible platform if you don't have an account on this one.

Copy and paste this URL into the search field of your favourite Fediverse app or the web interface of your Mastodon server.



# links
[Read on Omnivore](https://omnivore.app/me/code-checker-is-an-awesome-front-end-to-clang-s-static-analyzer--18cf028f8f5)
[Read Original](https://www.lukas-barth.net/blog/codechecker-clang-analyzer/)

<iframe src="https://www.lukas-barth.net/blog/codechecker-clang-analyzer/"  width="800" height="500"></iframe>
