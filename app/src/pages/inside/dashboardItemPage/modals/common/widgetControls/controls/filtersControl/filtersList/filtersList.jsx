/*
 * Copyright 2019 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';
import { NoResultsForFilter } from 'pages/inside/common/noResultsForFilter';
import styles from './filtersList.scss';
import { FiltersItem } from '../filtersItem';
import { FORM_APPEARANCE_MODE_EDIT } from '../common/constants';

const cx = classNames.bind(styles);

export const FiltersList = ({
  search,
  userId,
  activeId,
  filters,
  loading,
  onChange,
  onEdit,
  onLazyLoad,
  noItemsMessage,
  noItemsAdditionalMessage,
}) => (
  <div className={cx('filter-list')}>
    <ScrollWrapper onLazyLoad={onLazyLoad}>
      {filters.map((item) => (
        <FiltersItem
          search={search || ''}
          userId={userId}
          filter={item}
          activeFilterId={activeId}
          key={item.id}
          onChange={onChange}
          onEdit={(event) => onEdit(event, FORM_APPEARANCE_MODE_EDIT, item)}
        />
      ))}
      {loading && <SpinningPreloader />}
      {!filters.length &&
        !loading && (
          <NoResultsForFilter
            filter={search || ''}
            notFoundMessage={noItemsMessage}
            notFoundAdditionalMessage={noItemsAdditionalMessage}
          />
        )}
    </ScrollWrapper>
  </div>
);

FiltersList.propTypes = {
  userId: PropTypes.string,
  search: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  activeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loading: PropTypes.bool,
  filters: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onEdit: PropTypes.func,
  onLazyLoad: PropTypes.func,
  noItemsMessage: PropTypes.object,
  noItemsAdditionalMessage: PropTypes.object,
};

FiltersList.defaultProps = {
  activeId: '',
  userId: '',
  search: '',
  loading: false,
  onChange: () => {},
  onEdit: () => {},
  onLazyLoad: null,
  noItemsMessage: {},
  noItemsAdditionalMessage: null,
};
