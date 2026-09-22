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
/** Allows rematching after a previous device-pixel snap shifted path `d`. */
const Y_MATCH_EPS = 1;
const MIN_HORIZONTAL_SPAN = 50;

type AxisLineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
};

type LineShape = {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
};

const nearlyEqual = (a: number, b: number, eps: number): boolean => Math.abs(a - b) <= eps;

/**
 * ECharts axis split/axis lines are silent `line` elements. Series use `polyline`
 * (or non-silent paths). Ownership comes from the zrender display list, not stroke.
 */
const collectAxisOwnedHorizontalLines = (chart: EChartsType): AxisLineSegment[] => {
  const lines: AxisLineSegment[] = [];
  const displayList = chart.getZr().storage.getDisplayList(true);

  displayList.forEach((el) => {
    if (el.type !== 'line' || !el.silent) {
      return;
    }

    const shape = (el as { shape?: LineShape }).shape;
    if (!shape) {
      return;
    }

    const { x1, y1, x2, y2 } = shape;
    if (
      typeof x1 !== 'number' ||
      typeof y1 !== 'number' ||
      typeof x2 !== 'number' ||
      typeof y2 !== 'number'
    ) {
      return;
    }

    if (Math.abs(y1 - y2) > COORD_EPS) {
      return;
    }

    if (Math.abs(x2 - x1) < MIN_HORIZONTAL_SPAN) {
      return;
    }

    const stroke = el.style?.stroke;
    if (typeof stroke !== 'string' || !stroke) {
      return;
    }

    lines.push({ x1, y1, x2, y2, stroke });
  });

  return lines;
};

const pathMatchesAxisLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  line: AxisLineSegment,
): boolean => {
  if (Math.abs(y1 - y2) > COORD_EPS) {
    return false;
  }

  const yClose =
    nearlyEqual(y1, line.y1, Y_MATCH_EPS) && nearlyEqual(y2, line.y2, Y_MATCH_EPS);
  if (!yClose) {
    return false;
  }

  return (
    (nearlyEqual(x1, line.x1, COORD_EPS) && nearlyEqual(x2, line.x2, COORD_EPS)) ||
    (nearlyEqual(x1, line.x2, COORD_EPS) && nearlyEqual(x2, line.x1, COORD_EPS))
  );
};

/**
 * ECharts SVG split lines sit on fractional coords and look soft with antialiasing.
 * crispEdges alone is uneven on non-1x DPR (e.g. Windows 125%). Snap each
 * horizontal grid stroke to the device pixel grid, then enable crispEdges.
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

  const axisLines = collectAxisOwnedHorizontalLines(chart);
  if (axisLines.length === 0) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const matchedPaths = new Set<SVGPathElement>();

  root.querySelectorAll('path').forEach((path) => {
    if (matchedPaths.has(path)) {
      return;
    }

    const d = path.getAttribute('d');
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

    const axisLine = axisLines.find((line) => pathMatchesAxisLine(x1, y1, x2, y2, line));
    if (!axisLine) {
      return;
    }

    matchedPaths.add(path);

    const screenY = ctm.d * y1 + ctm.f;
    const snappedScreenY = Math.round(screenY * dpr) / dpr;
    const snappedSvgY = (snappedScreenY - ctm.f) / ctm.d;

    path.setAttribute('d', `M${x1} ${snappedSvgY}L${x2} ${snappedSvgY}`);

    // Match C3 x-axis domain (shape-rendering: auto) — crispEdges looks ~1 device
    // pixel thin on non-1x DPR, while C3's antialiased stroke reads closer to 2px.
    if (axisLine.stroke === '#000000') {
      path.removeAttribute('shape-rendering');
    } else {
      path.setAttribute('shape-rendering', 'crispEdges');
    }
  });
};
