import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { DotsMenuButton } from './dotsMenuButton';
import { SEPARATOR_ITEM, DANGER_ITEM } from './constants';
import README from './README.md';

const items = [
  {
    label: 'Item label',
    value: 'First item value',
    onClick: action('clicked first'),
  },
  {
    label: 'Item label',
    value: 'Second item value',
    onClick: action('clicked second'),
  },
  {
    label: '',
    value: 'Third item value',
    type: SEPARATOR_ITEM,
  },
  {
    label: 'Danger',
    value: 'Danger item value',
    onClick: action('clicked danger'),
    type: DANGER_ITEM,
  },
];

storiesOf('Components/Buttons/DotsMenuButton', module)
  .addDecorator(
    host({
      title: 'Dots menu button component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 50,
      width: 150,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <DotsMenuButton />)
  .add('with items & hr & actions', () => <DotsMenuButton items={items} />);
