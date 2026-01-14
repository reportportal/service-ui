/*
 * Copyright 2025 EPAM Systems
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

import { useSelector } from 'react-redux';

import { useModal } from 'common/hooks';
import { urlFolderIdSelector } from 'controllers/pages';
import { transformedFoldersWithFullPathSelector, FolderWithFullPath } from 'controllers/testCase';

import { CREATE_TEST_CASE_MODAL_KEY, CreateTestCaseModal } from './createTestCaseModal';

interface CreateTestCaseModalData {
  folder?: FolderWithFullPath;
}

export const useCreateTestCaseModal = () => {
  const folderId = useSelector(urlFolderIdSelector);
  const folders = useSelector(transformedFoldersWithFullPathSelector);

  const currentContextFolder = folders.find(({ id }) => id === Number(folderId));

  return useModal<CreateTestCaseModalData>({
    modalKey: CREATE_TEST_CASE_MODAL_KEY,
    renderModal: (data) => (
      <CreateTestCaseModal data={{ ...data, folder: data?.folder || currentContextFolder }} />
    ),
  });
};
