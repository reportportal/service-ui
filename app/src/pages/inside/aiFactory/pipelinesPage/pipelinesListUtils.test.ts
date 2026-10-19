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

import { matchesPipelineName } from './pipelinesListUtils';

describe('matchesPipelineName', () => {
  test('matches everything for an empty search', () => {
    expect(matchesPipelineName('Test case generation', '')).toBe(true);
  });

  test('matches the pipeline name without case sensitivity or surrounding whitespace', () => {
    expect(matchesPipelineName('Test case generation', ' GENERATION ')).toBe(true);
  });

  test('does not match an iteration number', () => {
    expect(matchesPipelineName('Test case generation', '#1')).toBe(false);
  });

  test('does not match a requirement title', () => {
    expect(matchesPipelineName('Test case generation', 'empty state')).toBe(false);
  });

  test('does not match unrelated text', () => {
    expect(matchesPipelineName('Test case generation', 'nothing here')).toBe(false);
  });
});
