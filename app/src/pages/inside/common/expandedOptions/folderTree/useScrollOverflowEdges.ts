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

import { RefObject, useEffect, useRef } from 'react';

const SCROLL_EDGE_EPSILON_PX = 1;

export interface ScrollOverflowEdges {
  canScrollUp: boolean;
  canScrollDown: boolean;
  scrollbarGutter: number;
}

export const NO_SCROLL_OVERFLOW_EDGES: ScrollOverflowEdges = {
  canScrollUp: false,
  canScrollDown: false,
  scrollbarGutter: 0,
};

export const getScrollOverflowEdges = (element: HTMLElement): ScrollOverflowEdges => {
  const { scrollTop, clientHeight, scrollHeight, offsetWidth, clientWidth } = element;

  return {
    canScrollUp: scrollTop > SCROLL_EDGE_EPSILON_PX,
    canScrollDown: scrollTop + clientHeight < scrollHeight - SCROLL_EDGE_EPSILON_PX,
    scrollbarGutter: Math.max(0, offsetWidth - clientWidth),
  };
};

const areScrollOverflowEdgesEqual = (
  left: ScrollOverflowEdges,
  right: ScrollOverflowEdges,
): boolean =>
  left.canScrollUp === right.canScrollUp &&
  left.canScrollDown === right.canScrollDown &&
  left.scrollbarGutter === right.scrollbarGutter;

export const useScrollOverflowEdges = (
  scrollRef: RefObject<HTMLElement | null>,
  onChange: ((edges: ScrollOverflowEdges) => void) | undefined,
  contentSizeKey: number | string,
) => {
  const onChangeRef = useRef(onChange);
  const previousEdgesRef = useRef<ScrollOverflowEdges>(NO_SCROLL_OVERFLOW_EDGES);
  const hasOnChange = Boolean(onChange);

  onChangeRef.current = onChange;

  useEffect(() => {
    const emit = (edges: ScrollOverflowEdges) => {
      if (areScrollOverflowEdgesEqual(previousEdgesRef.current, edges)) {
        return;
      }

      previousEdgesRef.current = edges;
      onChangeRef.current?.(edges);
    };

    const element = scrollRef.current;

    if (!element || !onChangeRef.current) {
      emit(NO_SCROLL_OVERFLOW_EDGES);
      return;
    }

    const update = () => {
      emit(getScrollOverflowEdges(element));
    };

    update();

    element.addEventListener('scroll', update, { passive: true });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);

    const content = element.firstElementChild;
    if (content) {
      resizeObserver.observe(content);
    }

    return () => {
      element.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, [scrollRef, contentSizeKey, hasOnChange]);
};
