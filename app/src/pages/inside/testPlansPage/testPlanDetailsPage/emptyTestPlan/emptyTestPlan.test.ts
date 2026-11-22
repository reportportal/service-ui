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
import { IntlProvider } from 'react-intl';

import { EmptyTestPlan } from './emptyTestPlan';

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('EmptyTestPlan', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (props: Parameters<typeof EmptyTestPlan>[0]) =>
    act(() => {
      root.render(
        createElement(IntlProvider, { locale: 'en' }, createElement(EmptyTestPlan, props)),
      );
    });

  beforeEach(() => {
    container = document.createElement('div');
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  test('offers adding tests from the library to users who can manage test cases', () => {
    render({ onOpenTestLibrary: jest.fn() });

    expect(
      container.querySelector('[data-automation-id="addTestsFromLibraryButton"]'),
    ).not.toBeNull();
  });

  test('hides the call to action from users who cannot add test cases', () => {
    render({});

    expect(container.querySelector('[data-automation-id="addTestsFromLibraryButton"]')).toBeNull();
  });
});
