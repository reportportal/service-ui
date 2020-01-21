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

import React from 'react';
import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';

import { PageSection } from 'layouts/pageLayout';
import { Page } from './page';
import README from './README.md';

storiesOf('Components/Main/Page', module)
  .addDecorator(
    host({
      title: 'Page component',
      align: 'center middle',
      backdrop: '#ffffff',
      background: '#E9E9E9',
      height: 300,
      width: 300,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <Page />)
  .add('with title', () => <Page title="Page title" />)
  .add('with title & children', () => (
    <Page title="Page title">
      <PageSection>
        <SpinningPreloader />
      </PageSection>
    </Page>
  ));
