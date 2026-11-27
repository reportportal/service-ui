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

import { renderToStaticMarkup } from 'react-dom/server';

import { STATUS_TYPES } from '../constants';
import { renderPriorityOption } from './filterSidePanel';

const renderOption = (value: string, label: string) => {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(
    <>{renderPriorityOption({ option: { value, label } })}</>,
  );

  return container.querySelector('.priority-option');
};

describe('renderPriorityOption', () => {
  test.each(Object.values(STATUS_TYPES))('renders the %s icon before the label', (priority) => {
    const option = renderOption(priority, `Label ${priority}`);
    const [icon, label] = Array.from(option.children);

    expect(option.children).toHaveLength(2);
    expect(icon.classList.contains('priority-icon')).toBe(true);
    expect(icon.querySelector('svg')).not.toBeNull();
    expect(label.classList.contains('priority-option__label')).toBe(true);
    expect(label.textContent).toBe(`Label ${priority}`);
  });

  test('renders a different icon for every priority', () => {
    const icons = Object.values(STATUS_TYPES).map(
      (priority) => renderOption(priority, priority).querySelector('.priority-icon').innerHTML,
    );

    expect(new Set(icons).size).toBe(icons.length);
  });

  test('renders only the label for a value that is not a priority', () => {
    const option = renderOption('unknown', 'Unknown');

    expect(option.querySelector('.priority-icon')).toBeNull();
    expect(option.textContent).toBe('Unknown');
  });
});
