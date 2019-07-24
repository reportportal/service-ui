import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState, withTooltipRoot } from 'storybook-decorators';
import { InfoLine } from './infoLine';
import { state, mockData } from './data';
import README from './README.md';

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
  .addDecorator(withTooltipRoot)
  .add('with data', () => (
    <WithState state={state}>
      <InfoLine data={mockData} />
    </WithState>
  ));
