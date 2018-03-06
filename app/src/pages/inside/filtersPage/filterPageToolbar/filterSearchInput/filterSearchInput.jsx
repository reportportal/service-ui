import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import SearchIcon from './img/ic-search-inline.svg';
import styles from './filterSearchInput.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  searchInputPlaceholder: { id: 'FiltersPage.searchByName', defaultMessage: 'Search by name' },
  searchInputError: {
    id: 'FiltersPage.filterNameLength',
    defaultMessage: 'Filter name length should have size from 3 to 128 characters.',
  },
});

export const FilterSearchInput = injectIntl(({ error, active, intl, ...rest }) => (
  <div className={cx('search-input', { error })}>
    <FieldErrorHint error={error && intl.formatMessage(messages[error])} active={active}>
      <SearchInputWithIcon
        {...rest}
        placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
        hasRightIcon
      />
    </FieldErrorHint>
  </div>
));
FilterSearchInput.propTypes = {
  error: PropTypes.string,
  active: PropTypes.bool,
};
FilterSearchInput.defaultProps = {
  error: '',
  active: false,
};

const SearchInputWithIcon = props => (
  <Fragment>
    <Input
      {...props}
    />
    <div className={cx('search-icon')}>
      {Parser(SearchIcon)}
    </div>
  </Fragment>
);
