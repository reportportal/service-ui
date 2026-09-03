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

import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';

import {
  foldersSelector,
  transformedFoldersWithFullPathSelector,
  TransformedFolder,
} from 'controllers/testCase';
import { projectKeySelector } from 'controllers/project';
import {
  FOLDER_POPOVER_ELEMENT_NAME,
  type FolderPopoverElementName,
  TEST_CASE_LIBRARY_EVENTS,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useHasTestPlans } from 'hooks/useHasTestPlans';
import { PopoverItem } from 'pages/common/popoverControl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { getAllSubfolderIds } from 'common/utils/folderUtils';
import { fetchAllTestCases } from 'pages/inside/common/testLibrarySidePanel/utils';

import { useAddToLaunchModal } from '../../addToLaunchModal';
import { useAddTestCasesToTestPlanModal } from '../../addTestCasesToTestPlanModal/useAddTestCasesToTestPlanModal';
import { isManualScenarioEmpty } from '../../addToLaunchButton/isManualScenarioEmpty';
import { useDeleteFolderModal } from '../../testCaseFolders/modals/deleteFolderModal';
import { useRenameFolderModal } from '../../testCaseFolders/modals/renameFolderModal';
import { useDuplicateFolderModal } from '../../testCaseFolders/modals/duplicateFolderModal';
import { useMoveFolderModal } from '../../testCaseFolders/modals/moveFolderModal';
import { useCreateTestCaseModal } from '../../createTestCaseModal';
import { useCreateSubfolderModal } from '../../testCaseFolders/modals/createSubfolderModal';
import { commonMessages } from '../../commonMessages';

interface UseTestCaseFolderMenuProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  setAllTestCases: () => void;
  isMenuOpen?: boolean;
}

const getTotalFolderTestsCount = (folder: TransformedFolder): number => {
  return (
    folder.testsCount +
    folder.folders.reduce((sum, nestedFolder) => sum + getTotalFolderTestsCount(nestedFolder), 0)
  );
};

