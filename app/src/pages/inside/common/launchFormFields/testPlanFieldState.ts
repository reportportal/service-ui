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

interface TestPlanFieldState<T> {
  selectedItem: T | null;
  inputValue: string | null;
}

interface TestPlanFieldChanges<T> {
  selectedItem?: T | null;
  inputValue?: string;
}

/**
 * Downshift state reducer of the Test Plan field. When the user types a search and leaves the field
 * without choosing an option, the field drops the selection (ui-kit SingleAutocomplete with
 * skipOptionCreation). Keep the selected Test Plan and its label instead, so the form value does not
 * change. Leaving an emptied field and the clear button still remove the Test Plan.
 */
export const keepTestPlanOnBlur = <T, C extends TestPlanFieldChanges<T>>(
  state: TestPlanFieldState<T>,
  changes: C,
  isLeavingField: boolean,
  parseValueToString: (item: T) => string,
): C => {
  const dropsSelection =
    isLeavingField &&
    'selectedItem' in changes &&
    changes.selectedItem === null &&
    state.selectedItem !== null &&
    !!(state.inputValue || '').trim();

  if (!dropsSelection) {
    return changes;
  }

  return {
    ...changes,
    selectedItem: state.selectedItem,
    inputValue: parseValueToString(state.selectedItem),
  };
};
