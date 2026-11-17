import { ERROR_CANCELED } from 'common/utils/fetch';

type QueueModule = typeof import('./imageRequestQueue');

const createDeferred = <T>() => {
  let resolve: (value: T) => void = () => {};
  let reject: (reason: Error) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('imageRequestQueue', () => {
  let queue: QueueModule;

  beforeEach(async () => {
    jest.resetModules();
    queue = await import('./imageRequestQueue');
  });

  describe('enqueueImageRequest', () => {
    it('limits the number of concurrently running requests', () => {
      const execute = jest.fn(() => new Promise<string>(() => {}));

      const tasks = Array.from({ length: queue.MAX_CONCURRENT_IMAGE_REQUESTS + 2 }, () =>
        queue.enqueueImageRequest(execute),
      );
      tasks.forEach((task) => {
        task.promise.catch(() => {});
      });

      expect(execute).toHaveBeenCalledTimes(queue.MAX_CONCURRENT_IMAGE_REQUESTS);
    });

    it('starts the next waiting request after an active one settles', async () => {
      const blockers = Array.from({ length: queue.MAX_CONCURRENT_IMAGE_REQUESTS }, () =>
        createDeferred<string>(),
      );
      blockers.forEach((blocker) => queue.enqueueImageRequest(() => blocker.promise));
      const execute = jest.fn(() => Promise.resolve('file'));
      const waiting = queue.enqueueImageRequest(execute);

      expect(execute).not.toHaveBeenCalled();

      blockers[0].resolve('done');
      await expect(waiting.promise).resolves.toBe('file');
      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('rejects with ERROR_CANCELED and never executes a request cancelled while waiting', async () => {
      Array.from({ length: queue.MAX_CONCURRENT_IMAGE_REQUESTS }, () =>
        queue.enqueueImageRequest(() => new Promise<string>(() => {})),
      );
      const execute = jest.fn(() => Promise.resolve('file'));
      const waiting = queue.enqueueImageRequest(execute);
      waiting.promise.catch(() => {});

      waiting.cancel();

      await expect(waiting.promise).rejects.toThrow(ERROR_CANCELED);
      expect(execute).not.toHaveBeenCalled();
    });

    it('calls the registered cancel handler of a running request', () => {
      const cancelHandler = jest.fn();
      const task = queue.enqueueImageRequest((registerCancel) => {
        registerCancel(cancelHandler);
        return new Promise<string>(() => {});
      });
      task.promise.catch(() => {});

      task.cancel();

      expect(cancelHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('runImageRequestImmediately', () => {
    it('runs the request right away and cancels it through the registered handler', () => {
      const cancelHandler = jest.fn();
      const execute = jest.fn((registerCancel: (cancel: () => void) => void) => {
        registerCancel(cancelHandler);
        return new Promise<string>(() => {});
      });

      const task = queue.runImageRequestImmediately(execute);
      task.cancel();

      expect(execute).toHaveBeenCalledTimes(1);
      expect(cancelHandler).toHaveBeenCalledTimes(1);
    });
  });
});
