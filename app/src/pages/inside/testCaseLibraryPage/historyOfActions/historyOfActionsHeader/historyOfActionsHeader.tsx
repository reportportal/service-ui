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

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { BreadcrumbsTreeIcon, FieldText, SearchIcon } from '@reportportal/ui-kit';

import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { testCaseLibraryBreadcrumbSelector } from 'controllers/pages/selectors';

import { commonMessages } from '../../commonMessages';
import { messages } from '../messages';

import styles from './historyOfActionsHeader.scss';

const cx = classNames.bind(styles);

interface HistoryOfActionsHeaderProps {
  testCaseName: string;
  className?: string;
}

export const HistoryOfActionsHeader = ({
  testCaseName,
  className,
}: HistoryOfActionsHeaderProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { formatMessage } = useIntl();

  const breadcrumbsTitles = {
    mainTitle: formatMessage(commonMessages.testCaseLibraryBreadcrumb),
    testTitle: testCaseName,
    pageTitle: formatMessage(messages.historyOfActions),
  };

  const breadcrumbs = useSelector(testCaseLibraryBreadcrumbSelector(breadcrumbsTitles));

  return (
    <div className={cx('header', className)}>
      <div className={cx('header__breadcrumb')}>
        <BreadcrumbsTreeIcon />
        <Breadcrumbs descriptors={breadcrumbs} />
      </div>
      <div className={cx('header__title')}>{formatMessage(commonMessages.historyOfActions)}</div>
      <div className={cx('header__actions')}>
        <FieldText
          value={searchValue}
          onChange={({ target }) => setSearchValue(target.value)}
          onClear={() => setSearchValue('')}
          placeholder={formatMessage(messages.searchInputPlaceholder)}
          startIcon={<SearchIcon />}
          className={cx('header__search')}
          maxLength={256}
          clearable
        />
      </div>
    </div>
  );
};
