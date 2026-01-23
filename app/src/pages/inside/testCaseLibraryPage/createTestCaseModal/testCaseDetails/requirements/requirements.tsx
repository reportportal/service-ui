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

import { FC } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { FieldArray, WrappedFieldArrayProps } from 'redux-form';
import { FieldText, Button, PlusIcon, FieldLabel, CloseIcon } from '@reportportal/ui-kit';

import { FieldErrorHint, FieldProvider } from 'components/fields';
import { createClassnames, uniqueId } from 'common/utils';
import { Requirement } from 'pages/inside/testCaseLibraryPage/types';

import styles from './requirements.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  requirements: {
    id: 'createTestCaseModal.requirements',
    defaultMessage: 'Requirements',
  },
  enterLink: {
    id: 'createTestCaseModal.enterLink',
    defaultMessage:
      'Enter link, requirement ID or description (e.g., https://example.com, REQ-123, user login flow)',
  },
  addRequirement: {
    id: 'createTestCaseModal.addRequirement',
    defaultMessage: 'Add Requirement',
  },
});

const RequirementsList = ({ fields }: WrappedFieldArrayProps<Requirement>) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('requirements-container')}>
      <FieldLabel>{formatMessage(messages.requirements)}</FieldLabel>
      {fields.map((member, index) => {
        const fieldData = fields.get(index);

        return (
          <div key={fieldData.id} className={cx('requirement-row')}>
            <div className={cx('input-container')}>
              <FieldProvider
                name={`${member}.value`}
                placeholder={formatMessage(messages.enterLink)}
              >
                <FieldErrorHint provideHint={false}>
                  <FieldText defaultWidth={false} />
                </FieldErrorHint>
              </FieldProvider>
            </div>
            <Button
              variant="ghost"
              type="button"
              icon={<CloseIcon />}
              className={cx('delete-button')}
              onClick={() => fields.remove(index)}
              disabled={fields.length === 1}
            />
          </div>
        );
      })}
      <div className={cx('add-button-container')}>
        <Button
          variant="text"
          onClick={() => fields.push({ id: uniqueId(), value: '' })}
          className={cx('add-button')}
          iconPlace="start"
          icon={<PlusIcon />}
        >
          {formatMessage(messages.addRequirement)}
        </Button>
      </div>
    </div>
  );
};

export const Requirements: FC = () => {
  return <FieldArray name="requirements" component={RequirementsList} />;
};
