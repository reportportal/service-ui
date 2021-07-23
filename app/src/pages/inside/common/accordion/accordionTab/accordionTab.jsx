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

export const AccordionTab = ({ tab: { title, content, isOpen, disabled }, onClick }) => (
  <>
    <div
      className={cx('header', {
        open: isOpen,
        disabled,
      })}
      onClick={content && onClick}
    >
      {title}
    </div>
    <div className={cx('content', { show: isOpen })}>{content}</div>
  </>
);
AccordionTab.propTypes = {
  tab: PropTypes.object,
  onClick: PropTypes.func,
};
AccordionTab.defautProps = {
  tab: {},
  onClick: () => {},
};
