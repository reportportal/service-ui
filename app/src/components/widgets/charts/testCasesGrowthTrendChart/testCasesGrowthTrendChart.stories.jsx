import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { withReadme } from 'storybook-readme';
import 'c3/c3.css';
import { TestCasesGrowthTrendChart } from './testCasesGrowthTrendChart';
import { state, widgetData, widgetDataTimelineMode } from './storyData';
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
    <WithState state={state}>
      <TestCasesGrowthTrendChart widget={widgetData} container={mockNode} observer={mockObserver} />
    </WithState>
  ))
  .add('preview mode', () => (
    <WithState state={state}>
      <TestCasesGrowthTrendChart
        widget={widgetData}
        container={mockNode}
        observer={mockObserver}
        isPreview
      />
    </WithState>
  ))
  .add('timeline mode', () => (
    <WithState state={state}>
      <TestCasesGrowthTrendChart
        widget={widgetDataTimelineMode}
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ))
  .add('timeline preview mode', () => (
    <WithState state={state}>
      <TestCasesGrowthTrendChart
        widget={widgetDataTimelineMode}
        container={mockNode}
        observer={mockObserver}
        isPreview
      />
    </WithState>
  ));
