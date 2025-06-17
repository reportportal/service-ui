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
import { TestCasePriority } from '../types';
import styles from './priorityIcon.scss';

const cx = classNames.bind(styles);

interface PriorityIconProps {
  priority: TestCasePriority;
}

const parsedIcon = Parser(PriorityInlineIcon);

const getPriorityClass = (priority: TestCasePriority) =>
  cx('priority-icon', `priority-icon--${priority}`);

export const PriorityIcon = ({ priority }: PriorityIconProps) => {
  return (
    <div className={cx('priority-icon-block', `priority-icon-block--${priority}`)}>
      <div className={getPriorityClass(priority)}>{parsedIcon}</div>
    </div>
  );
};
