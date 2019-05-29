import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { RegExEditor } from './regExEditor';
import README from './README.md';

storiesOf('Components/Inputs/RegExEditor', module)
  .addDecorator(
    host({
      title: 'Code editor component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 300,
      width: 300,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <RegExEditor />)
  .add('with predefined value', () => <RegExEditor value="^[a-z]{1,125}$" />)
  .add('with predefined value & readonly', () => <RegExEditor value="^[a-z]{1,125}$" readonly />)
  .add('with actions', () => (
    <RegExEditor value="^[a-z]{1,125}$" onChange={action('change')} onBlur={action('blur')} />
  ));
