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

import { getNextSortingDirection, getOptionDirection } from './utils';

describe('dropdownSorting utils', () => {
  const name = { value: 'name', label: 'Name' };
  const createdAt = {
    value: 'createdAt',
    label: 'Creation date',
    defaultDirection: 'DESC' as const,
  };

  it('uses ASC for an option without a default direction', () => {
    expect(getOptionDirection(name)).toBe('ASC');
    expect(getNextSortingDirection(name, 'createdAt', 'DESC')).toBe('ASC');
  });

  it('uses the default direction of a newly selected option', () => {
    expect(getOptionDirection(createdAt)).toBe('DESC');
    expect(getNextSortingDirection(createdAt, 'name', 'ASC')).toBe('DESC');
  });

  it('reverses the direction when the selected option is picked again', () => {
    expect(getNextSortingDirection(name, 'name', 'ASC')).toBe('DESC');
    expect(getNextSortingDirection(createdAt, 'createdAt', 'DESC')).toBe('ASC');
  });
});
