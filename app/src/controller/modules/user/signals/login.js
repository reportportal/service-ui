import getToken from '../modules/loginForm/actions/getToken';
import setToken from '../actions/setToken';
import updateUserStatus from './updateUserStatus';
import redirectRouter from '../actions/redirectRouter';

export default [
  getToken,
  {
    true: [
      setToken,
      updateUserStatus,
      redirectRouter,
    ],
  },
];
