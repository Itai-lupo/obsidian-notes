the fastest way to share data between 2 process is shared memory, it allows for zero copy communication with near zero syscalls(you might need to map more memory or want to use locks or some poll mechanism).
in order to share memory between 2 process there is a need for a memory manger to keep track of shared memory allocations and frees and know how to adopt a pointer from one process to the other.

open a shared memory file and map it before you create the new process, you can map the full range to the file and use ftruncate as you go to make the file larger
then on top if you will want your memory manger, a combo of [buddy](https://en.wikipedia.org/wiki/Buddy_memory_allocation) and [slab](https://en.wikipedia.org/wiki/Slab_allocation) might do the work.
then you only need to make share that all your maps stay in sync as you'r pool grows larger(and to resize you'r memory file).
and if you want to use 2 unrelated process(or just can't map before) then you need a way to offset pointers from a different process just for fun.
and in order to have faster and more efficient allocations you might want to explore shit like [tcmalloc ](https://github.com/google/tcmalloc/blob/master/docs/design.md) as google are smarter then you(expect for glog, we don't speak of glog) and to learn what to do you might as well read about what not to do from libc [malloc](https://sourceware.org/glibc/wiki/MallocInternals).

the demands from the pool are:

- the memory needs to be shared between many process(that all fork from one).
- process safety(can alloc and free from different process at the same time).
- fast, no locks as much a possibly, as little as possibly of waiting for other process.
- memory efficient(low fragmentation and memory overhead).
- safe to use

the main structure I want:
each thread should have it's own page pool that it can mange and work with using some sort of slab allocater
only the process that own the page pool can add allocate from it but every one can free from it(no double free and so on...)

![[shared memory pool design.svg]]

## future adds

garbage collector?
maybe non shared memory?
memory protections?
core page pools instead of process page pools?
memory fences?
