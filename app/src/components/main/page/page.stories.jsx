import React from 'react';
import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { withReadme } from 'storybook-readme';
import { Page } from './page';
import README from './README.md';

storiesOf('Components/Main/Page', module)
  .addDecorator(
    host({
      title: 'Page component',
      align: 'center middle',
      backdrop: '#ffffff',
      background: '#E9E9E9',
      height: 300,
      width: 300,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <Page />)
  .add('with title', () => <Page title="Page title" />)
  .add('with title & children', () => (
    <Page title="Page title">
      <SpinningPreloader />
    </Page>
  ));
