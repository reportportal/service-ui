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

import { COLOR_BLACK } from 'common/constants/colors';

const DEFAULT_SUBTITLE_COLOR = '#666666';

export interface CenterLabelGraphicOptions {
  /** Main value shown at the center (e.g. a donut's total, a gauge's rate). */
  value: string | number;
  /** Optional smaller line rendered below the value (e.g. "SUM", "ISSUES"). */
  subtitle?: string | null;
  /** Shrinks both lines for small chart containers, matching the old CSS "small-view" tier. */
  small?: boolean;
  valueColor?: string;
  subtitleColor?: string;
  /** Vertical center (0-100, as a % of the chart area) — match the pie/donut's own `center`. */
  centerY?: number;
  /** Vertical distance (in the same 0-100 % units as `centerY`) between the value/subtitle pair and their shared center. */
  gap?: number;
  /** Overrides the `small`-derived font size for the value line. */
  valueFontSize?: number;
  /** Overrides the `small`-derived font size for the subtitle line. */
  subtitleFontSize?: number;
}

/**
 * Builds an ECharts `graphic` array that renders a value (and optional subtitle)
 * centered over a pie/donut/gauge chart. The graphic is plain declarative option
 * state (no manual SVG/DOM patching after render), so it just updates with the
 * rest of the chart on `setOption`.
 *
 * Shared across donut-style charts (see `donutChart`) and reused by the
 * passing-rate charts (EPMRPP-121493 / EPMRPP-121494).
 */
export const buildCenterLabelGraphic = ({
  value,
  subtitle,
  small = false,
  valueColor = COLOR_BLACK,
  subtitleColor = DEFAULT_SUBTITLE_COLOR,
  centerY = 50,
  gap = 4,
  valueFontSize = small ? 15 : 25,
  subtitleFontSize = small ? 13 : 23,
}: CenterLabelGraphicOptions) => {

  const graphics = [
    {
      type: 'text',
      silent: true,
      z: 10,
      left: 'center',
      top: subtitle ? `${centerY - gap}%` : `${centerY}%`,
      style: {
        text: String(value),
        fontFamily: 'sans-serif',
        fontSize: valueFontSize,
        fontWeight: 700,
        fill: valueColor,
        align: 'center',
        verticalAlign: 'middle',
      },
    },
  ];

  if (subtitle) {
    graphics.push({
      type: 'text',
      silent: true,
      z: 10,
      left: 'center',
      top: `${centerY + gap}%`,
      style: {
        text: subtitle,
        fontFamily: 'sans-serif',
        fontSize: subtitleFontSize,
        fontWeight: 700,
        fill: subtitleColor,
        align: 'center',
        verticalAlign: 'middle',
      },
    });
  }

  return graphics;
};
