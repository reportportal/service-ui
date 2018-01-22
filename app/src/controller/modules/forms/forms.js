import { Module } from 'cerebral';
import changeValue from './actions/changeValue';
import setFocus from './actions/setFocus';
import setBlur from './actions/setBlur';
import unsetForceInvalid from './actions/unsetForceInvalid';

export default Module({
  signals: {
    changeValue: [changeValue],
    setFocus: [setFocus, unsetForceInvalid],
    setBlur: [setBlur],
  },
});
