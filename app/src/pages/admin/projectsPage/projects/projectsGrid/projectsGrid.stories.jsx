import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { WithState } from 'storybook-decorators';
import { ProjectsGrid } from './projectsGrid';
import { state, projects } from './data';

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
      <ProjectsGrid projects={[]} />
    </WithState>
  ))
  .add('with data', () => (
    <WithState state={state}>
      <ProjectsGrid projects={projects} />
    </WithState>
  ));
