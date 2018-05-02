import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { LaunchSuiteGrid } from './launchSuiteGrid';

const dataMock = [
  {
    owner: 'superadmin',
    share: false,
    description: '### **Demonstration launch.**\nA typical *Launch structure* comprises the following elements: Suite > Test > Step > Log.\nLaunch contains *randomly* generated `suites`, `tests`, `steps` with:\n* random issues and statuses,\n* logs,\n* attachments with different formats.',
    id: '59f0716308813b00012cfc6a',
    name: 'Demo Api Tests_test1',
    number: 5,
    start_time: 1508929891859,
    end_time: 1508929898655,
    status: 'FAILED',
    statistics: {
      executions: {
        total: '119',
        passed: '75',
        failed: '25',
        skipped: '19',
      },
      defects: {
        product_bug: {
          total: 16,
          PB001: 16,
        },
        automation_bug: {
          AB001: 5,
          total: 5,
        },
        system_issue: {
          total: 1,
          SI001: 0,
          si_1iv6jv4gzh1eq: 1,
        },
        to_investigate: {
          total: 20,
          TI001: 20,
        },
        no_defect: {
          ND001: 0,
          total: 0,
        },
      },
    },
    tags: [
      'desktop',
      'demo',
      'build:3.0.1.5',
      'build:3.0.1.6',
      'build:3.0.1.7',
    ],
    mode: 'DEFAULT',
    isProcessing: false,
    approximateDuration: 0,
    hasRetries: false,
  },
  {
    owner: 'superadmin',
    share: false,
    description: '123',
    id: '59f07163088ffe00012cfc6b',
    name: 'Demo Api Tests_test1',
    number: 5,
    start_time: 1508929891859,
    end_time: 1508929898655,
    status: 'FAILED',
    statistics: {
      executions: {
        total: '119',
        passed: '75',
        failed: '25',
        skipped: '19',
      },
      defects: {
        product_bug: {
          total: 16,
          PB001: 16,
        },
        automation_bug: {
          AB001: 5,
          total: 5,
        },
        system_issue: {
          total: 1,
          SI001: 0,
          si_1iv6jv4gzh1eq: 1,
        },
        to_investigate: {
          total: 20,
          TI001: 20,
        },
        no_defect: {
          ND001: 0,
          total: 0,
        },
      },
    },
    tags: [
      'desktop',
      'demo',
      'build:3.0.1.5',
      'build:3.0.1.6',
      'build:3.0.1.7',
    ],
    mode: 'DEFAULT',
    isProcessing: false,
    approximateDuration: 0,
    hasRetries: false,
  },
];


storiesOf('Components/Launches/launchSuiteGrid', module)
  .addDecorator(host({
    title: 'Launch Suite Grid component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 'auto',
    width: '100%',
  }))
  .add('default state', () => (
    <LaunchSuiteGrid
      data={dataMock}
    />
  ))
;
