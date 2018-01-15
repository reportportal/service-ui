import { Module, Controller } from 'cerebral';
import FormsProvider from '@cerebral/forms';
import HttpProvider from '@cerebral/http';
import modules from './modules/modules';

const Devtools = (
    process.env.NODE_ENV === 'production' ? null : require('cerebral/devtools').default
);

const rootModule = Module({
  modules,
  providers: {
    forms: FormsProvider({}),
    http: HttpProvider({}),
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
