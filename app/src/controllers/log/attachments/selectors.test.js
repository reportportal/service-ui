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
