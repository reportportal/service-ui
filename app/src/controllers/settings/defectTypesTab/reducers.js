import { DELETE_DEFECT_TYPE } from './constants';

export const defectTypesTabReducer = (state = {}, { type }) => {
  switch (type) {
    case DELETE_DEFECT_TYPE:
      return { ...state };
    default:
      return state;
  }
};
