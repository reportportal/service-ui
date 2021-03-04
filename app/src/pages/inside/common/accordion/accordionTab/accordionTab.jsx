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
  section,
  activeTabIdx,
  setActiveTabIdx,
  currentTabIdx,
  headerClassNames,
  contentClassNames,
}) => {
  const { title, content } = section;
  const clickHandler = () =>
    activeTabIdx === currentTabIdx ? setActiveTabIdx(null) : setActiveTabIdx(currentTabIdx);

  return (
    <>
      <div
        className={cx('header', { open: activeTabIdx === currentTabIdx }, headerClassNames)}
        onClick={clickHandler}
      >
        {title}
      </div>
      <div className={cx('content', { show: activeTabIdx === currentTabIdx }, contentClassNames)}>
        {content}
      </div>
    </>
  );
};
AccordionTab.propTypes = {
  section: PropTypes.object,
  activeTabIdx: PropTypes.oneOfType([PropTypes.number, PropTypes.instanceOf(null)]),
  setActiveTabIdx: PropTypes.func,
  currentTabIdx: PropTypes.number,
  headerClassNames: PropTypes.string,
  contentClassNames: PropTypes.string,
};
AccordionTab.defautProps = {
  section: {},
  activeTabIdx: null,
  setActiveTabIdx: null,
  currentTabIdx: 0,
  headerClassNames: '',
  contentClassNames: '',
};
