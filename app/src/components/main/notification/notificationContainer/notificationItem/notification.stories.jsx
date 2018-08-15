import React from 'react';
import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { Notification } from './notification';
import README from './README.md';

storiesOf('Components/Main/Notification', module)
  .addDecorator(
    host({
      title: 'Notification component',
      align: 'center middle',
      backdrop: '#ffffff',
      background: '#E9E9E9',
      height: 500,
      width: 600,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <Notification />)
  .add('simple message', () => <Notification message="Simple message" />)
  .add('error message', () => <Notification message="Simple message" type="error" />)
  .add('success message', () => <Notification message="Simple message" type="success" />)
  .add('long message', () => (
    <Notification message="It makes perfect sense for us to write our UIs in a declarative manner. The reason is that we need to reuse UI elements and compose them together in different configurations. One can also claim that declarative code reads better, not because it is less syntax, but because you only describe what you want, not how you want it." />
  ));
