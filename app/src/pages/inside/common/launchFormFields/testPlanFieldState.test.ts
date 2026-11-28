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

import {
  getTestPlanChange,
  TestPlanChange,
} from 'pages/inside/manualLaunchesPage/editManualLaunchModal/utils';

import { keepTestPlanOnBlur } from './testPlanFieldState';

type Plan = { id: number; name: string };

const planA: Plan = { id: 1, name: 'Plan A' };
const planB: Plan = { id: 2, name: 'Plan B' };
const toString = (plan: Plan) => plan.name;
// What ui-kit SingleAutocomplete asks Downshift for when the input loses focus without a match
const dropSelection = { selectedItem: null, inputValue: '', isOpen: false };

const nextValue = (
  state: { selectedItem: Plan | null; inputValue: string | null },
  changes: { selectedItem?: Plan | null; inputValue?: string },
  isLeavingField: boolean,
) => {
  const result = keepTestPlanOnBlur(state, changes, isLeavingField, toString);
  return 'selectedItem' in result ? result.selectedItem : state.selectedItem;
};

describe('keepTestPlanOnBlur', () => {
  test('keeps the selected plan and its label when a typed search is left without a selection', () => {
    expect(
      keepTestPlanOnBlur(
        { selectedItem: planA, inputValue: 'regr' },
        dropSelection,
        true,
        toString,
      ),
    ).toEqual({ selectedItem: planA, inputValue: 'Plan A', isOpen: false });
  });

  test('removes the plan when the emptied field is left', () => {
    expect(
      keepTestPlanOnBlur({ selectedItem: planA, inputValue: '  ' }, dropSelection, true, toString),
    ).toBe(dropSelection);
  });

  test('removes the plan with the clear button (not a blur)', () => {
    expect(
      keepTestPlanOnBlur(
        { selectedItem: planA, inputValue: 'Plan A' },
        dropSelection,
        false,
        toString,
      ),
    ).toBe(dropSelection);
  });

  test('passes a selection of another plan and changes without selectedItem through', () => {
    const select = { selectedItem: planB, inputValue: 'Plan B' };
    expect(
      keepTestPlanOnBlur({ selectedItem: planA, inputValue: 'Plan' }, select, true, toString),
    ).toBe(select);
    const typing = { inputValue: 'Pla' };
    expect(
      keepTestPlanOnBlur({ selectedItem: planA, inputValue: 'Pl' }, typing, false, toString),
    ).toBe(typing);
  });

  test('leaves a field without a plan unchanged', () => {
    expect(
      keepTestPlanOnBlur({ selectedItem: null, inputValue: 'regr' }, dropSelection, true, toString),
    ).toBe(dropSelection);
  });
});

describe('Edit Launch Test Plan notice', () => {
  test('no notice after a typed search is left without a selection', () => {
    const value = nextValue({ selectedItem: planA, inputValue: 'regr' }, dropSelection, true);
    expect(getTestPlanChange(planA, value)).toBeNull();
  });

  test('notice when the plan is removed or changed', () => {
    const removed = nextValue({ selectedItem: planA, inputValue: 'Plan A' }, dropSelection, false);
    expect(getTestPlanChange(planA, removed)).toBe(TestPlanChange.REMOVED);
    const changed = nextValue(
      { selectedItem: planA, inputValue: 'Plan' },
      { selectedItem: planB, inputValue: 'Plan B' },
      true,
    );
    expect(getTestPlanChange(planA, changed)).toBe(TestPlanChange.CHANGED);
  });
});
