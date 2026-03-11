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

import { CheckmarkIcon, DragNDropIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';

import { DepthAwareCheckbox } from '../depthAwareCheckbox';

import styles from './selectableTestCase.scss';

const cx = createClassnames(styles);

interface SelectableTestCaseItemProps {
  testCase: TestCase;
  isSelected: boolean;
  isAddedToTestPlan: boolean;
  depth: number;
  onToggle: (id: number) => void;
}

export const SelectableTestCase = ({
  testCase,
  isSelected,
  isAddedToTestPlan,
  depth,
  onToggle,
}: SelectableTestCaseItemProps) => {
  const handleChange = () => {
    if (!isAddedToTestPlan) {
      onToggle(testCase.id);
    }
  };

  return (
    <li className={cx('selectable-test-case')}>
      <div className={cx('selectable-test-case__content')}>
        {!isAddedToTestPlan && (
          <DepthAwareCheckbox
            depth={depth}
            checked={isSelected || isAddedToTestPlan}
            disabled={isAddedToTestPlan}
            onChange={handleChange}
          />
        )}
        <span
          className={cx('selectable-test-case__name', {
            'selectable-test-case__name--added': isAddedToTestPlan,
          })}
          title={testCase.name}
        >
          {testCase.name}
        </span>
        <span className={cx('selectable-test-case__indicator')}>
          {isAddedToTestPlan ? <CheckmarkIcon /> : <DragNDropIcon />}
        </span>
      </div>
    </li>
  );
};
