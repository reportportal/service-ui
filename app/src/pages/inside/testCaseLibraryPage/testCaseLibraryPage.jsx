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

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';

import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { mockTestCases } from 'components/testCaseList';
import { BreadcrumbsTreeIcon } from '@reportportal/ui-kit';

import { TestCaseListWrapper } from './testCaseListWrapper';
import { EmptyState } from './emptyState';

import styles from './testCaseLibraryPage.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

export const TestCaseLibraryPage = () => {
  const { formatMessage } = useIntl();
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const loadTestCases = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, use mock data
      // In real implementation, you would fetch from API
      setTestCases(mockTestCases);
      setLoading(false);
    };

    loadTestCases();
  }, []);

  const hasTestCases = testCases && testCases.length > 0;

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
          <div className={cx('test-case-library-page__content')}>
            {hasTestCases ? (
              <TestCaseListWrapper
                testCases={testCases}
                setTestCases={setTestCases}
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
