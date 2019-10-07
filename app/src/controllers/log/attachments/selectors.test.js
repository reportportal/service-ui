import { attachmentItemsSelector } from './selectors';

const mockState = {
  user: {
    activeProject: 'test_project',
  },
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
      mockState.user.activeProject,
    );
    const expected = [
      {
        alt: 'text/html',
        contentType: 'text/html',
        id: '1234',
        src: '**FILE_MOCK**',
        thumbnailSrc: null,
        isImage: false,
      },
      {
        alt: 'image/png',
        contentType: 'image/png',
        id: '5678',
        src: '/api/v1/data/test_project/5678',
        thumbnailSrc: '/api/v1/data/test_project/5678?loadThumbnail=true',
        isImage: true,
      },
    ];
    expect(selected).toEqual(expected);
  });
});
