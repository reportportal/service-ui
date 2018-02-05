import 'raf/polyfill';
import React from 'react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as Utils from './src/common/utils';

configure({ adapter: new Adapter() });

global.React = React;
global.Utils = Utils;
global.STORYBOOK = false;
global.JEST = true;
global.localStorage = (() => {
  let store = {};

  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();

console.error = (message) => {
  throw new Error(message);
};
