import {
  REQUEST_NESTED_STEP,
  FETCH_NESTED_STEP_START,
  FETCH_NESTED_STEP_SUCCESS,
  FETCH_NESTED_STEP_ERROR,
  TOGGLE_NESTED_STEP,
  LOAD_MORE_NESTED_STEP,
} from './constants';

export const requestNestedStepAction = (payload) => ({
  type: REQUEST_NESTED_STEP,
  payload,
});
export const fetchNestedStepStartAction = (payload) => ({
  type: FETCH_NESTED_STEP_START,
  payload,
});
export const fetchNestedStepSuccessAction = (payload) => ({
  type: FETCH_NESTED_STEP_SUCCESS,
  payload,
});
export const fetchNestedStepErrorAction = (payload) => ({
  type: FETCH_NESTED_STEP_ERROR,
  payload,
});

export const toggleNestedStepAction = (payload) => ({
  type: TOGGLE_NESTED_STEP,
  payload,
});
export const loadMoreNestedStepAction = (payload) => ({
  type: LOAD_MORE_NESTED_STEP,
  payload,
});
