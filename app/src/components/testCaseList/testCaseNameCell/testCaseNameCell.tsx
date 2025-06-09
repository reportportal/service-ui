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
import Parser from 'html-react-parser';
import { TagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import PriorityIcon from 'common/img/newIcons/priority-inline.svg';
import { TestCase, TestCaseStatus } from '../types';
import styles from '../testCaseCell.scss';

const cx = classNames.bind(styles);

interface StatusIconProps {
  status: TestCaseStatus;
}

const StatusIcon = ({ status }: StatusIconProps) => {
  const iconMap: Record<TestCaseStatus, React.ReactNode> = {
    passed: <div className={cx('priority-icon')}>{Parser(PriorityIcon)}</div>,
    failed: <div className={cx('priority-icon')}>{Parser(PriorityIcon)}</div>,
    skipped: <div className={cx('priority-icon')}>{Parser(PriorityIcon)}</div>,
    in_progress: <div className={cx('priority-icon')}>{Parser(PriorityIcon)}</div>,
  };

  return (
    <div className={cx('status-icon', `status-icon--${status}`)}>{iconMap[status] || '?'}</div>
  );
};

interface TestCaseNameCellProps {
  testCase: TestCase;
}

export const TestCaseNameCell = ({ testCase: testCaseData }: TestCaseNameCellProps) => {
  return (
    <div className={cx('name-section')}>
      <StatusIcon status={testCaseData.status} />
      <div className={cx('name-content')}>
        <div className={cx('test-name')} title={testCaseData.name}>
          {testCaseData.name}
        </div>
        <div className={cx('tags-section')}>
          <TagList tags={testCaseData.tags} isCustom />
        </div>
      </div>
    </div>
  );
};
