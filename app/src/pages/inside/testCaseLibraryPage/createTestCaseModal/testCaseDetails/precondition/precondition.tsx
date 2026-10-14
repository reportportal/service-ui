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
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldTextFlex } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { PRECONDITION_FIELD_MAX_LENGTH } from '../../constants';

import styles from './precondition.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  enterPrecondition: {
    id: 'createTestCaseModal.enterPrecondition',
    defaultMessage: 'Enter the precondition details for the test case here',
  },
  precondition: {
    id: 'createTestCaseModal.precondition',
    defaultMessage: 'Precondition',
  },
});

export const Precondition = () => {
  const { formatMessage } = useIntl();

  return (
    <FieldProvider name="precondition">
      <FieldErrorHint className={cx('field')}>
        <FieldTextFlex
          label={formatMessage(messages.precondition)}
          placeholder={formatMessage(messages.enterPrecondition)}
          maxLength={PRECONDITION_FIELD_MAX_LENGTH}
          maxLengthDisplay={PRECONDITION_FIELD_MAX_LENGTH}
          value=""
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};
