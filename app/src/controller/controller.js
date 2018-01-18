import { Module, Controller } from 'cerebral';
import FormsProvider from '@cerebral/forms';
import HttpProvider from '@cerebral/http';
import NotificationProvider from './providers/notification';
import modules from './modules/modules';

const Devtools = (
    process.env.NODE_ENV === 'production' ? null : require('cerebral/devtools').default
);

const rootModule = Module({
  modules,
  providers: {
    forms: FormsProvider({}),
    http: HttpProvider({}),
    notification: NotificationProvider,
  },
  state: {
    hasLoadedInitialData: false,
    lang: 'en',
  },
  signals: {
  },
});

export default Controller(rootModule, {
  devtools: Devtools && Devtools({
    host: 'localhost:8585',
  }),
});
