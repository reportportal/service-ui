import Router from '@cerebral/router';
import changePage from './factories/changePage';
import notAutenticate from './factories/notAutenticate';
import autenticate from './factories/autenticate';

export const route = {
  state: {
    currentPage: '',
    pageParams: {},
  },
  signals: {
    loginRouted: notAutenticate(changePage('login')),
    forgotPassRouted: notAutenticate(changePage('forgotPass')),
    appRouted: autenticate(changePage('app')),
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
    {
      path: '/app',
      signal: 'route.appRouted',
    },
  ],
});
