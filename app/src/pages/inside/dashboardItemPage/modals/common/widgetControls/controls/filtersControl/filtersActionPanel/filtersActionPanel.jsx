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
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { InputSearch } from 'components/inputs/inputSearch';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import AddFilterIcon from 'common/img/add-filter-inline.svg';

import styles from './filtersActionPanel.scss';
import { FILTER_SEARCH_FORM, FORM_APPEARANCE_MODE_ADD } from '../common/constants';

const cx = classNames.bind(styles);
const messages = defineMessages({
  addFilterButton: {
    id: 'FiltersActionPanel.addFilterButton',
    defaultMessage: 'Add filter',
  },
  searchInputPlaceholder: {
    id: 'FiltersActionPanel.searchInputPlaceholder',
    defaultMessage: 'Search filter by name',
  },
});

@injectIntl
@track()
@reduxForm({
  form: FILTER_SEARCH_FORM,
  validate: ({ filter }) => (filter && filter.length < 3 ? { filter: 'filterNameError' } : {}),
  onChange: ({ filter }, dispatcher, props) => {
    if (filter && filter.length < 3) {
      return;
    }
    props.tracking.trackEvent(props.eventsInfo.enterSearchParams);
    props.onFilterChange(filter || undefined);
  },
})
export class FiltersActionPanel extends Component {
  static propTypes = {
    intl: intlShape,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    filter: PropTypes.string,
    filters: PropTypes.array,
    invalid: PropTypes.bool,
    change: PropTypes.func,
    onAdd: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    intl: {},
    invalid: false,
    filter: null,
    value: null,
    filters: [],
    change: () => {},
    onAdd: () => {},
    eventsInfo: {},
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

  onFilterClick = (event) => {
    this.props.tracking.trackEvent(this.props.eventsInfo.addFilter);
    this.props.onAdd(event, FORM_APPEARANCE_MODE_ADD);
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('filters-header')}>
        <div className={cx('filters-input')}>
          <FieldProvider name="filter">
            <FieldErrorHint>
              <InputSearch
                placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
                maxLength="128"
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <GhostButton
          icon={AddFilterIcon}
          title={intl.formatMessage(messages.addFilterButton)}
          onClick={(event) => this.onFilterClick(event)}
        >
          {intl.formatMessage(messages.addFilterButton)}
        </GhostButton>
      </div>
    );
  }
}
