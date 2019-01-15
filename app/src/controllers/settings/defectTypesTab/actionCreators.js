import { DELETE_DEFECT_TYPE } from './constants';

export const deleteDefectTypeAction = ({ locator }) => (dispatch) =>
  dispatch({
    type: DELETE_DEFECT_TYPE,
    payload: {
      locator,
    },
  });
