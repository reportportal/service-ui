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
import { ScrollWrapper } from './scrollWrapper';
import README from './README.md';

const shortText = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.';
const longText = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
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

storiesOf('Components/Main/scrollWrapper', module)
  .addDecorator(host({
    title: 'Big button component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 250,
    width: 400,
  }))
  .addDecorator(withReadme(README))
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
  ))
;
