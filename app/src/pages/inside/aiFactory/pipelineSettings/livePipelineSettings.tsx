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

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  Button,
  ConfigurationIcon,
  FieldText,
  Modal,
  SystemMessage,
  Toggle,
} from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MODAL_Z_INDEX } from 'common/constants/zIndex';
import { useModal, type UseModalData } from 'common/hooks';
import { URLS } from 'common/urls';
import { createClassnames, fetch } from 'common/utils';
import {
  adaptLivePipeline,
  getPipelinesAction,
  isReducedPipeline,
  pipelineCatalogProjectKeySelector,
  pipelineCatalogRequestSelector,
  pipelineCatalogTransportSelector,
  pipelinesSelector,
  type ReducedPipeline,
} from 'controllers/aiFactory/pipelines';
import { hideModalAction, withModal } from 'controllers/modal';
import { showSuccessNotification } from 'controllers/notification';
import { currentPathSelector, pipelineIdSelector } from 'controllers/pages';
import { projectKeySelector } from 'controllers/project';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { AiDetailsSectionState } from 'pages/inside/aiFactory/common/aiDetailsSectionState';
import type { PipelineSettingsState } from 'pages/inside/aiFactory/pipelineSettings/pipelineSettingsProvenance';
import { parseThreshold } from 'pages/inside/aiFactory/pipelineSettings/pipelineSettingsUtils';
import {
  PipelineCiConnectionOverview,
  PipelineCiConnectionSettings,
} from 'pages/inside/aiFactory/pipelineSettings/pipelineCiConnectionSettings';

import { messages } from 'pages/inside/aiFactory/pipelineSettings/messages';
import styles from 'pages/inside/aiFactory/pipelineSettings/pipelineSettings.scss';

const cx = createClassnames(styles);
const LIVE_PIPELINE_SETTINGS_MODAL_KEY = 'livePipelineSettingsModal';

interface PipelineSettingsTarget {
  pipelineId: number;
  projectKey: string;
}

interface LivePipelineSettingsData extends PipelineSettingsTarget {
  iterationPath?: string;
}

export interface LivePipelineSettingsButtonProps {
  pipelineId: number;
  fromIteration?: boolean;
}

interface PipelineSettingsResponse {
  attempt: number;
  pipeline: ReducedPipeline | null;
}

interface AutoReadyDraft {
  enabled: boolean;
  thresholdValue: string;
  reset?: boolean;
}

interface PipelineSettingsDialogProps {
  children: ReactNode;
  save?: () => void;
  canSave?: boolean;
  isSaving?: boolean;
}

export const selectLivePipelineSettings = (
  state: PipelineSettingsState,
  { pipelineId, projectKey }: LivePipelineSettingsData,
): ReducedPipeline | null => {
  if (
    projectKeySelector(state) !== projectKey ||
    pipelineCatalogProjectKeySelector(state) !== projectKey ||
    pipelineCatalogTransportSelector(state) !== 'live'
  ) {
    return null;
  }
  const pipeline = pipelinesSelector(state)?.find(({ id }) => id === pipelineId);
  return pipeline && isReducedPipeline(pipeline) ? pipeline : null;
};

const isCurrentIteration = (
  state: PipelineSettingsState,
  { pipelineId, projectKey, iterationPath }: LivePipelineSettingsData,
): boolean =>
  Boolean(projectKey && iterationPath) &&
  Number.isSafeInteger(pipelineId) &&
  pipelineId > 0 &&
  projectKeySelector(state) === projectKey &&
  pipelineIdSelector(state) === pipelineId &&
  currentPathSelector(state) === iterationPath;

const PipelineSettingsDialog = ({
  children,
  save,
  canSave = false,
  isSaving = false,
}: PipelineSettingsDialogProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  return (
    <Modal
      title={formatMessage(messages.title)}
      size="large"
      scrollable
      okButton={
        save
          ? { children: formatMessage(COMMON_LOCALE_KEYS.SAVE), disabled: !canSave, onClick: save }
          : undefined
      }
      cancelButton={{
        children: formatMessage(save ? COMMON_LOCALE_KEYS.CANCEL : COMMON_LOCALE_KEYS.CLOSE),
        disabled: isSaving,
      }}
      allowCloseOutside={!isSaving}
      onClose={() => {
        if (!isSaving) dispatch(hideModalAction());
      }}
      zIndex={MODAL_Z_INDEX}
    >
      <div className={cx('settings')}>{children}</div>
    </Modal>
  );
};

const canOpenSettings = (state: PipelineSettingsState, data: LivePipelineSettingsData): boolean =>
  data.iterationPath !== undefined
    ? isCurrentIteration(state, data)
    : Boolean(selectLivePipelineSettings(state, data));

const loadPipeline = async (
  { projectKey, pipelineId }: PipelineSettingsTarget,
  signal: AbortSignal,
): Promise<ReducedPipeline> =>
  adaptLivePipeline(await fetch(URLS.pipelineById(projectKey, pipelineId), { signal }), pipelineId);

