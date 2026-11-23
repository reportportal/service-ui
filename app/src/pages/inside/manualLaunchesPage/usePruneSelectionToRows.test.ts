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

import { act, createElement, useState } from 'react';
import { mount } from 'enzyme';
import { usePruneSelectionToRows } from './usePruneSelectionToRows';

type Rows = Array<{ id: number }>;

const renderSelection = (initialRows: Rows, initialSelection: number[]) => {
  const selections: number[][] = [];
  let keepVisibleSelection: (ids: number[]) => void = () => {};
  const capture = (selection: number[]) => {
    selections.push(selection);
  };
  const captureKeepSelection = (keep: (ids: number[]) => void) => {
    keepVisibleSelection = keep;
  };
  const Harness = ({ rows }: { rows: Rows }) => {
    const [selectedIds, setSelectedIds] = useState(initialSelection);

    captureKeepSelection(usePruneSelectionToRows(rows, setSelectedIds));
    capture(selectedIds);

    return null;
  };
  const wrapper = mount(createElement(Harness, { rows: initialRows })) as unknown as {
    setProps: (props: { rows: Rows }) => void;
  };

  return {
    setRows: (rows: Rows) => {
      act(() => {
        wrapper.setProps({ rows });
      });
    },
    lastSelection: () => selections[selections.length - 1],
    keepSelection: (ids: number[]) => {
      act(() => {
        keepVisibleSelection(ids);
      });
    },
  };
};

describe('usePruneSelectionToRows', () => {
  test('keeps the selection while the rows stay the same', () => {
    const { lastSelection } = renderSelection([{ id: 1 }, { id: 2 }], [1, 2]);

    expect(lastSelection()).toEqual([1, 2]);
  });

  test('drops selected ids that are not shown any more', () => {
    const { setRows, lastSelection } = renderSelection([{ id: 1 }, { id: 2 }, { id: 3 }], [1, 3]);

    setRows([{ id: 3 }, { id: 4 }]);

    expect(lastSelection()).toEqual([3]);
  });

  test('a selection restored after the rows changed keeps only the ids still shown', () => {
    const { setRows, keepSelection, lastSelection } = renderSelection(
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      [1, 2, 3],
    );

    // The rows change while the delete request is pending, then it restores its failed ids.
    setRows([{ id: 2 }, { id: 4 }]);
    keepSelection([1, 2]);

    expect(lastSelection()).toEqual([2]);
  });
});
