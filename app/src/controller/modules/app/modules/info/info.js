import getInfo from './signals/getInfo';

export default {
  state: {
    isReady: false,
    isLoad: false,
    data: {},
  },
  signals: {
    getInfo,
  },
};
