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

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  LOGS_OVERSCAN,
  estimateRowSize,
  getScrollMargin,
  getScrollAnchor,
  getScrollAnchorShift,
} from './utils';

// frames to wait for the scroll element of the layout before the rows are rendered without it
const SCROLL_ELEMENT_WAIT_FRAMES = 30;

// Virtualises the rows of the logs grid inside of the scroll element of the page layout.
// layoutKey changes when the size of all rows changes (size preset, console view, markdown...).
// "virtual" is false when there is no scroll element to virtualise in: all rows are rendered then.
export const useLogsVirtualizer = ({ rows, layoutKey, logsSize, scrollContainer }) => {
  const bodyStartRef = useRef(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  // the layout fills its scroll element ref after its children are mounted
  const [scrollElementCheck, setScrollElementCheck] = useState(0);
  const enabled = !!scrollContainer && scrollElementCheck < SCROLL_ELEMENT_WAIT_FRAMES;

  const getScrollElement = useCallback(() => scrollContainer?.current ?? null, [scrollContainer]);
  const getItemKey = useCallback((index) => rows[index].key, [rows]);
  const estimateSize = useCallback(
    (index) => estimateRowSize(rows[index], logsSize),
    [rows, logsSize],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- nothing here is memoised on the returned functions
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize,
    getItemKey,
    overscan: LOGS_OVERSCAN,
    scrollMargin,
    enabled,
  });

  // The row at the top of the view stays in place when rows are added or removed above it ("load
  // previous" pages, steps opened above the view), as the browser anchoring does for a full list
  // (it is off for the virtualised grid). The new offset is applied before the rows to render are
  // computed, so the rows of the new position are rendered in the same frame.
  const scrollAnchorRef = useRef(null);
  const pendingScrollOffsetRef = useRef(null);
  if (enabled && scrollAnchorRef.current && scrollAnchorRef.current.rows !== rows) {
    // the measurements of the new rows are computed with the total size
    virtualizer.getTotalSize();
    const shift = getScrollAnchorShift(scrollAnchorRef.current, virtualizer.measurementsCache);
    if (shift !== 0 && virtualizer.scrollOffset !== null) {
      virtualizer.scrollOffset += shift;
      pendingScrollOffsetRef.current = virtualizer.scrollOffset;
    }
    scrollAnchorRef.current = { ...scrollAnchorRef.current, rows };
  }

  useLayoutEffect(() => {
    const scrollElement = enabled ? getScrollElement() : null;
    if (!scrollElement) {
      scrollAnchorRef.current = null;
      return;
    }
    if (pendingScrollOffsetRef.current !== null) {
      scrollElement.scrollTop = pendingScrollOffsetRef.current;
      pendingScrollOffsetRef.current = null;
    }
    scrollAnchorRef.current = getScrollAnchor(
      virtualizer.getVirtualItems(),
      virtualizer.scrollOffset,
      virtualizer.options.scrollMargin,
      rows,
    );
  });

  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const scrollElement = getScrollElement();
    const bodyStart = bodyStartRef.current;
    if (!scrollElement || !bodyStart) {
      const frame = requestAnimationFrame(() => setScrollElementCheck((check) => check + 1));
      return () => cancelAnimationFrame(frame);
    }

    // the grid starts below the toolbar and the item info: re-measured when the content resizes
    const updateScrollMargin = () => setScrollMargin(getScrollMargin(scrollElement, bodyStart));
    updateScrollMargin();
    const observer = new ResizeObserver(updateScrollMargin);
    Array.from(scrollElement.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [enabled, getScrollElement, scrollElementCheck]);

  const layoutKeyRef = useRef(layoutKey);
  useEffect(() => {
    if (layoutKeyRef.current !== layoutKey) {
      layoutKeyRef.current = layoutKey;
      // the sizes of the rows that are not rendered are not valid anymore
      virtualizer.measure();
    }
  }, [layoutKey, virtualizer]);

  return { virtualizer, bodyStartRef, virtual: enabled };
};
