import React from 'react';
import { render } from 'react-dom';
import { userInfoSelector, activeProjectSelector, setActiveProjectAction } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import { Provider } from 'react-redux'

import { createHashHistory } from 'history';
import qhistory from 'qhistory';
import { stringify, parse } from 'qs';
import 'common/polyfills';

import 'reset-css/reset.css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';
import 'c3/c3.css';

import App from './app';
import { configureStore } from './store';


const queryParseHistory = qhistory(
  createHashHistory({ hashType: 'noslash' }),
  stringify,
  parse,
);

const { store } = configureStore(queryParseHistory, window.REDUX_STATE);

const rerenderApp = (TheApp) => {
  render((
		<Provider store={store}>
		  <TheApp />
		</Provider>
  ),
	document.querySelector('#app'));
};

if (module.hot) {
  module.hot.accept('./app', () => {
    const app = require('./app').default; // eslint-disable-line global-require
	rerenderApp(app);
  });
}
rerenderApp(App);
