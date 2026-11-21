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

import { sanitizePluginHtml, isHttpUrl } from './sanitizePluginHtml';

const toDom = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

describe('sanitizePluginHtml', () => {
  test('keeps text, basic formatting and lists', () => {
    expect(sanitizePluginHtml('<p>Sync <b>issues</b></p><ul><li>one</li></ul>')).toBe(
      '<p>Sync <b>issues</b></p><ul><li>one</li></ul>',
    );
  });

  test('returns an empty string for empty input', () => {
    expect(sanitizePluginHtml(undefined)).toBe('');
  });

  test('removes frames, forms, images, styles and non-http links', () => {
    const dom = toDom(
      sanitizePluginHtml(
        '<iframe src="https://example.com"></iframe><form><input></form><img src="https://example.com/p.png">' +
          '<p style="position:fixed" class="x" id="modal-root">text</p><a href="javascript:void(0)">bad</a><style>p{}</style>',
      ),
    );

    expect(dom.querySelector('iframe, form, input, img, style')).toBeNull();
    expect(dom.querySelector('p').attributes).toHaveLength(0);
    expect(dom.querySelector('a').hasAttribute('href')).toBe(false);
  });

  test('keeps http(s) links and opens them in a new tab', () => {
    const link = toDom(
      sanitizePluginHtml('<a href="https://example.com/docs" target="_self">docs</a>'),
    ).querySelector('a');

    expect(link.getAttribute('href')).toBe('https://example.com/docs');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});

describe('isHttpUrl', () => {
  test.each([
    ['https://example.com/docs', true],
    ['http://example.com', true],
    ['javascript:void(0)', false],
    ['data:text/html,x', false],
    ['/relative', false],
    ['', false],
    [undefined, false],
  ])('%p -> %p', (value, expected) => {
    expect(isHttpUrl(value)).toBe(expected);
  });
});
