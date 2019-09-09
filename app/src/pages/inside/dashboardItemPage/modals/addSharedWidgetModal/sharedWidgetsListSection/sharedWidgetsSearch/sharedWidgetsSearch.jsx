import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputSearch } from 'components/inputs/inputSearch';
import { validate } from 'common/utils';
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
    filter: !validate.validateSearchFilter(filter) && 'sharedWidgetSearchHint',
  }),
  onChange: ({ filter }, dispatcher, { onFilterChange }) => {
    if (!validate.validateSearchFilter(filter)) {
      return;
    }

    onFilterChange(filter || undefined);
  },
})
export class SharedWidgetsSearch extends Component {
  static propTypes = {
    intl: intlShape,
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
