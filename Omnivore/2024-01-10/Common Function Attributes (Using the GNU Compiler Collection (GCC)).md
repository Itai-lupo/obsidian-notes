---
id: f04cdb88-ed3b-4206-8fb6-64eacce8ec85
title: Common Function Attributes (Using the GNU Compiler Collection (GCC))
tags:
  - programing
  - cpp
date: 2024-01-10 02:45:11
words_count: 11315
state: INBOX
---

# Common Function Attributes (Using the GNU Compiler Collection (GCC)) by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Common Function Attributes (Using the GNU Compiler Collection (GCC))

## note
>[!note] 
>   Common Function Attributes in cpp

# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
The following attributes are supported on most targets.

`access (access-mode, ref-index)`[ ¶](#index-access-function-attribute)

`access (access-mode, ref-index, size-index)`

The `access` attribute enables the detection of invalid or unsafe accesses by functions to which they apply or their callers, as well as write-only accesses to objects that are never read from. Such accesses may be diagnosed by warnings such as \-Wstringop-overflow,\-Wuninitialized, \-Wunused, and others.

The `access` attribute specifies that a function to whose by-reference arguments the attribute applies accesses the referenced object according toaccess-mode. The access-mode argument is required and must be one of four names: `read_only`, `read_write`, `write_only`, or `none`. The remaining two are positional arguments.

The required ref-index positional argument denotes a function argument of pointer (or in C++, reference) type that is subject to the access. The same pointer argument can be referenced by at most one distinct `access` attribute.

The optional size-index positional argument denotes a function argument of integer type that specifies the maximum size of the access. The size is the number of elements of the type referenced by ref-index, or the number of bytes when the pointer type is `void*`. When nosize-index argument is specified, the pointer argument must be either null or point to a space that is suitably aligned and large for at least one object of the referenced type (this implies that a past-the-end pointer is not a valid argument). The actual size of the access may be less but it must not be more.

The `read_only` access mode specifies that the pointer to which it applies is used to read the referenced object but not write to it. Unless the argument specifying the size of the access denoted by size-indexis zero, the referenced object must be initialized. The mode implies a stronger guarantee than the `const` qualifier which, when cast away from a pointer, does not prevent the pointed-to object from being modified. Examples of the use of the `read_only` access mode is the argument to the `puts` function, or the second and third arguments to the `memcpy` function.

__attribute__ ((access (read_only, 1)))
int puts (const char*);

__attribute__ ((access (read_only, 2, 3)))
void* memcpy (void*, const void*, size_t);

The `read_write` access mode applies to arguments of pointer types without the `const` qualifier. It specifies that the pointer to which it applies is used to both read and write the referenced object. Unless the argument specifying the size of the access denoted by size-indexis zero, the object referenced by the pointer must be initialized. An example of the use of the `read_write` access mode is the first argument to the `strcat` function.

__attribute__ ((access (read_write, 1), access (read_only, 2)))
char* strcat (char*, const char*);

The `write_only` access mode applies to arguments of pointer types without the `const` qualifier. It specifies that the pointer to which it applies is used to write to the referenced object but not read from it. The object referenced by the pointer need not be initialized. An example of the use of the `write_only` access mode is the first argument to the `strcpy` function, or the first two arguments to the `fgets`function.

__attribute__ ((access (write_only, 1), access (read_only, 2)))
char* strcpy (char*, const char*);

__attribute__ ((access (write_only, 1, 2), access (read_write, 3)))
int fgets (char*, int, FILE*);

The access mode `none` specifies that the pointer to which it applies is not used to access the referenced object at all. Unless the pointer is null the pointed-to object must exist and have at least the size as denoted by the size-index argument. When the optional size-indexargument is omitted for an argument of `void*` type the actual pointer agument is ignored. The referenced object need not be initialized. The mode is intended to be used as a means to help validate the expected object size, for example in functions that call `__builtin_object_size`. See [Object Size Checking](https://gcc.gnu.org/onlinedocs/gcc/Object-Size-Checking.html).

Note that the `access` attribute merely specifies how an object referenced by the pointer argument can be accessed; it does not imply that an access **will** happen. Also, the `access` attribute does not imply the attribute `nonnull`; it may be appropriate to add both attributes at the declaration of a function that unconditionally manipulates a buffer via a pointer argument. See the `nonnull` attribute for more information and caveats.

`alias ("target")`[ ¶](#index-alias-function-attribute)

The `alias` attribute causes the declaration to be emitted as an alias for another symbol, which must have been previously declared with the same type, and for variables, also the same size and alignment. Declaring an alias with a different type than the target is undefined and may be diagnosed. As an example, the following declarations:

void __f () { /* Do something. */; }
void f () __attribute__ ((weak, alias ("__f")));

define ‘f’ to be a weak alias for ‘\_\_f’. In C++, the mangled name for the target must be used. It is an error if ‘\_\_f’ is not defined in the same translation unit.

This attribute requires assembler and object file support, and may not be available on all targets.

`aligned`[ ¶](#index-aligned-function-attribute)

`aligned (alignment)`

The `aligned` attribute specifies a minimum alignment for the first instruction of the function, measured in bytes. When specified,alignment must be an integer constant power of 2\. Specifying noalignment argument implies the ideal alignment for the target. The `__alignof__` operator can be used to determine what that is (see [Determining the Alignment of Functions, Types or Variables](https://gcc.gnu.org/onlinedocs/gcc/Alignment.html)). The attribute has no effect when a definition for the function is not provided in the same translation unit.

The attribute cannot be used to decrease the alignment of a function previously declared with a more restrictive alignment; only to increase it. Attempts to do otherwise are diagnosed. Some targets specify a minimum default alignment for functions that is greater than 1\. On such targets, specifying a less restrictive alignment is silently ignored. Using the attribute overrides the effect of the \-falign-functions(see [Options That Control Optimization](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html)) option for this function.

Note that the effectiveness of `aligned` attributes may be limited by inherent limitations in the system linker and/or object file format. On some systems, the linker is only able to arrange for functions to be aligned up to a certain maximum alignment. (For some linkers, the maximum supported alignment may be very very small.) See your linker documentation for further information.

The `aligned` attribute can also be used for variables and fields (see [Specifying Attributes of Variables](https://gcc.gnu.org/onlinedocs/gcc/Variable-Attributes.html).)

`alloc_align (position)`[ ¶](#index-alloc%5F005falign-function-attribute)

The `alloc_align` attribute may be applied to a function that returns a pointer and takes at least one argument of an integer or enumerated type. It indicates that the returned pointer is aligned on a boundary given by the function argument at position. Meaningful alignments are powers of 2 greater than one. GCC uses this information to improve pointer alignment analysis.

The function parameter denoting the allocated alignment is specified by one constant integer argument whose number is the argument of the attribute. Argument numbering starts at one.

For instance,

void* my_memalign (size_t, size_t) __attribute__ ((alloc_align (1)));

declares that `my_memalign` returns memory with minimum alignment given by parameter 1.

`alloc_size (position)`[ ¶](#index-alloc%5F005fsize-function-attribute)

`alloc_size (position-1, position-2)`

The `alloc_size` attribute may be applied to a function that returns a pointer and takes at least one argument of an integer or enumerated type. It indicates that the returned pointer points to memory whose size is given by the function argument at position-1, or by the product of the arguments at position-1 and position-2. Meaningful sizes are positive values less than `PTRDIFF_MAX`. GCC uses this information to improve the results of `__builtin_object_size`.

The function parameter(s) denoting the allocated size are specified by one or two integer arguments supplied to the attribute. The allocated size is either the value of the single function argument specified or the product of the two function arguments specified. Argument numbering starts at one for ordinary functions, and at two for C++ non-static member functions.

For instance,

void* my_calloc (size_t, size_t) __attribute__ ((alloc_size (1, 2)));
void* my_realloc (void*, size_t) __attribute__ ((alloc_size (2)));

declares that `my_calloc` returns memory of the size given by the product of parameter 1 and 2 and that `my_realloc` returns memory of the size given by parameter 2.

`always_inline`[ ¶](#index-always%5F005finline-function-attribute)

Generally, functions are not inlined unless optimization is specified. For functions declared inline, this attribute inlines the function independent of any restrictions that otherwise apply to inlining. Failure to inline such a function is diagnosed as an error. Note that if such a function is called indirectly the compiler may or may not inline it depending on optimization level and a failure to inline an indirect call may or may not be diagnosed.

`artificial`[ ¶](#index-artificial-function-attribute)

This attribute is useful for small inline wrappers that if possible should appear during debugging as a unit. Depending on the debug info format it either means marking the function as artificial or using the caller location for all instructions within the inlined body.

`assume_aligned (alignment)`[ ¶](#index-assume%5F005faligned-function-attribute)

`assume_aligned (alignment, offset)`

The `assume_aligned` attribute may be applied to a function that returns a pointer. It indicates that the returned pointer is aligned on a boundary given by alignment. If the attribute has two arguments, the second argument is misalignment offset. Meaningful values of alignment are powers of 2 greater than one. Meaningful values of offset are greater than zero and less than alignment.

For instance

void* my_alloc1 (size_t) __attribute__((assume_aligned (16)));
void* my_alloc2 (size_t) __attribute__((assume_aligned (32, 8)));

declares that `my_alloc1` returns 16-byte aligned pointers and that `my_alloc2` returns a pointer whose value modulo 32 is equal to 8.

`cold`[ ¶](#index-cold-function-attribute)

The `cold` attribute on functions is used to inform the compiler that the function is unlikely to be executed. The function is optimized for size rather than speed and on many targets it is placed into a special subsection of the text section so all cold functions appear close together, improving code locality of non-cold parts of program. The paths leading to calls of cold functions within code are marked as unlikely by the branch prediction mechanism. It is thus useful to mark functions used to handle unlikely conditions, such as `perror`, as cold to improve optimization of hot functions that do call marked functions in rare occasions. In C++, the `cold` attribute can be applied to types with the effect of being propagated to member functions. See[C++-Specific Variable, Function, and Type Attributes](https://gcc.gnu.org/onlinedocs/gcc/C%5F002b%5F002b-Attributes.html).

When profile feedback is available, via \-fprofile-use, cold functions are automatically detected and this attribute is ignored.

`const`[ ¶](#index-const-function-attribute)

Calls to functions whose return value is not affected by changes to the observable state of the program and that have no observable effects on such state other than to return a value may lend themselves to optimizations such as common subexpression elimination. Declaring such functions with the `const` attribute allows GCC to avoid emitting some calls in repeated invocations of the function with the same argument values.

For example,

int square (int) __attribute__ ((const));

tells GCC that subsequent calls to function `square` with the same argument value can be replaced by the result of the first call regardless of the statements in between.

The `const` attribute prohibits a function from reading objects that affect its return value between successive invocations. However, functions declared with the attribute can safely read objects that do not change their return value, such as non-volatile constants.

The `const` attribute imposes greater restrictions on a function’s definition than the similar `pure` attribute. Declaring the same function with both the `const` and the `pure` attribute is diagnosed. Because a const function cannot have any observable side effects it does not make sense for it to return `void`. Declaring such a function is diagnosed.

Note that a function that has pointer arguments and examines the data pointed to must _not_ be declared `const` if the pointed-to data might change between successive invocations of the function. In general, since a function cannot distinguish data that might change from data that cannot, const functions should never take pointer or, in C++, reference arguments. Likewise, a function that calls a non-const function usually must not be const itself.

`constructor`[ ¶](#index-constructor-function-attribute)

`destructor`

`constructor (priority)`

`destructor (priority)`

The `constructor` attribute causes the function to be called automatically before execution enters `main ()`. Similarly, the`destructor` attribute causes the function to be called automatically after `main ()` completes or `exit ()` is called. Functions with these attributes are useful for initializing data that is used implicitly during the execution of the program.

On some targets the attributes also accept an integer argument to specify a priority to control the order in which constructor and destructor functions are run. A constructor with a smaller priority number runs before a constructor with a larger priority number; the opposite relationship holds for destructors. Note that priorities 0-100 are reserved. So, if you have a constructor that allocates a resource and a destructor that deallocates the same resource, both functions typically have the same priority. The priorities for constructor and destructor functions are the same as those specified for namespace-scope C++ objects (see [C++-Specific Variable, Function, and Type Attributes](https://gcc.gnu.org/onlinedocs/gcc/C%5F002b%5F002b-Attributes.html)). However, at present, the order in which constructors for C++ objects with static storage duration and functions decorated with attribute`constructor` are invoked is unspecified. In mixed declarations, attribute `init_priority` can be used to impose a specific ordering.

Using the argument forms of the `constructor` and `destructor`attributes on targets where the feature is not supported is rejected with an error.

`copy`[ ¶](#index-copy-function-attribute)

`copy (function)`

The `copy` attribute applies the set of attributes with whichfunction has been declared to the declaration of the function to which the attribute is applied. The attribute is designed for libraries that define aliases or function resolvers that are expected to specify the same set of attributes as their targets. The `copy`attribute can be used with functions, variables, or types. However, the kind of symbol to which the attribute is applied (either function or variable) must match the kind of symbol to which the argument refers. The `copy` attribute copies only syntactic and semantic attributes but not attributes that affect a symbol’s linkage or visibility such as`alias`, `visibility`, or `weak`. The `deprecated`and `target_clones` attribute are also not copied. See [Common Type Attributes](https://gcc.gnu.org/onlinedocs/gcc/Common-Type-Attributes.html). See [Common Variable Attributes](https://gcc.gnu.org/onlinedocs/gcc/Common-Variable-Attributes.html).

For example, the StrongAlias macro below makes use of the `alias`and `copy` attributes to define an alias named alloc for functionallocate declared with attributes alloc\_size, malloc, andnothrow. Thanks to the `__typeof__` operator the alias has the same type as the target function. As a result of the `copy`attribute the alias also shares the same attributes as the target.

#define StrongAlias(TargetFunc, AliasDecl)  \
  extern __typeof__ (TargetFunc) AliasDecl  \
    __attribute__ ((alias (#TargetFunc), copy (TargetFunc)));

extern __attribute__ ((alloc_size (1), malloc, nothrow))
  void* allocate (size_t);
StrongAlias (allocate, alloc);

`deprecated`[ ¶](#index-deprecated-function-attribute)

`deprecated (msg)`

The `deprecated` attribute results in a warning if the function is used anywhere in the source file. This is useful when identifying functions that are expected to be removed in a future version of a program. The warning also includes the location of the declaration of the deprecated function, to enable users to easily find further information about why the function is deprecated, or what they should do instead. Note that the warnings only occurs for uses:

int old_fn () __attribute__ ((deprecated));
int old_fn ();
int (*fn_ptr)() = old_fn;

results in a warning on line 3 but not line 2\. The optional msgargument, which must be a string, is printed in the warning if present.

The `deprecated` attribute can also be used for variables and types (see [Specifying Attributes of Variables](https://gcc.gnu.org/onlinedocs/gcc/Variable-Attributes.html), see [Specifying Attributes of Types](https://gcc.gnu.org/onlinedocs/gcc/Type-Attributes.html).)

The message attached to the attribute is affected by the setting of the \-fmessage-length option.

`unavailable`[ ¶](#index-unavailable-function-attribute)

`unavailable (msg)`

The `unavailable` attribute results in an error if the function is used anywhere in the source file. This is useful when identifying functions that have been removed from a particular variation of an interface. Other than emitting an error rather than a warning, the`unavailable` attribute behaves in the same manner as`deprecated`.

The `unavailable` attribute can also be used for variables and types (see [Specifying Attributes of Variables](https://gcc.gnu.org/onlinedocs/gcc/Variable-Attributes.html), see [Specifying Attributes of Types](https://gcc.gnu.org/onlinedocs/gcc/Type-Attributes.html).)

`error ("message")`[ ¶](#index-error-function-attribute)

`warning ("message")`

If the `error` or `warning` attribute is used on a function declaration and a call to such a function is not eliminated through dead code elimination or other optimizations, an error or warning (respectively) that includes message is diagnosed. This is useful for compile-time checking, especially together with `__builtin_constant_p`and inline functions where checking the inline function arguments is not possible through `extern char [(condition) ? 1 : -1];` tricks.

While it is possible to leave the function undefined and thus invoke a link failure (to define the function with a message in `.gnu.warning*` section), when using these attributes the problem is diagnosed earlier and with exact location of the call even in presence of inline functions or when not emitting debugging information.

`expected_throw`[ ¶](#index-expected%5F005fthrow-function-attribute)

This attribute, attached to a function, tells the compiler the function is more likely to raise or propagate an exception than to return, loop forever, or terminate the program.

This hint is mostly ignored by the compiler. The only effect is when it’s applied to `noreturn` functions and ‘\-fharden-control-flow-redundancy’ is enabled, and ‘\-fhardcfr-check-noreturn-calls=not-always’ is not overridden.

`externally_visible`[ ¶](#index-externally%5F005fvisible-function-attribute)

This attribute, attached to a global variable or function, nullifies the effect of the \-fwhole-program command-line option, so the object remains visible outside the current compilation unit.

If \-fwhole-program is used together with \-flto and `gold` is used as the linker plugin, `externally_visible` attributes are automatically added to functions (not variable yet due to a current `gold` issue) that are accessed outside of LTO objects according to resolution file produced by `gold`. For other linkers that cannot generate resolution file, explicit `externally_visible` attributes are still necessary.

`fd_arg`[ ¶](#index-fd%5F005farg-function-attribute)

`fd_arg (N)`

The `fd_arg` attribute may be applied to a function that takes an open file descriptor at referenced argument N.

It indicates that the passed filedescriptor must not have been closed. Therefore, when the analyzer is enabled with \-fanalyzer, the analyzer may emit a \-Wanalyzer-fd-use-after-close diagnostic if it detects a code path in which a function with this attribute is called with a closed file descriptor.

The attribute also indicates that the file descriptor must have been checked for validity before usage. Therefore, analyzer may emit\-Wanalyzer-fd-use-without-check diagnostic if it detects a code path in which a function with this attribute is called with a file descriptor that has not been checked for validity.

`fd_arg_read`[ ¶](#index-fd%5F005farg%5F005fread-function-attribute)

`fd_arg_read (N)`

The `fd_arg_read` is identical to `fd_arg`, but with the additional requirement that it might read from the file descriptor, and thus, the file descriptor must not have been opened as write-only.

The analyzer may emit a \-Wanalyzer-access-mode-mismatchdiagnostic if it detects a code path in which a function with this attribute is called on a file descriptor opened with `O_WRONLY`.

`fd_arg_write`[ ¶](#index-fd%5F005farg%5F005fwrite-function-attribute)

`fd_arg_write (N)`

The `fd_arg_write` is identical to `fd_arg_read` except that the analyzer may emit a \-Wanalyzer-access-mode-mismatch diagnostic if it detects a code path in which a function with this attribute is called on a file descriptor opened with `O_RDONLY`.

`flatten`[ ¶](#index-flatten-function-attribute)

Generally, inlining into a function is limited. For a function marked with this attribute, every call inside this function is inlined including the calls such inlining introduces to the function (but not recursive calls to the function itself), if possible. Functions declared with attribute `noinline` and similar are not inlined. Whether the function itself is considered for inlining depends on its size and the current inlining parameters.

`format (archetype, string-index, first-to-check)`[ ¶](#index-format-function-attribute)

The `format` attribute specifies that a function takes `printf`,`scanf`, `strftime` or `strfmon` style arguments that should be type-checked against a format string. For example, the declaration:

extern int
my_printf (void *my_object, const char *my_format, ...)
      __attribute__ ((format (printf, 2, 3)));

causes the compiler to check the arguments in calls to `my_printf`for consistency with the `printf` style format string argument`my_format`.

The parameter archetype determines how the format string is interpreted, and should be `printf`, `scanf`, `strftime`,`gnu_printf`, `gnu_scanf`, `gnu_strftime` or`strfmon`. (You can also use `__printf__`,`__scanf__`, `__strftime__` or `__strfmon__`.) On MinGW targets, `ms_printf`, `ms_scanf`, and`ms_strftime` are also present.archetype values such as `printf` refer to the formats accepted by the system’s C runtime library, while values prefixed with ‘gnu\_’ always refer to the formats accepted by the GNU C Library. On Microsoft Windows targets, values prefixed with ‘ms\_’ refer to the formats accepted by themsvcrt.dll library. The parameter string-indexspecifies which argument is the format string argument (starting from 1), while first-to-check is the number of the first argument to check against the format string. For functions where the arguments are not available to be checked (such as`vprintf`), specify the third parameter as zero. In this case the compiler only checks the format string for consistency. For`strftime` formats, the third parameter is required to be zero. Since non-static C++ methods have an implicit `this` argument, the arguments of such methods should be counted from two, not one, when giving values for string-index and first-to-check.

In the example above, the format string (`my_format`) is the second argument of the function `my_print`, and the arguments to check start with the third argument, so the correct parameters for the format attribute are 2 and 3.

The `format` attribute allows you to identify your own functions that take format strings as arguments, so that GCC can check the calls to these functions for errors. The compiler always (unless\-ffreestanding or \-fno-builtin is used) checks formats for the standard library functions `printf`, `fprintf`,`sprintf`, `scanf`, `fscanf`, `sscanf`, `strftime`,`vprintf`, `vfprintf` and `vsprintf` whenever such warnings are requested (using \-Wformat), so there is no need to modify the header file stdio.h. In C99 mode, the functions`snprintf`, `vsnprintf`, `vscanf`, `vfscanf` and`vsscanf` are also checked. Except in strictly conforming C standard modes, the X/Open function `strfmon` is also checked as are `printf_unlocked` and `fprintf_unlocked`. See [Options Controlling C Dialect](https://gcc.gnu.org/onlinedocs/gcc/C-Dialect-Options.html).

For Objective-C dialects, `NSString` (or `__NSString__`) is recognized in the same context. Declarations including these format attributes are parsed for correct syntax, however the result of checking of such format strings is not yet defined, and is not carried out by this version of the compiler.

The target may also provide additional types of format checks. See [Format Checks Specific to Particular Target Machines](https://gcc.gnu.org/onlinedocs/gcc/Target-Format-Checks.html).

`format_arg (string-index)`[ ¶](#index-format%5F005farg-function-attribute)

The `format_arg` attribute specifies that a function takes one or more format strings for a `printf`, `scanf`, `strftime` or`strfmon` style function and modifies it (for example, to translate it into another language), so the result can be passed to a`printf`, `scanf`, `strftime` or `strfmon` style function (with the remaining arguments to the format function the same as they would have been for the unmodified string). Multiple`format_arg` attributes may be applied to the same function, each designating a distinct parameter as a format string. For example, the declaration:

extern char *
my_dgettext (char *my_domain, const char *my_format)
      __attribute__ ((format_arg (2)));

causes the compiler to check the arguments in calls to a `printf`,`scanf`, `strftime` or `strfmon` type function, whose format string argument is a call to the `my_dgettext` function, for consistency with the format string argument `my_format`. If the`format_arg` attribute had not been specified, all the compiler could tell in such calls to format functions would be that the format string argument is not constant; this would generate a warning when\-Wformat-nonliteral is used, but the calls could not be checked without the attribute.

In calls to a function declared with more than one `format_arg`attribute, each with a distinct argument value, the corresponding actual function arguments are checked against all format strings designated by the attributes. This capability is designed to support the GNU `ngettext` family of functions.

The parameter string-index specifies which argument is the format string argument (starting from one). Since non-static C++ methods have an implicit `this` argument, the arguments of such methods should be counted from two.

The `format_arg` attribute allows you to identify your own functions that modify format strings, so that GCC can check the calls to `printf`, `scanf`, `strftime` or `strfmon`type function whose operands are a call to one of your own function. The compiler always treats `gettext`, `dgettext`, and`dcgettext` in this manner except when strict ISO C support is requested by \-ansi or an appropriate \-std option, or\-ffreestanding or \-fno-builtinis used. See [Options Controlling C Dialect](https://gcc.gnu.org/onlinedocs/gcc/C-Dialect-Options.html).

For Objective-C dialects, the `format-arg` attribute may refer to an`NSString` reference for compatibility with the `format` attribute above.

The target may also allow additional types in `format-arg` attributes. See [Format Checks Specific to Particular Target Machines](https://gcc.gnu.org/onlinedocs/gcc/Target-Format-Checks.html).

`gnu_inline`[ ¶](#index-gnu%5F005finline-function-attribute)

This attribute should be used with a function that is also declared with the `inline` keyword. It directs GCC to treat the function as if it were defined in gnu90 mode even when compiling in C99 or gnu99 mode.

If the function is declared `extern`, then this definition of the function is used only for inlining. In no case is the function compiled as a standalone function, not even if you take its address explicitly. Such an address becomes an external reference, as if you had only declared the function, and had not defined it. This has almost the effect of a macro. The way to use this is to put a function definition in a header file with this attribute, and put another copy of the function, without `extern`, in a library file. The definition in the header file causes most calls to the function to be inlined. If any uses of the function remain, they refer to the single copy in the library. Note that the two definitions of the functions need not be precisely the same, although if they do not have the same effect your program may behave oddly.

In C, if the function is neither `extern` nor `static`, then the function is compiled as a standalone function, as well as being inlined where possible.

This is how GCC traditionally handled functions declared`inline`. Since ISO C99 specifies a different semantics for`inline`, this function attribute is provided as a transition measure and as a useful feature in its own right. This attribute is available in GCC 4.1.3 and later. It is available if either of the preprocessor macros `__GNUC_GNU_INLINE__` or`__GNUC_STDC_INLINE__` are defined. See [An Inline Function is As Fast As a Macro](https://gcc.gnu.org/onlinedocs/gcc/Inline.html).

In C++, this attribute does not depend on `extern` in any way, but it still requires the `inline` keyword to enable its special behavior.

`hot`[ ¶](#index-hot-function-attribute)

The `hot` attribute on a function is used to inform the compiler that the function is a hot spot of the compiled program. The function is optimized more aggressively and on many targets it is placed into a special subsection of the text section so all hot functions appear close together, improving locality. In C++, the `hot` attribute can be applied to types with the effect of being propagated to member functions. See[C++-Specific Variable, Function, and Type Attributes](https://gcc.gnu.org/onlinedocs/gcc/C%5F002b%5F002b-Attributes.html).

When profile feedback is available, via \-fprofile-use, hot functions are automatically detected and this attribute is ignored.

`ifunc ("resolver")`[ ¶](#index-ifunc-function-attribute)

The `ifunc` attribute is used to mark a function as an indirect function using the STT\_GNU\_IFUNC symbol type extension to the ELF standard. This allows the resolution of the symbol value to be determined dynamically at load time, and an optimized version of the routine to be selected for the particular processor or other system characteristics determined then. To use this attribute, first define the implementation functions available, and a resolver function that returns a pointer to the selected implementation function. The implementation functions’ declarations must match the API of the function being implemented. The resolver should be declared to be a function taking no arguments and returning a pointer to a function of the same type as the implementation. For example:

void *my_memcpy (void *dst, const void *src, size_t len)
{
  …
  return dst;
}

static void * (*resolve_memcpy (void))(void *, const void *, size_t)
{
  return my_memcpy; // we will just always select this routine
}

The exported header file declaring the function the user calls would contain:

extern void *memcpy (void *, const void *, size_t);

allowing the user to call `memcpy` as a regular function, unaware of the actual implementation. Finally, the indirect function needs to be defined in the same translation unit as the resolver function:

void *memcpy (void *, const void *, size_t)
     __attribute__ ((ifunc ("resolve_memcpy")));

In C++, the `ifunc` attribute takes a string that is the mangled name of the resolver function. A C++ resolver for a non-static member function of class `C` should be declared to return a pointer to a non-member function taking pointer to `C` as the first argument, followed by the same arguments as of the implementation function. G++ checks the signatures of the two functions and issues a \-Wattribute-alias warning for mismatches. To suppress a warning for the necessary cast from a pointer to the implementation member function to the type of the corresponding non-member function use the \-Wno-pmf-conversions option. For example:

class S
{
private:
  int debug_impl (int);
  int optimized_impl (int);

  typedef int Func (S*, int);

  static Func* resolver ();
public:

  int interface (int);
};

int S::debug_impl (int) { /* … */ }
int S::optimized_impl (int) { /* … */ }

S::Func* S::resolver ()
{
  int (S::*pimpl) (int)
    = getenv ("DEBUG") ? &S::debug_impl : &S::optimized_impl;

  // Cast triggers -Wno-pmf-conversions.
  return reinterpret_cast<Func*>(pimpl);
}

int S::interface (int) __attribute__ ((ifunc ("_ZN1S8resolverEv")));

Indirect functions cannot be weak. Binutils version 2.20.1 or higher and GNU C Library version 2.11.1 are required to use this feature.

`interrupt`[ ¶](#index-interrupt%5F005fhandler-function-attribute)

`interrupt_handler`

Many GCC back ends support attributes to indicate that a function is an interrupt handler, which tells the compiler to generate function entry and exit sequences that differ from those from regular functions. The exact syntax and behavior are target-specific; refer to the following subsections for details.

`leaf`[ ¶](#index-leaf-function-attribute)

Calls to external functions with this attribute must return to the current compilation unit only by return or by exception handling. In particular, a leaf function is not allowed to invoke callback functions passed to it from the current compilation unit, directly call functions exported by the unit, or `longjmp` into the unit. Leaf functions might still call functions from other compilation units and thus they are not necessarily leaf in the sense that they contain no function calls at all.

The attribute is intended for library functions to improve dataflow analysis. The compiler takes the hint that any data not escaping the current compilation unit cannot be used or modified by the leaf function. For example, the `sin` function is a leaf function, but`qsort` is not.

Note that leaf functions might indirectly run a signal handler defined in the current compilation unit that uses static variables. Similarly, when lazy symbol resolution is in effect, leaf functions might invoke indirect functions whose resolver function or implementation function is defined in the current compilation unit and uses static variables. There is no standard-compliant way to write such a signal handler, resolver function, or implementation function, and the best that you can do is to remove the `leaf` attribute or mark all such static variables`volatile`. Lastly, for ELF-based systems that support symbol interposition, care should be taken that functions defined in the current compilation unit do not unexpectedly interpose other symbols based on the defined standards mode and defined feature test macros; otherwise an inadvertent callback would be added.

The attribute has no effect on functions defined within the current compilation unit. This is to allow easy merging of multiple compilation units into one, for example, by using the link-time optimization. For this reason the attribute is not allowed on types to annotate indirect calls.

`malloc`[ ¶](#index-malloc-function-attribute)

`malloc (deallocator)`

`malloc (deallocator, ptr-index)`

Attribute `malloc` indicates that a function is `malloc`\-like, i.e., that the pointer P returned by the function cannot alias any other pointer valid when the function returns, and moreover no pointers to valid objects occur in any storage addressed by P. In addition, GCC predicts that a function with the attribute returns non-null in most cases.

Independently, the form of the attribute with one or two arguments associates `deallocator` as a suitable deallocation function for pointers returned from the `malloc`\-like function. ptr-indexdenotes the positional argument to which when the pointer is passed in calls to `deallocator` has the effect of deallocating it.

Using the attribute with no arguments is designed to improve optimization by relying on the aliasing property it implies. Functions like `malloc`and `calloc` have this property because they return a pointer to uninitialized or zeroed-out, newly obtained storage. However, functions like `realloc` do not have this property, as they may return pointers to storage containing pointers to existing objects. Additionally, since all such functions are assumed to return null only infrequently, callers can be optimized based on that assumption.

Associating a function with a deallocator helps detect calls to mismatched allocation and deallocation functions and diagnose them under the control of options such as \-Wmismatched-dealloc. It also makes it possible to diagnose attempts to deallocate objects that were not allocated dynamically, by \-Wfree-nonheap-object. To indicate that an allocation function both satisifies the nonaliasing property and has a deallocator associated with it, both the plain form of the attribute and the one with the deallocator argument must be used. The same function can be both an allocator and a deallocator. Since inlining one of the associated functions but not the other could result in apparent mismatches, this form of attribute `malloc` is not accepted on inline functions. For the same reason, using the attribute prevents both the allocation and deallocation functions from being expanded inline.

For example, besides stating that the functions return pointers that do not alias any others, the following declarations make `fclose`a suitable deallocator for pointers returned from all functions except`popen`, and `pclose` as the only suitable deallocator for pointers returned from `popen`. The deallocator functions must be declared before they can be referenced in the attribute.

int fclose (FILE*);
int pclose (FILE*);

__attribute__ ((malloc, malloc (fclose, 1)))
  FILE* fdopen (int, const char*);
__attribute__ ((malloc, malloc (fclose, 1)))
  FILE* fopen (const char*, const char*);
__attribute__ ((malloc, malloc (fclose, 1)))
  FILE* fmemopen(void *, size_t, const char *);
__attribute__ ((malloc, malloc (pclose, 1)))
  FILE* popen (const char*, const char*);
__attribute__ ((malloc, malloc (fclose, 1)))
  FILE* tmpfile (void);

The warnings guarded by \-fanalyzer respect allocation and deallocation pairs marked with the `malloc`. In particular:

* The analyzer emits a \-Wanalyzer-mismatching-deallocationdiagnostic if there is an execution path in which the result of an allocation call is passed to a different deallocator.
* The analyzer emits a \-Wanalyzer-double-freediagnostic if there is an execution path in which a value is passed more than once to a deallocation call.
* The analyzer considers the possibility that an allocation function could fail and return null. If there are execution paths in which an unchecked result of an allocation call is dereferenced or passed to a function requiring a non-null argument, it emits\-Wanalyzer-possible-null-dereference and\-Wanalyzer-possible-null-argument diagnostics. If the allocator always returns non-null, use`__attribute__ ((returns_nonnull))` to suppress these warnings. For example:  
char *xstrdup (const char *)  
  __attribute__((malloc (free), returns_nonnull));
* The analyzer emits a \-Wanalyzer-use-after-freediagnostic if there is an execution path in which the memory passed by pointer to a deallocation call is used after the deallocation.
* The analyzer emits a \-Wanalyzer-malloc-leak diagnostic if there is an execution path in which the result of an allocation call is leaked (without being passed to the deallocation function).
* The analyzer emits a \-Wanalyzer-free-of-non-heap diagnostic if a deallocation function is used on a global or on-stack variable.

The analyzer assumes that deallocators can gracefully handle the null pointer. If this is not the case, the deallocator can be marked with`__attribute__((nonnull))` so that \-fanalyzer can emit a \-Wanalyzer-possible-null-argument diagnostic for code paths in which the deallocator is called with null.

`no_icf`[ ¶](#index-no%5F005ficf-function-attribute)

This function attribute prevents a functions from being merged with another semantically equivalent function.

`no_instrument_function`[ ¶](#index-no%5F005finstrument%5F005ffunction-function-attribute)

If any of \-finstrument-functions, \-p, or \-pg are given, profiling function calls are generated at entry and exit of most user-compiled functions. Functions with this attribute are not so instrumented.

`no_profile_instrument_function`[ ¶](#index-no%5F005fprofile%5F005finstrument%5F005ffunction-function-attribute)

The `no_profile_instrument_function` attribute on functions is used to inform the compiler that it should not process any profile feedback based optimization code instrumentation.

`no_reorder`[ ¶](#index-no%5F005freorder-function-attribute)

Do not reorder functions or variables marked `no_reorder`against each other or top level assembler statements the executable. The actual order in the program will depend on the linker command line. Static variables marked like this are also not removed. This has a similar effect as the \-fno-toplevel-reorder option, but only applies to the marked symbols.

`no_sanitize ("sanitize_option")`[ ¶](#index-no%5F005fsanitize-function-attribute)

The `no_sanitize` attribute on functions is used to inform the compiler that it should not do sanitization of any option mentioned in sanitize\_option. A list of values acceptable by the \-fsanitize option can be provided.

void __attribute__ ((no_sanitize ("alignment", "object-size")))
f () { /* Do something. */; }
void __attribute__ ((no_sanitize ("alignment,object-size")))
g () { /* Do something. */; }

`no_sanitize_address`[ ¶](#index-no%5F005fsanitize%5F005faddress-function-attribute)

`no_address_safety_analysis`

The `no_sanitize_address` attribute on functions is used to inform the compiler that it should not instrument memory accesses in the function when compiling with the \-fsanitize=address option. The `no_address_safety_analysis` is a deprecated alias of the`no_sanitize_address` attribute, new code should use`no_sanitize_address`.

`no_sanitize_thread`[ ¶](#index-no%5F005fsanitize%5F005fthread-function-attribute)

The `no_sanitize_thread` attribute on functions is used to inform the compiler that it should not instrument memory accesses in the function when compiling with the \-fsanitize=thread option.

`no_sanitize_undefined`[ ¶](#index-no%5F005fsanitize%5F005fundefined-function-attribute)

The `no_sanitize_undefined` attribute on functions is used to inform the compiler that it should not check for undefined behavior in the function when compiling with the \-fsanitize=undefined option.

`no_sanitize_coverage`[ ¶](#index-no%5F005fsanitize%5F005fcoverage-function-attribute)

The `no_sanitize_coverage` attribute on functions is used to inform the compiler that it should not do coverage-guided fuzzing code instrumentation (\-fsanitize-coverage).

`no_split_stack`[ ¶](#index-no%5F005fsplit%5F005fstack-function-attribute)

If \-fsplit-stack is given, functions have a small prologue which decides whether to split the stack. Functions with the`no_split_stack` attribute do not have that prologue, and thus may run with only a small amount of stack space available.

`no_stack_limit`[ ¶](#index-no%5F005fstack%5F005flimit-function-attribute)

This attribute locally overrides the \-fstack-limit-registerand \-fstack-limit-symbol command-line options; it has the effect of disabling stack limit checking in the function it applies to.

`noclone`[ ¶](#index-noclone-function-attribute)

This function attribute prevents a function from being considered for cloning—a mechanism that produces specialized copies of functions and which is (currently) performed by interprocedural constant propagation.

`noinline`[ ¶](#index-noinline-function-attribute)

This function attribute prevents a function from being considered for inlining. If the function does not have side effects, there are optimizations other than inlining that cause function calls to be optimized away, although the function call is live. To keep such calls from being optimized away, put

(see [Extended Asm - Assembler Instructions with C Expression Operands](https://gcc.gnu.org/onlinedocs/gcc/Extended-Asm.html)) in the called function, to serve as a special side effect.

`noipa`[ ¶](#index-noipa-function-attribute)

Disable interprocedural optimizations between the function with this attribute and its callers, as if the body of the function is not available when optimizing callers and the callers are unavailable when optimizing the body. This attribute implies `noinline`, `noclone` and`no_icf` attributes. However, this attribute is not equivalent to a combination of other attributes, because its purpose is to suppress existing and future optimizations employing interprocedural analysis, including those that do not have an attribute suitable for disabling them individually. This attribute is supported mainly for the purpose of testing the compiler.

`nonnull`[ ¶](#index-nonnull-function-attribute)

`nonnull (arg-index, …)`

The `nonnull` attribute may be applied to a function that takes at least one argument of a pointer type. It indicates that the referenced arguments must be non-null pointers. For instance, the declaration:

extern void *
my_memcpy (void *dest, const void *src, size_t len)
        __attribute__((nonnull (1, 2)));

informs the compiler that, in calls to `my_memcpy`, argumentsdest and src must be non-null.

The attribute has an effect both on functions calls and function definitions.

For function calls:

* If the compiler determines that a null pointer is passed in an argument slot marked as non-null, and the\-Wnonnull option is enabled, a warning is issued. See [Options to Request or Suppress Warnings](https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html).
* The \-fisolate-erroneous-paths-attribute option can be specified to have GCC transform calls with null arguments to non-null functions into traps. See [Options That Control Optimization](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html).
* The compiler may also perform optimizations based on the knowledge that certain function arguments cannot be null. These optimizations can be disabled by the\-fno-delete-null-pointer-checks option. See [Options That Control Optimization](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html).

For function definitions:

* If the compiler determines that a function parameter that is marked with nonnull is compared with null, and\-Wnonnull-compare option is enabled, a warning is issued. See [Options to Request or Suppress Warnings](https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html).
* The compiler may also perform optimizations based on the knowledge that `nonnull` parameters cannot be null. This can currently not be disabled other than by removing the nonnull attribute.

If no arg-index is given to the `nonnull` attribute, all pointer arguments are marked as non-null. To illustrate, the following declaration is equivalent to the previous example:

extern void *
my_memcpy (void *dest, const void *src, size_t len)
        __attribute__((nonnull));

`null_terminated_string_arg`[ ¶](#index-null%5F005fterminated%5F005fstring%5F005farg-function-attribute)

`null_terminated_string_arg (N)`

The `null_terminated_string_arg` attribute may be applied to a function that takes a `char *` or `const char *` at referenced argument N.

It indicates that the passed argument must be a C-style null-terminated string. Specifically, the presence of the attribute implies that, if the pointer is non-null, the function may scan through the referenced buffer looking for the first zero byte.

In particular, when the analyzer is enabled (via \-fanalyzer), if the pointer is non-null, it will simulate scanning for the first zero byte in the referenced buffer, and potentially emit\-Wanalyzer-use-of-uninitialized-valueor \-Wanalyzer-out-of-bounds on improperly terminated buffers.

For example, given the following:

char *example_1 (const char *p)
  __attribute__((null_terminated_string_arg (1)));

the analyzer will check that any non-null pointers passed to the function are validly terminated.

If the parameter must be non-null, it is appropriate to use both this attribute and the attribute `nonnull`, such as in:

extern char *example_2 (const char *p)
  __attribute__((null_terminated_string_arg (1),
                 nonnull (1)));

See the `nonnull` attribute for more information and caveats.

If the pointer argument is also referred to by an `access` attribute on the function with access-mode either `read_only` or `read_write`and the latter attribute has the optional size-index argument referring to a size argument, this expressses the maximum size of the access. For example, given:

extern char *example_fn (const char *p, size_t n)
  __attribute__((null_terminated_string_arg (1),
                 access (read_only, 1, 2),
                 nonnull (1)));

the analyzer will require the first parameter to be non-null, and either be validly null-terminated, or validly readable up to the size specified by the second parameter.

`noplt`[ ¶](#index-noplt-function-attribute)

The `noplt` attribute is the counterpart to option \-fno-plt. Calls to functions marked with this attribute in position-independent code do not use the PLT.

/* Externally defined function foo.  */
int foo () __attribute__ ((noplt));

int
main (/* … */)
{
  /* … */
  foo ();
  /* … */
}

The `noplt` attribute on function `foo`tells the compiler to assume that the function `foo` is externally defined and that the call to`foo` must avoid the PLT in position-independent code.

In position-dependent code, a few targets also convert calls to functions that are marked to not use the PLT to use the GOT instead.

`noreturn`[ ¶](#index-noreturn-function-attribute)

A few standard library functions, such as `abort` and `exit`, cannot return. GCC knows this automatically. Some programs define their own functions that never return. You can declare them`noreturn` to tell the compiler this fact. For example,

void fatal () __attribute__ ((noreturn));

void
fatal (/* … */)
{
  /* … */ /* Print error message. */ /* … */
  exit (1);
}

The `noreturn` keyword tells the compiler to assume that`fatal` cannot return. It can then optimize without regard to what would happen if `fatal` ever did return. This makes slightly better code. More importantly, it helps avoid spurious warnings of uninitialized variables.

The `noreturn` keyword does not affect the exceptional path when that applies: a `noreturn`\-marked function may still return to the caller by throwing an exception or calling `longjmp`.

In order to preserve backtraces, GCC will never turn calls to`noreturn` functions into tail calls.

Do not assume that registers saved by the calling function are restored before calling the `noreturn` function.

It does not make sense for a `noreturn` function to have a return type other than `void`.

`nothrow`[ ¶](#index-nothrow-function-attribute)

The `nothrow` attribute is used to inform the compiler that a function cannot throw an exception. For example, most functions in the standard C library can be guaranteed not to throw an exception with the notable exceptions of `qsort` and `bsearch` that take function pointer arguments.

`optimize (level, …)`[ ¶](#index-optimize-function-attribute)

`optimize (string, …)`

The `optimize` attribute is used to specify that a function is to be compiled with different optimization options than specified on the command line. The optimize attribute arguments of a function behave as if appended to the command-line.

Valid arguments are constant non-negative integers and strings. Each numeric argument specifies an optimization level. Each string argument consists of one or more comma-separated substrings. Each substring that begins with the letter `O` refers to an optimization option such as \-O0 or \-Os. Other substrings are taken as suffixes to the `-f` prefix jointly forming the name of an optimization option. See [Options That Control Optimization](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html).

‘#pragma GCC optimize’ can be used to set optimization options for more than one function. See [Function Specific Option Pragmas](https://gcc.gnu.org/onlinedocs/gcc/Function-Specific-Option-Pragmas.html), for details about the pragma.

Providing multiple strings as arguments separated by commas to specify multiple options is equivalent to separating the option suffixes with a comma (‘,’) within a single string. Spaces are not permitted within the strings.

Not every optimization option that starts with the \-f prefix specified by the attribute necessarily has an effect on the function. The `optimize` attribute should be used for debugging purposes only. It is not suitable in production code.

`patchable_function_entry`[ ¶](#index-patchable%5F005ffunction%5F005fentry-function-attribute)

In case the target’s text segment can be made writable at run time by any means, padding the function entry with a number of NOPs can be used to provide a universal tool for instrumentation.

The `patchable_function_entry` function attribute can be used to change the number of NOPs to any desired value. The two-value syntax is the same as for the command-line switch\-fpatchable-function-entry=N,M, generating N NOPs, with the function entry point before the Mth NOP instruction.M defaults to 0 if omitted e.g. function entry point is before the first NOP.

If patchable function entries are enabled globally using the command-line option \-fpatchable-function-entry=N,M, then you must disable instrumentation on all functions that are part of the instrumentation framework with the attribute `patchable_function_entry (0)`to prevent recursion.

`pure`[ ¶](#index-pure-function-attribute)

Calls to functions that have no observable effects on the state of the program other than to return a value may lend themselves to optimizations such as common subexpression elimination. Declaring such functions with the `pure` attribute allows GCC to avoid emitting some calls in repeated invocations of the function with the same argument values.

The `pure` attribute prohibits a function from modifying the state of the program that is observable by means other than inspecting the function’s return value. However, functions declared with the `pure`attribute can safely read any non-volatile objects, and modify the value of objects in a way that does not affect their return value or the observable state of the program.

For example,

int hash (char *) __attribute__ ((pure));

tells GCC that subsequent calls to the function `hash` with the same string can be replaced by the result of the first call provided the state of the program observable by `hash`, including the contents of the array itself, does not change in between. Even though `hash` takes a non-const pointer argument it must not modify the array it points to, or any other object whose value the rest of the program may depend on. However, the caller may safely change the contents of the array between successive calls to the function (doing so disables the optimization). The restriction also applies to member objects referenced by the `this` pointer in C++ non-static member functions.

Some common examples of pure functions are `strlen` or `memcmp`. Interesting non-pure functions are functions with infinite loops or those depending on volatile memory or other system resource, that may change between consecutive calls (such as the standard C `feof` function in a multithreading environment).

The `pure` attribute imposes similar but looser restrictions on a function’s definition than the `const` attribute: `pure`allows the function to read any non-volatile memory, even if it changes in between successive invocations of the function. Declaring the same function with both the `pure` and the `const` attribute is diagnosed. Because a pure function cannot have any observable side effects it does not make sense for such a function to return `void`. Declaring such a function is diagnosed.

`returns_nonnull`[ ¶](#index-returns%5F005fnonnull-function-attribute)

The `returns_nonnull` attribute specifies that the function return value should be a non-null pointer. For instance, the declaration:

extern void *
mymalloc (size_t len) __attribute__((returns_nonnull));

lets the compiler optimize callers based on the knowledge that the return value will never be null.

`returns_twice`[ ¶](#index-returns%5F005ftwice-function-attribute)

The `returns_twice` attribute tells the compiler that a function may return more than one time. The compiler ensures that all registers are dead before calling such a function and emits a warning about the variables that may be clobbered after the second return from the function. Examples of such functions are `setjmp` and `vfork`. The `longjmp`\-like counterpart of such function, if any, might need to be marked with the `noreturn` attribute.

`section ("section-name")`[ ¶](#index-section-function-attribute)

Normally, the compiler places the code it generates in the `text` section. Sometimes, however, you need additional sections, or you need certain particular functions to appear in special sections. The `section`attribute specifies that a function lives in a particular section. For example, the declaration:

extern void foobar (void) __attribute__ ((section ("bar")));

puts the function `foobar` in the `bar` section.

Some file formats do not support arbitrary sections so the `section`attribute is not available on all platforms. If you need to map the entire contents of a module to a particular section, consider using the facilities of the linker instead.

`sentinel`[ ¶](#index-sentinel-function-attribute)

`sentinel (position)`

This function attribute indicates that an argument in a call to the function is expected to be an explicit `NULL`. The attribute is only valid on variadic functions. By default, the sentinel is expected to be the last argument of the function call. If the optional position argument is specified to the attribute, the sentinel must be located atposition counting backwards from the end of the argument list.

__attribute__ ((sentinel))
is equivalent to
__attribute__ ((sentinel(0)))

The attribute is automatically set with a position of 0 for the built-in functions `execl` and `execlp`. The built-in function`execle` has the attribute set with a position of 1.

A valid `NULL` in this context is defined as zero with any object pointer type. If your system defines the `NULL` macro with an integer type then you need to add an explicit cast. During installation GCC replaces the system `<stddef.h>` header with a copy that redefines NULL appropriately.

The warnings for missing or incorrect sentinels are enabled with\-Wformat.

`simd`[ ¶](#index-simd-function-attribute)

`simd("mask")`

This attribute enables creation of one or more function versions that can process multiple arguments using SIMD instructions from a single invocation. Specifying this attribute allows compiler to assume that such versions are available at link time (provided in the same or another translation unit). Generated versions are target-dependent and described in the corresponding Vector ABI document. For x86\_64 target this document can be found[here](https://sourceware.org/glibc/wiki/libmvec?action=AttachFile&do=view&target=VectorABI.txt).

The optional argument mask may have the value`notinbranch` or `inbranch`, and instructs the compiler to generate non-masked or masked clones correspondingly. By default, all clones are generated.

If the attribute is specified and `#pragma omp declare simd` is present on a declaration and the \-fopenmp or \-fopenmp-simdswitch is specified, then the attribute is ignored.

`stack_protect`[ ¶](#index-stack%5F005fprotect-function-attribute)

This attribute adds stack protection code to the function if flags \-fstack-protector, \-fstack-protector-strongor \-fstack-protector-explicit are set.

`no_stack_protector`[ ¶](#index-no%5F005fstack%5F005fprotector-function-attribute)

This attribute prevents stack protection code for the function.

`target (string, …)`[ ¶](#index-target-function-attribute)

Multiple target back ends implement the `target` attribute to specify that a function is to be compiled with different target options than specified on the command line. The original target command-line options are ignored. One or more strings can be provided as arguments. Each string consists of one or more comma-separated suffixes to the `-m` prefix jointly forming the name of a machine-dependent option. See [Machine-Dependent Options](https://gcc.gnu.org/onlinedocs/gcc/Submodel-Options.html).

The `target` attribute can be used for instance to have a function compiled with a different ISA (instruction set architecture) than the default. ‘#pragma GCC target’ can be used to specify target-specific options for more than one function. See [Function Specific Option Pragmas](https://gcc.gnu.org/onlinedocs/gcc/Function-Specific-Option-Pragmas.html), for details about the pragma.

For instance, on an x86, you could declare one function with the`target("sse4.1,arch=core2")` attribute and another with`target("sse4a,arch=amdfam10")`. This is equivalent to compiling the first function with \-msse4.1 and\-march=core2 options, and the second function with\-msse4a and \-march=amdfam10 options. It is up to you to make sure that a function is only invoked on a machine that supports the particular ISA it is compiled for (for example by using`cpuid` on x86 to determine what feature bits and architecture family are used).

int core2_func (void) __attribute__ ((__target__ ("arch=core2")));
int sse3_func (void) __attribute__ ((__target__ ("sse3")));

Providing multiple strings as arguments separated by commas to specify multiple options is equivalent to separating the option suffixes with a comma (‘,’) within a single string. Spaces are not permitted within the strings.

The options supported are specific to each target; refer to [x86 Function Attributes](https://gcc.gnu.org/onlinedocs/gcc/x86-Function-Attributes.html), [PowerPC Function Attributes](https://gcc.gnu.org/onlinedocs/gcc/PowerPC-Function-Attributes.html),[ARM Function Attributes](https://gcc.gnu.org/onlinedocs/gcc/ARM-Function-Attributes.html), [AArch64 Function Attributes](https://gcc.gnu.org/onlinedocs/gcc/AArch64-Function-Attributes.html),[Nios II Function Attributes](https://gcc.gnu.org/onlinedocs/gcc/Nios-II-Function-Attributes.html), and [S/390 Function Attributes](https://gcc.gnu.org/onlinedocs/gcc/S%5F002f390-Function-Attributes.html)for details.

`symver ("name2@nodename")`[ ¶](#index-symver-function-attribute)

On ELF targets this attribute creates a symbol version. The name2 part of the parameter is the actual name of the symbol by which it will be externally referenced. The `nodename` portion should be the name of a node specified in the version script supplied to the linker when building a shared library. Versioned symbol must be defined and must be exported with default visibility.

__attribute__ ((__symver__ ("foo@VERS_1"))) int
foo_v1 (void)
{
}

Will produce a `.symver foo_v1, foo@VERS_1` directive in the assembler output. 

One can also define multiple version for a given symbol (starting from binutils 2.35).

__attribute__ ((__symver__ ("foo@VERS_2"), __symver__ ("foo@VERS_3")))
int symver_foo_v1 (void)
{
}

This example creates a symbol name `symver_foo_v1`which will be version `VERS_2` and `VERS_3` of `foo`.

If you have an older release of binutils, then symbol alias needs to be used:

__attribute__ ((__symver__ ("foo@VERS_2")))
int foo_v1 (void)
{
  return 0;
}

__attribute__ ((__symver__ ("foo@VERS_3")))
__attribute__ ((alias ("foo_v1")))
int symver_foo_v1 (void);

Finally if the parameter is `"name2@@nodename"` then in addition to creating a symbol version (as if`"name2@nodename"` was used) the version will be also used to resolve name2 by the linker.

`tainted_args`[ ¶](#index-tainted%5F005fargs-function-attribute)

The `tainted_args` attribute is used to specify that a function is called in a way that requires sanitization of its arguments, such as a system call in an operating system kernel. Such a function can be considered part of the “attack surface” of the program. The attribute can be used both on function declarations, and on field declarations containing function pointers. In the latter case, any function used as an initializer of such a callback field will be treated as being called with tainted arguments.

The analyzer will pay particular attention to such functions when\-fanalyzer is supplied, potentially issuing warnings guarded by\-Wanalyzer-tainted-allocation-size,\-Wanalyzer-tainted-array-index,\-Wanalyzer-tainted-divisor,\-Wanalyzer-tainted-offset, and \-Wanalyzer-tainted-size.

`target_clones (options)`[ ¶](#index-target%5F005fclones-function-attribute)

The `target_clones` attribute is used to specify that a function be cloned into multiple versions compiled with different target options than specified on the command line. The supported options and restrictions are the same as for `target` attribute.

For instance, on an x86, you could compile a function with`target_clones("sse4.1,avx")`. GCC creates two function clones, one compiled with \-msse4.1 and another with \-mavx.

On a PowerPC, you can compile a function with`target_clones("cpu=power9,default")`. GCC will create two function clones, one compiled with \-mcpu=power9 and another with the default options. GCC must be configured to use GLIBC 2.23 or newer in order to use the `target_clones` attribute.

It also creates a resolver function (see the `ifunc` attribute above) that dynamically selects a clone suitable for current architecture. The resolver is created only if there is a usage of a function with `target_clones` attribute.

Note that any subsequent call of a function without `target_clone`from a `target_clone` caller will not lead to copying (target clone) of the called function. If you want to enforce such behaviour, we recommend declaring the calling function with the `flatten` attribute?

`unused`[ ¶](#index-unused-function-attribute)

This attribute, attached to a function, means that the function is meant to be possibly unused. GCC does not produce a warning for this function.

`used`[ ¶](#index-used-function-attribute)

This attribute, attached to a function, means that code must be emitted for the function even if it appears that the function is not referenced. This is useful, for example, when the function is referenced only in inline assembly.

When applied to a member function of a C++ class template, the attribute also means that the function is instantiated if the class itself is instantiated.

`retain`[ ¶](#index-retain-function-attribute)

For ELF targets that support the GNU or FreeBSD OSABIs, this attribute will save the function from linker garbage collection. To support this behavior, functions that have not been placed in specific sections (e.g. by the `section` attribute, or the `-ffunction-sections`option), will be placed in new, unique sections.

This additional functionality requires Binutils version 2.36 or later.

`visibility ("visibility_type")`[ ¶](#index-visibility-function-attribute)

This attribute affects the linkage of the declaration to which it is attached. It can be applied to variables (see [Common Variable Attributes](https://gcc.gnu.org/onlinedocs/gcc/Common-Variable-Attributes.html)) and types (see [Common Type Attributes](https://gcc.gnu.org/onlinedocs/gcc/Common-Type-Attributes.html)) as well as functions.

There are four supported visibility\_type values: default, hidden, protected or internal visibility.

void __attribute__ ((visibility ("protected")))
f () { /* Do something. */; }
int i __attribute__ ((visibility ("hidden")));

The possible values of visibility\_type correspond to the visibility settings in the ELF gABI.

`default`

Default visibility is the normal case for the object file format. This value is available for the visibility attribute to override other options that may change the assumed visibility of entities.

On ELF, default visibility means that the declaration is visible to other modules and, in shared libraries, means that the declared entity may be overridden.

On Darwin, default visibility means that the declaration is visible to other modules.

Default visibility corresponds to “external linkage” in the language.

`hidden`

Hidden visibility indicates that the entity declared has a new form of linkage, which we call “hidden linkage”. Two declarations of an object with hidden linkage refer to the same object if they are in the same shared object.

`internal`

Internal visibility is like hidden visibility, but with additional processor specific semantics. Unless otherwise specified by the psABI, GCC defines internal visibility to mean that a function is_never_ called from another module. Compare this with hidden functions which, while they cannot be referenced directly by other modules, can be referenced indirectly via function pointers. By indicating that a function cannot be called from outside the module, GCC may for instance omit the load of a PIC register since it is known that the calling function loaded the correct value.

`protected`

Protected visibility is like default visibility except that it indicates that references within the defining module bind to the definition in that module. That is, the declared entity cannot be overridden by another module.

All visibilities are supported on many, but not all, ELF targets (supported when the assembler supports the ‘.visibility’ pseudo-op). Default visibility is supported everywhere. Hidden visibility is supported on Darwin targets.

The visibility attribute should be applied only to declarations that would otherwise have external linkage. The attribute should be applied consistently, so that the same entity should not be declared with different settings of the attribute.

In C++, the visibility attribute applies to types as well as functions and objects, because in C++ types have linkage. A class must not have greater visibility than its non-static data member types and bases, and class members default to the visibility of their class. Also, a declaration without explicit visibility is limited to the visibility of its type.

In C++, you can mark member functions and static member variables of a class with the visibility attribute. This is useful if you know a particular method or static member variable should only be used from one shared object; then you can mark it hidden while the rest of the class has default visibility. Care must be taken to avoid breaking the One Definition Rule; for example, it is usually not useful to mark an inline method as hidden without marking the whole class as hidden.

A C++ namespace declaration can also have the visibility attribute.

namespace nspace1 __attribute__ ((visibility ("protected")))
{ /* Do something. */; }

This attribute applies only to the particular namespace body, not to other definitions of the same namespace; it is equivalent to using ‘#pragma GCC visibility’ before and after the namespace definition (see [Visibility Pragmas](https://gcc.gnu.org/onlinedocs/gcc/Visibility-Pragmas.html)).

In C++, if a template argument has limited visibility, this restriction is implicitly propagated to the template instantiation. Otherwise, template instantiations and specializations default to the visibility of their template.

If both the template and enclosing class have explicit visibility, the visibility from the template is used.

`warn_unused_result`[ ¶](#index-warn%5F005funused%5F005fresult-function-attribute)

The `warn_unused_result` attribute causes a warning to be emitted if a caller of the function with this attribute does not use its return value. This is useful for functions where not checking the result is either a security problem or always a bug, such as`realloc`.

int fn () __attribute__ ((warn_unused_result));
int foo ()
{
  if (fn () < 0) return -1;
  fn ();
  return 0;
}

results in warning on line 5.

`weak`[ ¶](#index-weak-function-attribute)

The `weak` attribute causes a declaration of an external symbol to be emitted as a weak symbol rather than a global. This is primarily useful in defining library functions that can be overridden in user code, though it can also be used with non-function declarations. The overriding symbol must have the same type as the weak symbol. In addition, if it designates a variable it must also have the same size and alignment as the weak symbol. Weak symbols are supported for ELF targets, and also for a.out targets when using the GNU assembler and linker.

`weakref`[ ¶](#index-weakref-function-attribute)

`weakref ("target")`

The `weakref` attribute marks a declaration as a weak reference. Without arguments, it should be accompanied by an `alias` attribute naming the target symbol. Alternatively, target may be given as an argument to `weakref` itself, naming the target definition of the alias. The target must have the same type as the declaration. In addition, if it designates a variable it must also have the same size and alignment as the declaration. In either form of the declaration`weakref` implicitly marks the declared symbol as `weak`. Without a target given as an argument to `weakref` or to `alias`,`weakref` is equivalent to `weak` (in that case the declaration may be `extern`).

/* Given the declaration: */
extern int y (void);

/* the following... */
static int x (void) __attribute__ ((weakref ("y")));

/* is equivalent to... */
static int x (void) __attribute__ ((weakref, alias ("y")));

/* or, alternatively, to... */
static int x (void) __attribute__ ((weakref));
static int x (void) __attribute__ ((alias ("y")));

A weak reference is an alias that does not by itself require a definition to be given for the target symbol. If the target symbol is only referenced through weak references, then it becomes a `weak`undefined symbol. If it is directly referenced, however, then such strong references prevail, and a definition is required for the symbol, not necessarily in the same translation unit.

The effect is equivalent to moving all references to the alias to a separate translation unit, renaming the alias to the aliased symbol, declaring it as weak, compiling the two separate translation units and performing a link with relocatable output (i.e. `ld -r`) on them.

A declaration to which `weakref` is attached and that is associated with a named `target` must be `static`.

`zero_call_used_regs ("choice")`[ ¶](#index-zero%5F005fcall%5F005fused%5F005fregs-function-attribute)

The `zero_call_used_regs` attribute causes the compiler to zero a subset of all call-used registers[7](#FOOT7) at function return. This is used to increase program security by either mitigating Return-Oriented Programming (ROP) attacks or preventing information leakage through registers.

In order to satisfy users with different security needs and control the run-time overhead at the same time, the choice parameter provides a flexible way to choose the subset of the call-used registers to be zeroed. The four basic values of choice are:

* ‘skip’ doesn’t zero any call-used registers.
* ‘used’ only zeros call-used registers that are used in the function. A “used” register is one whose content has been set or referenced in the function.
* ‘all’ zeros all call-used registers.
* ‘leafy’ behaves like ‘used’ in a leaf function, and like ‘all’ in a nonleaf function. This makes for leaner zeroing in leaf functions, where the set of used registers is known, and that may be enough for some purposes of register zeroing.

In addition to these three basic choices, it is possible to modify ‘used’, ‘all’, and ‘leafy’ as follows:

* Adding ‘\-gpr’ restricts the zeroing to general-purpose registers.
* Adding ‘\-arg’ restricts the zeroing to registers that can sometimes be used to pass function arguments. This includes all argument registers defined by the platform’s calling conversion, regardless of whether the function uses those registers for function arguments or not.

The modifiers can be used individually or together. If they are used together, they must appear in the order above.

The full list of choices is therefore:

`skip`

doesn’t zero any call-used register.

`used`

only zeros call-used registers that are used in the function.

`used-gpr`

only zeros call-used general purpose registers that are used in the function.

`used-arg`

only zeros call-used registers that are used in the function and pass arguments.

`used-gpr-arg`

only zeros call-used general purpose registers that are used in the function and pass arguments.

`all`

zeros all call-used registers.

`all-gpr`

zeros all call-used general purpose registers.

`all-arg`

zeros all call-used registers that pass arguments.

`all-gpr-arg`

zeros all call-used general purpose registers that pass arguments.

`leafy`

Same as ‘used’ in a leaf function, and same as ‘all’ in a nonleaf function.

`leafy-gpr`

Same as ‘used-gpr’ in a leaf function, and same as ‘all-gpr’ in a nonleaf function.

`leafy-arg`

Same as ‘used-arg’ in a leaf function, and same as ‘all-arg’ in a nonleaf function.

`leafy-gpr-arg`

Same as ‘used-gpr-arg’ in a leaf function, and same as ‘all-gpr-arg’ in a nonleaf function.

Of this list, ‘used-arg’, ‘used-gpr-arg’, ‘all-arg’, ‘all-gpr-arg’, ‘leafy-arg’, and ‘leafy-gpr-arg’ are mainly used for ROP mitigation.

The default for the attribute is controlled by \-fzero-call-used-regs.



# links
[Read on Omnivore](https://omnivore.app/me/common-function-attributes-using-the-gnu-compiler-collection-gcc-18cf0d4764a)
[Read Original](https://gcc.gnu.org/onlinedocs/gcc/Common-Function-Attributes.html)

<iframe src="https://gcc.gnu.org/onlinedocs/gcc/Common-Function-Attributes.html"  width="800" height="500"></iframe>
