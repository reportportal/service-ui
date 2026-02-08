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
import { Field } from 'redux-form';
import { useMemo, ReactNode } from 'react';

import { createClassnames } from 'common/utils';
import { ButtonSwitcher } from 'pages/inside/common/buttonSwitcher';

import { LaunchFormFieldsProps, LaunchMode } from './types';
import { LAUNCH_FORM_FIELD_NAMES } from './constants';
import { messages } from './messages';
import { CheckboxField } from './checkboxField';
import { ExistingLaunchFields } from './existingLaunchFields';
import { NewLaunchFields } from './newLaunchFields';

import styles from './launchFormFields.scss';

const cx = createClassnames(styles);

export const LaunchFormFields = ({
  testPlanName,
  activeMode = LaunchMode.NEW,
  onModeChange,
  onLaunchSelect,
  onTestPlanChange,
  description,
  isTestPlanFieldDisabled = true,
}: LaunchFormFieldsProps) => {
  const { formatMessage } = useIntl();

  const isExistingMode = activeMode === LaunchMode.EXISTING;

  const defaultDescription = useMemo(() => {
    return formatMessage(messages.addTestCasesFromTestPlan, {
      testPlanName: testPlanName || '',
      bold: (value: ReactNode) => <b className={cx('test-plan-name')}>{value}</b>,
    });
  }, [testPlanName, formatMessage]);

  const handleModeChange = (mode: string) => {
    if (onModeChange) {
      onModeChange(mode as LaunchMode);
    }
  };

  return (
    <>
      <ButtonSwitcher
        description={description || defaultDescription}
        createNewButtonTitle={formatMessage(messages.createNewLaunch)}
        existingButtonTitle={formatMessage(messages.addToExistingLaunch)}
        handleActiveButton={handleModeChange}
      />

      <div className={cx('uncovered-tests-checkbox')}>
        <Field
          name={LAUNCH_FORM_FIELD_NAMES.UNCOVERED_TESTS_ONLY}
          component={CheckboxField}
          label={formatMessage(messages.addOnlyUncoveredTestCases)}
        />
      </div>

      {isExistingMode ? (
        <ExistingLaunchFields onLaunchSelect={onLaunchSelect} />
      ) : (
        <NewLaunchFields
          testPlanName={testPlanName}
          isTestPlanFieldDisabled={Boolean(isTestPlanFieldDisabled)}
          onTestPlanChange={onTestPlanChange}
        />
      )}
    </>
  );
};
