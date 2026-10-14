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

import { getScrollOverflowEdges } from './useScrollOverflowEdges';

const createScrollElement = ({
  scrollTop,
  clientHeight,
  scrollHeight,
  offsetWidth = 200,
  clientWidth = 200,
}: {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
  offsetWidth?: number;
  clientWidth?: number;
}): HTMLElement =>
  ({
    scrollTop,
    clientHeight,
    scrollHeight,
    offsetWidth,
    clientWidth,
  }) as HTMLElement;

describe('getScrollOverflowEdges', () => {
  it('reports no overflow when content fits the viewport', () => {
    expect(
      getScrollOverflowEdges(
        createScrollElement({ scrollTop: 0, clientHeight: 200, scrollHeight: 200 }),
      ),
    ).toEqual({ canScrollUp: false, canScrollDown: false, scrollbarGutter: 0 });
  });

  it('reports bottom overflow at the top of a tall list', () => {
    expect(
      getScrollOverflowEdges(
        createScrollElement({ scrollTop: 0, clientHeight: 200, scrollHeight: 500 }),
      ),
    ).toEqual({ canScrollUp: false, canScrollDown: true, scrollbarGutter: 0 });
  });

  it('reports top overflow at the bottom of a tall list', () => {
    expect(
      getScrollOverflowEdges(
        createScrollElement({ scrollTop: 300, clientHeight: 200, scrollHeight: 500 }),
      ),
    ).toEqual({ canScrollUp: true, canScrollDown: false, scrollbarGutter: 0 });
  });

  it('reports both edges when scrolled in the middle', () => {
    expect(
      getScrollOverflowEdges(
        createScrollElement({ scrollTop: 100, clientHeight: 200, scrollHeight: 500 }),
      ),
    ).toEqual({ canScrollUp: true, canScrollDown: true, scrollbarGutter: 0 });
  });

  it('reports scrollbar gutter width', () => {
    expect(
      getScrollOverflowEdges(
        createScrollElement({
          scrollTop: 0,
          clientHeight: 200,
          scrollHeight: 500,
          offsetWidth: 220,
          clientWidth: 205,
        }),
      ),
    ).toEqual({ canScrollUp: false, canScrollDown: true, scrollbarGutter: 15 });
  });
});
