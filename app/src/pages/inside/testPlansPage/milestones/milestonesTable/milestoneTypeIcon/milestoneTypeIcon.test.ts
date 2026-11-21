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

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { TmsMilestoneType } from 'controllers/milestone';

import { MilestoneTypeIcon } from './milestoneTypeIcon';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('MilestoneTypeIcon', () => {
  test('renders a fallback icon for an unknown milestone type', () => {
    const container = document.createElement('div');
    const root: Root = createRoot(container);

    act(() => {
      root.render(createElement(MilestoneTypeIcon, { type: 'MAINTENANCE' as TmsMilestoneType }));
    });

    expect(container.querySelector('svg')).not.toBeNull();

    act(() => root.unmount());
  });
});
