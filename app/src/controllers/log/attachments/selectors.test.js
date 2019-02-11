import { attachmentsSelector } from './selectors';

const mockState = {
  log: {
    logItems: [
      {
        binaryContent: {
          id: '1234',
          contentType: 'text/html',
        },
      },
      {
        binaryContent: {
          id: '5678',
          contentType: 'image/png',
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
        contentType: 'text/html',
        id: '1234',
        src: '**SVG_MOCK**',
      },
      {
        alt: 'image/png',
        contentType: 'image/png',
        id: '5678',
        src: '/api/v1/data/5678',
      },
    ];
    expect(selected).toEqual(expected);
  });
});
