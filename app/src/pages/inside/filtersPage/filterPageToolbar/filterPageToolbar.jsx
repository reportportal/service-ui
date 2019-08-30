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
  enableReinitialize: true,
  onChange: (values, dispatch, props) => {
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
    invalid: PropTypes.bool,
    disabled: PropTypes.bool,
    onAddFilter: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    invalid: false,
    disabled: null,
    onAddFilter: () => {},
  };

  render() {
    const {
      intl: { formatMessage },
      disabled,
      onAddFilter,
    } = this.props;

    return (
      <div className={cx('filter-page-toolbar')}>
        <div className={cx('filter-search')}>
          <FieldProvider name="filter">
            <FieldErrorHint>
              <InputSearch
                disabled={disabled}
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
