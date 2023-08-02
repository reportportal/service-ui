import { render } from 'enzyme';
import Parser from 'html-react-parser';
import { createExternalLink } from './createExternalLink';

describe('createExternalLink', () => {
  const wrapper = render(Parser(createExternalLink(['Test'], 'href')));

  test('Should create anchor html element with provided text', () => {
    expect(wrapper.has('a'));
    expect(wrapper.text()).toBe('Test');
  });

  test('Should create anchor html element with provided href', () => {
    expect(wrapper.has('a'));
    expect(wrapper.attr('href')).toBe('href');
  });
  test('Should create anchor html element with target="_blank"', () => {
    expect(wrapper.has('a'));
    expect(wrapper.attr('target')).toBe('_blank');
  });
  test('Should create anchor html element with rel="noreferrer noopener"', () => {
    expect(wrapper.has('a'));
    expect(wrapper.attr('rel')).toBe('noreferrer noopener');
  });
});
