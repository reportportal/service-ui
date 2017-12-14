import { when } from 'cerebral/operators';
import { redirect } from '@cerebral/router/operators';
import { state } from 'cerebral/tags';

import initialData from './initialData';

const autenticate = continueSequence => [
  when(state`user.auth`), {
    true: continueSequence,
    false: redirect('/'),
  },
];

export default continueSequence => (
  initialData(autenticate(continueSequence))
);