const toDraft = (autoReady?: ReducedPipeline['autoReady']): AutoReadyDraft => ({
  enabled: Boolean(autoReady?.enabled),
  thresholdValue: String(autoReady?.threshold ?? ''),
});

const CurrentPipelineSettingsModal = (data: LivePipelineSettingsData) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const store = useStore<PipelineSettingsState>();
  const { canManagePipelineSettings } = useUserPermissions();
  const { projectKey, pipelineId, iterationPath } = data;
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<PipelineSettingsResponse>();
  const [draft, setDraft] = useState<AutoReadyDraft>(() => toDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [isCiBusy, setIsCiBusy] = useState(false);
  const [feedback, setFeedback] = useState<keyof typeof messages>();
  const saveRequest = useRef<AbortController>();

  useEffect(() => () => saveRequest.current?.abort(), []);

  useEffect(() => {
    const controller = new AbortController();

    loadPipeline({ projectKey, pipelineId }, controller.signal)
      .then((pipeline) => {
        if (!controller.signal.aborted) {
          setResponse({ attempt, pipeline });
          setDraft(toDraft(pipeline.autoReady));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResponse({ attempt, pipeline: null });
        }
      });

    return () => controller.abort();
  }, [attempt, pipelineId, projectKey]);

  const current = response?.attempt === attempt ? response : undefined;
  const pipeline = current?.pipeline;
  const isGeneration = pipeline?.type === 'TEST_CASE_GENERATION';
  const autoReady = isGeneration ? pipeline?.autoReady : undefined;
  const canEdit = Boolean(autoReady && canManagePipelineSettings && isGeneration);
  const threshold = parseThreshold(draft.thresholdValue) ?? undefined;
  const isInvalidThreshold =
    threshold === undefined && (draft.enabled || draft.thresholdValue !== '');
  const hasChanges =
    draft.reset || draft.enabled !== autoReady?.enabled || threshold !== autoReady?.threshold;
  const canSave = canEdit && !isSaving && !isCiBusy && !isInvalidThreshold && hasChanges;
  const nextAutoReady = draft.reset
    ? null
    : { enabled: draft.enabled, ...(threshold === undefined ? {} : { threshold }) };

  const isCurrentRequest = (signal: AbortSignal) =>
    !signal.aborted && canOpenSettings(store.getState(), data);

  const verifySettings = async (signal: AbortSignal) => {
    const updated = await loadPipeline(data, signal);
    if (!isCurrentRequest(signal)) return;

    const wasSaved = nextAutoReady
      ? updated.hasAutoReadySettings &&
        nextAutoReady.enabled === updated.autoReady?.enabled &&
        nextAutoReady.threshold === updated.autoReady?.threshold
      : updated.autoReady && !updated.hasAutoReadySettings;
    if (!wasSaved) {
      setResponse({ attempt, pipeline: updated });
      setDraft(toDraft(updated.autoReady));
      setFeedback('liveSettingsChanged');
      return;
    }

    dispatch(showSuccessNotification({ message: formatMessage(messages.updateSuccess) }));
    dispatch(hideModalAction());
    if (iterationPath === undefined) {
      dispatch(getPipelinesAction(pipelineCatalogRequestSelector(store.getState()) ?? undefined));
    }
  };

  const save = async () => {
    if (!canSave || saveRequest.current || !canOpenSettings(store.getState(), data)) return;

    const controller = new AbortController();
    saveRequest.current = controller;
    setIsSaving(true);
    setFeedback(undefined);
    let didPatch = false;
    try {
      await fetch(URLS.pipelineById(projectKey, pipelineId), {
        method: 'PATCH',
        data: { settings: { autoReady: nextAutoReady } },
        signal: controller.signal,
      });
      didPatch = true;
      if (isCurrentRequest(controller.signal)) await verifySettings(controller.signal);
    } catch {
      if (isCurrentRequest(controller.signal)) {
        setFeedback(didPatch ? 'liveVerifyError' : 'updateFailed');
        if (didPatch) setResponse({ attempt, pipeline: null });
      }
    } finally {
      saveRequest.current = undefined;
      if (!controller.signal.aborted) setIsSaving(false);
    }
  };

  return (
    <PipelineSettingsDialog
      save={canEdit ? () => void save() : undefined}
      canSave={canSave}
      isSaving={isSaving || isCiBusy}
    >
      <AiDetailsSectionState
        className={cx('settings')}
        isLoading={!current}
        isError={pipeline === null}
        loadingLabel={formatMessage(messages.liveLoading)}
        errorMessage={formatMessage(
          feedback === 'liveVerifyError' ? messages.liveVerifyError : messages.liveLoadError,
        )}
        retryLabel={formatMessage(messages.liveRetry)}
        retryAutomationId="retryPipelineSettings"
        onRetry={() => {
          setFeedback(undefined);
          setAttempt((previous) => previous + 1);
        }}
      >
        {feedback && (
          <SystemMessage mode="error">{formatMessage(messages[feedback])}</SystemMessage>
        )}
        {autoReady && (
          <>
            {!canEdit && (
              <SystemMessage mode="info">{formatMessage(messages.readOnly)}</SystemMessage>
            )}
            <div className={cx('settings__toggle-row')}>
              <Toggle
                value={draft.enabled}
                aria-label={formatMessage(messages.autoReady)}
                disabled={!canEdit || isSaving}
                onChange={(event) =>
                  setDraft({
                    enabled: event.target.checked,
                    thresholdValue:
                      !event.target.checked && isInvalidThreshold
                        ? String(autoReady.threshold ?? '')
                        : draft.thresholdValue,
                  })
                }
              />
              <span>{formatMessage(messages.autoReady)}</span>
            </div>
            <p className={cx('settings__description')}>
              {formatMessage(messages.autoReadyDescription)}
            </p>
            <div className={cx('settings__live-threshold-group')}>
              <FieldText
                className={cx('settings__live-threshold')}
                label={formatMessage(messages.threshold)}
                helpText={formatMessage(messages.thresholdHelp)}
                value={draft.thresholdValue}
                inputMode="numeric"
                maxLength={3}
                disabled={!canEdit || isSaving || !draft.enabled}
                touched={isInvalidThreshold && draft.thresholdValue !== ''}
                error={isInvalidThreshold ? formatMessage(messages.thresholdError) : undefined}
                onChange={(event) => setDraft({ ...draft, thresholdValue: event.target.value })}
              />
            </div>
            {canEdit && (
              <p className={cx('settings__note')}>{formatMessage(messages.appliesNext)}</p>
            )}
            {canEdit && pipeline.hasAutoReadySettings && (
              <Button
                className={cx('settings__reset-auto-ready')}
                variant="text"
                adjustWidthOn="content"
                disabled={isSaving || draft.reset}
                onClick={() => setDraft({ ...toDraft(), reset: true })}
              >
                {formatMessage(messages.resetAutoReady)}
              </Button>
            )}
          </>
        )}
        {!autoReady && isGeneration && (
          <SystemMessage mode="info">{formatMessage(messages.liveNoSettings)}</SystemMessage>
        )}
        {pipeline && (
          <div className={cx({ settings__ci: autoReady })}>
            {canManagePipelineSettings ? (
              <PipelineCiConnectionSettings
                pipeline={pipeline}
                projectKey={projectKey}
                pipelineId={pipelineId}
                disabled={isSaving}
                onBusyChange={setIsCiBusy}
              />
            ) : (
              <PipelineCiConnectionOverview connection={pipeline.ciConnection} />
            )}
          </div>
        )}
      </AiDetailsSectionState>
    </PipelineSettingsDialog>
  );
};

