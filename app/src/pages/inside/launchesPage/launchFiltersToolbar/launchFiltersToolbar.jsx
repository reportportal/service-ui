import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FilterList } from './filterList';
import { filterShape } from './propTypes';
import styles from './launchFiltersToolbar.scss';

const cx = classNames.bind(styles);

export const LaunchFiltersToolbar = ({ filters, onSelectFilter, onRemoveFilter }) => (
  <div className={cx('launch-filters-toolbar')}>
    <div className={cx('all-latest-switcher')}>TODO (EPMRPP-35466)</div>
    <div className={cx('separator')} />
    <FilterList filters={filters} onSelectFilter={onSelectFilter} onRemoveFilter={onRemoveFilter} />
  </div>
);
LaunchFiltersToolbar.propTypes = {
  filters: PropTypes.arrayOf(filterShape),
  onSelectFilter: PropTypes.func,
  onRemoveFilter: PropTypes.func,
};
LaunchFiltersToolbar.defaultProps = {
  filters: [],
  onSelectFilter: () => {},
  onRemoveFilter: () => {},
};
