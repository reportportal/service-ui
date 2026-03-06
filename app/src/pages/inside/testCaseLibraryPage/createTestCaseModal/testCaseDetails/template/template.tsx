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
import { noop } from 'es-toolkit';
import { FieldNumber } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { FieldProvider } from 'components/fields';
import { ManualScenarioType } from 'pages/inside/testCaseLibraryPage/types';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';

import { DropdownWithDescription } from '../../dropdownWithDescription';

import styles from './template.scss';

const cx = createClassnames(styles);

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
});

interface TemplateProps {
  isTemplateFieldDisabled?: boolean;
}

export const Template = ({ isTemplateFieldDisabled = false }: TemplateProps) => {
  const { formatMessage } = useIntl();

  const templateOptions = [
    {
      value: ManualScenarioType.STEPS,
      label: formatMessage(messages.steps),
      description: formatMessage(messages.idealForDetailed),
    },
    {
      value: ManualScenarioType.TEXT,
      label: formatMessage(messages.text),
      description: formatMessage(messages.idealForSimple),
    },
  ];

  return (
    <div className={cx('template')}>
      <FieldProvider name="manualScenarioType">
        <DropdownWithDescription
          label={formatMessage(messages.template)}
          options={templateOptions}
          className={cx('template__dropdown')}
          disabled={isTemplateFieldDisabled}
        />
      </FieldProvider>
      <FieldProvider name="executionEstimationTime">
        <div className={cx('template__execution-time')}>
          <FieldNumber
            min={1}
            label={formatMessage(commonMessages.executionTime)}
            onChange={noop}
          />
        </div>
      </FieldProvider>
    </div>
  );
};
