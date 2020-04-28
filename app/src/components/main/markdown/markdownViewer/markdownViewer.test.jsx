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
    expect(wrapper.find('.markdown-viewer').children()).toHaveLength(1);
    expect(
      wrapper
        .find('.markdown-viewer')
        .childAt(0)
        .type(),
    ).toEqual('ul');
    expect(wrapper.find('.markdown-viewer ul').children()).toHaveLength(3);
    expect(
      wrapper
        .find('.markdown-viewer ul')
        .childAt(0)
        .type(),
    ).toEqual('li');
    expect(
      wrapper
        .find('.markdown-viewer ul')
        .childAt(0)
        .html(),
    ).toEqual('<li>Generic list item</li>');
  });
  test('ordered lists are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={orderedListMock} />);
    expect(wrapper.find('.markdown-viewer').children()).toHaveLength(1);
    expect(
      wrapper
        .find('.markdown-viewer')
        .childAt(0)
        .type(),
    ).toEqual('ol');
    expect(wrapper.find('.markdown-viewer ol').children()).toHaveLength(3);
    expect(
      wrapper
        .find('.markdown-viewer ol')
        .childAt(0)
        .type(),
    ).toEqual('li');
    expect(
      wrapper
        .find('.markdown-viewer ol')
        .childAt(0)
        .html(),
    ).toEqual('<li>Numbered list item</li>');
  });
  test('links are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={linkMock} />);
    const linkElement = wrapper.find('.markdown-viewer a');
    expect(linkElement).toHaveLength(1);
    const linkNode = linkElement.getDOMNode();
    expect(linkNode).toHaveProperty('href', 'http://reportportal.io/');
    expect(linkNode).toHaveProperty('target', '_blank');
    expect(linkNode).toHaveProperty('rel', 'noreferrer noopener');
  });
  test('quote elements are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={quoteMock} />);
    expect(wrapper.find('.markdown-viewer blockquote')).toHaveLength(1);
    expect(
      wrapper
        .find('.markdown-viewer blockquote')
        .childAt(0)
        .html(),
    ).toEqual('<p>This is a quote.</p>');
  });
  test('codeMock elements are rendering correctly', () => {
    const wrapper = mount(<MarkdownViewer value={codeMock} />);
    expect(wrapper.find('.markdown-viewer code')).toHaveLength(1);
    expect(wrapper.find('.markdown-viewer code').text()).toEqual('var example = "hello!";');
  });
  test('HTML elements in code blocks are rendering as a text', () => {
    const code = '`<span>test code</span>`';
    const wrapper = mount(<MarkdownViewer value={code} />);
    expect(wrapper.find('.markdown-viewer code')).toHaveLength(1);
    expect(wrapper.find('.markdown-viewer code').text()).toEqual('<span>test code</span>');
  });
});
