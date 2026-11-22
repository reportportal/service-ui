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

import { omit } from 'common/utils/omit';
import { isEmptyObject } from 'common/utils/isEmptyObject';
import {
  FETCH_NESTED_STEP_START,
  FETCH_NESTED_STEP_SUCCESS,
  FETCH_NESTED_STEP_ERROR,
  CLEAR_NESTED_STEP,
  CLEAR_NESTED_STEPS,
  TOGGLE_NESTED_STEP,
} from './constants';

export const nestedStepsReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_NESTED_STEP_START: {
      const {
        payload: { id },
      } = action;
      return {
        ...state,
        [id]: {
          content: [],
          page: {},
          collapsed: true,
          ...state[id],
          loading: true,
        },
      };
    }
    case FETCH_NESTED_STEP_SUCCESS: {
      const {
        payload: { id, page, content },
      } = action;

      return {
        ...state,
        [id]: {
          ...state[id],
          loading: false,
          initial: false,
          content,
          page,
        },
      };
    }
    case FETCH_NESTED_STEP_ERROR: {
      const id = action.meta?.id;
      if (!state[id]) {
        return state;
      }
      return {
        ...state,
        [id]: {
          ...state[id],
          loading: false,
          // nothing was loaded yet: the next click requests the step again
          ...(isEmptyObject(state[id].page || {}) && { initial: true }),
        },
      };
    }
    case CLEAR_NESTED_STEP: {
      const {
        payload: { id },
      } = action;
      return omit(state, [id]);
    }
    case CLEAR_NESTED_STEPS:
      return {};
    case TOGGLE_NESTED_STEP: {
      const {
        payload: { id },
      } = action;
      return {
        ...state,
        [id]: {
          ...state[id],
          collapsed: !state[id].collapsed,
        },
      };
    }
    default:
      return state;
  }
};
