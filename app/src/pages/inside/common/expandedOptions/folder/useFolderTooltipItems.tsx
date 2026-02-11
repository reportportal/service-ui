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
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';

interface UseFolderTooltipProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  setAllTestCases: () => void;
  instanceKey?: TMS_INSTANCE_KEY;
}

export const useFolderTooltipItems = (props: UseFolderTooltipProps) => {
  const { testCaseFolderTooltipItems } = useTestCaseFolderMenu(props);

  const tooltipItemsByInstance: Partial<
    Record<TMS_INSTANCE_KEY, typeof testCaseFolderTooltipItems>
  > = {
    [TMS_INSTANCE_KEY.TEST_CASE]: testCaseFolderTooltipItems,
  };

  return tooltipItemsByInstance[props.instanceKey];
};
