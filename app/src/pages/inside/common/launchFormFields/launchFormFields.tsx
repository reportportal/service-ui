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
import { MODAL_POPUP_Z_INDEX } from 'common/constants/zIndex';
import { ButtonSwitcher } from 'pages/inside/common/buttonSwitcher';
import { ConditionalTooltip } from 'components/main/conditionalTooltip';
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
  areAllTestCasesCovered = false,
  hideTestPlanField = false,
}: LaunchFormFieldsProps) => {
  const { formatMessage } = useIntl();

  const isExistingMode = activeMode === LaunchMode.EXISTING;
  const tooltipRoot = document.getElementById('tooltip-root');
  const allCoveredTooltipContent = areAllTestCasesCovered
    ? formatMessage(messages.allTestCasesAlreadyCovered)
    : null;

  const handleModeChange = (mode: string) => {
    if (onModeChange) {
      onModeChange(mode as LaunchMode);
    }
  };

  const renderUncoveredTestsCheckbox = useCallback(
    ({ input }: WrappedFieldProps) => (
      <ConditionalTooltip
        content={allCoveredTooltipContent}
        placement="top"
        wrapperClassName={cx('checkbox-tooltip-wrapper')}
        zIndex={MODAL_POPUP_Z_INDEX}
        portalRoot={tooltipRoot}
      >
        <Checkbox
          value={areAllTestCasesCovered ? false : Boolean(input.value)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => input.onChange(e.target.checked)}
          className={cx('checkbox')}
          disabled={areAllTestCasesCovered}
        >
          {formatMessage(messages.addOnlyUncoveredTestCases)}
        </Checkbox>
      </ConditionalTooltip>
    ),
    [allCoveredTooltipContent, areAllTestCasesCovered, formatMessage, tooltipRoot],
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
