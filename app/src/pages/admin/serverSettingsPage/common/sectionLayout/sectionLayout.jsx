/*
 * Copyright 2025 EPAM Systems
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
import { SectionHeader } from 'components/main/sectionHeader';
import styles from './sectionLayout.scss';

const cx = classNames.bind(styles);

export const SectionLayout = ({ children, header }) => {
  return (
    <div className={cx('section-layout')}>
      <div className={cx('header')}>
        <SectionHeader text={header} />
      </div>
      <div className={cx('content')}>{children}</div>
    </div>
  );
};
SectionLayout.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.string.isRequired,
};
