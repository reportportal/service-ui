import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { DefectStatistics } from './defectStatistics';
import { state, mockData } from './data';
import README from './README.md';

storiesOf('Pages/Inside/Common/launchSuiteGrid/defectStatistics', module)
  .addDecorator(
    host({
      title: 'Defect statistics component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 60,
      width: 70,
    }),
  )
  .addDecorator(withReadme(README))
  .add('with data', () => (
    <WithState state={state}>
      <DefectStatistics {...mockData} />
    </WithState>
  ));
