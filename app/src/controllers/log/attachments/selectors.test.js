import { attachmentItemsSelector } from './selectors';

const mockState = {
  log: {
    attachments: {
      logsWithAttachments: [
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
  },
};

describe('Attachments Selectors', () => {
  test('attachmentsSelector works', () => {
    const selected = attachmentItemsSelector.resultFunc(
      mockState.log.attachments.logsWithAttachments,
    );
    const expected = [
      {
        alt: 'text/html',
        contentType: 'text/html',
        id: '1234',
        src: '**FILE_MOCK**',
        isImage: false,
      },
      {
        alt: 'image/png',
        contentType: 'image/png',
        id: '5678',
        src: '/api/v1/data/5678',
        isImage: true,
      },
    ];
    expect(selected).toEqual(expected);
  });
});
