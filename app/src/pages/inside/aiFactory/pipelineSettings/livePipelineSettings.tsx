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

import { useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useIntl, type IntlShape } from 'react-intl';
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
  isReducedPipeline,
  pipelineCatalogProjectKeySelector,
  pipelineCatalogTransportSelector,
  pipelinesSelector,
  type ReducedPipeline,
} from 'controllers/aiFactory/pipelines';
import { hideModalAction, withModal } from 'controllers/modal';
import { currentPathSelector, pipelineIdSelector } from 'controllers/pages';
import { projectKeySelector } from 'controllers/project';
import { AiDetailsSectionState } from 'pages/inside/aiFactory/common/aiDetailsSectionState';
import type { PipelineSettingsState } from 'pages/inside/aiFactory/pipelineSettings/pipelineSettingsProvenance';

import { messages } from './messages';
import styles from './pipelineSettings.scss';

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

const renderAutoReady = (pipeline: ReducedPipeline, formatMessage: IntlShape['formatMessage']) => {
  const autoReady = pipeline.autoReady;
  if (!autoReady) {
    return <SystemMessage mode="info">{formatMessage(messages.liveNoSettings)}</SystemMessage>;
  }

  return (
    <>
      <SystemMessage mode="info">{formatMessage(messages.liveReadOnly)}</SystemMessage>
      <div className={cx('settings__toggle-row')}>
        <Toggle value={autoReady.enabled} aria-label={formatMessage(messages.autoReady)} disabled />
        <span>{formatMessage(messages.autoReady)}</span>
      </div>
      <p className={cx('settings__description')}>{formatMessage(messages.autoReadyDescription)}</p>
      {autoReady.threshold === undefined ? (
        <p className={cx('settings__empty')}>{formatMessage(messages.liveThresholdUnavailable)}</p>
      ) : (
        <div className={cx('settings__live-threshold-group')}>
          <FieldText
            className={cx('settings__live-threshold')}
            label={formatMessage(messages.threshold)}
            value={String(autoReady.threshold)}
            disabled
          />
        </div>
      )}
    </>
  );
};

const DirectPipelineSettings = ({ pipelineId, projectKey }: PipelineSettingsTarget) => {
  const { formatMessage } = useIntl();
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<PipelineSettingsResponse>();

  useEffect(() => {
    const controller = new AbortController();

    fetch(URLS.pipelineById(projectKey, pipelineId), { signal: controller.signal })
      .then((payload) => adaptLivePipeline(payload, pipelineId))
      .then((pipeline) => {
        if (!controller.signal.aborted) {
          setResponse({ attempt, pipeline });
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
  return (
    <AiDetailsSectionState
      className={cx('settings')}
      isLoading={!current}
      isError={current?.pipeline === null}
      loadingLabel={formatMessage(messages.liveLoading)}
      errorMessage={formatMessage(messages.liveLoadError)}
      retryLabel={formatMessage(messages.liveRetry)}
      retryAutomationId="retryPipelineSettings"
      onRetry={() => setAttempt((previous) => previous + 1)}
    >
      {current?.pipeline && renderAutoReady(current.pipeline, formatMessage)}
    </AiDetailsSectionState>
  );
};

const IterationPipelineSettings = (data: LivePipelineSettingsData) => {
  const { formatMessage } = useIntl();
  const isCurrent = useSelector((state: PipelineSettingsState) => isCurrentIteration(state, data));

  return isCurrent ? (
    <DirectPipelineSettings
      key={`${data.projectKey}:${data.iterationPath}`}
      pipelineId={data.pipelineId}
      projectKey={data.projectKey}
    />
  ) : (
    <SystemMessage mode="info">{formatMessage(messages.liveContextChanged)}</SystemMessage>
  );
};

export const LivePipelineSettingsModalContent = ({
  data,
}: UseModalData<LivePipelineSettingsData>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const fromIteration = data.iterationPath !== undefined;
  const pipeline = useSelector((state: PipelineSettingsState) =>
    fromIteration ? null : selectLivePipelineSettings(state, data),
  );
  const catalogContent = pipeline ? (
    renderAutoReady(pipeline, formatMessage)
  ) : (
    <SystemMessage mode="info">{formatMessage(messages.liveUnavailable)}</SystemMessage>
  );

  return (
    <Modal
      title={formatMessage(messages.title)}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CLOSE) }}
      onClose={() => dispatch(hideModalAction())}
      zIndex={MODAL_Z_INDEX}
    >
      <div className={cx('settings')}>
        {fromIteration ? <IterationPipelineSettings {...data} /> : catalogContent}
      </div>
    </Modal>
  );
};

const LivePipelineSettingsModal = withModal(LIVE_PIPELINE_SETTINGS_MODAL_KEY)(
  LivePipelineSettingsModalContent,
);

const canOpenSettings = (state: PipelineSettingsState, data: LivePipelineSettingsData): boolean =>
  data.iterationPath !== undefined
    ? isCurrentIteration(state, data)
    : Boolean(selectLivePipelineSettings(state, data));

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
