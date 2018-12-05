/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { EntityItemAttributeValues } from '../../../components/filterEntities';
import {
  ENTITY_ATTRIBUTE_VALUES,
  CONDITION_HAS,
} from '../../../components/filterEntities/constants';
import { InputFilter } from './inputFilter';
import README from './README.md';

const value = 'Adam';
const filterValues = {};
const entities = [
  {
    id: ENTITY_ATTRIBUTE_VALUES,
    component: EntityItemAttributeValues,
    value:
      ENTITY_ATTRIBUTE_VALUES in filterValues
        ? filterValues[ENTITY_ATTRIBUTE_VALUES]
        : {
            value: '',
            condition: CONDITION_HAS,
          },
    title: 'Name',
    active: true,
    removable: false,
  },
  {
    id: ENTITY_ATTRIBUTE_VALUES,
    component: EntityItemAttributeValues,
    value:
      ENTITY_ATTRIBUTE_VALUES in filterValues
        ? filterValues[ENTITY_ATTRIBUTE_VALUES]
        : {
            value: '',
            condition: CONDITION_HAS,
          },
    title: 'Login',
    active: true,
    removable: false,
  },
  {
    id: ENTITY_ATTRIBUTE_VALUES,
    component: EntityItemAttributeValues,
    value:
      ENTITY_ATTRIBUTE_VALUES in filterValues
        ? filterValues[ENTITY_ATTRIBUTE_VALUES]
        : {
            value: '',
            condition: CONDITION_HAS,
          },
    title: 'Email',
    active: true,
    removable: false,
  },
  {
    id: ENTITY_ATTRIBUTE_VALUES,
    component: EntityItemAttributeValues,
    value:
      ENTITY_ATTRIBUTE_VALUES in filterValues
        ? filterValues[ENTITY_ATTRIBUTE_VALUES]
        : {
            value: '',
            condition: CONDITION_HAS,
          },
    title: 'Projects',
    active: true,
    removable: false,
  },
];

storiesOf('Components/Inputs/InputFilter', module)
  .addDecorator(
    host({
      title: 'InputFilter component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 38,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => <InputFilter filterEntities={entities} />)
  .add('with value', () => <InputFilter value={value} />)
  .add('with placeholder', () => <InputFilter placeholder="Search" />)
  .add('active', () => <InputFilter active />)
  .add('with actions', () => (
    <InputFilter
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      onKeyUp={action('keyup')}
    />
  ))
  .add('disabled', () => <InputFilter disabled />);
