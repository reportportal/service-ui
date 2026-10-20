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
import { createClassnames } from 'common/utils';
import {
  isReducedPipeline,
  pipelineCatalogProjectKeySelector,
  pipelineCatalogTransportSelector,
  pipelinesSelector,
  type ReducedPipeline,
} from 'controllers/aiFactory/pipelines';
import { hideModalAction, withModal } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';

import { messages } from './messages';
import type { PipelineSettingsState } from './pipelineSettingsProvenance';
import styles from './pipelineSettings.scss';

const cx = createClassnames(styles);
const LIVE_PIPELINE_SETTINGS_MODAL_KEY = 'livePipelineSettingsModal';

interface LivePipelineSettingsData {
  pipelineId: number;
  projectKey: string;
}

export interface LivePipelineSettingsButtonProps {
  pipelineId: number;
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

export const LivePipelineSettingsModalContent = ({
  data,
}: UseModalData<LivePipelineSettingsData>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const pipeline = useSelector((state: PipelineSettingsState) =>
    selectLivePipelineSettings(state, data),
  );
  const autoReady = pipeline?.autoReady;

  return (
    <Modal
      title={formatMessage(messages.title)}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CLOSE) }}
      onClose={() => dispatch(hideModalAction())}
      zIndex={MODAL_Z_INDEX}
    >
      <div className={cx('settings')}>
        {!pipeline && (
          <SystemMessage mode="info">{formatMessage(messages.liveUnavailable)}</SystemMessage>
        )}
        {pipeline && !autoReady && (
          <SystemMessage mode="info">{formatMessage(messages.liveNoSettings)}</SystemMessage>
        )}
        {autoReady && (
          <>
            <SystemMessage mode="info">{formatMessage(messages.liveReadOnly)}</SystemMessage>
            <div className={cx('settings__toggle-row')}>
              <Toggle
                value={autoReady.enabled}
                aria-label={formatMessage(messages.autoReady)}
                disabled
              />
              <span>{formatMessage(messages.autoReady)}</span>
            </div>
            <p className={cx('settings__description')}>
              {formatMessage(messages.autoReadyDescription)}
            </p>
            {autoReady.threshold === undefined ? (
              <p className={cx('settings__empty')}>
                {formatMessage(messages.liveThresholdUnavailable)}
              </p>
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
        )}
      </div>
    </Modal>
  );
};

const LivePipelineSettingsModal = withModal(LIVE_PIPELINE_SETTINGS_MODAL_KEY)(
  LivePipelineSettingsModalContent,
);

export const LivePipelineSettingsButton = ({ pipelineId }: LivePipelineSettingsButtonProps) => {
  const { formatMessage } = useIntl();
  const store = useStore<PipelineSettingsState>();
  const projectKey = useSelector(projectKeySelector);
  const data = { pipelineId, projectKey };
  const pipeline = useSelector((state: PipelineSettingsState) =>
    selectLivePipelineSettings(state, data),
  );
  const { openModal } = useModal<LivePipelineSettingsData>({
    modalKey: LIVE_PIPELINE_SETTINGS_MODAL_KEY,
    renderModal: (modalData) => <LivePipelineSettingsModal data={modalData} />,
  });

  const openSettings = () => {
    if (selectLivePipelineSettings(store.getState(), data)) {
      openModal(data);
    }
  };

  return (
    <span title={!pipeline ? formatMessage(messages.liveUnavailable) : undefined}>
      <Button
        variant="text"
        adjustWidthOn="content"
        icon={<ConfigurationIcon />}
        data-automation-id={`pipelineSettingsButton-${pipelineId}`}
        disabled={!pipeline}
        onClick={openSettings}
      >
        {formatMessage(messages.action)}
      </Button>
    </span>
  );
};
