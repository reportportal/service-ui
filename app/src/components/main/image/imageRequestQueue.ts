/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ERROR_CANCELED } from 'common/utils/fetch';

export const MAX_CONCURRENT_IMAGE_REQUESTS = 6;

type CancelHandler = () => void;

export interface ImageRequestTask<T> {
  promise: Promise<T>;
  cancel: CancelHandler;
}

interface QueuedImageRequest {
  start: () => void;
}

const waitingRequests: QueuedImageRequest[] = [];
let activeRequestsCount = 0;

const processQueue = (): void => {
  while (activeRequestsCount < MAX_CONCURRENT_IMAGE_REQUESTS && waitingRequests.length > 0) {
    const next = waitingRequests.shift();
    activeRequestsCount += 1;
    next?.start();
  }
};

export const enqueueImageRequest = <T>(
  execute: (registerCancel: (cancel: CancelHandler) => void) => Promise<T>,
): ImageRequestTask<T> => {
  let activeCancel: CancelHandler | null = null;
  let isCancelled = false;
  let rejectTask: ((reason: Error) => void) | null = null;
  let queuedRequest: QueuedImageRequest | null = null;

  const promise = new Promise<T>((resolve, reject) => {
    rejectTask = reject;

    queuedRequest = {
      start: () => {
        if (isCancelled) {
          activeRequestsCount -= 1;
          processQueue();
          return;
        }
        execute((cancel) => {
          activeCancel = cancel;
          if (isCancelled) {
            cancel();
          }
        })
          .then(resolve, reject)
          .finally(() => {
            activeCancel = null;
            activeRequestsCount -= 1;
            processQueue();
          });
      },
    };

    waitingRequests.push(queuedRequest);
    processQueue();
  });

  const cancel = (): void => {
    if (isCancelled) {
      return;
    }
    isCancelled = true;
    if (activeCancel) {
      activeCancel();
      return;
    }
    const index = queuedRequest ? waitingRequests.indexOf(queuedRequest) : -1;
    if (index !== -1) {
      waitingRequests.splice(index, 1);
      rejectTask?.(new Error(ERROR_CANCELED));
    }
  };

  return { promise, cancel };
};

export const runImageRequestImmediately = <T>(
  execute: (registerCancel: (cancel: CancelHandler) => void) => Promise<T>,
): ImageRequestTask<T> => {
  let runningCancel: CancelHandler | null = null;
  const promise = execute((cancel) => {
    runningCancel = cancel;
  });

  return { promise, cancel: () => runningCancel?.() };
};
