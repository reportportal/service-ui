import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { Input } from 'components/inputs/input';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import AddFilterIcon from './img/ic-add-filter-inline.svg';
import styles from './filterSearch.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  searchInputPlaceholder: { id: 'FiltersPage.searchByName', defaultMessage: 'Search by name' },
  searchInputError: {
    id: 'FiltersPage.filterNameLength',
    defaultMessage: 'Filter name length should have size from 3 to 128 characters.',
  },
});

@reduxForm({
  form: 'filterSearch',
  validate: ({ filter }) => ({ filter: filter && filter.length < 3 ? 'searchInputError' : undefined }),
  onChange: (vals, dispatch, props) => {
    if (vals.filter && vals.filter.length < 3) {
      return;
    }
    props.onFilterChange(vals.filter || undefined);
  },
})
export class FilterSearch extends React.Component {
  static propTypes = {
    change: PropTypes.func,
    invalid: PropTypes.bool,
    filter: PropTypes.string,
  };

  static defaultProps = {
    invalid: false,
    filter: null,
    change: () => {},
  };

  componentDidMount() {
    this.props.change('filter', this.props.filter);
  }

  componentWillReceiveProps({ filter, invalid }) {
    if (filter !== this.props.filter && !invalid) {
      this.props.change('filter', filter);
    }
  }

  render() {
    return (
      <div className={cx('filter-search')}>
        <FieldProvider name="filter">
          <FilterSearchInput />
        </FieldProvider>
        <div className={cx('label')}>
          Filters are issue searches that have been saved for re-use.
        </div>
        <div>
          <GhostButton icon={AddFilterIcon}>
            Add filter
          </GhostButton>
        </div>
      </div>
    );
  }
}

const FilterSearchInput = injectIntl(({ error, active, intl, ...rest }) => (
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
      {/* TODO: add icon */}
    </div>
  </Fragment>
);
