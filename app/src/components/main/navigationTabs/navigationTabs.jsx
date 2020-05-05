/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    config: PropTypes.objectOf(
      PropTypes.shape({
        name: PropTypes.node,
        link: PropTypes.object,
        component: PropTypes.Element,
        eventInfo: PropTypes.object,
        mobileDisabled: PropTypes.bool,
      }),
    ),
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

  componentDidMount() {
    this.correctActiveTab();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeTab === this.props.activeTab) {
      return;
    }
    this.correctActiveTab();
  }

  correctActiveTab = () => {
    const { activeTab, config } = this.props;
    if (!activeTab || !config[activeTab]) {
      const firstTabName = Object.keys(config)[0];
      this.onChangeTab(firstTabName);
    }
  };

  createTrackingFunction = (eventInfo) => {
    if (!eventInfo) {
      return null;
    }
    return () => this.props.tracking.trackEvent(eventInfo);
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
    const activeConfig = activeTab && config[activeTab];
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
                  onClick={this.createTrackingFunction(this.props.config[item].eventInfo)}
                >
                  {config[item].name}
                </NavLink>
              ))}
          </div>
          {customBlock}
        </div>
        <div
          className={cx('content-wrapper', {
            'mobile-disabled': activeConfig && activeConfig.mobileDisabled,
            'custom-content-wrapper': customBlock,
          })}
        >
          {activeConfig && activeConfig.component}
        </div>
      </div>
    );
  };
}
