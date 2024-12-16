---
id: a6ebe922-16f5-4820-a591-2df3a86df59b
title: "io_uring By Example: Part 2 - Queuing multiple requests - Unixism"
tags:
  - linux
  - programing
  - game_engine
  - c
  - networking
date: 2024-04-05 20:16:23
date_published: 2020-04-05 16:44:47
words_count: 1948
state: INBOX
---

# io_uring By Example: Part 2 - Queuing multiple requests - Unixism by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> This article is a part of a series on io_uring Series introduction Part 1: Introduction to io_uring. In this article we create cat_uring based on the raw io_uring interface and cat_liburing, built on the higher level liburing. Part 2: This article. Part 3: A web server written using io_uring. In part 1, we saw how… Continue reading io_uring By Example: Part 2 – Queuing multiple requests


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Unixism](https://unixism.net/)

 Of consoles and blinking cursors 

#### This article is a part of a series on `io_uring`

* [Series introduction](https://unixism.net/2020/04/io-uring-by-example-article-series/)
* [Part 1](https://unixism.net/2020/04/io-uring-by-example-part-1-introduction/): Introduction to `io_uring`. In this article we create `cat_uring` based on the raw `io_uring` interface and `cat_liburing`, built on the higher level `liburing.`
* [Part 2](https://unixism.net/2020/04/io-uring-by-example-part-2-queuing-multiple-requests/): This article.
* [Part 3](https://unixism.net/2020/04/io-uring-by-example-part-3-a-web-server-with-io-uring/): A web server written using `io_uring`.

In part 1, we saw how to build the equivalent of the Unix `cat` utility using both the raw `io_uring` interface and the high-level interface provided by `liburing`. We did not however queue more than one request at the same time in either of these examples. One of the life goals of `io_uring` is to be able to reduce the number of system calls required by letting users queue several operations at a time so that the kernel can pick those up in one swoop and process them without the program having to go through one or more system calls for each I/O request.

To that end, in this part, we build a copy program that copies files. It tries to be as efficient as possible by queuing as many requests as the queue depth will allow. Let’s see some code. To give credit where it is due, this is heavily based on [a program from the fio package](https://github.com/axboe/fio/blob/master/t/io%5Furing.c).

 off\_t first\_offset, offset;

static int setup\_context(unsigned entries, struct io\_uring \*ring) {

 ret = io\_uring\_queue\_init(entries, ring, 0);

fprintf(stderr, "queue\_init: %s\\n", strerror(\-ret));

static int get\_file\_size(int fd, off\_t \*size) {

if(S\_ISREG(st.st\_mode)) {

} else if (S\_ISBLK(st.st\_mode)) {

unsigned long long bytes;

if (ioctl(fd, BLKGETSIZE64, &bytes) != 0)

static void queue\_prepped(struct io\_uring \*ring, struct io\_data \*data) {

struct io\_uring\_sqe \*sqe;

 sqe = io\_uring\_get\_sqe(ring);

io\_uring\_prep\_readv(sqe, infd, &data-\>iov, 1, data-\>offset);

io\_uring\_prep\_writev(sqe, outfd, &data-\>iov, 1, data-\>offset);

io\_uring\_sqe\_set\_data(sqe, data);

static int queue\_read(struct io\_uring \*ring, off\_t size, off\_t offset) {

struct io\_uring\_sqe \*sqe;

 data = malloc(size + sizeof(\*data));

 sqe = io\_uring\_get\_sqe(ring);

 data-\>offset = data-\>first\_offset = offset;

 data-\>iov.iov\_base \= data + 1;

 data-\>iov.iov\_len \= size;

io\_uring\_prep\_readv(sqe, infd, &data-\>iov, 1, offset);

io\_uring\_sqe\_set\_data(sqe, data);

static void queue\_write(struct io\_uring \*ring, struct io\_data \*data) {

 data-\>offset = data-\>first\_offset;

 data-\>iov.iov\_base \= data + 1;

 data-\>iov.iov\_len \= data-\>first\_len;

queue\_prepped(ring, data);

int copy\_file(struct io\_uring \*ring, off\_t insize) {

unsigned long reads, writes;

struct io\_uring\_cqe \*cqe;

 off\_t write\_left, offset;

 writes = reads = offset = 0;

while (insize || write\_left) {

/\* Queue up as many reads as we can \*/

 off\_t this\_size = insize;

if (reads + writes \>\= QD)

if (queue\_read(ring, this\_size, offset))

if (had\_reads != reads) {

 ret = io\_uring\_submit(ring);

fprintf(stderr, "io\_uring\_submit: %s\\n", strerror(\-ret));

/\* Queue is full at this point. Let's find at least one completion \*/

 ret = io\_uring\_wait\_cqe(ring, &cqe);

 ret = io\_uring\_peek\_cqe(ring, &cqe);

fprintf(stderr, "io\_uring\_peek\_cqe: %s\\n",

 data = io\_uring\_cqe\_get\_data(cqe);

if (cqe-\>res == -EAGAIN) {

queue\_prepped(ring, data);

io\_uring\_cqe\_seen(ring, cqe);

fprintf(stderr, "cqe failed: %s\\n",

} else if (cqe-\>res != data-\>iov.iov\_len) {

/\* short read/write; adjust and requeue \*/

 data-\>iov.iov\_base += cqe-\>res;

 data-\>iov.iov\_len \-= cqe-\>res;

queue\_prepped(ring, data);

io\_uring\_cqe\_seen(ring, cqe);

 \* All done. If write, nothing else to do. If read,

 \* queue up corresponding write.

 write\_left -= data-\>first\_len;

io\_uring\_cqe\_seen(ring, cqe);

int main(int argc, char \*argv\[\]) {

printf("Usage: %s <infile> <outfile>\\n", argv\[0\]);

 infd = open(argv\[1\], O\_RDONLY);

 outfd = open(argv\[2\], O\_WRONLY | O\_CREAT | O\_TRUNC, 0644);

if (setup\_context(QD, &ring))

if (get\_file\_size(infd, &insize))

 ret = copy\_file(&ring, insize);

io\_uring\_queue\_exit(&ring);

#include <stdio.h> #include <fcntl.h> #include <string.h> #include <stdlib.h> #include <unistd.h> #include <assert.h> #include <errno.h> #include <sys/stat.h> #include <sys/ioctl.h> #include <liburing.h> #define QD 2 #define BS (16 \* 1024) static int infd, outfd; struct io\_data { int read; off\_t first\_offset, offset; size\_t first\_len; struct iovec iov; }; static int setup\_context(unsigned entries, struct io\_uring \*ring) { int ret; ret = io\_uring\_queue\_init(entries, ring, 0); if( ret < 0) { fprintf(stderr, "queue\_init: %s\\n", strerror(-ret)); return -1; } return 0; } static int get\_file\_size(int fd, off\_t \*size) { struct stat st; if (fstat(fd, &st) < 0 ) return -1; if(S\_ISREG(st.st\_mode)) { \*size = st.st\_size; return 0; } else if (S\_ISBLK(st.st\_mode)) { unsigned long long bytes; if (ioctl(fd, BLKGETSIZE64, &bytes) != 0) return -1; \*size = bytes; return 0; } return -1; } static void queue\_prepped(struct io\_uring \*ring, struct io\_data \*data) { struct io\_uring\_sqe \*sqe; sqe = io\_uring\_get\_sqe(ring); assert(sqe); if (data->read) io\_uring\_prep\_readv(sqe, infd, &data->iov, 1, data->offset); else io\_uring\_prep\_writev(sqe, outfd, &data->iov, 1, data->offset); io\_uring\_sqe\_set\_data(sqe, data); } static int queue\_read(struct io\_uring \*ring, off\_t size, off\_t offset) { struct io\_uring\_sqe \*sqe; struct io\_data \*data; data = malloc(size + sizeof(\*data)); if (!data) return 1; sqe = io\_uring\_get\_sqe(ring); if (!sqe) { free(data); return 1; } data->read = 1; data->offset = data->first\_offset = offset; data->iov.iov\_base = data + 1; data->iov.iov\_len = size; data->first\_len = size; io\_uring\_prep\_readv(sqe, infd, &data->iov, 1, offset); io\_uring\_sqe\_set\_data(sqe, data); return 0; } static void queue\_write(struct io\_uring \*ring, struct io\_data \*data) { data->read = 0; data->offset = data->first\_offset; data->iov.iov\_base = data + 1; data->iov.iov\_len = data->first\_len; queue\_prepped(ring, data); io\_uring\_submit(ring); } int copy\_file(struct io\_uring \*ring, off\_t insize) { unsigned long reads, writes; struct io\_uring\_cqe \*cqe; off\_t write\_left, offset; int ret; write\_left = insize; writes = reads = offset = 0; while (insize || write\_left) { int had\_reads, got\_comp; /\* Queue up as many reads as we can \*/ had\_reads = reads; while (insize) { off\_t this\_size = insize; if (reads + writes >= QD) break; if (this\_size > BS) this\_size = BS; else if (!this\_size) break; if (queue\_read(ring, this\_size, offset)) break; insize -= this\_size; offset += this\_size; reads++; } if (had\_reads != reads) { ret = io\_uring\_submit(ring); if (ret < 0) { fprintf(stderr, "io\_uring\_submit: %s\\n", strerror(-ret)); break; } } /\* Queue is full at this point. Let's find at least one completion \*/ got\_comp = 0; while (write\_left) { struct io\_data \*data; if (!got\_comp) { ret = io\_uring\_wait\_cqe(ring, &cqe); got\_comp = 1; } else { ret = io\_uring\_peek\_cqe(ring, &cqe); if (ret == -EAGAIN) { cqe = NULL; ret = 0; } } if (ret < 0) { fprintf(stderr, "io\_uring\_peek\_cqe: %s\\n", strerror(-ret)); return 1; } if (!cqe) break; data = io\_uring\_cqe\_get\_data(cqe); if (cqe->res < 0) { if (cqe->res == -EAGAIN) { queue\_prepped(ring, data); io\_uring\_cqe\_seen(ring, cqe); continue; } fprintf(stderr, "cqe failed: %s\\n", strerror(-cqe->res)); return 1; } else if (cqe->res != data->iov.iov\_len) { /\* short read/write; adjust and requeue \*/ data->iov.iov\_base += cqe->res; data->iov.iov\_len -= cqe->res; queue\_prepped(ring, data); io\_uring\_cqe\_seen(ring, cqe); continue; } /\* \* All done. If write, nothing else to do. If read, \* queue up corresponding write. \* \*/ if (data->read) { queue\_write(ring, data); write\_left -= data->first\_len; reads--; writes++; } else { free(data); writes--; } io\_uring\_cqe\_seen(ring, cqe); } } return 0; } int main(int argc, char \*argv\[\]) { struct io\_uring ring; off\_t insize; int ret; if (argc < 3) { printf("Usage: %s <infile> <outfile>\\n", argv\[0\]); return 1; } infd = open(argv\[1\], O\_RDONLY); if (infd < 0) { perror("open infile"); return 1; } outfd = open(argv\[2\], O\_WRONLY | O\_CREAT | O\_TRUNC, 0644); if (outfd < 0) { perror("open outfile"); return 1; } if (setup\_context(QD, &ring)) return 1; if (get\_file\_size(infd, &insize)) return 1; ret = copy\_file(&ring, insize); close(infd); close(outfd); io\_uring\_queue\_exit(&ring); return ret; }

#include <stdio.h>
#include <fcntl.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <assert.h>
#include <errno.h>
#include <sys/stat.h>
#include <sys/ioctl.h>
#include <liburing.h>

#define QD  2
#define BS (16 * 1024)

static int infd, outfd;

struct io_data {
    int read;
    off_t first_offset, offset;
    size_t first_len;
    struct iovec iov;
};

static int setup_context(unsigned entries, struct io_uring *ring) {
    int ret;

    ret = io_uring_queue_init(entries, ring, 0);
    if( ret < 0) {
        fprintf(stderr, "queue_init: %s\n", strerror(-ret));
        return -1;
    }

    return 0;
}

static int get_file_size(int fd, off_t *size) {
    struct stat st;

    if (fstat(fd, &st) < 0 )
        return -1;
    if(S_ISREG(st.st_mode)) {
        *size = st.st_size;
        return 0;
    } else if (S_ISBLK(st.st_mode)) {
        unsigned long long bytes;

        if (ioctl(fd, BLKGETSIZE64, &bytes) != 0)
            return -1;

        *size = bytes;
        return 0;
    }
    return -1;
}

static void queue_prepped(struct io_uring *ring, struct io_data *data) {
    struct io_uring_sqe *sqe;

    sqe = io_uring_get_sqe(ring);
    assert(sqe);

    if (data->read)
        io_uring_prep_readv(sqe, infd, &data->iov, 1, data->offset);
    else
        io_uring_prep_writev(sqe, outfd, &data->iov, 1, data->offset);

    io_uring_sqe_set_data(sqe, data);
}

static int queue_read(struct io_uring *ring, off_t size, off_t offset) {
    struct io_uring_sqe *sqe;
    struct io_data *data;

    data = malloc(size + sizeof(*data));
    if (!data)
        return 1;

    sqe = io_uring_get_sqe(ring);
    if (!sqe) {
        free(data);
        return 1;
    }

    data->read = 1;
    data->offset = data->first_offset = offset;

    data->iov.iov_base = data + 1;
    data->iov.iov_len = size;
    data->first_len = size;

    io_uring_prep_readv(sqe, infd, &data->iov, 1, offset);
    io_uring_sqe_set_data(sqe, data);
    return 0;
}

static void queue_write(struct io_uring *ring, struct io_data *data) {
    data->read = 0;
    data->offset = data->first_offset;

    data->iov.iov_base = data + 1;
    data->iov.iov_len = data->first_len;

    queue_prepped(ring, data);
    io_uring_submit(ring);
}

int copy_file(struct io_uring *ring, off_t insize) {
    unsigned long reads, writes;
    struct io_uring_cqe *cqe;
    off_t write_left, offset;
    int ret;

    write_left = insize;
    writes = reads = offset = 0;

    while (insize || write_left) {
        int had_reads, got_comp;

        /* Queue up as many reads as we can */
        had_reads = reads;
        while (insize) {
            off_t this_size = insize;

            if (reads + writes >= QD)
                break;
            if (this_size > BS)
                this_size = BS;
            else if (!this_size)
                break;

            if (queue_read(ring, this_size, offset))
                break;

            insize -= this_size;
            offset += this_size;
            reads++;
        }

        if (had_reads != reads) {
            ret = io_uring_submit(ring);
            if (ret < 0) {
                fprintf(stderr, "io_uring_submit: %s\n", strerror(-ret));
                break;
            }
        }

        /* Queue is full at this point. Let's find at least one completion */
        got_comp = 0;
        while (write_left) {
            struct io_data *data;

            if (!got_comp) {
                ret = io_uring_wait_cqe(ring, &cqe);
                got_comp = 1;
            } else {
                ret = io_uring_peek_cqe(ring, &cqe);
                if (ret == -EAGAIN) {
                    cqe = NULL;
                    ret = 0;
                }
            }
            if (ret < 0) {
                fprintf(stderr, "io_uring_peek_cqe: %s\n",
                        strerror(-ret));
                return 1;
            }
            if (!cqe)
                break;

            data = io_uring_cqe_get_data(cqe);
            if (cqe->res < 0) {
                if (cqe->res == -EAGAIN) {
                    queue_prepped(ring, data);
                    io_uring_cqe_seen(ring, cqe);
                    continue;
                }
                fprintf(stderr, "cqe failed: %s\n",
                        strerror(-cqe->res));
                return 1;
            } else if (cqe->res != data->iov.iov_len) {
                /* short read/write; adjust and requeue */
                data->iov.iov_base += cqe->res;
                data->iov.iov_len -= cqe->res;
                queue_prepped(ring, data);
                io_uring_cqe_seen(ring, cqe);
                continue;
            }

            /*
             * All done. If write, nothing else to do. If read,
             * queue up corresponding write.
             * */

            if (data->read) {
                queue_write(ring, data);
                write_left -= data->first_len;
                reads--;
                writes++;
            } else {
                free(data);
                writes--;
            }
            io_uring_cqe_seen(ring, cqe);
        }
    }

    return 0;
}

int main(int argc, char *argv[]) {
    struct io_uring ring;
    off_t insize;
    int ret;

    if (argc < 3) {
        printf("Usage: %s <infile> <outfile>\n", argv[0]);
        return 1;
    }

    infd = open(argv[1], O_RDONLY);
    if (infd < 0) {
        perror("open infile");
        return 1;
    }

    outfd = open(argv[2], O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (outfd < 0) {
        perror("open outfile");
        return 1;
    }

    if (setup_context(QD, &ring))
        return 1;

    if (get_file_size(infd, &insize))
        return 1;

    ret = copy_file(&ring, insize);

    close(infd);
    close(outfd);
    io_uring_queue_exit(&ring);
    return ret;
}

### Program structure

This copy program, like most others, copies the file pointed to by the first argument into the file pointed to in the second argument. The core of the program is the `copy_file()` function. Here, we set up an outer `while` loop, which turn contains 2 other `while` loops at the same level nested within it. While the outer `while` loop is there to ensure that all bytes from the source file are copied, the first nested `while` loop is tasked with creating as many `readv()` requests as possible. In fact, it enqueues as many as the queue depth will allow. 

Once the queue is full, we come to the second nested `while` loop. This loop reaps up completion queue entries and submits requests to write the destination file, now that the data is read. There are several variables that track state and it can get a little confusing. But how difficult can an asynchronous file copying program be?

## Next steps

Now that we’ve seen how to use `io_uring` to process several requests at a time, let’s mix this up with some network programming. In the [next part in this series](https://unixism.net/2020/04/io-uring-by-example-part-3-a-web-server-with-io-uring/), we’ll be building a simple web server from scratch that exclusively uses `io_uring` to do all I/O.

### Source code

The full source code for all the examples is available [here at Github](https://github.com/shuveb/io%5Furing-by-example).

## About me

My name is Shuveb Hussain and I’m the author of this Linux-focused blog. You can [follow me on Twitter](https://twitter.com/shuveb) where I post tech-related content mostly focusing on Linux, performance, scalability and cloud technologies.



# links
[Read on Omnivore](https://omnivore.app/me/io-uring-by-example-part-2-queuing-multiple-requests-unixism-18eaf42eeb4)
[Read Original](https://unixism.net/2020/04/io-uring-by-example-part-2-queuing-multiple-requests/)

<iframe src="https://unixism.net/2020/04/io-uring-by-example-part-2-queuing-multiple-requests/"  width="800" height="500"></iframe>
