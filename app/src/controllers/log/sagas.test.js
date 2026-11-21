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
  fetchNestedStepErrorAction,
  fetchNestedStepSuccessAction,
  loadMoreNestedStepAction,
} from './nestedSteps/actionCreators';
import { loadStep } from './sagas';

describe('controllers/log/sagas loadStep', () => {
  test('finishes as soon as the requested step fails to load', () => {
    const gen = loadStep({ id: 5, errorLogPage: 2 });
    expect(gen.next().value.PUT.action).toEqual(
      loadMoreNestedStepAction({ id: 5, errorLogPage: 2 }),
    );

    const { pattern } = gen.next().value.TAKE;
    expect(pattern(fetchNestedStepErrorAction({ message: 'x' }, 5))).toBe(true);
    expect(pattern(fetchNestedStepErrorAction({ message: 'x' }, 6))).toBe(false);
    expect(pattern(fetchNestedStepSuccessAction({ id: 5 }))).toBe(true);
    expect(pattern(fetchNestedStepSuccessAction({ id: 6 }))).toBe(false);

    expect(gen.next(fetchNestedStepErrorAction({ message: 'x' }, 5)).done).toBe(true);
  });
});
