---
id: 3a68f648-d711-4cf8-8e3c-47b793c2cd74
title: Linux – Handling Signals in a Multithreaded Application – Developers Area
author: Liran B.H
tags:
  - programing
  - cpp
  - linux
  - signals
date: 2024-01-09 23:10:09
date_published: 2017-11-30 22:35:20
words_count: 926
state: INBOX
---

# Linux – Handling Signals in a Multithreaded Application – Developers Area by Liran B.H
## Table of contents
```dataviewjs 
dv.view('/Bins/js/toc', 1) 
```


## description
>[!summary] 
> Signals are very useful feature in linux to send notification from one process to another and from the kernel to the process. Signals are sent in some error cases (accessing wrong memory address, bus error, floating point error, …) and also to inform the user application (timer expired, child process finished, IO is ready, ….)


# content
```dataviewjs 
dv.view('/Bins/js/remove_html',  ["# content",  "# links"] ) 
```
Signals are very useful feature in linux to send notification from one process to another and from the kernel to the process. Signals are sent in some error cases (accessing wrong memory address, bus error, floating point error, …) and also to inform the user application (timer expired, child process finished, IO is ready, ….)

### The signal context

While a signal arrives on a single threaded process, the thread complete the current instruction, jump to the signal handler and return when it finish.

Signal handlers are per process, signal masks are per thread

On a multithreaded application – the signal handler execute in one of the thread contexts. We can’t predict the thread that will be chosen to run the signal handler:

consider the following example:

#include<stdio.h>
#include<unistd.h>
#include<pthread.h>
#include <sys/mman.h>
#include <stdlib.h>
#include <sys/prctl.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/ioctl.h>

void *threadfn1(void *p)
{
	while(1){
		printf("thread1\n");
		sleep(2);
	}
	return 0;
}

void *threadfn2(void *p)
{
	while(1){
		printf("thread2\n");
		sleep(2);
	}
	return 0;
}

void *threadfn3(void *p)
{
	while(1){
		printf("thread3\n");
		sleep(2);
	}
	return 0;
}


void handler(int signo, siginfo_t *info, void *extra) 
{
	int i;
	for(i=0;i<10;i++)
	{
		puts("signal");
		sleep(2);
	}
}

void set_sig_handler(void)
{
        struct sigaction action;


        action.sa_flags = SA_SIGINFO; 
        action.sa_sigaction = handler;

        if (sigaction(SIGRTMIN + 3, &action, NULL) == -1) { 
            perror("sigusr: sigaction");
            _exit(1);
        }

}

int main()
{
	pthread_t t1,t2,t3;
	set_sig_handler();
	pthread_create(&t1,NULL,threadfn1,NULL);
	pthread_create(&t2,NULL,threadfn2,NULL);
	pthread_create(&t3,NULL,threadfn3,NULL);
	pthread_exit(NULL);
	return 0;
}

Compile and run the app, you will see periodic output for each thread:

thread1
thread2
thread3
thread1
thread2
thread3
...

Now send a signal to the process using the kill command:

# kill -37 [pid]

The kernel choose one thread and run the signal handler in its context. In my case thread 1 selected so the output for 10 times is:

signal
thread2
thread3
signal
thread2
thread3
...

This behaviour can be problematic in case the selected thread is an important task

(Note that if the signal is an exception (SIGSEGV, SIGFPE, SIGBUS, SIGILL, …) the signal will be caught by the thread doing the exception)

We can’t choose the selected thread but we can do a little trick to hack the system to choose the thread we want. The trick is to block the signal on all threads except one thread – the one we want to run the signal in:

#include<stdio.h>
#include<unistd.h>
#include<pthread.h>
#include <sys/mman.h>
#include <stdlib.h>
#include <sys/prctl.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/ioctl.h>

void mask_sig(void)
{
	sigset_t mask;
	sigemptyset(&mask); 
        sigaddset(&mask, SIGRTMIN+3); 
                
        pthread_sigmask(SIG_BLOCK, &mask, NULL);
        
}

void *threadfn1(void *p)
{
	mask_sig();
	while(1){
		printf("thread1\n");
		sleep(2);
	}
	return 0;
}

void *threadfn2(void *p)
{
	mask_sig();
	while(1){
		printf("thread2\n");
		sleep(2);
	}
	return 0;
}

void *threadfn3(void *p)
{
	while(1){
		printf("thread3\n");
		sleep(2);
	}
	return 0;
}


