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
import { useIntl } from 'react-intl';
import { Dropdown, Modal, SystemMessage } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MODAL_Z_INDEX } from 'common/constants/zIndex';
import type { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { hideModalAction, withModal } from 'controllers/modal';
import { IterationRS, PipelineRS } from 'types/aiFactory';

import { messages } from './messages';
import styles from './rerunModal.scss';

const cx = createClassnames(styles);

export const ITERATION_RERUN_MODAL_KEY = 'aiFactoryIterationRerunModal';

export interface IterationRerunModalData {
  pipeline: PipelineRS;
  iteration: IterationRS;
}

export const IterationRerunModalContent = ({
  data: { pipeline, iteration },
}: UseModalData<IterationRerunModalData>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [model, setModel] = useState(iteration.model);
  const [environment, setEnvironment] = useState(iteration.environment);
  const rerunOptions = pipeline.rerunOptions;

  return (
    <Modal
      title={formatMessage(messages.title)}
      okButton={{
        children: formatMessage(messages.action),
        disabled: true,
      }}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CANCEL) }}
      onClose={() => dispatch(hideModalAction())}
      zIndex={MODAL_Z_INDEX}
    >
      <div className={cx('rerun-modal')} data-automation-id="iterationRerunModal">
        <p className={cx('rerun-modal__description')}>
          {formatMessage(messages.description, {
            pipeline: pipeline.name,
            number: iteration.number,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <dl className={cx('rerun-modal__details')}>
          <dt>{formatMessage(messages.requirement)}</dt>
          <dd>
            {iteration.requirement
              ? `${iteration.requirement.specId} · ${iteration.requirement.title}`
              : '—'}
          </dd>
          <dt>{formatMessage(messages.rerunOf)}</dt>
          <dd>{formatMessage(messages.iteration, { number: iteration.number })}</dd>
        </dl>
        {rerunOptions && (
          <div className={cx('rerun-modal__controls')}>
            <Dropdown
              className={cx('rerun-modal__select')}
              data-automation-id="rerunModel"
              label={formatMessage(messages.model)}
              options={rerunOptions.models.map((value) => ({ label: value, value }))}
              value={model}
              onChange={(value) => {
                if (!Array.isArray(value) && typeof value === 'string') {
                  setModel(value);
                }
              }}
            />
            <Dropdown
              className={cx('rerun-modal__select')}
              data-automation-id="rerunEnvironment"
              label={formatMessage(messages.environment)}
              options={rerunOptions.environments.map((value) => ({ label: value, value }))}
              value={environment}
              onChange={(value) => {
                if (!Array.isArray(value) && typeof value === 'string') {
                  setEnvironment(value);
                }
              }}
            />
          </div>
        )}
        <div className={cx('rerun-modal__notice')}>
          <SystemMessage mode="info">{formatMessage(messages.contractUnavailable)}</SystemMessage>
        </div>
      </div>
    </Modal>
  );
};

export const IterationRerunModal = withModal(ITERATION_RERUN_MODAL_KEY)(
  IterationRerunModalContent,
);
