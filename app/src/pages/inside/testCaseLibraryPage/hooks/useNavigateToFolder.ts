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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  getTestCaseByFolderIdAction,
  expandFoldersToLevelAction,
} from 'controllers/testCase/actionCreators';
import { testCasesPageSelector, foldersSelector } from 'controllers/testCase';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlOrganizationAndProjectSelector,
  urlFolderIdSelector,
} from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';

import { getTestCaseRequestParams } from '../utils';
import { getParentIdToExpand } from '../utils/getParentIdToExpand';
import { NewFolderData } from '../utils/getFolderFromFormValues';

interface NavigateToFolderParams {
  folderId: number;
  parentIdToExpand?: number | null;
}

export const useNavigateToFolder = () => {
  const dispatch = useDispatch();
  const urlFolderId = useSelector(urlFolderIdSelector);
  const testCasesPageData = useSelector(testCasesPageSelector);
  const folders = useSelector(foldersSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;

  const expandFoldersToLevel = useCallback(
    (folderId: number) => {
      dispatch(expandFoldersToLevelAction({ folderId, folders }));
    },
    [dispatch, folders],
  );

  const navigateToFolder = useCallback(
    ({ folderId, parentIdToExpand }: NavigateToFolderParams) => {
      const isCurrentlyViewingFolder = Number(urlFolderId) === folderId;

      if (isCurrentlyViewingFolder) {
        const paginationParams = getTestCaseRequestParams(testCasesPageData);

        dispatch(
          getTestCaseByFolderIdAction({
            folderId,
            ...paginationParams,
          }),
        );
      } else {
        dispatch({
          type: TEST_CASE_LIBRARY_PAGE,
          payload: {
            testCasePageRoute: `folder/${folderId}`,
            organizationSlug,
            projectSlug,
          },
        });
      }

      if (parentIdToExpand) {
        expandFoldersToLevel(parentIdToExpand);
      }
    },
    [urlFolderId, testCasesPageData, dispatch, organizationSlug, projectSlug, expandFoldersToLevel],
  );

  const navigateToFolderAfterAction = useCallback(
    ({
      targetFolderId,
      newFolderDetails,
    }: {
      targetFolderId: number;
      newFolderDetails?: NewFolderData;
    }) => {
      const parentIdToExpand = getParentIdToExpand({
        folders,
        targetFolderId,
        newFolderDetails,
      });

      navigateToFolder({
        folderId: targetFolderId,
        parentIdToExpand: parentIdToExpand ?? undefined,
      });
    },
    [folders, navigateToFolder],
  );

  return {
    navigateToFolder,
    navigateToFolderAfterAction,
    expandFoldersToLevel,
  };
};
