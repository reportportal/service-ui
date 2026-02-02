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
import { useManualLaunchFolderExpansion } from '../hooks';

export const ManualLaunchFolders = () => {
  const folders = useSelector(manualLaunchFoldersSelector);
  const executions = useSelector(manualLaunchTestCaseExecutionsSelector);
  const isLoadingFolders = useSelector(isLoadingManualLaunchFoldersSelector);
  const isLoadingExecutions = useSelector(isLoadingManualLaunchTestCaseExecutionsSelector);

  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const { expandedIds, onToggleFolder } = useManualLaunchFolderExpansion();

  const transformedFolders = useMemo(() => transformFoldersToDisplay(folders), [folders]);

  const filteredExecutions = useMemo(() => {
    return executions;
  }, [executions]);

  const handleFolderClick = useCallback(
    (folderId: number) => {
      setActiveFolderId(folderId);

      // TODO will be deleted in next task
      // Find clicked folder
      const folder = folders.find((f) => f.id === folderId);

      // Filter executions by folder's testItemId
      const folderExecutions = executions.filter(
        (execution) => execution.testFolder?.testItemId === folderId,
      );

      console.info('📁 Folder clicked:', {
        folderId,
        folderName: folder?.name,
        countOfTestCases: folder?.countOfTestCases,
        parentFolderId: folder?.parentFolderId,
        executionsCount: folderExecutions.length,
        executionNames: folderExecutions.map((e) => e.testCaseName),
      });
    },
    [folders, executions],
  );

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
      expandedIds={expandedIds}
      onToggleFolder={onToggleFolder}
    >
      <ManualLaunchExecutions
        executions={filteredExecutions}
        isLoading={isLoadingExecutions || isLoadingFolders}
      />
    </ExpandedOptions>
  );
};
