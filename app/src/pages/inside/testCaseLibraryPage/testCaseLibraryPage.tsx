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

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';

import { MainPageEmptyState } from './emptyState/mainPage';

import styles from './testCaseLibraryPage.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

export const TestCaseLibraryPage = () => {
  const { formatMessage } = useIntl();

  const breadcrumbDescriptors = [
    {
      id: 'project',
      title: 'Adi_02',
    },
  ];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('test-case-library-page')}>
          <div className={cx('test-case-library-page__header')}>
            <Breadcrumbs
              descriptors={breadcrumbDescriptors}
              className={cx('test-case-library-page__breadcrumb')}
              isRootElement
            />
            <div className={cx('test-case-library-page__title')}>
              {formatMessage(messages.testCaseLibraryHeader)}
            </div>
          </div>
          <div className={cx('test-case-library-page__content')}>
            <MainPageEmptyState />
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
