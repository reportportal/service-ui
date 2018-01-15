import { Module } from 'cerebral';
import updateInfo from './signals/updateInfo';

export default Module({
  state: {
    isLoad: false,
    twits: [],
    twitById: {},
  },
  signals: {
    updateInfo,
  },
});
