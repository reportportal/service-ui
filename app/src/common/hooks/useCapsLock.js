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

import { useCallback, useState } from 'react';

const getCapsLockState = (event) => event?.getModifierState?.('CapsLock') ?? false;

export const useCapsLock = () => {
  const [capsLockOn, setCapsLockOn] = useState(false);

  const syncCapsLockState = useCallback((event) => {
    setCapsLockOn(getCapsLockState(event));
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'CapsLock') {
        setCapsLockOn((prev) => !prev);
        return;
      }

      syncCapsLockState(event);
    },
    [syncCapsLockState],
  );

  const handleKeyUp = useCallback(
    (event) => {
      syncCapsLockState(event);
    },
    [syncCapsLockState],
  );

  return {
    capsLockOn,
    handleKeyDown,
    handleKeyUp,
  };
};
