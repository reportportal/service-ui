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

import { ScrollWrapper } from './scrollWrapper';
import README from './README.md';

const shortText = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.';
const longText =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
  'Amet aspernatur commodi dicta, eos possimus quidem saepe vitae?' +
  'Ad, aliquam commodi consequatur cumque earum, eius expedita harum maiores quod rerum saepe.' +
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
  'Amet aspernatur commodi dicta, eos possimus quidem saepe vitae?' +
  'Ad, aliquam commodi consequatur cumque earum, eius expedita harum maiores quod rerum saepe.' +
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
  'Amet aspernatur commodi dicta, eos possimus quidem saepe vitae?' +
  'Ad, aliquam commodi consequatur cumque earum, eius expedita harum maiores quod rerum saepe.' +
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
  'Amet aspernatur commodi dicta, eos possimus quidem saepe vitae?' +
  'Ad, aliquam commodi consequatur cumque earum, eius expedita harum maiores quod rerum saepe.' +
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
  'Amet aspernatur commodi dicta, eos possimus quidem saepe vitae?' +
  'Ad, aliquam commodi consequatur cumque earum, eius expedita harum maiores quod rerum saepe.' +
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
  'Amet aspernatur commodi dicta, eos possimus quidem saepe vitae?' +
  'Ad, aliquam commodi consequatur cumque earum, eius expedita harum maiores quod rerum saepe.';

storiesOf('Components/Main/ScrollWrapper', module)
  .addDecorator(
    host({
      title: 'Scroll wrapper component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 250,
      width: 400,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <ScrollWrapper>
      <div>{shortText}</div>
    </ScrollWrapper>
  ))
  .add('with vertical scroll', () => (
    <ScrollWrapper>
      <div>{longText}</div>
    </ScrollWrapper>
  ))
  .add('with horizontal scroll', () => (
    <ScrollWrapper>
      <div style={{ width: 2000 }}>{longText}</div>
    </ScrollWrapper>
  ))
  .add('with both scrolls', () => (
    <ScrollWrapper>
      <div style={{ width: 600 }}>{longText}</div>
    </ScrollWrapper>
  ))
  .add('autoheight (grows with content)', () => (
    <ScrollWrapper autoHeight>
      <div>{longText}</div>
    </ScrollWrapper>
  ))
  .add('autoheight limited (autoHeightMax = 100px)', () => (
    <ScrollWrapper autoHeight autoHeightMax={100}>
      <div>{longText}</div>
    </ScrollWrapper>
  ));
