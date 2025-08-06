import { useDispatch, useSelector } from 'react-redux';
import { SubmissionError } from 'redux-form';
import { useIntl } from 'react-intl';

import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { getTestCasesAction } from 'controllers/testCase';

import { CreateTestCaseFormData } from './createTestCaseModal';
import { messages } from './basicInformation/messages';

export interface TestStep {
  instructions: string;
  expectedResult: string;
  attachments?: string[];
}

const testFolderId = 1;

export const useCreateTestCase = () => {
  const { isLoading: isCreateTestCaseLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector) as string;
  const { formatMessage } = useIntl();

  const createTestCase = async (payload: CreateTestCaseFormData) => {
    try {
      showSpinner();

      await fetch(URLS.testCase(projectKey), {
        method: 'post',
        description: payload.description,
        data: {
          name: payload.name,
          testFolder: {
            id: testFolderId,
          },
          priority: payload.priority.toUpperCase(),
          defaultVersion: {
            manualScenario: {
              executionEstimationTime: payload.executionEstimationTime,
              linkToRequirements: payload.linkToRequirements,
              manualScenarioType: payload.manualScenarioType,
              preconditions: {
                value: payload.precondition,
              },
              steps: Object.values(payload?.steps ?? {}),
            },
          },
        },
      });

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'testCaseCreatedSuccess',
        }),
      );
      dispatch(getTestCasesAction({ testFolderId }));
    } catch (error) {
      if (error?.message?.includes('tms_test_case_name_folder_unique')) {
        throw new SubmissionError({
          name: formatMessage(messages.duplicateTestCaseName),
        });
      } else {
        dispatch(
          showErrorNotification({
            messageId: 'testCaseCreationFailed',
          }),
        );
      }
    } finally {
      hideSpinner();
    }
  };

  return {
    isCreateTestCaseLoading,
    createTestCase,
  };
};
