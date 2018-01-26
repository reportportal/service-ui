export const FETCH_INFO_SUCCESS = 'fetchInfoSuccess';

export const fetchInfoSuccess = info => ({
  type: FETCH_INFO_SUCCESS,
  payload: info,
});

export const fetchInfo = () => dispatch =>
  fetch('/composite/info')
    .then(res => res.json())
    .then(info => dispatch(fetchInfoSuccess(info)));
