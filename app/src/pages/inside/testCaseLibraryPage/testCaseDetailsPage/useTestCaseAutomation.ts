/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  getNativeAutomationState,
  type AutomationStartResult,
} from 'pages/inside/aiFactory/automation';
import { usePolling } from 'pages/inside/aiFactory/common';
import {
  AutomationStatus,
  type TestCaseAutomationState,
} from 'types/aiFactory';
import type { TestCase } from 'types/testCase';

interface AutomationReadState {
  scope: string;
  initialAutomation: TestCaseAutomationState;
  automation: TestCaseAutomationState;
  isLoading: boolean;
  isError: boolean;
}

interface AutomationReadRequest {
  cancel?: () => void;
}

type AutomationCase = Pick<TestCase, 'id' | 'updatedAt' | 'automationState'>;

export const AUTOMATION_POLL_INTERVAL_MS = 30_000;

const getDetailsAutomation = (testCase?: AutomationCase) => {
  const automation = getNativeAutomationState(testCase);
  return automation?.status === AutomationStatus.IN_PROGRESS && !automation.iteration
    ? undefined
    : automation;
};

export const useTestCaseAutomation = (projectKey: string, testCase?: AutomationCase) => {
  const testCaseId = testCase?.id;
  const initialAutomation = getDetailsAutomation(testCase);
  const scope =
    projectKey && testCaseId && initialAutomation
      ? JSON.stringify([projectKey, testCaseId, testCase.updatedAt])
      : '';
  const activeScope = useRef('');
  const activeRequest = useRef<AutomationReadRequest>();
  const [readState, setReadState] = useState<AutomationReadState>();
  const currentRead =
    readState?.scope === scope && readState.initialAutomation === initialAutomation
      ? readState
      : undefined;
  const automation = scope ? (currentRead?.automation ?? initialAutomation) : undefined;
  const isLoading = currentRead?.isLoading ?? false;
  const isError = currentRead?.isError ?? false;

  useEffect(() => {
    activeScope.current = scope;
    return () => {
      activeScope.current = '';
      activeRequest.current?.cancel?.();
      activeRequest.current = undefined;
    };
  }, [initialAutomation, scope]);

  const reload = useCallback(async () => {
    if (
      !scope ||
      activeScope.current !== scope ||
      !testCaseId ||
      !initialAutomation ||
      !automation ||
      activeRequest.current
    ) {
      return;
    }

    const request: AutomationReadRequest = {};
    activeRequest.current = request;
    setReadState((current) => ({
      scope,
      initialAutomation,
      automation:
        current?.scope === scope && current.initialAutomation === initialAutomation
          ? current.automation
          : automation,
      isLoading: true,
      isError: false,
    }));

    try {
      const response = await fetch<AutomationCase>(URLS.testCaseDetails(projectKey, testCaseId), {
        abort: (cancel) => {
          request.cancel = cancel;
        },
      });
      const nextAutomation =
        response?.id === testCaseId ? getDetailsAutomation(response) : undefined;
      if (!nextAutomation) throw new Error('Invalid Test Case automation state');

      if (activeRequest.current === request) {
        setReadState({
          scope,
          initialAutomation,
          automation: nextAutomation,
          isLoading: false,
          isError: false,
        });
      }
    } catch {
      if (activeRequest.current === request) {
        setReadState((current) => ({
          scope,
          initialAutomation,
          automation:
            current?.scope === scope && current.initialAutomation === initialAutomation
              ? current.automation
              : automation,
          isLoading: false,
          isError: true,
        }));
      }
    } finally {
      if (activeRequest.current === request) activeRequest.current = undefined;
    }
  }, [automation, initialAutomation, projectKey, scope, testCaseId]);

  const onStarted = useCallback(
    (response: AutomationStartResult) => {
      if (
        !scope ||
        activeScope.current !== scope ||
        !testCaseId ||
        !initialAutomation ||
        !automation ||
        !response.accepted.includes(testCaseId)
      ) {
        return;
      }

      activeRequest.current?.cancel?.();
      activeRequest.current = undefined;
      if (response.recovery) {
        void reload();
        return;
      }
      setReadState({
        scope,
        initialAutomation,
        automation: {
          ciConnection: automation.ciConnection,
          fixInProgress: false,
          status: AutomationStatus.IN_PROGRESS,
          iteration: response.iteration,
          scenarioChangedAfterAutomation: false,
        },
        isLoading: false,
        isError: false,
      });
      void reload();
    },
    [automation, initialAutomation, reload, scope, testCaseId],
  );

  usePolling(
    reload,
    AUTOMATION_POLL_INTERVAL_MS,
    automation?.status === AutomationStatus.IN_PROGRESS && !isError,
  );

  return { automation, isLoading, isError, onStarted, reload };
};
