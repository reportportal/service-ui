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

import { COLOR_CHART_SLIDER_ACCENT } from 'common/constants/colors';
import { ZOOM_CORNER_RADIUS, ZOOM_SHADOW_BOTTOM_GAP, ZOOM_SHADOW_SMOOTH } from './constants';

/*
 * DS 6 zoom slider details that ECharts has no public option for:
 * - selection (filler): teal outline + small corner radius
 * - mini chart (data shadow): smoothed curve, lifted a few px above the slider bottom
 * - frame: only top and bottom lines (no side borders)
 *
 * This relies on ECharts internals (`chart._componentsViews`, `view._displayables`, `view._size`),
 * verified against echarts 6.x (`SliderZoomView`). Every access is guarded, so if a future ECharts
 * version changes the structure the slider just falls back to its default look instead of throwing.
 * Re-check this file when upgrading echarts.
 */

const styledCharts = new WeakSet();

const styleZoomSlider = (view) => {
  const { filler, dataShadowSegs, sliderGroup } = view?._displayables ?? {};
  const [width, height] = view?._size ?? [];
  if (!filler || !sliderGroup || !Array.isArray(dataShadowSegs) || !width || !height) return;

  // values are set only when they differ, otherwise each change would trigger another render
  if (filler.shape.r !== ZOOM_CORNER_RADIUS) filler.setShape({ r: ZOOM_CORNER_RADIUS });
  if (filler.style.stroke !== COLOR_CHART_SLIDER_ACCENT) {
    filler.setStyle({ stroke: COLOR_CHART_SLIDER_ACCENT, lineWidth: 1 });
  }

  const scaleY = (height - ZOOM_SHADOW_BOTTOM_GAP) / height;
  dataShadowSegs.forEach((seg) => {
    // the slider group is flipped vertically, so a positive y moves the shadow up
    if (seg.y !== ZOOM_SHADOW_BOTTOM_GAP || seg.scaleY !== scaleY) {
      seg.attr({ y: ZOOM_SHADOW_BOTTOM_GAP, scaleY });
    }
    seg.eachChild((shape) => {
      if (shape.shape.smooth !== ZOOM_SHADOW_SMOOTH) shape.setShape({ smooth: ZOOM_SHADOW_SMOOTH });
    });
  });

  sliderGroup.eachChild((el) => {
    // the frame is the only silent stroked rect as wide as the slider
    const isFrame =
      el !== filler &&
      el.type === 'rect' &&
      el.silent &&
      el.shape.width === width &&
      el.style.stroke;
    // dash pattern along the rect path: top drawn, right side skipped, bottom drawn, left side skipped
    if (isFrame && !el.style.lineDash) el.setStyle({ lineDash: [width, height, width, height] });
  });
};

const applyToAllViews = (chart) => {
  const views = chart._componentsViews;
  if (!Array.isArray(views)) return;
  views.forEach((view) => {
    try {
      styleZoomSlider(view);
    } catch {
      // ECharts internals changed - keep the default slider look
    }
  });
};

// The listeners live as long as the chart instance (ECharts removes them on dispose).
export const applyZoomSliderStyles = (chart) => {
  if (!chart || styledCharts.has(chart)) return;
  styledCharts.add(chart);

  const apply = () => applyToAllViews(chart);
  chart.on('rendered', apply);
  chart.on('finished', apply);
  apply();
};
