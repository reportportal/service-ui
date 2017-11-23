import { Controller } from 'cerebral';
import FormsProvider from '@cerebral/forms';
import modules from './modules/modules';

const Devtools = (
    process.env.NODE_ENV === 'production' ? null : require('cerebral/devtools').default
);

export default Controller({
  devtools: Devtools && Devtools({
    host: 'localhost:8585',
  }),
  modules,
  providers: [
    FormsProvider({}),
  ],
});
