/*
 * Copyright 2021 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './accordionTab.scss';

const cx = classNames.bind(styles);

export const AccordionTab = ({
  tab,
  tabsState,
  setTabsState,
  headerClassNames,
  contentClassNames,
}) => {
  const { id, title, content } = tab;
  const clickHandler = () =>
    tabsState[id]
      ? setTabsState({ ...tabsState, [id]: false })
      : setTabsState({ ...tabsState, [id]: true });

  return (
    <>
      <div
        className={cx('header', { open: tabsState[id] }, headerClassNames)}
        onClick={clickHandler}
      >
        {title}
      </div>
      <div className={cx('content', { show: tabsState[id] }, contentClassNames)}>{content}</div>
    </>
  );
};
AccordionTab.propTypes = {
  tab: PropTypes.object,
  tabsState: PropTypes.objectOf(PropTypes.bool),
  setTabsState: PropTypes.func,
  headerClassNames: PropTypes.string,
  contentClassNames: PropTypes.string,
};
AccordionTab.defautProps = {
  tab: {},
  tabsState: {},
  setTabsState: () => {},
  headerClassNames: '',
  contentClassNames: '',
};
