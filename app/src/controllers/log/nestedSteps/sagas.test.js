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

import { fetch } from 'common/utils';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { ALL } from 'controllers/log/constants';
import { fetchNestedStep } from './sagas';
import { FETCH_NESTED_STEP_SUCCESS, MAX_PAGE_SIZE } from './constants';

describe('controllers/log/nestedSteps/sagas fetchNestedStep', () => {
  test('loads the whole step in bounded pages and concatenates them', () => {
    const gen = fetchNestedStep({ payload: { id: 3, loadDirection: ALL } });
    gen.next(); // collectLogPayload
    gen.next({ projectKey: 'p', query: {}, filterLevel: 'trace' }); // select step
    gen.next({ content: [], page: {} }); // start action
    const firstCall = gen.next().value.CALL;
    expect(firstCall.fn).toBe(fetch);
    expect(firstCall.args[1].params).toEqual({ [PAGE_KEY]: 1, [SIZE_KEY]: MAX_PAGE_SIZE });

    const secondCall = gen.next({
      content: [{ id: 1 }],
      page: { number: 1, totalPages: 2, totalElements: 2 },
    }).value.CALL;
    expect(secondCall.args[1].params).toEqual({ [PAGE_KEY]: 2, [SIZE_KEY]: MAX_PAGE_SIZE });

    const success = gen.next({
      content: [{ id: 2 }],
      page: { number: 2, totalPages: 2, totalElements: 2 },
    }).value.PUT.action;
    expect(success.type).toBe(FETCH_NESTED_STEP_SUCCESS);
    expect(success.payload.content).toEqual([{ id: 1 }, { id: 2 }]);
    expect(success.payload.page).toMatchObject({ firstNumber: 1, loaded: 2 });
  });
});
