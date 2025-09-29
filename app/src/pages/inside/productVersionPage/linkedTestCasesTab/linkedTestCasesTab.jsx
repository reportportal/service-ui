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

import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { isEmpty } from 'es-toolkit/compat';
import { useIntl } from 'react-intl';
import { Table } from '@reportportal/ui-kit';

import discoverPluginsIcon from 'common/img/discover-icon-inline.svg';
import openInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import { HelpPanel } from 'pages/inside/common/helpPanel';
import settingsIcon from 'common/img/settings-icon-inline.svg';
import { referenceDictionary } from 'common/utils';

import { FilterBlock } from './filterBlock';
import { HeaderConfig } from './headerConfig';
import { getData } from './tagList';
import { messages } from './messages';

import styles from './linkedTestCasesTab.scss';

const cx = classNames.bind(styles);

export const LinkedTestCasesTab = () => {
  const { formatMessage } = useIntl();
  const [filters, setFilters] = useState({});

  const data = getData();

  const clearAllFilters = () => {
    setFilters({});
  };

  const primaryColumn = {
    key: 'testCaseName',
    header: formatMessage(messages.testCaseName),
    width: 520,
    align: 'left',
  };

  const fixedColumns = [
    {
      key: 'executionStatus',
      header: formatMessage(messages.executionStatus),
      width: 140,
      align: 'left',
    },
    {
      key: 'defaultVersion',
      header: formatMessage(messages.defaultVersion),
      width: 165,
      align: 'left',
    },
    {
      key: 'setDefault',
      width: 144,
      align: 'left',
    },
  ];

  const infoItems = [
    {
      title: formatMessage(messages.whatIsDefaultTestTitle),
      mainIcon: discoverPluginsIcon,
      description: formatMessage(messages.whatIsDefaultTestDescription),
      openIcon: openInNewTabIcon,
      automationId: 'whatIsDefaultTest',
      link: referenceDictionary.rpDoc,
    },
    {
      title: formatMessage(messages.howMilestonesWorkTitle),
      mainIcon: discoverPluginsIcon,
      description: formatMessage(messages.howMilestonesWorkDescription),
      openIcon: openInNewTabIcon,
      automationId: 'howMilestonesWork',
      link: referenceDictionary.rpDoc,
    },
    {
      title: formatMessage(messages.howManageTestChangesTitle),
      mainIcon: settingsIcon,
      description: formatMessage(messages.howManageTestChangesDescription),
      openIcon: openInNewTabIcon,
      automationId: 'howManageTestChanges',
      link: referenceDictionary.rpDoc,
    },
  ];

  return (
    <div className={cx('linked-test-cases-tab-content')}>
      <div className={cx('linked-test-cases-tab-content__description')}>
        {formatMessage(messages.description)}
      </div>
      <div className={cx('test-cases-versions')}>
        <div className={cx('test-cases-versions__header')}>
          <div className={cx('test-cases-versions__header-title')}>
            {formatMessage(messages.testCasesVersions)}
          </div>
          <HeaderConfig filters={filters} setFilters={setFilters} />
        </div>
        {!isEmpty(filters) && <FilterBlock filters={filters} clearAllFilters={clearAllFilters} />}
        <Table
          data={data}
          fixedColumns={fixedColumns}
          primaryColumn={primaryColumn}
          sortingColumn={[]}
          sortableColumns={[]}
          className={cx('test-cases-versions__table')}
          rowClassName={cx('test-cases-versions__table-row')}
        />
      </div>
      <HelpPanel items={infoItems} />
    </div>
  );
};
