/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';

import { FieldBottomConstraints } from './fieldBottomConstraints';
import README from './README.md';

storiesOf('Components/Fields/fieldBottomConstraints', module)
  .addDecorator(
    host({
      title: 'Field with bottom text',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.1)',
      background: '#ffffff',
      height: 42,
      width: 382,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <FieldBottomConstraints />)
  .add('with text', () => <FieldBottomConstraints text="Some constraints text" />)
  .add('with long text', () => (
    <FieldBottomConstraints text="Some long constraints text. Some long constraints text. Some long constraints text." />
  ))
  .add('with very long text', () => (
    <FieldBottomConstraints text="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium animi autem consequatur culpa deleniti, dolor eos eveniet expedita itaque minima placeat quam quas quos recusandae similique totam vel veniam veritatis." />
  ));
