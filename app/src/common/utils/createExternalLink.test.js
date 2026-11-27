import { render } from 'enzyme';
import Parser from 'html-react-parser';
import { createExternalLink } from './createExternalLink';

describe('createExternalLink', () => {
  const wrapper = render(Parser(createExternalLink(['Test'], 'https://reportportal.io/docs')));

  test('Should create anchor html element with provided text', () => {
    expect(wrapper.has('a'));
    expect(wrapper.text()).toBe('Test');
  });

  test('Should create anchor html element with provided href', () => {
    expect(wrapper.has('a'));
    expect(wrapper.attr('href')).toBe('https://reportportal.io/docs');
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

describe('createExternalLink with untrusted href values', () => {
  const toDom = (html) => {
    const container = document.createElement('div');
    container.innerHTML = html;
    return container;
  };

  test('an href with spaces and quotes cannot add or override attributes', () => {
    const dom = toDom(
      createExternalLink('Docs', 'https://example.com/a" rel="opener" target="_self x=1', 'docs'),
    );
    const link = dom.querySelector('a');

    expect(link.getAttribute('rel')).toBe('noreferrer noopener');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('data-automation-id')).toBe('docs');
    expect(link.getAttribute('href')).toBe('https://example.com/a" rel="opener" target="_self x=1');
    expect(link.attributes).toHaveLength(4);
  });

  test.each([['javascript:void(0)'], ['data:text/html,x'], ['/relative/path'], [''], [undefined]])(
    'a non-http(s) href %p renders plain text instead of a link',
    (href) => {
      const dom = toDom(createExternalLink('Docs', href, 'docs'));

      expect(dom.querySelector('a')).toBeNull();
      expect(dom.querySelector('span').textContent).toBe('Docs');
    },
  );

  test('a docs reference link keeps its icon and automation id', () => {
    const dom = toDom(
      createExternalLink(
        'Docs',
        'https://reportportal.io/docs',
        'documentationLink',
        '<svg><path d="M0 0" fill="red"></path></svg>',
      ),
    );
    const link = dom.querySelector('a');

    expect(link.getAttribute('data-automation-id')).toBe('documentationLink');
    expect(link.querySelector('path').getAttribute('d')).toBe('M0 0');
  });

  test('omits the automation id when none is given', () => {
    const dom = toDom(createExternalLink('Docs', 'https://reportportal.io/docs'));

    expect(dom.querySelector('a').hasAttribute('data-automation-id')).toBe(false);
  });
});
