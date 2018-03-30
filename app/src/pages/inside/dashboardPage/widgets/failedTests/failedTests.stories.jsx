import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import FailedTests from './failedTests';
import { failedTests } from './data';

storiesOf('Pages/inside/dashboardPage/failedTests', module)
  .addDecorator(host({
    title: 'Flaky tests',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 300,
    width: '100%',
  }))
  .add('default state', () => (
    <FailedTests
      launch={failedTests.launch}
      tests={failedTests.tests}
    />
  ));
