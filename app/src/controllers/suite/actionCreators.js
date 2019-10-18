/*
 * Copyright 2019 EPAM Systems
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
  createProceedWithValidItemsAction,
  selectItemsAction,
  toggleItemSelectionAction,
  unselectAllItemsAction,
  toggleAllItemsAction,
} from 'controllers/groupOperations';
import { NAMESPACE, FETCH_SUITES } from './constants';

export const fetchSuitesAction = (params) => ({
  type: FETCH_SUITES,
  payload: params,
});

export const toggleSuiteSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectSuitesAction = selectItemsAction(NAMESPACE);
export const unselectAllSuitesAction = unselectAllItemsAction(NAMESPACE);
export const toggleAllSuitesAction = toggleAllItemsAction(NAMESPACE);

export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);
