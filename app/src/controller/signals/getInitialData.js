import { parallel } from 'cerebral';
import { state } from 'cerebral/tags';
import { set } from 'cerebral/operators';

import getUserInfo from 'controller/modules/user/signals/getInfo';
import getAppInfo from 'controller/modules/app/modules/info/signals/getInfo';

export default [
  parallel([
    getUserInfo,
    getAppInfo,
  ]),
  set(state`hasLoadedInitialData`, true),
];
