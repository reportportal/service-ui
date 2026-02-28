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

import { useIntl } from 'react-intl';

import { TransformedFolder } from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PopoverItem } from 'pages/common/popoverControl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { useDeleteFolderModal } from '../../testCaseFolders/modals/deleteFolderModal';
import { useRenameFolderModal } from '../../testCaseFolders/modals/renameFolderModal';
import { useDuplicateFolderModal } from '../../testCaseFolders/modals/duplicateFolderModal';
import { useMoveFolderModal } from '../../testCaseFolders/modals/moveFolderModal';
import { useImportTestCaseModal } from '../../importTestCaseModal';
import { useCreateSubfolderModal } from '../../testCaseFolders/modals/createSubfolderModal';
import { commonMessages } from '../../commonMessages';

interface UseTestCaseFolderMenuProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  setAllTestCases: () => void;
}

export const useTestCaseFolderMenu = ({
  folder,
  activeFolder,
  setAllTestCases,
}: UseTestCaseFolderMenuProps) => {
  const { formatMessage } = useIntl();
  const { name: folderName } = folder;
  const { openModal: openDeleteModal } = useDeleteFolderModal();
  const { openModal: openRenameModal } = useRenameFolderModal();
  const { openModal: openDuplicateModal } = useDuplicateFolderModal();
  const { openModal: openMoveModal } = useMoveFolderModal();
  const { openModal: openImportTestCaseModal } = useImportTestCaseModal();
  const { openModal: openCreateSubfolderModal } = useCreateSubfolderModal();

  const { canManageTestCases } = useUserPermissions();

  const handleDeleteFolder = () => {
    openDeleteModal({
      folder,
      activeFolderId: activeFolder,
      setAllTestCases,
    });
  };

  const handleRenameFolder = () => openRenameModal({ folder });

  const handleDuplicateFolder = () => openDuplicateModal({ folder });

  const handleMoveFolder = () => openMoveModal({ folder });

  const handleImportTestCase = () =>
    openImportTestCaseModal({ folderName, importTarget: 'existing' });

  const handleCreateSubfolder = () => openCreateSubfolderModal({ folder });

  const testCaseFolderTooltipItems: PopoverItem[] = canManageTestCases ? [
    {
      label: formatMessage(commonMessages.createSubfolder),
      onClick: handleCreateSubfolder,
    },
    {
      label: formatMessage(COMMON_LOCALE_KEYS.RENAME),
      onClick: handleRenameFolder,
    },
    {
      label: formatMessage(commonMessages.moveFolderTo),
      variant: 'text' as const,
      onClick: handleMoveFolder,
    },
    {
      label: formatMessage(commonMessages.duplicateFolder),
      variant: 'text' as const,
      onClick: handleDuplicateFolder,
    },
    {
      label: formatMessage(COMMON_LOCALE_KEYS.IMPORT),
      variant: 'text' as const,
      onClick: handleImportTestCase,
    },
    {
      label: formatMessage(commonMessages.deleteFolder),
      variant: 'destructive' as const,
      onClick: handleDeleteFolder,
    },
  ] : [];

  return {
    testCaseFolderTooltipItems,
  };
};
