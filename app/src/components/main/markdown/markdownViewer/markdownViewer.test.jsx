/*
 * Copyright 2019 EPAM Systems
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
import * as sanitizeModule from 'common/utils/sanitizeUserHtml';
import { MarkdownViewer } from './markdownViewer';

const boldMock = '**bold**';
const italicMock = '*italic*';
const strikethroughMock = '~~strikethrough~~';
const unorderedListMock = [
  '* Generic list item',
  '* Generic list item',
  '* Generic list item',
].join('\n');
const orderedListMock = [
  '1. Numbered list item',
  '2. Numbered list item',
  '3. Numbered list item',
].join('\n');
const linkMock = '[Report portal](http://reportportal.io/)';
const quoteMock = '> This is a quote.';
const codeMock = '`var example = "hello!";`';

describe('MarkdownViewer', () => {
  test('bold elements are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={boldMock} />);
    expect(wrapper.contains(<strong>bold</strong>)).toBeTruthy();
  });
  test('italic elements are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={italicMock} />);
    expect(wrapper.contains(<em>italic</em>)).toBeTruthy();
  });
  test('strikethrough elements are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={strikethroughMock} />);
    expect(wrapper.contains(<del>strikethrough</del>)).toBeTruthy();
  });
  test('unordered lists are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={unorderedListMock} />);
    expect(
      wrapper
        .find('.markdown-viewer')
        .children()
        .filterWhere((n) => typeof n.type() === 'string'),
    ).toHaveLength(1);
    expect(
      wrapper
        .find('.markdown-viewer')
        .childAt(0)
        .filterWhere((n) => typeof n.type() === 'string')
        .type(),
    ).toEqual('ul');
    expect(
      wrapper
        .find('.markdown-viewer ul')
        .children()
        .filterWhere((n) => typeof n.type() === 'string'),
    ).toHaveLength(3);

    const firstLi = wrapper
      .find('.markdown-viewer ul')
      .children()
      .filterWhere((n) => typeof n.type() === 'string')
      .at(0);
    expect(firstLi.type()).toEqual('li');
    expect(firstLi.contains('Generic list item')).toBeTruthy();
  });
  test('ordered lists are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={orderedListMock} />);
    expect(
      wrapper
        .find('.markdown-viewer')
        .children()
        .filterWhere((n) => typeof n.type() === 'string'),
    ).toHaveLength(1);
    expect(
      wrapper
        .find('.markdown-viewer')
        .filterWhere((n) => typeof n.type() === 'string')
        .childAt(0)
        .type(),
    ).toEqual('ol');
    expect(
      wrapper
        .find('.markdown-viewer ol')
        .children()
        .filterWhere((n) => typeof n.type() === 'string'),
    ).toHaveLength(3);

    const firstLi = wrapper
      .find('.markdown-viewer ol')
      .children()
      .filterWhere((n) => typeof n.type() === 'string')
      .at(0);
    expect(firstLi.type()).toEqual('li');
    expect(firstLi.contains('Numbered list item')).toBeTruthy();
  });
  test('links are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={linkMock} />);
    const linkElement = wrapper.find('.markdown-viewer a');
    expect(linkElement).toHaveLength(1);
    expect(linkElement.props().href).toBe('http://reportportal.io/');
  });
  test('quote elements are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={quoteMock} />);
    expect(wrapper.find('.markdown-viewer blockquote')).toHaveLength(1);
    const quote = wrapper
      .find('.markdown-viewer blockquote')
      .children()
      .filterWhere((n) => typeof n.type() === 'string')
      .at(0);
    expect(quote.type()).toEqual('p');
    expect(quote.contains('This is a quote.')).toBeTruthy();
  });
  test('codeMock elements are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={codeMock} />);
    const codeElement = wrapper.find('.markdown-viewer code');
    expect(codeElement).toHaveLength(1);
    expect(codeElement.contains('var example = "hello!";')).toBeTruthy();
  });
  test('HTML elements in code blocks are rendering as a text', () => {
    const code = '`<span>test code</span>`';
    const wrapper = mount(<MarkdownViewer value={code} />);
    const codeElement = wrapper.find('.markdown-viewer code');
    expect(codeElement).toHaveLength(1);
    expect(codeElement.contains('<span>test code</span>')).toBeTruthy();
  });
  test('raw HTML with unsafe overlay markup is not rendered', () => {
    const xssPayload =
      '"><style>#phish{position:fixed;top:0;left:0;width:100%;height:100%}</style><div id=phish><form><button>Login</button></form></div>';
    const wrapper = mount(<MarkdownViewer value={xssPayload} />);
    const container = wrapper.instance().container.current;

    expect(wrapper.find('form')).toHaveLength(0);
    expect(wrapper.find('button')).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/position:fixed/i);
  });
  test('a typical markdown log renders the same elements as before the sanitiser rewrite', () => {
    const log = [
      '## Step result',
      '',
      'Request **GET** `/api/v1/launch` returned *200*, see [docs](https://reportportal.io/docs).',
      '',
      '| Field | Expected | Actual |',
      '|---|:---:|---:|',
      '| status | 200 | 200 |',
      '| time | <span style="color:red">35ms</span> | 40ms |',
      '',
      '```java',
      'assertEquals(1, 2);',
      '```',
      '',
      '> quoted line',
      '',
      '- item one',
      '- item two',
      '',
      '1. first',
      '2. second',
      '',
      '![screenshot](https://example.com/s.png)',
      '![inline](data:image/png;base64,iVBORw0KGgo=)',
      '',
      '<details><summary>More</summary>hidden text</details>',
    ].join('\n');
    const wrapper = mount(<MarkdownViewer value={log} />);
    const container = wrapper.instance().container.current;
    const tags = Array.from(container.querySelectorAll('*')).map((node) =>
      node.tagName.toLowerCase(),
    );

    // element sequence captured from the previous implementation
    expect(tags).toEqual([
      'h2',
      'p',
      'strong',
      'code',
      'em',
      'a',
      'table',
      'thead',
      'tr',
      'th',
      'th',
      'th',
      'tbody',
      'tr',
      'td',
      'td',
      'td',
      'tr',
      'td',
      'td',
      'span',
      'td',
      'pre',
      'code',
      'blockquote',
      'p',
      'ul',
      'li',
      'li',
      'ol',
      'li',
      'li',
      'p',
      'img',
      'br',
      'img',
      'details',
      'summary',
    ]);
    expect(container.querySelector('th[align="center"]')).not.toBeNull();
    expect(container.querySelector('span').getAttribute('style')).toMatch(/color:\s*red/);
    expect(container.querySelector('pre code').className).toBe('language-java');
    expect(container.querySelector('a').getAttribute('href')).toBe('https://reportportal.io/docs');
    expect(container.querySelectorAll('img')[0].getAttribute('src')).toBe(
      'https://example.com/s.png',
    );
    expect(container.querySelectorAll('img')[1].getAttribute('src')).toMatch(/^data:image\/png/);
  });
  test('links open in a new tab without opener and referrer', () => {
    const wrapper = mount(<MarkdownViewer value={linkMock} />);
    const link = wrapper.instance().container.current.querySelector('a');

    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
  test('a heading cannot take over an app root element id', () => {
    const wrapper = mount(<MarkdownViewer value="# tooltip root" />);
    const container = wrapper.instance().container.current;

    expect(container.querySelector('#tooltip-root')).toBeNull();
    expect(container.querySelector('h1').id).toBe('user-content-tooltip-root');
  });
  test('re-rendering with the same value does not sanitise again', () => {
    const spy = jest.spyOn(sanitizeModule, 'sanitizeUserHtml');
    const wrapper = mount(<MarkdownViewer value="**unique re-render value**" />);
    wrapper.setProps({ className: 'other' });
    wrapper.setProps({ mode: 'other-mode' });

    expect(spy).toHaveBeenCalledTimes(1);

    wrapper.setProps({ value: '**changed value**' });

    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
