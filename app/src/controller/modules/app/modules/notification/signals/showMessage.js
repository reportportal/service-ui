import { module } from 'cerebral/tags';
import { when } from 'cerebral/operators';
import pushMessageToStack from '../actions/pushMessageToStack';
import activateMessageNow from '../actions/activateMessageNow';

export default [
  when(module`currentMessage`), {
    true: [
      pushMessageToStack,
    ],
    false: [
      activateMessageNow,
    ],
  },
];
