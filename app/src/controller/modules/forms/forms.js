import changeValue from './actions/changeValue';
import setFocus from './actions/setFocus';
import setBlur from './actions/setBlur';

export default {
  signals: {
    changeValue: [changeValue],
    setFocus: [setFocus],
    setBlur: [setBlur],
  },
};
