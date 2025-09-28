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

import { compact } from 'es-toolkit/compat';
import { useIntl } from 'react-intl';

import { TransformedFolder } from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PopoverItem } from 'pages/common/popoverControl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { useDeleteFolderModal } from '../../testCaseFolders/deleteFolderModal';
import { useRenameFolderModal } from '../../testCaseFolders/renameFolderModal';
import { useDuplicateFolderModal } from '../../testCaseFolders/duplicateFolderModal';
import { commonMessages } from '../../commonMessages';

interface useFolderTooltipProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  setAllTestCases: () => void;
}

export const useTestCaseFolderMenu = ({
  folder,
  activeFolder,
  setAllTestCases,
}: useFolderTooltipProps) => {
  const { formatMessage } = useIntl();
  const { openModal: openDeleteModal } = useDeleteFolderModal();
  const { openModal: openRenameModal } = useRenameFolderModal();
  const { openModal: openDuplicateModal } = useDuplicateFolderModal();

  const { canDeleteTestCaseFolder, canDuplicateTestCaseFolder, canRenameTestCaseFolder } =
    useUserPermissions();

  const handleDeleteFolder = () => {
    openDeleteModal({
      folderId: folder.id,
      folderName: folder.name,
      activeFolderId: activeFolder,
      setAllTestCases,
    });
  };

  const handleRenameFolder = () => {
    openRenameModal({
      folderId: folder.id,
      folderName: folder.name,
    });
  };

  const handleDuplicateFolder = () => {
    openDuplicateModal({
      folderId: folder.id,
      folderName: folder.name,
      parentFolderId: folder.parentFolderId,
    });
  };

  const testCaseFolderTooltipItems: PopoverItem[] = compact([
    canRenameTestCaseFolder && {
      label: formatMessage(COMMON_LOCALE_KEYS.RENAME),
      onClick: handleRenameFolder,
    },
    canDuplicateTestCaseFolder && {
      label: formatMessage(commonMessages.duplicateFolder),
      variant: 'text' as const,
      onClick: handleDuplicateFolder,
    },
    canDeleteTestCaseFolder && {
      label: formatMessage(commonMessages.deleteFolder),
      variant: 'destructive' as const,
      onClick: handleDeleteFolder,
    },
  ]);

  return {
    testCaseFolderTooltipItems,
  };
};
