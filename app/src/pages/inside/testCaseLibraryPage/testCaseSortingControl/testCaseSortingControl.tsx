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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SortIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { DropdownSorting } from 'components/dropdownSorting';
import {
  TEST_CASE_SORTING_DEFAULT_DIRECTIONS,
  TEST_CASE_SORTING_FIELDS,
  TestCaseSorting,
} from 'controllers/testCase';
import type { SortingDirection } from 'controllers/sorting/types';

import { messages } from './messages';

import styles from './testCaseSortingControl.scss';

const cx = createClassnames(styles);

interface TestCaseSortingControlProps {
  sorting: TestCaseSorting;
  onChange: (sorting: TestCaseSorting) => void;
}

export const TestCaseSortingControl = ({ sorting, onChange }: TestCaseSortingControlProps) => {
  const { formatMessage } = useIntl();

  const options = useMemo(
    () => [
      {
        value: TEST_CASE_SORTING_FIELDS.CREATED_AT,
        label: formatMessage(messages.creationDate),
        defaultDirection: TEST_CASE_SORTING_DEFAULT_DIRECTIONS[TEST_CASE_SORTING_FIELDS.CREATED_AT],
      },
      {
        value: TEST_CASE_SORTING_FIELDS.NAME,
        label: formatMessage(messages.name),
        defaultDirection: TEST_CASE_SORTING_DEFAULT_DIRECTIONS[TEST_CASE_SORTING_FIELDS.NAME],
      },
    ],
    [formatMessage],
  );

  const handleChange = ({ value, direction }: { value: string; direction: SortingDirection }) => {
    const field = Object.values(TEST_CASE_SORTING_FIELDS).find((item) => item === value);

    if (field) {
      onChange({ field, direction });
    }
  };

  return (
    <div className={cx('test-case-sorting-control')}>
      <DropdownSorting
        options={options}
        value={sorting.field}
        direction={sorting.direction}
        onChange={handleChange}
        icon={<SortIcon />}
      />
    </div>
  );
};
