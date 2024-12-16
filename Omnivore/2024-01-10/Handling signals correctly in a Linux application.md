---
id: fd0ee29c-f431-407c-be33-e97680455586
title: Handling signals correctly in a Linux application
tags:
  - programing
  - cpp
  - linux
  - signals
date: 2024-01-10 00:32:32
date_published: 2020-04-20 13:06:03
words_count: 1546
state: INBOX
---

# Handling signals correctly in a Linux application by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Signal handling is notoriously hard to do correctly. Handling asynchronous events is a subtle business, and the POSIX signal API is complex. In this post, I’ll implement a simple server application that handles signals as correctly as possible. With Linux flavor.


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
## Main menu

* [Home](https://www.jmoisio.eu/en/)
* [About](https://www.jmoisio.eu/en/about/)
* [](#)

* [Programming](https://www.jmoisio.eu/en/blog/category/programming/)

Signal handling in a POSIX program is notoriously hard to do correctly. Most of it is due to the intrinsic difficulties of handling asynchronous events. But a good deal is also due to the plethora of different function calls in the signal API. In this post, I’ll implement a simple server application that handles signals as correctly as possible. It will use some Linux specific system calls, but those are for solving edge cases.

Let’s say that you’re writing a server application in C, and for whatever reason, you don’t want to use an event framework that takes care of signal handling for you. Maybe you’re aiming for a small footprint or minimal dependencies, or maybe like me, you just want to [reinvent the wheel](https://www.jmoisio.eu/en/blog/2020/01/20/programming-without-the-standard-library/) [for fun and learning](https://github.com/jasujm/bridge).

The example application will be a simple echo server. It will do the following:

* Open a socket and wait for connections.
* For every accepted connection, read characters until a newline, echo them back and close the connection.
* When receiving a signal, finish the current request, clean up and exit.

The full source code for the code examples is available at [GitHub](https://github.com/jasujm/apparatus-examples/tree/master/signal-handling). All you need for a client is telnet.

### A solution that almost works

The typical recipe for signal handling presented in tutorials uses the `signal()` function that ships with the C standard library. The API and program flow are easy to understand. Just register a signal handler that sets a flag. The flag is read periodically in the main loop, and if set, the loop is exited.

```arduino
int signal_received = 0;

void handle_signal(int signum)
{
    signal_received = signum;
}

int main()
{
    int server_fd, socket_fd;
    struct pollfd pollfds[1];

    signal(SIGTERM, &handle_signal);

    server_fd = create_server();
    pollfds[0].fd = server_fd;
    pollfds[0].events = POLLIN;

    /* Check if a signal was received. */
    while (!signal_received) {

        /* But what if we receive signal here? */

        /* Poll the incoming events. This may be interrupted by a signal. */
        pollfds[0].revents = 0;
        if (poll(pollfds, 1, -1) < 0 && errno != EINTR) {
            handle_error("poll");
        }

        /* Handle an incoming connection. */
        if (pollfds[0].revents & POLLIN) {
            if ((socket_fd = accept(server_fd, NULL, NULL)) < 0) {
                handle_error("accept");
            }
            handle_connection(socket_fd);
            close(socket_fd);
        }
    }

    fprintf(stderr, "Exiting via %s\n", strsignal(signal_received));
    close(server_fd);
    return 0;
}
```

The program sort of manages to handle the `SIGTERM` signal. It has a flag telling whether a signal was received. It uses the `poll()` function (that can be interrupted by a signal) to wait for incoming connections. The return value is examined to determine if the [call was interrupted by a signal](http://man7.org/linux/man-pages/man2/poll.2.html) or if there was an actual error.

The above program almost works, but there are edge cases it fails to address.

1. The `signal()` function is used to set the signal handler. It has [various shortcomings](http://man7.org/linux/man-pages/man2/signal.2.html): inconsistent behavior between different UNIXes, unsuitability when used in multi‐threaded programs, and lack of functionality used to fine‐tune the behavior of signal handling.
2. There is a race condition in checking the signal flag. If a signal is delivered after the flag is read, but before the call to `poll()`, the program will not exit until it has served the next client.
3. Pedantic note for those aiming at maximum portability: The flag should have type [volatile sig\_atomic\_t](https://en.cppreference.com/w/c/program/sig%5Fatomic%5Ft) to ensure that reads and writes are atomic. This would mainly be an issue in CPU architectures where loading an int value to a register is not atomic.

A note on the first issue: Correct signal handling in a multithreaded program is a big topic in its own right. But it will have to wait for another post.

### Tackling the issues of the first attempt

The `sigaction()` function is a richer and more rigorously specified version of the good old `signal()`.

```cpp
int main()
{
    sigset_t sigset;
    struct sigaction sa;

    sigemptyset(&sigset);
    sa.sa_handler = &handle_signal;
    sa.sa_mask = sigset;
    sa.sa_flags = 0;
    sigaction(SIGTERM, &sa, NULL);

    /* etc. */
}
```

The above code snippet sets the handler for `SIGTERM` just like before. It specified an empty signal mask and no flags. The signal mask controls which other signals are blocked when `SIGTERM` is being handled. The signal mask is for cases when the signal handler itself must not be interrupted by another signal. In this case, the signal handler sets a one‐way flag, so no need to set the mask. The flags control various aspects of signal handling, for example, whether or not system calls interrupted by the signal are automatically restarted.

The race condition between checking the signal flag and polling for the incoming connections is solved by blocking the `SIGTERM` signal, and only unblocking it when we’re waiting for incoming connections.

```sas
int main()
{
    int server_fd, socket_fd;
    struct pollfd pollfds[1];
    sigset_t sigset;
    struct sigaction sa;

    sigemptyset(&sigset);
    sigaddset(&sigset, SIGTERM);
    sigprocmask(SIG_SETMASK, &sigset, NULL);

    sigemptyset(&sigset);
    sa.sa_handler = &handle_signal;
    sa.sa_mask = sigset;
    sa.sa_flags = 0;
    sigaction(SIGTERM, &sa, NULL);

    server_fd = create_server();
    pollfds[0].fd = server_fd;
    pollfds[0].events = POLLIN;

    /* Check if a signal was received. */
    while (!signal_received) {
        /* Poll the incoming events. This may be interrupted by a signal. */
        pollfds[0].revents = 0;
        sigemptyset(&sigset);
        if (ppoll(pollfds, 1, NULL, &sigset) < 0 && errno != EINTR) {
            handle_error("ppoll");
        }

        /* Handle an incoming connection. */
        if (pollfds[0].revents & POLLIN) {
            if ((socket_fd = accept(server_fd, NULL, NULL)) < 0) {
                handle_error("accept");
            }
            handle_connection(socket_fd);
            close(socket_fd);
        }
    }

    fprintf(stderr, "Exiting via %s\n", strsignal(signal_received));
    close(server_fd);
    return 0;
}
```

The two changes are the introduction of a `sigprocmask()` call, and changing `poll()` to `ppoll()`. Signal process mask controls which signals are delivered to the program. Blocking `SIGTERM` means that most of the time the signal handler will not run, but rather the `SIGTERM` signal will be queued for later. `ppoll()` on the other hand is a Linux specific version of `poll()` specifically designed to solve the race condition described above. It receives an additional signal mask argument. The call will atomically apply the new mask (which unblocks SIGTERM) and start waiting for incoming events. Atomicity is crucial here because it means that there is no way that the flag is set “between” reading it and polling. If there was a signal in the queue, or if a signal arrives while `ppoll()` is waiting, the call is interrupted and the program breaks out of the main loop.

### An alternative approach using signalfd

I don’t know about you, but something in the signal handling still feels off. Maybe it’s the global variable used to pass the state of the program around or having to deal with the signal masks all the time. The developers of the Linux kernel seemed to think so too because Linux has an API for receiving signals via a file descriptor. In UNIX [everything is a file](https://en.wikipedia.org/wiki/Everything%5Fis%5Fa%5Ffile), and using this approach to queue asynchronous signals to handle them later is certainly appropriate.

The system call is fittingly named `signalfd()`. It accepts a signal mask as an argument and gives you a file descriptor that can be polled, read and otherwise handled much like a regular file.

```arduino
int main()
{
    int server_fd, socket_fd, signal_fd;
    struct pollfd pollfds[2];
    sigset_t sigset;
    struct signalfd_siginfo siginfo;

    sigemptyset(&sigset);
    sigaddset(&sigset, SIGTERM);
    sigprocmask(SIG_SETMASK, &sigset, NULL);

    server_fd = create_server();
    pollfds[0].fd = server_fd;
    pollfds[0].events = POLLIN;

    signal_fd = signalfd(-1, &sigset, 0);
    pollfds[1].fd = signal_fd;
    pollfds[1].events = POLLIN;

    while (1) {
        /* Poll the incoming events. The signals remain blocked. */
        pollfds[0].revents = 0;
        pollfds[1].revents = 0;
        if (poll(pollfds, 2, -1) < 0) {
            handle_error("poll");
        }

        /* Handle an incoming connection. */
        if (pollfds[0].revents & POLLIN) {
            if ((socket_fd = accept(server_fd, NULL, NULL)) < 0) {
                handle_error("accept");
            }
            handle_connection(socket_fd);
            close(socket_fd);
        }

        /* Check if a signal was received. */
        if (pollfds[1].revents & POLLIN) {
            if (read(signal_fd, &siginfo, sizeof(siginfo)) != sizeof(siginfo)) {
                handle_error("read siginfo");
            }
            break;
        }
    }

    fprintf(stderr, "Exiting via %s\n", strsignal(siginfo.ssi_signo));
    close(signal_fd);
    close(server_fd);
    return 0;
}
```

Note that using signalfd to handle signals [isn’t free from problems](https://ldpreload.com/blog/signalfd-is-useless), but for this use case, it’s an elegant solution.

### Something is still missing…

Correct signal handling is hard. Why it was reasonably straightforward in this post was due to two reasons:

1. I explicitly allowed the server to finish serving the current client. Thanks to this lax attitude toward basic network security (what if the client does something stupid like hangs indefinitely?) I was able to block signals and only handle them at one point in the program.
2. There was no need to deal with multiple threads, or child processes. Things like signal masks get hairy when there is. Much more hairy.

Real servers need to handle issue 1 somehow. Some alternatives are:

* Introduce timeouts to blocking reads and writes. This ensures that the control gets back to `poll()` eventually.
* Don’t block signals. Let the blocking calls be interrupted, and check for the return value. And do that every time you invoke a blocking system call…
* Use non‐blocking IO. Return to the main loop as soon as there is nothing to read or write.

Timeouts are a straightforward solution, but not optimal performance‐wise. Dealing with interrupts in every blocking call quickly becomes tedious in a more complex program. Writing non‐blocking IO is not easy either, but certainly the best in terms of performance. ~~It should also be a fun programming exercise, so I’ll write another post about it later.~~ I made another post with a non-blocking version of the echo server [here](https://www.jmoisio.eu/en/blog/2020/10/13/non-blocking-server-c-linux/) (updated on 13 Oct 2020).



# links
[Read on Omnivore](https://omnivore.app/me/handling-signals-correctly-in-a-linux-application-18cf05b1d66)
[Read Original](https://www.jmoisio.eu/en/blog/2020/04/20/handling-signals-correctly-in-a-linux-application/)

<iframe src="https://www.jmoisio.eu/en/blog/2020/04/20/handling-signals-correctly-in-a-linux-application/"  width="800" height="500"></iframe>
