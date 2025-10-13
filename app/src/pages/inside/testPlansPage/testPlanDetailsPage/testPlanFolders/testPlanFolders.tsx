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

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import {
  testPlanTransformedFoldersSelector,
  testPlanTestCasesSelector,
} from 'controllers/testPlan';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';

import { ExpandedOptions } from '../../../common/expandedOptions';
import { AllTestCasesPage } from './allTestCasesPage';

export const TestPlanFolders = () => {
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const folders = useSelector(testPlanTransformedFoldersSelector);
  const testCases = useSelector(testPlanTestCasesSelector);

  useEffect(() => {
    setActiveFolder(null);
  }, []);

  const setAllTestCases = () => {
    setActiveFolder(null);
  };

  const handleFolderClick = (id: number) => {
    setActiveFolder(id);
  };

  return (
    <ExpandedOptions
      activeFolder={activeFolder}
      folders={folders}
      onFolderClick={handleFolderClick}
      setAllTestCases={setAllTestCases}
    >
      <AllTestCasesPage
        testCases={testCases}
        searchValue=""
        loading={false}
        instanceKey={INSTANCE_KEYS.TEST_PLAN}
      />
    </ExpandedOptions>
  );
};
