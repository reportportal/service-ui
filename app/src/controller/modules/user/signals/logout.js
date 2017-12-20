import { httpDelete, httpAbort } from '@cerebral/http/operators';
import { state, string } from 'cerebral/tags';
import { set } from 'cerebral/operators';
import { checkAuthUrl, setUserToken } from '../../../globalActions';

export default [
  set(state`user.isLoad`, false),
  set(state`user.auth`, false),
  set(state`user.data`, {}),
  httpAbort('*'),
  checkAuthUrl,
  httpDelete(string`/uat/sso/me`),
  {
    success: [
    ],
    error: [
    ],
    abort: [
    ],
  },
  setUserToken,
];
