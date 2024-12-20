---
id: 4e6c2b8d-a8df-4500-9b88-541033414759
title: The Low-level io_uring Interface — Lord of the io_uring documentation
tags:
  - linux
  - programing
  - game_engine
  - c
  - networking
date: 2024-04-05 19:44:51
words_count: 2491
state: INBOX
---

# The Low-level io_uring Interface — Lord of the io_uring documentation by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> io_uring‘s interface is simple. There is a submission queue and there is a completion queue. In the submission queue, you submit information on various operations you want to get done. For example, in our current program, we want to read files with readv(2), so we place a submission queue request describing it as part of a submission queue entry (SQE). Also, you can place more than one request. As many requests as the queue depth (which you can define) will allow. These operations can be a mix of reads, writes, etc. Then, we call the io_uring_enter() system call to tell the kernel that we’ve added requests to the submission queue. The kernel then does its jujitsu and once it has done processing those requests, it places results in the completion queue as part of a CQE or a completion queue entry one for each corresponding SQE. These CQEs can be accessed from user space instantly since they are placed in a buffer is shared by kernel and user space.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
`io_uring`‘s interface is simple. There is a submission queue and there is a completion queue. In the submission queue, you submit information on various operations you want to get done. For example, in our current program, we want to read files with [readv(2)](http://man7.org/linux/man-pages/man2/readv.2.html), so we place a submission queue request describing it as part of a submission queue entry (SQE). Also, you can place more than one request. As many requests as the queue depth (which you can define) will allow. These operations can be a mix of reads, writes, etc. Then, we call the [io\_uring\_enter()](https://unixism.net/loti/ref-iouring/io%5Furing%5Fenter.html#c.io%5Furing%5Fenter "io_uring_enter") system call to tell the kernel that we’ve added requests to the submission queue. The kernel then does its jujitsu and once it has done processing those requests, it places results in the completion queue as part of a CQE or a completion queue entry one for each corresponding SQE. These CQEs can be accessed from user space instantly since they are placed in a buffer is shared by kernel and user space.

We covered this particular advantage of `io_uring` earlier, but the astute reader would have noticed that this interface of filling up a queue with multiple I/O requests and then making a single system call as opposed to one system call for each I/O request is already more efficient. To take efficiency a notch further up, `io_uring` supports a mode where the [kernel polls for entries](https://unixism.net/loti/tutorial/sq%5Fpoll.html#sq-poll) you make into the submission queue without you even having to call [io\_uring\_enter()](https://unixism.net/loti/ref-iouring/io%5Furing%5Fenter.html#c.io%5Furing%5Fenter "io_uring_enter") to inform the kernel about newer submission queue entries. Another point to note is that in a life after Specter and Meltdown hardware vulnerabilities were discovered and operating systems created workarounds for it, system calls are more expensive than ever. So, for high performance applications, reducing the number of system calls is a big deal indeed.

Before you can do any of this, you need to setup the queues, which really are ring buffers with a certain depth/length. You call the [io\_uring\_setup()](https://unixism.net/loti/ref-iouring/io%5Furing%5Fsetup.html#c.io%5Furing%5Fsetup "io_uring_setup") system call to get this done. We do real work by adding submission queue entries to a ring buffer and reading completion queue entries off of the completion queue ring buffer. This is an overview of how this io\_uring interface is designed.

### Completion Queue Entry[¶](#completion-queue-entry "Permalink to this headline")

Now that we have a mental model of how things work, let’s look at how this is done in a bit more detail. Compared to the submission queue entry (SQE), the completion queue entry (CQE) is very simple. So, let’s look at it first. The SQE is an instance of an `io_uring_sqe struct` using which you submit requests. You add it to the submission ring buffer. The CQE is an instance of an `io_uring_cqe` structure which the kernel responds with for every `io_uring_sqe` structure instance that is added to the submission queue. This contains the results of the operation you requested via an SQE instance.

struct io_uring_cqe {
  __u64  user_data;   /* sqe->user_data submission passed back */
  __s32  res;         /* result code for this event */
  __u32  flags;
};

### Correlating completions with submissions[¶](#correlating-completions-with-submissions "Permalink to this headline")

As mentioned in the code comment, the user\_data field is something that is passed as-is from the SQE to the CQE instance. Let’s say you submit a bunch of requests in the submission queue, it is not necessary that they complete in the same order and show up on the completion queue as CQEs. Take the following scenario for instance: You have two disks on your machine: one is a slower spinning hard drive and another is a super-fast SSD. You submit 2 requests on the submission queue. The first one to read a 100kB file on the slower spinning hard disk and the second one to read a file of the same size on the faster SSD. If ordering were to be maintained, even though the data from the file on the SSD can be expected to arrive sooner, should the kernel wait for data from the file on the spinning hard drive to become available? Bad idea because this stops us from running as fast as we can. So, CQEs can arrive in any order as they become available. Whichever operation finishes, results for it are made available on the CQ. Since there is no specified order in which CQEs arrive, given that now you know how a CQE looks like from the `io_uring_cqe` structure above, how do you identify the which SQE request a particular CQE corresponds to? One way to do that is to use the `user_data` field common to both SQEs and CQEs to identify completions. Not that you’d set a unique ID or something, but you’d usually pass a pointer. If this is confusing, just wait till you see a clear example later on here.

The completion queue entry is simple since it mainly concerns itself with a system call’s return value, which is returned in its `res` field. For example, if you queued a read operation, on successful completion, it would contain the number of bytes read. If there was an error, it would contain a negative error number. Essentially what the [read(2)](http://man7.org/linux/man-pages/man2/read.2.html) system call itself would return.

### Ordering[¶](#ordering "Permalink to this headline")

While I did mention that can CQEs arrive in any order, you can force ordering of certain operations with SQE ordering, in effect chaining them. Please see the tutorial [Linking requests](https://unixism.net/loti/tutorial/link%5Fliburing.html#link-liburing) for more details.

### Submission Queue Entry[¶](#submission-queue-entry "Permalink to this headline")

The submission queue entry is a bit more complex than a completion queue entry since it needs to be generic enough to represent and deal with a wide range of I/O operations possible with Linux today.

struct io_uring_sqe {
  __u8  opcode;   /* type of operation for this sqe */
  __u8  flags;    /* IOSQE_ flags */
  __u16  ioprio;  /* ioprio for the request */
  __s32  fd;      /* file descriptor to do IO on */
  __u64  off;     /* offset into file */
  __u64  addr;    /* pointer to buffer or iovecs */
  __u32  len;     /* buffer size or number of iovecs */
  union {
    __kernel_rwf_t  rw_flags;
    __u32    fsync_flags;
    __u16    poll_events;
    __u32    sync_range_flags;
    __u32    msg_flags;
  };
  __u64  user_data;   /* data to be passed back at completion time */
  union {
    __u16  buf_index; /* index into fixed buffers, if used */
    __u64  __pad2[3];
  };
};

I know the `struct` looks busy. The fields that are used more commonly are only a few and this is easily explained with a simple example such as the one we’re dealing with: cat. When you want to read a file using the [readv(2)](http://man7.org/linux/man-pages/man2/readv.2.html) system call:

* opcode is used to specify the operation, in our case, [readv(2)](http://man7.org/linux/man-pages/man2/readv.2.html) using the `IORING_OP_READV` constant.
* `fd` is used to specify the file descriptor representing the file you want to read from.
* `addr` is used to point to the array of `iovec` structures that hold the addresses and lengths of the buffers we’ve allocated for I/O.
* finally, `len` is used to hold the length of the arrays of `iovec` structures.

Now that wasn’t too difficult, or was it? You fill these values letting `io_uring` know what to do. You can queue multiple SQEs and finally call [io\_uring\_enter()](https://unixism.net/loti/ref-iouring/io%5Furing%5Fenter.html#c.io%5Furing%5Fenter "io_uring_enter") when you want the kernel to start processing your queued requests.

### `cat` with io\_uring[¶](#cat-with-io-uring "Permalink to this headline")

Let’s see how to actually get this done with a `cat` utility like program that uses the low-level `io_uring` interface.

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



# links
[Read on Omnivore](https://omnivore.app/me/the-low-level-io-uring-interface-lord-of-the-io-uring-documentat-18eaf261074)
[Read Original](https://unixism.net/loti/low_level.html)

<iframe src="https://unixism.net/loti/low_level.html"  width="800" height="500"></iframe>
