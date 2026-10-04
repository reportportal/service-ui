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

import { useEffect, useRef } from 'react';

type PollingCallback = () => unknown;

export const POLLING_REQUEST_STARTED = 'POLLING_REQUEST_STARTED' as const;

export const usePolling = (
  callback: PollingCallback,
  intervalMs: number,
  enabled: boolean,
): void => {
  const callbackRef = useRef(callback);
  const generationRef = useRef(0);
  const isPromisePendingRef = useRef(false);
  const isExternalRequestPendingRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      isExternalRequestPendingRef.current = false;
      return undefined;
    }

    generationRef.current += 1;
    const generation = generationRef.current;
    const poll = () => {
      if (document.hidden || isPromisePendingRef.current || isExternalRequestPendingRef.current) {
        return;
      }

      const result = callbackRef.current();
      if (result === POLLING_REQUEST_STARTED) {
        isExternalRequestPendingRef.current = true;
      } else if (result instanceof Promise) {
        isPromisePendingRef.current = true;
        const releaseRequest = () => {
          if (generationRef.current === generation) {
            isPromisePendingRef.current = false;
          }
        };
        void result.then(releaseRequest, releaseRequest);
      }
    };
    const intervalId = setInterval(poll, intervalMs);

    return () => {
      clearInterval(intervalId);
      if (generationRef.current === generation) {
        generationRef.current += 1;
        isPromisePendingRef.current = false;
      }
    };
  }, [enabled, intervalMs]);
};
