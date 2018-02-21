import React from 'react';
import { render } from 'react-dom';
import { Router, matchPath } from 'react-router-dom';
import { createHashHistory } from 'history';
import { userInfoSelector, setActiveProjectAction } from 'controllers/user';
import qhistory from 'qhistory';

import { stringify, parse } from 'qs';

import 'reset-css/reset.css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';


import App from './app';
import store from './store';


const queryParseHistory = qhistory(
  createHashHistory({ hashType: 'noslash' }),
  stringify,
  parse,
);
queryParseHistory.listen((location) => {
  const match = matchPath(location.pathname, '/:projectId');
  const hashProject = match.params.projectId;
  const userProjects = Object.keys(userInfoSelector(store.getState()));
  if (!~userProjects.indexOf(hashProject)) {
    store.dispatch(setActiveProjectAction(hashProject));
  }
});

const rerenderApp = (AppContainer) => {
  render((
    <Router history={queryParseHistory}>
      <AppContainer />
    </Router>
  ), document.querySelector('#app'));
};

if (module.hot) {
  module.hot.accept('./app', () => {
    const app = require('./app').default;
    rerenderApp(app);
  });
}
rerenderApp(App);
