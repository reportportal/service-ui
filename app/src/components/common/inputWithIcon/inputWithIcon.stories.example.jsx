import { storiesOf } from '@storybook/react';
import { InputWithIcon } from './index';
import TestIcon from './img/test-stories-icon.svg';

storiesOf('Input width icon', module)
  .add('default state', () => (
    <InputWithIcon />
  ))
  .add('default state with icon', () => (
    <InputWithIcon icon={TestIcon} />
  ))
  .add('valid state', () => (
    <InputWithIcon formField={{ isValid: true }} />
  ))
  .add('valid state with icon', () => (
    <InputWithIcon formField={{ isValid: true }} icon={TestIcon} />
  ));
