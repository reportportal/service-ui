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

import { useDispatch } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import { EDIT_SELECTED_TEST_CASE_MODAL_KEY } from './editTestCaseModal';
import { TestCase } from '../types';

interface UseEditTestCaseModalOptions {
  testCase: TestCase;
}

export const useEditTestCaseModal = () => {
  const dispatch = useDispatch();

  const openModal = (data: UseEditTestCaseModalOptions) => {
    dispatch(
      showModalAction({
        id: EDIT_SELECTED_TEST_CASE_MODAL_KEY,
        data,
      }),
    );
  };

  return { openModal };
};
