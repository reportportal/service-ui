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

import { useIntl } from 'react-intl';
import { Field, WrappedFieldProps } from 'redux-form';
import { FieldLabel } from '@reportportal/ui-kit';
import { useSelector } from 'react-redux';

import { createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';

import { ExistingLaunchFieldsProps } from './types';
import { LAUNCH_FORM_FIELD_NAMES } from './constants';
import { messages } from './messages';

import styles from './launchFormFields.scss';

const cx = createClassnames(styles);

export const ExistingLaunchFields = ({ onLaunchSelect }: ExistingLaunchFieldsProps) => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const retrieveLaunches = (value: string) =>
    URLS.manualLaunchesListPagination(
      projectKey,
      value ? { 'filter.eq.name': value, pageSize: 50 } : {},
    );

  const makeLaunchOptions = (response: { content: Array<{ id: number; name: string }> }) =>
    response.content;

  const handleLaunchChange = (value: unknown, input: { onChange: (value: unknown) => void }) => {
    input.onChange(value);
    if (onLaunchSelect) {
      const launch = value as { id: number; name: string } | null;
      onLaunchSelect(launch);
    }
  };

  return (
    <div className={cx('launch-name-field')}>
      <FieldLabel isRequired>{formatMessage(messages.launchName)}</FieldLabel>
      <Field
        name={LAUNCH_FORM_FIELD_NAMES.NAME}
        component={({ input }: WrappedFieldProps) => (
          <AsyncAutocompleteV2
            {...input}
            placeholder={formatMessage(messages.searchAndSelectLaunch)}
            getURI={retrieveLaunches}
            makeOptions={makeLaunchOptions}
            onChange={(value) => handleLaunchChange(value, input)}
            parseValueToString={(value: { name?: string }) => value?.name || ''}
            createWithoutConfirmation
            skipOptionCreation
            isDropdownMode
            minLength={0}
            limitOptions={50}
            limitationText={formatMessage(messages.tooManyLaunchesResult)}
          />
        )}
      />
    </div>
  );
};
