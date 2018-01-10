import { parallel } from 'cerebral';
import { state } from 'cerebral/tags';
import { set } from 'cerebral/operators';

import updateUserStatus from '../modules/user/signals/updateUserStatus';
import getAppInfo from '../modules/app/modules/info/signals/getInfo';
import getTokenFromStorage from '../modules/user/actions/getTokenFromStorage';
import setToken from '../modules/user/actions/setToken';
import redirectRouter from '../modules/user/actions/redirectRouter';

export default [
  parallel([
    [
      getTokenFromStorage,
      setToken,
      updateUserStatus,
    ],
    getAppInfo,
  ]),
  redirectRouter,
  set(state`hasLoadedInitialData`, true),
];
