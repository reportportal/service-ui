import { Module } from 'cerebral';
import update from './signals/update';

export default Module({
  state: {
    isLoad: false,
    data: {},
  },
  signals: {
    update,
  },
});
