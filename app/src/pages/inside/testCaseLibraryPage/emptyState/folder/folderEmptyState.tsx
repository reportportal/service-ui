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

import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import ImportIcon from 'common/img/import-thin-inline.svg';
import PlusIconInline from 'common/img/plus-button-inline.svg';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useCreateTestCaseModal } from 'pages/inside/testCaseLibraryPage/createTestCaseModal';
import { useImportTestCaseModal } from 'pages/inside/testCaseLibraryPage/importTestCaseModal';

import { messages } from '../messages';
import { commonMessages } from '../../commonMessages';
import { ActionButton } from '../../types';

import styles from './folderEmptyState.scss';
import { useImportTestCaseModal } from 'pages/inside/testCaseLibraryPage/importTestCaseModal';

const cx = createClassnames(styles);

interface FolderEmptyStateProps {
  folderTitle: string;
}

export const FolderEmptyState = ({ folderTitle }: FolderEmptyStateProps) => {
  const { formatMessage } = useIntl();
  const { canCreateTestCase, canImportTestCases } = useUserPermissions();
  const { openModal: openCreateTestCaseModal } = useCreateTestCaseModal();
  const { openModal: openImportTestCaseModal } = useImportTestCaseModal();

  const getAvailableButtons = () => {
    const buttons: ActionButton[] = [];

    if (canCreateTestCase) {
      buttons.push({
        name: formatMessage(commonMessages.createTestCase),
        dataAutomationId: 'createTestCaseButton',
        icon: PlusIconInline,
        isCompact: true,
        handleButton: openCreateTestCaseModal,
      });
    }

    if (canImportTestCases) {
      buttons.push({
        name: formatMessage(commonMessages.importTestCases),
        dataAutomationId: 'importTestCaseButton',
        variant: 'ghost',
        icon: ImportIcon,
        isCompact: true,
        handleButton: () => openImportTestCaseModal({ folderName: folderTitle ?? '' }),
      });
    }

    return buttons;
  };

  return (
    <div className={cx('folder-empty-state')}>
      <div className={cx('folder-empty-state__title')}>{folderTitle}</div>
      <EmptyStatePage
        title={formatMessage(messages.emptyPageTitle)}
        description={Parser(formatMessage(messages.folderEmptyPageDescription))}
        imageType="docs"
        buttons={getAvailableButtons()}
      />
    </div>
  );
};
