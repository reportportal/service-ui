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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';

import {
  AddToLaunchPlace,
  SIDE_PANEL_QUICK_ACTION_ELEMENT_NAME,
  TEST_CASE_LIBRARY_EVENTS,
  TEST_CASE_PLACE,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { isDraftGateActive, readyOnlyMessages } from 'pages/inside/aiFactory/readyOnlyGate';
import type { AiLifecycle } from 'types/aiFactory';
import type { ManualScenario } from 'types/testCase';

import { useAddToLaunchModal } from '../addToLaunchModal';
import { isManualScenarioEmpty } from './isManualScenarioEmpty';

export interface AddToLaunchAction {
  label: string;
  isDisabled: boolean;
  disabledHint?: string;
  onClick: () => void;
}

interface UseAddToLaunchActionParams {
  testCaseId: number;
  manualScenario?: ManualScenario;
  lifecycle?: AiLifecycle;
  place: AddToLaunchPlace;
}

export const useAddToLaunchAction = ({
  testCaseId,
  manualScenario,
  lifecycle,
  place,
}: UseAddToLaunchActionParams): AddToLaunchAction => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { openModal } = useAddToLaunchModal();
  const isAiFactoryEnabled = useAiFactoryEnabled();
  const isScenarioEmpty = useMemo(() => isManualScenarioEmpty(manualScenario), [manualScenario]);
  const isDraft = isDraftGateActive(isAiFactoryEnabled, lifecycle);
  const isDisabled = isScenarioEmpty || isDraft;

  const onClick = () => {
    if (isDisabled) {
      return;
    }
    if (place === TEST_CASE_PLACE.SIDE_PANEL) {
      trackEvent(
        TEST_CASE_LIBRARY_EVENTS.clickSidePanelQuickAction(
          SIDE_PANEL_QUICK_ACTION_ELEMENT_NAME.ADD_TO_LAUNCH,
          testCaseId.toString(),
        ),
      );
    }
    openModal({
      selectedTestCaseIds: [testCaseId],
      isUncoveredTestsCheckboxAvailable: false,
      place,
    });
  };

  const disabledHint = isDisabled
    ? formatMessage(
        isDraft ? readyOnlyMessages.launchDraftHint : COMMON_LOCALE_KEYS.ADD_TO_LAUNCH_TOOLTIP_TEXT,
      )
    : undefined;

  return {
    label: formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH),
    isDisabled,
    disabledHint,
    onClick,
  };
};