export const LivePipelineSettingsModalContent = ({
  data,
}: UseModalData<LivePipelineSettingsData>) => {
  const { formatMessage } = useIntl();
  const isCurrent = useSelector((state: PipelineSettingsState) => canOpenSettings(state, data));
  const unavailable =
    data.iterationPath === undefined ? messages.liveUnavailable : messages.liveContextChanged;

  return isCurrent ? (
    <CurrentPipelineSettingsModal
      key={JSON.stringify([data.projectKey, data.pipelineId, data.iterationPath])}
      {...data}
    />
  ) : (
    <PipelineSettingsDialog>
      <SystemMessage mode="info">{formatMessage(unavailable)}</SystemMessage>
    </PipelineSettingsDialog>
  );
};

const LivePipelineSettingsModal = withModal(LIVE_PIPELINE_SETTINGS_MODAL_KEY)(
  LivePipelineSettingsModalContent,
);

export const LivePipelineSettingsButton = ({
  pipelineId,
  fromIteration = false,
}: LivePipelineSettingsButtonProps) => {
  const { formatMessage } = useIntl();
  const store = useStore<PipelineSettingsState>();
  const projectKey = useSelector(projectKeySelector);
  const iterationPath = useSelector((state: PipelineSettingsState) =>
    fromIteration ? currentPathSelector(state) : undefined,
  );
  const data = {
    pipelineId,
    projectKey,
    ...(fromIteration ? { iterationPath: iterationPath ?? '' } : {}),
  };
  const canOpen = useSelector((state: PipelineSettingsState) => canOpenSettings(state, data));
  const { openModal } = useModal<LivePipelineSettingsData>({
    modalKey: LIVE_PIPELINE_SETTINGS_MODAL_KEY,
    renderModal: (modalData) => <LivePipelineSettingsModal data={modalData} />,
  });

  const openSettings = () => {
    if (canOpenSettings(store.getState(), data)) {
      openModal(data);
    }
  };

  const unavailableMessage = fromIteration ? messages.liveContextChanged : messages.liveUnavailable;
  return (
    <span title={!canOpen ? formatMessage(unavailableMessage) : undefined}>
      <Button
        variant="text"
        adjustWidthOn="content"
        icon={<ConfigurationIcon />}
        data-automation-id={`pipelineSettingsButton-${pipelineId}`}
        disabled={!canOpen}
        onClick={openSettings}
      >
        {formatMessage(messages.action)}
      </Button>
    </span>
  );
};
