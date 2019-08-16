import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { withReadme } from 'storybook-readme';
import { LaunchesTable } from './launchesTable';
import { mockData, state } from './data';
import README from './README.md';

storiesOf('Components/Widgets/Tables/LaunchesTable', module)
  .addDecorator(
    host({
      title: 'Launches table widget',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 300,
      width: '100%',
    }),
  )
  .addDecorator(withReadme(README))
  .add('with required prop widget (mock data)', () => (
    <WithState state={state}>
      <LaunchesTable widget={mockData} />
    </WithState>
  ));
