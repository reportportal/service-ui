/*
 * Copyright 2021 EPAM Systems
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
import { Accordion } from './accordion';
import { data } from './data';
import README from './README.md';

storiesOf('Pages/Inside/Common/Accordion', module)
  .addDecorator(
    host({
      title: 'Defect type selector component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#272727',
      height: 400,
      width: 650,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <div>
      <Accordion renderedData={data} />
    </div>
  ))
  .add('with isActive true for all tabs', () => {
    const changedData = data.map((tab) => ({ ...tab, isActive: true }));
    return (
      <div>
        <Accordion renderedData={changedData} />
      </div>
    );
  })
  .add('renderedData without isActive field', () => {
    const changedData = data.map((tab) =>
      Object.fromEntries(Object.entries(tab).filter(([key]) => key !== 'isActive')),
    );
    return (
      <div>
        <Accordion renderedData={changedData} />
      </div>
    );
  });
