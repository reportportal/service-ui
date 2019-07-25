import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { NavLink } from 'components/main/navLink';
import styles from './navigationTabs.scss';

const cx = classNames.bind(styles);

@track()
export class NavigationTabs extends Component {
  static propTypes = {
    onChangeTab: PropTypes.func,
    config: PropTypes.object,
    activeTab: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    customBlock: PropTypes.element,
  };
  static defaultProps = {
    onChangeTab: () => {},
    config: {},
    activeTab: '',
    customBlock: null,
  };

  onChangeTab = (val) => {
    this.props.onChangeTab(this.props.config[val].link);
  };

  generateOptions = () =>
    Object.keys(this.props.config).map((item) => ({
      label: (
        <NavLink
          to={this.props.config[item].link}
          activeClassName={cx('active-link')}
          className={cx('link')}
          onClick={() => {
            this.props.tracking.trackEvent(this.props.config[item].eventInfo);
          }}
        >
          {this.props.config[item].name}
        </NavLink>
      ),
      value: item,
    }));

  render = () => {
    const { config, activeTab, customBlock } = this.props;
    return (
      <div className={cx('navigation-tabs')}>
        <div className={cx('tabs-mobile', { 'custom-tabs-mobile-wrapper': customBlock })}>
          <InputDropdown
            options={this.generateOptions()}
            value={activeTab}
            onChange={this.onChangeTab}
          />
        </div>
        <div className={cx({ 'panel-wrapper': customBlock })}>
          <div className={cx('tabs-wrapper', { 'custom-tabs-wrapper': customBlock })}>
            {config &&
              Object.keys(config).map((item) => (
                <NavLink
                  key={item}
                  className={cx('tab')}
                  to={config[item].link}
                  activeClassName={cx('active-tab')}
                  onClick={() => {
                    this.props.tracking.trackEvent(this.props.config[item].eventInfo);
                  }}
                >
                  {config[item].name}
                </NavLink>
              ))}
          </div>
          {customBlock}
        </div>
        <div
          className={cx('content-wrapper', {
            'mobile-disabled': activeTab && config[activeTab].mobileDisabled,
            'custom-content-wrapper': customBlock,
          })}
        >
          {activeTab && config[activeTab].component}
        </div>
      </div>
    );
  };
}
