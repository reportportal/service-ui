import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import 'c3/c3.css';

import { UniqueBugsTable } from './uniqueBugsTable';
import { widgetData } from './storyData';
import README from './README.md';

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};

storiesOf('Pages/Inside/DashboardPage/Widgets/UniqueBugsTable', module)
  .addDecorator(
    host({
      title: 'Unique Bug Table component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 300,
      width: '100%',
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <UniqueBugsTable widget={widgetData} container={mockNode} observer={mockObserver} />
  ))
  .add('preview mode', () => (
    <UniqueBugsTable widget={widgetData} container={mockNode} observer={mockObserver} isPreview />
  ));
