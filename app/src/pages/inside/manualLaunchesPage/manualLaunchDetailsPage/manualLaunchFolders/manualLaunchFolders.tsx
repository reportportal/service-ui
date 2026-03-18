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

import { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isNil } from 'es-toolkit/compat';

import {
  manualLaunchFoldersSelector,
  manualLaunchTestCaseExecutionsSelector,
  manualLaunchTestCaseExecutionsPageSelector,
  isLoadingManualLaunchFoldersSelector,
  isLoadingManualLaunchTestCaseExecutionsSelector,
  getManualLaunchTestCaseExecutionsAction,
  defaultManualLaunchesQueryParams,
} from 'controllers/manualLaunch';
import { useManualLaunchId } from 'hooks/useTypedSelector';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { transformFoldersToDisplay } from 'common/utils/folderUtils';
import { ExpandedOptions } from '../../../common/expandedOptions';
import { ManualLaunchExecutions } from '../manualLaunchExecutions';

export const ManualLaunchFolders = () => {
  const dispatch = useDispatch();
  const launchId = useManualLaunchId();
  const folders = useSelector(manualLaunchFoldersSelector);
  const executions = useSelector(manualLaunchTestCaseExecutionsSelector);
  const pageInfo = useSelector(manualLaunchTestCaseExecutionsPageSelector);
  const isLoadingFolders = useSelector(isLoadingManualLaunchFoldersSelector);
  const isLoadingExecutions = useSelector(isLoadingManualLaunchTestCaseExecutionsSelector);

  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);

  const transformedFolders = useMemo(() => transformFoldersToDisplay(folders), [folders]);

  const fetchExecutions = useCallback(
    (folderId?: number) => {
      if (!launchId) return;

      dispatch(
        getManualLaunchTestCaseExecutionsAction({
          launchId,
          ...(!isNil(folderId) && { folderId }),
          offset: defaultManualLaunchesQueryParams.offset,
          limit: defaultManualLaunchesQueryParams.limit,
        }),
      );
    },
    [dispatch, launchId],
  );

  const handleFolderClick = useCallback(
    (folderId: number) => {
      setActiveFolderId(folderId);
      fetchExecutions(folderId);
    },
    [fetchExecutions],
  );

  const handleAllExecutionsClick = useCallback(() => {
    setActiveFolderId(null);
    fetchExecutions();
  }, [fetchExecutions]);

  return (
    <ExpandedOptions
      activeFolderId={activeFolderId}
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
