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

import { COLOR_ALMOST_BLACK, COLOR_TEXT_SECONDARY } from 'common/constants/colors';

const FONT_FAMILY = 'Roboto';
const FONT_WEIGHT = 400;

export interface CenterLabelGraphicOptions {
  /** Main value shown at the center (e.g. a donut's total). */
  value: string | number;
  /** Optional smaller line below the value (e.g. "Sum", "Issues"). */
  subtitle?: string | null;
  /** Shrinks both lines for small chart containers / preview. */
  small?: boolean;
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
 * centered over a donut chart. Declarative option state — updates with `setOption`.
 *
 * Used by Launch execution / Overall statistics Donut view.
 */
export const buildCenterLabelGraphic = ({
  value,
  subtitle,
  small = false,
  centerY = 50,
  gap = 4,
  valueFontSize = small ? 15 : 24,
  subtitleFontSize = 13,
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
        fontFamily: FONT_FAMILY,
        fontSize: valueFontSize,
        fontWeight: FONT_WEIGHT,
        fill: COLOR_ALMOST_BLACK,
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
        fontFamily: FONT_FAMILY,
        fontSize: subtitleFontSize,
        fontWeight: FONT_WEIGHT,
        fill: COLOR_TEXT_SECONDARY,
        align: 'center',
        verticalAlign: 'middle',
      },
    });
  }

  return graphics;
};
