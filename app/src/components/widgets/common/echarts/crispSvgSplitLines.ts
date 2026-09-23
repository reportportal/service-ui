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

import type { EChartsType } from 'echarts/core';

const HORIZONTAL_PATH_RE =
  /^M\s*([-\d.]+)\s+([-\d.]+)\s*L\s*([-\d.]+)\s+([-\d.]+)\s*$/i;

const COORD_EPS = 0.5;
const MIN_HORIZONTAL_SPAN = 50;

type LineShape = {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
};

/**
 * ZRender SVG painter keeps a VNode tree keyed by Displayable.id.
 * `elm` is the real SVG node for that displayable — the only ownership link
 * between an axis/split Line and its path (no public DOM attribute exists).
 */
type ZrSvgVNode = {
  key?: string | number;
  elm?: Element | null;
  children?: ZrSvgVNode[] | null;
};

type SvgPainter = {
  _mainVNode?: ZrSvgVNode;
  _oldVNode?: ZrSvgVNode;
};

const findSvgElmByZrId = (vnode: ZrSvgVNode | undefined, zrId: number): Element | null => {
  if (!vnode) {
    return null;
  }

  if (vnode.key === zrId || vnode.key === String(zrId)) {
    return vnode.elm ?? null;
  }

  const { children } = vnode;
  if (!children) {
    return null;
  }

  for (const child of children) {
    const found = findSvgElmByZrId(child, zrId);
    if (found) {
      return found;
    }
  }

  return null;
};

const findOwnedSvgElm = (painter: SvgPainter, zrId: number): Element | null =>
  findSvgElmByZrId(painter._mainVNode, zrId) ?? findSvgElmByZrId(painter._oldVNode, zrId);

const isHorizontalAxisLine = (shape: LineShape): boolean => {
  const { x1, y1, x2, y2 } = shape;
  if (
    typeof x1 !== 'number' ||
    typeof y1 !== 'number' ||
    typeof x2 !== 'number' ||
    typeof y2 !== 'number'
  ) {
    return false;
  }

  if (Math.abs(y1 - y2) > COORD_EPS) {
    return false;
  }

  return Math.abs(x2 - x1) >= MIN_HORIZONTAL_SPAN;
};

/**
 * ECharts SVG split lines sit on fractional coords and look soft with antialiasing.
 * crispEdges alone is uneven on non-1x DPR (e.g. Windows 125%). Snap each
 * horizontal grid stroke to the device pixel grid, then enable crispEdges.
 *
 * Only silent zrender `line` displayables (axis / splitLine) are touched; their
 * SVG nodes are resolved by Displayable.id → painter VNode.key, never by
 * guessing among path geometry or stroke color.
 */
export const crispSvgSplitLines = (chart: EChartsType): void => {
  const root = chart.getDom();
  const svg = root?.querySelector('svg');
  if (!root || !svg) {
    return;
  }

  const ctm = svg.getScreenCTM();
  if (!ctm || ctm.d === 0) {
    return;
  }

  const painter = chart.getZr().painter as SvgPainter;
  if (!painter._mainVNode && !painter._oldVNode) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const displayList = chart.getZr().storage.getDisplayList(true);

  displayList.forEach((el) => {
    if (el.type !== 'line' || !el.silent) {
      return;
    }

    const shape = (el as { shape?: LineShape }).shape;
    if (!shape || !isHorizontalAxisLine(shape)) {
      return;
    }

    // Ownership: Displayable.id === SVG VNode.key → VNode.elm (not geometry/stroke).
    const elm = findOwnedSvgElm(painter, el.id);
    if (elm?.tagName.toLowerCase() !== 'path') {
      return;
    }

    const d = elm.getAttribute('d');
    if (!d) {
      return;
    }

    const match = HORIZONTAL_PATH_RE.exec(d.trim());
    if (!match) {
      return;
    }

    const x1 = Number(match[1]);
    const y1 = Number(match[2]);
    const x2 = Number(match[3]);
    const y2 = Number(match[4]);

    if (Math.abs(y1 - y2) > COORD_EPS) {
      return;
    }

    const screenY = ctm.d * y1 + ctm.f;
    const snappedScreenY = Math.round(screenY * dpr) / dpr;
    const snappedSvgY = (snappedScreenY - ctm.f) / ctm.d;
    const stroke = typeof el.style?.stroke === 'string' ? el.style.stroke : '';

    elm.setAttribute('d', `M${x1} ${snappedSvgY}L${x2} ${snappedSvgY}`);

    // Match C3 x-axis domain (shape-rendering: auto) — crispEdges looks ~1 device
    // pixel thin on non-1x DPR, while C3's antialiased stroke reads closer to 2px.
    if (stroke === '#000000') {
      elm.removeAttribute('shape-rendering');
    } else {
      elm.setAttribute('shape-rendering', 'crispEdges');
    }
  });
};
