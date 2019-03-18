import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { WithState } from 'storybook-decorators';
import { ProjectPanel } from './projectPanel';
import { state, mockData } from './data';
import README from './README.md';

storiesOf('Pages/Admin/ProjectInfo', module)
  .addDecorator(
    host({
      title: 'Project info block component',
      align: 'center middle',
      background: '#fff',
      height: 160,
      width: 270,
    }),
  )
  .addDecorator(withReadme(README))
  .add('with data', () => (
    <WithState state={state}>
      <ProjectPanel {...mockData} />
    </WithState>
  ));
