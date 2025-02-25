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

import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { EntityInputConditional } from 'components/filterEntities';
import { TEST_CASE_SEARCH } from 'common/constants/widgetTypes';
import { CONDITION_CNT } from 'components/filterEntities/constants';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import styles from './testCaseSearch.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);
export const TestCaseSearch = () => {
  const { formatMessage } = useIntl();
  // TODO: update in scope task of filtering
  const filterEntity = [
    {
      id: TEST_CASE_SEARCH,
      component: EntityInputConditional,
      value: {
        condition: CONDITION_CNT,
      },
      title: formatMessage(messages.testNameTitle),
      active: true,
      removable: false,
      static: true,
      customProps: {
        placeholder: formatMessage(messages.testNamePlaceholder),
      },
    },
  ];

  return (
    <div className={cx('test-case-search-container')}>
      <div className={cx('filter-controls')}>
        <EntitiesGroup entities={filterEntity} />
      </div>
      <div className={cx('content')}>
        <p className={cx('title')}>{formatMessage(messages.letsSearch)}</p>
        <p className={cx('desctiption')}>{formatMessage(messages.provideParameters)}</p>
      </div>
    </div>
  );
};
