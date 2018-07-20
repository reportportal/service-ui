import {GENERATE_DEMO_DATA, GENERATE_DEMO_DATA_FAILURE, GENERATE_DEMO_DATA_SUCCESS} from './constants';

const inisialSate = {
  loading: false,
};

export const demoDataReducer = (state = inisialSate, { type }) => {
  switch (type) {
    case GENERATE_DEMO_DATA:
      return { loading: true };
    case GENERATE_DEMO_DATA_SUCCESS:
    case GENERATE_DEMO_DATA_FAILURE:
      return { loading: false };
    default:
      return state;
  }
};
