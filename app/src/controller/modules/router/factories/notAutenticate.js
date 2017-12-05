import { when } from 'cerebral/operators';
import { redirect } from '@cerebral/router/operators';
import { state } from 'cerebral/tags';

import initialData from './initialData';

const notAutenticate = continueSequence => [
  when(state`user.auth`), {
    true: redirect('/app'),
    false: continueSequence,
  },
];

export default continueSequence => (
  initialData(notAutenticate(continueSequence))
);
