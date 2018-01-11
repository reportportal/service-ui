import { parallel } from 'cerebral';
import { state } from 'cerebral/tags';
import { set, when } from 'cerebral/operators';

import updateUserStatus from '../../user/signals/updateUserStatus';
import getAppInfo from '../../app/modules/info/signals/getInfo';
import getTokenFromStorage from '../../user/actions/getTokenFromStorage';
import setToken from '../../user/actions/setToken';

const initialData = continueSequence => [
  when(state`hasLoadedInitialData`), {
    true: continueSequence,
    false: [
      parallel([
        [
          getTokenFromStorage,
          setToken,
          updateUserStatus,
        ],
        getAppInfo,
      ]),
      set(state`hasLoadedInitialData`, true),
      continueSequence,
    ],
  },
];
export default initialData;
