by default Tracy will only show info of the main process.

however by using the flags `-DTRACY_DELAYED_INIT` and  `-DTRACY_MANUAL_LIFETIME`
it is now possble to call 	`___tracy_startup_profiler` and `___tracy_shutdown_profiler`

now you can that after creating all the wanted process in each process, the each process will have it's own port you can connect to from the tracy server