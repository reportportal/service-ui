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
import Parser from 'html-react-parser';
import { BreadcrumbsTreeIcon, Button, Toggle } from '@reportportal/ui-kit';

import { Header } from 'pages/inside/projectSettingsPageContainer/header';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import ExportIcon from 'common/img/export-thin-inline.svg';
import ImportIcon from 'common/img/import-thin-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { MainPageEmptyState } from './emptyState/mainPage';
import { ExpandedOptions } from './expandedOptions';
import { commonMessages } from './commonMessages';

import styles from './testCaseLibraryPage.scss';

const cx = classNames.bind(styles);

export const TestCaseLibraryPage = () => {
  const [isEmptyState, setEmptyState] = React.useState(true);
  const { formatMessage } = useIntl();
  // Temporary toggle for BA and designer review
  const toggleEmptyState = () => {
    setEmptyState((prevState) => !prevState);
  };

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
            <Header title={formatMessage(commonMessages.testCaseLibraryHeader)}>
              <Toggle
                className={cx('test-case-library-page__toggle')}
                value={isEmptyState}
                data-automation-id=""
                onChange={toggleEmptyState}
              >
                toggle content
              </Toggle>
              {isEmptyState || (
                <div className={cx('test-case-library-page__actions')}>
                  <Button
                    variant="text"
                    icon={Parser(ExportIcon)}
                    data-automation-id="exportTestCase"
                  >
                    {formatMessage(COMMON_LOCALE_KEYS.EXPORT)}
                  </Button>
                  <Button
                    variant="text"
                    icon={Parser(ImportIcon)}
                    data-automation-id="importTestCase"
                  >
                    {formatMessage(COMMON_LOCALE_KEYS.IMPORT)}
                  </Button>
                  <Button variant="ghost" data-automation-id="createTestCase">
                    {formatMessage(commonMessages.createTestCase)}
                  </Button>
                </div>
              )}
            </Header>
          </div>
          <div
            className={cx('test-case-library-page__content', {
              'test-case-library-page__content--no-padding': !isEmptyState,
            })}
          >
            {isEmptyState ? <MainPageEmptyState /> : <ExpandedOptions />}
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
