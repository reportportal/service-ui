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

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TestCaseMenuAction } from 'pages/inside/common/testCaseList/types';
import { useTestCaseTooltipItems } from 'pages/inside/testCaseLibraryPage/allTestCasesPage/useTestCaseTooltipItems';
import { useTestPlanTooltipItems } from 'pages/inside/testPlansPage/testPlanDetailsPage/testPlanFolders/allTestCasesPage/useTestPlanTooltipItems';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { useIntl } from 'react-intl';
import { messages } from '../messages';

interface UseTooltipItemsProps {
  instanceKey: TMS_INSTANCE_KEY;
  testCase: ExtendedTestCase;
}

export const useTooltipItems = ({ instanceKey, testCase }: UseTooltipItemsProps) => {
  const { formatMessage } = useIntl();
  const testPlanTooltipItems = useTestPlanTooltipItems();
  const testCaseTooltipItems = useTestCaseTooltipItems({ testCase });


  const tooltipItemsByInstance: Record<TMS_INSTANCE_KEY, typeof testPlanTooltipItems> = {
    [TMS_INSTANCE_KEY.TEST_PLAN]: [
      {
        label: formatMessage(messages.removeTestCase),
        variant: 'danger',
        onClick: () => {},
      },
    ],
    [TMS_INSTANCE_KEY.TEST_CASE]: testCaseTooltipItems,
    [TMS_INSTANCE_KEY.MANUAL_LAUNCH]: testCaseTooltipItems,
  };

  return tooltipItemsByInstance[instanceKey];
};
