/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { createHashHistory } from 'history';
import qhistory from 'qhistory';
import { stringify, parse } from 'qs';
import 'common/polyfills';

import 'reset-css/reset.css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';
import 'c3/c3.css';

import { initPluginRegistration } from 'controllers/plugins/uiExtensions/registerPlugin';

import App from './app';
import { configureStore } from './store';

if (!process.env.production) {
  const query = parse(location.search, { ignoreQueryPrefix: true });
  const whyDidYouUpdateComponent =
    'whyDidYouUpdateComponent' in query && (query.whyDidYouUpdateComponent || '.*');

  if (whyDidYouUpdateComponent) {
    const { whyDidYouUpdate } = require('why-did-you-update'); // eslint-disable-line global-require
    whyDidYouUpdate(React, { include: new RegExp(whyDidYouUpdateComponent) });
    // eslint-disable-next-line no-console
    console.log(
      'Use http://localhost:3000/?whyDidYouUpdateComponent=^Component$# (with regex as query value) to check why certain component rerender.',
    );
  }
}

const queryParseHistory = qhistory(createHashHistory({ hashType: 'noslash' }), stringify, parse);

const { store, initialDispatch } = configureStore(queryParseHistory, window.REDUX_STATE);

initPluginRegistration(store);

const rerenderApp = (TheApp) => {
  render(
    <Provider store={store}>
      <TheApp initialDispatch={initialDispatch} />
    </Provider>,
    document.querySelector('#app'),
  );
};

if (module.hot) {
  module.hot.accept('./app', () => {
    const app = require('./app').default; // eslint-disable-line global-require
    rerenderApp(app);
  });
}
rerenderApp(App);
