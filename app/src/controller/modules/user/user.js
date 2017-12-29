import modules from './modules/modules';
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
    setUserToken,
    login,
    logout,
    updateUserStatus,
  },
  modules,
};
