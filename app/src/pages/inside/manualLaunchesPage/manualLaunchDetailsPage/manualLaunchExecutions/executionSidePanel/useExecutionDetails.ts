import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useDebouncedSpinner } from "common/hooks";
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showErrorNotification } from "controllers/notification";
import { projectKeySelector } from "controllers/project";
import { Attachment, Attribute, ExecutionComment, TestFolder } from "controllers/manualLaunch/types";
import { useManualLaunchId } from "hooks/useTypedSelector";
import { TestCasePriority } from "pages/inside/common/priorityIcon/types";
import { UrlsHelper } from "pages/inside/manualLaunchesPage/types";
import { ManualScenario, Requirement } from "pages/inside/testCaseLibraryPage/types";

interface ExecutionItem {
  id: number;
  executionStatus: string;
  executionComment: ExecutionComment | null;
  startedAt: number;
  finishedAt: number;
  duration: number;
  testCaseVersionId: number;
  testItemId: number;
  testCaseId: number;
  testCaseName: string;
  testCaseDescription: string;
  testCasePriority: TestCasePriority;
  testFolder: TestFolder;
  manualScenario: ManualScenario | null;
  attributes: Attribute[];
  requirements?: Requirement[];
  tags?: string[];
  attachments: Attachment[];
};

export const useExecutionDetails = (executionId: number | null) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const [executionDetails, setExecutionDetails] = useState<ExecutionItem | null>(null);
  const projectKey = useSelector(projectKeySelector);
  const launchId = useManualLaunchId();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!executionId || !launchId) {
      setExecutionDetails(null);
      return;
    }

    const abortController = new AbortController();

    const fetchExecutionDetails = async () => {
      try {
        showSpinner();

        const response = await fetch<ExecutionItem>((URLS as UrlsHelper).manualLaunchExecutionById(projectKey, launchId, executionId));

        setExecutionDetails(response);
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        dispatch(
          showErrorNotification({
            messageId: 'errorOccurredTryAgain',
          }),
        );
      } finally {
        if (!abortController.signal.aborted) {
          hideSpinner();
        }
      }
    };

    void fetchExecutionDetails();

    return () => {
      abortController.abort();
    };
  }, [executionId, projectKey]);

  return {
    executionDetails,
    isLoading,
  };
};
