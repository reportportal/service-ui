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
import routesMap, { onBeforeRouteChange } from 'routes/routesMap';
import reducers from './reducers';
import { rootSagas } from './rootSaga';

const composeEnhancers = (...args) =>
  typeof window !== 'undefined' ? composeWithDevTools({})(...args) : compose(...args);

export const configureStore = (history, preloadedState) => {
  const { reducer, middleware, enhancer, initialDispatch } = connectRoutes(history, routesMap, {
    querySerializer: queryString,
    onBeforeChange: onBeforeRouteChange,
    initialDispatch: false,
  });

  const rootReducer = combineReducers({ ...reducers, location: reducer });
  const saga = createSagaMiddleware();
  const middlewares = applyMiddleware(saga, middleware);
  const enhancers = composeEnhancers(enhancer, middlewares);
  const store = createStore(rootReducer, preloadedState, enhancers);

  initAuthInterceptor(store);

  if (module.hot && process.env.NODE_ENV === 'development') {
    module.hot.accept('./reducers', () => {
      const reducers2 = require('./reducers'); // eslint-disable-line global-require
      const rootReducer2 = combineReducers({ ...reducers2, location: reducer });
      store.replaceReducer(rootReducer2);
    });
  }

  saga.run(rootSagas);

  return { store, initialDispatch };
};
