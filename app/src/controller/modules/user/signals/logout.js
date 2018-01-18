import { httpDelete, httpAbort } from '@cerebral/http/operators';
import { state, string } from 'cerebral/tags';
import { set } from 'cerebral/operators';
import { infoNotification } from 'controller/providers/notification';
import setToken from '../actions/setToken';
import redirectRouter from '../actions/redirectRouter';
import getDefaultToken from '../actions/getDefaultToken';

export default [
  set(state`user.isLoad`, false),
  set(state`user.data`, {}),
  set(state`user.auth`, false),
  httpAbort('*'),
  redirectRouter,
  infoNotification('infoLogout'),
  httpDelete(string`/uat/sso/me`),
  {
    success: [
    ],
    error: [
    ],
    abort: [
    ],
  },
  getDefaultToken,
  setToken,
];
