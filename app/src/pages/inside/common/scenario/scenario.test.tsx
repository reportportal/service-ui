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

import { Scenario } from './scenario';

jest.mock('components/fields/expandedTextSection', () => ({
  ExpandedTextSection: ({ text }: { text: string }) => <div data-testid="expanded">{text}</div>,
}));

describe('Scenario (text-based)', () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderScenario = (props: Parameters<typeof Scenario>[0]) => {
    act(() => {
      root.render(
        <IntlProvider locale="en">
          <Scenario {...props} />
        </IntlProvider>,
      );
    });
  };

  const getCards = () => Array.from(container.querySelectorAll('.scenario__card'));

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

  test('should show Precondition on its own card and Instructions | Expected result on a second card', () => {
    renderScenario({
      precondition: 'Logged in',
      instructions: 'Open page',
      expectedResult: 'Page open',
    });

    const [preconditionCard, columnsCard] = getCards();

    expect(getCards()).toHaveLength(2);
    expect(preconditionCard.textContent).toBe('PreconditionLogged in');
    expect(columnsCard.querySelectorAll('.scenario__field')).toHaveLength(2);
    expect(columnsCard.querySelector('.scenario__field--divided').textContent).toBe(
      'InstructionsOpen page',
    );
  });

  test('should keep the label and show a dash for an empty field', () => {
    renderScenario({ instructions: 'Open page' });

    const fields = Array.from(container.querySelectorAll('.scenario__field')).map(
      (field) => field.textContent,
    );

    expect(fields).toEqual(['Precondition—', 'InstructionsOpen page', 'Expected result—']);
  });

  test('should use the collapsible text only when it is enabled', () => {
    renderScenario({ instructions: 'Open page' });

    expect(container.querySelector('[data-testid="expanded"]')).toBeNull();

    renderScenario({ instructions: 'Open page', isTextCollapsible: true });

    expect(container.querySelectorAll('[data-testid="expanded"]')).toHaveLength(1);
  });
});
