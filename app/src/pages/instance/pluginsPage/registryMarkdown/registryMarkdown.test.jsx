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
import { RegistryMarkdown, joinChangelogLines } from './registryMarkdown';

const render = (lines, headingLevel = 4) =>
  mount(<RegistryMarkdown lines={lines} headingLevel={headingLevel} />);
const html = (lines) => render(lines).getDOMNode().innerHTML;

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

  describe('a registry is not trusted with the page', () => {
    test.each([
      ['a script', '<script>window.pwned = 1</script>', /<script/i],
      ['an event handler', '<p onclick="window.pwned = 1">x</p>', /onclick/i],
      ['an image error handler', '<img src="x" onerror="window.pwned = 1">', /onerror/i],
      ['a javascript: link', '[x](javascript:window.pwned=1)', /javascript:/i],
      ['a raw javascript: link', '<a href="javascript:window.pwned=1">x</a>', /javascript:/i],
      ['a data: link', '[x](data:text/html;base64,PHNjcmlwdD4=)', /data:/i],
      // a style block restyles the whole page, not just the card
      ['a style block', '<style>body { display: none }</style>', /<style|display/i],
      ['a style attribute', '<p style="position: fixed; inset: 0">x</p>', /style=/i],
      ['an iframe', '<iframe src="https://example.com"></iframe>', /<iframe/i],
      ['a form', '<form action="https://example.com"><input name="p"></form>', /<form|<input/i],
    ])('%s is removed', (_, line, leftover) => {
      expect(html([line])).not.toMatch(leftover);
      expect(window.pwned).toBeUndefined();
    });

    // a remote image is fetched by every admin who opens the page, which tells its host who runs
    // which plugin and when
    test('images are not loaded, markdown or raw', () => {
      const out = html([
        '![pixel](https://tracker.example/p.png)',
        '<img src="https://t.example/p">',
      ]);

      expect(out).not.toMatch(/<img|tracker\.example|t\.example/);
    });

    test('a plain-text link is kept', () => {
      expect(html(['[docs](https://reportportal.io/docs)'])).toContain(
        'href="https://reportportal.io/docs"',
      );
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
