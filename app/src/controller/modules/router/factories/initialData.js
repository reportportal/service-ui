import { when } from 'cerebral/operators';
import { state } from 'cerebral/tags';

import { setUserTokenFromStorage } from 'controller/globalActions';
import getInitialData from 'controller/signals/getInitialData';

export default continueSequence => [
  when(state`hasLoadedInitialData`),
  {
    true: continueSequence,
    false: [
      setUserTokenFromStorage,
      getInitialData,
      continueSequence,
    ],
  },

];
