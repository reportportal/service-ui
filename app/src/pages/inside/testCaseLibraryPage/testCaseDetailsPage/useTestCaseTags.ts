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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { GET_TEST_CASE_DETAILS_SUCCESS } from 'controllers/testCase/constants';
import { testCaseDetailsSelector } from 'controllers/testCase';

import { Tag, ExtendedTestCase, isTag, UseTestCaseTagsParams } from '../types';

export const useTestCaseTags = ({ testCaseId }: UseTestCaseTagsParams) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const testCaseDetails = useSelector(testCaseDetailsSelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const updateTestCaseTags = useCallback(
    async (attributes: Tag[]) => {
      try {
        showSpinner();

        const dataToSend = {
          attributes: attributes.map((attr) => {
            const payload: { id?: number; key: string } = { key: attr.key };
            if (attr.id > 0) {
              payload.id = attr.id;
            }
            return payload;
          }),
        };

        const response = await fetch<ExtendedTestCase>(
          URLS.testCaseDetails(projectKey, testCaseId),
          {
            method: 'PATCH',
            data: dataToSend,
          },
        );

        if (response) {
          dispatch({ type: GET_TEST_CASE_DETAILS_SUCCESS, payload: response });
          showSuccessNotification({ messageId: 'testCaseUpdatedSuccess' });
        }
      } catch (error: unknown) {
        showErrorNotification({
          message: (error as Error).message,
        });
      } finally {
        hideSpinner();
      }
    },
    [
      showSpinner,
      projectKey,
      testCaseId,
      dispatch,
      showSuccessNotification,
      showErrorNotification,
      hideSpinner,
    ],
  );

  const addTag = useCallback(
    async (tag: Tag) => {
      const currentAttributes = (testCaseDetails?.attributes || []).filter(isTag);

      const isTagExists = currentAttributes.some(({ key }) => key === tag.key);

      if (!isTagExists) {
        const updatedAttributes = [...currentAttributes, tag];
        await updateTestCaseTags(updatedAttributes);
      }
    },
    [updateTestCaseTags, testCaseDetails],
  );

  const removeTag = useCallback(
    async (tagKey: string) => {
      const currentAttributes = (testCaseDetails?.attributes || []).filter(isTag);

      const updatedAttributes = currentAttributes.filter(({ key }) => key !== tagKey);
      await updateTestCaseTags(updatedAttributes);
    },
    [updateTestCaseTags, testCaseDetails],
  );

  return {
    isLoading,
    addTag,
    removeTag,
    updateTestCaseTags,
  };
};
