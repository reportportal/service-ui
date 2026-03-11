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

import { ChangeEvent, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Field, WrappedFieldProps } from 'redux-form';

import { createClassnames } from 'common/utils';
import { ButtonSwitcher } from 'pages/inside/common/buttonSwitcher';
import { Checkbox } from '@reportportal/ui-kit';

import { LaunchFormFieldsProps, LaunchMode } from './types';
import { LAUNCH_FORM_FIELD_NAMES } from './constants';
import { messages } from './messages';
import { ExistingLaunchFields } from './existingLaunchFields';
import { NewLaunchFields } from './newLaunchFields';

import styles from './launchFormFields.scss';

const cx = createClassnames(styles);

export const LaunchFormFields = ({
  activeMode = LaunchMode.NEW,
  onModeChange,
  onLaunchSelect,
  description,
  isUncoveredTestsCheckboxAvailable = true,
  hideTestPlanField = false,
}: LaunchFormFieldsProps) => {
  const { formatMessage } = useIntl();

  const isExistingMode = activeMode === LaunchMode.EXISTING;

  const handleModeChange = (mode: string) => {
    if (onModeChange) {
      onModeChange(mode as LaunchMode);
    }
  };

  const renderUncoveredTestsCheckbox = useCallback(
    ({ input }: WrappedFieldProps) => (
      <Checkbox
        value={Boolean(input.value)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => input.onChange(e.target.checked)}
        className={cx('checkbox')}
      >
        {formatMessage(messages.addOnlyUncoveredTestCases)}
      </Checkbox>
    ),
    [formatMessage],
  );

  return (
    <>
      <ButtonSwitcher
        description={description}
        createNewButtonTitle={formatMessage(messages.createNewLaunch)}
        existingButtonTitle={formatMessage(messages.addToExistingLaunch)}
        handleActiveButton={handleModeChange}
      />

      {isUncoveredTestsCheckboxAvailable && (
        <div className={cx('uncovered-tests-checkbox')}>
          <Field
            name={LAUNCH_FORM_FIELD_NAMES.UNCOVERED_TESTS_ONLY}
            component={renderUncoveredTestsCheckbox}
          />
        </div>
      )}

      {isExistingMode ? (
        <ExistingLaunchFields onLaunchSelect={onLaunchSelect} />
      ) : (
        <NewLaunchFields hideTestPlanField={hideTestPlanField} />
      )}
    </>
  );
};
