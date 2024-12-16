---
id: 73e28bf0-6d1b-11ee-9476-1358477e3b02
title: Interactive Workflows for C++ with Jupyter | by QuantStack | Jupyter Blog
author: QuantStack
tags:
  - programing
  - text_editors
  - cpp
date: 2023-10-17 21:31:57
date_published: 2017-11-29 18:33:41
words_count: 1883
state: INBOX
---

# Interactive Workflows for C++ with Jupyter | by QuantStack | Jupyter Blog by QuantStack
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Scientists, educators and engineers not only use programming languages to build software systems, but also in interactive workflows, using the tools available to explore a problem and reason about…


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Scientists, educators and engineers not only use programming languages to build software systems, but also in interactive workflows, using the tools available to _explore_ a problem and _reason_ about it.

Running some code, looking at a visualization, loading data, and running more code. Quick iteration is especially important during the exploratory phase of a project.

For this kind of workflow, users of the C++ programming language currently have no choice but to use a heterogeneous set of tools that don’t play well with each other, making the whole process cumbersome, and difficult to reproduce.

**_We currently lack a good story for interactive computing in C++_**.

In our opinion, this hurts the productivity of C++ developers:

* Most of the progress made in software projects comes from incrementalism. Obstacles to fast iteration hinder progress.
* This also makes C++ more difficult to teach. The first hours of a C++ class are rarely rewarding as the students must learn how to set up a small project before writing any code. And then, a lot more time is required before their work can result in any visual outcome.

## Project Jupyter and Interactive Computing

