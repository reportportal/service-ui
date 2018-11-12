import { fetchAPI } from 'common/utils';
import { tokenSelector } from 'controllers/auth';
import { FETCH_INFO_SUCCESS } from './constants';

export const fetchInfoSuccess = (info) => ({
  type: FETCH_INFO_SUCCESS,
  payload: info,
});

export const fetchInfoAction = () => (dispatch, getState) =>
  fetchAPI('/composite/info', tokenSelector(getState())).then((info) =>
    dispatch(fetchInfoSuccess(info)),
  );
