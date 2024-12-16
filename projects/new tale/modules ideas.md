## ECS
- an object life time system, every x amount of time it ask all of it's objects if they are still in use and delete them if not.
	- this could be a good way to prevent memory leak and offload object deletion to a separate thread
	- this allow me to butch delete, deletion will only really happen at the of a cycle(even if the user asked for them outside of a cycle then the object will go to a state of not valid but still exist)
	- need to check how heavy will the system be compere to it's benefits, but it can make the user experience much easier which is a price I am willing to put some performance on.


## unit tests
- need to write a mock libs for each api I use that the return value can be controlled with a queue that allow to emulate any kind of behavior the system can have and maybe even custom crushes that I should handle but shouldn't relay happen.

## error handling
- I want to start using a 128 bit field as my error return value across all the engine.
	- this are the fields
		- file id, 10 bits, each c file will get an id that the logger knows how to translate to a file name.
		- line, 10 bits, the line of the error.
		- system type, 6 bits, the system the error happened on.
		- data type, 6 bits, the type of date, the system should know how to handle it
		- error code, 13 bits, the error that happened
		- time stamp, 16 bits, time in nano seconds since the program started to run
		- severity,  3 bits, the severity of the error
		- data, 64 bit, a pointer to all the relevant error info
	- then all my functions will return it and I will be able to write macros to handle different errors.
	- it might not be pretty but it could be to smart to make that variable static thread locale variable, then I won't need to return or create it every time so it will be much lighter and will allow me to set some good debug info.
	- if it is not a static thread local variable that live for the entirety of the thread it might be smart to find a way to not have data included or send it to the system in other ways as it will make things slower(64 bit copy is faster then 128 bit copy).
- I need to create a system to allow error handling at a higher level some errors might be easy to resolve and won't require any further actions but some might require more advance logic then a log and not always can I just return the error code to the caller function.
  for that I want to create more robust error handling systems that allow to set the error handling methods per thread and call to them.

### auto generate file id:

this should be in some sort of header.

```c
#pragma once
constexpr const char *files[] = {
    #include "files.csv"
};

constexpr int strcmp_const(const char* a, const char* b){
    int i = 0;
    for(i = 0; a[i] != 0 && b[i] != 0; i++)
    {
        if(a[i] != b[i])
        {
            return 0;
        }
    }
    return a[i] == b[i];
}

constexpr int findFileId(const char *file)
{
    for(int i = 0; i < sizeof(files)/sizeof(files[0]); i++){
        if(strcmp_const(files[i], file)){
            return i;
        }
    }
}

constexpr int fileid = findFileId(FILE_NAME);
```

in files.csv there will be a list of all the c files in the project
and FILE_NAME will be a define with the file path as it is in files, it will be added by the makefile with -DFILE_NAME = $<

the problem is it will recompile the entire project every time files.csv changes.
there is also a rule to compile file.csv that need to be run before the main rule.
I might need to move this code from the header as constexpr to make code which is not going to be fun.

it can also be solved with python like so:
```python
-DFILE_ID=${shell python -c "
	print(open('./build/include/files.csv', 'r').read()[:-2].split(', ').index('$<'))
"}
```
this solution won't require recompiling on file manipulations as long as the list dons't changes in a large way.
it might be better to use a better file format then csv

mabe JSON

so now there is python script that generate a json file and a small script to read from it
```python
import json; 
files = json.load(open('./build/include/files.json', 'r'));
print(files[[file[0] for file in files].index('$(1)')][1])
```

## Renderer
