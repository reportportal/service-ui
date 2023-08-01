import { render } from 'enzyme';
import Parser from 'html-react-parser';
import { createExternalLink } from './createExternalLink';

describe('createExternalLink', () => {
  test('Should create anchor html element with provided text', () => {
    const wrapper = render(Parser(createExternalLink(['Test'])));

    expect(wrapper.has('a'));
    expect(wrapper.text()).toBe('Test');
  });

  test('Should create anchor html element with provided href', () => {
    const wrapper = render(Parser(createExternalLink(['Test'], 'href')));

    expect(wrapper.has('a'));
    expect(wrapper.attr('href')).toBe('href');
  });
});
