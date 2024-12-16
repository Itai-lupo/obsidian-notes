---
id: e7889901-b165-4011-94f2-d08b53485d5c
title: Using signalfd and pidfd to make signals less painful under Linux - Unixism
tags:
  - programing
  - cpp
  - linux
  - signals
date: 2024-01-10 00:32:12
date_published: 2021-02-27 17:46:20
words_count: 9516
state: INBOX
---

# Using signalfd and pidfd to make signals less painful under Linux - Unixism by 
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Anyone introduced to Unix programming gets to marvel at the clever construct of signals. In the life-cycle of a process, fortune and misfortune are present in good measure. Signals allow the operating system to tell the process about the occurrence of various events like the execution of illegal CPU instructions, a user typing and thus… Continue reading Using signalfd and pidfd to make signals less painful under Linux


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
[Unixism](https://unixism.net/)

 Of consoles and blinking cursors 

Anyone introduced to Unix programming gets to marvel at the clever construct of signals. In the life-cycle of a process, fortune and misfortune are present in good measure. Signals allow the operating system to tell the process about the occurrence of various events like the execution of illegal CPU instructions, a user typing and thus causing a hardware interrupt at the keyboard (`Ctrl+C`) or the termination of a child process, which causes `SIGCHLD` to be delivered to the parent.

But here’s the thing: signals can be very disruptive to the general flow of your program, since they are asynchronous in nature. They can occur while you’re blocked in a system call (causing them to fail) or while executing user space instructions (potentially causing race conditions). You might have to carefully model your program to compensate for the asynchronous nature of signals and this is something experienced Unix programmers always take into account.

## Some pains of signals

Before we move on and look at alternative, Linux-specific solutions to alleviate some of the pains generally associated with Unix signals, let’s look at all the potential problems programmers have to deal with when working with signals.

* For decent sized programs, you can’t do away with signals. They are a fact of life under Linux. Terminal size change notification is a good example of this (`SIGWINCH`). Notification about the termination of a child used to be in this category, until in Linux kernel version 5.2, we got support for `pidfd`. We discuss `pidfd` later in the article.
* You might have to remember to use `volatile` class variables when dealing with signal handlers since they are executed asynchronously
* You might also have to worry about using a type that is updated atomically when accessed from both regular code and also from your signal handlers. That’s the reason `sigatomic_t` exists. This is because signal handlers can be called anytime asynchronously and variables that are updated with multiple CPU instructions can be in an inconsistent state when a signal handler is invoked.
* You’ve got to watch which functions you call from within your signal handler. The functions you call have to be async-signal-safe. The `signal-safety(7)` man page describes details of this and provides a list of functions that you should not be calling from a signal handler. As an example, non-re-entrant functions should not be called from signal handlers since they could have been called from your main code, got interrupted in the middle of their being executed. If the signal handler calls the same function, trouble ensues.
* When a signal occurs while a program is blocked on a system call, the system call returns with an error `EINTR`. It is however, possible to automatically restart many system calls by specifying the `SA_RESTART` flag when setting up a signal handler with the `sigaction(2)`function (We discuss this in detail later). This leads to the operating system automatically restarting system calls which are interrupted by signals. Unfortunately though, there are many system calls (like epoll\_wait(2), epoll\_pwait(2), poll(2), ppoll(2), select(2), pselect(2), revc(2), send(2), and nanosleep(2)) which are never restarted in spite of `SA_RESTART` being specified. You can read more details on this in the `signal(7)` man page.
* It is easy to “lose” or miss signals and thus get stuck waiting for one if a signal occurs between the time you setup a signal handler and call `pause(2)` to wait for a signal to occur. For this reason, you have system calls that allow you to either wait for a file descriptor to be ready or for a signal to occur in one, atomic step. See ppoll(2), pselect(2) and `epoll_pwait(2)`.

This is quite a list and Unix developers have to keep these problems in mind when dealing with signals.

## Interrupted system calls

Let’s see how system calls are interrupted by signals with an example. The program `01_signal_no_restart.c` is a simple echo program that reads from `stdin` and echoes data it read back to `stdout`. It is easy to imagine that at the heart of this program are `read()`and `write()` system calls inside of a `while` loop. When either of these system calls are interrupted by a signal, they return `-1`, setting `errorno` to EINTR.

You can find all example in this article in this [companion Github repo](https://github.com/shuveb/linux-signals).

#define handle\_error(msg) \\

do { perror(msg); exit(EXIT\_FAILURE); } while (0)

#define ALARM\_AFTER\_SECS 5

 \* Our signal handler simply prints a message and returns.

void sigalrm\_handler(int signo) {

printf("Received SIGALRM\\n");

 \* Setup a signal handler for the SIGALRM signal

sigemptyset(&sa.sa\_mask);

 sa.sa\_handler \= sigalrm\_handler;

if (sigaction(SIGALRM, &sa, NULL) \== -1)

handle\_error("sigaction");

 \* Let's send ourselves a SIGALRM signal a few

 \* Infinite loop where we read from stdin and print

 \* what we read back to stdout.

bzero(buff, sizeof(buff));

if( read(STDIN\_FILENO, buff, sizeof(buff)\-1 ) \== -1 )

if( write(STDOUT\_FILENO, buff, sizeof(buff) ) \== -1 )

#include <stdio.h> #include <unistd.h> #include <signal.h> #include <stdlib.h> #include <string.h> #define handle\_error(msg) \\ do { perror(msg); exit(EXIT\_FAILURE); } while (0) #define ALARM\_AFTER\_SECS 5 /\* \* Our signal handler simply prints a message and returns. \* \*/ void sigalrm\_handler(int signo) { printf("Received SIGALRM\\n"); } int main() { struct sigaction sa; char buff\[1024\]; /\* \* Setup a signal handler for the SIGALRM signal \* \*/ sigemptyset(&sa.sa\_mask); sa.sa\_flags = 0; sa.sa\_handler = sigalrm\_handler; if (sigaction(SIGALRM, &sa, NULL) == -1) handle\_error("sigaction"); /\* \* Let's send ourselves a SIGALRM signal a few \* seconds later. \* \*/ alarm(ALARM\_AFTER\_SECS); /\* \* Infinite loop where we read from stdin and print \* what we read back to stdout. \* \*/ while(1) { bzero(buff, sizeof(buff)); if( read(STDIN\_FILENO, buff, sizeof(buff)-1 ) == -1 ) handle\_error("read"); if( write(STDOUT\_FILENO, buff, sizeof(buff) ) == -1 ) handle\_error("write"); } return 0; }

#include <stdio.h>
#include <unistd.h>
#include <signal.h>
#include <stdlib.h>
#include <string.h>

#define handle_error(msg) \
           do { perror(msg); exit(EXIT_FAILURE); } while (0)
#define ALARM_AFTER_SECS    5
/*
 * Our signal handler simply prints a message and returns.
 * */
void sigalrm_handler(int signo) {
    printf("Received SIGALRM\n");
}

int main() {
    struct sigaction sa;
    char buff[1024];

    /*
     * Setup a signal handler for the SIGALRM signal
     * */
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    sa.sa_handler = sigalrm_handler;
    if (sigaction(SIGALRM, &sa, NULL) == -1)
        handle_error("sigaction");

    /*
     * Let's send ourselves a SIGALRM signal a few
     * seconds later.
     * */
    alarm(ALARM_AFTER_SECS);

    /*
     * Infinite loop where we read from stdin and print
     * what we read back to stdout.
     * */
    while(1) {
        bzero(buff, sizeof(buff));
        if( read(STDIN_FILENO, buff, sizeof(buff)-1 ) == -1 )
            handle_error("read");
        if( write(STDOUT_FILENO, buff, sizeof(buff) ) == -1 )
            handle_error("write");
   }

    return 0;
}

When the program starts, we setup a `SIGALRM` signal to be delivered 5 seconds later. And when it’s delivered, it will most likely interrupt either `read()` or `write()`, resulting in them returning with an error. You should be able to see from the error message printed by `perror()` that it was indeed the signal that caused the error:

read: Interrupted system call

Fortunately, there’s a way to deal with system calls getting interrupted with signals. Let’s see how that’s done.

## Restarting system calls automatically

Unix-like systems have long supported the ability to restart system calls automatically, should they be interrupted by signals. This is done by specifying the `SA_RESTART` flag in `sa_flags` field of `struct sigaction`. Let’s now take the previous example `01_signal_no_restart.c` and add this flag which will influence our call to `sigaction()` in our new program, `02_signal_restart.c`

#define handle\_error(msg) \\

do { perror(msg); exit(EXIT\_FAILURE); } while (0)

#define ALARM\_AFTER\_SECS 5

 \* Our signal handler simply prints a message and returns.

void sigalrm\_handler(int signo) {

printf("Received SIGALRM\\n");

 \* Setup a signal handler for the SIGALRM signal

sigemptyset(&sa.sa\_mask);

 sa.sa\_flags \= SA\_RESTART;

 sa.sa\_handler \= sigalrm\_handler;

if (sigaction(SIGALRM, &sa, NULL) \== -1)

handle\_error("sigaction");

 \* Let's send ourselves a SIGALRM signal a few

 \* Infinite loop where we read from stdin and print

 \* what we read back to stdout.

bzero(buff, sizeof(buff));

if( read(STDIN\_FILENO, buff, sizeof(buff)\-1 ) \== -1 )

if( write(STDOUT\_FILENO, buff, sizeof(buff) ) \== -1 )

#include <stdio.h> #include <unistd.h> #include <signal.h> #include <stdlib.h> #include <string.h> #define handle\_error(msg) \\ do { perror(msg); exit(EXIT\_FAILURE); } while (0) #define ALARM\_AFTER\_SECS 5 /\* \* Our signal handler simply prints a message and returns. \* \*/ void sigalrm\_handler(int signo) { printf("Received SIGALRM\\n"); } int main() { struct sigaction sa; char buff\[1024\]; /\* \* Setup a signal handler for the SIGALRM signal \* \*/ sigemptyset(&sa.sa\_mask); sa.sa\_flags = SA\_RESTART; sa.sa\_handler = sigalrm\_handler; if (sigaction(SIGALRM, &sa, NULL) == -1) handle\_error("sigaction"); /\* \* Let's send ourselves a SIGALRM signal a few \* seconds later. \* \*/ alarm(ALARM\_AFTER\_SECS); /\* \* Infinite loop where we read from stdin and print \* what we read back to stdout. \* \*/ while(1) { bzero(buff, sizeof(buff)); if( read(STDIN\_FILENO, buff, sizeof(buff)-1 ) == -1 ) handle\_error("read"); if( write(STDOUT\_FILENO, buff, sizeof(buff) ) == -1 ) handle\_error("write"); } return 0; }

#include <stdio.h>
#include <unistd.h>
#include <signal.h>
#include <stdlib.h>
#include <string.h>

#define handle_error(msg) \
           do { perror(msg); exit(EXIT_FAILURE); } while (0)
#define ALARM_AFTER_SECS    5
/*
 * Our signal handler simply prints a message and returns.
 * */
void sigalrm_handler(int signo) {
    printf("Received SIGALRM\n");
}

int main() {
    struct sigaction sa;
    char buff[1024];

    /*
     * Setup a signal handler for the SIGALRM signal
     * */
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;
    sa.sa_handler = sigalrm_handler;
    if (sigaction(SIGALRM, &sa, NULL) == -1)
        handle_error("sigaction");

    /*
     * Let's send ourselves a SIGALRM signal a few
     * seconds later.
     * */
    alarm(ALARM_AFTER_SECS);

    /*
     * Infinite loop where we read from stdin and print
     * what we read back to stdout.
     * */
    while(1) {
        bzero(buff, sizeof(buff));
        if( read(STDIN_FILENO, buff, sizeof(buff)-1 ) == -1 )
            handle_error("read");
        if( write(STDOUT_FILENO, buff, sizeof(buff) ) == -1 )
            handle_error("write");
    }

    return 0;
}

When you run this program, after 5 seconds, `SIGALRM` should get delivered, you should see the message `Received SIGALRM`, which we print from our signal handler. However, we see that `read()` or `write()` now do not return any errors. Behind the scene, they are transparently restarted by the kernel as we requested.

So, problem solved? Unfortunately not. Read on to see why.

## Non-restartable system calls

It turns out not all system calls automatically restart if a signal occurs when they’re in a blocked state. This is irrespective of whether you set `SA_RESTART` or not, like we saw in the previous example (`02_signal_restart.c`). Take a look at what `signal(7)` says in this regard:

```sql
       The following interfaces are never restarted after being
       interrupted by a signal handler, regardless of the use of
       SA_RESTART; they always fail with the error EINTR when
       interrupted by a signal handler:

       * "Input" socket interfaces, when a timeout (SO_RCVTIMEO) has
         been set on the socket using setsockopt(2): accept(2), recv(2),
         recvfrom(2), recvmmsg(2) (also with a non-NULL timeout
         argument), and recvmsg(2).

       * "Output" socket interfaces, when a timeout (SO_RCVTIMEO) has
         been set on the socket using setsockopt(2): connect(2),
         send(2), sendto(2), and sendmsg(2).

       * Interfaces used to wait for signals: pause(2), sigsuspend(2),
         sigtimedwait(2), and sigwaitinfo(2).

       * File descriptor multiplexing interfaces: epoll_wait(2),
         epoll_pwait(2), poll(2), ppoll(2), select(2), and pselect(2).

       * System V IPC interfaces: msgrcv(2), msgsnd(2), semop(2), and
         semtimedop(2).

       * Sleep interfaces: clock_nanosleep(2), nanosleep(2), and
         usleep(3).

       * io_getevents(2).

       The sleep(3) function is also never restarted if interrupted by a
       handler, but gives a success return: the number of seconds
       remaining to sleep.
```

Since `epoll_wait(2)` is in the list above, meaning, it won’t restart while in a blocked state upon receipt of a signal even though `SA_RESTART` is specified, we can try this for ourselves with a simple example, `03_signal_epoll.c`.

#define handle\_error(msg) \\

do { perror(msg); exit(EXIT\_FAILURE); } while (0)

struct epoll\_event ev, events\[MAX\_EVENTS\];

int listen\_sock, conn\_sock, nfds, epollfd;

 \* Our signal handler simply prints a message and returns.

void sigalrm\_handler(int signo) {

printf("Received SIGALRM\\n");

 \* This function is responsible for setting up the

 \* listening socket for the socket-based echo

 \* functionality. Pretty standard stuff.

int setup\_listening\_socket(int port) {

struct sockaddr\_in srv\_addr;

 sock = socket(PF\_INET, SOCK\_STREAM, 0);

handle\_error("socket()");

 SOL\_SOCKET, SO\_REUSEADDR,

 &enable, sizeof(int)) < 0)

handle\_error("setsockopt(SO\_REUSEADDR)");

memset(&srv\_addr, 0, sizeof(srv\_addr));

 srv\_addr.sin\_family \= AF\_INET;

 srv\_addr.sin\_port \= htons(port);

 srv\_addr.sin\_addr.s\_addr \= htonl(INADDR\_ANY);

/\* We bind to a port and turn this socket into a listening

(const struct sockaddr \*)&srv\_addr,

if (listen(sock, 10) < 0)

handle\_error("listen()");

 \* Reads 1kb from the "in" file descriptor and

 \* writes it to the "out" file descriptor.

void copy\_fd(int in, int out) {

bzero(buff, sizeof(buff));

 bytes\_read = read(in, buff, sizeof(buff)\-1 );

else if (bytes\_read == 0)

write(out, buff, strlen(buff));

 \* If a parsable number is passed as the 1st argument to the

 \* program, sets up SIGALRM to be sent to self the specified

void setup\_signals(int argc, char \*\*argv) {

/\* No argument passed, and so no signal will be delivered \*/

printf("No alarm set. Will not be interrupted.\\n");

/\* if a proper number is passed, we setup the alarm,

 \* else we return without setting one up.

long alarm\_after = strtol(argv\[1\], NULL, 10);

handle\_error("strtol()");

printf("Alarm after %ld seconds.\\n", alarm\_after);

printf("No alarm set. Will not be interrupted.\\n");

 \* Setup a signal handler for the SIGALRM signal

sigemptyset(&sa.sa\_mask);

 sa.sa\_flags \= SA\_RESTART;

 sa.sa\_handler \= sigalrm\_handler;

if (sigaction(SIGALRM, &sa, NULL) \== -1)

handle\_error("sigaction");

 \* Let's send ourselves a SIGALRM signal specified

 \* Helper function to setup epoll

 epollfd = epoll\_create1(0);

handle\_error("epoll\_create1()");

 \* Adds the file descriptor passed to be monitored by epoll

void add\_fd\_to\_epoll(int fd) {

/\* Add fd to be monitored by epoll \*/

if (epoll\_ctl(epollfd, EPOLL\_CTL\_ADD, fd, &ev) \== -1)

handle\_error("epoll\_ctl");

int main(int argc, char \*argv\[\]) {

/\* Setup sigalrm if a number is passed as the first argument \*/

setup\_signals(argc, argv);

/\* Add stdin-based echo server to epoll's monitoring list \*/

add\_fd\_to\_epoll(STDIN\_FILENO);

/\* Setup a socket to listen on port 5000 \*/

 listen\_sock = setup\_listening\_socket(5000);

/\* Add socket-based echo server to epoll's monitoring list \*/

add\_fd\_to\_epoll(listen\_sock);

/\* Let's wait for some activity on either stdin or on the socket \*/

 nfds = epoll\_wait(epollfd, events, MAX\_EVENTS, -1);

handle\_error("epoll\_wait()");

 \* For each of the file descriptors epoll says are ready,

 \* check which one it is the echo read data back.

for (int n = 0; n < nfds; n++) {

if ( events\[n\].data.fd \== STDIN\_FILENO ) {

printf("stdin ready..\\n");

copy\_fd(STDIN\_FILENO, STDOUT\_FILENO);

} else if ( events\[n\].data.fd \== conn\_sock ) {

printf("socket data ready..\\n");

copy\_fd(conn\_sock, conn\_sock);

} else if (events\[n\].data.fd \== listen\_sock) {

/\* Listening socket is ready, meaning

 \* there's a new client connection \*/

printf("new connection ready..\\n");

 conn\_sock = accept(listen\_sock, NULL, NULL);

handle\_error("accept()");

/\* Add the connected client to epoll's monitored FDs list \*/

add\_fd\_to\_epoll(conn\_sock);

#include <stdio.h> #include <netinet/in.h> #include <string.h> #include <unistd.h> #include <stdlib.h> #include <signal.h> #include <sys/epoll.h> #include <errno.h> #define handle\_error(msg) \\ do { perror(msg); exit(EXIT\_FAILURE); } while (0) #define MAX\_EVENTS 10 struct epoll\_event ev, events\[MAX\_EVENTS\]; int listen\_sock, conn\_sock, nfds, epollfd; /\* \* Our signal handler simply prints a message and returns. \* \*/ void sigalrm\_handler(int signo) { printf("Received SIGALRM\\n"); } /\* \* This function is responsible for setting up the \* listening socket for the socket-based echo \* functionality. Pretty standard stuff. \* \*/ int setup\_listening\_socket(int port) { int sock; struct sockaddr\_in srv\_addr; sock = socket(PF\_INET, SOCK\_STREAM, 0); if (sock == -1) handle\_error("socket()"); int enable = 1; if (setsockopt(sock, SOL\_SOCKET, SO\_REUSEADDR, &enable, sizeof(int)) < 0) handle\_error("setsockopt(SO\_REUSEADDR)"); memset(&srv\_addr, 0, sizeof(srv\_addr)); srv\_addr.sin\_family = AF\_INET; srv\_addr.sin\_port = htons(port); srv\_addr.sin\_addr.s\_addr = htonl(INADDR\_ANY); /\* We bind to a port and turn this socket into a listening \* socket. \* \*/ if (bind(sock, (const struct sockaddr \*)&srv\_addr, sizeof(srv\_addr)) < 0) handle\_error("bind()"); if (listen(sock, 10) < 0) handle\_error("listen()"); return (sock); } /\* \* Reads 1kb from the "in" file descriptor and \* writes it to the "out" file descriptor. \*/ void copy\_fd(int in, int out) { char buff\[1024\]; int bytes\_read; bzero(buff, sizeof(buff)); bytes\_read = read(in, buff, sizeof(buff)-1 ); if (bytes\_read == -1) handle\_error("read"); else if (bytes\_read == 0) return; write(out, buff, strlen(buff)); } /\* \* If a parsable number is passed as the 1st argument to the \* program, sets up SIGALRM to be sent to self the specified \* seconds later. \* \*/ void setup\_signals(int argc, char \*\*argv) { struct sigaction sa; /\* No argument passed, and so no signal will be delivered \*/ if (argc < 2) { printf("No alarm set. Will not be interrupted.\\n"); return; } /\* if a proper number is passed, we setup the alarm, \* else we return without setting one up. \* \*/ errno = 0; long alarm\_after = strtol(argv\[1\], NULL, 10); if (errno) handle\_error("strtol()"); if (alarm\_after) printf("Alarm after %ld seconds.\\n", alarm\_after); else { printf("No alarm set. Will not be interrupted.\\n"); return; } /\* \* Setup a signal handler for the SIGALRM signal \* \*/ sigemptyset(&sa.sa\_mask); sa.sa\_flags = SA\_RESTART; sa.sa\_handler = sigalrm\_handler; if (sigaction(SIGALRM, &sa, NULL) == -1) handle\_error("sigaction"); /\* \* Let's send ourselves a SIGALRM signal specified \* seconds later. \* \*/ alarm(alarm\_after); } /\*\* \* Helper function to setup epoll \*/ void setup\_epoll() { epollfd = epoll\_create1(0); if (epollfd == -1) handle\_error("epoll\_create1()"); } /\*\* \* Adds the file descriptor passed to be monitored by epoll \* \*/ void add\_fd\_to\_epoll(int fd) { /\* Add fd to be monitored by epoll \*/ ev.events = EPOLLIN; ev.data.fd = fd; if (epoll\_ctl(epollfd, EPOLL\_CTL\_ADD, fd, &ev) == -1) handle\_error("epoll\_ctl"); } int main(int argc, char \*argv\[\]) { /\* Setup sigalrm if a number is passed as the first argument \*/ setup\_signals(argc, argv); /\* Let's setup epoll \*/ setup\_epoll(); /\* Add stdin-based echo server to epoll's monitoring list \*/ add\_fd\_to\_epoll(STDIN\_FILENO); /\* Setup a socket to listen on port 5000 \*/ listen\_sock = setup\_listening\_socket(5000); /\* Add socket-based echo server to epoll's monitoring list \*/ add\_fd\_to\_epoll(listen\_sock); while(1) { /\* Let's wait for some activity on either stdin or on the socket \*/ nfds = epoll\_wait(epollfd, events, MAX\_EVENTS, -1); if (nfds == -1) handle\_error("epoll\_wait()"); /\* \* For each of the file descriptors epoll says are ready, \* check which one it is the echo read data back. \* \*/ for (int n = 0; n < nfds; n++) { if ( events\[n\].data.fd == STDIN\_FILENO ) { printf("stdin ready..\\n"); copy\_fd(STDIN\_FILENO, STDOUT\_FILENO); } else if ( events\[n\].data.fd == conn\_sock ) { printf("socket data ready..\\n"); copy\_fd(conn\_sock, conn\_sock); } else if (events\[n\].data.fd == listen\_sock) { /\* Listening socket is ready, meaning \* there's a new client connection \*/ printf("new connection ready..\\n"); conn\_sock = accept(listen\_sock, NULL, NULL); if (conn\_sock == -1 ) handle\_error("accept()"); /\* Add the connected client to epoll's monitored FDs list \*/ add\_fd\_to\_epoll(conn\_sock); } } } return 0; }

#include <stdio.h>
#include <netinet/in.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <sys/epoll.h>
#include <errno.h>

#define handle_error(msg) \
           do { perror(msg); exit(EXIT_FAILURE); } while (0)

#define MAX_EVENTS          10

struct epoll_event ev, events[MAX_EVENTS];
int listen_sock, conn_sock, nfds, epollfd;

/*
 * Our signal handler simply prints a message and returns.
 * */
void sigalrm_handler(int signo) {
    printf("Received SIGALRM\n");
}

/*
 * This function is responsible for setting up the
 * listening socket for the socket-based echo
 * functionality. Pretty standard stuff.
 * */

int setup_listening_socket(int port) {
    int sock;
    struct sockaddr_in srv_addr;

    sock = socket(PF_INET, SOCK_STREAM, 0);
    if (sock == -1)
        handle_error("socket()");

    int enable = 1;
    if (setsockopt(sock,
                   SOL_SOCKET, SO_REUSEADDR,
                   &enable, sizeof(int)) < 0)
        handle_error("setsockopt(SO_REUSEADDR)");


    memset(&srv_addr, 0, sizeof(srv_addr));
    srv_addr.sin_family = AF_INET;
    srv_addr.sin_port = htons(port);
    srv_addr.sin_addr.s_addr = htonl(INADDR_ANY);

    /* We bind to a port and turn this socket into a listening
     * socket.
     * */
    if (bind(sock,
             (const struct sockaddr *)&srv_addr,
             sizeof(srv_addr)) < 0)
        handle_error("bind()");

    if (listen(sock, 10) < 0)
        handle_error("listen()");

    return (sock);
}

/*
 * Reads 1kb from the "in" file descriptor and
 * writes it to the "out" file descriptor.
 */

void copy_fd(int in, int out) {
    char buff[1024];
    int bytes_read;

    bzero(buff, sizeof(buff));
    bytes_read = read(in, buff, sizeof(buff)-1 );
    if (bytes_read == -1)
        handle_error("read");
    else if (bytes_read == 0)
        return;
    write(out, buff, strlen(buff));
}

/*
 * If a parsable number is passed as the 1st argument to the
 * program, sets up SIGALRM to be sent to self the specified
 * seconds later.
 * */

void setup_signals(int argc, char **argv) {
    struct sigaction sa;

    /* No argument passed, and so no signal will be delivered */
    if (argc < 2) {
        printf("No alarm set. Will not be interrupted.\n");
        return;
    }

    /*  if a proper number is passed, we setup the alarm,
     * else we return without setting one up.
     * */
    errno = 0;
    long alarm_after = strtol(argv[1], NULL, 10);
    if (errno)
        handle_error("strtol()");
    if (alarm_after)
        printf("Alarm after %ld seconds.\n", alarm_after);
    else {
        printf("No alarm set. Will not be interrupted.\n");
        return;
    }

    /*
     * Setup a signal handler for the SIGALRM signal
     * */
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;
    sa.sa_handler = sigalrm_handler;
    if (sigaction(SIGALRM, &sa, NULL) == -1)
        handle_error("sigaction");

    /*
     * Let's send ourselves a SIGALRM signal specified
     * seconds later.
     * */
    alarm(alarm_after);
}

/**
 * Helper function to setup epoll
 */

void setup_epoll() {
    epollfd = epoll_create1(0);
    if (epollfd == -1)
        handle_error("epoll_create1()");
}

/**
 * Adds the file descriptor passed to be monitored by epoll
 * */
void add_fd_to_epoll(int fd) {
    /* Add fd to be monitored by epoll */
    ev.events = EPOLLIN;
    ev.data.fd = fd;
    if (epoll_ctl(epollfd, EPOLL_CTL_ADD, fd, &ev) == -1)
        handle_error("epoll_ctl");
}

int main(int argc, char *argv[]) {
    /* Setup sigalrm if a number is passed as the first argument */
    setup_signals(argc, argv);
    /* Let's setup epoll */
    setup_epoll();
    /* Add stdin-based echo server to epoll's monitoring list */
    add_fd_to_epoll(STDIN_FILENO);
    /* Setup a socket to listen on port 5000 */
    listen_sock = setup_listening_socket(5000);
    /* Add socket-based echo server to epoll's monitoring list */
    add_fd_to_epoll(listen_sock);

    while(1) {
        /* Let's wait for some activity on either stdin or on the socket */
        nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
        if (nfds == -1)
            handle_error("epoll_wait()");

        /*
         * For each of the file descriptors epoll says are ready,
         * check which one it is the echo read data back.
         * */
        for (int n = 0; n < nfds; n++) {
            if ( events[n].data.fd == STDIN_FILENO ) {
                printf("stdin ready..\n");
                copy_fd(STDIN_FILENO, STDOUT_FILENO);
            } else if ( events[n].data.fd == conn_sock ) {
                printf("socket data ready..\n");
                copy_fd(conn_sock, conn_sock);
            } else if (events[n].data.fd == listen_sock) {
                /* Listening socket is ready, meaning
                 * there's a new client connection */
                printf("new connection ready..\n");
                conn_sock = accept(listen_sock, NULL, NULL);
                if (conn_sock == -1 )
                    handle_error("accept()");
                /* Add the connected client to epoll's monitored FDs list */
                add_fd_to_epoll(conn_sock);
            }
        }
    }
    return 0;
}

This example is very simple. With the help of Linux’s `epoll` family of system calls, we are able to create two echo servers in the same program. One that listens on `stdin` and echoes back to `stdout` and another that listens on a socket and echoes back to the same socket. When you run this program, you can specify an optional command line argument, which is the number of seconds after which it sets up `SIGALRM` to be delivered to itself. For example if you run the program with the argument `10`, with the help of `alarm(2)`, it will setup `SIGALRM` to be delivered to itself 10 seconds after it starts running.

You can use a program like `nc` or `telnet` to connect to port `5000`, on which our program listens, so that you can play around with its over-the-socket echo server. Since `epoll` can handle more than one input at the same time, we have our little echo program which listens on both `stdin` and a TCP socket at the same time.

We saw from the `signal(7)`man page snippet above that the `epoll_wait(2)` never restarts when it is interrupted by a signal. To test this, run the program passing in the number of seconds after which it should receive a signal as the first argument. You should see an `Interrupted system call` error message. This is in spite of the fact that we’ve specified `SA_RESTART`.

shuveb@casablanca » ./03_signal_epoll 2
Alarm after 2 seconds.
Received SIGALRM
epoll_wait(): Interrupted system call
shuveb@casablanca »

If your program isn’t supposed to come to a complete halt waiting for user input, your choices are that you use threads or a mechanism like `epoll` which allows you to multiplex I/O sources. And `epoll` usage is fairly common. When that is indeed the case, how does one handle signals without adding a super ugly loop around `epoll_wait()` and other system calls that can’t be restarted, to deal with signals like in the following snippet?

 nfds = epoll\_wait(epollfd, events, MAX\_EVENTS, -1);

if (nfds == -1 && errno == EINTR)

while (1) { nfds = epoll\_wait(epollfd, events, MAX\_EVENTS, -1); if (nfds == -1 && errno == EINTR) continue; else handle\_error(); }

while (1) {
    nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
        if (nfds == -1 && errno == EINTR)
            continue;
        else
            handle_error();
}

**Side note:** If you prefer handling the interrupted system call problem with a loop like this, `glibc` makes it a little easier (and visually, a bit more palatable) with a macro, `TEMP_FAILURE_RETRY`. But, we’ll look at better ways of handling this, of course.

## Making signal handling synchronous

The trouble so far then, with Unix signals seems to be the fact they are asynchronous in nature. Fortunately though, Linux has a mechanism that can turn asynchronous signals into synchronous events that can be handled by `epoll`. It’s a great idea, really. If signals can be delivered via a file descriptor, much like data, then existing I/O multiplexing mechanisms like `epoll` can be used to handle signals much like we handle other file descriptors that represent local files or sockets.

This is exactly the idea behind Linux’s `signalfd(2)` system call. Let’s look at the example `04_signalfd_epoll.c`. Functionally, this example is similar to that of the previous `03_signal_epoll.c`, in that it uses `epoll` to create an echo server that simultaneously listens on both `stdin` and a TCP socket on port 5000\. We saw that when a signal is caught and the previous example is blocked on `epoll_wait()`, the system call does not restart and the program terminates. In this new example, we use `signalfd(2)` to setup an additional file descriptor that delivers signals. The program is never asynchronously interrupted in order to run a signal handler when a signal is delivered. Rather, once `SIGALRM` and `SIGQUIT` are setup with `signalfd(2)`, those signals make the signal file descriptor which was returned by `signalfd()` ready so that `epoll_wait(2)` can unblock and details about the signal received can be inferred and processed.

When signals are handled this way, there is no need to add special conditions after each system call to check if they were interrupted. This mechanism keeps the code way cleaner and makes the program a lot more readable/predictable.

#include <sys/signalfd.h>

#define handle\_error(msg) \\

do { perror(msg); exit(EXIT\_FAILURE); } while (0)

struct epoll\_event ev, events\[MAX\_EVENTS\];

int listen\_sock, conn\_sock, nfds, epollfd, sfd;

 \* This function is responsible for setting up the

 \* listening socket for the socket-based echo

 \* functionality. Pretty standard stuff.

int setup\_listening\_socket(int port) {

struct sockaddr\_in srv\_addr;

 sock = socket(PF\_INET, SOCK\_STREAM, 0);

handle\_error("socket()");

 SOL\_SOCKET, SO\_REUSEADDR,

 &enable, sizeof(int)) < 0)

handle\_error("setsockopt(SO\_REUSEADDR)");

memset(&srv\_addr, 0, sizeof(srv\_addr));

 srv\_addr.sin\_family \= AF\_INET;

 srv\_addr.sin\_port \= htons(port);

 srv\_addr.sin\_addr.s\_addr \= htonl(INADDR\_ANY);

/\* We bind to a port and turn this socket into a listening

(const struct sockaddr \*)&srv\_addr,

if (listen(sock, 10) < 0)

handle\_error("listen()");

 \* Reads 1kb from the "in" file descriptor and

 \* writes it to the "out" file descriptor.

void copy\_fd(int in, int out) {

bzero(buff, sizeof(buff));

 bytes\_read = read(in, buff, sizeof(buff)\-1 );

else if (bytes\_read == 0)

write(out, buff, strlen(buff));

 \* If a parsable number is passed as the 1st argument to the

 \* program, sets up SIGALRM to be sent to self the specified

void setup\_signals(int argc, char \*\*argv) {

/\* No argument passed. Let's set a default interval of 5\. \*/

printf("No alarm set. Will default to 5 seconds.\\n");

/\* if a proper number is passed, we setup the alarm,

 \* else we return without setting one up.

 alarm\_after = strtol(argv\[1\], NULL, 10);

handle\_error("strtol()");

printf("Alarm set every %ld seconds.\\n", alarm\_after);

printf("No alarm set. Will default to 5 seconds.\\n");

 \* Setup SIGALRM to be delivered via SignalFD

sigaddset(&mask, SIGALRM);

sigaddset(&mask, SIGQUIT);

 \* Block these signals so that they are not handled

 \* in the usual way. We want them to be handled via

if (sigprocmask(SIG\_BLOCK, &mask, NULL) \== -1)

handle\_error("sigprocmask");

 sfd = signalfd(\-1, &mask, 0);

handle\_error("signalfd");

 \* Let's send ourselves a SIGALRM signal every specified

 itv.it\_interval.tv\_sec \= alarm\_after;

 itv.it\_interval.tv\_usec \= 0;

 itv.it\_value \= itv.it\_interval;

if (setitimer(ITIMER\_REAL, &itv, NULL) \== -1)

handle\_error("setitimer()");

 \* Helper function to setup epoll

 epollfd = epoll\_create1(0);

handle\_error("epoll\_create1()");

 \* Adds the file descriptor passed to be monitored by epoll

void add\_fd\_to\_epoll(int fd) {

/\* Add fd to be monitored by epoll \*/

if (epoll\_ctl(epollfd, EPOLL\_CTL\_ADD, fd, &ev) \== -1)

handle\_error("epoll\_ctl");

 \* This is not a signal handler in the traditional sense.

 \* Signal handlers are invoked by the kernel asynchronously.

 \* Meaning, we have no control over when it's invoked and

 \* if we need to restart any system calls.

 \* This function is invoked from our epoll based event loop

 \* synchronously. Meaning, we have full control over when we

 \* invoke this function call. And we do not interrupt any

 \* system calls. This makes error handling much simpler in

struct signalfd\_siginfo sfd\_si;

if (read(sfd, &sfd\_si, sizeof(sfd\_si)) \== -1)

if (sfd\_si.ssi\_signo \== SIGALRM)

printf("Got SIGALRM via SignalFD.\\n");

else if (sfd\_si.ssi\_signo \== SIGQUIT) {

printf("Got SIGQUIT. Will exit.\\n");

printf("Got unexpected signal!\\n");

int main(int argc, char \*argv\[\]) {

/\* Add stdin-based echo server to epoll's monitoring list \*/

add\_fd\_to\_epoll(STDIN\_FILENO);

/\* Setup a socket to listen on port 5000 \*/

 listen\_sock = setup\_listening\_socket(5000);

/\* Add socket-based echo server to epoll's monitoring list \*/

add\_fd\_to\_epoll(listen\_sock);

/\* Setup sigalrm+sigquit if a number is passed as the first argument \*/

setup\_signals(argc, argv);

/\* Add the SignalFD file descriptor to epoll's monitoring list \*/

/\* Let's wait for some activity on either stdin or on the socket \*/

 nfds = epoll\_wait(epollfd, events, MAX\_EVENTS, -1);

handle\_error("epoll\_wait()");

 \* For each of the file descriptors epoll says are ready,

 \* check which one it is the echo read data back.

for (int n = 0; n < nfds; n++) {

if ( events\[n\].data.fd \== STDIN\_FILENO ) {

printf("stdin ready..\\n");

copy\_fd(STDIN\_FILENO, STDOUT\_FILENO);

} else if ( events\[n\].data.fd \== conn\_sock ) {

printf("socket data ready..\\n");

copy\_fd(conn\_sock, conn\_sock);

} else if (events\[n\].data.fd \== listen\_sock) {

/\* Listening socket is ready, meaning

 \* there's a new client connection \*/

printf("new connection ready..\\n");

 conn\_sock = accept(listen\_sock, NULL, NULL);

handle\_error("accept()");

/\* Add the connected client to epoll's monitored FDs list \*/

add\_fd\_to\_epoll(conn\_sock);

} else if (events\[n\].data.fd \== sfd) {

#include <stdio.h> #include <netinet/in.h> #include <string.h> #include <unistd.h> #include <stdlib.h> #include <signal.h> #include <sys/epoll.h> #include <sys/signalfd.h> #include <sys/time.h> #include <errno.h> #define handle\_error(msg) \\ do { perror(msg); exit(EXIT\_FAILURE); } while (0) #define MAX\_EVENTS 10 struct epoll\_event ev, events\[MAX\_EVENTS\]; int listen\_sock, conn\_sock, nfds, epollfd, sfd; /\*\* \* This function is responsible for setting up the \* listening socket for the socket-based echo \* functionality. Pretty standard stuff. \* \*/ int setup\_listening\_socket(int port) { int sock; struct sockaddr\_in srv\_addr; sock = socket(PF\_INET, SOCK\_STREAM, 0); if (sock == -1) handle\_error("socket()"); int enable = 1; if (setsockopt(sock, SOL\_SOCKET, SO\_REUSEADDR, &enable, sizeof(int)) < 0) handle\_error("setsockopt(SO\_REUSEADDR)"); memset(&srv\_addr, 0, sizeof(srv\_addr)); srv\_addr.sin\_family = AF\_INET; srv\_addr.sin\_port = htons(port); srv\_addr.sin\_addr.s\_addr = htonl(INADDR\_ANY); /\* We bind to a port and turn this socket into a listening \* socket. \* \*/ if (bind(sock, (const struct sockaddr \*)&srv\_addr, sizeof(srv\_addr)) < 0) handle\_error("bind()"); if (listen(sock, 10) < 0) handle\_error("listen()"); return (sock); } /\*\* \* Reads 1kb from the "in" file descriptor and \* writes it to the "out" file descriptor. \*/ void copy\_fd(int in, int out) { char buff\[1024\]; int bytes\_read; bzero(buff, sizeof(buff)); bytes\_read = read(in, buff, sizeof(buff)-1 ); if (bytes\_read == -1) handle\_error("read"); else if (bytes\_read == 0) return; write(out, buff, strlen(buff)); } /\*\* \* If a parsable number is passed as the 1st argument to the \* program, sets up SIGALRM to be sent to self the specified \* seconds later. \* \*/ void setup\_signals(int argc, char \*\*argv) { sigset\_t mask; long alarm\_after = 0; /\* No argument passed. Let's set a default interval of 5\. \*/ if (argc < 2) { printf("No alarm set. Will default to 5 seconds.\\n"); alarm\_after = 5; } /\* if a proper number is passed, we setup the alarm, \* else we return without setting one up. \* \*/ errno = 0; if (alarm\_after == 0) { alarm\_after = strtol(argv\[1\], NULL, 10); if (errno) handle\_error("strtol()"); if (alarm\_after) printf("Alarm set every %ld seconds.\\n", alarm\_after); else { printf("No alarm set. Will default to 5 seconds.\\n"); return; } } /\* \* Setup SIGALRM to be delivered via SignalFD \* \*/ sigemptyset(&mask); sigaddset(&mask, SIGALRM); sigaddset(&mask, SIGQUIT); /\* \* Block these signals so that they are not handled \* in the usual way. We want them to be handled via \* SignalFD. \* \*/ if (sigprocmask(SIG\_BLOCK, &mask, NULL) == -1) handle\_error("sigprocmask"); sfd = signalfd(-1, &mask, 0); if (sfd == -1) handle\_error("signalfd"); /\* \* Let's send ourselves a SIGALRM signal every specified \* seconds continuously. \* \*/ struct itimerval itv; itv.it\_interval.tv\_sec = alarm\_after; itv.it\_interval.tv\_usec = 0; itv.it\_value = itv.it\_interval; if (setitimer(ITIMER\_REAL, &itv, NULL) == -1) handle\_error("setitimer()"); } /\*\* \* Helper function to setup epoll \*/ void setup\_epoll() { epollfd = epoll\_create1(0); if (epollfd == -1) handle\_error("epoll\_create1()"); } /\*\* \* Adds the file descriptor passed to be monitored by epoll \* \*/ void add\_fd\_to\_epoll(int fd) { /\* Add fd to be monitored by epoll \*/ ev.events = EPOLLIN; ev.data.fd = fd; if (epoll\_ctl(epollfd, EPOLL\_CTL\_ADD, fd, &ev) == -1) handle\_error("epoll\_ctl"); } /\*\* \* This is not a signal handler in the traditional sense. \* Signal handlers are invoked by the kernel asynchronously. \* Meaning, we have no control over when it's invoked and \* if we need to restart any system calls. \* This function is invoked from our epoll based event loop \* synchronously. Meaning, we have full control over when we \* invoke this function call. And we do not interrupt any \* system calls. This makes error handling much simpler in \* our programs. \*/ void handle\_signals() { struct signalfd\_siginfo sfd\_si; if (read(sfd, &sfd\_si, sizeof(sfd\_si)) == -1) handle\_error("read()"); if (sfd\_si.ssi\_signo == SIGALRM) printf("Got SIGALRM via SignalFD.\\n"); else if (sfd\_si.ssi\_signo == SIGQUIT) { printf("Got SIGQUIT. Will exit.\\n"); exit(0); } else printf("Got unexpected signal!\\n"); } int main(int argc, char \*argv\[\]) { /\* Let's setup epoll \*/ setup\_epoll(); /\* Add stdin-based echo server to epoll's monitoring list \*/ add\_fd\_to\_epoll(STDIN\_FILENO); /\* Setup a socket to listen on port 5000 \*/ listen\_sock = setup\_listening\_socket(5000); /\* Add socket-based echo server to epoll's monitoring list \*/ add\_fd\_to\_epoll(listen\_sock); /\* Setup sigalrm+sigquit if a number is passed as the first argument \*/ setup\_signals(argc, argv); /\* Add the SignalFD file descriptor to epoll's monitoring list \*/ add\_fd\_to\_epoll(sfd); while(1) { /\* Let's wait for some activity on either stdin or on the socket \*/ nfds = epoll\_wait(epollfd, events, MAX\_EVENTS, -1); if (nfds == -1) handle\_error("epoll\_wait()"); /\* \* For each of the file descriptors epoll says are ready, \* check which one it is the echo read data back. \* \*/ for (int n = 0; n < nfds; n++) { if ( events\[n\].data.fd == STDIN\_FILENO ) { printf("stdin ready..\\n"); copy\_fd(STDIN\_FILENO, STDOUT\_FILENO); } else if ( events\[n\].data.fd == conn\_sock ) { printf("socket data ready..\\n"); copy\_fd(conn\_sock, conn\_sock); } else if (events\[n\].data.fd == listen\_sock) { /\* Listening socket is ready, meaning \* there's a new client connection \*/ printf("new connection ready..\\n"); conn\_sock = accept(listen\_sock, NULL, NULL); if (conn\_sock == -1 ) handle\_error("accept()"); /\* Add the connected client to epoll's monitored FDs list \*/ add\_fd\_to\_epoll(conn\_sock); } else if (events\[n\].data.fd == sfd) { handle\_signals(); } } } return 0; }

#include <stdio.h>
#include <netinet/in.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <sys/epoll.h>
#include <sys/signalfd.h>
#include <sys/time.h>
#include <errno.h>

#define handle_error(msg) \
           do { perror(msg); exit(EXIT_FAILURE); } while (0)

#define MAX_EVENTS          10

struct epoll_event ev, events[MAX_EVENTS];
int listen_sock, conn_sock, nfds, epollfd, sfd;

/**
 * This function is responsible for setting up the
 * listening socket for the socket-based echo
 * functionality. Pretty standard stuff.
 * */

int setup_listening_socket(int port) {
    int sock;
    struct sockaddr_in srv_addr;

    sock = socket(PF_INET, SOCK_STREAM, 0);
    if (sock == -1)
        handle_error("socket()");

    int enable = 1;
    if (setsockopt(sock,
                   SOL_SOCKET, SO_REUSEADDR,
                   &enable, sizeof(int)) < 0)
        handle_error("setsockopt(SO_REUSEADDR)");


    memset(&srv_addr, 0, sizeof(srv_addr));
    srv_addr.sin_family = AF_INET;
    srv_addr.sin_port = htons(port);
    srv_addr.sin_addr.s_addr = htonl(INADDR_ANY);

    /* We bind to a port and turn this socket into a listening
     * socket.
     * */
    if (bind(sock,
             (const struct sockaddr *)&srv_addr,
             sizeof(srv_addr)) < 0)
        handle_error("bind()");

    if (listen(sock, 10) < 0)
        handle_error("listen()");

    return (sock);
}

/**
 * Reads 1kb from the "in" file descriptor and
 * writes it to the "out" file descriptor.
 */

void copy_fd(int in, int out) {
    char buff[1024];
    int bytes_read;

    bzero(buff, sizeof(buff));
    bytes_read = read(in, buff, sizeof(buff)-1 );
    if (bytes_read == -1)
        handle_error("read");
    else if (bytes_read == 0)
        return;
    write(out, buff, strlen(buff));
}

/**
 * If a parsable number is passed as the 1st argument to the
 * program, sets up SIGALRM to be sent to self the specified
 * seconds later.
 * */

void setup_signals(int argc, char **argv) {
    sigset_t mask;
    long alarm_after = 0;

    /* No argument passed. Let's set a default interval of 5. */
    if (argc < 2) {
        printf("No alarm set. Will default to 5 seconds.\n");
        alarm_after = 5;
    }

    /*  if a proper number is passed, we setup the alarm,
     * else we return without setting one up.
     * */
    errno = 0;
    if (alarm_after == 0) {
        alarm_after = strtol(argv[1], NULL, 10);
        if (errno)
            handle_error("strtol()");
        if (alarm_after)
            printf("Alarm set every %ld seconds.\n", alarm_after);
        else {
            printf("No alarm set. Will default to 5 seconds.\n");
            return;
        }
    }

    /*
     * Setup SIGALRM to be delivered via SignalFD
     * */
    sigemptyset(&mask);
    sigaddset(&mask, SIGALRM);
    sigaddset(&mask, SIGQUIT);

    /*
     * Block these signals so that they are not handled
     * in the usual way. We want them to be handled via
     * SignalFD.
     * */
    if (sigprocmask(SIG_BLOCK, &mask, NULL) == -1)
        handle_error("sigprocmask");

    sfd = signalfd(-1, &mask, 0);
    if (sfd == -1)
        handle_error("signalfd");

    /*
     * Let's send ourselves a SIGALRM signal every specified
     * seconds continuously.
     * */
    struct itimerval itv;
    itv.it_interval.tv_sec = alarm_after;
    itv.it_interval.tv_usec = 0;
    itv.it_value = itv.it_interval;
    if (setitimer(ITIMER_REAL, &itv, NULL) == -1)
        handle_error("setitimer()");
}

/**
 * Helper function to setup epoll
 */

void setup_epoll() {
    epollfd = epoll_create1(0);
    if (epollfd == -1)
        handle_error("epoll_create1()");
}

/**
 * Adds the file descriptor passed to be monitored by epoll
 * */
void add_fd_to_epoll(int fd) {
    /* Add fd to be monitored by epoll */
    ev.events = EPOLLIN;
    ev.data.fd = fd;
    if (epoll_ctl(epollfd, EPOLL_CTL_ADD, fd, &ev) == -1)
        handle_error("epoll_ctl");
}
/**
 * This is not a signal handler in the traditional sense.
 * Signal handlers are invoked by the kernel asynchronously.
 * Meaning, we have no control over when it's invoked and
 * if we need to restart any system calls.
 * This function is invoked from our epoll based event loop
 * synchronously. Meaning, we have full control over when we
 * invoke this function call. And we do not interrupt any
 * system calls. This makes error handling much simpler in
 * our programs.
 */
void handle_signals() {
    struct signalfd_siginfo sfd_si;
    if (read(sfd, &sfd_si, sizeof(sfd_si)) == -1)
        handle_error("read()");

    if (sfd_si.ssi_signo == SIGALRM)
        printf("Got SIGALRM via SignalFD.\n");
    else if (sfd_si.ssi_signo == SIGQUIT) {
        printf("Got SIGQUIT. Will exit.\n");
        exit(0);
    }
    else
        printf("Got unexpected signal!\n");
}

int main(int argc, char *argv[]) {
    /* Let's setup epoll */
    setup_epoll();
    /* Add stdin-based echo server to epoll's monitoring list */
    add_fd_to_epoll(STDIN_FILENO);
    /* Setup a socket to listen on port 5000 */
    listen_sock = setup_listening_socket(5000);
    /* Add socket-based echo server to epoll's monitoring list */
    add_fd_to_epoll(listen_sock);
    /* Setup sigalrm+sigquit if a number is passed as the first argument */
    setup_signals(argc, argv);
    /* Add the SignalFD file descriptor to epoll's monitoring list */
    add_fd_to_epoll(sfd);

    while(1) {
        /* Let's wait for some activity on either stdin or on the socket */
        nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
        if (nfds == -1)
            handle_error("epoll_wait()");

        /*
         * For each of the file descriptors epoll says are ready,
         * check which one it is the echo read data back.
         * */
        for (int n = 0; n < nfds; n++) {
            if ( events[n].data.fd == STDIN_FILENO ) {
                printf("stdin ready..\n");
                copy_fd(STDIN_FILENO, STDOUT_FILENO);
            } else if ( events[n].data.fd == conn_sock ) {
                printf("socket data ready..\n");
                copy_fd(conn_sock, conn_sock);
            } else if (events[n].data.fd == listen_sock) {
                /* Listening socket is ready, meaning
                 * there's a new client connection */
                printf("new connection ready..\n");
                conn_sock = accept(listen_sock, NULL, NULL);
                if (conn_sock == -1 )
                    handle_error("accept()");
                /* Add the connected client to epoll's monitored FDs list */
                add_fd_to_epoll(conn_sock);
            } else if (events[n].data.fd == sfd) {
                handle_signals();
            }
        }
    }
    return 0;
}

Compared to the previous example, apart from the fact that this program uses `signalfd(2)` to handle signals, another difference is that we use `setitimer(2)` to continuously deliver `SIGALRM` at the specified interval, rather than using `alarm(2)` to deliver the signal just once. This allows us to see how signals can be seamlessly woven into the event loop created by `epoll_wait(2)`.

shuveb@casablanca » ./04_signalfd_epoll 5
 Alarm after 5 seconds.
 Hello
 stdin ready..
 Hello
 World
 stdin ready..
 World
 Got SIGALRM via SignalFD.
 new connection ready..
 Got SIGALRM via SignalFD.
 socket data ready..
 ^\Got SIGQUIT. Will exit.

In the output from the sample session above, you see our example program running. We set the internal timer to 5 seconds, which causes `SIGALRM` to be delivered every 5 seconds. We also type into the terminal which the program echoes. From another terminal, we also connect to the program using `nc` over port 5000 (by running `nc localhost 5000`) and get the echo functionality over the network to work as well. We see how `epoll_wait(2)` is able to deal with all 3 forms of inputs without the problem of being interrupted by signals.

This program displays the text `Got SIGALRM via SignalFD` when it gets `SIGALRM` and is designed to exit when it encounters `SIGQUIT`, which you can send it by typing in `Ctrl+\` at the terminal while it’s running.

## Avoiding race conditions while sending signals

The `kill(2)` system call is used to send signals to a some process, identified by it’s process ID or PID. Here’s the prototype of `kill(2)`:

int kill(pid_t pid, int sig);

Here’s the trouble: there’s a race condition. By the time you look up a process’s PID and send it a signal, that process could have exited and the kernel could have assigned the same PID to another process. Your program could then send a signal to another, completely different process it did not intent to send to. Sounds more like an edge case, right? Unfortunately, there have been [vulnerabilities reported because of this](https://lwn.net/ml/linux-kernel/CAG48ez2gb94SqS30Ai4+VBHhnzBp5Po9%5Fu00nMrvUW6Wqq6hPA@mail.gmail.com/). This is indeed a real problem.

You might think this problem might not occur when there’s a parent-child relationship where the parent sends signals to a child. A parent sending signals to a child is a very common use of signals indeed. The kernel won’t reuse a child’s PID even if the child terminates unless the parent calls one of the `wait()` family of system calls on the child. The child remains in a zombie state, while retaining it’s PID. This is true. However, many programs call `wait()` in a thread to keep reaping terminated child processes. In this case, when sending a signal, it indeed could land on another process.

The only way this race condition can be avoided is by making creation of a process and getting a reference to it atomic. And this reference can’t be the usual PID. This avoids the race condition during lookup when the process potentially could have exited. Since Linux 5.2, we have an answer for this problem in the `clone3(2)` system call.

### Enter pidfd

The `clone3(2)` system call has a new flag `CLONE_PIDFD` which provides a `pidfd` or a file descriptor that refers to a `pid` (really, it refers to a process and should have probably been called `procfd`!). This `pidfd` can then be treated as a regular file descriptor which can be monitored using `epoll_wait(2)`. More importantly, you can send a signal to the process referred to by this pidfd using the `pidfd_send_signal(2)` system call, safely avoiding potential race conditions.

Let’s see example `05_pidfd_epoll.c` which demonstrates the use of `pidfd` in combination with `epoll` to check for child process termination while using `signalfd` to handle signals synchronously.

#include <sys/signalfd.h>

#define handle\_error(msg) \\

do { perror(msg); exit(EXIT\_FAILURE); } while (0)

static int pidfd\_send\_signal(int pidfd, int sig, siginfo\_t \*info,

return (int) syscall(\_\_NR\_pidfd\_send\_signal, pidfd, sig, info,

static pid\_t sys\_clone3(struct clone\_args \*args)

return syscall(\_\_NR\_clone3, args, sizeof(struct clone\_args));

#define ptr\_to\_u64(ptr) ((\_\_u64)((uintptr\_t)(ptr)))

struct epoll\_event ev, events\[MAX\_EVENTS\];

int nfds, epollfd, sfd, pidfd;

 \* If a parsable number is passed as the 1st argument to the

 \* program, sets up SIGALRM to be sent to self the specified

void setup\_signals(int argc, char \*\*argv) {

/\* No argument passed, and so no signal will be delivered \*/

printf("No alarm set. Will not be interrupted.\\n");

/\* if a proper number is passed, we setup the alarm,

 \* else we return without setting one up.

long alarm\_after = strtol(argv\[1\], NULL, 10);

handle\_error("strtol()");

printf("Alarm after %ld seconds.\\n", alarm\_after);

printf("No alarm set. Will not be interrupted.\\n");

 \* Setup SIGALRM to be delivered via SignalFD

sigaddset(&mask, SIGALRM);

sigaddset(&mask, SIGQUIT);

 \* Block these signals so that they are not handled

 \* in the usual way. We want them to be handled via

if (sigprocmask(SIG\_BLOCK, &mask, NULL) \== -1)

handle\_error("sigprocmask");

 sfd = signalfd(\-1, &mask, 0);

handle\_error("signalfd");

 \* Let's send ourselves a SIGALRM signal every specified

 itv.it\_interval.tv\_sec \= alarm\_after;

 itv.it\_interval.tv\_usec \= 0;

 itv.it\_value \= itv.it\_interval;

if (setitimer(ITIMER\_REAL, &itv, NULL) \== -1)

handle\_error("setitimer()");

 \* Helper function to setup epoll

 epollfd = epoll\_create1(0);

handle\_error("epoll\_create1()");

 \* Adds the file descriptor passed to be monitored by epoll

void add\_fd\_to\_epoll(int fd) {

/\* Add fd to be monitored by epoll \*/

if (epoll\_ctl(epollfd, EPOLL\_CTL\_ADD, fd, &ev) \== -1)

handle\_error("epoll\_ctl");

 \* This isn't really a signal handler in the traditional sense,

 \* which is called asynchronously. This function is called

 \* synchronously from epoll's event loop.

struct signalfd\_siginfo sfd\_si;

if (read(sfd, &sfd\_si, sizeof(sfd\_si)) \== -1)

if (sfd\_si.ssi\_signo \== SIGALRM)

printf("Got SIGALRM via SignalFD.\\n");

else if (sfd\_si.ssi\_signo \== SIGQUIT) {

printf("Got SIGQUIT. Will exit.\\n");

pidfd\_send\_signal(pidfd, SIGINT, NULL, 0);

printf("Got unexpected signal!\\n");

/\* This is the child's SIGINT handler. The child is setup

 \* to get a regular SIGINT when the parent receives a

 \* SIGQUIT (for which you press Ctrl+\\

void childs\_sigint\_handler(int signo) {

printf("Child got SIGINT. Quitting.\\n");

 \* Create a child with the clone3() system call so we get

 \* a PIDFD which we can use to monitor the child's exit

 \* and also use to sent it a signal in a race-free manner.

struct clone\_args args = {

 .pidfd = ptr\_to\_u64(&pidfd),

signal(SIGINT, childs\_sigint\_handler);

printf("In child process. Sleeping..\\n");

printf("Exiting child process.\\n");

printf("Adding child PID %d with pidfd %d"

"to be monitored by epoll.\\n",

/\* We have the pidfd returned by clone3().

 \* Add it to epoll's monitoring list. \*/

int main(int argc, char \*argv\[\]) {

/\* Setup sigalrm+sigquit if a number is passed as the first argument \*/

setup\_signals(argc, argv);

/\* Add the SignalFD file descriptor to epoll's monitoring list \*/

/\* Let's wait for some activity on either stdin or on the socket \*/

 nfds = epoll\_wait(epollfd, events, MAX\_EVENTS, -1);

handle\_error("epoll\_wait()");

 \* For each of the file descriptors epoll says are ready,

 \* check which one it is the echo read data back.

for (int n = 0; n < nfds; n++) {

if ( events\[n\].data.fd \== pidfd ) {

printf("Child exited, creating new child..\\n");

/\* We're done using the pidfd that pointed to the child

 \* process that just exited \*/

} else if (events\[n\].data.fd \== sfd) {

/\* Looks like we got some other signal, let's handle it \*/

#include <stdio.h> #include <string.h> #include <unistd.h> #include <stdlib.h> #include <signal.h> #include <sys/epoll.h> #include <sys/signalfd.h> #include <sys/time.h> #include <errno.h> #include <syscall.h> #include <linux/sched.h> #define handle\_error(msg) \\ do { perror(msg); exit(EXIT\_FAILURE); } while (0) #define MAX\_EVENTS 10 static int pidfd\_send\_signal(int pidfd, int sig, siginfo\_t \*info, unsigned int flags) { return (int) syscall(\_\_NR\_pidfd\_send\_signal, pidfd, sig, info, flags); } static pid\_t sys\_clone3(struct clone\_args \*args) { return syscall(\_\_NR\_clone3, args, sizeof(struct clone\_args)); } #define ptr\_to\_u64(ptr) ((\_\_u64)((uintptr\_t)(ptr))) struct epoll\_event ev, events\[MAX\_EVENTS\]; int nfds, epollfd, sfd, pidfd; /\*\* \* If a parsable number is passed as the 1st argument to the \* program, sets up SIGALRM to be sent to self the specified \* seconds later. \* \*/ void setup\_signals(int argc, char \*\*argv) { sigset\_t mask; /\* No argument passed, and so no signal will be delivered \*/ if (argc < 2) { printf("No alarm set. Will not be interrupted.\\n"); return; } /\* if a proper number is passed, we setup the alarm, \* else we return without setting one up. \* \*/ errno = 0; long alarm\_after = strtol(argv\[1\], NULL, 10); if (errno) handle\_error("strtol()"); if (alarm\_after) printf("Alarm after %ld seconds.\\n", alarm\_after); else { printf("No alarm set. Will not be interrupted.\\n"); return; } /\* \* Setup SIGALRM to be delivered via SignalFD \* \*/ sigemptyset(&mask); sigaddset(&mask, SIGALRM); sigaddset(&mask, SIGQUIT); /\* \* Block these signals so that they are not handled \* in the usual way. We want them to be handled via \* SignalFD. \* \*/ if (sigprocmask(SIG\_BLOCK, &mask, NULL) == -1) handle\_error("sigprocmask"); sfd = signalfd(-1, &mask, 0); if (sfd == -1) handle\_error("signalfd"); /\* \* Let's send ourselves a SIGALRM signal every specified \* seconds continuously. \* \*/ struct itimerval itv; itv.it\_interval.tv\_sec = alarm\_after; itv.it\_interval.tv\_usec = 0; itv.it\_value = itv.it\_interval; if (setitimer(ITIMER\_REAL, &itv, NULL) == -1) handle\_error("setitimer()"); } /\*\* \* Helper function to setup epoll \*/ void setup\_epoll() { epollfd = epoll\_create1(0); if (epollfd == -1) handle\_error("epoll\_create1()"); } /\*\* \* Adds the file descriptor passed to be monitored by epoll \* \*/ void add\_fd\_to\_epoll(int fd) { /\* Add fd to be monitored by epoll \*/ ev.events = EPOLLIN; ev.data.fd = fd; if (epoll\_ctl(epollfd, EPOLL\_CTL\_ADD, fd, &ev) == -1) handle\_error("epoll\_ctl"); } /\*\* \* This isn't really a signal handler in the traditional sense, \* which is called asynchronously. This function is called \* synchronously from epoll's event loop. \*/ void handle\_signals() { struct signalfd\_siginfo sfd\_si; if (read(sfd, &sfd\_si, sizeof(sfd\_si)) == -1) handle\_error("read()"); if (sfd\_si.ssi\_signo == SIGALRM) printf("Got SIGALRM via SignalFD.\\n"); else if (sfd\_si.ssi\_signo == SIGQUIT) { printf("Got SIGQUIT. Will exit.\\n"); pidfd\_send\_signal(pidfd, SIGINT, NULL, 0); exit(0); } else printf("Got unexpected signal!\\n"); } /\* This is the child's SIGINT handler. The child is setup \* to get a regular SIGINT when the parent receives a \* SIGQUIT (for which you press Ctrl+\\ \* \*/ void childs\_sigint\_handler(int signo) { printf("Child got SIGINT. Quitting.\\n"); } /\* \* Create a child with the clone3() system call so we get \* a PIDFD which we can use to monitor the child's exit \* and also use to sent it a signal in a race-free manner. \* \*/ void create\_child() { pid\_t pid = -1; struct clone\_args args = { /\* CLONE\_PIDFD \*/ .pidfd = ptr\_to\_u64(&pidfd), .flags = CLONE\_PIDFD, .exit\_signal = SIGCHLD, }; pid = sys\_clone3(&args); if (pid < 0) handle\_error("clone3"); if (pid == 0) { /\* Child \*/ signal(SIGINT, childs\_sigint\_handler); printf("In child process. Sleeping..\\n"); sleep(5); printf("Exiting child process.\\n"); exit(0); } else { /\* Parent \*/ printf("Adding child PID %d with pidfd %d" "to be monitored by epoll.\\n", pid, pidfd); /\* We have the pidfd returned by clone3(). \* Add it to epoll's monitoring list. \*/ add\_fd\_to\_epoll(pidfd); } } int main(int argc, char \*argv\[\]) { /\* Let's setup epoll \*/ setup\_epoll(); /\* Setup sigalrm+sigquit if a number is passed as the first argument \*/ setup\_signals(argc, argv); /\* Add the SignalFD file descriptor to epoll's monitoring list \*/ add\_fd\_to\_epoll(sfd); create\_child(); while(1) { /\* Let's wait for some activity on either stdin or on the socket \*/ nfds = epoll\_wait(epollfd, events, MAX\_EVENTS, -1); if (nfds == -1) handle\_error("epoll\_wait()"); /\* \* For each of the file descriptors epoll says are ready, \* check which one it is the echo read data back. \* \*/ for (int n = 0; n < nfds; n++) { if ( events\[n\].data.fd == pidfd ) { printf("Child exited, creating new child..\\n"); /\* We're done using the pidfd that pointed to the child \* process that just exited \*/ close(pidfd); create\_child(); } else if (events\[n\].data.fd == sfd) { /\* Looks like we got some other signal, let's handle it \*/ handle\_signals(); } } } return 0; }

#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <sys/epoll.h>
#include <sys/signalfd.h>
#include <sys/time.h>
#include <errno.h>
#include <syscall.h>
#include <linux/sched.h>

#define handle_error(msg) \
           do { perror(msg); exit(EXIT_FAILURE); } while (0)

#define MAX_EVENTS          10

static int pidfd_send_signal(int pidfd, int sig, siginfo_t *info,
                             unsigned int flags)
{
    return (int) syscall(__NR_pidfd_send_signal, pidfd, sig, info,
    flags);
}

static pid_t sys_clone3(struct clone_args *args)
{
    return syscall(__NR_clone3, args, sizeof(struct clone_args));
}

#define ptr_to_u64(ptr) ((__u64)((uintptr_t)(ptr)))

struct epoll_event ev, events[MAX_EVENTS];
int nfds, epollfd, sfd, pidfd;

/**
 * If a parsable number is passed as the 1st argument to the
 * program, sets up SIGALRM to be sent to self the specified
 * seconds later.
 * */

void setup_signals(int argc, char **argv) {
    sigset_t mask;

    /* No argument passed, and so no signal will be delivered */
    if (argc < 2) {
        printf("No alarm set. Will not be interrupted.\n");
        return;
    }

    /*  if a proper number is passed, we setup the alarm,
     * else we return without setting one up.
     * */
    errno = 0;
    long alarm_after = strtol(argv[1], NULL, 10);
    if (errno)
        handle_error("strtol()");
    if (alarm_after)
        printf("Alarm after %ld seconds.\n", alarm_after);
    else {
        printf("No alarm set. Will not be interrupted.\n");
        return;
    }

    /*
     * Setup SIGALRM to be delivered via SignalFD
     * */
    sigemptyset(&mask);
    sigaddset(&mask, SIGALRM);
    sigaddset(&mask, SIGQUIT);

    /*
     * Block these signals so that they are not handled
     * in the usual way. We want them to be handled via
     * SignalFD.
     * */
    if (sigprocmask(SIG_BLOCK, &mask, NULL) == -1)
        handle_error("sigprocmask");

    sfd = signalfd(-1, &mask, 0);
    if (sfd == -1)
        handle_error("signalfd");

    /*
     * Let's send ourselves a SIGALRM signal every specified
     * seconds continuously.
     * */
    struct itimerval itv;
    itv.it_interval.tv_sec = alarm_after;
    itv.it_interval.tv_usec = 0;
    itv.it_value = itv.it_interval;
    if (setitimer(ITIMER_REAL, &itv, NULL) == -1)
        handle_error("setitimer()");
}

/**
 * Helper function to setup epoll
 */

void setup_epoll() {
    epollfd = epoll_create1(0);
    if (epollfd == -1)
        handle_error("epoll_create1()");
}

/**
 * Adds the file descriptor passed to be monitored by epoll
 * */
void add_fd_to_epoll(int fd) {
    /* Add fd to be monitored by epoll */
    ev.events = EPOLLIN;
    ev.data.fd = fd;
    if (epoll_ctl(epollfd, EPOLL_CTL_ADD, fd, &ev) == -1)
        handle_error("epoll_ctl");
}
/**
 * This isn't really a signal handler in the traditional sense,
 * which is called asynchronously. This function is called
 * synchronously from epoll's event loop.
 */
void handle_signals() {
    struct signalfd_siginfo sfd_si;
    if (read(sfd, &sfd_si, sizeof(sfd_si)) == -1)
        handle_error("read()");

    if (sfd_si.ssi_signo == SIGALRM)
        printf("Got SIGALRM via SignalFD.\n");
    else if (sfd_si.ssi_signo == SIGQUIT) {
        printf("Got SIGQUIT. Will exit.\n");
        pidfd_send_signal(pidfd, SIGINT, NULL, 0);
        exit(0);
    }
    else
        printf("Got unexpected signal!\n");
}

/* This is the child's SIGINT handler. The child is setup
 * to get a regular SIGINT when the parent receives a
 * SIGQUIT (for which you press Ctrl+\
 * */
void childs_sigint_handler(int signo) {
    printf("Child got SIGINT. Quitting.\n");
}

/*
 * Create a child with the clone3() system call so we get
 * a PIDFD which we can use to monitor the child's exit
 * and also use to sent it a signal in a race-free manner.
 * */

void create_child() {
    pid_t pid = -1;
    struct clone_args args = {
            /* CLONE_PIDFD */
            .pidfd = ptr_to_u64(&pidfd),
            .flags = CLONE_PIDFD,
            .exit_signal = SIGCHLD,
    };

    pid = sys_clone3(&args);
    if (pid < 0)
        handle_error("clone3");

    if (pid == 0) {
        /* Child */
        signal(SIGINT, childs_sigint_handler);
        printf("In child process. Sleeping..\n");
        sleep(5);
        printf("Exiting child process.\n");
        exit(0);
    } else {
        /* Parent */
        printf("Adding child PID %d with pidfd %d"
               "to be monitored by epoll.\n",
               pid, pidfd);
        /* We have the pidfd returned by clone3().
         * Add it to epoll's monitoring list. */
        add_fd_to_epoll(pidfd);
    }
}

int main(int argc, char *argv[]) {
    /* Let's setup epoll */
    setup_epoll();
    /* Setup sigalrm+sigquit if a number is passed as the first argument */
    setup_signals(argc, argv);
    /* Add the SignalFD file descriptor to epoll's monitoring list */
    add_fd_to_epoll(sfd);

    create_child();

    while(1) {
        /* Let's wait for some activity on either stdin or on the socket */
        nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
        if (nfds == -1)
            handle_error("epoll_wait()");

        /*
         * For each of the file descriptors epoll says are ready,
         * check which one it is the echo read data back.
         * */
        for (int n = 0; n < nfds; n++) {
            if ( events[n].data.fd == pidfd ) {
                printf("Child exited, creating new child..\n");
                /* We're done using the pidfd that pointed to the child
                 * process that just exited */
                close(pidfd);
                create_child();
            } else if (events[n].data.fd == sfd) {
                /* Looks like we got some other signal, let's handle it */
                handle_signals();
            }
        }
    }
    return 0;
}

When you run this program, supply an argument, which is the interval number of seconds at which it’ll keep getting a `SIGALRM` signal. If you provide `2` as an argument for example, it uses `setitimer()` to send itself `SIGALRM` every 2 seconds.

Here’s what this program does:

* Sets up `signalfd` so that it can handle `SIGALRM` and `SIGQUIT` synchronously, like in the previous example.
* It then creates a child process with `clone3(2)`, specifying the `CLONE_PIDFD` argument. This causes a PID file descriptor to be made available. This can refer to the new child process without us having to worry about any race condition when acquiring this reference. The child process sleeps for 5 seconds and exits.
* In the parent, we add this `pidfd` to `epoll`‘s monitoring list. If the child quits, `epoll_wait()` will unblock and will let us know about it. We start another child process, which does the very same: sleep for 5 seconds and exit.
* If the user presses `Ctrl+\`, this causes `SIGQUIT` to be sent to the parent. While handling `SIGQUIT` and before exiting the parent, we use `pidfd_send_signal()` to send `SIGINT` to the child process. Since we use the child’s `pidfd` to send this signal and this can only refer to the child, it’s guaranteed that this signal is not sent to any other process. This is true even if the child has terminated. Unlike a PID which could be recycled and point to any other process, pidfd created via `clone3()` always refers to the created child.

## Known Signalfd limitations

We need to block signals for them to be handled via `signalfd(2)`. Else, they will get delivered via their default dispositions. Herein lies the problem. Unfortunately, blocked signals are inherited by children. And those children can `exec` other programs and those programs can start with those signals blocked, leading to undefined behavior. While it is good for a process to start by explicitly blocking/unblocking signals as they need them, this does not happen in practice. Even if you take the `system(3)` library function, it doe not reset signal handlers or signal masks. It simply carries on with the inherited blocked signals mask.

Due to this limitation, `signalfd(2)` might not be a good choice for all types of programs. You can read more about this issue in this excellent article, very harshly titled [Signalfd is useless](https://ldpreload.com/blog/signalfd-is-useless?reposted-on-request).

## About me

My name is Shuveb Hussain and I’m the author of this Linux-focused blog. You can [follow me on Twitter](https://twitter.com/shuveb) where I post tech-related content mostly focusing on Linux, performance, scalability and cloud technologies.



# links
[Read on Omnivore](https://omnivore.app/me/using-signalfd-and-pidfd-to-make-signals-less-painful-under-linu-18cf05ad05a)
[Read Original](https://unixism.net/2021/02/making-signals-less-painful-under-linux/)

<iframe src="https://unixism.net/2021/02/making-signals-less-painful-under-linux/"  width="800" height="500"></iframe>
