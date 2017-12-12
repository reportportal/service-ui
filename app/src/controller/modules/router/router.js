import Router from '@cerebral/router';
import changePage from './factories/changePage';
import notAutenticate from './factories/notAutenticate';

export const route = {
  state: {
    currentPage: '',
  },
  signals: {
    loginRouted: notAutenticate(changePage('login')),
    forgotPassRouted: notAutenticate(changePage('forgotPass')),
  },
};

export default Router({
  routes: [
    {
      path: '/',
      signal: 'route.loginRouted',
    },
    {
      path: '/forgotPassword',
      signal: 'route.forgotPassRouted',
    },
  ],
});
