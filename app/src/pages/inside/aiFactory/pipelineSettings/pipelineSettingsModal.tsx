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
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useIntl } from 'react-intl';
import { FieldText, Modal, SystemMessage, Toggle } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MODAL_Z_INDEX } from 'common/constants/zIndex';
import type { UseModalData } from 'common/hooks';
import { URLS } from 'common/urls';
import { createClassnames, fetch } from 'common/utils';
import { getPipelinesAction } from 'controllers/aiFactory/pipelines';
import { hideModalAction, withModal } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PipelineRS, PipelineType } from 'types/aiFactory';

import { messages } from './messages';
import {
  matchesPipelineSettingsProvenance,
  type PipelineSettingsCatalogProvenance,
  type PipelineSettingsState,
} from './pipelineSettingsProvenance';
import { parseThreshold, toPipelineSettingsPatch } from './pipelineSettingsUtils';
import styles from './pipelineSettings.scss';

const cx = createClassnames(styles);

export const PIPELINE_SETTINGS_MODAL_KEY = 'pipelineSettingsModal';

export interface PipelineSettingsModalData {
  pipeline: PipelineRS;
  provenance?: PipelineSettingsCatalogProvenance;
}

export const PipelineSettingsModalContent = ({
  data: { pipeline, provenance },
}: UseModalData<PipelineSettingsModalData>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const store = useStore<PipelineSettingsState>();
  const hasMatchingProvenance = useSelector((state: PipelineSettingsState) =>
    matchesPipelineSettingsProvenance(state, pipeline, provenance),
  );
  const { canManagePipelineSettings } = useUserPermissions();
  const [isSaving, setIsSaving] = useState(false);
  const [autoReadyEnabled, setAutoReadyEnabled] = useState(
    Boolean(pipeline.settings?.autoReady),
  );
  const [thresholdValue, setThresholdValue] = useState(
    String(pipeline.settings?.threshold ?? ''),
  );

  const isGeneration = pipeline.type === PipelineType.GENERATION;
  const sourceProjectKey = provenance?.projectKey;
  const canEdit = Boolean(
    isGeneration &&
      pipeline.settings &&
      pipeline.settings.editable !== false &&
      hasMatchingProvenance &&
      canManagePipelineSettings,
  );
  const threshold = parseThreshold(thresholdValue);
  const hasChanges = Boolean(
    pipeline.settings &&
      (autoReadyEnabled !== pipeline.settings.autoReady || threshold !== pipeline.settings.threshold),
  );

  const close = () => {
    if (!isSaving) {
      dispatch(hideModalAction());
    }
  };

  const save = async () => {
    if (
      !matchesPipelineSettingsProvenance(store.getState(), pipeline, provenance) ||
      !canEdit ||
      !sourceProjectKey ||
      threshold === null
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await fetch(URLS.pipelineById(sourceProjectKey, pipeline.id), {
        method: 'PATCH',
        data: toPipelineSettingsPatch(autoReadyEnabled, threshold),
      });
      dispatch(getPipelinesAction());
      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.updateSuccess),
        }),
      );
      setIsSaving(false);
      dispatch(hideModalAction());
    } catch {
      dispatch(
        showErrorNotification({
          message: formatMessage(messages.updateFailed),
        }),
      );
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={formatMessage(messages.title)}
      okButton={
        canEdit
          ? {
              children: formatMessage(COMMON_LOCALE_KEYS.SAVE),
              disabled: isSaving || threshold === null || !hasChanges,
              onClick: () => void save(),
            }
          : undefined
      }
      cancelButton={{
        children: formatMessage(canEdit ? COMMON_LOCALE_KEYS.CANCEL : COMMON_LOCALE_KEYS.CLOSE),
        disabled: isSaving,
      }}
      allowCloseOutside={!isSaving}
      onClose={close}
      zIndex={MODAL_Z_INDEX}
    >
      <div className={cx('settings')}>
        {!isGeneration || !pipeline.settings ? (
          <p className={cx('settings__empty')}>
            {formatMessage(messages.automationNoSettings, { pipelineName: pipeline.name })}
          </p>
        ) : (
          <>
            {!canEdit && (
              <SystemMessage mode="info">{formatMessage(messages.readOnly)}</SystemMessage>
            )}
            <div className={cx('settings__toggle-row')}>
              <Toggle
                value={autoReadyEnabled}
                aria-label={formatMessage(messages.autoReady)}
                disabled={!canEdit || isSaving}
                onChange={(event) => setAutoReadyEnabled(event.target.checked)}
              />
              <span>{formatMessage(messages.autoReady)}</span>
            </div>
            <p className={cx('settings__description')}>
              {formatMessage(messages.autoReadyDescription)}
            </p>
            <FieldText
              className={cx('settings__threshold')}
              label={formatMessage(messages.threshold)}
              helpText={formatMessage(messages.thresholdHelp)}
              error={
                threshold === null && canEdit ? formatMessage(messages.thresholdError) : undefined
              }
              touched={threshold === null && canEdit}
              value={thresholdValue}
              inputMode="numeric"
              maxLength={3}
              disabled={!canEdit || !autoReadyEnabled || isSaving}
              onChange={(event) => setThresholdValue(event.target.value)}
            />
            <p className={cx('settings__note')}>{formatMessage(messages.appliesNext)}</p>
          </>
        )}
      </div>
    </Modal>
  );
};

export const PipelineSettingsModal = withModal(PIPELINE_SETTINGS_MODAL_KEY)(
  PipelineSettingsModalContent,
);
