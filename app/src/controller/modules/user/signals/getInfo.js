import { httpGet } from '@cerebral/http/operators';
import { state, props, string } from 'cerebral/tags';
import { set } from 'cerebral/operators';
import setToken from '../actions/setToken';

export default [
  set(state`user.isLoad`, true),
  httpGet(string`/api/v1/user`),
  {
    success: [
      set(state`user.data`, props`response.result`),
      set(state`user.auth`, true),
    ],
    error: [
      set(state`user.data`, {}),
      set(state`user.auth`, false),
      setToken,
    ],
    abort: [
      set(state`user.data`, {}),
    ],
  },
  set(state`user.isLoad`, false),
  set(state`user.isReady`, true),
];
