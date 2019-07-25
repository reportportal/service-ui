import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { START_TIME_FORMAT_RELATIVE } from 'controllers/user';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { ProjectActivity } from './projectActivity';
import { data } from './data';
import README from './README.md';

const state = {
  user: {
    settings: {
      startTimeFormat: START_TIME_FORMAT_RELATIVE,
    },
  },
};

const widget = {
  content: {
    result: data,
  },
};

storiesOf('Components/Widgets/Tables/ProjectActivity', module)
  .addDecorator(
    host({
      title: 'Project activity widget',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 300,
      width: '100%',
    }),
  )
  .addDecorator(withReadme(README))
  .add('with activity prop', () => (
    <WithState state={state}>
      <ProjectActivity widget={widget} />
    </WithState>
  ));
