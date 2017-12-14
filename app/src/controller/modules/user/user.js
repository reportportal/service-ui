import modules from './modules/modules';
import getInfo from './signals/getInfo';
import logout from './signals/logout';
import setUserToken from './signals/setUserToken';

export default {
  state: {
    auth: false,
    isLoad: false,
    isReady: false,
  },
  signals: {
    getInfo,
    setUserToken,
    logout,
  },
  modules,
};
