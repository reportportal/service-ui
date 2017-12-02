import { storiesOf } from '@storybook/react';
import Button from './index';

storiesOf('Button', module)
  .add('default state', () => (
    <Button>Simple button</Button>
  ))
  .add('blue color', () => (
    <Button color={'blue'}>Blue button</Button>
  ));
