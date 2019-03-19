import PropTypes from 'prop-types';
import track from 'react-tracking';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
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
    defaultMessage: 'Add filter',
  },
  searchInputPlaceholder: { id: 'FiltersPage.searchByName', defaultMessage: 'Search by name' },
});
@track()
@reduxForm({
  form: 'filterSearch',
  validate: ({ filter }) => ({
    filter: filter && filter.length < 3 ? 'filterNameError' : undefined,
  }),
  onChange: (values, dispatch, props, previousValues) => {
    if (typeof previousValues.filter === 'undefined') {
      return;
    }
    if (!values.filter || values.filter.length >= 3) {
      props.tracking.trackEvent(FILTERS_PAGE_EVENTS.SEARCH_FILTER);
      props.onFilterChange(values.filter);
    }
  },
})
@injectIntl
export class FilterPageToolbar extends React.Component {
  static propTypes = {
    intl: intlShape,
    change: PropTypes.func,
    invalid: PropTypes.bool,
    filter: PropTypes.string,
    filters: PropTypes.array,
    onAddFilter: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    invalid: false,
    filter: null,
    filters: [],
    change: () => {},
    onAddFilter: () => {},
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
      <div className={cx('filter-page-toolbar')}>
        <div className={cx('filter-search')}>
          <FieldProvider name="filter">
            <FieldErrorHint>
              <InputSearch
                disabled={!this.props.filters.length && !this.props.filter}
                maxLength="128"
                placeholder={this.props.intl.formatMessage(messages.searchInputPlaceholder)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('label')}>{this.props.intl.formatMessage(messages.favoriteFilters)}</div>
        <GhostButton icon={AddFilterIcon} onClick={this.props.onAddFilter}>
          {this.props.intl.formatMessage(messages.addFilter)}
        </GhostButton>
      </div>
    );
  }
}
