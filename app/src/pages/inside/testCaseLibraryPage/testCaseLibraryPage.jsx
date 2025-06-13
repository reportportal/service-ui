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
import classNames from 'classnames/bind';

import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { BreadcrumbsTreeIcon } from '@reportportal/ui-kit';

import { AllTestCasesPage } from './allTestCasesPage';
import { EmptyState } from './emptyState';
import { useTestCases } from './hooks/useTestCases';

import styles from './testCaseLibraryPage.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

export const TestCaseLibraryPage = () => {
  const { formatMessage } = useIntl();
  const {
    filteredTestCases,
    loading,
    hasTestCases,
    searchValue,
    setSearchValue,
    deleteTestCase,
    duplicateTestCase,
  } = useTestCases();

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('test-case-library-page')}>
          <div className={cx('test-case-library-page__header')}>
            <div className={cx('test-case-library-page__breadcrumb')}>
              <div className={cx('test-case-library-page__breadcrumb-icon')}>
                <BreadcrumbsTreeIcon />
              </div>
              <div className={cx('test-case-library-page__breadcrumb-name')}>Adi_02</div>
            </div>
            <Header title={formatMessage(messages.testCaseLibraryHeader)} />
          </div>
          <div className={cx(!hasTestCases && 'test-case-library-page__content')}>
            {hasTestCases ? (
              <AllTestCasesPage
                testCases={filteredTestCases}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                deleteTestCase={deleteTestCase}
                duplicateTestCase={duplicateTestCase}
                loading={loading}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
