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
import { validate } from 'common/utils';
import { InputTagsSearch } from './inputTagsSearch';
import README from './README.md';

storiesOf('Components/Inputs/InputTagsSearch', module)
  .addDecorator(host({
    title: 'Input tags search',
    align: 'center middle',
    background: 'white',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    height: 400,
    width: 400,
  }))
  .addDecorator(withReadme(README))
  .add('default state', () =>
    <InputTagsSearch />,
  )
  .add('with options', () => {
    const options = [{ value: '68014', label: 'R3 v2.2' }, { value: '69373', label: 'TA Report Portal R3' }, { value: '78887', label: 'R3 2.5' }, { value: '80710', label: 'R3 2.1 Beta1' }, { value: '80711', label: 'R3 2.1 Beta2' }, { value: '81819', label: 'R3 2.6' }, { value: '82629', label: 'R3 2.7' }, { value: '82630', label: 'R3 3.0' }, { value: '82813', label: 'R3 3.1' }, { value: '84412', label: '3.0.2' }, { value: '84451', label: '3.0.3' }, { value: '86571', label: '3.1' }, { value: '86584', label: '3.2' }, { value: '87361', label: '3.3' }, { value: '87566', label: '3.4' }, { value: '89279', label: '4.0' }, { value: '93491', label: '4.0.1' }, { value: '93492', label: '4.0.2' }, { value: '93493', label: '4.0.3' }, { value: '93494', label: '4.1' }, { value: '93495', label: '4.1.1' }, { value: '93496', label: '4.1.2' }, { value: '93497', label: '4.2' }];
    return (
      <InputTagsSearch
        options={options}
        nothingFound="No mathes found"
      />
    );
  })
  .add('with nothingFound label', () => {
    const options = [{ value: '68014', label: 'R3 v2.2' }, { value: '69373', label: 'TA Report Portal R3' }, { value: '78887', label: 'R3 2.5' }, { value: '80710', label: 'R3 2.1 Beta1' }, { value: '80711', label: 'R3 2.1 Beta2' }, { value: '81819', label: 'R3 2.6' }, { value: '82629', label: 'R3 2.7' }, { value: '82630', label: 'R3 3.0' }, { value: '82813', label: 'R3 3.1' }, { value: '84412', label: '3.0.2' }, { value: '84451', label: '3.0.3' }, { value: '86571', label: '3.1' }, { value: '86584', label: '3.2' }, { value: '87361', label: '3.3' }, { value: '87566', label: '3.4' }, { value: '89279', label: '4.0' }, { value: '93491', label: '4.0.1' }, { value: '93492', label: '4.0.2' }, { value: '93493', label: '4.0.3' }, { value: '93494', label: '4.1' }, { value: '93495', label: '4.1.1' }, { value: '93496', label: '4.1.2' }, { value: '93497', label: '4.2' }];
    return (
      <InputTagsSearch
        options={options}
        nothingFound="No mathes found"
      />
    );
  })
  .add('with value ', () => (
    <InputTagsSearch
      value={[{ value: '68014', label: 'R3 v2.2' }, { value: '69373', label: 'TA Report Portal R3' }]}
    />
  ))
  .add('with onChange action', () => {
    const options = [{ value: '68014', label: 'R3 v2.2' }, { value: '69373', label: 'TA Report Portal R3' }];
    return (
      <InputTagsSearch
        options={options}
        onChange={action('Select Item')}
      />
    );
  })
  .add('creatable with validation', () => {
    const isValidNewOption = (label, minLength, validation) => {
      if (!label || !label.length) {
        return false;
      } else if (label.length >= minLength) {
        return validation(label);
      }
      return true;
    };
    return (
      <InputTagsSearch
        creatable
        minLength={3}
        validation={validate.email}
        isValidNewOption={isValidNewOption}
      />
    );
  })
  .add('Dynamic search label and minLength', () =>
    (<InputTagsSearch
      minLength={3}
      dynamicSearchPromptText
    />),
  );
