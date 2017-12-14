import { state } from 'cerebral/tags';
import { when } from 'cerebral/operators';
import pushMessageToStack from '../actions/pushMessageToStack';
import activateMessageNow from '../actions/activateMessageNow';

export default [
  when(state`app.notification.currentMessage`), {
    true: [
      pushMessageToStack,
    ],
    false: [
      activateMessageNow,
    ],
  },
];