void handler(int signo, siginfo_t *info, void *extra) 
{
	int i;
	for(i=0;i<10;i++)
	{
		puts("signal");
		sleep(2);
	}
}

void set_sig_handler(void)
{
        struct sigaction action;


        action.sa_flags = SA_SIGINFO; 
        action.sa_sigaction = handler;

        if (sigaction(SIGRTMIN + 3, &action, NULL) == -1) { 
            perror("sigusr: sigaction");
            _exit(1);
        }

}

int main()
{
	pthread_t t1,t2,t3;
	set_sig_handler();
	pthread_create(&t1,NULL,threadfn1,NULL);
	pthread_create(&t2,NULL,threadfn2,NULL);
	pthread_create(&t3,NULL,threadfn3,NULL);
	pthread_exit(NULL);
	return 0;
}


We block the signal on threads 1,2 so the system will deliver the signal to thread 3

Run the app, send the signal with kill command. The output:

signal
thread1
thread2
signal
thread1
thread2
...

Another trick is to create a thread for signal handling that will be blocked using sigwait , waiting for signal

### Behind the scenes

Inside the kernel, each thread has a task\_struct object defines in sched.h:

All the signals fields are stored per thread. Actually , there is no structure for the process , all the threads on the same process points to the same memory and files tables so the kernel need to choose a thread to deliver the signal to:

struct task_struct {
#ifdef CONFIG_THREAD_INFO_IN_TASK
	/*
	 * For reasons of header soup (see current_thread_info()), this
	 * must be the first element of task_struct.
	 */
	struct thread_info		thread_info;
#endif
	/* -1 unrunnable, 0 runnable, >0 stopped: */
	volatile long			state;
...
...
...
	/* Signal handlers: */
	struct signal_struct		*signal;
	struct sighand_struct		*sighand;
	sigset_t			blocked;
	sigset_t			real_blocked;
	/* Restored if set_restore_sigmask() was used: */
	sigset_t			saved_sigmask;
	struct sigpending		pending;
	unsigned long			sas_ss_sp;
	size_t				sas_ss_size;
	unsigned int			sas_ss_flags;
...
...
}

### Sending signals to a thread

Another option is to use pthread\_kill(3) to send a signal directly to a thread. This can be done only in the same process. For example:

#include<stdio.h>
#include<unistd.h>
#include<pthread.h>
#include <sys/mman.h>
#include <stdlib.h>
#include <sys/prctl.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/ioctl.h>


void *threadfn1(void *p)
{
	while(1){
		printf("thread1\n");
		sleep(2);
	}
	return 0;
}

void *threadfn2(void *p)
{
	while(1){
		printf("thread2\n");
		sleep(2);
	}
	return 0;
}

void *threadfn3(void *p)
{
	while(1){
		printf("thread3\n");
		sleep(2);
	}
	return 0;
}


void handler(int signo, siginfo_t *info, void *extra) 
{
	int i;
	for(i=0;i<5;i++)
	{
		puts("signal");
		sleep(2);
	}
}

void set_sig_handler(void)
{
        struct sigaction action;


        action.sa_flags = SA_SIGINFO; 
        action.sa_sigaction = handler;

        if (sigaction(SIGRTMIN + 3, &action, NULL) == -1) { 
            perror("sigusr: sigaction");
            _exit(1);
        }

}

int main()
{
	pthread_t t1,t2,t3;
	set_sig_handler();
	pthread_create(&t1,NULL,threadfn1,NULL);
	pthread_create(&t2,NULL,threadfn2,NULL);
	pthread_create(&t3,NULL,threadfn3,NULL);
	sleep(3);
	pthread_kill(t1,SIGRTMIN+3);
	sleep(15);
	pthread_kill(t2,SIGRTMIN+3);
	pthread_kill(t3,SIGRTMIN+3);
	pthread_exit(NULL);
	return 0;
}

We start with creating 3 threads, then we send a signal to thread 1, wait for the signal handler to finish then send signals both to threads 2 and 3 , they will run the signal handler at the same time so in this case we will see :

signal
signal
thread1
...

Tagged [Linux](https://devarea.com/tag/linux/)

## Post navigation



# links
[Read on Omnivore](https://omnivore.app/me/linux-handling-signals-in-a-multithreaded-application-developers-18cf00fad2b)
[Read Original](https://devarea.com/linux-handling-signals-in-a-multithreaded-application/)

<iframe src="https://devarea.com/linux-handling-signals-in-a-multithreaded-application/"  width="800" height="500"></iframe>
