import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import InputCheckbox from './InputCheckbox';
import README from './README.md';


storiesOf('Components/Inputs/InputCheckbox', module)
  .addDecorator(host({
    title: 'InputCheckbox component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#ffffff',
    height: 30,
    width: 300,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <InputCheckbox />
  ))
  .add('with long text', () => (
    <InputCheckbox>Some long text. Some long text. Some long text. Some long text.</InputCheckbox>
  ))
  .add('checked', () => (
    <InputCheckbox value>Some text.</InputCheckbox>
  ))
  .add('disabled', () => (
    <InputCheckbox disabled>Some text.</InputCheckbox>
  ))
  .add('checked & disabled', () => (
    <InputCheckbox text="Some text." value disabled>Some text.</InputCheckbox>
  ))
  .add('with actions', () => (
    <InputCheckbox onChange={action('change')} onFocus={action('focused')} onBlur={action('blur')}>Some text.</InputCheckbox>
  ));

