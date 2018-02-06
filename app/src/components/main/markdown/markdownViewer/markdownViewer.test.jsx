import { mount } from 'enzyme';
import { MarkdownViewer } from './markdownViewer';

const boldMock = '**bold**';
const italicMock = '*italic*';
const strikethroughMock = '~~strikethrough~~';
const unorderedListMock = '* Generic list item\n' +
  '* Generic list item\n' +
  '* Generic list item';
const orderedListMock = '1. Numbered list item\n' +
  '2. Numbered list item\n' +
  '3. Numbered list item';
const linkMock = '[Report portal](http://reportportal.io/)';
const quoteMock = '> This is a quote.';
const codeMock = '`var example = "hello!";`';

describe('<MarkdownViewer />', () => {
  it('bold elements are rendering correctly', () => {
    const wrapper = mount(
      <MarkdownViewer text={boldMock} />,
    );
    expect(wrapper.contains(<strong>bold</strong>)).toBeTruthy();
  });
  it('italic elements are rendering correctly', () => {
    const wrapper = mount(
      <MarkdownViewer text={italicMock} />,
    );
    expect(wrapper.contains(<em>italic</em>)).toBeTruthy();
  });
  it('strikethrough elements are rendering correctly', () => {
    const wrapper = mount(
      <MarkdownViewer text={strikethroughMock} />,
    );
    expect(wrapper.contains(<del>strikethrough</del>)).toBeTruthy();
  });
  it('unordered lists are rendering correctly', () => {
    const wrapper = mount(
      <MarkdownViewer text={unorderedListMock} />,
    );
    expect(wrapper.find('.markdown-viewer').children()).toHaveLength(1);
    expect(wrapper.find('.markdown-viewer').childAt(0).type()).toEqual('ul');
    expect(wrapper.find('.markdown-viewer ul').children()).toHaveLength(3);
    expect(wrapper.find('.markdown-viewer ul').childAt(0).type()).toEqual('li');
    expect(wrapper.find('.markdown-viewer ul').childAt(0).html()).toEqual('<li>Generic list item</li>');
  });
  it('ordered lists are rendering correctly', () => {
    const wrapper = mount(
      <MarkdownViewer text={orderedListMock} />,
    );
    expect(wrapper.find('.markdown-viewer').children()).toHaveLength(1);
    expect(wrapper.find('.markdown-viewer').childAt(0).type()).toEqual('ol');
    expect(wrapper.find('.markdown-viewer ol').children()).toHaveLength(3);
    expect(wrapper.find('.markdown-viewer ol').childAt(0).type()).toEqual('li');
    expect(wrapper.find('.markdown-viewer ol').childAt(0).html()).toEqual('<li>Numbered list item</li>');
  });
  it('links are rendering correctly', () => {
    const wrapper = mount(
      <MarkdownViewer text={linkMock} />,
    );
    expect(wrapper.find('.markdown-viewer a')).toHaveLength(1);
    expect(wrapper.find('.markdown-viewer a').prop('href')).toEqual('http://reportportal.io/');
  });
  it('quote elements are rendering correctly', () => {
    const wrapper = mount(
      <MarkdownViewer text={quoteMock} />,
    );
    expect(wrapper.find('.markdown-viewer blockquote')).toHaveLength(1);
    expect(wrapper.find('.markdown-viewer blockquote').childAt(0).html()).toEqual('<p>This is a quote.</p>');
  });
  it('codeMock elements are rendering correctly', () => {
    const wrapper = mount(
      <MarkdownViewer text={codeMock} />,
    );
    expect(wrapper.find('.markdown-viewer code')).toHaveLength(1);
    expect(wrapper.find('.markdown-viewer code').text()).toEqual('var example = "hello!";');
  });
});
