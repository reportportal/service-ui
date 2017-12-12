import { sequence } from 'cerebral';
import { state, props } from 'cerebral/tags';
import { set } from 'cerebral/operators';

export default sequence('Show errors for form', [
  set(state`${props`path`}.showErrors`, true),
]);
