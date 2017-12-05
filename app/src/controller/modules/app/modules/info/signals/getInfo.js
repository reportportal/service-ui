import { httpGet } from '@cerebral/http/operators';
import { state, props, string } from 'cerebral/tags';
import { set } from 'cerebral/operators';

export default [
  set(state`app.info.isLoad`, true),
  httpGet(string`/composite/info`),
  {
    success: [
      set(state`app.info.data`, props`response.result`),
    ],
    error: [
      set(state`app.info.data`, {}),
    ],
    abort: [
      set(state`app.info.data`, {}),
    ],
  },
  set(state`app.info.isLoad`, false),
  set(state`app.info.isReady`, true),
];
