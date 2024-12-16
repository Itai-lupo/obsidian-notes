in the logger I have a bit io speed issue.
the write are slow I would like to be able to delegate heavier tasks to other threads when I don't care when they happen and on what context but I still want them to happen fast.

the main logic I want is to give a different process or thread(TBD) a task function a callback and an error callback.
then I want it to call the task function on it's context and then get me to call the callback or the error callback using an interrupt of sort?

my first idea is to have a queue with 3 callbacks and a shared buffer but it dose raise some questions.
it allow my to have as many async handle process as I need(for example for every 100 requests in the queue dynamically dispatch more threads and kill them when the load drops? need tests).

the main usage is for io heave tasks such as blocking write to std out(so slow).

but how can I transfer the callbacks back and fourth form the process on a queue?
also as a side note I could use an eventfd to allow the queue to be blocking on read on the async process and it can also have a low nice level.

![[async lib design.svg]]

I could use a ring buffer(for the message queue) and custom memory allocater to transfer the logs between the 2 process, the ring buffer will have the address to the buffer in the main memory, this data structure could be relay usefully

what if I use io_uring into the message buffer(or unix domain socket) I could have get some big gains.
I could also force init for each process/thread so each have it's own io_uring pipe line? but how can I clear the res queue? maby there is a way to quite it or not use it at all?
it should also allow me to buffer on the process level with no need for shared memory which make shit a lot simpler and I could still have theoretical zero copy logger at least on the writing process side.
it might be worth it for other uses(networking or working with slow files that cannot be mapped), due to the use of malloc and the added complexity the benfeets are smaller then I would want them to be for the effort in that case
