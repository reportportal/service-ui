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

import { createClassnames } from 'common/utils';

import styles from './folder.scss';

const cx = createClassnames(styles);

export const INDENT_PX = 24;
export const ROW_HEIGHT_PX = 36;

interface ConnectorLinesProps {
  depth: number;
  connectorDepths: number[];
  nextRowDepth: number;
  isLastChild: boolean;
  baseIndent?: number;
  showCorner?: boolean;
}

export const ConnectorLines = ({
  depth,
  connectorDepths,
  nextRowDepth,
  isLastChild,
  baseIndent = 0,
  showCorner = true,
}: ConnectorLinesProps) => {
  const getConnectorLeft = (connectorDepth: number, offset: number) =>
    baseIndent + (connectorDepth - 1) * INDENT_PX - offset;

  return (
    <>
      {connectorDepths.map((connectorDepth) => (
        <div
          key={connectorDepth}
          className={cx('folders-tree__connector', 'folders-tree__connector-vertical', {
            'folders-tree__connector-vertical--last': nextRowDepth < connectorDepth,
          })}
          style={{ left: getConnectorLeft(connectorDepth, 8) }}
        />
      ))}
      {showCorner && depth > 0 && (
        <>
          <div
            className={cx('folders-tree__connector', 'folders-tree__connector-corner', {
              'folders-tree__connector-corner--last': isLastChild,
            })}
            style={{ left: getConnectorLeft(depth, 8) }}
          />
          <div
            className={cx('folders-tree__connector', 'folders-tree__connector-horizontal')}
            style={{
              left: getConnectorLeft(depth, 7),
              width: 15,
            }}
          />
        </>
      )}
    </>
  );
};
