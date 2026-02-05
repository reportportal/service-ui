/*
 * Copyright 2026 EPAM Systems
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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import DOMPurify from 'dompurify';
import Link from 'redux-first-router-link';
import { Icon } from 'components/main/icon';
import { MarkdownViewer } from 'components/main/markdown';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';
import { LockedIcon } from 'pages/inside/common/lockedIcon';
import { useCanLockDashboard } from 'common/hooks';
import styles from './filterName.scss';

const cx = classNames.bind(styles);

const NameLink = ({ link, children }) =>
  link ? (
    <Link className={cx('name-link')} to={link}>
      {children}
    </Link>
  ) : (
    children
  );
NameLink.propTypes = {
  link: PropTypes.string,
  children: PropTypes.node,
};
NameLink.defaultProps = {
  link: '',
  children: null,
};

export const FilterName = ({
  userFilters,
  filter,
  onClickName,
  onEdit,
  search,
  showDesc,
  editable,
  isBold,
  isLink,
  nameLink,
}) => {
  const canLock = useCanLockDashboard();
  const isDisabled = filter.locked && !canLock;

  const getHighlightName = () => {
    if (!search.length) {
      return filter.name;
    }

    return filter.name.replace(
      new RegExp(search, 'i'),
      (match) => `<span class=${cx('name-highlight')}>${match}</span>`,
    );
  };

  return (
    <Fragment>
      <div className={cx('name-container')}>
        {filter.locked && (
          <LockedDashboardTooltip locked={filter.locked} variant="filter">
            <LockedIcon />
          </LockedDashboardTooltip>
        )}
        <span className={cx('name-wrapper')}>
          <NameLink link={nameLink}>
            <span
              className={cx('name', {
                bold: isBold,
                link: isLink || userFilters.find((item) => item.id === filter.id),
              })}
              onClick={() => onClickName(filter)}
            >
              {Parser(DOMPurify.sanitize(getHighlightName()))}
            </span>
          </NameLink>
          {editable && onEdit && (
            <LockedDashboardTooltip
              locked={filter.locked}
              variant="filter"
              wrapperClassName={cx('pencil-icon-wrapper')}
            >
              <Icon
                type="icon-pencil"
                onClick={() => onEdit(filter)}
                disabled={isDisabled}
                className={cx('pencil-icon')}
              />
            </LockedDashboardTooltip>
          )}
        </span>
      </div>
      {showDesc && <MarkdownViewer value={filter.description} />}
    </Fragment>
  );
};

FilterName.propTypes = {
  userFilters: PropTypes.array,
  filter: PropTypes.object,
  onClickName: PropTypes.func,
  onEdit: PropTypes.func,
  search: PropTypes.string,
  showDesc: PropTypes.bool,
  editable: PropTypes.bool,
  isBold: PropTypes.bool,
  isLink: PropTypes.bool,
  nameLink: PropTypes.object,
};
FilterName.defaultProps = {
  userFilters: [],
  filter: {},
  onClickName: () => {},
  onEdit: null,
  search: '',
  showDesc: true,
  editable: true,
  isBold: false,
  isLink: false,
  nameLink: null,
};
