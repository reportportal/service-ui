/*
 * Copyright 2022 EPAM Systems
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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import React, { useEffect, useState } from 'react';
import { NavLink } from 'components/main/navLink';
import styles from './tabs.scss';

const cx = classNames.bind(styles);

export const Tabs = ({ config, activeTab, withContent }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(() => {
    const tabIndex = Object.keys(config).indexOf(activeTab);
    return tabIndex >= 0 ? tabIndex : 0;
  });

  useEffect(() => {
    if (activeTab) {
      setActiveTabIndex(Object.keys(config).indexOf(activeTab));
    }
  }, [activeTab, config]);

  const activeTabKey = Object.keys(config)[activeTabIndex];
  const activeTabInfo = config[activeTabKey];

  const onClickTab = (index) => {
    setActiveTabIndex(index);
  };

  const renderLinkTab = (item, index) => {
    return (
      <NavLink
        key={item}
        className={cx('tab')}
        to={config[item].link}
        activeClassName={cx({ 'active-tab': activeTabIndex === index })}
        onClick={() => onClickTab(index)}
      >
        {config[item].name}
      </NavLink>
    );
  };

  const renderDefaultTab = (item, index) => {
    return (
      <div
        key={item}
        onClick={() => onClickTab(index)}
        className={cx('tab', { 'active-tab': activeTabIndex === index })}
      >
        {config[item].name}
      </div>
    );
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('tabs')}>
        {Object.keys(config).map((item, index) => {
          return config[item].link ? renderLinkTab(item, index) : renderDefaultTab(item, index);
        })}
      </div>
      {withContent && <div className={cx('tab-content')}>{activeTabInfo.component}</div>}
    </div>
  );
};

Tabs.propTypes = {
  activeTab: PropTypes.string,
  config: PropTypes.objectOf(
    PropTypes.shape({
      name: PropTypes.node,
      link: PropTypes.object,
      component: PropTypes.element,
      eventInfo: PropTypes.object,
      mobileDisabled: PropTypes.bool,
    }),
  ),
  withContent: PropTypes.bool,
};
Tabs.defaultProps = {
  activeTab: '',
  config: {},
  withContent: true,
};
