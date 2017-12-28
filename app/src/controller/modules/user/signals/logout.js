import { httpDelete, httpAbort } from '@cerebral/http/operators';
import { state, string } from 'cerebral/tags';
import { set } from 'cerebral/operators';
import setToken from '../actions/setToken';

export default [
  set(state`user.isLoad`, false),
  set(state`user.data`, {}),
  set(state`user.auth`, false),
  httpAbort('*'),
  httpDelete(string`/uat/sso/me`),
  {
    success: [
    ],
    error: [
    ],
    abort: [
    ],
  },
  setToken,
];
