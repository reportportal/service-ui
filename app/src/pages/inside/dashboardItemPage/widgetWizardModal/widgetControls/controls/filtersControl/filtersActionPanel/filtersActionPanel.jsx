import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';

import { InputSearch } from 'components/inputs/inputSearch';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';

import styles from './filtersActionPanel.scss';
import AddFilterIcon from './img/ic-add-filter-inline.svg';
import { FILTER_SEARCH_FORM } from '../constants';

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

@reduxForm({
  form: FILTER_SEARCH_FORM,
  validate: ({ filter }) => ({
    filter: filter && filter.length < 3 ? 'filterNameError' : undefined,
  }),
  onChange: ({ filter }, dispatcher, { onFilterChange }) => {
    if (filter && filter.length < 3) {
      return;
    }

    onFilterChange(filter || undefined);
  },
})
@injectIntl
export class FiltersActionPanel extends Component {
  static propTypes = {
    intl: intlShape,
    filter: PropTypes.string,
    invalid: PropTypes.bool,
    change: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    invalid: false,
    filter: null,
    change: () => {},
  };

  componentDidMount() {
    const { change, filter } = this.props;
    change('filter', filter);
  }

  componentWillReceiveProps({ filter: nextFilter, invalid: nextInvalid }) {
    const { change, filter } = this.props;

    if (nextFilter !== filter && !nextInvalid) {
      change('filter', nextFilter);
    }
  }

  render() {
    const { intl } = this.props;

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
        <GhostButton icon={AddFilterIcon} title={intl.formatMessage(messages.addFilterButton)}>
          {intl.formatMessage(messages.addFilterButton)}
        </GhostButton>
      </div>
    );
  }
}
