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
import { createRoot, Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { FolderTreeViewMode } from 'common/utils/folderUtils';

import { FolderTreeFooter } from './folderTreeFooter';

type FolderTreeFooterProps = Parameters<typeof FolderTreeFooter>[0];

const ALL_VIEW_MODES = [
  FolderTreeViewMode.TREE,
  FolderTreeViewMode.FLAT,
  FolderTreeViewMode.SUBFOLDERS,
];

let container: HTMLDivElement;
let root: Root;

const renderFooter = (props: Partial<FolderTreeFooterProps> = {}) => {
  const mergedProps = {
    viewMode: FolderTreeViewMode.TREE,
    viewModes: ALL_VIEW_MODES,
    isExpandAllDisabled: false,
    isCollapseAllDisabled: false,
    onViewModeChange: jest.fn(),
    onExpandAll: jest.fn(),
    onCollapseAll: jest.fn(),
    onTrackViewControl: jest.fn(),
    ...props,
  };

  act(() => {
    root.render(
      <IntlProvider locale="en">
        <FolderTreeFooter {...mergedProps} />
      </IntlProvider>,
    );
  });

  return mergedProps;
};

const getOption = (label: string) =>
  container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);

describe('FolderTreeFooter', () => {
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

  test('renders the three view modes as icon-only options with the selected one pressed', () => {
    renderFooter({ viewMode: FolderTreeViewMode.SUBFOLDERS });

    expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('View mode');
    expect(getOption('Tree')?.getAttribute('aria-pressed')).toBe('false');
    expect(getOption('Flat view')?.getAttribute('aria-pressed')).toBe('false');
    expect(getOption('All test cases within subfolders')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  test('shows Expand All and Collapse All in Tree and subfolders modes, not in Flat view', () => {
    renderFooter();
    expect(container.textContent).toContain('Expand All');

    renderFooter({ viewMode: FolderTreeViewMode.SUBFOLDERS });
    expect(container.textContent).toContain('Collapse All');

    renderFooter({ viewMode: FolderTreeViewMode.FLAT });
    expect(container.textContent).not.toContain('Expand All');
  });

  test('changes the view mode and tracks only the Flat view activation', () => {
    const props = renderFooter();

    act(() => getOption('All test cases within subfolders')?.click());
    expect(props.onViewModeChange).toHaveBeenLastCalledWith(FolderTreeViewMode.SUBFOLDERS);
    expect(props.onTrackViewControl).not.toHaveBeenCalled();

    renderFooter({ ...props, viewMode: FolderTreeViewMode.SUBFOLDERS });
    act(() => getOption('Flat view')?.click());
    expect(props.onViewModeChange).toHaveBeenLastCalledWith(FolderTreeViewMode.FLAT);
    expect(props.onTrackViewControl).toHaveBeenCalledWith('flat_view_active');
  });

  test('offers only the given view modes', () => {
    renderFooter({ viewModes: [FolderTreeViewMode.TREE, FolderTreeViewMode.FLAT] });

    expect(container.querySelectorAll('button[aria-pressed]')).toHaveLength(2);
    expect(getOption('All test cases within subfolders')).toBeNull();
  });
});
