import { NAMESPACE } from '../constants';

export const NESTED_STEPS_NAMESPACE = `${NAMESPACE}/nestedSteps`;
export const CLEAR_NESTED_STEP = 'clearNestedStep';
export const TOGGLE_NESTED_STEP = 'toggleNestedStep';
export const CLEAR_NESTED_STEPS = 'clearNestedSteps';

export const REQUEST_NESTED_STEP = 'requestNestedStepAction';
export const LOAD_MORE_NESTED_STEP = 'loadMoreNestedStepAction';
export const FETCH_NESTED_STEP_START = 'fetchNestedStepStartAction';
export const FETCH_NESTED_STEP_SUCCESS = 'fetchNestedStepSuccessAction';
export const FETCH_NESTED_STEP_ERROR = 'fetchNestedStepErrorAction';

export const PAGINATION_OFFSET = 10;

export const INITIAL_STATE = {
  loading: false,
  content: [],
  page: {},
  collapsed: true,
  initial: true,
};
