import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { ProjectsPanelView } from './projectsPanelView';
import { state } from './data';

storiesOf('Pages/Admin/Projects', module)
  .addDecorator(
    host({
      title: 'Projects panel view',
      align: 'center middle',
      background: '#fff',
      height: 600,
      width: 900,
    }),
  )
  .add('with data', () => (
    <WithState state={state}>
      <ProjectsPanelView />
    </WithState>
  ));
