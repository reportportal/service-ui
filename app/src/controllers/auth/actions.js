import { TOKEN_KEY, DEFAULT_TOKEN } from './constants';

export const CHANGE_TOKEN = 'changeToken';
export const AUTH_SUCCESS = 'authSuccess';
export const FETCH_USER_SUCCESS = 'fetchUserSuccess';

const changeToken = token => ({
  type: CHANGE_TOKEN,
  payload: token,
});

export const authSuccess = () => ({
  type: AUTH_SUCCESS,
});

const fetchUserSuccess = user => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const setToken = token => (dispatch) => {
  localStorage.setItem(TOKEN_KEY, token);
  dispatch(changeToken(token));
};
export const clearToken = () => (dispatch) => {
  localStorage.removeItem(TOKEN_KEY);
  dispatch(changeToken(DEFAULT_TOKEN));
};

export const fetchUser = token => dispatch => fetch('/api/v1/user', {
  headers: {
    Authorization: token || DEFAULT_TOKEN,
  },
}).then((res) => {
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  return res.json();
}).then(user => dispatch(fetchUserSuccess(user)));

