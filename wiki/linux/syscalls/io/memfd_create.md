this create memory file with no fs entry.
it can be used as unnamed shm file.
you can send the fd to other process other [[unix domain socket]]

## example

```cpp
#include <sys/mman.h>
static fd_t memfd = INVALID_FD;

THROWS err_t initSharedMemory()
{
	err_t err = NO_ERRORCODE;
	QUITE_CHECK(IS_INVALID_FD(memfd));

	memfd.fd = memfd_create("shared memory pool", 0);
	QUITE_CHECK(IS_VALID_FD(memfd));

	CHECK(ftruncate(memfd.fd, SHM_SIZE) != -1);
cleanup:
	return err;
}

err_t closeSharedMemory()
{
	err_t err = NO_ERRORCODE;

	QUITE_CHECK(IS_VALID_FD(memfd));

	QUITE_RETHROW(safeClose(&memfd));

cleanup:
	return err;
}

THROWS err_t sharedAlloc(void **const data, const size_t size, const off_t *sharedKey)
{
	err_t err = NO_ERRORCODE;
    QUITE_CHECK(IS_VALID_FD(memfd));

    QUITE_CHECK(sharedKey != NULL);
	QUITE_CHECK(data != NULL);
    QUITE_CHECK(*data == NULL);
	QUITE_CHECK(size > 0);

	*data = mmap(0, size, PROT_READ | PROT_WRITE, MAP_PRIVATE, memfd.fd, 0);
	QUITE_CHECK(*data != MAP_FAILED);

cleanup:
	return err;
}

THROWS err_t sharedDealloc(void **const data, const size_t size)
{
	err_t err = NO_ERRORCODE;

	QUITE_CHECK(data != NULL);
	QUITE_CHECK(IS_VALID_FD(memfd));
	QUITE_CHECK(*data != NULL);

	//for testing, should have a way to get the fragment size and map/unmap it.
	CHECK(munmap(*data, size) == 0);

cleanup:
	if (data != NULL)
	{
		*data = NULL;
	}

	return err;
}

THROWS err_t sharedMap(void **const data, const size_t size, const off_t offset)
{
	err_t err = NO_ERRORCODE;

	QUITE_CHECK(offset >= 0);
	QUITE_CHECK(data != NULL);
    QUITE_CHECK(*data == NULL);
	QUITE_CHECK(IS_VALID_FD(memfd));
	QUITE_CHECK(size > 0);

	*data = mmap(0, size, PROT_READ | PROT_WRITE, MAP_SHARED_VALIDATE, memfd.fd, offset);
	QUITE_CHECK(*data != MAP_FAILED);

cleanup:
	return err;
}

THROWS err_t sharedUnmap(void **const data, const size_t size)
{
	err_t err = NO_ERRORCODE;

	QUITE_CHECK(data != NULL);
	QUITE_CHECK(IS_VALID_FD(memfd));
	QUITE_CHECK(*data != NULL);

	CHECK(munmap(*data, size) == 0);

cleanup:
	if (data != NULL)
	{
		*data = NULL;
	}

	return err;
}
```
