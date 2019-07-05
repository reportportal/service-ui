import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ALL_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { getPluginsFilter } from 'common/constants/pluginsFilter';
import { InputDropdown } from 'components/inputs/inputDropdown';
import styles from './installedTab.scss';
import { PluginsFilter } from './../../pluginsFilter';
import { PluginsListItems } from './../../pluginsListItems';

const cx = classNames.bind(styles);

export class InstalledTab extends Component {
  static propTypes = {
    filterItems: PropTypes.array.isRequired,
    plugins: PropTypes.array.isRequired,
  };

  state = {
    activeFilterItem: ALL_GROUP_TYPE,
  };

  getFilterPluginsList = (activeFilterItem) => {
    const { plugins } = this.props;

    if (activeFilterItem === ALL_GROUP_TYPE) {
      return plugins;
    }

    return plugins.filter((item) => item.groupType === activeFilterItem);
  };

  handleFilterChange = (value) => {
    this.setState({
      activeFilterItem: value,
    });
  };

  generateOptions = () =>
    getPluginsFilter(this.props.filterItems).map((item) => ({
      label: item.label,
      value: item.value,
    }));

  renderFilterMobileBlock = () => (
    <div className={cx('plugins-filter-mobile')}>
      <InputDropdown
        options={this.generateOptions()}
        value={this.state.activeFilterItem}
        onChange={this.handleFilterChange}
      />
    </div>
  );

  render() {
    const { filterItems } = this.props;
    const { activeFilterItem } = this.state;

    return (
      <div className={cx('plugins-wrapper')}>
        <div className={cx('plugins-content-wrapper')}>
          <PluginsFilter
            filterItems={filterItems}
            activeItem={activeFilterItem}
            onFilterChange={this.handleFilterChange}
          />
          <div className={cx('plugins-content')}>
            <PluginsListItems
              title={activeFilterItem}
              items={this.getFilterPluginsList(activeFilterItem)}
              filterMobileBlock={this.renderFilterMobileBlock()}
            />
          </div>
        </div>
      </div>
    );
  }
}
