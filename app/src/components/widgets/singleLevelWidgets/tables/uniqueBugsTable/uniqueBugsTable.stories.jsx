import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { UniqueBugsTable } from './uniqueBugsTable';
import { widgetData } from './storyData';
import README from './README.md';

storiesOf('Components/Widgets/Tables/UniqueBugsTable', module)
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
  .add('default state', () => <UniqueBugsTable widget={widgetData} />);
