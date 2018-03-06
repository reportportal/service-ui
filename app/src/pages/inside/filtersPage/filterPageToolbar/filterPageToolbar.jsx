import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FilterSearchInput } from './filterSearchInput';
import AddFilterIcon from './img/ic-add-filter-inline.svg';
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
@injectIntl
export class FilterPageToolbar extends React.Component {
  static propTypes = {
    change: PropTypes.func,
    invalid: PropTypes.bool,
    filter: PropTypes.string,
    intl: intlShape,
  };

  static defaultProps = {
    invalid: false,
    filter: null,
    intl: {},
    change: () => {
    },
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
        <FieldProvider name="filter">
          <FilterSearchInput />
        </FieldProvider>
        <div className={cx('label')}>
          {this.props.intl.formatMessage(messages.favoriteFilters)}
        </div>
        <GhostButton icon={AddFilterIcon}>
          {this.props.intl.formatMessage(messages.addFilter)}
        </GhostButton>
      </div>
    );
  }
}
