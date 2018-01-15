import { Module } from 'cerebral';
import getInfo from './signals/getInfo';

export default Module({
  state: {
    isReady: false,
    isLoad: false,
    data: {},
  },
  signals: {
    getInfo,
  },
});
