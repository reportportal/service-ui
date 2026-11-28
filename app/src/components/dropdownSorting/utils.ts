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

import { SORTING_ASC, SORTING_DESC } from 'controllers/sorting';
import { SortingDirection } from 'controllers/sorting/types';

export interface DropdownSortingOptionItem {
  value: string;
  label: string;
  defaultDirection?: SortingDirection;
  /** An option with one direction only (e.g. a custom order): no arrow, picking it again keeps it */
  fixedDirection?: SortingDirection;
  /** Show a divider above the option */
  hasDividerBefore?: boolean;
}

export const getOptionDirection = (option?: DropdownSortingOptionItem): SortingDirection =>
  option?.fixedDirection ?? option?.defaultDirection ?? SORTING_ASC;

export const getNextSortingDirection = (
  selectedOption: DropdownSortingOptionItem | undefined,
  currentValue: string,
  currentDirection: SortingDirection,
): SortingDirection => {
  if (selectedOption?.fixedDirection) {
    return selectedOption.fixedDirection;
  }

  if (selectedOption?.value === currentValue) {
    return currentDirection === SORTING_ASC ? SORTING_DESC : SORTING_ASC;
  }

  return getOptionDirection(selectedOption);
};
