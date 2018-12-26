import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { MostFailedTests } from './mostFailedTests';
import { failedTests, state } from './data';
import README from './README.md';

storiesOf('Components/Widgets/Tables/MostFailedTests', module)
  .addDecorator(
    host({
      title: 'Most Failed test-cases widget',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 300,
      width: '100%',
    }),
  )
  .addDecorator(withReadme(README))
  .add('with required props: launch, issueType, tests, nameClickHandler', () => (
    <WithState state={state}>
      <MostFailedTests widget={failedTests} nameClickHandler={action('Test id: ')} />
    </WithState>
  ));
