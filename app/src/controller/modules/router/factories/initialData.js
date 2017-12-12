import { when } from 'cerebral/operators';
import { state } from 'cerebral/tags';

import getInitialData from 'controller/signals/getInitialData';

export default continueSequence => [
  when(state`hasLoadedInitialData`),
  {
    true: continueSequence,
    false: [
      getInitialData,
      continueSequence,
    ],
  },

];
