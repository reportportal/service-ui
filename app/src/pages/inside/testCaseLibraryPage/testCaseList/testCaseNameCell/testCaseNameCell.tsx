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

import classNames from 'classnames/bind';
import { TagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import styles from './testCaseNameCell.scss';

const cx = classNames.bind(styles);

interface TestCaseNameCellProps {
  priority: TestCasePriority;
  name: string;
  tags: string[];
  onRowClick: () => void;
}

export const TestCaseNameCell = ({ priority, name, tags, onRowClick }: TestCaseNameCellProps) => {
  return (
    <div className={cx('name-section')} onClick={onRowClick}>
      <PriorityIcon priority={priority} className={cx('name-icon')} />

      <div className={cx('name-content')}>
        <div className={cx('test-name')} title={name}>
          {name}
        </div>
        <div className={cx('tags-section')}>
          <TagList tags={tags} isFullWidthMode />
        </div>
      </div>
    </div>
  );
};
