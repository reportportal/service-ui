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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { PopoverControl } from 'pages/common/popoverControl';
import { TagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import PriorityIcon from 'common/img/newIcons/priority-inline.svg';
import { messages } from './messages';
import styles from './testCaseCard.scss';

const cx = classNames.bind(styles);

const StatusIcon = ({ status }) => {
  const iconMap = {
    passed: <div className={cx('priority-icon')}>{Parser(PriorityIcon)}</div>,
    failed: '✗',
    skipped: '○',
    in_progress: '⟳',
  };

  return (
    <div className={cx('status-icon', `status-icon--${status}`)}>{iconMap[status] || '?'}</div>
  );
};

StatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
};

export const TestCaseCard = ({ testCase, onEdit, onDelete, onDuplicate, onMove }) => {
  const { formatMessage } = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      label: formatMessage(messages.duplicate),
      onClick: () => onDuplicate(testCase),
    },
    {
      label: formatMessage(messages.editTestCase),
      onClick: () => onEdit(testCase),
    },
    {
      label: formatMessage(messages.moveTestCaseTo),
      onClick: () => onMove(testCase),
    },
    {
      label: formatMessage(messages.deleteTestCase),
      onClick: () => onDelete(testCase),
      className: 'delete-menu-item',
    },
  ];

  return (
    <div className={cx('test-case-card')}>
      <div className={cx('card-content')}>
        <div className={cx('name-column')}>
          <div className={cx('name-section')}>
            <StatusIcon status={testCase.status} />
            <div className={cx('name-content')}>
              <div className={cx('test-name')} title={testCase.name}>
                {testCase.name}
              </div>
              <div className={cx('tags-section')}>
                <TagList tags={testCase.tags} isCustom />
              </div>
            </div>
          </div>
        </div>

        <div className={cx('execution-column')}>
          <div className={cx('execution-content')}>
            <div className={cx('execution-time')}>{testCase.lastExecution}</div>
            <div className={cx('menu-section')}>
              <PopoverControl
                items={menuItems}
                placement="bottom-end"
                isOpened={isMenuOpen}
                setIsOpened={setIsMenuOpen}
              >
                <button className={cx('dots-menu-trigger')}>⋯</button>
              </PopoverControl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TestCaseCard.propTypes = {
  testCase: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    lastExecution: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
  onMove: PropTypes.func,
};

TestCaseCard.defaultProps = {
  onEdit: () => {},
  onDelete: () => {},
  onDuplicate: () => {},
  onMove: () => {},
};
