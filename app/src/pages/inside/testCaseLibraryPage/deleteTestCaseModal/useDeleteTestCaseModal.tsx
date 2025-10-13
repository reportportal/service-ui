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

import { useModal } from 'common/hooks';

import { TestCase } from '../types';
import DeleteFolderModal, { DELETE_TEST_CASE_MODAL_KEY } from './deleteTestCaseModal';

interface DeleteTestCaseModalData {
  testCase: TestCase;
}

export const useDeleteTestCaseModal = () =>
  useModal<DeleteTestCaseModalData>({
    modalKey: DELETE_TEST_CASE_MODAL_KEY,
    renderModal: (data) => <DeleteFolderModal data={data} />,
  });
