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

import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { columnPropTypes } from 'components/main/grid/propTypes';
import { ALIGN_LEFT } from 'components/main/grid';
import { SORTING_ASC } from 'controllers/sorting';
import ArrowIcon from './img/arrow-down-inline.svg';
import FilterIcon from './img/icon-filter-inline.svg';
import styles from './headerCell.scss';

const cx = classNames.bind(styles);

export const HeaderCell = track()(
  ({
    title,
    align,
    size,
    backgroundColor,
    border,
    sortable,
    id,
    sortingActive,
    sortingDirection,
    onChangeSorting,
    withFilter,
    onFilterClick,
    filterEventInfo,
    sortingEventInfo,
    tracking,
  }) => {
    const displayedDirection = sortingActive ? sortingDirection : SORTING_ASC;
    const computedClassName = {
      [`background-color-${backgroundColor}`]: backgroundColor,
      [`border-${border}`]: border,
      [`align-${align}`]: align,
      [`sorting-${displayedDirection.toLowerCase()}`]: displayedDirection,
      sortable,
      'sorting-active': sortingActive,
      'with-filter': withFilter,
    };
    const filterClickHandler = (e) => {
      e.stopPropagation();
      onFilterClick(id);
      filterEventInfo && tracking.trackEvent(filterEventInfo);
    };
    const sortingClickHandler = () => {
      tracking.trackEvent(sortingEventInfo);
      onChangeSorting(id);
    };
    const TitleComponent = title.component;
    const titleComponentProps = title.componentProps;
    return title.component ? (
      <TitleComponent className={cx('header-cell', computedClassName)} {...titleComponentProps} />
    ) : (
      <div className={cx('header-cell', computedClassName)}>
        <div className={cx('title-container')} onClick={sortable ? sortingClickHandler : null}>
          <div className={cx('filter')} onClick={filterClickHandler}>
            {Parser(FilterIcon)}
          </div>
          <span
            className={cx('title-full', { [`title-full--${size}`]: size })}
            title={size ? title.full : ''}
          >
            {title.full}
          </span>
          <span
            className={cx('title-short', { [`title-short--${size}`]: size })}
            title={size ? title.full : ''}
          >
            {title.short || title.full}
          </span>
          <div className={cx('arrow')}>{Parser(ArrowIcon)}</div>
        </div>
      </div>
    );
  },
);
HeaderCell.propTypes = {
  ...columnPropTypes,
  sortingDirection: PropTypes.string,
  sortingActive: PropTypes.bool,
  onChangeSorting: PropTypes.func,
  onFilterClick: PropTypes.func,
  filterEventInfo: PropTypes.object,
  sortingEventInfo: PropTypes.object,
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
    getTrackingData: PropTypes.func,
  }),
};
HeaderCell.defaultProps = {
  title: {
    full: '',
  },
  align: ALIGN_LEFT,
  size: null,
  sortable: false,
  backgroundColor: null,
  border: null,
  id: '',
  withFilter: false,
  sortingDirection: 'DESC',
  sortingActive: false,
  onChangeSorting: () => {},
  onFilterClick: () => {},
  filterEventInfo: {},
  sortingEventInfo: {},
  tracking: {
    trackEvent: () => {},
    getTrackingData: () => {},
  },
};
