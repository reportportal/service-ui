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

import { clearTestCasesAction, setTestCasesAction, stopLoadingTestCasesAction } from './actionCreators';
import { INITIAL_STATE, testCaseReducer } from './reducer';

const page = {
  number: 1,
  size: 50,
  totalElements: 1,
  totalPages: 1,
};

describe('test case successful load revision', () => {
  test('increments only when test cases are successfully set', () => {
    const initialState = testCaseReducer(undefined, { type: '@@INIT' });
    const firstSuccess = testCaseReducer(
      initialState,
      setTestCasesAction({ content: [], page }),
    );
    const stoppedLoading = testCaseReducer(firstSuccess, stopLoadingTestCasesAction());
    const cleared = testCaseReducer(stoppedLoading, clearTestCasesAction());
    const secondSuccess = testCaseReducer(
      cleared,
      setTestCasesAction({ content: [], page }),
    );

    expect(initialState.testCases.successfulLoadRevision).toBe(0);
    expect(firstSuccess.testCases.successfulLoadRevision).toBe(1);
    expect(stoppedLoading.testCases.successfulLoadRevision).toBe(1);
    expect(cleared.testCases.successfulLoadRevision).toBe(1);
    expect(secondSuccess.testCases.successfulLoadRevision).toBe(2);
  });

  test('increments settled revision on both successful set and clear', () => {
    const initialState = testCaseReducer(undefined, { type: '@@INIT' });
    const firstSuccess = testCaseReducer(
      initialState,
      setTestCasesAction({ content: [], page }),
    );
    const cleared = testCaseReducer(firstSuccess, clearTestCasesAction());
    const secondSuccess = testCaseReducer(
      cleared,
      setTestCasesAction({ content: [], page }),
    );

    expect(initialState.testCases.settledRevision).toBe(0);
    expect(firstSuccess.testCases.settledRevision).toBe(1);
    expect(cleared.testCases.settledRevision).toBe(2);
    expect(secondSuccess.testCases.settledRevision).toBe(3);
  });

  test('clears stale list and page without changing the successful revision', () => {
    const staleState = {
      ...testCaseReducer(undefined, { type: '@@INIT' }),
      testCases: {
        ...INITIAL_STATE.testCases,
        list: [{ id: 17 }],
        page,
        successfulLoadRevision: 4,
        settledRevision: 4,
      },
    } as ReturnType<typeof testCaseReducer>;

    const nextState = testCaseReducer(staleState, clearTestCasesAction());

    expect(nextState.testCases).toEqual({
      ...staleState.testCases,
      list: [],
      page: null,
      successfulLoadRevision: 4,
      settledRevision: 5,
    });
  });
});
