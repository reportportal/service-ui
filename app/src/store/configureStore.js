import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { connectRoutes } from 'redux-first-router';
import createSagaMiddleware from 'redux-saga';
import queryString from 'qs';
import reduxThunk from 'redux-thunk';

import routesMap, { onBeforeRouteChange } from 'routes/routesMap';
import { TOKEN_KEY, DEFAULT_TOKEN } from 'controllers/auth/constants';
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

  const initialStore = {
    ...preloadedState,
    auth: {
      token: localStorage.getItem(TOKEN_KEY) || DEFAULT_TOKEN,
    },
  };

  const rootReducer = combineReducers({ ...reducers, location: reducer });
  const saga = createSagaMiddleware();
  const middlewares = applyMiddleware(reduxThunk, saga, middleware);
  const enhancers = composeEnhancers(enhancer, middlewares);
  const store = createStore(rootReducer, initialStore, enhancers);

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
