import React from 'react';
import { render } from 'react-dom';
import { userInfoSelector, activeProjectSelector, setActiveProjectAction } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import { Provider } from 'react-redux'

import { createHashHistory } from 'history';
import qhistory from 'qhistory';
import { stringify, parse } from 'qs';

import 'reset-css/reset.css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';


import App from './app';
import { configureStore } from './store';
import AppContainer from 'react-hot-loader/lib/AppContainer';


const queryParseHistory = qhistory(
  createHashHistory({ hashType: 'noslash' }),
  stringify,
  parse,
);

configureStore(queryParseHistory, window.REDUX_STATE)
.then(({ store }) => {
	const rerenderApp = (TheApp) => {
	  render((
		<AppContainer>
			<Provider store={store}>
			  <TheApp />
			</Provider>
		</AppContainer>),
		document.querySelector('#app'));
	};

	if (module.hot) {
	  module.hot.accept('./app', () => {
		const app = require('./app').default;
		rerenderApp(app);
	  });
	}
	rerenderApp(App);
});
