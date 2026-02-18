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

import { ReactNode } from 'react';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TransformedFolder } from 'controllers/testCase';
import { TreeDragItem, TreeDropPosition } from '@reportportal/ui-kit/common';

export interface ExpandedOptionsProps {
  folders: TransformedFolder[];
  activeFolderId: number | null;
  setAllTestCases: () => void;
  onFolderClick: (id: number) => void;
  children: ReactNode;
  instanceKey?: TMS_INSTANCE_KEY;
  renderCreateFolderButton?: () => ReactNode;
  onMoveFolder?: (
    draggedItem: TreeDragItem,
    targetId: string | number,
    position: TreeDropPosition,
  ) => void;
  onDuplicateFolder?: (
    draggedItem: TreeDragItem,
    targetId: string | number,
    position: TreeDropPosition,
  ) => void;
}

export interface UseFolderSearchParams {
  folders: TransformedFolder[];
  expandedIds: number[];
  onToggleFolder: (folder: TransformedFolder) => void;
}
