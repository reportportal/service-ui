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
import { compact } from 'es-toolkit/compat';

import { NumerableBlock } from 'pages/common/numerableBlock';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { referenceDictionary } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useCreateFolderModal } from 'pages/inside/testCaseLibraryPage/testCaseFolders/modals/createFolderModal';

import { messages } from '../messages';
import { commonMessages } from '../../commonMessages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useCreateTestCaseModal } from '../../createTestCaseModal';
import { useImportTestCaseModal } from '../../importTestCaseModal';

export const MainPageEmptyState = () => {
  const { formatMessage } = useIntl();
  const { canManageTestCases, canManageTestCaseFolders } = useUserPermissions();
  const { openModal: openCreateTestCaseModal } = useCreateTestCaseModal();
  const { openModal: openImportTestCaseModal } = useImportTestCaseModal();
  const { openModal: openCreateFolderModal } = useCreateFolderModal();

  const benefits = [messages.createFolder, messages.addTestCases, messages.tagTestCases].map(
    (translation) => Parser(formatMessage(translation, {}, { ignoreTag: true })),
  );

  const buttons = compact([
    canManageTestCaseFolders && {
      name: formatMessage(commonMessages.createFolder),
      dataAutomationId: 'createFolderButton',
      isCompact: true,
      handleButton: openCreateFolderModal,
    },
    canManageTestCases && {
      name: formatMessage(commonMessages.createTestCase),
      dataAutomationId: 'createTestCaseButton',
      isCompact: true,
      variant: 'ghost',
      handleButton: openCreateTestCaseModal,
    },
    canManageTestCases && {
      name: formatMessage(COMMON_LOCALE_KEYS.IMPORT),
      dataAutomationId: 'importTestCaseButton',
      isCompact: false,
      variant: 'ghost',
      handleButton: openImportTestCaseModal,
    },
  ]);

  return (
    <>
      <EmptyStatePage
        title={formatMessage(messages.emptyPageTitle)}
        description={Parser(formatMessage(messages.emptyPageDescription))}
        imageType="docs"
        documentationLink={referenceDictionary.rpDoc}
        buttons={buttons}
      />
      <NumerableBlock
        items={benefits}
        title={formatMessage(messages.numerableBlockTitle)}
        fullWidth
      />
    </>
  );
};
