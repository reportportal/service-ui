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

import DOMPurify from 'dompurify';
import Parser from 'html-react-parser';
import {
  sanitizeUserHtml,
  sanitizeStyleAttribute,
  getSanitizeUserHtmlCacheSize,
  getSanitizeUserHtmlCacheTotalSize,
} from './sanitizeUserHtml';

const toDom = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

const collectElementTypes = (nodes, types = new Set()) => {
  [].concat(nodes).forEach((node) => {
    if (node && typeof node === 'object' && node.type) {
      types.add(node.type);
      if (node.props && node.props.children) {
        collectElementTypes(node.props.children, types);
      }
    }
  });
  return types;
};

const DANGEROUS_TAIL =
  '<a href="javascript:void(0)">x</a><iframe srcdoc="x"></iframe><form action="https://example.com"><input type="password"></form><base href="https://example.com/"><img src="x" onerror="void(0)">';

describe('sanitizeUserHtml', () => {
  test('keeps common HTML markup', () => {
    const html = '<div><p><strong>bold</strong> and <em>italic</em></p></div>';

    expect(sanitizeUserHtml(html)).toBe(html);
  });

  test('returns an empty string for empty input', () => {
    expect(sanitizeUserHtml('')).toBe('');
    expect(sanitizeUserHtml(null)).toBe('');
    expect(sanitizeUserHtml(undefined)).toBe('');
  });

  test.each([
    ['trailing space', '</style >'],
    ['tab', '</style\t>'],
    ['slash', '</style/>'],
    ['upper case', '</STYLE>'],
  ])('a style end tag variant (%s) does not let markup bypass sanitising', (_name, endTag) => {
    const sanitized = sanitizeUserHtml(`ok<style>p{color:red}${endTag}${DANGEROUS_TAIL}`);
    const types = collectElementTypes(Parser(sanitized));

    expect(sanitized).not.toMatch(/javascript:/i);
    expect(sanitized).not.toMatch(/<iframe|srcdoc|<form|<input|<base|onerror|<style/i);
    types.forEach((type) => expect(['a', 'img']).toContain(type));
  });

  test('a style tag written inside an attribute value does not bypass sanitising', () => {
    const sanitized = sanitizeUserHtml(`<p title="<style>">t</p>${DANGEROUS_TAIL}`);

    expect(sanitized).not.toMatch(/javascript:|<iframe|<form|<base|onerror/i);
  });

  test('removes style elements entirely', () => {
    const sanitized = sanitizeUserHtml('<p>a</p><style>p { color: red; }</style><p>b</p>');

    expect(sanitized).toBe('<p>a</p><p>b</p>');
  });

  test('removes form elements', () => {
    const sanitized = sanitizeUserHtml('<p>text</p><form><input><button>Login</button></form>');

    expect(sanitized).not.toMatch(/<form|<input|<button/);
    expect(sanitized).toContain('<p>text</p>');
  });

  test('keeps allowed inline style declarations', () => {
    expect(sanitizeUserHtml('<span style="color:red;text-align:center;width:50%">t</span>')).toBe(
      '<span style="color:red;text-align:center;width:50%">t</span>',
    );
  });

  test.each([
    ['position', 'position:fixed'],
    ['z-index', 'z-index:9'],
    ['transform', 'transform:scale(9)'],
    ['background-image', 'background-image:linear-gradient(red,blue)'],
    ['escaped property name', 'pos\\69tion:fixed'],
    ['url() value', 'background-color:red url(https://example.com/x)'],
    ['expression() value', 'width:expression(1)'],
    ['at-rule in value', 'color:@import'],
    ['backslash in value', 'color:r\\65 d'],
    ['comment in value', 'color:red/**/'],
    ['non-length size', 'width:calc(100vw)'],
    ['overlay display', 'display:contents'],
  ])('drops a disallowed inline style declaration (%s)', (_name, declaration) => {
    const sanitized = sanitizeUserHtml(`<span style="${declaration};color:blue">t</span>`);

    expect(sanitized).toBe('<span style="color:blue">t</span>');
  });

  test('removes the style attribute when nothing is left', () => {
    expect(sanitizeUserHtml('<span style="position:fixed">t</span>')).toBe('<span>t</span>');
  });

  test('strips !important from allowed declarations', () => {
    expect(sanitizeStyleAttribute('color: red !important')).toBe('color:red');
  });

  test('keeps only code-fence language classes', () => {
    const sanitized = sanitizeUserHtml(
      '<pre><code class="language-js editor-preview-active-side">x</code></pre><div class="fullscreen">y</div>',
    );

    expect(sanitized).toBe('<pre><code class="language-js">x</code></pre><div>y</div>');
  });

  test('prefixes ids so user content cannot take over app root ids', () => {
    const dom = toDom(sanitizeUserHtml('<h1 id="tooltip-root">t</h1>'));

    expect(dom.querySelector('#tooltip-root')).toBeNull();
    expect(dom.querySelector('h1').id).toBe('user-content-tooltip-root');
  });

  test('keeps tables, code, details and images', () => {
    const dom = toDom(
      sanitizeUserHtml(
        '<table><thead><tr><th colspan="2">h</th></tr></thead><tbody><tr><td align="center">1</td><td>2</td></tr></tbody></table>' +
          '<details open><summary>s</summary>d</details>' +
          '<img src="https://example.com/a.png" alt="a"><img src="data:image/png;base64,AA==" alt="b">',
      ),
    );

    expect(dom.querySelector('th').getAttribute('colspan')).toBe('2');
    expect(dom.querySelector('td').getAttribute('align')).toBe('center');
    expect(dom.querySelector('details').hasAttribute('open')).toBe(true);
    expect(dom.querySelectorAll('img')).toHaveLength(2);
    expect(dom.querySelectorAll('img')[1].getAttribute('src')).toMatch(/^data:image\/png/);
  });

  test('drops tags and attributes outside the allow-list', () => {
    const dom = toDom(
      sanitizeUserHtml(
        '<img src="https://example.com/a.png" srcset="https://example.com/b.png 2x">' +
          '<table><tr><td background="https://example.com/c.png">1</td></tr></table>' +
          '<video src="https://example.com/v.mp4"></video><svg><circle r="1"></circle></svg>' +
          '<p data-x="1" aria-label="l" name="n">p</p>',
      ),
    );

    expect(dom.querySelector('img').hasAttribute('srcset')).toBe(false);
    expect(dom.querySelector('td').hasAttribute('background')).toBe(false);
    expect(dom.querySelector('video')).toBeNull();
    expect(dom.querySelector('svg')).toBeNull();
    const paragraph = dom.querySelector('p');
    expect(paragraph.hasAttribute('data-x')).toBe(false);
    expect(paragraph.hasAttribute('aria-label')).toBe(false);
    expect(paragraph.hasAttribute('name')).toBe(false);
  });

  test('keeps http(s) and relative links, removes data: links', () => {
    const dom = toDom(
      sanitizeUserHtml(
        '<a href="https://example.com">a</a><a href="/ui/#p/launches">b</a><a href="data:text/html,x">c</a>',
      ),
    );
    const links = dom.querySelectorAll('a');

    expect(links[0].getAttribute('href')).toBe('https://example.com');
    expect(links[1].getAttribute('href')).toBe('/ui/#p/launches');
    expect(links[2].hasAttribute('href')).toBe(false);
  });

  test('opens every link in a new tab without opener and referrer', () => {
    const dom = toDom(
      sanitizeUserHtml('<a href="https://example.com" target="_self" rel="opener">a</a><a>b</a>'),
    );
    const [link, anchorWithoutHref] = dom.querySelectorAll('a');

    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(anchorWithoutHref.hasAttribute('target')).toBe(false);
    expect(anchorWithoutHref.hasAttribute('rel')).toBe(false);
  });

  test('loads user images lazily without a referrer', () => {
    const img = toDom(sanitizeUserHtml('<img src="https://example.com/a.png">')).querySelector(
      'img',
    );

    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  test('does not register hooks on the global DOMPurify instance', () => {
    sanitizeUserHtml('<a href="https://example.com">a</a>');

    expect(DOMPurify.sanitize('<a href="https://example.com">a</a>')).toBe(
      '<a href="https://example.com">a</a>',
    );
  });

  test('caches results and keeps the cache bounded', () => {
    const html = '<p>cached value</p>';
    const first = sanitizeUserHtml(html);

    expect(sanitizeUserHtml(html)).toBe(first);

    for (let i = 0; i < 1001; i += 1) {
      sanitizeUserHtml(`<p>${i}</p>`);
    }

    expect(getSanitizeUserHtmlCacheSize()).toBeLessThanOrEqual(1000);
  });

  test('does not cache oversized values and bounds the total retained size', () => {
    const before = getSanitizeUserHtmlCacheTotalSize();
    const big = `<p>${'x'.repeat(100 * 1024)}</p>`;

    expect(sanitizeUserHtml(big)).toBe(big);
    expect(getSanitizeUserHtmlCacheTotalSize()).toBe(before);

    for (let i = 0; i < 400; i += 1) {
      sanitizeUserHtml(`<p>${i}${'y'.repeat(30 * 1024)}</p>`);
    }

    expect(getSanitizeUserHtmlCacheTotalSize()).toBeLessThanOrEqual(8 * 1024 * 1024);
    expect(getSanitizeUserHtmlCacheSize()).toBeLessThan(400);
  });
});
