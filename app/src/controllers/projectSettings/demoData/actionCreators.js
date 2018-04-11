import {GENERATE_DEMO_DATA, GENERATE_DEMO_DATA_FAILURE, GENERATE_DEMO_DATA_SUCCESS} from './constants';

/**
 * @param input {string}
 * @returns {{type: string, payload: string}}
 */

export const generateDemoDataAction = (input) => ({
  type: GENERATE_DEMO_DATA,
  payload: input,
});

export const generateDemoDataSuccessAction = () => ({
  type: GENERATE_DEMO_DATA_SUCCESS,
});

export const generateDemoDataFailureAction = () => ({
  type: GENERATE_DEMO_DATA_FAILURE,
});
