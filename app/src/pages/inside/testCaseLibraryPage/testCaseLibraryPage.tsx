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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { isEmpty } from 'es-toolkit/compat';
import { BreadcrumbsTreeIcon, BubblesLoader, Button } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { ProjectDetails } from 'pages/organization/constants';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import ImportIcon from 'common/img/import-thin-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { projectNameSelector } from 'controllers/project';
import {
  PROJECT_DASHBOARD_PAGE,
  urlFolderIdSelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { areFoldersLoadingSelector, foldersSelector } from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';

import { TestCaseFolders } from './testCaseFolders';
import { MainPageEmptyState } from './emptyState/mainPage';
import { commonMessages } from './commonMessages';
import { useCreateTestCaseModal } from './createTestCaseModal';
import { useImportTestCaseModal } from './importTestCaseModal';

import styles from './testCaseLibraryPage.scss';

const cx = createClassnames(styles);

export const TestCaseLibraryPage = () => {
  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector);
  const folders = useSelector(foldersSelector);
  const folderId = useSelector(urlFolderIdSelector);
  const areFoldersLoading = useSelector(areFoldersLoadingSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const { openModal: openCreateTestCaseModal } = useCreateTestCaseModal();
  const { openModal: openImportFolderModal } = useImportTestCaseModal();

  const { canManageTestCases } = useUserPermissions();
  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const hasFolders = !isEmpty(folders);

  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];

  const currentFolderName = useMemo(
    () => folders.find(({ id }) => id === Number(folderId))?.name,
    [folderId, folders],
  );

  const renderContent = () => {
    if (areFoldersLoading) {
      return <BubblesLoader />;
    }

    if (hasFolders) {
      return <TestCaseFolders />;
    }

    return <MainPageEmptyState />;
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('test-case-library-page')}>
          <div className={cx('test-case-library-page__header')}>
            <div className={cx('test-case-library-page__breadcrumb')}>
              <BreadcrumbsTreeIcon />
              <Breadcrumbs descriptors={breadcrumbDescriptors} />
            </div>
            <div className={cx('test-case-library-page__title')}>
              {formatMessage(commonMessages.testCaseLibraryHeader)}
            </div>
            {hasFolders && (
              <div className={cx('test-case-library-page__actions')}>
                {canManageTestCases && (
                  <>
                    <Button
                      variant="text"
                      icon={Parser(ImportIcon as unknown as string)}
                      data-automation-id="importTestCase"
                      adjustWidthOn="content"
                      onClick={() => openImportFolderModal({ folderName: currentFolderName ?? '' })}
                    >
                      {formatMessage(COMMON_LOCALE_KEYS.IMPORT)}
                    </Button>
                    <Button
                      variant="ghost"
                      data-automation-id="createTestCase"
                      onClick={() => openCreateTestCaseModal()}
                    >
                      {formatMessage(commonMessages.createTestCase)}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          <div
            className={cx('test-case-library-page__content', {
              'test-case-library-page__content--no-padding': hasFolders,
            })}
          >
            {renderContent()}
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
