import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { rootReducer } from './rootReducer';

// eslint-disable-next-line
const reduxLogger = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__({ maxAge: 30 }) : f => f;
export default createStore(rootReducer, compose(applyMiddleware(thunk), reduxLogger));
