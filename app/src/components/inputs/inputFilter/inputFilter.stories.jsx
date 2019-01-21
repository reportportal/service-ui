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
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import {
  EntityItemName,
  EntityItemDescription,
  EntityLaunchNumber,
} from 'components/filterEntities';
import {
  ENTITY_NAME,
  ENTITY_DESCRIPTION,
  ENTITY_NUMBER,
  CONDITION_CNT,
  CONDITION_GREATER_EQ,
} from 'components/filterEntities/constants';
import { InputFilter } from './inputFilter';
import README from './README.md';

const value = 'Adam';
const entities = [
  {
    id: ENTITY_NAME,
    component: EntityItemName,
    value: {
      value: '',
      condition: CONDITION_CNT,
    },
    title: 'Name',
    active: true,
    removable: false,
    static: true,
  },
  {
    id: ENTITY_DESCRIPTION,
    component: EntityItemDescription,
    value: {
      value: '',
      condition: CONDITION_CNT,
    },
    title: 'Login',
    active: true,
    removable: false,
  },
  {
    id: ENTITY_NUMBER,
    component: EntityLaunchNumber,
    value: {
      value: '',
      condition: CONDITION_GREATER_EQ,
    },
    title: 'Email',
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
  .add('active', () => <InputFilter active />);
