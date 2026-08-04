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

import { sanitizeUserHtml } from './sanitizeUserHtml';

const XSS_PAYLOAD =
  '"><style>#phish{position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999}</style><div id=phish><form onsubmit="alert(1)"><input name=user><button>Login</button></form></div>';

describe('sanitizeUserHtml', () => {
  test('should keep common HTML markup', () => {
    const html = '<div class="note"><p><strong>bold</strong> and <em>italic</em></p></div>';

    expect(sanitizeUserHtml(html)).toBe(
      '<div class="note"><p><strong>bold</strong> and <em>italic</em></p></div>',
    );
  });

  test('should remove form elements', () => {
    const html = '<p>text</p><form><input><button>Login</button></form>';
    const sanitized = sanitizeUserHtml(html);

    expect(sanitized).not.toContain('<form');
    expect(sanitized).not.toContain('<input');
    expect(sanitized).not.toContain('<button');
    expect(sanitized).toContain('<p>text</p>');
  });

  test('should remove overlay markup from reported payload', () => {
    const sanitized = sanitizeUserHtml(XSS_PAYLOAD);

    expect(sanitized).not.toContain('<form');
    expect(sanitized).not.toContain('<button');
    expect(sanitized).not.toContain('position:fixed');
    expect(sanitized).not.toContain('z-index');
  });

  test('should keep style tags and strip only position and z-index inside them', () => {
    const html = '<style>p { color: red; position: fixed; z-index: 10; margin: 0; }</style>';
    const sanitized = sanitizeUserHtml(html);

    expect(sanitized).toContain('<style>');
    expect(sanitized).toContain('color: red');
    expect(sanitized).toContain('margin: 0');
    expect(sanitized).not.toMatch(/position\s*:/i);
    expect(sanitized).not.toMatch(/z-index\s*:/i);
  });

  test('should strip position and z-index from inline styles', () => {
    const html = '<div style="color:red;position:fixed;z-index:9999">text</div>';

    expect(sanitizeUserHtml(html)).toBe('<div style="color:red">text</div>');
  });
});
