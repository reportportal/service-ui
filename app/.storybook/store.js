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
