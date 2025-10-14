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

import { useTestCaseTooltipItems } from 'pages/inside/testCaseLibraryPage/allTestCasesPage/useTestCaseTooltipItems';
import { useTestPlanTooltipItems } from 'pages/inside/testPlansPage/testPlanDetailsPage/testPlanFolders/allTestCasesPage/useTestPlanTooltipItems';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';

interface UseTooltipItemsProps {
  instanceKey: INSTANCE_KEYS;
  testCase?: ExtendedTestCase;
  onEdit?: (testCase: ExtendedTestCase) => void;
}

export const useTooltipItems = ({ instanceKey, testCase, onEdit }: UseTooltipItemsProps) => {
  const testPlanTooltipItems = useTestPlanTooltipItems();
  const testCaseTooltipItems = useTestCaseTooltipItems({ testCase, onEdit });

  const tooltipItemsByInstance: Record<INSTANCE_KEYS, typeof testPlanTooltipItems> = {
    [INSTANCE_KEYS.TEST_PLAN]: testPlanTooltipItems,
    [INSTANCE_KEYS.TEST_CASE]: testCaseTooltipItems,
  };

  return tooltipItemsByInstance[instanceKey];
};
