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

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { BreadcrumbsTreeIcon, Button } from '@reportportal/ui-kit';

import { ProjectDetails } from 'pages/organization/constants';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import ImportIcon from 'common/img/import-thin-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { projectNameSelector } from 'controllers/project';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { foldersSelector, getFoldersAction } from 'controllers/testCase';

import { MainPageEmptyState } from './emptyState/mainPage';
import { ExpandedOptions } from './expandedOptions';
import { commonMessages } from './commonMessages';
import { useCreateTestCaseModal } from './createTestCaseModal';

import styles from './testCaseLibraryPage.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const TestCaseLibraryPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const folders = useSelector(foldersSelector);
  const projectName = useSelector(projectNameSelector) as string;
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];
  const isFolders = !!folders.length;
  const { openModal: openCreateTestCaseModal } = useCreateTestCaseModal();

  useEffect(() => {
    dispatch(getFoldersAction());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            {!isFolders || (
              <div className={cx('test-case-library-page__actions')}>
                <Button
                  variant="text"
                  icon={<ImportIcon />}
                  data-automation-id="importTestCase"
                  adjustWidthOn="content"
                >
                  {formatMessage(COMMON_LOCALE_KEYS.IMPORT)}
                </Button>
                <Button
                  variant="ghost"
                  data-automation-id="createTestCase"
                  onClick={openCreateTestCaseModal}
                >
                  {formatMessage(commonMessages.createTestCase)}
                </Button>
              </div>
            )}
          </div>
          <div
            className={cx('test-case-library-page__content', {
              'test-case-library-page__content--no-padding': isFolders,
            })}
          >
            {isFolders ? <ExpandedOptions /> : <MainPageEmptyState />}
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
