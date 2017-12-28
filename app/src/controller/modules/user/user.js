import modules from './modules/modules';
import getInfo from './signals/getInfo';
import login from './signals/login';
import logout from './signals/logout';
import updateUserStatus from './signals/updateUserStatus';
import setUserToken from './signals/setUserToken';

export default {
  state: {
    auth: false,
    isLoad: false,
    isReady: false,
    token: '',
    data: {},
  },
  signals: {
    getInfo,
    setUserToken,
    login,
    logout,
    updateUserStatus,
  },
  modules,
};
