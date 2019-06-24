import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { getPluginsFilter } from 'common/constants/pluginsFilter';
import styles from './pluginsFilter.scss';

const cx = classNames.bind(styles);

@injectIntl
export class PluginsFilter extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    filterItems: PropTypes.array.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    activeItem: PropTypes.string.isRequired,
  };

  getFilterItems = () => getPluginsFilter(this.props.filterItems);

  changeFilterItem = (e) => {
    e.preventDefault();
    this.props.onFilterChange(e.currentTarget.id);
  };

  generateItems = () => {
    const { activeItem } = this.props;

    return (
      <ul className={cx('plugins-filter-list')}>
        {this.getFilterItems().map((item) => (
          <li key={item.value} className={cx('plugins-filter-item')}>
            <button
              className={cx('plugins-filter-button', { active: activeItem === item.value })}
              onClick={this.changeFilterItem}
              id={item.value}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  render() {
    return <Fragment>{this.generateItems()}</Fragment>;
  }
}
