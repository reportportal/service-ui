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
import { FieldText } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';

import { FieldErrorHint, FieldProvider } from 'components/fields';

import styles from './step.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  instructions: {
    id: 'CreateTestCaseModal.instructions',
    defaultMessage: 'Instructions',
  },
  enterInstruction: {
    id: 'CreateTestCaseModal.enterInstruction',
    defaultMessage: 'Enter instruction',
  },
  expectedResult: {
    id: 'CreateTestCaseModal.expectedResult',
    defaultMessage: 'Expected result',
  },
  enterExpectedResult: {
    id: 'CreateTestCaseModal.enterExpectedResult',
    defaultMessage: 'Enter expected result',
  },
});

interface StepProps {
  stepId: string;
}

export const Step = ({ stepId }: StepProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('step')}>
      <FieldProvider name={`steps.${stepId}.instructions`}>
        <FieldErrorHint>
          <FieldText
            label={formatMessage(messages.instructions)}
            placeholder={formatMessage(messages.enterInstruction)}
            defaultWidth={false}
          />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name={`steps.${stepId}.expectedResult`}>
        <FieldErrorHint>
          <FieldText
            label={formatMessage(messages.expectedResult)}
            placeholder={formatMessage(messages.enterExpectedResult)}
            defaultWidth={false}
          />
        </FieldErrorHint>
      </FieldProvider>
    </div>
  );
};
