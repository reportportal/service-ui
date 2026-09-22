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

  const dpr = window.devicePixelRatio || 1;

  root.querySelectorAll('path').forEach((path) => {
    const bounds = path.getBoundingClientRect();
    if (bounds.width < 50 || bounds.height >= 2) {
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

    if (Math.abs(y1 - y2) > 0.01) {
      return;
    }

    const screenY = ctm.d * y1 + ctm.f;
    const snappedScreenY = Math.round(screenY * dpr) / dpr;
    const snappedSvgY = (snappedScreenY - ctm.f) / ctm.d;
    const stroke = path.getAttribute('stroke');

    path.setAttribute('d', `M${x1} ${snappedSvgY}L${x2} ${snappedSvgY}`);

    // Match C3 x-axis domain (shape-rendering: auto) — crispEdges looks ~1 device
    // pixel thin on non-1x DPR, while C3's antialiased stroke reads closer to 2px.
    if (stroke === '#000000') {
      path.removeAttribute('shape-rendering');
    } else {
      path.setAttribute('shape-rendering', 'crispEdges');
    }
  });
};
