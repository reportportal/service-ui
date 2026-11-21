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

import Parser from 'html-react-parser';
import { mount } from 'enzyme';
import { escapeHtml } from './escapeHtml';
import { sanitizeTemplateHtml } from './sanitizeTemplateHtml';

const toDom = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

describe('sanitizeTemplateHtml', () => {
  test('keeps inline emphasis', () => {
    expect(sanitizeTemplateHtml('Delete <b>launch</b> <i>now</i>?<br>')).toBe(
      'Delete <b>launch</b> <i>now</i>?<br>',
    );
  });

  test('returns an empty string for empty input', () => {
    expect(sanitizeTemplateHtml('')).toBe('');
    expect(sanitizeTemplateHtml(null)).toBe('');
  });

  test('removes images, style elements and attributes other than href', () => {
    const dom = toDom(
      sanitizeTemplateHtml(
        '<b class="x" style="position:fixed" id="modal-root">n</b><img src="https://example.com/p.png"><style>b{}</style>',
      ),
    );

    expect(dom.querySelector('img')).toBeNull();
    expect(dom.querySelector('style')).toBeNull();
    expect(dom.querySelector('b').attributes).toHaveLength(0);
  });

  test('keeps http(s) and relative links opening in a new tab', () => {
    const dom = toDom(
      sanitizeTemplateHtml(
        '<a href="https://example.com/docs" onclick="x()">docs</a><a href="#settings">settings</a>',
      ),
    );
    const [external, relative] = dom.querySelectorAll('a');

    expect(external.getAttribute('href')).toBe('https://example.com/docs');
    expect(external.getAttribute('target')).toBe('_blank');
    expect(external.getAttribute('rel')).toBe('noopener noreferrer');
    expect(external.hasAttribute('onclick')).toBe(false);
    expect(relative.getAttribute('href')).toBe('#settings');
  });

  test('drops non-http link schemes', () => {
    const dom = toDom(
      sanitizeTemplateHtml('<a href="javascript:void(0)">a</a><a href="data:text/html,x">b</a>'),
    );

    dom.querySelectorAll('a').forEach((link) => expect(link.hasAttribute('href')).toBe(false));
  });

  test('an escaped entity name renders as text inside a bold chunk', () => {
    const name = 'Suite <img src=x> List<String>';
    const wrapper = mount(
      <p>{Parser(sanitizeTemplateHtml(`Delete <b>${escapeHtml(name)}</b>?`))}</p>,
    );

    expect(wrapper.find('img')).toHaveLength(0);
    expect(wrapper.find('b').text()).toBe(name);
  });
});
