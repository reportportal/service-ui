import { sequence } from 'cerebral';
import { state, props } from 'cerebral/tags';
import { set } from 'cerebral/operators';

export default sequence('Set focus state', [
  set(state`${props`formPath`}.${props`fieldName`}.isFocus`, false),
]);
