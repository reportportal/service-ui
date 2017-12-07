import modules from './modules/modules';
import getInfo from './signals/getInfo';

export default {
  state: {
    auth: false,
    isLoad: false,
    isReady: false,
  },
  signals: {
    getInfo,
  },
  modules,
};
