import React, { Component } from 'react';
import { NavLink } from 'redux-first-router-link';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputDropdown } from 'components/inputs/inputDropdown';
import styles from './navigationTabs.scss';

const cx = classNames.bind(styles);

export class NavigationTabs extends Component {
  static propTypes = {
    onChangeTab: PropTypes.func,
    config: PropTypes.object,
    activeTab: PropTypes.string,
  };
  static defaultProps = {
    onChangeTab: () => {},
    config: {},
    activeTab: '',
  };

  onChangeTab = (val) => {
    this.props.onChangeTab(this.props.config[val].link);
  };

  generateOptions = () =>
    Object.keys(this.props.config).map((item) => ({
      label: (
        <NavLink to={this.props.config[item].link} className={cx('link')}>
          {this.props.config[item].name}
        </NavLink>
      ),
      value: item,
    }));

  render = () => {
    const { config, activeTab } = this.props;
    return (
      <div className={cx('container-with-tabs')}>
        <div className={cx('tabs-mobile')}>
          <InputDropdown
            options={this.generateOptions()}
            value={activeTab}
            onChange={this.onChangeTab}
          />
        </div>
        <div className={cx('tabs-wrapper')}>
          {Object.keys(config).map((item) => (
            <NavLink
              key={item}
              className={cx('tab')}
              to={config[item].link}
              activeClassName={cx('active')}
            >
              {config[item].name}
            </NavLink>
          ))}
        </div>
        <div className={cx('content-wrapper')}>{config[activeTab].component}</div>
      </div>
    );
  };
}
