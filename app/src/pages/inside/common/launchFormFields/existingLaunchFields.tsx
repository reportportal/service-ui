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

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Field, WrappedFieldProps } from 'redux-form';
import { FieldLabel } from '@reportportal/ui-kit';
import { useSelector } from 'react-redux';

import { createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { LAUNCH_NAME_FILTER_KEY } from 'pages/inside/common/constants';

import { ExistingLaunchFieldsProps, LaunchOption } from './types';
import { LAUNCH_FORM_FIELD_NAMES, PAGE_SIZE, LAUNCH_NAME_MAX_LENGTH } from './constants';
import { messages } from './messages';

import styles from './launchFormFields.scss';

const cx = createClassnames(styles);

interface LaunchAutocompleteFieldProps extends WrappedFieldProps {
  projectKey: string;
  menuPortalRoot: HTMLElement;
  onLaunchSelect?: ExistingLaunchFieldsProps['onLaunchSelect'];
}

const LaunchAutocompleteField = ({
  input,
  projectKey,
  menuPortalRoot,
  onLaunchSelect,
}: LaunchAutocompleteFieldProps) => {
  const { formatMessage } = useIntl();
  const [showLimitationText, setShowLimitationText] = useState(false);

  const retrieveLaunches = (value: string) =>
    URLS.manualLaunchesListPagination(
      projectKey,
      value ? { [LAUNCH_NAME_FILTER_KEY]: value, limit: PAGE_SIZE } : { limit: PAGE_SIZE },
    );

  const makeLaunchOptions = (response: {
    content: Array<{ id: number; name: string }>;
    page: { totalElements: number };
  }) => {
    setShowLimitationText((response.page?.totalElements ?? 0) > PAGE_SIZE);
    return response.content;
  };

  const handleLaunchChange = (value: unknown, fieldInput: { onChange: (value: unknown) => void }) => {
    fieldInput.onChange(value);
    if (onLaunchSelect) {
      onLaunchSelect(value as LaunchOption | null);
    }
  };

  return (
    <AsyncAutocompleteV2
      value={input.value}
      name={input.name}
      placeholder={formatMessage(messages.searchAndSelectLaunch)}
      getURI={retrieveLaunches}
      makeOptions={makeLaunchOptions}
      onChange={(value) => handleLaunchChange(value, input)}
      parseValueToString={(value: { name?: string }) => value?.name || ''}
      createWithoutConfirmation
      skipOptionCreation
      isDropdownMode
      minLength={0}
      maxLength={LAUNCH_NAME_MAX_LENGTH}
      menuFooter={showLimitationText ? formatMessage(messages.tooManyLaunchesResult) : undefined}
      menuClassName={cx('modal-autocomplete-menu')}
      menuPortalRoot={menuPortalRoot}
      dropdownMatchInputWidth
      withMenuFlip
    />
  );
};

export const ExistingLaunchFields = ({ onLaunchSelect }: ExistingLaunchFieldsProps) => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);
  const menuPortalRoot = document.getElementById('tooltip-root') || document.body;

  return (
    <div className={cx('launch-name-field')}>
      <FieldLabel isRequired>{formatMessage(messages.launchName)}</FieldLabel>
      <Field
        name={LAUNCH_FORM_FIELD_NAMES.NAME}
        component={LaunchAutocompleteField}
        projectKey={projectKey}
        menuPortalRoot={menuPortalRoot}
        onLaunchSelect={onLaunchSelect}
      />
    </div>
  );
};
