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

import { useTestCaseMutations } from './useTestCaseMutations';
import { useTestCaseBatchActions } from './useTestCaseBatchActions';

export const useTestCase = (testCaseId?: number) => {
  const mutations = useTestCaseMutations(testCaseId);
  const batchActions = useTestCaseBatchActions();

  return {
    isLoading: mutations.isLoading || batchActions.isLoading,
    createTestCase: mutations.createTestCase,
    editTestCase: mutations.editTestCase,
    patchTestCase: mutations.patchTestCase,
    batchMove: batchActions.batchMove,
    batchUpdatePriority: batchActions.batchUpdatePriority,
  };
};
