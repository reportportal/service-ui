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
});
