/*
 * Copyright 2025 EPAM Systems
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

import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { FieldNumber } from '@reportportal/ui-kit';

import { FieldProvider } from 'components/fields';

import { noop } from '../../../constants';
import { DropdownWithDescription } from '../../dropdownWithDescription';

import styles from './template.scss';

const cx = classNames.bind(styles) as typeof classNames;

const messages = defineMessages({
  template: {
    id: 'CreateTestCaseModal.template',
    defaultMessage: 'Template',
  },
  steps: {
    id: 'CreateTestCaseModal.steps',
    defaultMessage: 'Steps',
  },
  idealForDetailed: {
    id: 'CreateTestCaseModal.idealForDetailed',
    defaultMessage: 'Ideal for detailed, step-by-step tasks',
  },
  text: {
    id: 'CreateTestCaseModal.text',
    defaultMessage: 'Text',
  },
  idealForSimple: {
    id: 'CreateTestCaseModal.idealForSimple',
    defaultMessage: 'Ideal for simple cases or exploratory testing',
  },
  executionTime: {
    id: 'CreateTestCaseModal.executionTime',
    defaultMessage: 'Execution time, min',
  },
});

export const Template = () => {
  const { formatMessage } = useIntl();

  const templateOptions = [
    {
      value: 'steps',
      label: formatMessage(messages.steps),
      description: formatMessage(messages.idealForDetailed),
    },
    {
      value: 'text',
      label: formatMessage(messages.text),
      description: formatMessage(messages.idealForSimple),
    },
  ];

  return (
    <div className={cx('template')}>
      <FieldProvider name="template">
        <DropdownWithDescription
          label={formatMessage(messages.template)}
          selectedItem={templateOptions[0]}
          options={templateOptions}
          className={cx('template__dropdown')}
          onChange={noop}
        />
      </FieldProvider>
      <FieldProvider name="executionTime">
        <FieldNumber label={formatMessage(messages.executionTime)} onChange={noop} />
      </FieldProvider>
    </div>
  );
};
