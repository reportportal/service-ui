/*
 * Copyright 2024 EPAM Systems
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
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import searchIcon from 'common/img/newIcons/search-outline-inline.svg';
import filterIcon from 'common/img/newIcons/filters-outline-inline.svg';
import { useIntl } from 'react-intl';
import { messages } from '../messages';
import styles from './organizationsPageHeader.scss';

const cx = classNames.bind(styles);

export const OrganizationsPageHeader = ({ isEmpty }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('organizations-page-header-container')}>
      <div className={cx('header')}>
        <span className={cx('title')}>{formatMessage(messages.title)}</span>
        <div className={cx('actions')}>
          {!isEmpty && (
            <div className={cx('icons')}>
              <i className={cx('search-icon')}>{Parser(searchIcon)}</i>
              <i className={cx('filters-icon')}>{Parser(filterIcon)}</i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

OrganizationsPageHeader.propTypes = {
  isEmpty: PropTypes.bool,
};

OrganizationsPageHeader.defaultProps = {
  isEmpty: false,
};
