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

import { useEffect, CSSProperties, MutableRefObject } from 'react';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';

import { LoadingRow } from './loadingRow';
import styles from '../selectableFolder/selectableFolder.scss';

const cx = createClassnames(styles);

interface LoadMoreRowProps {
  row: { folderId: number; depth: number; connectorDepths: number[]; isLastChild: boolean };
  nextRowDepth: number;
  fetchNextPageMapRef: MutableRefObject<Map<number, VoidFn>>;
  style?: CSSProperties;
}

export const LoadMoreRow = ({ row, nextRowDepth, fetchNextPageMapRef, style }: LoadMoreRowProps) => {
  const { folderId } = row;

  useEffect(() => {
    fetchNextPageMapRef.current.get(folderId)?.();
  }, [folderId, fetchNextPageMapRef]);

  return (
    <LoadingRow
      row={row}
      nextRowDepth={nextRowDepth}
      className={cx('selectable-folder__load-more')}
      style={style}
    />
  );
};
