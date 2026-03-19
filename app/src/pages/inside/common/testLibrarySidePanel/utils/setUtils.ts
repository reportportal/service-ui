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

import { isEmpty } from 'es-toolkit/compat';

import { NumberSet, SetState } from '../testLibraryPanelContext';

const updateNumberSet = (
  setter: SetState<NumberSet>,
  ids: number[],
  operation: (set: NumberSet, id: number) => void,
) => {
  if (isEmpty(ids)) {
    return;
  }

  setter((prevSet) => {
    const updatedSet = new Set(prevSet);

    ids.forEach((id) => operation(updatedSet, id));

    return updatedSet;
  });
};

export const addToSet = ({ setter, ids }: { setter: SetState<NumberSet>; ids: number[] }) =>
  updateNumberSet(setter, ids, (set, id) => set.add(id));

export const removeFromSet = ({ setter, ids }: { setter: SetState<NumberSet>; ids: number[] }) =>
  updateNumberSet(setter, ids, (set, id) => set.delete(id));
