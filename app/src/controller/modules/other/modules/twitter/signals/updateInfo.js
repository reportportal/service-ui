import { state } from 'cerebral/tags';
import { set } from 'cerebral/operators';
import updateInfo from '../actions/updateInfo';

export default [
  set(state`other.twitter.isLoad`, true),
  updateInfo,
  set(state`other.twitter.isLoad`, false),
];
