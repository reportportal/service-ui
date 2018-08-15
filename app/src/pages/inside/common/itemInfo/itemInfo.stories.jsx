import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators/withState';
import { ItemInfo } from './itemInfo';
import { state, mockData } from './data';
import README from './README.md';

storiesOf('Pages/Inside/Common/ItemInfo', module)
  .addDecorator(
    host({
      title: 'Item info component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 100,
      width: 320,
    }),
  )
  .addDecorator(withReadme(README))
  .add('with data', () => (
    <WithState state={state}>
      <ItemInfo refFunction={() => {}} value={mockData} />
    </WithState>
  ));
