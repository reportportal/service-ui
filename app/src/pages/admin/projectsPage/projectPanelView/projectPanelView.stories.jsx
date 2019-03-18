import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
// import { withReadme } from 'storybook-readme';
import { WithState } from 'storybook-decorators';
import { ProjectPanelView } from './projectPanelView';
import { state, projects } from './data';
// import README from './README.md';

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
  // .addDecorator(withReadme(README))
  .add('without data', () => (
    <WithState state={state}>
      <ProjectPanelView projects={[]} />
    </WithState>
  ))
  .add('with data', () => (
    <WithState state={state}>
      <ProjectPanelView projects={projects} />
    </WithState>
  ));
