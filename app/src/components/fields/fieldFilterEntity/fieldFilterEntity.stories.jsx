import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { action } from '@storybook/addon-actions';
import { InputConditional } from 'components/inputs/inputConditional';
import { FieldFilterEntity } from './fieldFilterEntity';

const conditions = [
  {
    value: 'cnt',
    label: 'contains',
    shortLabel: 'cnt',
  },
  {
    value: '!cnt',
    label: 'not contains',
    shortLabel: '!cnt',
    disabled: true,
  },
  {
    value: 'eq',
    label: 'equals',
    shortLabel: 'eq',
  },
  {
    value: '!eq',
    label: 'not equals',
    shortLabel: '!eq',
  },
];

storiesOf('Components/Fields/FieldFilterEntity', module)
  .addDecorator(
    host({
      title: 'Field with icon',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 60,
      width: 237,
    }),
  )
  .add('default state', () => <FieldFilterEntity />)
  .add('with props', () => (
    <FieldFilterEntity title={'Launch name'}>
      <InputConditional
        conditions={conditions}
        value={{
          condition: '!eq',
          value: 'some entered value',
        }}
      />
    </FieldFilterEntity>
  ))
  .add('with props & actions', () => (
    <FieldFilterEntity title={'Launch name'} onRemove={action('remove')}>
      <InputConditional
        conditions={conditions}
        value={{
          condition: '!eq',
          value: 'some entered value',
        }}
      />
    </FieldFilterEntity>
  ));
