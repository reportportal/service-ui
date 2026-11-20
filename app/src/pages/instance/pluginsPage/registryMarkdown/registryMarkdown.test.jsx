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

import { mount } from 'enzyme';
import { RegistryMarkdown, joinChangelogLines, registryMarkdownHtml } from './registryMarkdown';

const render = (lines, headingLevel = 4) =>
  mount(<RegistryMarkdown lines={lines} headingLevel={headingLevel} />);

describe('RegistryMarkdown', () => {
  test('renders the markdown a release is written in', () => {
    const wrapper = render([
      '# RC 6.0.0',
      "## What's Changed",
      '* Retry **flaky** launches by @someone in [#12](https://git.epam.com/p/merge_requests/12)',
      '**Full Changelog**: https://git.epam.com/p/compare/5.9.0...6.0.0',
    ]);

    expect(wrapper.find('h4').text()).toBe('RC 6.0.0');
    expect(wrapper.find('h5').text()).toBe("What's Changed");
    expect(wrapper.find('li strong').text()).toBe('flaky');
    expect(wrapper.find('a').map((a) => a.prop('href'))).toEqual([
      'https://git.epam.com/p/merge_requests/12',
      'https://git.epam.com/p/compare/5.9.0...6.0.0',
    ]);
    expect(wrapper.text()).not.toContain('**');
  });

  // the page's own block heading is above it; a changelog's `#` may not outrank it
  test('moves every heading under the level it is given, never past h6', () => {
    const wrapper = render(['# one', '## two', '###### six'], 5);

    ['h1', 'h2', 'h3', 'h4'].forEach((tag) => expect(wrapper.find(tag)).toHaveLength(0));
    expect(wrapper.find('h5').text()).toBe('one');
    expect(wrapper.find('h6').map((h) => h.text())).toEqual(['two', 'six']);
  });

  test('links open in a new tab, with no opener and no referrer', () => {
    const link = render(['[site](https://example.com)']).find('a');

    expect(link.prop('target')).toBe('_blank');
    expect(link.prop('rel')).toBe('noopener noreferrer');
  });

  // The whole sanitised output per vector, not the absence of one pattern: an absence check
  // passes for any spelling of the attack it did not think of, and says nothing of what is left.
  describe('a registry is not trusted with the page', () => {
    const VECTORS = [
      ['a script', '<script>alert(1)</script>', ''],
      ['an event handler', '<p onclick="alert(1)">x</p>', '<p>x</p>'],
      ['an image error handler', '<img src="x" onerror="alert(1)">', ''],
      ['a markdown javascript: link', '[x](javascript:alert(1))', '<p><a>x</a></p>'],
      ['a raw javascript: link', '<a href="javascript:alert(1)">x</a>', '<p><a>x</a></p>'],
      [
        'an entity-encoded javascript: link',
        '<a href="jav&#x61;script:alert(1)">x</a>',
        '<p><a>x</a></p>',
      ],
      ['an xlink:href', '<a xlink:href="javascript:alert(1)">x</a>', '<p><a>x</a></p>'],
      ['a data: link', '[x](data:text/html;base64,PHNjcmlwdD4=)', '<p><a>x</a></p>'],
      // protocol-relative: whatever scheme the page is on, to a host the registry chose
      ['a protocol-relative link', '<a href="//evil.example/x">x</a>', '<p><a>x</a></p>'],
      // a style block restyles the whole page, not just the card
      ['a style block', '<style>body { display: none }</style>', ''],
      ['a style attribute', '<p style="position: fixed; inset: 0">x</p>', '<p>x</p>'],
      ['an iframe', '<iframe src="https://example.com"></iframe>', ''],
      ['a form', '<form action="https://example.com"><input name="p"></form>', ''],
      ['a button formaction', '<button formaction="https://evil.example">x</button>', '<p>x</p>'],
      // a URI attribute DOMPurify allows by default: the browser fetches it as an image
      [
        'a table background',
        '<table background="https://t.example/b.png"><tr><td>x</td></tr></table>',
        '<table><tbody><tr><td>x</td></tr></tbody></table>',
      ],
      [
        'a details ontoggle',
        '<details ontoggle="alert(1)" open><summary>s</summary>x</details>',
        '<details><summary>s</summary>x</details>',
      ],
      // renames the browser tab
      ['a title element', '<title>x</title>', ''],
      [
        'an image map area',
        '<map name="m"><area href="https://evil.example" shape="rect"></map>',
        '<p></p>',
      ],
      ['a video poster', '<video poster="https://t.example/p.png"></video>', '<p></p>'],
      ['an open dialog', '<dialog open>x</dialog>', 'x'],
      ['a marquee', '<marquee>x</marquee>', '<p>x</p>'],
      ['a template', '<template><p>x</p></template>', '<p></p>'],
      ['a markdown image', '![pixel](https://tracker.example/p.png)', '<p></p>'],
      ['a raw image', '<img src="https://t.example/p">', ''],
      [
        'identity and data attributes',
        '<p data-x="1" aria-label="y" class="c" id="i" title="t">x</p>',
        '<p title="t">x</p>',
      ],
      [
        'a plain https link, which is kept',
        '[docs](https://reportportal.io/docs "Docs")',
        '<p><a href="https://reportportal.io/docs" title="Docs">docs</a></p>',
      ],
    ];

    test.each(VECTORS)('%s comes out as exactly what is allowed', (_, line, expected) => {
      expect(registryMarkdownHtml([line])).toBe(expected);
    });

    // a remote image is fetched by every admin who opens the page, which tells its host who runs
    // which plugin and when; an address may survive only as somewhere a click can go
    test('no address survives anywhere but a link', () => {
      VECTORS.forEach(([, line]) => {
        const outsideLinks = registryMarkdownHtml([line]).replace(/ href="[^"]*"/g, '');

        expect(outsideLinks).not.toMatch(/https?:|\/\//);
      });
    });
  });

  // the server strips each line and drops the blank ones, so the joins are this side's to make
  describe('lines as the server sends them', () => {
    test('each line is a block of its own, as it was shown before', () => {
      const wrapper = render(['Fixed a crash', 'Dropped the legacy field']);

      expect(wrapper.find('p').map((p) => p.text())).toEqual([
        'Fixed a crash',
        'Dropped the legacy field',
      ]);
    });

    test('a line after a list is not swallowed into its last item', () => {
      const wrapper = render(['* one', '* two', '**Full Changelog**: https://e.com/c']);

      expect(wrapper.find('li')).toHaveLength(2);
      expect(wrapper.find('li').last().text().trim()).toBe('two');
      expect(wrapper.find('li').last().text()).not.toContain('Full Changelog');
    });

    test('joins with a blank line between', () => {
      expect(joinChangelogLines(['a', 'b'])).toBe('a\n\nb');
      expect(joinChangelogLines(null)).toBe('');
    });
  });

  test('carries the class that lets a long URL wrap inside the card', () => {
    expect(render(['x']).find('div').first().hasClass('registry-markdown')).toBe(true);
  });
});
