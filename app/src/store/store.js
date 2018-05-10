import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import { rootReducer } from './rootReducer';
import { rootSagas } from './rootSaga';

const saga = createSagaMiddleware();

// eslint-disable-next-line
const reduxLogger = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__({ maxAge: 30 }) : f => f;
export default createStore(rootReducer, compose(applyMiddleware(thunk, saga), reduxLogger));

saga.run(rootSagas);
