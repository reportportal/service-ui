/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
import { FieldBottomConstraints } from './fieldBottomConstraints';
import README from './README.md';

storiesOf('Components/Fields/fieldBottomConstraints', module)
  .addDecorator(host({
    title: 'Field with bottom text',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.1)',
    background: '#ffffff',
    height: 42,
    width: 382,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <FieldBottomConstraints />
  ))
  .add('with text', () => (
    <FieldBottomConstraints text="Some constraints text" />
  ))
  .add('with long text', () => (
    <FieldBottomConstraints text="Some long constraints text. Some long constraints text. Some long constraints text." />
  ))
  .add('with very long text', () => (
    <FieldBottomConstraints text="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium animi autem consequatur culpa deleniti, dolor eos eveniet expedita itaque minima placeat quam quas quos recusandae similique totam vel veniam veritatis." />
  ))
;
