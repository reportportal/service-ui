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

import { buildCenterLabelGraphic } from './centerLabelGraphic';

describe('buildCenterLabelGraphic', () => {
  test('renders just the value, centered, when there is no subtitle', () => {
    const graphics = buildCenterLabelGraphic({ value: 42 });

    expect(graphics).toHaveLength(1);
    expect(graphics[0]).toMatchObject({
      type: 'text',
      left: 'center',
      top: '50%',
      style: { text: '42', fontSize: 25 },
    });
  });

  test('adds a second, bold line below the value when a subtitle is given', () => {
    const graphics = buildCenterLabelGraphic({ value: 10, subtitle: 'SUM' });

    expect(graphics).toHaveLength(2);
    expect(graphics[0].style).toMatchObject({ text: '10', fontSize: 25 });
    expect(graphics[0].top).toBe('46%');
    expect(graphics[1].style).toMatchObject({
      text: 'SUM',
      fontSize: 23,
      fontWeight: 700,
      fill: '#666666',
    });
    expect(graphics[1].top).toBe('54%');
  });

  test('shrinks both lines in small-container mode', () => {
    const graphics = buildCenterLabelGraphic({ value: 10, subtitle: 'ISSUES', small: true });

    expect(graphics[0].style.fontSize).toBe(15);
    expect(graphics[1].style.fontSize).toBe(13);
  });

  test('shifts both lines to track a custom vertical center', () => {
    const graphics = buildCenterLabelGraphic({ value: 10, subtitle: 'SUM', centerY: 54 });

    expect(graphics[0].top).toBe('50%');
    expect(graphics[1].top).toBe('58%');
  });

  test('every graphic element is silent so it never intercepts clicks/hover meant for the chart', () => {
    const graphics = buildCenterLabelGraphic({ value: 5, subtitle: 'X' });

    graphics.forEach((graphic) => {
      expect(graphic.silent).toBe(true);
    });
  });

  test('accepts custom colors for the value and subtitle', () => {
    const graphics = buildCenterLabelGraphic({
      value: 1,
      subtitle: 'Y',
      valueColor: '#111111',
      subtitleColor: '#222222',
    });

    expect(graphics[0].style.fill).toBe('#111111');
    expect(graphics[1].style.fill).toBe('#222222');
  });
});
