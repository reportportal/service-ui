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

import { LOGOUT } from 'controllers/auth/constants';
import { CLEAR_PAGE_STATE } from 'controllers/pages/constants';

export const createRootReducer = (appReducer) => (state, action) => {
  let newState = state;

  if (action.type === LOGOUT) {
    const { appInfo, lang, initialDataReady, location } = state;
    newState = { appInfo, lang, initialDataReady, location };
  }

  return appReducer(newState, action);
};

export const createPurifyPageReducer = (reducer, targetPage) => (state, action) => {
  const { type, payload = {} } = action;
  let newState = state;

  const isTargetPageLeft = Array.isArray(targetPage)
    ? targetPage.some((page) => page === payload.oldPage)
    : payload.oldPage === targetPage;

  if (type === CLEAR_PAGE_STATE && isTargetPageLeft) {
    newState = undefined;
  }

  return reducer(newState, action);
};
