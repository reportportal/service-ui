import modules from './modules/modules';
import login from './signals/login';
import logout from './signals/logout';
import forgotPass from './signals/forgotPass';
import updateUserStatus from './signals/updateUserStatus';
import setUserToken from './signals/setUserToken';
import forgotPassRoute from './signals/forgotPassRoute';
import loginRoute from './signals/loginRoute';

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
    forgotPass,
    updateUserStatus,
    forgotPassRoute,
    loginRoute,
  },
  modules,
};
