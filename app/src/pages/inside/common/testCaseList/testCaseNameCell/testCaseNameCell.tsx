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

import { createClassnames, highlightText } from 'common/utils';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import type { TestCasePriority } from 'types/testCase';

import styles from './testCaseNameCell.scss';

const cx = createClassnames(styles);

interface TestCaseNameCellProps {
  displayId: string;
  priority: TestCasePriority;
  name: string;
  tags: string[];
  searchQuery?: string;
}

export const TestCaseNameCell = ({
  displayId,
  priority,
  name,
  tags,
  searchQuery,
}: TestCaseNameCellProps) => {
  const title = `${displayId} ${name}`;

  return (
    <div className={cx('name-section')}>
      {priority && <PriorityIcon priority={priority} />}
      <div className={cx('name-content')}>
        <div className={cx('test-name-row')} title={title}>
          <span className={cx('business-id')}>
            {highlightText(displayId, searchQuery || '', cx('highlight'))}
          </span>
          <span className={cx('test-name')}>
            {highlightText(name, searchQuery || '', cx('highlight'))}
          </span>
        </div>
        <div className={cx('tags-section')}>
          <AdaptiveTagList tags={tags} isShowAllView />
        </div>
      </div>
    </div>
  );
};
