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
import { PriorityIcon } from '../priorityIcon';
import { TestCaseStatus } from '../types';
import styles from '../testCaseCell.scss';

const cx = classNames.bind(styles);

interface TestCaseNameCellProps {
  status: TestCaseStatus;
  name: string;
  tags: string[];
}

export const TestCaseNameCell = ({ status, name, tags }: TestCaseNameCellProps) => {
  return (
    <div className={cx('name-section')}>
      <PriorityIcon status={status} />
      <div className={cx('name-content')}>
        <div className={cx('test-name')} title={name}>
          {name}
        </div>
        <div className={cx('tags-section')}>
          <TagList tags={tags} />
        </div>
      </div>
    </div>
  );
};
