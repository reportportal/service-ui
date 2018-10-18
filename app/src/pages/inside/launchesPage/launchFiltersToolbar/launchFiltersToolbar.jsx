import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import { FilterList } from './filterList';
import { ExpandToggler } from './expandToggler';
import { filterShape } from './propTypes';
import styles from './launchFiltersToolbar.scss';

const cx = classNames.bind(styles);

export class LaunchFiltersToolbar extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(filterShape),
    activeFilterId: PropTypes.string,
    onSelectFilter: PropTypes.func,
    onRemoveFilter: PropTypes.func,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
    filterErrors: PropTypes.object,
    filterEntities: PropTypes.array,
  };

  static defaultProps = {
    filters: [],
    activeFilterId: null,
    onSelectFilter: () => {},
    onRemoveFilter: () => {},
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    filterErrors: {},
    filterEntities: [],
  };

  state = {
    expanded: false,
  };

  toggleExpand = () => this.setState({ expanded: !this.state.expanded });

  render() {
    const {
      filters,
      activeFilterId,
      onSelectFilter,
      onRemoveFilter,
      filterEntities,
      filterErrors,
      onFilterChange,
      onFilterValidate,
      onFilterAdd,
      onFilterRemove,
    } = this.props;
    return (
      <div className={cx('launch-filters-toolbar')}>
        <div className={cx('filter-tickets-row')}>
          <div className={cx('all-latest-switcher')}>TODO (EPMRPP-35466)</div>
          <div className={cx('separator')} />
          <div className={cx('filter-tickets-container')}>
            <FilterList
              filters={filters}
              activeFilterId={activeFilterId}
              onSelectFilter={onSelectFilter}
              onRemoveFilter={onRemoveFilter}
            />
          </div>
          <ExpandToggler expanded={this.state.expanded} onToggleExpand={this.toggleExpand} />
        </div>
        {this.state.expanded && (
          <div className={cx('filter-entities-container')}>
            {activeFilterId !== 'all' && (
              <EntitiesGroup
                onChange={onFilterChange}
                onValidate={onFilterValidate}
                onRemove={onFilterRemove}
                onAdd={onFilterAdd}
                errors={filterErrors}
                entities={filterEntities}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}
