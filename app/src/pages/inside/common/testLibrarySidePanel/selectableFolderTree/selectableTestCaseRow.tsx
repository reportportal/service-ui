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

import { useCallback, CSSProperties } from 'react';

import { createClassnames } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';

import { usePanelActions, usePanelState } from '../testLibraryPanelContext';
import { SelectableTestCase } from '../selectableTestCase';
import { ConnectorLines, INDENT_PX } from '../../expandedOptions/folder/connectorLines';
import type { FlatSelectableRow } from './useFlattenedSelectableTree';

import treeStyles from '../../expandedOptions/folder/folder.scss';
import selectableStyles from '../selectableFolder/selectableFolder.scss';

const cx = createClassnames(selectableStyles, treeStyles);

const BASE_INDENT_PX = 48;

type TestCaseRow = Extract<FlatSelectableRow, { type: 'testCase' }>;

interface SelectableTestCaseRowProps {
  row: TestCaseRow;
  nextRowDepth: number;
  style?: CSSProperties;
}

export const SelectableTestCaseRow = ({ row, nextRowDepth, style }: SelectableTestCaseRowProps) => {
  const { testCase, folderId, depth, isAddedToTestPlan, connectorDepths } = row;
  const { toggleTestCasesSelection } = usePanelActions();
  const { selectedIds, selectedTestCases } = usePanelState();
  const { canManageTestCases } = useUserPermissions();

  const handleToggle = useCallback(
    (testCaseId: number) => {
      toggleTestCasesSelection([testCaseId]);
    },
    [toggleTestCasesSelection],
  );

  return (
    <div className={cx('folders-tree__item')} style={{ ...style, paddingLeft: BASE_INDENT_PX + depth * INDENT_PX }}>
      <ConnectorLines
        depth={depth}
        connectorDepths={connectorDepths}
        nextRowDepth={nextRowDepth}
        isLastChild={row.isLastChild}
        baseIndent={BASE_INDENT_PX}
        showCorner={false}
      />
      <SelectableTestCase
        testCase={testCase}
        isSelected={selectedIds.has(testCase.id)}
        isAddedToTestPlan={isAddedToTestPlan}
        depth={depth}
        folderId={folderId}
        canDrag={canManageTestCases && !isAddedToTestPlan}
        selectedTestCases={selectedTestCases}
        onToggle={handleToggle}
      />
    </div>
  );
};
