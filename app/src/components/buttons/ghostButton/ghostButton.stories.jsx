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
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import TestIcon from './img/test-icon-inline.svg';
import { GhostButton } from './ghostButton';
import README from './README.md';

storiesOf('Components/Buttons/ghostButton', module)
  .addDecorator(host({
    title: 'Ghost button component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 50,
    width: 200,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <GhostButton />
  ))
  .add('with text', () => (
    <GhostButton>Button title</GhostButton>
  ))
  .add('with icon', () => (
    <GhostButton icon={TestIcon} />
  ))
  .add('with icon & text', () => (
    <GhostButton icon={TestIcon}>Button title</GhostButton>
  ))
  .add('disabled with text', () => (
    <GhostButton disabled>Button title</GhostButton>
  ))
  .add('disabled with icon', () => (
    <GhostButton icon={TestIcon} disabled />
  ))
  .add('disabled with icon & text', () => (
    <GhostButton icon={TestIcon} disabled>Button title</GhostButton>
  ))
  .add('with actions', () => (
    <GhostButton onClick={action('clicked')}>Button title</GhostButton>
  ))
  .add('disabled with actions', () => (
    <GhostButton disabled onClick={action('clicked')}>Button title</GhostButton>
  ))
;
