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
import { reduxForm } from 'redux-form';
import track from 'react-tracking';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { InputSearch } from 'components/inputs/inputSearch';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import styles from './filtersActionPanel.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  searchInputPlaceholder: {
    id: 'FiltersActionPanel.searchInputPlaceholder',
    defaultMessage: 'Search filter by name',
  },
});

@injectIntl
@track()
@reduxForm({
  form: 'filterSearchForm',
  validate: ({ filter }) => (filter && filter.length < 3 ? { filter: 'filterNameError' } : {}),
  onChange: ({ filter }, dispatcher, props) => {
    if (filter && filter.length < 3) {
      return;
    }
    props.onFilterChange(filter || undefined);
  },
})
export class FiltersActionPanel extends Component {
  static propTypes = {
    intl: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    filter: PropTypes.string,
    filters: PropTypes.array,
    invalid: PropTypes.bool,
    customBlock: PropTypes.node,
    change: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    invalid: false,
    filter: null,
    value: null,
    filters: [],
    customBlock: null,
    change: () => {},
  };

  componentDidMount() {
    const { change, filter, value } = this.props;
    change('filter', filter || value || '');
  }

  componentDidUpdate(prevProps) {
    const { filter: nextFilter, invalid: nextInvalid } = prevProps;
    const { change, filter } = this.props;

    if (nextFilter !== filter && !nextInvalid) {
      change('filter', nextFilter);
    }
  }

  render() {
    const {
      intl: { formatMessage },
      customBlock,
    } = this.props;

    return (
      <div className={cx('filters-header')}>
        <div className={cx('filters-input')}>
          <FieldProvider name="filter">
            <FieldErrorHint>
              <InputSearch
                placeholder={formatMessage(messages.searchInputPlaceholder)}
                maxLength="128"
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        {customBlock}
      </div>
    );
  }
}
