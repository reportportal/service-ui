import { attachmentsSelector } from './selectors';

const mockState = {
  log: {
    logItems: [
      {
        binary_content: {
          id: '1234',
          content_type: 'text/html',
        },
      },
      {
        binary_content: {
          id: '5678',
          content_type: 'image/png',
        },
      },
    ],
  },
};

describe('Attachments Selectors', () => {
  test('attachmentsSelector works', () => {
    const selected = attachmentsSelector.resultFunc(mockState.log.logItems);
    const expected = [
      {
        alt: 'text/html',
        attachment: {
          content_type: 'text/html',
          id: '1234',
        },
        id: '1234',
        src: '**SVG_MOCK**',
      },
      {
        alt: 'image/png',
        attachment: {
          content_type: 'image/png',
          id: '5678',
        },
        id: '5678',
        src: '**SVG_MOCK**',
      },
    ];
    expect(selected).toEqual(expected);
  });
});
