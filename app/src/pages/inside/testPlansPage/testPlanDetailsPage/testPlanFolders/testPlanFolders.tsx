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

import { useSelector, useDispatch } from 'react-redux';

import { expandTestPlanFoldersToLevelAction, testPlanTestCasesSelector } from 'controllers/testPlan';
import { PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { useTestPlanActiveFolders } from 'pages/inside/testCaseLibraryPage/hooks/useTestPlanActiveFolders';

import { ExpandedOptions } from '../../../common/expandedOptions';
import { AllTestCasesPage } from './allTestCasesPage';
import { useEffect } from 'react';

interface TestPlanFoldersProps {
  isLoading?: boolean;
}

export const TestPlanFolders = ({ isLoading = false }: TestPlanFoldersProps) => {
  const dispatch = useDispatch();
  const testCases = useSelector(testPlanTestCasesSelector);
  const { activeFolderId, activeFolder, payload, folders, transformedFolders } = useTestPlanActiveFolders();

  useEffect(() => {
    dispatch(expandTestPlanFoldersToLevelAction({ folderId: activeFolderId, folders }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])



  const setAllTestCases = () => {
    if (activeFolderId) {
      dispatch({
        type: PROJECT_TEST_PLAN_DETAILS_PAGE,
        payload: {
          ...payload,
          testPlanRoute: undefined,
        },
      });
    }
  };

  const handleFolderClick = (id: number) => {
    if (id !== activeFolderId) {
      dispatch({
        type: PROJECT_TEST_PLAN_DETAILS_PAGE,
        payload: {
          ...payload,
          testPlanRoute: `folder/${id}`,
        },
      });
    }
  };

  return (
    <ExpandedOptions
      activeFolderId={activeFolderId}
      folders={transformedFolders}
      instanceKey={TMS_INSTANCE_KEY.TEST_PLAN}
      onFolderClick={handleFolderClick}
      setAllTestCases={setAllTestCases}
    >
      <AllTestCasesPage
        testCases={testCases}
        loading={isLoading}
        instanceKey={TMS_INSTANCE_KEY.TEST_PLAN}
        folderName={activeFolder?.name}
      />
    </ExpandedOptions>
  );
};
