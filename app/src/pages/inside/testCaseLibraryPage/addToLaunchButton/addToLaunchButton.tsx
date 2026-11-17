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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Button, Tooltip } from '@reportportal/ui-kit';

import {
  AddToLaunchPlace,
  SIDE_PANEL_QUICK_ACTION_ELEMENT_NAME,
  TEST_CASE_LIBRARY_EVENTS,
  TEST_CASE_PLACE,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { ManualScenario } from 'types/testCase';
import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useAddToLaunchModal } from '../addToLaunchModal';
import { isManualScenarioEmpty } from './isManualScenarioEmpty';

import styles from './addToLaunchButton.scss';

const cx = createClassnames(styles);

interface AddToLaunchButtonProps {
  testCaseId: number;
  manualScenario?: ManualScenario;
  place: AddToLaunchPlace;
}

export const AddToLaunchButton = ({
  testCaseId,
  manualScenario,
  place,
}: AddToLaunchButtonProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { openModal: openAddToLaunchModal } = useAddToLaunchModal();

  const isDisabled = useMemo(() => isManualScenarioEmpty(manualScenario), [manualScenario]);

  const handleAddToLaunchClick = () => {
    if (place === TEST_CASE_PLACE.SIDE_PANEL) {
      trackEvent(
        TEST_CASE_LIBRARY_EVENTS.clickSidePanelQuickAction(
          SIDE_PANEL_QUICK_ACTION_ELEMENT_NAME.ADD_TO_LAUNCH,
          testCaseId?.toString(),
        ),
      );
    }

    openAddToLaunchModal({
      selectedTestCaseIds: [testCaseId],
      isUncoveredTestsCheckboxAvailable: false,
      place,
    });
  };

  const buttonComponent = (
    <Button
      variant="ghost"
      onClick={handleAddToLaunchClick}
      data-automation-id="test-case-add-to-launch"
      disabled={isDisabled}
    >
      {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH)}
    </Button>
  );

  return isDisabled ? (
    <Tooltip
      placement="bottom"
      content={formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH_TOOLTIP_TEXT)}
      wrapperClassName={cx('tooltip-wrapper')}
      width={205}
    >
      {buttonComponent}
    </Tooltip>
  ) : (
    buttonComponent
  );
};
