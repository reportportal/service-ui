/*
 * Copyright 2026 EPAM Systems
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

import { useIntl, defineMessages } from 'react-intl';
import type { WrappedFieldArrayProps } from 'redux-form';
import { FieldText, Button, PlusIcon, CloseIcon, FieldLabel } from '@reportportal/ui-kit';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { createClassnames } from 'common/utils';
import styles from './githubOrganizations.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  githubOrganizationLabel: {
    id: 'GithubFormFields.githubOrganizationLabel',
    defaultMessage: 'GitHub organization',
  },
  addGithubOrganization: {
    id: 'GithubFormFields.addGithubOrganization',
    defaultMessage: 'Add GitHub Organization',
  },
  organizationPlaceholder: {
    id: 'GithubFormFields.organizationPlaceholder',
    defaultMessage: 'Enter the organization name',
  },
});

export interface GithubOrganizationsProps extends WrappedFieldArrayProps<string> {
  disabled?: boolean;
}

export const GithubOrganizations = ({ fields, disabled = false }: GithubOrganizationsProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('organizations-container')}>
      <FieldLabel>{formatMessage(messages.githubOrganizationLabel)}</FieldLabel>
      {fields.map((item, index) => (
        <div className={cx('organization-row')} key={item}>
          <div className={cx('input-container')}>
            <FieldProvider
              name={item}
              placeholder={formatMessage(messages.organizationPlaceholder)}
              disabled={disabled}
            >
              <FieldErrorHint provideHint={false}>
                <FieldText defaultWidth={false} />
              </FieldErrorHint>
            </FieldProvider>
          </div>
          <Button
            variant="ghost"
            adjustWidthOn="content"
            type="button"
            icon={<CloseIcon />}
            className={cx('delete-button')}
            onClick={() => fields.remove(index)}
            disabled={disabled || fields.length === 1}
          />
        </div>
      ))}
      <div className={cx('add-button-container')}>
        <Button
          variant="text"
          type="button"
          onClick={() => fields.push('')}
          className={cx('add-button')}
          iconPlace="start"
          icon={<PlusIcon />}
          disabled={disabled}
        >
          {formatMessage(messages.addGithubOrganization)}
        </Button>
      </div>
    </div>
  );
};
