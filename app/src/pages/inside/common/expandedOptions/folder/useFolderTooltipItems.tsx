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

import { TransformedFolder } from 'controllers/testCase';
import { useTestCaseFolderMenu } from 'pages/inside/testCaseLibraryPage/testCaseFolders/shared/useTestCaseFolderMenu';

export enum INSTANCE_KEYS {
  TEST_CASE = 'testCase',
  TEST_PLAN = 'testPlan',
}

interface UseFolderTooltipProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  setAllTestCases: () => void;
  instanceKey?: INSTANCE_KEYS;
}

export const useFolderTooltipItems = (props: UseFolderTooltipProps) => {
  const { testCaseFolderTooltipItems } = useTestCaseFolderMenu(props);

  const tooltipItemsByInstance: Partial<Record<INSTANCE_KEYS, typeof testCaseFolderTooltipItems>> =
    {
      [INSTANCE_KEYS.TEST_CASE]: testCaseFolderTooltipItems,
    };

  return tooltipItemsByInstance[props.instanceKey];
};
