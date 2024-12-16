---
id: d247e710-543b-4a6f-9a9f-3e179beca1f6
title: "Ericsson/codechecker: CodeChecker is an analyzer tooling, defect database and viewer extension for the Clang Static Analyzer and Clang Tidy"
tags:
  - programing
  - cpp
  - tools_to_use
date: 2024-01-09 23:47:49
words_count: 2380
state: INBOX
---

# Ericsson/codechecker: CodeChecker is an analyzer tooling, defect database and viewer extension for the Clang Static Analyzer and Clang Tidy by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> CodeChecker is an analyzer tooling, defect database and viewer extension for the Clang Static Analyzer and Clang Tidy - Ericsson/codechecker: CodeChecker is an analyzer tooling, defect database and...


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
##   
[![CodeChecker](https://proxy-prod.omnivore-image-cache.app/200x0,sYAL30C_EFRg4_5R8oBGxQyMPh2bKVwM7H4DIvmY2g1c/https://github.com/Ericsson/codechecker/raw/master/docs/logo/logo_blue.png)](https://github.com/Ericsson/codechecker/raw/master/docs/logo/logo%5Fblue.png)   
 CodeChecker  

[ ![Github Action](https://proxy-prod.omnivore-image-cache.app/0x0,siMZ5r0uztsDSK8cMYaNQOTKNe2EXpcjsj00JkDbJqxE/https://github.com/Ericsson/codechecker/workflows/codechecker-tests/badge.svg) ](https://github.com/Ericsson/codechecker/actions) [ ![Gitter](https://proxy-prod.omnivore-image-cache.app/0x0,sj_qUyZN23NJ47ZIbMMrV_rE6BaIgpvQ6fy_kNiYumsw/https://camo.githubusercontent.com/54dde9e5c4e3e045776bb19b2b8a73f1ed167220c7dc17a41cd0db3ae40b3576/68747470733a2f2f6261646765732e6769747465722e696d2f636f6465636865636b657248512f4c6f6262792e737667) ](https://gitter.im/codecheckerHQ/Lobby?utm%5Fsource=share-link&utm%5Fmedium=link&utm%5Fcampaign=share-link) [ ![Documentation Status](https://proxy-prod.omnivore-image-cache.app/0x0,sKTzgaEgs-MnaLPwxqCMFZhTImdP7D7cNo5Vnn2gOY3w/https://camo.githubusercontent.com/aca43e886881e4066bfd08e47fd738f962d3cb53ce729f02b57d1095d87005c9/68747470733a2f2f72656164746865646f63732e6f72672f70726f6a656374732f636f6465636865636b65722f62616467652f3f76657273696f6e3d6c6174657374) ](https://codechecker.readthedocs.io/en/latest/?badge=latest) 

**CodeChecker** is a static analysis infrastructure built on the [LLVM/Clang Static Analyzer](http://clang-analyzer.llvm.org/) toolchain, replacing[scan-build](http://clang-analyzer.llvm.org/scan-build.html) in a Linux or macOS (OS X) development environment.

[![Web interface showing list of analysed projects and bugs](https://proxy-prod.omnivore-image-cache.app/0x0,s3FfcrLhQ1ceTjomRyShdbfhlufqo27CpJLSuAYfLBiU/https://github.com/Ericsson/codechecker/raw/master/docs/images/demo.gif)](https://github.com/Ericsson/codechecker/blob/master/docs/images/demo.gif) 

**💡 Check out our [DEMO](https://codechecker-demo.eastus.cloudapp.azure.com/) showing some analysis results of open-source projects!**

## Main features

## Command line C/C++ Analysis

* Executes [_Clang-Tidy_](http://clang.llvm.org/extra/clang-tidy/), [_Clang Static Analyzer_](http://clang-analyzer.llvm.org/) with Cross-Translation Unit analysis, Statistical Analysis (when checkers are available), [_Cppcheck_](https://cppcheck.sourceforge.io/), and the [_GCC Static Analyzer_](https://gcc.gnu.org/wiki/StaticAnalyzer).
* Creates the JSON compilation database by wiretapping any build process (e.g., `CodeChecker log -b "make"`).
* Automatically analyzes GCC cross-compiled projects: detecting GCC or Clang compiler configuration and forming the corresponding clang analyzer invocations.
* Incremental analysis: Only the changed files and its dependencies need to be reanalyzed.
* False positive suppression with a possibility to add review comments.
* Result visualization in command line or in static HTML.

## Web-based report storage

* **You can store & visualize thousands of analysis reports** of many analyzers like Clang Static Analyzer (C/C++), Clang Tidy (C/C++), Facebook Infer (C/C++, Java), Clang Sanitizers (C/C++), Spotbugs (Java), Pylint (Python), Eslint (Javascript) ...  
For a complete list see [Supported Analyzers](https://github.com/Ericsson/codechecker/blob/master/docs/supported%5Fcode%5Fanalyzers.md)
* **Web application** for viewing discovered code defects with a streamlined, easy experience (with PostgreSQL, or SQLite backend).
* **Gerrit and GitLab integration** Shows analysis results as [GitLab](https://github.com/Ericsson/codechecker/blob/master/docs/gitlab%5Fintegration.md) or [Gerrit](https://github.com/Ericsson/codechecker/blob/master/docs/jenkins%5Fgerrit%5Fintegration.md) reviews.
* **Filterable** (defect checker name, severity, source paths, ...) and**comparable** (calculates difference between two analyses of the project, showing which bugs have been fixed and which are newly introduced) result viewing.
* **Diff mode:** This shows the list of bugs that have been introduced since your last analyzer execution.
* Results can be shared with fellow developers, the **comments** and**review** system helps communication of code defects.
* Easily implementable [Thrift](http://thrift.apache.org/)\-based server-client communication used for storing and querying of discovered defects.
* Support for multiple bug visualization frontends, such as the web application, a [command-line tool](https://github.com/Ericsson/codechecker/blob/master/docs/usage.md) and an[Eclipse plugin](http://github.com/Ericsson/CodeCheckerEclipsePlugin).

## Command line features

`CodeChecker` command has many subcommands which can be used for example to log and analyze your projects, print the results or start a web server. For full list see the following table or check the help message of this command (`CodeChecker --help`):

| CodeChecker subcommand | Description                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| analyze                | Execute the supported code analyzers for the files recorded in a JSON Compilation Database.   |
| analyzer-version       | Print the version of CodeChecker analyzer package that is being used.                         |
| analyzers              | List supported and available analyzers.                                                       |
| check                  | Perform analysis on a project and print results to standard output.                           |
| checkers               | List the checkers available for code analysis.                                                |
| cmd                    | View analysis results on a running server from the command line.                              |
| fixit                  | Apply automatic fixes based on the suggestions of the analyzers.                              |
| log                    | Run a build command, collect the executed compilation commands and store them in a JSON file. |
| parse                  | Print analysis summary and results in a human-readable format.                                |
| server                 | Start and manage the CodeChecker Web server.                                                  |
| store                  | Save analysis results to a database.                                                          |
| version                | Print the version of CodeChecker package that is being used.                                  |
| web-version            | Print the version of CodeChecker server package that is being used.                           |

`CodeChecker cmd` subcommand also has many other subcommands which can be used to get data (products, runs, results, statistics) from a running CodeChecker server. For full list see the following table or check the help message of this subcommand (`CodeChecker cmd --help`):

| CodeChecker cmd subcommand | Description                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| runs                       | List the available analysis runs.                                                                 |
| history                    | Show run history of multiple runs.                                                                |
| results                    | List analysis result (finding) summary for a given run.                                           |
| diff                       | Compare two analysis runs and show the difference.                                                |
| sum                        | Show statistics of checkers.                                                                      |
| token                      | Access subcommands related to configuring personal access tokens managed by a CodeChecker server. |
| del                        | Delete analysis runs.                                                                             |
| update                     | Update an analysis run.                                                                           |
| suppress                   | Manage and import suppressions of reports on a CodeChecker server.                                |
| products                   | Access subcommands related to configuring the products managed by a CodeChecker server.           |
| components                 | Access subcommands related to configuring the source components managed by a CodeChecker server.  |
| login                      | Authenticate into CodeChecker servers that require privileges.                                    |
| export                     | Export comments and review statuses from CodeChecker.                                             |
| import                     | Import comments and review statuses into CodeChecker.                                             |

## Usage flow

[![Usage diagram](https://proxy-prod.omnivore-image-cache.app/0x0,sImBIA8k_4TjNH-qoBtwxfDAdzYM5Sb4q9KOfysCzI54/https://github.com/Ericsson/codechecker/raw/master/docs/images/usage_flow.png)](https://github.com/Ericsson/codechecker/blob/master/docs/images/usage%5Fflow.png)

* _Step 1_: `CodeChecker log` runs the given build command and records the executed compilation steps. These steps are written to an output file (Compilation Database) in a JSON format.
* _Step 2_: `CodeChecker analyze` uses the previously created JSON Compilation Database to perform an analysis on the project, outputting analysis results in a machine-readable (plist) format.
* _Step 3_: In this step, you can do multiple things:  
   * Parse and pretty-print the summary and results from analysis result files (`CodeChecker parse`).  
   * Store the results to a running CodeChecker server (`CodeChecker store`).  
   * Compare two analysis results/runs to show the results that differ between the two (`CodeChecker cmd diff`).  
   * etc.

For more information how to use CodeChecker see our [user guide](https://github.com/Ericsson/codechecker/blob/master/docs/usage.md).

## User documentation

* [Getting started (How-To with examples)](https://github.com/Ericsson/codechecker/blob/master/docs/usage.md)

## C/C++ Analysis

* [Analyzer User guide](https://github.com/Ericsson/codechecker/blob/master/docs/analyzer/user%5Fguide.md)
* [Avoiding or suppressing false positives](https://github.com/Ericsson/codechecker/blob/master/docs/analyzer/false%5Fpositives.md)
* [Checker and Static Analyzer configuration](https://github.com/Ericsson/codechecker/blob/master/docs/analyzer/checker%5Fand%5Fanalyzer%5Fconfiguration.md)
* [GCC incompatibilities](https://github.com/Ericsson/codechecker/blob/master/docs/analyzer/gcc%5Fincompatibilities.md)
* [Suppressing false positives](https://github.com/Ericsson/codechecker/blob/master/docs/analyzer/user%5Fguide.md#source-code-comments)

## Web based report management

* [Webserver User Guide](https://github.com/Ericsson/codechecker/blob/master/docs/web/user%5Fguide.md)
* [WEB GUI User Guide](https://github.com/Ericsson/codechecker/blob/master/web/server/vue-cli/src/assets/userguide/userguide.md)
* [Command line and WEB UI Feature overview](https://github.com/Ericsson/codechecker/blob/master/docs/feature%5Fcomparison.md)
* Security configuration  
   * [Configuring Authentication](https://github.com/Ericsson/codechecker/blob/master/docs/web/authentication.md)  
   * [Configuring Authorization](https://github.com/Ericsson/codechecker/blob/master/docs/web/permissions.md)
* Deployment  
   * [Deploy server using docker](https://github.com/Ericsson/codechecker/blob/master/docs/web/docker.md#deployment)
* Server Configuration  
   * [Configuring Server Logging](https://github.com/Ericsson/codechecker/blob/master/docs/logging.md)  
   * [Setting up multiple CodeChecker repositories in one server](https://github.com/Ericsson/codechecker/blob/master/docs/web/products.md)
* Continuous Integration (CI)  
   * [CodeChecker as a GitHub Action](http://github.com/marketplace/actions/codechecker-static-analysis)  
   * [Setting up CI gating with Gerrit and Jenkins](https://github.com/Ericsson/codechecker/blob/master/docs/jenkins%5Fgerrit%5Fintegration.md)
* Database Configuration  
   * [PostgreSQL database backend setup guide](https://github.com/Ericsson/codechecker/blob/master/docs/web/postgresql%5Fsetup.md)  
   * [CodeChecker server and database schema upgrade guide](https://github.com/Ericsson/codechecker/blob/master/docs/web/db%5Fschema%5Fguide.md)

### Storage of reports from analyzer tools

CodeChecker can be used as a generic tool for visualizing analyzer results.

The following tools are supported:

| Language                                                                                                                      | Analyzer                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **C/C++**                                                                                                                     | [Clang Static Analyzer](https://clang-analyzer.llvm.org/)                                                                       |
| [Clang Tidy](https://clang.llvm.org/extra/clang-tidy/)                                                                        |                                                                                                                                 |
| [Clang Sanitizers](https://github.com/Ericsson/codechecker/blob/master/docs/supported%5Fcode%5Fanalyzers.md#clang-sanitizers) |                                                                                                                                 |
| [Cppcheck](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#cppcheck)                       |                                                                                                                                 |
| [Facebook Infer](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#facebook-infer)           |                                                                                                                                 |
| [Coccinelle](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#coccinelle)                   |                                                                                                                                 |
| [Smatch](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#smatch)                           |                                                                                                                                 |
| [Kernel-Doc](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#kernel-doc)                   |                                                                                                                                 |
| [Sparse](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#sparse)                           |                                                                                                                                 |
| [cpplint](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#cpplint)                         |                                                                                                                                 |
| **C#**                                                                                                                        | [Roslynator.DotNet.Cli](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#roslynatordotnetcli) |
| **Java**                                                                                                                      | [SpotBugs](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#spotbugs)                         |
| [Facebook Infer](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#facebook-infer)           |                                                                                                                                 |
| **Python**                                                                                                                    | [Pylint](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#pylint)                             |
| [Pyflakes](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#pyflakes)                       |                                                                                                                                 |
| **JavaScript**                                                                                                                | [ESLint](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#eslint)                             |
| **TypeScript**                                                                                                                | [TSLint](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#tslint)                             |
| **Go**                                                                                                                        | [Golint](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#golint)                             |
| **Markdown**                                                                                                                  | [Markdownlint](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#markdownlint)                 |
| [Sphinx](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#sphinx)                           |                                                                                                                                 |

For details see[supported code analyzers](https://github.com/Ericsson/codechecker/blob/master/docs/supported%5Fcode%5Fanalyzers.md) documentation and the[Report Converter Tool](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md).

## Common Tools

Useful tools that can also be used outside CodeChecker.

* [Build Logger (to generate JSON Compilation Database from your builds)](https://github.com/Ericsson/codechecker/blob/master/analyzer/tools/build-logger/README.md)
* [Plist/Sarif to HTML converter (to generate HTML files from the given plist or sarif files)](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#plist-to-html-tool)
* [Report Converter Tool (to convert analysis results from other analyzers to the codechecker report directory format))](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md)
* [Translation Unit Collector (to collect source files of a translation unit or to get source files which depend on the given header files)](https://github.com/Ericsson/codechecker/blob/master/docs/tools/tu%5Fcollector.md)
* [Report Hash generator (to generate unique hash identifiers for reports)](https://github.com/Ericsson/codechecker/blob/master/docs/tools/report-converter.md#report-hash-generation-module)

## Helper Scripts

* [Helper Scripts for daily analysis](https://github.com/Ericsson/codechecker/blob/master/docs/script%5Fdaily.md)

## Install guide

## Install CodeChecker via `pip`

CodeChecker is available on the [pypi](https://pypi.org/project/codechecker/)and can be installed with the following command:

**Note:** this package can be installed on `Linux`, `OSX` and `Windows`systems where `pip3` command is available. On `OSX`, `intercept-build` must be installed for logging (`CodeChecker log`). On `Windows`, logging is not available.

## Installing CodeChecker via the `snap` package manager

CodeChecker is available on the [Snap Store](https://snapcraft.io/codechecker)and can be installed with the following command:

sudo snap install codechecker --classic

**Note:** Unfortunately, the snap package supports only lower-case command names. For this reason, you need to use `codechecker` command instead of `CodeChecker`everywhere. For a full list of available commands in the _codechecker_ snap package, run `snap info codechecker`.

## Linux

For a detailed dependency list, and for instructions on how to install newer Clang and Clang-Tidy versions, please see [Requirements](https://github.com/Ericsson/codechecker/blob/master/docs/deps.md). The following commands are used to bootstrap CodeChecker on Ubuntu 20.04 LTS:

# Install mandatory dependencies for a development and analysis environment.
# NOTE: clang or clang-tidy can be any sufficiently fresh version, and need not
#       come from package manager!
#       In case of Cppcheck, the minimal supported version is 1.80.
#       In case of gcc, the minimal supported version is 13.0.0.
sudo apt-get install clang clang-tidy cppcheck g++ build-essential curl
      gcc-multilib git python3-dev python3-venv python3-setuptools

# Install nodejs dependency for web. In case of Debian/Ubuntu you can use the
# following commands. For more information see the official docs:
# https://nodejs.org/en/download/package-manager/
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Check out CodeChecker source code.
git clone https://github.com/Ericsson/CodeChecker.git --depth 1 ~/codechecker
cd ~/codechecker

# Create a Python virtualenv and set it as your environment.
# NOTE: if you want to develop CodeChecker, use the `venv_dev` target instead
# of `venv`.
make venv
source $PWD/venv/bin/activate

# [Optional] If you want to use external authentication methods (LDAP / PAM)
# follow the instructions in
# docs/web/authentication.md#external-authentication-methods

# Build and install a CodeChecker package.
make package

# For ease of access, add the build directory to PATH.
export PATH="$PWD/build/CodeChecker/bin:$PATH"

cd ..

**Notes**:

* By default, `make package` will build ldlogger shared objects for`32bit` and `64bit` too. If you would like to build and package `64 bit only`shared objects and ldlogger binary you can set `BUILD_LOGGER_64_BIT_ONLY`environment variable to `YES` before the package build:`BUILD_LOGGER_64_BIT_ONLY=YES make package`.
* By default, the `make package` will build the UI code if it's not built yet or the UI code is changed. If you wouldn't like to build the UI code you can set the `BUILD_UI_DIST` environment variable to `NO` before the package build:`BUILD_UI_DIST=NO make package`.
* Use `make standalone_package` instead of `make package` to avoid having to manually activate the environment before running CodeChecker.

### Upgrading environment after system or Python upgrade

If you have upgraded your system's Python to a newer version (e.g., from`2.7.6` to `2.7.12` – this is the case when upgrading Ubuntu from 14.04.2 LTS to 16.04.1 LTS), the installed environment will not work out-of-the-box. To fix this issue, run the following command to upgrade your`checker_env` too:

cd ~/codechecker/venv
python3 -m venv .

## Mac OS X

For installation instructions for Mac OS X see [Mac OS X Installation Guide](https://github.com/Ericsson/codechecker/blob/master/docs/install%5Fmacosx.md) documentation.

## Docker

To run the CodeChecker server in Docker see the [Docker](https://github.com/Ericsson/codechecker/blob/master/docs/web/docker.md) documentation. You can find the CodeChecker web-server container at the [Docker Hub](https://hub.docker.com/r/codechecker/codechecker-web).

[![](https://proxy-prod.omnivore-image-cache.app/100x0,syj-yXekyGSlzvmC9mBssLGSGEkJWov2Bgrau9DfypK8/https://raw.githubusercontent.com/Ericsson/codechecker/master/docs/images/docker.jpg)](https://raw.githubusercontent.com/Ericsson/codechecker/master/docs/images/docker.jpg)

## Visual Studio Code plugin

[![](https://proxy-prod.omnivore-image-cache.app/100x0,s5ylyLw59h88OT5frFNoIWMkUqIxfO1FmtqzppplHpuY/https://raw.githubusercontent.com/Ericsson/codechecker/master/docs/images/vscode.png)](https://raw.githubusercontent.com/Ericsson/codechecker/master/docs/images/vscode.png)

You can install and use CodeChecker VSCode extension from the[Visual Studio Marketplace](http://marketplace.visualstudio.com/items?itemName=codechecker.vscode-codechecker)or from [Open VSX](http://open-vsx.org/extension/codechecker/codechecker).

Main features:

* Run CodeChecker analysis from the editor and see the results automatically.
* Re-analyze the current file when saved.
* Commands and build tasks for running CodeChecker as part of a build system.
* Browse through the found reports and show the reproduction steps directly in the code.
* Navigate between the reproduction steps.

[![VSCode plugin](https://proxy-prod.omnivore-image-cache.app/0x0,sa1DzBtyMvdh7Z4G4Uaeue9LYXvR45ZNEpuGqHx2_l5Y/https://github.com/Ericsson/codechecker/raw/master/docs/images/vscode.gif)](https://github.com/Ericsson/codechecker/blob/master/docs/images/vscode.gif) 

For more information how to install and use this plugin see the[repository](https://github.com/Ericsson/codecheckervsCodePlugin/) of this extension.

## GitHub Actions CI

[![CodeChecker executed in GitHub Actions](https://proxy-prod.omnivore-image-cache.app/0x0,sCDL3_xTY0cVVS946Rwxo2zlT1ttJlfjPL2MnwWK7OSM/https://github.com/Ericsson/codechecker/raw/master/docs/images/github-actions.png)](https://github.com/Ericsson/codechecker/blob/master/docs/images/github-actions.png)

CodeChecker can be executed via a reusable GitHub action for your project! You need only specify the build command, as if you would run the analysis locally.

For more information, check out the[CodeChecker Static Analysis](http://github.com/marketplace/actions/codechecker-static-analysis)action on the GitHub Actions Marketplace.

## Analyze your first project

## Setting up the environment in your Terminal

These steps must always be taken in a new command prompt you wish to execute analysis in.

source ~/codechecker/venv/bin/activate

# Path of CodeChecker package
# NOTE: SKIP this line if you want to always specify CodeChecker's full path.
export PATH=~/codechecker/build/CodeChecker/bin:$PATH

# Path of the built LLVM/Clang
# NOTE: SKIP this line if clang is available in your PATH as an installed Linux package.
export PATH=~/<user path>/build/bin:$PATH

## Execute analysis

Analyze your project with the `check` command:

```smali
CodeChecker check -b "cd ~/your-project && make clean && make" -o ./results

```

`check` will print an overview of the issues found in your project by the analyzers. The reports will be stored in the `./results` directory in `plist`XML format.

## Export the reports as static HTML files

You can visualize the results as static HTML by executing

`CodeChecker parse -e html ./results -o ./reports_html`

An index page will be generated with a list of all repors in`./reports_html/index.html`

## Optionally store the results in Web server & view the results

If you have hundreds of results, you may want to store them on the web server with a database backend.

Start a CodeChecker web and storage server in another terminal or as a background process. By default, it will listen on `localhost:8001`.

The SQLite database containing the reports will be placed in your workspace directory (`~/.codechecker` by default), which can be provided via the `-w`flag.

Store your analysis reports onto the server to be able to use the Web Viewer.

```applescript
CodeChecker store ./results -n my-project

```

Open the [CodeChecker Web Viewer](http://localhost:8001/) in your browser, and you should be greeted with a web application showing you the analysis results.

## Important environmental limitations

## Python 2 and older Python 3 releases

CodeChecker has been ported completely to Python **3**.**No Python 2 support is planned.**You will need at least Python version **`3.8`**. Old virtual environments that were created with a Python 2 interpreter need to be removed.

### Upgrading environment after system or Python upgrade

If you have upgraded your system's Python to a newer version (e.g., from`2.7` to `3.8` – this is the case when upgrading Ubuntu from 14.04 LTS to 20.04 LTS), the installed environment will not work out-of-the-box. To fix this issue, run the following command to upgrade your `checker_env` too:

cd ~/codechecker/venv
python3 -m venv .

## Older Clang versions

Clang `3.6` or earlier releases are **NOT** supported due to CodeChecker relying on features not available in those releases.

If you have Clang `3.7` installed you might see the following warning message:

> Hash value wasn't found in the plist file.

Use Clang `>= 3.8` or SVN trunk `r251011` / Git commit[efec163](http://github.com/llvm/llvm-project) — otherwise, CodeChecker generates a simple hash based on the filename and the line content. This method is applied for Clang-Tidy results too, because Clang-Tidy does not support bug identifier hash generation currently.

## Developer documentations

* [Architecture](https://github.com/Ericsson/codechecker/blob/master/docs/architecture.md)
* [Package layout](https://github.com/Ericsson/codechecker/blob/master/docs/package%5Flayout.md)
* [Dependencies](https://github.com/Ericsson/codechecker/blob/master/docs/deps.md)
* [Thrift interface](https://github.com/Ericsson/codechecker/blob/master/docs/web/api/README.md)
* [Package and integration tests](https://github.com/Ericsson/codechecker/blob/master/docs/tests.md)
* [Checker documentation mapping file](https://github.com/Ericsson/codechecker/blob/master/docs/web/checker%5Fdocs.md)

## Conference papers, presentations

* An overview about the CodeChecker infrastructure was given at [PLDI 2020](http://pldi20.sigplan.org/).  
**Márton, Gábor and Krupp, Dániel**:  
[_Tool Talk: CodeChecker_](http://youtube.com/watch?v=bVqrhaoxHlc)
* A high-level overview about the infrastructure is available amongst the[2015 Euro LLVM Conference](http://llvm.org/devmtg/2015-04) presentations.  
**Krupp, Dániel and Orbán, György and Horváth, Gábor and Babati, Bence**:  
[_Industrial Experiences with the Clang Static Analysis Toolset_](http://llvm.org/devmtg/2015-04/slides/Clang%5Fstatic%5Fanalysis%5Ftoolset%5Ffinal.pdf)



# links
[Read on Omnivore](https://omnivore.app/me/ericsson-codechecker-code-checker-is-an-analyzer-tooling-defect--18cf0322c63)
[Read Original](https://github.com/Ericsson/codechecker)

<iframe src="https://github.com/Ericsson/codechecker"  width="800" height="500"></iframe>
