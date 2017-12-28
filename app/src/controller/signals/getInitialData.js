import { parallel } from 'cerebral';
import { state } from 'cerebral/tags';
import { set } from 'cerebral/operators';

import updateUserStatus from '../modules/user/signals/updateUserStatus';
import getAppInfo from '../modules/app/modules/info/signals/getInfo';

export default [
  parallel([
    updateUserStatus,
    getAppInfo,
  ]),
  set(state`hasLoadedInitialData`, true),
];
