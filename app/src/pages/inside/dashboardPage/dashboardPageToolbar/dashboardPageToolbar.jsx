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
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import { GhostButton } from 'components/buttons/ghostButton';
import GridViewDashboardIcon from 'common/img/grid-inline.svg';
import TableViewDashboardIcon from 'common/img/table-inline.svg';
import { reduxForm } from 'redux-form';
import { InputSearch } from 'components/inputs/inputSearch';
import { FieldProvider } from 'components/fields/fieldProvider';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import styles from './dashboardPageToolbar.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  searchPlaceholder: {
    id: 'DashboardPageToolbar.searchPlaceholder',
    defaultMessage: 'Search by name',
  },
});

@track()
@reduxForm({
  form: 'searchDashboardForm',
  validate: ({ filter }) => ({
    filter: bindMessageToValidator(validate.searchFilter, 'dashboardNameSearchHint')(filter),
  }),
  enableReinitialize: true,
})
@injectIntl
export class DashboardPageToolbar extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    isSearchDisabled: PropTypes.bool,
    onGridViewToggle: PropTypes.func,
    onTableViewToggle: PropTypes.func,
    gridType: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    onFilterChange: PropTypes.func,
  };
  static defaultProps = {
    isSearchDisabled: false,
    onGridViewToggle: () => {},
    onTableViewToggle: () => {},
    gridType: '',
    onFilterChange: () => {},
  };

  handleFilterChange = (e, filter) => {
    if (validate.searchFilter(filter)) {
      this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.ENTER_PARAM_FOR_SEARCH);
      this.props.onFilterChange(filter);
    }
  };

  render() {
    const { intl, onGridViewToggle, onTableViewToggle, gridType, isSearchDisabled } = this.props;

    return (
      <div className={cx('tool-bar')}>
        <div className={cx('input')}>
          <FieldProvider name="filter" onChange={this.handleFilterChange}>
            <FieldErrorHint>
              <InputSearch
                disabled={isSearchDisabled}
                maxLength="128"
                placeholder={intl.formatMessage(messages.searchPlaceholder)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('buttons', `active-${gridType}`)}>
          <GhostButton onClick={onGridViewToggle} icon={GridViewDashboardIcon} />
          <GhostButton onClick={onTableViewToggle} icon={TableViewDashboardIcon} />
        </div>
      </div>
    );
  }
}
