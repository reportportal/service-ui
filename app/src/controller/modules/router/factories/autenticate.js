import { when } from 'cerebral/operators';
import { redirect } from '@cerebral/router/operators';
import { state } from 'cerebral/tags';

const autenticate = continueSequence => [
  when(state`user.auth`), {
    true: continueSequence,
    false: redirect('/'),
  },
];
export default autenticate;
