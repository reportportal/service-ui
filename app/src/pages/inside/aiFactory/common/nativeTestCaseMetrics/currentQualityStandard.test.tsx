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

import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { fetch } from 'common/utils';

import { CurrentQualityStandard } from './currentQualityStandard';

let mockProjectKey = 'example_project';
let mockActiveProjectKey = mockProjectKey;
let mockFeatureEnabled = true;

jest.mock('react-redux', () => ({
  useSelector: (selector: () => unknown) => selector(),
}));
jest.mock('controllers/aiFactory', () => ({
  useAiFactoryEnabled: () => mockFeatureEnabled,
}));
jest.mock('controllers/pages', () => ({
  urlOrganizationSlugSelector: () => 'example-org',
  urlProjectSlugSelector: () => 'example-project',
}));
jest.mock('controllers/project', () => ({
  projectKeySelector: () => mockProjectKey,
}));
jest.mock('controllers/user', () => ({
  activeProjectKeySelector: () => mockActiveProjectKey,
}));
jest.mock('common/urls', () => ({
  URLS: {
    projectQualityStandard: (projectKey: string) =>
      `../api/v1/project/${projectKey}/tms/quality-standard`,
  },
}));
jest.mock('common/utils', () => ({ fetch: jest.fn() }));
jest.mock('@reportportal/ui-kit', () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  BubblesLoader: () => null,
  Modal: ({
    title,
    children,
    cancelButton,
    onClose,
  }: {
    title: string;
    children: ReactNode;
    cancelButton: { children: ReactNode };
    onClose: () => void;
  }) => (
    <section role="dialog" aria-label={title}>
      {children}
      <button type="button" onClick={onClose}>
        {cancelButton.children}
      </button>
    </section>
  ),
}));

const fetchMock = fetch as jest.Mock<Promise<unknown>, [string, { signal: AbortSignal }, boolean]>;
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
const fixture = {
  id: 1,
  name: 'Example quality standard',
  description: 'Current project criteria',
  criteria: [
    { id: 2, name: 'Coverage', maxPoints: 15, sequence: 1 },
    { id: 1, name: 'Clarity', maxPoints: 20, sequence: 0 },
  ],
};

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

const render = (testCaseId = 31) =>
  act(() =>
    root.render(
      <IntlProvider locale="en">
        <CurrentQualityStandard testCaseId={testCaseId} />
      </IntlProvider>,
    ),
  );

const click = async (name: string) => {
  const button = Array.from(container.querySelectorAll('button')).find(
    ({ textContent }) => textContent === name,
  );
  if (!button) throw new Error(`Missing button: ${name}`);

  await act(() => {
    button.click();
    return Promise.resolve();
  });
};

beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});
afterAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});
beforeEach(() => {
  container = document.createElement('div');
  root = createRoot(container);
  fetchMock.mockReset();
  mockProjectKey = 'example_project';
  mockActiveProjectKey = mockProjectKey;
  mockFeatureEnabled = true;
});
afterEach(() => {
  act(() => root.unmount());
});

test('loads the current rubric on demand and shows criteria in sequence order', async () => {
  fetchMock.mockResolvedValue({ status: 200, data: fixture });
  render();
  expect(fetchMock).not.toHaveBeenCalled();

  await click('Current project Quality Standard');

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith(
    '../api/v1/project/example_project/tms/quality-standard',
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
    true,
  );
  expect(container.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe(
    'Current project Quality Standard',
  );
  expect(container.textContent).toContain('Example quality standard');
  expect(container.textContent).toContain('Current project criteria');
  expect(Array.from(container.querySelectorAll('li'), ({ textContent }) => textContent)).toEqual([
    'Clarity: up to 20 points',
    'Coverage: up to 15 points',
  ]);
});

test('treats an unconfigured rubric as unavailable and does not offer a retry', async () => {
  fetchMock.mockResolvedValue({ status: 404 });
  render();

  await click('Current project Quality Standard');

  expect(container.textContent).toContain('No Quality Standard is configured for this project.');
  expect(container.textContent).not.toContain('Retry');
});

test('offers a retry after the server returns an invalid response', async () => {
  fetchMock
    .mockResolvedValueOnce({ status: 200, data: { ...fixture, criteria: [{ id: 1 }] } })
    .mockResolvedValueOnce({ status: 200, data: fixture });
  render();

  await click('Current project Quality Standard');
  expect(container.querySelector('[role="alert"]')?.textContent).toContain(
    'The project Quality Standard could not be loaded.',
  );
  await click('Retry');

  expect(container.textContent).toContain('Example quality standard');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('aborts on close and stale project changes without automatically issuing another request', async () => {
  fetchMock.mockReturnValue(new Promise(() => {}));
  render();

  await click('Current project Quality Standard');
  const closeRequest = fetchMock.mock.calls[0][1].signal;
  await click('Close');
  expect(closeRequest.aborted).toBe(true);
  await click('Current project Quality Standard');
  const staleRequest = fetchMock.mock.calls[1][1].signal;
  mockActiveProjectKey = 'next_project';
  render();
  expect(staleRequest.aborted).toBe(true);
  expect(container.textContent).not.toContain('Current project Quality Standard');
  mockProjectKey = mockActiveProjectKey;
  render();

  expect(container.querySelector('[role="dialog"]')).toBeNull();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('does not show the action when the feature is off', () => {
  mockFeatureEnabled = false;
  render();

  expect(container.textContent).toBe('');
  expect(fetchMock).not.toHaveBeenCalled();
});