export const useTestCaseFolderMenu = ({
  folder,
  activeFolder,
  setAllTestCases,
  isMenuOpen = false,
}: UseTestCaseFolderMenuProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { openModal: openDeleteModal } = useDeleteFolderModal();
  const { openModal: openRenameModal } = useRenameFolderModal();
  const { openModal: openDuplicateModal } = useDuplicateFolderModal();
  const { openModal: openMoveModal } = useMoveFolderModal();
  const { openModal: openCreateTestCaseModal } = useCreateTestCaseModal();
  const { openModal: openAddToTestPlanModal } = useAddTestCasesToTestPlanModal();
  const { openModal: openAddToLaunchModal } = useAddToLaunchModal();
  const { openModal: openCreateSubfolderModal } = useCreateSubfolderModal();

  const foldersWithFullPath = useSelector(transformedFoldersWithFullPathSelector);
  const allFolders = useSelector(foldersSelector);
  const projectKey = useSelector(projectKeySelector);
  const totalFolderTestsCount = getTotalFolderTestsCount(folder);
  const isAddActionsDisabled = totalFolderTestsCount === 0;
  const { hasTestPlans, isCheckingTestPlansExistence } = useHasTestPlans();

  const [hasExecutableTestCases, setHasExecutableTestCases] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isMenuOpen || hasExecutableTestCases !== null || isAddActionsDisabled || !projectKey) {
      return;
    }

    let isCancelled = false;
    const folderIds = getAllSubfolderIds(folder.id, allFolders);

    fetchAllTestCases(projectKey, {
      'filter.in.testFolderId': folderIds.join(','),
      offset: 0,
      limit: 50,
    })
      .then((testCases) => {
        if (!isCancelled) {
          setHasExecutableTestCases(
            testCases.some((testCase) => !isManualScenarioEmpty(testCase.manualScenario)),
          );
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHasExecutableTestCases(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isMenuOpen, hasExecutableTestCases, isAddActionsDisabled, projectKey, folder.id, allFolders]);

  const isCheckingExecutableTestCases =
    isMenuOpen && !isAddActionsDisabled && hasExecutableTestCases === null;
  const isMenuContentLoading =
    isCheckingExecutableTestCases || (isMenuOpen && isCheckingTestPlansExistence);
  const isAddToLaunchDisabled = isAddActionsDisabled || hasExecutableTestCases === false;

  const getAddToTestPlanTooltip = () => {
    if (isAddActionsDisabled) {
      return formatMessage(commonMessages.noTestCasesAvailableToAddToTestPlan);
    }
    if (!hasTestPlans) {
      return formatMessage(commonMessages.noTestPlanCreated);
    }
    return undefined;
  };

  const getAddToLaunchTooltip = () => {
    if (isAddActionsDisabled) {
      return formatMessage(commonMessages.noTestCasesAvailableToAddToLaunch);
    }
    if (hasExecutableTestCases === false) {
      return formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH_TOOLTIP_TEXT);
    }
    return undefined;
  };

  const { canManageTestCases } = useUserPermissions();

  const trackFolderPopoverMenu = (elementName: FolderPopoverElementName) => {
    trackEvent(TEST_CASE_LIBRARY_EVENTS.chooseFolderPopoverMenu(elementName));
  };

  const handleDeleteFolder = () => {
    trackFolderPopoverMenu(FOLDER_POPOVER_ELEMENT_NAME.DELETE_FOLDER);
    openDeleteModal({
      folder,
      activeFolderId: activeFolder,
      setAllTestCases,
    });
  };

  const handleRenameFolder = () => {
    trackFolderPopoverMenu(FOLDER_POPOVER_ELEMENT_NAME.RENAME_FOLDER);
    openRenameModal({ folder });
  };

  const handleDuplicateFolder = () => {
    trackFolderPopoverMenu(FOLDER_POPOVER_ELEMENT_NAME.DUPLICATE_SUBFOLDER);
    openDuplicateModal({ folder });
  };

  const handleMoveFolder = () => {
    trackFolderPopoverMenu(FOLDER_POPOVER_ELEMENT_NAME.MOVE_FOLDER_TO);
    openMoveModal({ folder });
  };

  const handleCreateTestCase = () => {
    trackFolderPopoverMenu(FOLDER_POPOVER_ELEMENT_NAME.CREATE_TEST_CASE);
    const selectedFolder = foldersWithFullPath.find(({ id }) => id === folder.id);

    if (!selectedFolder) {
      return;
    }

    openCreateTestCaseModal({ folder: selectedFolder });
  };

  const handleAddToTestPlan = () => {
    trackFolderPopoverMenu(FOLDER_POPOVER_ELEMENT_NAME.ADD_TO_TEST_PLAN);
    openAddToTestPlanModal({
      folderId: folder.id,
      itemCount: totalFolderTestsCount,
    });
  };

  const handleAddToLaunch = () => {
    trackFolderPopoverMenu(FOLDER_POPOVER_ELEMENT_NAME.ADD_TO_LAUNCH);
    openAddToLaunchModal({
      folderId: folder.id,
      itemCount: totalFolderTestsCount,
      isUncoveredTestsCheckboxAvailable: false,
    });
  };

  const handleCreateSubfolder = () => {
    trackFolderPopoverMenu(FOLDER_POPOVER_ELEMENT_NAME.CREATE_SUBFOLDER);
    openCreateSubfolderModal({ folder });
  };

  const testCaseFolderTooltipItems: PopoverItem[][] = canManageTestCases
    ? [
        [
          {
            label: formatMessage(COMMON_LOCALE_KEYS.ADD_TO_TEST_PLAN),
            onClick: handleAddToTestPlan,
            disabled: isAddActionsDisabled || !hasTestPlans,
            tooltip: getAddToTestPlanTooltip(),
          },
          {
            label: formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH),
            onClick: handleAddToLaunch,
            disabled: isAddToLaunchDisabled,
            tooltip: getAddToLaunchTooltip(),
          },
        ],
        [
          {
            label: formatMessage(commonMessages.createSubfolder),
            onClick: handleCreateSubfolder,
          },
          {
            label: formatMessage(commonMessages.createTestCase),
            onClick: handleCreateTestCase,
          },
        ],
        [
          {
            label: formatMessage(COMMON_LOCALE_KEYS.RENAME),
            onClick: handleRenameFolder,
          },
          {
            label: formatMessage(commonMessages.moveFolderTo),
            onClick: handleMoveFolder,
          },
          {
            label: formatMessage(commonMessages.duplicateFolder),
            onClick: handleDuplicateFolder,
          },
          {
            label: formatMessage(commonMessages.deleteFolder),
            variant: 'destructive' as const,
            onClick: handleDeleteFolder,
          },
        ],
      ]
    : [];

  return {
    testCaseFolderTooltipItems,
    isMenuContentLoading,
  };
};
