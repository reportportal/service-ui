/*
 * Copyright 2026 EPAM Systems
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

import { memo } from 'react';
import classNames from 'classnames/bind';
import { Icon } from 'components/main/icon';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import { Filter } from 'pages/inside/dashboardItemPage/modals/widgetWizardModal/types';
import { isEmptyObject } from 'common/utils';
import { useIntl, defineMessages } from 'react-intl';
import styles from './lockedActiveFilter.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  filterNotFound: {
    id: 'FiltersControl.notFoundOnProject',
    defaultMessage: 'Filter is not found',
  },
});

interface LockedActiveFilterProps {
  filter?: Filter;
  onEdit: () => void;
}

export const LockedActiveFilter = memo(({ filter = {}, onEdit }: LockedActiveFilterProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('locked-active-filter')}>
      <Icon type="icon-pencil" onClick={onEdit} className={cx('pencil-icon')} />

      {isEmptyObject(filter) ? (
        <span className={cx('not-found')}>{formatMessage(messages.filterNotFound)}</span>
      ) : (
        <>
          <FilterName filter={filter} showDesc={false} editable={false} isBold />
          <FilterOptions entities={filter.conditions} sort={filter.orders} />
        </>
      )}
    </div>
  );
});
