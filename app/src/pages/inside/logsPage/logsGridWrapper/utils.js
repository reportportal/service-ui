/*
 * Copyright 2022 EPAM Systems
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

import { DIRECTION_SHIFT_MAP } from './constants';

export const calculateNextIndex = (source, currentIndex, direction) => {
  let nextIndex;
  const sourceLength = source.length;
  const shiftValue = DIRECTION_SHIFT_MAP[direction] || 0;

  if (currentIndex === null) {
    nextIndex = shiftValue > 0 ? 0 : ((shiftValue % sourceLength) + sourceLength) % sourceLength;
  } else {
    const supposedNextIndex = currentIndex + shiftValue;
    nextIndex = ((supposedNextIndex % sourceLength) + sourceLength) % sourceLength;
  }

  return nextIndex;
};
