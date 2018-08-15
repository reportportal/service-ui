import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators/withState';
import { InfoLine } from './infoLine';
import { state, mockData } from './data';
import README from './README.md';

const withToolTip = (getStory) => {
  const tooltipRoot = document.getElementById('tooltip-root') || document.createElement('div');
  tooltipRoot.setAttribute('id', 'tooltip-root');
  const rootDiv = document.getElementById('root');
  rootDiv.parentNode.appendChild(tooltipRoot);
  return <div>{getStory()}</div>;
};

storiesOf('Pages/Inside/Common/InfoLine', module)
  .addDecorator(
    host({
      title: 'Info line component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 'auto',
      width: '100%',
    }),
  )
  .addDecorator(withReadme(README))
  .addDecorator(withToolTip)
  .add('with data', () => (
    <WithState state={state}>
      <InfoLine data={mockData} />
    </WithState>
  ));
