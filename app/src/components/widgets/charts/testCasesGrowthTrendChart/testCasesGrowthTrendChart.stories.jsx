import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import 'c3/c3.css';

import { TestCasesGrowthTrendChart } from './testCasesGrowthTrendChart';
import { widgetData, widgetDataTimelineMode } from './storyData';
import README from './README.md';

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};

storiesOf('Components/Widgets/Charts/TestCasesGrowthTrendChart', module)
  .addDecorator(
    host({
      title: 'Test Cases Growth Trend Chart component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 360,
      width: 640,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <TestCasesGrowthTrendChart widget={widgetData} container={mockNode} observer={mockObserver} />
  ))
  .add('preview mode', () => (
    <TestCasesGrowthTrendChart
      widget={widgetData}
      container={mockNode}
      observer={mockObserver}
      isPreview
    />
  ))
  .add('timeline mode', () => (
    <TestCasesGrowthTrendChart
      widget={widgetDataTimelineMode}
      container={mockNode}
      observer={mockObserver}
    />
  ))
  .add('timeline preview mode', () => (
    <TestCasesGrowthTrendChart
      widget={widgetDataTimelineMode}
      container={mockNode}
      observer={mockObserver}
      isPreview
    />
  ));
