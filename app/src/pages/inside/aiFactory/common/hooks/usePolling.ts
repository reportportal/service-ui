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

/**
 * Calls `callback` every `intervalMs` while `enabled` is true (Q-BE-05: polling is the PoC's
 * stand-in for a push notification while an iteration or fix round is running). The caller is
 * responsible for turning `enabled` off once the polled resource reaches a terminal state —
 * switching to a websocket later only means replacing this hook's body, not its call sites.
 */
export const usePolling = (callback: () => void, intervalMs: number, enabled: boolean): void => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const intervalId = setInterval(() => callbackRef.current(), intervalMs);

    return () => clearInterval(intervalId);
  }, [intervalMs, enabled]);
};
