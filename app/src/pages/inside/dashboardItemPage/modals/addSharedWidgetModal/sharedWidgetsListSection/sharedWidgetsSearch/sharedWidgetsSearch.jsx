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
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputSearch } from 'components/inputs/inputSearch';
import styles from './sharedWidgetsSearch.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  searchInputPlaceholder: {
    id: 'SharedWidgetsSearch.searchInputPlaceholder',
    defaultMessage: 'Search by name, owner',
  },
});

@injectIntl
@reduxForm({
  form: 'sharedWidgetSearchForm',
  validate: ({ filter }) => ({
    filter: filter && filter.length < 3 && 'sharedWidgetSearchHint',
  }),
  onChange: ({ filter }, dispatcher, { onFilterChange }) => {
    if (filter && filter.length < 3) {
      return;
    }

    onFilterChange(filter || undefined);
  },
})
export class SharedWidgetsSearch extends Component {
  static propTypes = {
    intl: PropTypes.object,
    selectedWidget: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  };

  static defaultProps = {
    intl: {},
    selectedWidget: null,
    value: null,
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('shared-widgets-search')}>
        <div className={cx('search-input')}>
          <FieldProvider name="filter">
            <FieldErrorHint>
              <InputSearch
                placeholder={formatMessage(messages.searchInputPlaceholder)}
                maxLength="256"
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
      </div>
    );
  }
}
