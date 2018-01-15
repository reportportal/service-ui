import { Module } from 'cerebral';
import Router from '@cerebral/router';
import changePage from './factories/changePage';
import notAutenticate from './factories/notAutenticate';
import autenticate from './factories/autenticate';
import initialData from './factories/initialData';
import loginPageDataLoad from './factories/loginPageDataLoad';

export const route = Module({
  state: {
    currentPage: '',
    pageParams: {},
  },
  signals: {
    loginRouted: initialData(notAutenticate(loginPageDataLoad(changePage('login')))),
    forgotPassRouted: initialData(notAutenticate(loginPageDataLoad(changePage('forgotPass')))),
    appRouted: initialData(autenticate(changePage('app'))),
  },
});

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
