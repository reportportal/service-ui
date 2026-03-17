import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { getManualLaunchExecutionAction } from 'controllers/manualLaunch';
import { hideModalAction } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { ClearStatusModalData, EXECUTION_STATUSES } from './types';

export const useClearStatus = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();

  // Cast URLS.clearExecutionStatus to a typed function (source is untyped .js)
  const clearExecutionStatusUrl = URLS.clearExecutionStatus as (
    projectKey: string,
    launchId: string,
    executionId: string,
  ) => string;

  const clearStatus = useCallback(
    async (payload: ClearStatusModalData) => {
      showSpinner();

      try {
        await fetch(clearExecutionStatusUrl(projectKey, payload.launchId, payload.executionId), {
          method: 'patch',
          data: {
            status: EXECUTION_STATUSES.TO_RUN,
          },
        });

        showSuccessNotification({ messageId: 'executionStatusClearedSuccess' });

        dispatch(hideModalAction());
        dispatch(
          getManualLaunchExecutionAction({
            launchId: payload.launchId,
            executionId: payload.executionId,
          }),
        );
      } catch {
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        });
      } finally {
        hideSpinner();
      }
    },
    [
      showSpinner,
      hideSpinner,
      showErrorNotification,
      dispatch,
      projectKey,
      showSuccessNotification,
      clearExecutionStatusUrl,
    ],
  );

  return { isLoading, clearStatus };
};
