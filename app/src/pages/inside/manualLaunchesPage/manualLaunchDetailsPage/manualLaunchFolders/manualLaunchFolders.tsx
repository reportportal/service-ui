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
import { useSelector } from 'react-redux';

import {
  manualLaunchFoldersSelector,
  manualLaunchTestCaseExecutionsSelector,
  isLoadingManualLaunchFoldersSelector,
  isLoadingManualLaunchTestCaseExecutionsSelector,
} from 'controllers/manualLaunch';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { transformFoldersToDisplay } from 'common/utils/folderUtils';
import { ExpandedOptions } from '../../../common/expandedOptions';
import { ManualLaunchExecutions } from '../manualLaunchExecutions';

export const ManualLaunchFolders = () => {
  const folders = useSelector(manualLaunchFoldersSelector);
  const executions = useSelector(manualLaunchTestCaseExecutionsSelector);
  const isLoadingFolders = useSelector(isLoadingManualLaunchFoldersSelector);
  const isLoadingExecutions = useSelector(isLoadingManualLaunchTestCaseExecutionsSelector);

  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);

  const transformedFolders = useMemo(() => transformFoldersToDisplay(folders), [folders]);

  const handleFolderClick = useCallback((folderId: number) => {
    setActiveFolderId(folderId);
    // TODO: Fetch executions for specific folder from backend
  }, []);

  const handleAllExecutionsClick = useCallback(() => {
    setActiveFolderId(null);
  }, []);

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
        isLoading={isLoadingExecutions || isLoadingFolders}
      />
    </ExpandedOptions>
  );
};
