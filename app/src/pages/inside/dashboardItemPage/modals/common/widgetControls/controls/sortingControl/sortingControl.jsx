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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { STATS_TOTAL, STATS_FAILED } from 'common/constants/statistics';
import { InputDropdownSorting } from 'components/inputs/inputDropdownSorting';
import { WIDGET_OPTIONS } from '../../constants';
import styles from './sortingControl.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  sortBy: {
    id: 'SortingControl.sortBy',
    defaultMessage: 'Sort by',
  },
  sortByCustomColumn: {
    id: 'SortingControl.sortByCustomColumn',
    defaultMessage: 'Custom column (A-Z 1- N)',
  },
  sortByTotal: {
    id: 'SortingControl.sortByTotal',
    defaultMessage: 'Total',
  },
  sortByPassingRate: {
    id: 'SortingControl.sortByPassingRate',
    defaultMessage: 'Passing rate',
  },
  sortByFailedItems: {
    id: 'SortingControl.sortByFailedItems',
    defaultMessage: 'Failed items',
  },
});

@injectIntl
export class SortingControl extends Component {
  static propTypes = {
    intl: PropTypes.object,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    sortingColumn: null,
    sortingDirection: true,
    onChange: () => {},
  };

  getSortOptions = () => [
    {
      value: WIDGET_OPTIONS.SORT.CUSTOM_COLUMN,
      label: this.props.intl.formatMessage(messages.sortByCustomColumn),
      disabled: false,
    },
    {
      value: STATS_TOTAL,
      label: this.props.intl.formatMessage(messages.sortByTotal),
      disabled: false,
    },
    {
      value: WIDGET_OPTIONS.SORT.PASSING_RATE,
      label: this.props.intl.formatMessage(messages.sortByPassingRate),
      disabled: false,
    },
    {
      value: STATS_FAILED,
      label: this.props.intl.formatMessage(messages.sortByFailedItems),
      disabled: false,
    },
  ];

  render() {
    const { intl, onChange, sortingColumn, sortingDirection } = this.props;

    return (
      <div className={cx('sorting-block')}>
        <div className={cx('caption')}>{intl.formatMessage(messages.sortBy)}:</div>
        <InputDropdownSorting
          value={sortingColumn}
          options={this.getSortOptions()}
          onChange={onChange}
          sortingMode={sortingDirection}
          positionTop
        />
      </div>
    );
  }
}