![](https://proxy-prod.omnivore-image-cache.app/700x189,sqWkKjnQQaaXhAWchag0KyA9c_fgxk_33zPjTn7hClSA/https://miro.medium.com/v2/resize:fit:700/1*wOHyKy6fl3ltcBMNpCvC6Q.png)

The goal of Project Jupyter is to provide a consistent set of tools for scientific computing and data science workflows, from the exploratory phase of the analysis to the presentation and the sharing of the results. The Jupyter stack was designed to be agnostic of the programming language, and also to allow alternative implementations of any component of the layered architecture (back-ends for programming languages, custom renderers for file types associated with Jupyter). The stack consists of

* a low-level specification for messaging protocols, standardized file formats,
* a reference implementation of these standards,
* applications built on top of these libraries: the Notebook, JupyterLab, Binder, JupyterHub
* and visualization libraries integrated into the Notebook and JupyterLab.

Adoption of the Jupyter ecosystem has skyrocketed in the past years, with millions of users worldwide, over a million Jupyter notebooks shared on GitHub and large-scale deployments of Jupyter in universities, companies and high-performance computing centers.

## Jupyter and C++

One of the main extension points of the Jupyter stack is the _kernel_, the part of the infrastructure responsible for executing the user’s code. Jupyter kernels exist for [numerous programming languages](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels).

Most Jupyter kernels are implemented in the target programming language: the reference implementation [ipykernel](https://github.com/ipython/ipykernel) in Python, [IJulia](https://github.com/JuliaLang/IJulia.jl) in Julia, leading to a duplication of effort for the implementation of the protocol. A common denominator to a lot of these interpreted languages is that the interpreter generally exposes a C API, allowing the embedding into a native application. In an effort to consolidate these commonalities and save work for future kernel builders, we developed _xeus_.

![](https://proxy-prod.omnivore-image-cache.app/452x150,sVMUZw7MUGqOzr5OHlg05nkOo162CvYzNIs4haUa1or8/https://miro.medium.com/v2/resize:fit:452/1*TKrPv5AvFM3NJ6a7VMu8Tw.png)

[Xeus ](https://github.com/QuantStack/xeus)is a C++ implementation of the Jupyter kernel protocol. It is not a kernel itself but a library that facilitates the authoring of kernels, and other applications making use of the Jupyter kernel protocol.

A typical kernel implementation using xeus would in fact make use of the target interpreter _as a library._

There are a number of benefits of using xeus over implementing your kernel in the target language:

* Xeus provides a complete implementation of the protocol, enabling a lot of features from the start for kernel authors, who only need to deal with the language bindings.
* Xeus-based kernels can very easily provide a back-end for Jupyter interactive widgets.
* Finally, xeus can be used to implement kernels for domain-specific languages such as SQL flavors. Existing approaches use a Python wrapper. With xeus, the resulting kernel won't require Python at run-time, leading to large performance benefits.

![](https://proxy-prod.omnivore-image-cache.app/450x230,sZiZz2A8yLVoIFPIXA-ZNzvwqV94m0CA02Vee_Leq6OE/https://miro.medium.com/v2/resize:fit:450/1*Cr_cfHdrgFXHlO15qdNK7w.png)

**Interpreted C++** is already a reality at CERN with the [Cling](https://root.cern.ch/cling) C++ interpreter in the context of the [ROOT](https://root.cern.ch/) data analysis environment.

As a first example for a kernel based on xeus, we have implemented [xeus-cling](https://github.com/QuantStack/xeus-cling), a pure C++ kernel.

![](https://proxy-prod.omnivore-image-cache.app/700x368,sGnG9zrxWGr5OojJosjuD2EK84cxTO0KCvpA43d6SAd8/https://miro.medium.com/v2/resize:fit:700/1*NnjISpzZtpy5TOurg0S89A.gif)

Redirection of outputs to the Jupyter front-end, with different styling in the front-end.

Complex features of the C++ programming language such as, polymorphism, templates, lambdas, are supported by the cling interpreter, making the C++ Jupyter notebook a great prototyping and learning platform for the C++ users. See the image below for a demonstration:

![](https://proxy-prod.omnivore-image-cache.app/700x368,s17RSUyOFSAtRTfigiK8cvZ820Hf6Vz-A5wyQSZ8HaqU/https://miro.medium.com/v2/resize:fit:700/1*lGVLY4fL1ytMfT-eWtoXkw.gif)

Features of the C++ programming language supported by the cling interpreter

Finally, xeus-cling supports live quick-help, fetching the content on [cppreference](http://en.cppreference.com/w/) in the case of the standard library.

![](https://proxy-prod.omnivore-image-cache.app/700x336,sDQLFi-B56dm8ko-6VtCEndn2uC3mNreDx5PhReKucF8/https://miro.medium.com/v2/resize:fit:700/1*Igegq0xBebuJV8hy0TGpfg.png)

Live help for the C++standard library in the Jupyter notebook

> We realized that we started using the C++ kernel ourselves very early in the development of the project. For quick experimentation, or reproducing bugs. No need to set up a project with a cpp file and complicated project settings for finding the dependencies… Just write some code and hit **Shift+Enter**.

Visual output can also be displayed using the rich display mechanism of the Jupyter protocol.

![](https://proxy-prod.omnivore-image-cache.app/700x472,sHGuvE8qSjeGnr8lVMUg7W7tTo2zzbhzvrhViye26z4I/https://miro.medium.com/v2/resize:fit:700/1*t_9qAXtdkSXr-0tO9VvOzQ.png)

Using Jupyter's rich display mechanism to display an image inline in the notebook

![](https://proxy-prod.omnivore-image-cache.app/700x151,sOjs9cpIqcRJY-YUSDAA7Y3VLr2wuq2oUJLdG2p2yGE8/https://miro.medium.com/v2/resize:fit:700/1*OVfmXFAbfjUtGFXYS9fKRA.png)

Another important feature of the Jupyter ecosystem are the [Jupyter Interactive Widgets](http://jupyter.org/widgets). They allow the user to build graphical interfaces and interactive data visualization inline in the Jupyter notebook. Moreover it is not just a collection of widgets, but a framework that can be built upon, to create arbitrary visual components. Popular interactive widget libraries include

* [bqplot](https://github.com/bloomberg/bqplot) (2-D plotting with d3.js)
* [pythreejs](https://github.com/jovyan/pythreejs) (3-D scene visualization with three.js)
* [ipyleaflet](https://github.com/ellisonbg/ipyleaflet) (maps visualization with leaflet.js)
* [ipyvolume](https://github.com/maartenbreddels/ipyvolume) (3-D plotting and volume rendering with three.js)
* [nglview](https://github.com/arose/nglview) (molecular visualization)

Just like the rest of the Jupyter ecosystem, Jupyter interactive widgets were designed as a language-agnostic framework. Other language back-ends can be created reusing the front-end component, which can be installed separately.

[xwidgets](https://github.com/QUantStack/xwidgets), which is still at an early stage of development, is a native C++ implementation of the Jupyter widgets protocol. It already provides an implementation for most of the widget types available in the core Jupyter widgets package.

![](https://proxy-prod.omnivore-image-cache.app/700x376,sYFZ6baJH0Dg889tfqJrXlrXcdI2hWeSws18rpAIvQk8/https://miro.medium.com/v2/resize:fit:700/1*ro5Ggdstnf0DoqhTUWGq3A.gif)

C++ back-end to the Jupyter interactive widgets

Just like with ipywidgets, one can build upon xwidgets and implement C++ back-ends for the Jupyter widget libraries listed earlier, effectively enabling them for the C++ programming language and other xeus-based kernels: xplot, xvolume, xthreejs…

![](https://proxy-prod.omnivore-image-cache.app/700x274,sLP0FtnS-Oinv5qLdUEsW4xWx0fEdpgx-3IRF7atknCY/https://miro.medium.com/v2/resize:fit:700/1*yCRYoJFnbtxYkYMRc9AioA.png)

[xplot](https://github.com/QuantStack/xplot) is an experimental C++ back-end for the [bqplot](https://github.com/bloomberg/bqplot) 2-D plotting library. It enables an API following the constructs of the [_Grammar of Graphics_](https://dl.acm.org/citation.cfm?id=1088896) in C++.

In xplot, every item in a chart is a separate object that can be modified from the back-end, _dynamically_.

Changing a property of a plot item, a scale, an axis or the figure canvas itself results in the communication of an update message to the front-end, which reflects the new state of the widget visually.

![](https://proxy-prod.omnivore-image-cache.app/700x523,swtvhBdLOd1HTLUV8j976GzyWliWcdvk9x-NKE8WPHAk/https://miro.medium.com/v2/resize:fit:700/1*Mx2g3JuTG1Cfvkkv0kqtLA.gif)

Changing the data of a scatter plot dynamically to update the chart

> **Warning:** the xplot and xwidgets projects are still at an early stage of development and are changing drastically at each release.

Interactive computing environments like Jupyter are not the only missing tool in the C++ world. Two key ingredients to the success of Python as the _lingua franca_ of data science is the existence of libraries like [NumPy](http://www.numpy.org/) and [Pandas](https://pandas.pydata.org/) at the foundation of the ecosystem.

![](https://proxy-prod.omnivore-image-cache.app/700x148,sE37pZFxxJppSWj_SXMqoT-_BmdVV2CUCnwBfMuqM0Tk/https://miro.medium.com/v2/resize:fit:700/1*HsU43Jzp1vJZpX2g8XPJsg.png)

[xtensor](https://github.com/QuantStack/xtensor/) is a C++ library meant for numerical analysis with multi-dimensional array expressions.

xtensor provides

* an extensible expression system enabling lazy NumPy-style broadcasting.
* an API following the _idioms_ of the C++ standard library.
* tools to manipulate array expressions and build upon xtensor.

xtensor exposes an API similar to that of NumPy covering a growing portion of the functionalities. A cheat sheet can be [found in the documentation](http://xtensor.readthedocs.io/en/latest/numpy.html):

![](https://proxy-prod.omnivore-image-cache.app/700x336,sQeBMv9z6XuprAcO8UIJP35FQBBLXbdNjNjukePLI-g0/https://miro.medium.com/v2/resize:fit:700/1*PBrf5vWYC8VTq_7VUOZCpA.gif)

Scrolling the NumPy to xtensor cheat sheet

However, xtensor internals are very different from NumPy. Using modern C++ techniques (template expressions, closure semantics) xtensor is a lazily evaluated library, avoiding the creation of temporary variables and unnecessary memory allocations, even in the case complex expressions involving broadcasting and language bindings.

Still, from a user perspective, the combination of xtensor with the C++ notebook provides an experience very similar to that of NumPy in a Python notebook.

![](https://proxy-prod.omnivore-image-cache.app/700x612,sYuhDDzanQBs4Cith9KEeS4hCb7_2ZjDa05jJa7zlnuY/https://miro.medium.com/v2/resize:fit:700/1*ULFpg-ePkdUbqqDLJ9VrDw.png)

Using the xtensor array expression library in a C++ notebook

In addition to the core library, the xtensor ecosystem has a number of other components

* [**xtensor-blas**](https://github.com/QuantStack/xtensor-blas): the counterpart to the numpy.linalg module.
* [**xtensor-fftw**](https://github.com/egpbos/xtensor-fftw): bindings to the [fftw](http://www.fftw.org/) library.
* [**xtensor-io**](https://github.com/QuantStack/xtensor-io): APIs to read and write various file formats (images, audio, NumPy's NPZ format).
* [**xtensor-ros**](https://github.com/wolfv/xtensor%5Fros): bindings for ROS, the robot operating system.
* [**xtensor-python**](https://github.com/QuantStack/xtensor-python): bindings for the Python programming language, allowing the use of NumPy arrays in-place, using the NumPy C API and the pybind11 library.
* [**xtensor-julia**](https://github.com/QuantStack/Xtensor.jl): bindings for the Julia programming language, allowing the use of Julia arrays in-place, using the C API of the Julia interpreter, and the CxxWrap library.
* [**xtensor-r**](https://github.com/QuantStack/xtensor-r): bindings for the R programming language, allowing the use of R arrays in-place.

Detailing further the features of the xtensor framework would be beyond the scope of this post.

If you are interested in trying the various notebooks presented in this post, there is no need to install anything. You can just use _binder_:

![](https://proxy-prod.omnivore-image-cache.app/365x83,sJy_yIY4884Wqc2wkEF8XBuFRWx4zF5st67evFVTFd5I/https://miro.medium.com/v2/resize:fit:365/1*9cy5Mns_I0eScsmDBjvxDQ.png)

[The Binder project](https://mybinder.org/), which is part of Project Jupyter, enables the deployment of containerized Jupyter notebooks, from a GitHub repository together with a manifest listing the dependencies (as conda packages).

All the notebooks in the screenshots above can be run online, by just clicking on one of the following links:

[**xeus-cling**](https://mybinder.org/v2/gh/QuantStack/xeus-cling/stable?filepath=notebooks%2Fxcpp.ipynb): the main xeus-cling example notebook,

[**xtensor**](https://mybinder.org/v2/gh/QuantStack/xtensor/stable?filepath=notebooks%2Fxtensor.ipynb): the C++ N-D array expression library in a C++ notebook,

[**xwidgets**](https://mybinder.org/v2/gh/QuantStack/xwidgets/0.11.1?filepath=notebooks%2Fxwidgets.ipynb): the C++ back-end for Jupyter interactive widgets,

[**xplot**](https://mybinder.org/v2/gh/QuantStack/xplot/0.5.0?filepath=notebooks): the C++ back-end to the bqplot 2-D plotting library for Jupyter.

![](https://proxy-prod.omnivore-image-cache.app/700x307,sJwkdOO6vvScV_hF366CMYefUcNLuJ-V9bmjJFY9cIV0/https://miro.medium.com/v2/resize:fit:700/1*JwqhpMxMJppEepj7U4fV-g.png)

[JupyterHub](https://github.com/jupyterhub/jupyterhub) is the multi-user infrastructure underlying open wide deployments of Jupyter like Binder but also smaller deployments for authenticated users.

The modular architecture of JupyterHub enables a great variety of scenarios on how users are authenticated, and what service is made available to them. JupyterHub deployment for several hundreds of users have been done in various universities and institutions, including the Paris-Sud University, where the C++ kernel was also installed for the students to use.

> In September 2017, the 350 first-year students at Paris-Sud University who took the “[Info 111: Introduction to Computer  Science](http://nicolas.thiery.name/Enseignement/Info111/)” class wrote their first lines of C++ in a Jupyter notebook.

The use of Jupyter notebooks in the context of teaching C++ proved especially useful for the first classes, where students can focus on the syntax of the language without distractions such as compiling and linking.

## Acknowledgements

The software presented in this post was built upon the work of a large number of people including the **Jupyter** team and the **Cling** developers.

We are especially grateful to [Patrick Bos ](https://twitter.com/egpbos)(who authored xtensor-fftw), Nicolas Thiéry, Min Ragan Kelley, Thomas Kluyver, Yuvi Panda, Kyle Cranmer,Axel Naumann and Vassil Vassilev.

We thank the [DIANA/HEP](http://diana-hep.org/) organization for supporting travel to CERN and encouraging the collaboration between Project Jupyter and the ROOT team.

We are also grateful to the team at **Paris-Sud University** who worked on the JupyterHub deployment and the class materials, notably [Viviane Pons](https://twitter.com/pyviv).

The development of xeus, xtensor, xwidgets and related packages at [QuantStack](https://twitter.com/QuantStack) is sponsored by [**Bloomberg**](http://www.techatbloomberg.com/).

## About the Authors (alphabetical order)

[_Sylvain Corlay_](https://twitter.com/SylvainCorlay)_,_ Scientific Software Developer at [QuantStack](https://github.com/QuantStack/)

[_Loic Gouarin_](https://twitter.com/lgouarin)_,_ Research Engineer at [Laboratoire de Mathématiques at Orsay](https://www.math.u-psud.fr/)

[_Johan Mabille_](https://twitter.com/johanmabille?lang=en)_,_ Scientific Software Developer at [QuantStack](https://github.com/QuantStack/)

[_Wolf Vollprecht_](https://twitter.com/wuoulf), Scientific Software Developer at [QuantStack](https://github.com/QuantStack/)



# links
[Read on Omnivore](https://omnivore.app/me/interactive-workflows-for-c-with-jupyter-by-quant-stack-jupyter--18b3ee8a952)
[Read Original](https://blog.jupyter.org/interactive-workflows-for-c-with-jupyter-fe9b54227d92)

<iframe src="https://blog.jupyter.org/interactive-workflows-for-c-with-jupyter-fe9b54227d92"  width="800" height="500"></iframe>
