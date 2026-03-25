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

import { useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  manualLaunchFoldersSelector,
  manualLaunchTestCaseExecutionsSelector,
  manualLaunchTestCaseExecutionsPageSelector,
  isLoadingManualLaunchFoldersSelector,
  isLoadingManualLaunchTestCaseExecutionsSelector,
  urlManualLaunchFolderIdSelector,
  expandManualLaunchFoldersToLevelAction,
} from 'controllers/manualLaunch';
import { MANUAL_LAUNCH_DETAILS_PAGE } from 'controllers/pages';
import { useManualLaunchId, useProjectDetails } from 'hooks/useTypedSelector';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { transformFoldersToDisplay, filterEmptyFolders } from 'common/utils/folderUtils';
import { ExpandedOptions } from '../../../common/expandedOptions';
import { ManualLaunchExecutions } from '../manualLaunchExecutions';

export const ManualLaunchFolders = () => {
  const dispatch = useDispatch();
  const launchId = useManualLaunchId();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const folders = useSelector(manualLaunchFoldersSelector);
  const executions = useSelector(manualLaunchTestCaseExecutionsSelector);
  const pageInfo = useSelector(manualLaunchTestCaseExecutionsPageSelector);
  const isLoadingFolders = useSelector(isLoadingManualLaunchFoldersSelector);
  const isLoadingExecutions = useSelector(isLoadingManualLaunchTestCaseExecutionsSelector);

  const urlFolderId = useSelector(urlManualLaunchFolderIdSelector);
  const urlFolderIdNumber = urlFolderId ? Number(urlFolderId) : null;

  const transformedFolders = useMemo(
    () => filterEmptyFolders(transformFoldersToDisplay(folders)),
    [folders],
  );

  useEffect(() => {
    if (urlFolderIdNumber && folders.length > 0) {
      dispatch(
        expandManualLaunchFoldersToLevelAction({
          folderId: urlFolderIdNumber,
          folders,
        }),
      );
    }
  }, [urlFolderIdNumber, folders, dispatch]);

  const navigateToFolder = useCallback(
    (folderId?: number) => {
      dispatch({
        type: MANUAL_LAUNCH_DETAILS_PAGE,
        payload: {
          organizationSlug,
          projectSlug,
          launchId,
          ...(folderId && { manualLaunchPageRoute: `folder/${folderId}` }),
        },
      });
    },
    [dispatch, organizationSlug, projectSlug, launchId],
  );

  const handleFolderClick = useCallback(
    (folderId: number) => {
      navigateToFolder(folderId);
    },
    [navigateToFolder],
  );

  const handleAllExecutionsClick = useCallback(() => {
    navigateToFolder();
  }, [navigateToFolder]);

  return (
    <ExpandedOptions
      activeFolderId={urlFolderIdNumber}
      folders={transformedFolders}
      instanceKey={TMS_INSTANCE_KEY.MANUAL_LAUNCH}
      setAllTestCases={handleAllExecutionsClick}
      onFolderClick={handleFolderClick}
    >
      <ManualLaunchExecutions
        executions={executions}
        pageInfo={pageInfo}
        isLoading={isLoadingExecutions || isLoadingFolders}
      />
    </ExpandedOptions>
  );
};
