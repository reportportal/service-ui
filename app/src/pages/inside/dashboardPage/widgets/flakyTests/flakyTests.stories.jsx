import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import FlakyTests from './flakyTests';
import { failedTests } from './data';

storiesOf('Pages/inside/dashboardPage/flakyTests', module)
  .addDecorator(host({
    title: 'Flaky tests',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 300,
    width: '100%',
  }))
  .add('default state', () => (
    <FlakyTests
      launch={failedTests.launch}
      failed={failedTests.failed}
    />
  ));
