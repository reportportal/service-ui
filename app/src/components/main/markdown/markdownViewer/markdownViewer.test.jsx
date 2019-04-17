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

describe('<MarkdownViewer />', () => {
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
    expect(wrapper.find('.markdown-viewer a')).toHaveLength(1);
    expect(wrapper.find('.markdown-viewer a').prop('href')).toEqual('http://reportportal.io/');
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
});
