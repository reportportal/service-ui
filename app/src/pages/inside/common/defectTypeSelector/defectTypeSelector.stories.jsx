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
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { DefectTypeSelector } from './defectTypeSelector';
import README from './README.md';
import { state } from './data';

const value = 'AB001';

storiesOf('Pages/Inside/Common/DefectTypeSelector', module)
  .addDecorator(
    host({
      title: 'Defect type selector component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 400,
      width: 580,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <WithState state={state}>
        <DefectTypeSelector />
      </WithState>
    </div>
  ))
  .add('with placeholder', () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <WithState state={state}>
        <DefectTypeSelector placeholder="Choose defect type" />
      </WithState>
    </div>
  ))
  .add('with value', () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <WithState state={state}>
        <DefectTypeSelector value={value} />
      </WithState>
    </div>
  ))
  .add('with actions', () => (
    <div style={{ width: '100%', position: 'relative' }}>
      <WithState state={state}>
        <DefectTypeSelector
          onChange={action('onchange')}
          placeholder="Choose defect type"
          value={value}
        />
      </WithState>
    </div>
  ));
