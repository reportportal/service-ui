import { queueReducers } from 'common/utils';
import { omit } from 'common/utils/omit';
import {
  FETCH_NESTED_STEP_START,
  FETCH_NESTED_STEP_SUCCESS,
  CLEAR_NESTED_STEP,
  CLEAR_NESTED_STEPS,
  TOGGLE_NESTED_STEP,
} from './constants';

function fetchReducer(state = {}, action) {
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
          content,
          page,
        },
      };
    }
    default:
      return state;
  }
}

function mutationReducer(state, action) {
  switch (action.type) {
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
}

export const nestedStepsReducer = queueReducers(fetchReducer, mutationReducer);
