import { storiesOf } from '@storybook/react';
import { component as InputErrorHint } from './fieldErrorHint';

storiesOf('Input error hint', module)
  .add('default state', () => (
    <InputErrorHint />
  ))
  .add('width error message without focus', () => (
    <InputErrorHint errorMessage={'test error message'} />
  ))
  .add('width error message with focus', () => (
    <InputErrorHint errorMessage={'test error message'} isFocus />
  ));
