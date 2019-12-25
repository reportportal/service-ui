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
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import AddFilterIcon from 'common/img/add-filter-inline.svg';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputSearch } from 'components/inputs/inputSearch';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FILTERS_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './filterPageToolbar.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  favoriteFilters: {
    id: 'FiltersPage.msgFavoriteFilters',
    defaultMessage: 'Filters are issue searches that have been saved for re-use.',
  },
  addFilter: {
    id: 'FiltersPage.addFilter',
    defaultMessage: 'Add Filter',
  },
  searchInputPlaceholder: { id: 'FiltersPage.searchByName', defaultMessage: 'Search by name' },
});
@track()
@reduxForm({
  form: 'searchFilterForm',
  validate: ({ filter }) => ({
    filter: bindMessageToValidator(validate.searchFilter, 'filterNameError')(filter),
  }),
  enableReinitialize: true,
})
@injectIntl
export class FilterPageToolbar extends React.Component {
  static propTypes = {
    intl: PropTypes.object,
    isSearchDisabled: PropTypes.bool,
    onAddFilter: PropTypes.func,
    onFilterChange: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    intl: {},
    isSearchDisabled: false,
    onAddFilter: () => {},
    onFilterChange: () => {},
  };

  handleFilterChange = (e, filter) => {
    if (validate.searchFilter(filter)) {
      this.props.tracking.trackEvent(FILTERS_PAGE_EVENTS.SEARCH_FILTER);
      this.props.onFilterChange(filter);
    }
  };

  render() {
    const {
      intl: { formatMessage },
      isSearchDisabled,
      onAddFilter,
    } = this.props;

    return (
      <div className={cx('filter-page-toolbar')}>
        <div className={cx('filter-search')}>
          <FieldProvider name="filter" onChange={this.handleFilterChange}>
            <FieldErrorHint>
              <InputSearch
                disabled={isSearchDisabled}
                maxLength="128"
                placeholder={formatMessage(messages.searchInputPlaceholder)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('label')}>{formatMessage(messages.favoriteFilters)}</div>
        <GhostButton icon={AddFilterIcon} onClick={onAddFilter}>
          {formatMessage(messages.addFilter)}
        </GhostButton>
      </div>
    );
  }
}
