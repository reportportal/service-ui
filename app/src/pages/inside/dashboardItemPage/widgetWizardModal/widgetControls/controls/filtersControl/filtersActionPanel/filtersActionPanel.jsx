import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
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
@reduxForm({
  form: FILTER_SEARCH_FORM,
  validate: ({ filter }) => (filter && filter.length < 3 ? { filter: 'filterNameError' } : {}),
  onChange: ({ filter }, dispatcher, { onFilterChange }) => {
    if (filter && filter.length < 3) {
      return;
    }

    onFilterChange(filter || undefined);
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
  };

  static defaultProps = {
    intl: {},
    invalid: false,
    filter: null,
    value: null,
    filters: [],
    change: () => {},
    onAdd: () => {},
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
    const { intl, onAdd } = this.props;

    return (
      <div className={cx('filters-header')}>
        <div className={cx('filters-input')}>
          <FieldProvider name={'filter'}>
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
          onClick={(event) => onAdd(event, FORM_APPEARANCE_MODE_ADD)}
        >
          {intl.formatMessage(messages.addFilterButton)}
        </GhostButton>
      </div>
    );
  }
}
