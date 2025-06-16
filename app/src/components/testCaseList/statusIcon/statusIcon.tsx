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

import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import PriorityInlineIcon from 'common/img/newIcons/priority-inline.svg';
import { TestCaseStatus } from '../types';
import styles from '../testCaseCell.scss';

const cx = classNames.bind(styles);

interface StatusIconProps {
  status: TestCaseStatus;
}

const iconMap: Record<TestCaseStatus, React.ReactNode> = {
  low: (
    <div className={cx('priority-icon', 'priority-icon--low')}>{Parser(PriorityInlineIcon)}</div>
  ),
  normal: (
    <div className={cx('priority-icon', 'priority-icon--normal')}>{Parser(PriorityInlineIcon)}</div>
  ),
  high: (
    <div className={cx('priority-icon', 'priority-icon--high')}>{Parser(PriorityInlineIcon)}</div>
  ),
};

export const StatusIcon = ({ status }: StatusIconProps) => {
  return <div className={cx('status-icon', `status-icon--${status}`)}>{iconMap[status]}</div>;
};
