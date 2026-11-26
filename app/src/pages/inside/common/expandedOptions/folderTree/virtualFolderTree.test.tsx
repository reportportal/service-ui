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

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import type { TransformedFolder } from 'controllers/testCase';

import { VirtualFolderTree } from './virtualFolderTree';

const mockFolderProps = jest.fn();

jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getTotalSize: () => count * 32,
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({ index, size: 32, start: index * 32 })),
    scrollToIndex: jest.fn(),
  }),
}));
jest.mock('../folder/folder', () => ({
  Folder: (props: { node: { folder: { id: number } }; isPending?: boolean }) => {
    mockFolderProps(props.node.folder.id, props.isPending);

    return null;
  },
}));

const folders = [
  { id: 1, name: 'A', parentFolderId: null, countOfTestCases: 0, folders: [] },
  { id: 2, name: 'B', parentFolderId: null, countOfTestCases: 0, folders: [] },
] as unknown as TransformedFolder[];

describe('VirtualFolderTree', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    mockFolderProps.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  test('marks pending folders when drag-and-drop is disabled', () => {
    act(() =>
      root.render(
        <VirtualFolderTree
          folders={folders}
          expandedIds={[]}
          searchQuery=""
          activeFolderId={null}
          instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
          isSearchFilteredLoading={false}
          hasSearchFilteredFolders
          hasAnyMatch
          isFlatView
          pendingFolderIds={[2]}
          onFolderClick={jest.fn()}
          setAllTestCases={jest.fn()}
          onToggleFolder={jest.fn()}
        />,
      ),
    );

    expect(mockFolderProps).toHaveBeenCalledWith(1, false);
    expect(mockFolderProps).toHaveBeenCalledWith(2, true);
  });
});
