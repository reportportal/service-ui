import { fetch } from 'common/utils';
import { FETCH_INFO_SUCCESS } from './constants';

export const fetchInfoSuccess = info => ({
  type: FETCH_INFO_SUCCESS,
  payload: info,
});

export const fetchInfoAction = () => dispatch =>
  fetch('/composite/info')
    .then(info => dispatch(fetchInfoSuccess(info)));
