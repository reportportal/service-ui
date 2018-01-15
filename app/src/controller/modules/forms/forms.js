import { Module } from 'cerebral';
import changeValue from './actions/changeValue';
import setFocus from './actions/setFocus';
import setBlur from './actions/setBlur';

export default Module({
  signals: {
    changeValue: [changeValue],
    setFocus: [setFocus],
    setBlur: [setBlur],
  },
});
