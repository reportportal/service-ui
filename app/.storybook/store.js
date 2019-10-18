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

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { connectRoutes } from 'redux-first-router';
import { routesMap } from './routesMap';
import { createMemoryHistory } from 'history';

const CHANGE_STORE_ACTION = 'STORYBOOK/CHANGE';

function queueReducers(...reducers) {
  return (state, action) => reducers.reduce((s, reducer) => reducer(s, action), state);
}

const { reducer, middleware, enhancer } = connectRoutes(
  createMemoryHistory({
    initialEntries: ['/'],
  }),
  routesMap,
);

const rootReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHANGE_STORE_ACTION:
      return {
        location: {
          ...store.location,
        },
        ...payload,
      };
    default:
      return state;
  }
};

export const store = createStore(
  queueReducers(combineReducers({ location: reducer }), rootReducer),
  compose(enhancer, applyMiddleware(middleware)),
);

export const changeState = (newState) => store.dispatch({
  type: CHANGE_STORE_ACTION,
  payload: newState,
});
