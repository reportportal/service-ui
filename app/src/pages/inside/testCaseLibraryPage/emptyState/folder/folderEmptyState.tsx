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
import { useTracking } from 'react-tracking';

import { TEST_CASE_LIBRARY_EVENTS } from 'analyticsEvents/testCaseLibraryPageEvents';
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

const cx = createClassnames(styles);

interface FolderEmptyStateProps {
  folderTitle: string;
}

export const FolderEmptyState = ({ folderTitle }: FolderEmptyStateProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { canManageTestCases } = useUserPermissions();
  const { openModal: openCreateTestCaseModal } = useCreateTestCaseModal();
  const { openModal: openImportTestCaseModal } = useImportTestCaseModal();

  const handleCreateTestCase = () => {
    trackEvent(TEST_CASE_LIBRARY_EVENTS.CLICK_CREATE_TEST_CASE);
    openCreateTestCaseModal();
  };

  const handleImportTestCase = () => {
    trackEvent(TEST_CASE_LIBRARY_EVENTS.CLICK_IMPORT_TEST_CASES);
    openImportTestCaseModal();
  };

  const buttons: ActionButton[] = canManageTestCases ? [
    {
      name: formatMessage(commonMessages.createTestCase),
      dataAutomationId: 'createTestCaseButton',
      icon: PlusIconInline,
      isCompact: true,
      handleButton: handleCreateTestCase,
    },
    {
      name: formatMessage(commonMessages.importTestCases),
      dataAutomationId: 'importTestCaseButton',
      variant: 'ghost',
      icon: ImportIcon,
      isCompact: true,
      handleButton: handleImportTestCase,
    }
  ] : [];

  return (
    <div className={cx('folder-empty-state')}>
      <div className={cx('folder-empty-state__title')}>{folderTitle}</div>
      <EmptyStatePage
        title={formatMessage(messages.emptyPageTitle)}
        description={formatMessage(messages.folderEmptyPageDescription)}
        imageType="docs"
        buttons={buttons}
      />
    </div>
  );
};
