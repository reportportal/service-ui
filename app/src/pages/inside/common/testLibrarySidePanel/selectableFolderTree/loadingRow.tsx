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

import { CSSProperties } from 'react';
import { BubblesLoader } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import { ConnectorLines, INDENT_PX } from '../../expandedOptions/folder/connectorLines';
import styles from '../selectableFolder/selectableFolder.scss';

const cx = createClassnames(styles);

const BASE_INDENT_PX = 48;

interface LoadingRowProps {
  row: { depth: number; connectorDepths: number[]; isLastChild: boolean };
  nextRowDepth: number;
  className?: string;
  style?: CSSProperties;
}

export const LoadingRow = ({
  row,
  nextRowDepth,
  className = cx('selectable-folder__loader'),
  style,
}: LoadingRowProps) => (
  <div
    className={className}
    style={{ ...style, paddingLeft: BASE_INDENT_PX + row.depth * INDENT_PX }}
  >
    <ConnectorLines
      depth={row.depth}
      connectorDepths={row.connectorDepths}
      nextRowDepth={nextRowDepth}
      isLastChild={row.isLastChild}
      baseIndent={BASE_INDENT_PX}
      showCorner={false}
    />
    <BubblesLoader />
  </div>
);
