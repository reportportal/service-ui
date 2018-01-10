import { state, props } from 'cerebral/tags';
import { set, when } from 'cerebral/operators';
import getInfo from '../actions/getInfo';
import setInfo from '../actions/setInfo';
import setToken from '../actions/setToken';
import getDefaultToken from '../actions/getDefaultToken';

export default [
  set(state`user.isLoad`, true),
  getInfo,
  setInfo,
  when(props`userInfo`),
  {
    true: [
      set(state`user.auth`, true),
    ],
    false: [
      set(state`user.auth`, false),
      getDefaultToken,
      setToken,
    ],
  },
  set(state`user.isLoad`, false),
];
