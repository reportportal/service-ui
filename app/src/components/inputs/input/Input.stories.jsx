import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import Input from './Input';
import README from './README.md';


storiesOf('Components/Inputs/Input', module)
  .addDecorator(host({
    title: 'Input component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    height: 30,
    width: 300,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <Input />
  ))
  .add('with placeholder', () => (
    <Input placeholder="Placeholder test" />
  ))
  .add('with predefined value', () => (
    <Input value="Predefined text" />
  ))
  .add('type number', () => (
    <Input type="number" />
  ))
  .add('type password', () => (
    <Input type="password" />
  ))
  .add('max length (10)', () => (
    <Input maxLength="10" />
  ))
  .add('disabled', () => (
    <Input disabled />
  ))
  .add('with actions', () => (
    <Input onFocus={action('focused')} onChange={action('change')} onBlur={action('blur')} />
  ));

