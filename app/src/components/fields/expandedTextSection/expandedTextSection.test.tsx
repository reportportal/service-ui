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

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { ExpandedTextSection } from './expandedTextSection';

const LINE_HEIGHT = 20;

describe('ExpandedTextSection', () => {
  let container: HTMLDivElement;
  let root: Root;
  let contentHeight: number;

  const renderSection = (text: string) => {
    act(() => {
      root.render(
        <IntlProvider locale="en">
          <ExpandedTextSection text={text} defaultVisibleLines={5} />
        </IntlProvider>,
      );
    });
  };

  const getToggle = () => container.querySelector<HTMLButtonElement>('button');
  const getText = () => container.querySelector<HTMLDivElement>('.text-content');

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    jest
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockImplementation(() => contentHeight);
    jest
      .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
      .mockImplementation(() => Math.min(contentHeight, LINE_HEIGHT * 5));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  test('should not show the link when the text fits in 5 lines', () => {
    contentHeight = LINE_HEIGHT * 5;
    renderSection('Short text');

    expect(getToggle()).toBeNull();
  });

  test('should clamp a longer text and toggle between Show More and Show Less', () => {
    contentHeight = LINE_HEIGHT * 8;
    renderSection('Long text');

    expect(getText().className).toContain('truncated');
    expect(getToggle().textContent).toBe('Show More');

    act(() => getToggle().click());

    expect(getText().className).not.toContain('truncated');
    expect(getToggle().textContent).toBe('Show Less');

    act(() => getToggle().click());

    expect(getText().className).toContain('truncated');
    expect(getToggle().textContent).toBe('Show More');
  });
});
