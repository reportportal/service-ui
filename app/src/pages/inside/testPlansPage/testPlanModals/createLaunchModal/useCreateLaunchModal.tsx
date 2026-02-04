/*
 * Copyright 2026 EPAM Systems
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

import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { useModal } from 'common/hooks';
import { hideModalAction } from 'controllers/modal';

import { CreateLaunchFormValues } from './types';
import { CREATE_LAUNCH_MODAL_KEY } from './constants';
import { CreateLaunchModal } from './createLaunchModal';

export const useCreateLaunchModal = (selectedTestsCount?: number) => {
  const dispatch = useDispatch();
  const [isLoading] = useState(false);

  const handleSubmit = (formValues: CreateLaunchFormValues) => {
    // For now, just console.log the data as requested
    console.info('Create Launch Data:', {
      name: formValues.name,
      description: formValues.description,
      attributes: formValues.attributes,
      selectedTestsCount,
    });

    // Close the modal after logging
    dispatch(hideModalAction());

    return Promise.resolve();
  };

  return useModal({
    modalKey: CREATE_LAUNCH_MODAL_KEY,
    renderModal: () => (
      <CreateLaunchModal
        isLoading={isLoading}
        onSubmit={handleSubmit}
        selectedTestsCount={selectedTestsCount}
      />
    ),
  });
};
