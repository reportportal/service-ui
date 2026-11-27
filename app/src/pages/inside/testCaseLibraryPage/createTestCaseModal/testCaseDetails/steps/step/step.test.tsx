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

import { Step } from './step';

jest.mock('components/fields/expandedTextSection', () => ({
  ExpandedTextSection: ({ text }: { text: string }) => <div>{text}</div>,
}));
jest.mock('pages/inside/common/attachmentList', () => ({ AttachmentList: () => null }));

describe('Step (read mode)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
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

  test('should show Instructions and Expected result in one row and a dash for an empty field', () => {
    act(() => {
      root.render(
        <IntlProvider locale="en">
          <Step stepId={1} isReadMode instructions="Open the login page" />
        </IntlProvider>,
      );
    });

    const fields = Array.from(container.querySelectorAll('.fields-row > .field-group')).map(
      (field) => field.textContent,
    );

    expect(fields).toEqual(['InstructionsOpen the login page', 'Expected result—']);
  });
});
