---
id: fe75e396-61a6-40b6-8f4f-9303c39eb3a9
title: "io_uring by example: Part 1 - Introduction - Unixism"
tags:
  - programing
  - cpp
  - linux
  - c
  - io
date: 2024-04-05 20:22:03
date_published: 2020-04-05 14:00:54
words_count: 10939
state: INBOX
---

# io_uring by example: Part 1 - Introduction - Unixism by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> This article is a part of a series on io_uring Series introduction Part 1: This article. Part 2: Queuing multiple operations: We develop a file copying program, cp_liburing leveraging multiple requests with io_uring. Part 3: A web server written using io_uring. Introduction Come to think about it, I/O, along with compute are the only two… Continue reading io_uring by example: Part 1 – Introduction


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Unixism](https://unixism.net/)

 Of consoles and blinking cursors 

#### This article is a part of a series on `io_uring`

* [Series introduction](https://unixism.net/2020/04/io-uring-by-example-article-series/)
* [Part 1](https://unixism.net/2020/04/io-uring-by-example-part-1-introduction/): This article.
* [Part 2](https://unixism.net/2020/04/io-uring-by-example-part-2-queuing-multiple-requests/): Queuing multiple operations: We develop a file copying program, `cp_liburing` leveraging multiple requests with `io_uring`.
* [Part 3](https://unixism.net/2020/04/io-uring-by-example-part-3-a-web-server-with-io-uring/): A web server written using `io_uring`.

## Introduction

Come to think about it, I/O, along with compute are the only two things computers really do. Under Linux, for compute, you get to choose between processes or threads. When it comes to I/O, Linux has both synchronous I/O, also known as blocking I/O and asynchronous I/O. Although [asynchronous I/O](http://man7.org/linux/man-pages/man7/aio.7.html) (`aio` family of system calls) have been part of Linux for a while now, they only work for direct I/O and not for buffered I/O. For files opened in buffered mode, `aio` acts like regular, blocking system calls. This is not a pleasant limitation to deal with. To add to this, there is a lot of system call overhead in Linux’s current `aio` interface.

Given that it is not easy to come up with a Linux subsystem that provides high-performance asynchronous I/O given how complex the project will be, the hoopla around `io_uring` is most certainly justified. Not only does `io_uring` provide an elegant kernel/user space interface, it provides excellent performance by allowing ways (a special polling mode) to completely do away with systems calls to get data across from kernel to user space and vice-versa.

Asynchronous programming for mere mortals though, is another story altogether. If you’ve dealt with both threads and asynchronous programming with `select`/`poll`/`epoll` in a low-level language like C, you’ll know what I mean by this. We’re not very good at thinking asynchronously, as opposed to say, using threads. Threads have a ‘start here’, ‘do 1-2-3 things’, and ‘end here’ kind of a progression. Although they get blocked and unblocked several times by the operating system that illusion is hidden from the programmer and so it is a relatively simple mental model to absorb and adopt to your needs. This does not mean that asynchronous programming is very hard. It is typically the lowest level-layer in your program. Once you write a layer to abstract this out, you’ll be comfortable and busy doing what your application set out to do, stuff that your users will primarily care about.

Talking about abstracting things, `io_uring` does provide a higher-level library `liburing`, which implements and hides away a lot of boilerplate code that `io_uring` requires, while providing a simpler interface for you to deal with. But what is the fun in using `liburing` without first understanding how `io_uring` works at a low-level? But knowing this, you might very well use `liburing`, but you’ll know the corner cases and have a much better grasp of how things work under the hood. And that is a good thing. To this end, we will build most examples with `liburing`, but we will also build of them with the low-level interface.

## A regular cat

Let’s built a simple `cat` command equivalent using the `readv()` system call, in a synchronous or blocking way. This will familiarize you with `readv()`, which is part of the set of system calls that enable scatter/gather I/O otherwise known as vectored I/O. If you are familiar with the way `readv()` works, you can skip to the next section.

While `read()` and `write()` take as arguments a file descriptor, a buffer and its length, `readv()` and `writev()` take as arguments a file descriptor, a pointer to an array of `struct iovec` structures and finally an argument that denotes the length of that array. Let’s now take a look at `struct iovec`.

void \*iov\_base; /\* Starting address \*/

 size\_t iov\_len; /\* Number of bytes to transfer \*/

struct iovec { void \*iov\_base; /\* Starting address \*/ size\_t iov\_len; /\* Number of bytes to transfer \*/ };

struct iovec {
     void  *iov_base;    /* Starting address */
     size_t iov_len;     /* Number of bytes to transfer */
};

Each struct simply points to a buffer. A base address and a length.

What’s the point of using vectored or scatter/gather I/O over regular `read()` and `write()`, you may ask. The answer is that using `readv()` and `writev()` is more natural. For example, with `readv()`, you can fill in many members of a structure without either resorting to copying around buffers or making multiple calls to `read()`, both of which are relative inefficient. The same advantages applies to `writev()`. Also, these calls are atomic while multiple calls to `read()` and `write()` are not, should you happen to care about that for some reason.

Although mostly used to print contents of a file to the console, the `cat` command con**cat**enates (meaning joins together) and prints the contents of files that are passed in as arguments to the command. In our `cat` example, we’ll use `readv()` to read data from files to print to the console. We’ll read the file chunk by chunk and each of those chunks will be pointed to by an `iovec` structure. `readv()` blocks and when it returns, assuming there are no errors, the `struct iovec` structures point to a set of buffers that have the file data in them. We then print those to the console. Simple enough.

 \* Returns the size of the file whose open file descriptor is passed in.

 \* Properly handles regular file and block devices as well. Pretty.

off\_t get\_file\_size(int fd) {

if (S\_ISBLK(st.st\_mode)) {

unsigned long long bytes;

if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) {

} else if (S\_ISREG(st.st\_mode))

 \* Output a string of characters of len length to stdout.

 \* We use buffered output here to be efficient,

 \* since we need to output character-by-character.

void output\_to\_console(char \*buf, int len) {

int read\_and\_print\_file(char \*file\_name) {

int file\_fd = open(file\_name, O\_RDONLY);

 off\_t file\_sz = get\_file\_size(file\_fd);

 off\_t bytes\_remaining = file\_sz;

int blocks = (int) file\_sz / BLOCK\_SZ;

if (file\_sz % BLOCK\_SZ) blocks++;

 iovecs = malloc(sizeof(struct iovec) \* blocks);

 \* For the file we're reading, allocate enough blocks to be able to hold

 \* the file data. Each block is described in an iovec structure, which is

 \* passed to readv as part of the array of iovecs.

while (bytes\_remaining) {

 off\_t bytes\_to\_read = bytes\_remaining;

if (bytes\_to\_read \> BLOCK\_SZ)

 bytes\_to\_read = BLOCK\_SZ;

if( posix\_memalign(&buf, BLOCK\_SZ, BLOCK\_SZ)) {

perror("posix\_memalign");

 iovecs\[current\_block\].iov\_base \= buf;

 iovecs\[current\_block\].iov\_len \= bytes\_to\_read;

 bytes\_remaining -= bytes\_to\_read;

 \* The readv() call will block until all iovec buffers are filled with

 \* file data. Once it returns, we should be able to access the file data

 \* from the iovecs and print them on the console.

int ret = readv(file\_fd, iovecs, blocks);

for (int i = 0; i < blocks; i++)

output\_to\_console(iovecs\[i\].iov\_base, iovecs\[i\].iov\_len);

int main(int argc, char \*argv\[\]) {

fprintf(stderr, "Usage: %s <filename1> \[<filename2> ...\]\\n",

 \* For each file that is passed in as the argument, call the

 \* read\_and\_print\_file() function.

for (int i = 1; i < argc; i++) {

if(read\_and\_print\_file(argv\[i\])) {

fprintf(stderr, "Error reading file\\n");

#include <stdio.h> #include <sys/uio.h> #include <sys/stat.h> #include <linux/fs.h> #include <sys/ioctl.h> #include <fcntl.h> #include <stdlib.h> #define BLOCK\_SZ 4096 /\* \* Returns the size of the file whose open file descriptor is passed in. \* Properly handles regular file and block devices as well. Pretty. \* \*/ off\_t get\_file\_size(int fd) { struct stat st; if(fstat(fd, &st) < 0) { perror("fstat"); return -1; } if (S\_ISBLK(st.st\_mode)) { unsigned long long bytes; if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) { perror("ioctl"); return -1; } return bytes; } else if (S\_ISREG(st.st\_mode)) return st.st\_size; return -1; } /\* \* Output a string of characters of len length to stdout. \* We use buffered output here to be efficient, \* since we need to output character-by-character. \* \*/ void output\_to\_console(char \*buf, int len) { while (len--) { fputc(\*buf++, stdout); } } int read\_and\_print\_file(char \*file\_name) { struct iovec \*iovecs; int file\_fd = open(file\_name, O\_RDONLY); if (file\_fd < 0) { perror("open"); return 1; } off\_t file\_sz = get\_file\_size(file\_fd); off\_t bytes\_remaining = file\_sz; int blocks = (int) file\_sz / BLOCK\_SZ; if (file\_sz % BLOCK\_SZ) blocks++; iovecs = malloc(sizeof(struct iovec) \* blocks); int current\_block = 0; /\* \* For the file we're reading, allocate enough blocks to be able to hold \* the file data. Each block is described in an iovec structure, which is \* passed to readv as part of the array of iovecs. \* \*/ while (bytes\_remaining) { off\_t bytes\_to\_read = bytes\_remaining; if (bytes\_to\_read > BLOCK\_SZ) bytes\_to\_read = BLOCK\_SZ; void \*buf; if( posix\_memalign(&buf, BLOCK\_SZ, BLOCK\_SZ)) { perror("posix\_memalign"); return 1; } iovecs\[current\_block\].iov\_base = buf; iovecs\[current\_block\].iov\_len = bytes\_to\_read; current\_block++; bytes\_remaining -= bytes\_to\_read; } /\* \* The readv() call will block until all iovec buffers are filled with \* file data. Once it returns, we should be able to access the file data \* from the iovecs and print them on the console. \* \*/ int ret = readv(file\_fd, iovecs, blocks); if (ret < 0) { perror("readv"); return 1; } for (int i = 0; i < blocks; i++) output\_to\_console(iovecs\[i\].iov\_base, iovecs\[i\].iov\_len); return 0; } int main(int argc, char \*argv\[\]) { if (argc < 2) { fprintf(stderr, "Usage: %s <filename1> \[<filename2> ...\]\\n", argv\[0\]); return 1; } /\* \* For each file that is passed in as the argument, call the \* read\_and\_print\_file() function. \* \*/ for (int i = 1; i < argc; i++) { if(read\_and\_print\_file(argv\[i\])) { fprintf(stderr, "Error reading file\\n"); return 1; } } return 0; }

#include <stdio.h>
#include <sys/uio.h>
#include <sys/stat.h>
#include <linux/fs.h>
#include <sys/ioctl.h>
#include <fcntl.h>
#include <stdlib.h>

#define BLOCK_SZ    4096

/*
 * Returns the size of the file whose open file descriptor is passed in.
 * Properly handles regular file and block devices as well. Pretty.
 * */

off_t get_file_size(int fd) {
    struct stat st;

    if(fstat(fd, &st) < 0) {
        perror("fstat");
        return -1;
    }
    if (S_ISBLK(st.st_mode)) {
        unsigned long long bytes;
        if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) {
            perror("ioctl");
            return -1;
        }
        return bytes;
    } else if (S_ISREG(st.st_mode))
        return st.st_size;

    return -1;
}

/*
 * Output a string of characters of len length to stdout.
 * We use buffered output here to be efficient,
 * since we need to output character-by-character.
 * */
void output_to_console(char *buf, int len) {
    while (len--) {
        fputc(*buf++, stdout);
    }
}

int read_and_print_file(char *file_name) {
    struct iovec *iovecs;
    int file_fd = open(file_name, O_RDONLY);
    if (file_fd < 0) {
        perror("open");
        return 1;
    }

    off_t file_sz = get_file_size(file_fd);
    off_t bytes_remaining = file_sz;
    int blocks = (int) file_sz / BLOCK_SZ;
    if (file_sz % BLOCK_SZ) blocks++;
    iovecs = malloc(sizeof(struct iovec) * blocks);

    int current_block = 0;

    /*
     * For the file we're reading, allocate enough blocks to be able to hold
     * the file data. Each block is described in an iovec structure, which is
     * passed to readv as part of the array of iovecs.
     * */
    while (bytes_remaining) {
        off_t bytes_to_read = bytes_remaining;
        if (bytes_to_read > BLOCK_SZ)
            bytes_to_read = BLOCK_SZ;


        void *buf;
        if( posix_memalign(&buf, BLOCK_SZ, BLOCK_SZ)) {
            perror("posix_memalign");
            return 1;
        }
        iovecs[current_block].iov_base = buf;
        iovecs[current_block].iov_len = bytes_to_read;
        current_block++;
        bytes_remaining -= bytes_to_read;
    }

    /*
     * The readv() call will block until all iovec buffers are filled with
     * file data. Once it returns, we should be able to access the file data
     * from the iovecs and print them on the console.
     * */
    int ret = readv(file_fd, iovecs, blocks);
    if (ret < 0) {
        perror("readv");
        return 1;
    }

    for (int i = 0; i < blocks; i++)
        output_to_console(iovecs[i].iov_base, iovecs[i].iov_len);

    return 0;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <filename1> [<filename2> ...]\n",
                argv[0]);
        return 1;
    }

    /*
     * For each file that is passed in as the argument, call the
     * read_and_print_file() function.
     * */
    for (int i = 1; i < argc; i++) {
        if(read_and_print_file(argv[i])) {
            fprintf(stderr, "Error reading file\n");
            return 1;
        }
    }

    return 0;
}

This is a simple enough program. We discuss this now so that we can compare and contrast this with the approach we’ll be taking with `io_uring` next. The core of this program is a loop which calculates the number of blocks required to hold the data of file we’re reading by first finding its size. Memory for all the required `iovec` structures is allocated. We iterate for a count equal to the number of blocks the file size is, allocate block-sized memory to hold the actual data and finally call `readv()` to read in the data. Like we discussed before, `readv()` here is synchronous. Meaning it blocks until it has satisfied the request it was called upon for. When it returns, memory blocks we allocated and pointed to by the `iovec` structures are filled with the file data. We then print the file data to the console by calling the `output_to_console()` function.

## Cat uring

Let’s now write a functionally equivalent program to concatenate files using `io_uring`. The operation we’ll be using in `io_uring` will be `readv`. 

### The io\_uring interface

`io_uring`‘s interface is simple. There is a submission queue and there is a completion queue. In the submission queue, you submit information on various operations you want to get done. For example, for our current program, we want to read files with `readv()`, so we place a submission queue request describing it as part of a submission queue entry (SQE). Since it is a queue, you can place many requests. As many as the queue depth (which you can define) will allow. These operations can be a mix of reads, writes, etc. Then, we call the `io_uring_enter()` system call to tell the kernel that we’ve added requests to the submission queue. The kernel then does its jujitsu and once it has done processing those requests, it places results in the completion queue as part of a CQE or a completion queue entry one for each corresponding SQE. These CQEs can be accessed from user space. 

The astute reader would have noticed that this interface of filling up a queue with multiple I/O requests and then making a single system call as opposed to one system call for each I/O request is already more efficient. To take efficiency a notch further up, io\_uring support a mode where the kernel polls for entries you make into the submission queue without you even having to call `io_uring_enter()` to inform the kernel about newer submission queue entries. Another point to note is that in a life after [Spectre and Meltdown](https://meltdownattack.com/) hardware vulnerabilities were discovered and operating systems created workarounds for it, system calls are more expensive than ever. So, for high performance applications, reducing the number of system calls is a big deal indeed.

Before you can do any of this, you need to setup the queues, which really are ring buffers with a certain depth/length. You call the `io_uring_setup()` system call to get this done. We do real work by adding submission queue entries to a ring buffer and reading completion queue entries off of the completion queue ring buffer. This is an overview of how this `io_uring` interface is designed.

#### Completion Queue Entry

Now that we have a mental model of how things work, let’s look at how this is done in a bit more detail. Compared to the submission queue entry (SQE), the completion queue entry (CQE) is very simple. So, let’s look at it first. The SQE is a struct using which you submit requests. You add it to the submission ring buffer. The CQE is an instance of a struct which the kernel responds with for every SQE struct instance that is added to the submission queue. This contains the results of the operation you requested via an SQE instance.

 \_\_u64 user\_data; /\* sqe->user\_data submission passed back \*/

 \_\_s32 res; /\* result code for this event \*/

 struct io\_uring\_cqe { \_\_u64 user\_data; /\* sqe->user\_data submission passed back \*/ \_\_s32 res; /\* result code for this event \*/ \_\_u32 flags; };

    struct io_uring_cqe {
	__u64	user_data;	/* sqe->user_data submission passed back */
	__s32	res;		/* result code for this event */
	__u32	flags;
    };

As mentioned in the code comment, the `user_data` field is something that is passed as-is from the SQE to the CQE instance. Let’s say you submit a bunch of requests in the submission queue, it is not necessary that they complete in the same order and arrive on the completion queue. Take the following scenario for instance: You have tow disks on your machine: one is a slower spinning hard drive and another is a super-fast SSD. You submit 2 requests on the submission queue. The first one to read a 100kB file on the slower spinning hard disk and the second one to read a file of the same size on the faster SSD. If ordering were to be maintained, even though the data from the file on the SSD can be expected to arrive sooner, should the kernel wait for data from the file on the spinning hard drive to become available? Bad idea because this stops us from running as fast as we can. So, CQEs can arrive in any order as they become available. Whichever operation finishes quickly, it is immediately made available. Since there is no specified order in which CQEs arrive, given that now you know how a CQE looks like from the `struct io_uring_cqe` above, how do you identify the which SQE request a particular CQE corresponds to? One way to do that is to use the `user_data` field to identify it. Not that you’d set a unique ID or something, but you’d usually pass a pointer. If this is confusing, just wait till you see a clear example later on here.

The completion queue entry is simple since it mainly concerns itself with a system call’s return value, which is returned in its `res` field. For example, if you queued a read operation, on successful completion, it would contain the number of bytes read. If there was an error, it would contain `-errno`. Essentially what the `read()` system call itself would return.

#### Ordering

While I did mention that can CQEs arrive in any order, you can force ordering of certain operations with SQE ordering, in effect chaining them. I won’t be discussing ordering in this article series, but you can read the current [canonical io\_uring reference](https://kernel.dk/io%5Furing.pdf) to see how to do this.

#### Submission Queue Entry

The submission queue entry is a bit more complex than a completion queue entry since it needs to be generic enough to represent and deal with a wide range of I/O operations possible with Linux today.

 \_\_u8 opcode; /\* type of operation for this sqe \*/

 \_\_u8 flags; /\* IOSQE\_ flags \*/

 \_\_u16 ioprio; /\* ioprio for the request \*/

 \_\_s32 fd; /\* file descriptor to do IO on \*/

 \_\_u64 off; /\* offset into file \*/

 \_\_u64 addr; /\* pointer to buffer or iovecs \*/

 \_\_u32 len; /\* buffer size or number of iovecs \*/

 \_\_u64 user\_data; /\* data to be passed back at completion time \*/

 \_\_u16 buf\_index; /\* index into fixed buffers, if used \*/

struct io\_uring\_sqe { \_\_u8 opcode; /\* type of operation for this sqe \*/ \_\_u8 flags; /\* IOSQE\_ flags \*/ \_\_u16 ioprio; /\* ioprio for the request \*/ \_\_s32 fd; /\* file descriptor to do IO on \*/ \_\_u64 off; /\* offset into file \*/ \_\_u64 addr; /\* pointer to buffer or iovecs \*/ \_\_u32 len; /\* buffer size or number of iovecs \*/ union { \_\_kernel\_rwf\_t rw\_flags; \_\_u32 fsync\_flags; \_\_u16 poll\_events; \_\_u32 sync\_range\_flags; \_\_u32 msg\_flags; }; \_\_u64 user\_data; /\* data to be passed back at completion time \*/ union { \_\_u16 buf\_index; /\* index into fixed buffers, if used \*/ \_\_u64 \_\_pad2\[3\]; }; };

struct io_uring_sqe {
	__u8	opcode;		/* type of operation for this sqe */
	__u8	flags;		/* IOSQE_ flags */
	__u16	ioprio;		/* ioprio for the request */
	__s32	fd;		/* file descriptor to do IO on */
	__u64	off;		/* offset into file */
	__u64	addr;		/* pointer to buffer or iovecs */
	__u32	len;		/* buffer size or number of iovecs */
	union {
		__kernel_rwf_t	rw_flags;
		__u32		fsync_flags;
		__u16		poll_events;
		__u32		sync_range_flags;
		__u32		msg_flags;
	};
	__u64	user_data;	/* data to be passed back at completion time */
	union {
		__u16	buf_index;	/* index into fixed buffers, if used */
		__u64	__pad2[3];
	};
};

I know the struct looks busy. The fields that are used more commonly are only a few and this is easily explained with a simple example such as the one we’re dealing with: `cat`. You want to read a file using the `readv()` system call.

* `opcode` is used to specify the operation, in our case, `readv()` using the `IORING_OP_READV` constant.
* `fd` is used to specify the file which we want to read from. Its open file descriptor is specified here
* `addr` is used to point to the array of `iovec` structures that hold the addresses and lengths of the buffers we’ve allocated for I/O.
* finally, `len` is used to hold the length of the arrays of `iovecs`.

Now that wasn’t too difficult, or was it? You fill these values letting `io_uring` know what to do. You can queue multiple SQEs and finally call `io_uring_enter()` when you want the kernel to start processing your requests. 

#### io\_uring version of cat

Let’s see how to actually get this done in the io\_uring version of our `cat` program.

/\* If your compilation fails because the header file below is missing,

 \* your kernel is probably too old to support io\_uring.

#include <linux/io\_uring.h>

/\* This is x86 specific \*/

#define read\_barrier() \_\_asm\_\_ \_\_volatile\_\_("":::"memory")

#define write\_barrier() \_\_asm\_\_ \_\_volatile\_\_("":::"memory")

struct io\_uring\_cqe \*cqes;

struct app\_io\_sq\_ring sq\_ring;

struct io\_uring\_sqe \*sqes;

struct app\_io\_cq\_ring cq\_ring;

struct iovec iovecs\[\]; /\* Referred by readv/writev \*/

 \* This code is written in the days when io\_uring-related system calls are not

 \* part of standard C libraries. So, we roll our own system call wrapper

int io\_uring\_setup(unsigned entries, struct io\_uring\_params \*p)

return (int) syscall(\_\_NR\_io\_uring\_setup, entries, p);

int io\_uring\_enter(int ring\_fd, unsigned int to\_submit,

unsigned int min\_complete, unsigned int flags)

return (int) syscall(\_\_NR\_io\_uring\_enter, ring\_fd, to\_submit, min\_complete,

 \* Returns the size of the file whose open file descriptor is passed in.

 \* Properly handles regular file and block devices as well. Pretty.

off\_t get\_file\_size(int fd) {

if (S\_ISBLK(st.st\_mode)) {

unsigned long long bytes;

if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) {

} else if (S\_ISREG(st.st\_mode))

 \* io\_uring requires a lot of setup which looks pretty hairy, but isn't all

 \* that difficult to understand. Because of all this boilerplate code,

 \* io\_uring's author has created liburing, which is relatively easy to use.

 \* However, you should take your time and understand this code. It is always

 \* good to know how it all works underneath. Apart from bragging rights,

 \* it does offer you a certain strange geeky peace.

int app\_setup\_uring(struct submitter \*s) {

struct app\_io\_sq\_ring \*sring = &s-\>sq\_ring;

struct app\_io\_cq\_ring \*cring = &s-\>cq\_ring;

struct io\_uring\_params p;

 \* We need to pass in the io\_uring\_params structure to the io\_uring\_setup()

 \* call zeroed out. We could set any flags if we need to, but for this

memset(&p, 0, sizeof(p));

 s-\>ring\_fd = io\_uring\_setup(QUEUE\_DEPTH, &p);

perror("io\_uring\_setup");

 \* io\_uring communication happens via 2 shared kernel-user space ring buffers,

 \* which can be jointly mapped with a single mmap() call in recent kernels. 

 \* While the completion queue is directly manipulated, the submission queue 

 \* has an indirection array in between. We map that in as well.

int sring\_sz = p.sq\_off.array \+ p.sq\_entries \* sizeof(unsigned);

int cring\_sz = p.cq\_off.cqes \+ p.cq\_entries \* sizeof(struct io\_uring\_cqe);

/\* In kernel version 5.4 and above, it is possible to map the submission and 

 \* completion buffers with a single mmap() call. Rather than check for kernel 

 \* versions, the recommended way is to just check the features field of the 

 \* io\_uring\_params structure, which is a bit mask. If the 

 \* IORING\_FEAT\_SINGLE\_MMAP is set, then we can do away with the second mmap()

 \* call to map the completion ring.

if (p.features & IORING\_FEAT\_SINGLE\_MMAP) {

if (cring\_sz \> sring\_sz) {

/\* Map in the submission and completion queue ring buffers.

 \* Older kernels only map in the submission queue, though.

 sq\_ptr = mmap(0, sring\_sz, PROT\_READ | PROT\_WRITE, 

 MAP\_SHARED | MAP\_POPULATE,

 s-\>ring\_fd, IORING\_OFF\_SQ\_RING);

if (sq\_ptr == MAP\_FAILED) {

if (p.features & IORING\_FEAT\_SINGLE\_MMAP) {

/\* Map in the completion queue ring buffer in older kernels separately \*/

 cq\_ptr = mmap(0, cring\_sz, PROT\_READ | PROT\_WRITE, 

 MAP\_SHARED | MAP\_POPULATE,

 s-\>ring\_fd, IORING\_OFF\_CQ\_RING);

if (cq\_ptr == MAP\_FAILED) {

/\* Save useful fields in a global app\_io\_sq\_ring struct for later

 sring-\>head = sq\_ptr + p.sq\_off.head;

 sring-\>tail = sq\_ptr + p.sq\_off.tail;

 sring-\>ring\_mask = sq\_ptr + p.sq\_off.ring\_mask;

 sring-\>ring\_entries = sq\_ptr + p.sq\_off.ring\_entries;

 sring-\>flags = sq\_ptr + p.sq\_off.flags;

 sring-\>array = sq\_ptr + p.sq\_off.array;

/\* Map in the submission queue entries array \*/

 s-\>sqes = mmap(0, p.sq\_entries \* sizeof(struct io\_uring\_sqe),

 PROT\_READ | PROT\_WRITE, MAP\_SHARED | MAP\_POPULATE,

 s-\>ring\_fd, IORING\_OFF\_SQES);

if (s-\>sqes == MAP\_FAILED) {

/\* Save useful fields in a global app\_io\_cq\_ring struct for later

 cring-\>head = cq\_ptr + p.cq\_off.head;

 cring-\>tail = cq\_ptr + p.cq\_off.tail;

 cring-\>ring\_mask = cq\_ptr + p.cq\_off.ring\_mask;

 cring-\>ring\_entries = cq\_ptr + p.cq\_off.ring\_entries;

 cring-\>cqes = cq\_ptr + p.cq\_off.cqes;

 \* Output a string of characters of len length to stdout.

 \* We use buffered output here to be efficient,

 \* since we need to output character-by-character.

void output\_to\_console(char \*buf, int len) {

 \* Read from completion queue.

 \* In this function, we read completion events from the completion queue, get

 \* the data buffer that will have the file data and print it to the console.

void read\_from\_cq(struct submitter \*s) {

struct app\_io\_cq\_ring \*cring = &s-\>cq\_ring;

struct io\_uring\_cqe \*cqe;

unsigned head, reaped = 0;

 \* Remember, this is a ring buffer. If head == tail, it means that the

if (head == \*cring-\>tail)

 cqe = &cring-\>cqes\[head & \*s-\>cq\_ring.ring\_mask\];

 fi = (struct file\_info\*) cqe-\>user\_data;

fprintf(stderr, "Error: %s\\n", strerror(abs(cqe-\>res)));

int blocks = (int) fi-\>file\_sz / BLOCK\_SZ;

if (fi-\>file\_sz % BLOCK\_SZ) blocks++;

for (int i = 0; i < blocks; i++)

output\_to\_console(fi-\>iovecs\[i\].iov\_base, fi-\>iovecs\[i\].iov\_len);

 \* Submit to submission queue.

 \* In this function, we submit requests to the submission queue. You can submit

 \* many types of requests. Ours is going to be the readv() request, which we

 \* specify via IORING\_OP\_READV.

int submit\_to\_sq(char \*file\_path, struct submitter \*s) {

int file\_fd = open(file\_path, O\_RDONLY);

struct app\_io\_sq\_ring \*sring = &s-\>sq\_ring;

unsigned index = 0, current\_block = 0, tail = 0, next\_tail = 0;

 off\_t file\_sz = get\_file\_size(file\_fd);

 off\_t bytes\_remaining = file\_sz;

int blocks = (int) file\_sz / BLOCK\_SZ;

if (file\_sz % BLOCK\_SZ) blocks++;

 fi = malloc(sizeof(\*fi) \+ sizeof(struct iovec) \* blocks);

fprintf(stderr, "Unable to allocate memory\\n");

 \* For each block of the file we need to read, we allocate an iovec struct

 \* which is indexed into the iovecs array. This array is passed in as part

 \* of the submission. If you don't understand this, then you need to look

 \* up how the readv() and writev() system calls work.

while (bytes\_remaining) {

 off\_t bytes\_to\_read = bytes\_remaining;

if (bytes\_to\_read \> BLOCK\_SZ)

 bytes\_to\_read = BLOCK\_SZ;

 fi-\>iovecs\[current\_block\].iov\_len \= bytes\_to\_read;

if( posix\_memalign(&buf, BLOCK\_SZ, BLOCK\_SZ)) {

perror("posix\_memalign");

 fi-\>iovecs\[current\_block\].iov\_base \= buf;

 bytes\_remaining -= bytes\_to\_read;

/\* Add our submission queue entry to the tail of the SQE ring buffer \*/

 next\_tail = tail = \*sring-\>tail;

 index = tail & \*s-\>sq\_ring.ring\_mask;

struct io\_uring\_sqe \*sqe = &s-\>sqes\[index\];

 sqe-\>opcode = IORING\_OP\_READV;

 sqe-\>addr = (unsigned long) fi-\>iovecs;

 sqe-\>user\_data = (unsigned long long) fi;

 sring-\>array\[index\] \= index;

/\* Update the tail so the kernel can see it. \*/

if(\*sring-\>tail != tail) {

 \* Tell the kernel we have submitted events with the io\_uring\_enter() system

 \* call. We also pass in the IOURING\_ENTER\_GETEVENTS flag which causes the

 \* io\_uring\_enter() call to wait until min\_complete events (the 3rd param)

int ret = io\_uring\_enter(s-\>ring\_fd, 1,1,

perror("io\_uring\_enter");

int main(int argc, char \*argv\[\]) {

fprintf(stderr, "Usage: %s <filename>\\n", argv\[0\]);

memset(s, 0, sizeof(\*s));

fprintf(stderr, "Unable to setup uring!\\n");

for (int i = 1; i < argc; i++) {

if(submit\_to\_sq(argv\[i\], s)) {

fprintf(stderr, "Error reading file\\n");

#include <stdio.h> #include <stdlib.h> #include <sys/stat.h> #include <sys/ioctl.h> #include <sys/syscall.h> #include <sys/mman.h> #include <sys/uio.h> #include <linux/fs.h> #include <fcntl.h> #include <unistd.h> #include <string.h> /\* If your compilation fails because the header file below is missing, \* your kernel is probably too old to support io\_uring. \* \*/ #include <linux/io\_uring.h> #define QUEUE\_DEPTH 1 #define BLOCK\_SZ 1024 /\* This is x86 specific \*/ #define read\_barrier() \_\_asm\_\_ \_\_volatile\_\_("":::"memory") #define write\_barrier() \_\_asm\_\_ \_\_volatile\_\_("":::"memory") struct app\_io\_sq\_ring { unsigned \*head; unsigned \*tail; unsigned \*ring\_mask; unsigned \*ring\_entries; unsigned \*flags; unsigned \*array; }; struct app\_io\_cq\_ring { unsigned \*head; unsigned \*tail; unsigned \*ring\_mask; unsigned \*ring\_entries; struct io\_uring\_cqe \*cqes; }; struct submitter { int ring\_fd; struct app\_io\_sq\_ring sq\_ring; struct io\_uring\_sqe \*sqes; struct app\_io\_cq\_ring cq\_ring; }; struct file\_info { off\_t file\_sz; struct iovec iovecs\[\]; /\* Referred by readv/writev \*/ }; /\* \* This code is written in the days when io\_uring-related system calls are not \* part of standard C libraries. So, we roll our own system call wrapper \* functions. \* \*/ int io\_uring\_setup(unsigned entries, struct io\_uring\_params \*p) { return (int) syscall(\_\_NR\_io\_uring\_setup, entries, p); } int io\_uring\_enter(int ring\_fd, unsigned int to\_submit, unsigned int min\_complete, unsigned int flags) { return (int) syscall(\_\_NR\_io\_uring\_enter, ring\_fd, to\_submit, min\_complete, flags, NULL, 0); } /\* \* Returns the size of the file whose open file descriptor is passed in. \* Properly handles regular file and block devices as well. Pretty. \* \*/ off\_t get\_file\_size(int fd) { struct stat st; if(fstat(fd, &st) < 0) { perror("fstat"); return -1; } if (S\_ISBLK(st.st\_mode)) { unsigned long long bytes; if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) { perror("ioctl"); return -1; } return bytes; } else if (S\_ISREG(st.st\_mode)) return st.st\_size; return -1; } /\* \* io\_uring requires a lot of setup which looks pretty hairy, but isn't all \* that difficult to understand. Because of all this boilerplate code, \* io\_uring's author has created liburing, which is relatively easy to use. \* However, you should take your time and understand this code. It is always \* good to know how it all works underneath. Apart from bragging rights, \* it does offer you a certain strange geeky peace. \* \*/ int app\_setup\_uring(struct submitter \*s) { struct app\_io\_sq\_ring \*sring = &s->sq\_ring; struct app\_io\_cq\_ring \*cring = &s->cq\_ring; struct io\_uring\_params p; void \*sq\_ptr, \*cq\_ptr; /\* \* We need to pass in the io\_uring\_params structure to the io\_uring\_setup() \* call zeroed out. We could set any flags if we need to, but for this \* example, we don't. \* \*/ memset(&p, 0, sizeof(p)); s->ring\_fd = io\_uring\_setup(QUEUE\_DEPTH, &p); if (s->ring\_fd < 0) { perror("io\_uring\_setup"); return 1; } /\* \* io\_uring communication happens via 2 shared kernel-user space ring buffers, \* which can be jointly mapped with a single mmap() call in recent kernels. \* While the completion queue is directly manipulated, the submission queue \* has an indirection array in between. We map that in as well. \* \*/ int sring\_sz = p.sq\_off.array + p.sq\_entries \* sizeof(unsigned); int cring\_sz = p.cq\_off.cqes + p.cq\_entries \* sizeof(struct io\_uring\_cqe); /\* In kernel version 5.4 and above, it is possible to map the submission and \* completion buffers with a single mmap() call. Rather than check for kernel \* versions, the recommended way is to just check the features field of the \* io\_uring\_params structure, which is a bit mask. If the \* IORING\_FEAT\_SINGLE\_MMAP is set, then we can do away with the second mmap() \* call to map the completion ring. \* \*/ if (p.features & IORING\_FEAT\_SINGLE\_MMAP) { if (cring\_sz > sring\_sz) { sring\_sz = cring\_sz; } cring\_sz = sring\_sz; } /\* Map in the submission and completion queue ring buffers. \* Older kernels only map in the submission queue, though. \* \*/ sq\_ptr = mmap(0, sring\_sz, PROT\_READ | PROT\_WRITE, MAP\_SHARED | MAP\_POPULATE, s->ring\_fd, IORING\_OFF\_SQ\_RING); if (sq\_ptr == MAP\_FAILED) { perror("mmap"); return 1; } if (p.features & IORING\_FEAT\_SINGLE\_MMAP) { cq\_ptr = sq\_ptr; } else { /\* Map in the completion queue ring buffer in older kernels separately \*/ cq\_ptr = mmap(0, cring\_sz, PROT\_READ | PROT\_WRITE, MAP\_SHARED | MAP\_POPULATE, s->ring\_fd, IORING\_OFF\_CQ\_RING); if (cq\_ptr == MAP\_FAILED) { perror("mmap"); return 1; } } /\* Save useful fields in a global app\_io\_sq\_ring struct for later \* easy reference \*/ sring->head = sq\_ptr + p.sq\_off.head; sring->tail = sq\_ptr + p.sq\_off.tail; sring->ring\_mask = sq\_ptr + p.sq\_off.ring\_mask; sring->ring\_entries = sq\_ptr + p.sq\_off.ring\_entries; sring->flags = sq\_ptr + p.sq\_off.flags; sring->array = sq\_ptr + p.sq\_off.array; /\* Map in the submission queue entries array \*/ s->sqes = mmap(0, p.sq\_entries \* sizeof(struct io\_uring\_sqe), PROT\_READ | PROT\_WRITE, MAP\_SHARED | MAP\_POPULATE, s->ring\_fd, IORING\_OFF\_SQES); if (s->sqes == MAP\_FAILED) { perror("mmap"); return 1; } /\* Save useful fields in a global app\_io\_cq\_ring struct for later \* easy reference \*/ cring->head = cq\_ptr + p.cq\_off.head; cring->tail = cq\_ptr + p.cq\_off.tail; cring->ring\_mask = cq\_ptr + p.cq\_off.ring\_mask; cring->ring\_entries = cq\_ptr + p.cq\_off.ring\_entries; cring->cqes = cq\_ptr + p.cq\_off.cqes; return 0; } /\* \* Output a string of characters of len length to stdout. \* We use buffered output here to be efficient, \* since we need to output character-by-character. \* \*/ void output\_to\_console(char \*buf, int len) { while (len--) { fputc(\*buf++, stdout); } } /\* \* Read from completion queue. \* In this function, we read completion events from the completion queue, get \* the data buffer that will have the file data and print it to the console. \* \*/ void read\_from\_cq(struct submitter \*s) { struct file\_info \*fi; struct app\_io\_cq\_ring \*cring = &s->cq\_ring; struct io\_uring\_cqe \*cqe; unsigned head, reaped = 0; head = \*cring->head; do { read\_barrier(); /\* \* Remember, this is a ring buffer. If head == tail, it means that the \* buffer is empty. \* \*/ if (head == \*cring->tail) break; /\* Get the entry \*/ cqe = &cring->cqes\[head & \*s->cq\_ring.ring\_mask\]; fi = (struct file\_info\*) cqe->user\_data; if (cqe->res < 0) fprintf(stderr, "Error: %s\\n", strerror(abs(cqe->res))); int blocks = (int) fi->file\_sz / BLOCK\_SZ; if (fi->file\_sz % BLOCK\_SZ) blocks++; for (int i = 0; i < blocks; i++) output\_to\_console(fi->iovecs\[i\].iov\_base, fi->iovecs\[i\].iov\_len); head++; } while (1); \*cring->head = head; write\_barrier(); } /\* \* Submit to submission queue. \* In this function, we submit requests to the submission queue. You can submit \* many types of requests. Ours is going to be the readv() request, which we \* specify via IORING\_OP\_READV. \* \* \*/ int submit\_to\_sq(char \*file\_path, struct submitter \*s) { struct file\_info \*fi; int file\_fd = open(file\_path, O\_RDONLY); if (file\_fd < 0 ) { perror("open"); return 1; } struct app\_io\_sq\_ring \*sring = &s->sq\_ring; unsigned index = 0, current\_block = 0, tail = 0, next\_tail = 0; off\_t file\_sz = get\_file\_size(file\_fd); if (file\_sz < 0) return 1; off\_t bytes\_remaining = file\_sz; int blocks = (int) file\_sz / BLOCK\_SZ; if (file\_sz % BLOCK\_SZ) blocks++; fi = malloc(sizeof(\*fi) + sizeof(struct iovec) \* blocks); if (!fi) { fprintf(stderr, "Unable to allocate memory\\n"); return 1; } fi->file\_sz = file\_sz; /\* \* For each block of the file we need to read, we allocate an iovec struct \* which is indexed into the iovecs array. This array is passed in as part \* of the submission. If you don't understand this, then you need to look \* up how the readv() and writev() system calls work. \* \*/ while (bytes\_remaining) { off\_t bytes\_to\_read = bytes\_remaining; if (bytes\_to\_read > BLOCK\_SZ) bytes\_to\_read = BLOCK\_SZ; fi->iovecs\[current\_block\].iov\_len = bytes\_to\_read; void \*buf; if( posix\_memalign(&buf, BLOCK\_SZ, BLOCK\_SZ)) { perror("posix\_memalign"); return 1; } fi->iovecs\[current\_block\].iov\_base = buf; current\_block++; bytes\_remaining -= bytes\_to\_read; } /\* Add our submission queue entry to the tail of the SQE ring buffer \*/ next\_tail = tail = \*sring->tail; next\_tail++; read\_barrier(); index = tail & \*s->sq\_ring.ring\_mask; struct io\_uring\_sqe \*sqe = &s->sqes\[index\]; sqe->fd = file\_fd; sqe->flags = 0; sqe->opcode = IORING\_OP\_READV; sqe->addr = (unsigned long) fi->iovecs; sqe->len = blocks; sqe->off = 0; sqe->user\_data = (unsigned long long) fi; sring->array\[index\] = index; tail = next\_tail; /\* Update the tail so the kernel can see it. \*/ if(\*sring->tail != tail) { \*sring->tail = tail; write\_barrier(); } /\* \* Tell the kernel we have submitted events with the io\_uring\_enter() system \* call. We also pass in the IOURING\_ENTER\_GETEVENTS flag which causes the \* io\_uring\_enter() call to wait until min\_complete events (the 3rd param) \* complete. \* \*/ int ret = io\_uring\_enter(s->ring\_fd, 1,1, IORING\_ENTER\_GETEVENTS); if(ret < 0) { perror("io\_uring\_enter"); return 1; } return 0; } int main(int argc, char \*argv\[\]) { struct submitter \*s; if (argc < 2) { fprintf(stderr, "Usage: %s <filename>\\n", argv\[0\]); return 1; } s = malloc(sizeof(\*s)); if (!s) { perror("malloc"); return 1; } memset(s, 0, sizeof(\*s)); if(app\_setup\_uring(s)) { fprintf(stderr, "Unable to setup uring!\\n"); return 1; } for (int i = 1; i < argc; i++) { if(submit\_to\_sq(argv\[i\], s)) { fprintf(stderr, "Error reading file\\n"); return 1; } read\_from\_cq(s); } return 0; }

#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <sys/ioctl.h>
#include <sys/syscall.h>
#include <sys/mman.h>
#include <sys/uio.h>
#include <linux/fs.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

/* If your compilation fails because the header file below is missing,
 * your kernel is probably too old to support io_uring.
 * */
#include <linux/io_uring.h>

#define QUEUE_DEPTH 1
#define BLOCK_SZ    1024

/* This is x86 specific */
#define read_barrier()  __asm__ __volatile__("":::"memory")
#define write_barrier() __asm__ __volatile__("":::"memory")

struct app_io_sq_ring {
    unsigned *head;
    unsigned *tail;
    unsigned *ring_mask;
    unsigned *ring_entries;
    unsigned *flags;
    unsigned *array;
};

struct app_io_cq_ring {
    unsigned *head;
    unsigned *tail;
    unsigned *ring_mask;
    unsigned *ring_entries;
    struct io_uring_cqe *cqes;
};

struct submitter {
    int ring_fd;
    struct app_io_sq_ring sq_ring;
    struct io_uring_sqe *sqes;
    struct app_io_cq_ring cq_ring;
};

struct file_info {
    off_t file_sz;
    struct iovec iovecs[];      /* Referred by readv/writev */
};

/*
 * This code is written in the days when io_uring-related system calls are not
 * part of standard C libraries. So, we roll our own system call wrapper
 * functions.
 * */

int io_uring_setup(unsigned entries, struct io_uring_params *p)
{
    return (int) syscall(__NR_io_uring_setup, entries, p);
}

int io_uring_enter(int ring_fd, unsigned int to_submit,
                          unsigned int min_complete, unsigned int flags)
{
    return (int) syscall(__NR_io_uring_enter, ring_fd, to_submit, min_complete,
                   flags, NULL, 0);
}

/*
 * Returns the size of the file whose open file descriptor is passed in.
 * Properly handles regular file and block devices as well. Pretty.
 * */

off_t get_file_size(int fd) {
    struct stat st;

    if(fstat(fd, &st) < 0) {
        perror("fstat");
        return -1;
    }
    if (S_ISBLK(st.st_mode)) {
        unsigned long long bytes;
        if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) {
            perror("ioctl");
            return -1;
        }
        return bytes;
    } else if (S_ISREG(st.st_mode))
        return st.st_size;

    return -1;
}

/*
 * io_uring requires a lot of setup which looks pretty hairy, but isn't all
 * that difficult to understand. Because of all this boilerplate code,
 * io_uring's author has created liburing, which is relatively easy to use.
 * However, you should take your time and understand this code. It is always
 * good to know how it all works underneath. Apart from bragging rights,
 * it does offer you a certain strange geeky peace.
 * */

int app_setup_uring(struct submitter *s) {
    struct app_io_sq_ring *sring = &s->sq_ring;
    struct app_io_cq_ring *cring = &s->cq_ring;
    struct io_uring_params p;
    void *sq_ptr, *cq_ptr;

    /*
     * We need to pass in the io_uring_params structure to the io_uring_setup()
     * call zeroed out. We could set any flags if we need to, but for this
     * example, we don't.
     * */
    memset(&p, 0, sizeof(p));
    s->ring_fd = io_uring_setup(QUEUE_DEPTH, &p);
    if (s->ring_fd < 0) {
        perror("io_uring_setup");
        return 1;
    }

    /*
     * io_uring communication happens via 2 shared kernel-user space ring buffers,
     * which can be jointly mapped with a single mmap() call in recent kernels. 
     * While the completion queue is directly manipulated, the submission queue 
     * has an indirection array in between. We map that in as well.
     * */

    int sring_sz = p.sq_off.array + p.sq_entries * sizeof(unsigned);
    int cring_sz = p.cq_off.cqes + p.cq_entries * sizeof(struct io_uring_cqe);

    /* In kernel version 5.4 and above, it is possible to map the submission and 
     * completion buffers with a single mmap() call. Rather than check for kernel 
     * versions, the recommended way is to just check the features field of the 
     * io_uring_params structure, which is a bit mask. If the 
     * IORING_FEAT_SINGLE_MMAP is set, then we can do away with the second mmap()
     * call to map the completion ring.
     * */
    if (p.features & IORING_FEAT_SINGLE_MMAP) {
        if (cring_sz > sring_sz) {
            sring_sz = cring_sz;
        }
        cring_sz = sring_sz;
    }

    /* Map in the submission and completion queue ring buffers.
     * Older kernels only map in the submission queue, though.
     * */
    sq_ptr = mmap(0, sring_sz, PROT_READ | PROT_WRITE, 
            MAP_SHARED | MAP_POPULATE,
            s->ring_fd, IORING_OFF_SQ_RING);
    if (sq_ptr == MAP_FAILED) {
        perror("mmap");
        return 1;
    }

    if (p.features & IORING_FEAT_SINGLE_MMAP) {
        cq_ptr = sq_ptr;
    } else {
        /* Map in the completion queue ring buffer in older kernels separately */
        cq_ptr = mmap(0, cring_sz, PROT_READ | PROT_WRITE, 
                MAP_SHARED | MAP_POPULATE,
                s->ring_fd, IORING_OFF_CQ_RING);
        if (cq_ptr == MAP_FAILED) {
            perror("mmap");
            return 1;
        }
    }
    /* Save useful fields in a global app_io_sq_ring struct for later
     * easy reference */
    sring->head = sq_ptr + p.sq_off.head;
    sring->tail = sq_ptr + p.sq_off.tail;
    sring->ring_mask = sq_ptr + p.sq_off.ring_mask;
    sring->ring_entries = sq_ptr + p.sq_off.ring_entries;
    sring->flags = sq_ptr + p.sq_off.flags;
    sring->array = sq_ptr + p.sq_off.array;

    /* Map in the submission queue entries array */
    s->sqes = mmap(0, p.sq_entries * sizeof(struct io_uring_sqe),
            PROT_READ | PROT_WRITE, MAP_SHARED | MAP_POPULATE,
            s->ring_fd, IORING_OFF_SQES);
    if (s->sqes == MAP_FAILED) {
        perror("mmap");
        return 1;
    }

    /* Save useful fields in a global app_io_cq_ring struct for later
     * easy reference */
    cring->head = cq_ptr + p.cq_off.head;
    cring->tail = cq_ptr + p.cq_off.tail;
    cring->ring_mask = cq_ptr + p.cq_off.ring_mask;
    cring->ring_entries = cq_ptr + p.cq_off.ring_entries;
    cring->cqes = cq_ptr + p.cq_off.cqes;

    return 0;
}

/*
 * Output a string of characters of len length to stdout.
 * We use buffered output here to be efficient,
 * since we need to output character-by-character.
 * */
void output_to_console(char *buf, int len) {
    while (len--) {
        fputc(*buf++, stdout);
    }
}

/*
 * Read from completion queue.
 * In this function, we read completion events from the completion queue, get
 * the data buffer that will have the file data and print it to the console.
 * */

void read_from_cq(struct submitter *s) {
    struct file_info *fi;
    struct app_io_cq_ring *cring = &s->cq_ring;
    struct io_uring_cqe *cqe;
    unsigned head, reaped = 0;

    head = *cring->head;

    do {
        read_barrier();
        /*
         * Remember, this is a ring buffer. If head == tail, it means that the
         * buffer is empty.
         * */
        if (head == *cring->tail)
            break;

        /* Get the entry */
        cqe = &cring->cqes[head & *s->cq_ring.ring_mask];
        fi = (struct file_info*) cqe->user_data;
        if (cqe->res < 0)
            fprintf(stderr, "Error: %s\n", strerror(abs(cqe->res)));

        int blocks = (int) fi->file_sz / BLOCK_SZ;
        if (fi->file_sz % BLOCK_SZ) blocks++;

        for (int i = 0; i < blocks; i++)
            output_to_console(fi->iovecs[i].iov_base, fi->iovecs[i].iov_len);

        head++;
    } while (1);

    *cring->head = head;
    write_barrier();
}
/*
 * Submit to submission queue.
 * In this function, we submit requests to the submission queue. You can submit
 * many types of requests. Ours is going to be the readv() request, which we
 * specify via IORING_OP_READV.
 *
 * */
int submit_to_sq(char *file_path, struct submitter *s) {
    struct file_info *fi;

    int file_fd = open(file_path, O_RDONLY);
    if (file_fd < 0 ) {
        perror("open");
        return 1;
    }

    struct app_io_sq_ring *sring = &s->sq_ring;
    unsigned index = 0, current_block = 0, tail = 0, next_tail = 0;

    off_t file_sz = get_file_size(file_fd);
    if (file_sz < 0)
        return 1;
    off_t bytes_remaining = file_sz;
    int blocks = (int) file_sz / BLOCK_SZ;
    if (file_sz % BLOCK_SZ) blocks++;

    fi = malloc(sizeof(*fi) + sizeof(struct iovec) * blocks);
    if (!fi) {
        fprintf(stderr, "Unable to allocate memory\n");
        return 1;
    }
    fi->file_sz = file_sz;

    /*
     * For each block of the file we need to read, we allocate an iovec struct
     * which is indexed into the iovecs array. This array is passed in as part
     * of the submission. If you don't understand this, then you need to look
     * up how the readv() and writev() system calls work.
     * */
    while (bytes_remaining) {
        off_t bytes_to_read = bytes_remaining;
        if (bytes_to_read > BLOCK_SZ)
            bytes_to_read = BLOCK_SZ;

        fi->iovecs[current_block].iov_len = bytes_to_read;

        void *buf;
        if( posix_memalign(&buf, BLOCK_SZ, BLOCK_SZ)) {
            perror("posix_memalign");
            return 1;
        }
        fi->iovecs[current_block].iov_base = buf;

        current_block++;
        bytes_remaining -= bytes_to_read;
    }

    /* Add our submission queue entry to the tail of the SQE ring buffer */
    next_tail = tail = *sring->tail;
    next_tail++;
    read_barrier();
    index = tail & *s->sq_ring.ring_mask;
    struct io_uring_sqe *sqe = &s->sqes[index];
    sqe->fd = file_fd;
    sqe->flags = 0;
    sqe->opcode = IORING_OP_READV;
    sqe->addr = (unsigned long) fi->iovecs;
    sqe->len = blocks;
    sqe->off = 0;
    sqe->user_data = (unsigned long long) fi;
    sring->array[index] = index;
    tail = next_tail;

    /* Update the tail so the kernel can see it. */
    if(*sring->tail != tail) {
        *sring->tail = tail;
        write_barrier();
    }

    /*
     * Tell the kernel we have submitted events with the io_uring_enter() system
     * call. We also pass in the IOURING_ENTER_GETEVENTS flag which causes the
     * io_uring_enter() call to wait until min_complete events (the 3rd param)
     * complete.
     * */
    int ret =  io_uring_enter(s->ring_fd, 1,1,
            IORING_ENTER_GETEVENTS);
    if(ret < 0) {
        perror("io_uring_enter");
        return 1;
    }

    return 0;
}

int main(int argc, char *argv[]) {
    struct submitter *s;

    if (argc < 2) {
        fprintf(stderr, "Usage: %s <filename>\n", argv[0]);
        return 1;
    }

    s = malloc(sizeof(*s));
    if (!s) {
        perror("malloc");
        return 1;
    }
    memset(s, 0, sizeof(*s));

    if(app_setup_uring(s)) {
        fprintf(stderr, "Unable to setup uring!\n");
        return 1;
    }

    for (int i = 1; i < argc; i++) {
        if(submit_to_sq(argv[i], s)) {
            fprintf(stderr, "Error reading file\n");
            return 1;
        }
        read_from_cq(s);
    }

    return 0;
}

#### The initial setup

From `main()`, we call `app_setup_uring()`, which does the initialization work required for us to use `io_uring`. First, we call the `io_uring_setup()` system call with the queue depth we require and an instance of the structure `io_uring_params` all set to zero. When the call returns, the kernel would have filled up values in the members of this structure. This is how `io_uring_params` looks like:

struct io\_sqring\_offsets sq\_off;

struct io\_cqring\_offsets cq\_off;

struct io\_uring\_params { \_\_u32 sq\_entries; \_\_u32 cq\_entries; \_\_u32 flags; \_\_u32 sq\_thread\_cpu; \_\_u32 sq\_thread\_idle; \_\_u32 resv\[5\]; struct io\_sqring\_offsets sq\_off; struct io\_cqring\_offsets cq\_off; };

struct io_uring_params {
	__u32 sq_entries;
	__u32 cq_entries;
	__u32 flags;
	__u32 sq_thread_cpu;
	__u32 sq_thread_idle;
	__u32 resv[5];
	struct io_sqring_offsets sq_off;
	struct io_cqring_offsets cq_off;
};

The only thing you can specify before passing this structure as part of the `io_uring_setup()` system call is the `flags` structure member, but in this example, there is no flag we want to pass. Also, in this example, we process the files one after the other. We are not going to do any parallel I/O since this is a simple example designed mainly to get an understanding of `io_uring`. To this end, we set the queue depth to just one.

The return value from `io_uring_setup()`, a file descriptor and other fields from the `io_uring_param` structure will subsequently used in calls to `mmap()` to map into user space two ring buffers and an array of submission queue entries. Take a look. I’ve removed some surrounding code to focus on the `mmap()`s.

/\* Map in the submission and completion queue ring buffers.

 \* Older kernels only map in the submission queue, though.

 sq\_ptr = mmap(0, sring\_sz, PROT\_READ | PROT\_WRITE, 

 MAP\_SHARED | MAP\_POPULATE,

 s-\>ring\_fd, IORING\_OFF\_SQ\_RING);

if (sq\_ptr == MAP\_FAILED) {

if (p.features & IORING\_FEAT\_SINGLE\_MMAP) {

/\* Map in the completion queue ring buffer in older kernels separately \*/

 cq\_ptr = mmap(0, cring\_sz, PROT\_READ | PROT\_WRITE, 

 MAP\_SHARED | MAP\_POPULATE,

 s-\>ring\_fd, IORING\_OFF\_CQ\_RING);

if (cq\_ptr == MAP\_FAILED) {

/\* Map in the submission queue entries array \*/

 s-\>sqes = mmap(0, p.sq\_entries \* sizeof(struct io\_uring\_sqe),

 PROT\_READ | PROT\_WRITE, MAP\_SHARED | MAP\_POPULATE,

 s-\>ring\_fd, IORING\_OFF\_SQES);

 /\* Map in the submission and completion queue ring buffers. \* Older kernels only map in the submission queue, though. \* \*/ sq\_ptr = mmap(0, sring\_sz, PROT\_READ | PROT\_WRITE, MAP\_SHARED | MAP\_POPULATE, s->ring\_fd, IORING\_OFF\_SQ\_RING); if (sq\_ptr == MAP\_FAILED) { perror("mmap"); return 1; } if (p.features & IORING\_FEAT\_SINGLE\_MMAP) { cq\_ptr = sq\_ptr; } else { /\* Map in the completion queue ring buffer in older kernels separately \*/ cq\_ptr = mmap(0, cring\_sz, PROT\_READ | PROT\_WRITE, MAP\_SHARED | MAP\_POPULATE, s->ring\_fd, IORING\_OFF\_CQ\_RING); if (cq\_ptr == MAP\_FAILED) { perror("mmap"); return 1; } } /\* Map in the submission queue entries array \*/ s->sqes = mmap(0, p.sq\_entries \* sizeof(struct io\_uring\_sqe), PROT\_READ | PROT\_WRITE, MAP\_SHARED | MAP\_POPULATE, s->ring\_fd, IORING\_OFF\_SQES);

    /* Map in the submission and completion queue ring buffers.
     * Older kernels only map in the submission queue, though.
     * */
    sq_ptr = mmap(0, sring_sz, PROT_READ | PROT_WRITE, 
            MAP_SHARED | MAP_POPULATE,
            s->ring_fd, IORING_OFF_SQ_RING);
    if (sq_ptr == MAP_FAILED) {
        perror("mmap");
        return 1;
    }

    if (p.features & IORING_FEAT_SINGLE_MMAP) {
        cq_ptr = sq_ptr;
    } else {
        /* Map in the completion queue ring buffer in older kernels separately */
        cq_ptr = mmap(0, cring_sz, PROT_READ | PROT_WRITE, 
                MAP_SHARED | MAP_POPULATE,
                s->ring_fd, IORING_OFF_CQ_RING);
        if (cq_ptr == MAP_FAILED) {
            perror("mmap");
            return 1;
        }
    }

    /* Map in the submission queue entries array */
    s->sqes = mmap(0, p.sq_entries * sizeof(struct io_uring_sqe),
            PROT_READ | PROT_WRITE, MAP_SHARED | MAP_POPULATE,
            s->ring_fd, IORING_OFF_SQES);

We save important details in our structs `app_io_sq_ring` and `app_io_cq_ring` for easy reference later. While we map the two ring buffers for submission and completion each, you might be wondering what the 2nd mapping is for. While the completion queue ring directly indexes the shared array of CQEs, the submission ring has an indirection array in between. The submission side ring buffer is an index into this array, which in turn contains the index into the SQEs. This is useful for certain applications that embed submission requests inside of internal data structures. This setup allows them to submit multiple submission entries in one go while allowing them to adopt `io_uring` more easily.

Note: In kernel versions 5.4 and above a single `mmap()` maps both the submission and completion queues. In older kernels however, they need to be mapped in separately. Rather than checking for kernel version, you can check for the ability of the kernel to map both queues with one `mmap()` by checking for the `IORING_FEAT_SINGLE_MMAP` feature flag as we do in the code above.

#### Dealing with the shared ring buffers

In regular programming, we’re used to dealing with a very clear interface between user-space and the kernel: the system call. However, system calls do have a cost and for high-performance interfaces like `io_uring`, want to do away with them as much as they can. We saw earlier that rather than making multiple system calls as we normally do, using `io_uring` allows us to batch many I/O requests and make a single call to the `io_uring_enter()` system call. Or in polling mode, even that call isn’t required. 

When reading or updating the shared ring buffers from user space, there is some care that needs to be taken to ensure that when reading, you are seeing the latest data and after updating, you are “flushing” or “syncing” writes so that the kernel sees your updates. This is due to fact the the CPU can reorder reads and writes and so can the compiler. This is typically not a problem when this is happening on the same CPU. But in the case of `io_uring`, when there is a shared buffer involved across two different contexts: user space and kernel and these can run on different CPUs after a context switch. You need to ensure from user space that before you read, previous writes are visible. Or when you fill up details in an SQE and update the tail of the submission ring buffer, you want to ensure that the writes you made to the members of the SQE are ordered before the write that updates the ring buffer’s tail. If these writes aren’t ordered, the kernel might see the tail updated, but when it reads the SQE, it might not find all the data it needs at the time it reads it. In polling mode, where the kernel is looking for changes to the tail, this becomes a real problem. This is all because of how CPUs and compilers reorder reads and writes for optimization.

#### Reading a completion queue entry

As always, we take up the completion side of things first since it is simpler than its submission counterpart. These explanations are even required because we need to discuss memory ordering and how we need to deal with it. Otherwise, we’re seeing how to deal with ring buffers. For completion events, the kernel adds CQEs to the ring buffer and updates the tail, while we read from the head in user space. As in any ring buffer, if the head and the tail are equal, it means the ring buffer is empty. Take a look at the code below:

read\_barrier(); /\* ensure previous writes are visible \*/

if (head != cqring-\>tail) {

/\* There is data available in the ring buffer \*/

struct io\_uring\_cqe \*cqe;

 index = head & (cqring-\>mask);

 cqe = &cqring-\>cqes\[index\];

/\* process completed cqe here \*/

/\* we've now consumed this entry \*/

unsigned head; head = cqring->head; read\_barrier(); /\* ensure previous writes are visible \*/ if (head != cqring->tail) { /\* There is data available in the ring buffer \*/ struct io\_uring\_cqe \*cqe; unsigned index; index = head & (cqring->mask); cqe = &cqring->cqes\[index\]; /\* process completed cqe here \*/ ... /\* we've now consumed this entry \*/ head++; } cqring->head = head; write\_barrier();

unsigned head;
head = cqring->head;
read_barrier(); /* ensure previous writes are visible */
if (head != cqring->tail) {
    /* There is data available in the ring buffer */
    struct io_uring_cqe *cqe;
    unsigned index;
    index = head & (cqring->mask);
    cqe = &cqring->cqes[index];
    /* process completed cqe here */
     ...
    /* we've now consumed this entry */
    head++;
}
cqring->head = head;
write_barrier();

To get the index of the head, the application needs to mask head with the size mask of the ring buffer. Remember that any line in the code above could be running after a context switch. So, right before the comparison, we have a `read_barrier()` so that, if the kernel has indeed updated the tail, we can read it as part of our comparison in the `if` statement. Once we get the CQE and process it, we update the head letting the kernel know that we’ve consumed an entry from the ring buffer. The final `write_barrier()` ensures that writes we do become visible so that the kernel knows about it.

#### Making a submission

Making a submission is the opposite of reading a completion. While in the completion the kernel added entries to the tail and we read an entry off the head of the ring buffer, when making a submission, we add to the tail and kernel reads entries off the head of the ring buffer. 

struct io\_uring\_sqe \*sqe;

index = tail & (\*sqring-\>ring\_mask);

sqe = &sqring→sqes\[index\];

/\* this function call fills in the SQE details for this IO request \*/

/\* fill the SQE index into the SQ ring array \*/

sqring-\>array\[index\] \= index;

struct io\_uring\_sqe \*sqe; unsigned tail, index; tail = sqring->tail; index = tail & (\*sqring->ring\_mask); sqe = &sqring→sqes\[index\]; /\* this function call fills in the SQE details for this IO request \*/ app\_init\_io(sqe); /\* fill the SQE index into the SQ ring array \*/ sqring->array\[index\] = index; tail++; write\_barrier(); sqring->tail = tail; write\_barrier();

struct io_uring_sqe *sqe;
unsigned tail, index;
tail = sqring->tail;
index = tail & (*sqring->ring_mask);
sqe = &sqring→sqes[index];
/* this function call fills in the SQE details for this IO request */
app_init_io(sqe);
/* fill the SQE index into the SQ ring array */
sqring->array[index] = index;
tail++;
write_barrier();
sqring->tail = tail;
write_barrier();

In the code snippet above, the `app_init_io()` function in the application fills up details of the request for submission. Before the tail is updated, we have a `write_barrier()` to ensure that the previous writes are ordered before we update the tail. Then we update the tail and call `write_barrier()` once more to ensure that our update is seen. We’re lining up our ducks here.

## Cat with liburing

We saw that building something as simple as a program that reads a file may not be as straightforward with `io_uring`. It turns out it is more code than a program that reads files with synchronous I/O. But if you analyze the code for `cat_uring`, you’ll realize that bulk of the code there is boilerplate code that can be easily hidden away in a separate file and it shouldn’t bother with application logic. In any case, we’re learning low-level `io_uring` details on purpose for better understanding of how it works. But if you ever plan to use `io_uring` in a real application you’re building, you should probably not use the raw interface directly. You should instead use `liburing`, which is a nice, high-level wrapper on top of `io_uring`.

Let’s now look at how a functionally similar program to `cat_uring` can be implemented using `liburing`. We’ll call this `cat_liburing`.

struct iovec iovecs\[\]; /\* Referred by readv/writev \*/

\* Returns the size of the file whose open file descriptor is passed in.

\* Properly handles regular file and block devices as well. Pretty.

off\_t get\_file\_size(int fd) {

if (S\_ISBLK(st.st\_mode)) {

unsigned long long bytes;

if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) {

} else if (S\_ISREG(st.st\_mode))

 \* Output a string of characters of len length to stdout.

 \* We use buffered output here to be efficient,

 \* since we need to output character-by-character.

void output\_to\_console(char \*buf, int len) {

 \* Wait for a completion to be available, fetch the data from

 \* the readv operation and print it to the console.

int get\_completion\_and\_print(struct io\_uring \*ring) {

struct io\_uring\_cqe \*cqe;

int ret = io\_uring\_wait\_cqe(ring, &cqe);

perror("io\_uring\_wait\_cqe");

fprintf(stderr, "Async readv failed.\\n");

struct file\_info \*fi = io\_uring\_cqe\_get\_data(cqe);

int blocks = (int) fi-\>file\_sz / BLOCK\_SZ;

if (fi-\>file\_sz % BLOCK\_SZ) blocks++;

for (int i = 0; i < blocks; i ++)

output\_to\_console(fi-\>iovecs\[i\].iov\_base, fi-\>iovecs\[i\].iov\_len);

io\_uring\_cqe\_seen(ring, cqe);

 \* Submit the readv request via liburing

int submit\_read\_request(char \*file\_path, struct io\_uring \*ring) {

int file\_fd = open(file\_path, O\_RDONLY);

 off\_t file\_sz = get\_file\_size(file\_fd);

 off\_t bytes\_remaining = file\_sz;

int blocks = (int) file\_sz / BLOCK\_SZ;

if (file\_sz % BLOCK\_SZ) blocks++;

struct file\_info \*fi = malloc(sizeof(\*fi) +

(sizeof(struct iovec) \* blocks));

 \* For each block of the file we need to read, we allocate an iovec struct

 \* which is indexed into the iovecs array. This array is passed in as part

 \* of the submission. If you don't understand this, then you need to look

 \* up how the readv() and writev() system calls work.

while (bytes\_remaining) {

 off\_t bytes\_to\_read = bytes\_remaining;

if (bytes\_to\_read \> BLOCK\_SZ)

 bytes\_to\_read = BLOCK\_SZ;

 fi-\>iovecs\[current\_block\].iov\_len \= bytes\_to\_read;

if( posix\_memalign(&buf, BLOCK\_SZ, BLOCK\_SZ)) {

perror("posix\_memalign");

 fi-\>iovecs\[current\_block\].iov\_base \= buf;

 bytes\_remaining -= bytes\_to\_read;

struct io\_uring\_sqe \*sqe = io\_uring\_get\_sqe(ring);

/\* Setup a readv operation \*/

io\_uring\_prep\_readv(sqe, file\_fd, fi-\>iovecs, blocks, 0);

io\_uring\_sqe\_set\_data(sqe, fi);

/\* Finally, submit the request \*/

int main(int argc, char \*argv\[\]) {

fprintf(stderr, "Usage: %s \[file name\] <\[file name\] ...>\\n",

/\* Initialize io\_uring \*/

io\_uring\_queue\_init(QUEUE\_DEPTH, &ring, 0);

for (int i = 1; i < argc; i++) {

int ret = submit\_read\_request(argv\[i\], &ring);

fprintf(stderr, "Error reading file: %s\\n", argv\[i\]);

get\_completion\_and\_print(&ring);

/\* Call the clean-up function. \*/

io\_uring\_queue\_exit(&ring);

#include <fcntl.h> #include <stdio.h> #include <string.h> #include <sys/stat.h> #include <sys/ioctl.h> #include <liburing.h> #include <stdlib.h> #define QUEUE\_DEPTH 1 #define BLOCK\_SZ 1024 struct file\_info { off\_t file\_sz; struct iovec iovecs\[\]; /\* Referred by readv/writev \*/ }; /\* \* Returns the size of the file whose open file descriptor is passed in. \* Properly handles regular file and block devices as well. Pretty. \* \*/ off\_t get\_file\_size(int fd) { struct stat st; if(fstat(fd, &st) < 0) { perror("fstat"); return -1; } if (S\_ISBLK(st.st\_mode)) { unsigned long long bytes; if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) { perror("ioctl"); return -1; } return bytes; } else if (S\_ISREG(st.st\_mode)) return st.st\_size; return -1; } /\* \* Output a string of characters of len length to stdout. \* We use buffered output here to be efficient, \* since we need to output character-by-character. \* \*/ void output\_to\_console(char \*buf, int len) { while (len--) { fputc(\*buf++, stdout); } } /\* \* Wait for a completion to be available, fetch the data from \* the readv operation and print it to the console. \* \*/ int get\_completion\_and\_print(struct io\_uring \*ring) { struct io\_uring\_cqe \*cqe; int ret = io\_uring\_wait\_cqe(ring, &cqe); if (ret < 0) { perror("io\_uring\_wait\_cqe"); return 1; } if (cqe->res < 0) { fprintf(stderr, "Async readv failed.\\n"); return 1; } struct file\_info \*fi = io\_uring\_cqe\_get\_data(cqe); int blocks = (int) fi->file\_sz / BLOCK\_SZ; if (fi->file\_sz % BLOCK\_SZ) blocks++; for (int i = 0; i < blocks; i ++) output\_to\_console(fi->iovecs\[i\].iov\_base, fi->iovecs\[i\].iov\_len); io\_uring\_cqe\_seen(ring, cqe); return 0; } /\* \* Submit the readv request via liburing \* \*/ int submit\_read\_request(char \*file\_path, struct io\_uring \*ring) { int file\_fd = open(file\_path, O\_RDONLY); if (file\_fd < 0) { perror("open"); return 1; } off\_t file\_sz = get\_file\_size(file\_fd); off\_t bytes\_remaining = file\_sz; off\_t offset = 0; int current\_block = 0; int blocks = (int) file\_sz / BLOCK\_SZ; if (file\_sz % BLOCK\_SZ) blocks++; struct file\_info \*fi = malloc(sizeof(\*fi) + (sizeof(struct iovec) \* blocks)); /\* \* For each block of the file we need to read, we allocate an iovec struct \* which is indexed into the iovecs array. This array is passed in as part \* of the submission. If you don't understand this, then you need to look \* up how the readv() and writev() system calls work. \* \*/ while (bytes\_remaining) { off\_t bytes\_to\_read = bytes\_remaining; if (bytes\_to\_read > BLOCK\_SZ) bytes\_to\_read = BLOCK\_SZ; offset += bytes\_to\_read; fi->iovecs\[current\_block\].iov\_len = bytes\_to\_read; void \*buf; if( posix\_memalign(&buf, BLOCK\_SZ, BLOCK\_SZ)) { perror("posix\_memalign"); return 1; } fi->iovecs\[current\_block\].iov\_base = buf; current\_block++; bytes\_remaining -= bytes\_to\_read; } fi->file\_sz = file\_sz; /\* Get an SQE \*/ struct io\_uring\_sqe \*sqe = io\_uring\_get\_sqe(ring); /\* Setup a readv operation \*/ io\_uring\_prep\_readv(sqe, file\_fd, fi->iovecs, blocks, 0); /\* Set user data \*/ io\_uring\_sqe\_set\_data(sqe, fi); /\* Finally, submit the request \*/ io\_uring\_submit(ring); return 0; } int main(int argc, char \*argv\[\]) { struct io\_uring ring; if (argc < 2) { fprintf(stderr, "Usage: %s \[file name\] <\[file name\] ...>\\n", argv\[0\]); return 1; } /\* Initialize io\_uring \*/ io\_uring\_queue\_init(QUEUE\_DEPTH, &ring, 0); for (int i = 1; i < argc; i++) { int ret = submit\_read\_request(argv\[i\], &ring); if (ret) { fprintf(stderr, "Error reading file: %s\\n", argv\[i\]); return 1; } get\_completion\_and\_print(&ring); } /\* Call the clean-up function. \*/ io\_uring\_queue\_exit(&ring); return 0; }

#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/ioctl.h>
#include <liburing.h>
#include <stdlib.h>

#define QUEUE_DEPTH 1
#define BLOCK_SZ    1024

struct file_info {
    off_t file_sz;
    struct iovec iovecs[];      /* Referred by readv/writev */
};

/*
* Returns the size of the file whose open file descriptor is passed in.
* Properly handles regular file and block devices as well. Pretty.
* */

off_t get_file_size(int fd) {
    struct stat st;

    if(fstat(fd, &st) < 0) {
        perror("fstat");
        return -1;
    }
    if (S_ISBLK(st.st_mode)) {
        unsigned long long bytes;
        if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) {
            perror("ioctl");
            return -1;
        }
        return bytes;
    } else if (S_ISREG(st.st_mode))
        return st.st_size;

    return -1;
}

/*
 * Output a string of characters of len length to stdout.
 * We use buffered output here to be efficient,
 * since we need to output character-by-character.
 * */
void output_to_console(char *buf, int len) {
    while (len--) {
        fputc(*buf++, stdout);
    }
}

/*
 * Wait for a completion to be available, fetch the data from
 * the readv operation and print it to the console.
 * */

int get_completion_and_print(struct io_uring *ring) {
    struct io_uring_cqe *cqe;
    int ret = io_uring_wait_cqe(ring, &cqe);
    if (ret < 0) {
        perror("io_uring_wait_cqe");
        return 1;
    }
    if (cqe->res < 0) {
        fprintf(stderr, "Async readv failed.\n");
        return 1;
    }
    struct file_info *fi = io_uring_cqe_get_data(cqe);
    int blocks = (int) fi->file_sz / BLOCK_SZ;
    if (fi->file_sz % BLOCK_SZ) blocks++;
    for (int i = 0; i < blocks; i ++)
        output_to_console(fi->iovecs[i].iov_base, fi->iovecs[i].iov_len);

    io_uring_cqe_seen(ring, cqe);
    return 0;
}

/*
 * Submit the readv request via liburing
 * */

int submit_read_request(char *file_path, struct io_uring *ring) {
    int file_fd = open(file_path, O_RDONLY);
    if (file_fd < 0) {
        perror("open");
        return 1;
    }
    off_t file_sz = get_file_size(file_fd);
    off_t bytes_remaining = file_sz;
    off_t offset = 0;
    int current_block = 0;
    int blocks = (int) file_sz / BLOCK_SZ;
    if (file_sz % BLOCK_SZ) blocks++;
    struct file_info *fi = malloc(sizeof(*fi) +
                                          (sizeof(struct iovec) * blocks));

    /*
     * For each block of the file we need to read, we allocate an iovec struct
     * which is indexed into the iovecs array. This array is passed in as part
     * of the submission. If you don't understand this, then you need to look
     * up how the readv() and writev() system calls work.
     * */
    while (bytes_remaining) {
        off_t bytes_to_read = bytes_remaining;
        if (bytes_to_read > BLOCK_SZ)
            bytes_to_read = BLOCK_SZ;

        offset += bytes_to_read;
        fi->iovecs[current_block].iov_len = bytes_to_read;

        void *buf;
        if( posix_memalign(&buf, BLOCK_SZ, BLOCK_SZ)) {
            perror("posix_memalign");
            return 1;
        }
        fi->iovecs[current_block].iov_base = buf;

        current_block++;
        bytes_remaining -= bytes_to_read;
    }
    fi->file_sz = file_sz;

    /* Get an SQE */
    struct io_uring_sqe *sqe = io_uring_get_sqe(ring);
    /* Setup a readv operation */
    io_uring_prep_readv(sqe, file_fd, fi->iovecs, blocks, 0);
    /* Set user data */
    io_uring_sqe_set_data(sqe, fi);
    /* Finally, submit the request */
    io_uring_submit(ring);

    return 0;
}

int main(int argc, char *argv[]) {
    struct io_uring ring;

    if (argc < 2) {
        fprintf(stderr, "Usage: %s [file name] <[file name] ...>\n",
                argv[0]);
        return 1;
    }

    /* Initialize io_uring */
    io_uring_queue_init(QUEUE_DEPTH, &ring, 0);

    for (int i = 1; i < argc; i++) {
        int ret = submit_read_request(argv[i], &ring);
        if (ret) {
            fprintf(stderr, "Error reading file: %s\n", argv[i]);
            return 1;
        }
        get_completion_and_print(&ring);
    }

    /* Call the clean-up function. */
    io_uring_queue_exit(&ring);
    return 0;
}

Let’s compare the number of lines each of these implementations took:

* Regular cat: \~120 lines
* Cat with raw io\_uring: \~360 lines
* Cat with liburing: \~160 lines

Now, that’s some real reduction in the number of lines of code with `liburing`. And with all the boilerplate code out of the way, the logic pops out. Let’s run through that quickly. We initialize `io_uring` like this:

io\_uring\_queue\_init(QUEUE\_DEPTH, &ring, 0);

io\_uring\_queue\_init(QUEUE\_DEPTH, &ring, 0);

io_uring_queue_init(QUEUE_DEPTH, &ring, 0);

In the function `submit_read_request()`, we get an SQE, prepare it for a `readv` operation and submit it.

struct io\_uring\_sqe \*sqe = io\_uring\_get\_sqe(ring);

/\* Setup a readv operation \*/

io\_uring\_prep\_readv(sqe, file\_fd, fi-\>iovecs, blocks, 0);

io\_uring\_sqe\_set\_data(sqe, fi);

/\* Finally, submit the request \*/

 /\* Get an SQE \*/ struct io\_uring\_sqe \*sqe = io\_uring\_get\_sqe(ring); /\* Setup a readv operation \*/ io\_uring\_prep\_readv(sqe, file\_fd, fi->iovecs, blocks, 0); /\* Set user data \*/ io\_uring\_sqe\_set\_data(sqe, fi); /\* Finally, submit the request \*/ io\_uring\_submit(ring);

    /* Get an SQE */
    struct io_uring_sqe *sqe = io_uring_get_sqe(ring);
    /* Setup a readv operation */
    io_uring_prep_readv(sqe, file_fd, fi->iovecs, blocks, 0);
    /* Set user data */
    io_uring_sqe_set_data(sqe, fi);
    /* Finally, submit the request */
    io_uring_submit(ring);

We wait for a completion event and get the user data we set on the submission side like this:

struct io\_uring\_cqe \*cqe;

int ret = io\_uring\_wait\_cqe(ring, &cqe);

struct file\_info \*fi = io\_uring\_cqe\_get\_data(cqe);

 struct io\_uring\_cqe \*cqe; int ret = io\_uring\_wait\_cqe(ring, &cqe); struct file\_info \*fi = io\_uring\_cqe\_get\_data(cqe);

    struct io_uring_cqe *cqe;
    int ret = io_uring_wait_cqe(ring, &cqe);
    struct file_info *fi = io_uring_cqe_get_data(cqe);

Of course, this is so much more simpler to use compared to using the raw interface.

## Why all this trouble for async programming?

If you are going to be building something that deals with thousands or even hundreds of thousands of requests per hour, you need not bother with asynchronous I/O. Application frameworks that are designed around [thread-pool based architectures will serve you just fine](https://unixism.net/2019/04/28/linux-applications-performance-introduction/). But if you are looking at efficiently dealing with millions of requests per hour, you might want to look at asynchronous programming more closely. Asynchronous programming avoids the operating system’s thread/process context switching overhead by processing much of the I/O in a single thread. Read my [article series](https://unixism.net/2019/04/28/linux-applications-performance-introduction/) that take a deep look at various Linux process models your application can use–we do this by building web servers based on various process architectures from scratch.

### The trouble with regular files

Asynchronous programming on Linux, especially involving sockets is done with `select()`, `poll()` or `epoll`. While all these methods work really well for sockets, they don’t work very well for regular files. If you’re building a web server or a caching server, you will need to deal with regular files a lot and depending on the concurrency and speed of the storage, accessing regular files will block and slow down your server. For this reason, `libuv`, the library that powers NodeJS uses a separate set of threads to handle file I/O along with a few other things. From the [libuv documentation](http://docs.libuv.org/en/v1.x/design.html):

> Unlike network I/O, there are no platform-specific file I/O primitives libuv could rely on, so the current approach is to run blocking file I/O operations in a thread pool. 
> 
> libuv currently uses a global thread pool on which all loops can queue work. 3 types of operations are currently run on this pool: 
> 
> – File system operations 
> 
> – DNS functions (getaddrinfo and getnameinfo) 
> 
> – User specified code via uv\_queue\_work()

With `io_uring`, all operations irrespective of whether they operate on sockets or regular files are dealt with uniformly. There is no need for users to resort to tricks like using a thread pool to deal with file I/O. Read [this](https://blog.libtorrent.org/2012/10/asynchronous-disk-io/) for a more detailed analysis of asynchronous programming and file I/O.

## What’s next?

In this first part of this article series, we took a look at how to build an equivalent of Unix’s `cat` command in three different ways: synchronous, with the raw `io_uring` interface and with the high-level `liburing`. However, we limited ourselves to processing one single request at a time. We do read multiple files with our `cat` implementation, but when a request to read a file is submitted to `io_uring`, we wait until a completion entry is made available by the kernel, we read data from it, then move on to the next file repeating the process. We purposely kept the implementation simple so as to grasp how `io_uring` works. But the real power of `io_uring` comes from being able to process multiple requests at a time. To demonstrate this, [in part 2 of this article series](https://unixism.net/2020/04/io-uring-by-example-part-2-queuing-multiple-requests/), we’ll build a program to copy files while making `io_uring` take multiple requests, one per block of the file.

### Source code

The full source code for all the examples is available [here at Github](https://github.com/shuveb/io%5Furing-by-example).

## About me

My name is Shuveb Hussain and I’m the author of this Linux-focused blog. You can [follow me on Twitter](https://twitter.com/shuveb) where I post tech-related content mostly focusing on Linux, performance, scalability and cloud technologies.



# links
[Read on Omnivore](https://omnivore.app/me/io-uring-by-example-part-1-introduction-unixism-18cf51cccdb)
[Read Original](https://unixism.net/2020/04/io-uring-by-example-part-1-introduction/)

<iframe src="https://unixism.net/2020/04/io-uring-by-example-part-1-introduction/"  width="800" height="500"></iframe>
