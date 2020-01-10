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

import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { connectRoutes } from 'redux-first-router';
import createSagaMiddleware from 'redux-saga';
import queryString from 'qs';

import { initAuthInterceptor } from 'common/utils/fetch';
import { LOGOUT } from 'controllers/auth';
import routesMap, { onBeforeRouteChange } from 'routes/routesMap';
import reducers from './reducers';
import { rootSagas } from './rootSaga';

const createRootReducer = (appReducer) => (state, action) => {
  let newState = state;

  if (action.type === LOGOUT) {
    const { appInfo, lang, initialDataReady, location } = state;
    newState = { appInfo, lang, initialDataReady, location };
  }

  return appReducer(newState, action);
};

const composeEnhancers = (...args) =>
  typeof window !== 'undefined' ? composeWithDevTools({})(...args) : compose(...args);

export const configureStore = (history, preloadedState) => {
  const { reducer, middleware, enhancer, initialDispatch } = connectRoutes(history, routesMap, {
    querySerializer: queryString,
    onBeforeChange: onBeforeRouteChange,
    initialDispatch: false,
  });

  const appReducer = combineReducers({ ...reducers, location: reducer });
  const rootReducer = createRootReducer(appReducer);
  const saga = createSagaMiddleware();
  const middlewares = applyMiddleware(saga, middleware);
  const enhancers = composeEnhancers(enhancer, middlewares);
  const store = createStore(rootReducer, preloadedState, enhancers);

  initAuthInterceptor(store);

  if (module.hot && process.env.NODE_ENV === 'development') {
    module.hot.accept('./reducers', () => {
      const newReducers = require('./reducers'); // eslint-disable-line global-require
      const newAppReducer = combineReducers({ ...newReducers, location: reducer });
      const newRootReducer = createRootReducer(newAppReducer);
      store.replaceReducer(newRootReducer);
    });
  }

  saga.run(rootSagas);

  return { store, initialDispatch };
};
