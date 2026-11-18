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
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Button, Modal } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MODAL_Z_INDEX } from 'common/constants/zIndex';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { urlOrganizationSlugSelector, urlProjectSlugSelector } from 'controllers/pages';
import { projectKeySelector } from 'controllers/project';
import { activeProjectKeySelector } from 'controllers/user';
import { AiDetailsSectionState } from 'pages/inside/aiFactory/common/aiDetailsSectionState';

import { loadProjectQualityStandard, type ProjectQualityStandard } from './projectQualityStandard';
import { messages } from './messages';

import styles from './nativeTestCaseMetrics.scss';

const cx = classNames.bind(styles);

interface QualityStandardModalProps {
  projectKey: string;
  onClose: () => void;
}

type QualityStandardState =
  | { status: 'loading' | 'error' }
  | { status: 'ready'; standard: ProjectQualityStandard | null };

const QualityStandardModal = ({ projectKey, onClose }: QualityStandardModalProps) => {
  const { formatMessage } = useIntl();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<QualityStandardState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    loadProjectQualityStandard(projectKey, controller.signal)
      .then((standard) => {
        if (!controller.signal.aborted) setState({ status: 'ready', standard });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' });
      });

    return () => controller.abort();
  }, [projectKey, attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((previous) => previous + 1);
  };
  const standard = state.status === 'ready' ? state.standard : null;

  return (
    <Modal
      title={formatMessage(messages.currentQualityStandard)}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CLOSE) }}
      onClose={onClose}
      zIndex={MODAL_Z_INDEX}
      scrollable
    >
      <AiDetailsSectionState
        className={cx('quality-standard')}
        isLoading={state.status === 'loading'}
        isError={state.status === 'error'}
        loadingLabel={formatMessage(messages.qualityStandardLoading)}
        errorMessage={formatMessage(messages.qualityStandardError)}
        retryLabel={formatMessage(messages.qualityStandardRetry)}
        retryAutomationId="retry-project-quality-standard"
        onRetry={retry}
      >
        {standard ? (
          <div className={cx('quality-standard')}>
            <strong>{standard.name}</strong>
            {standard.description && <p>{standard.description}</p>}
            {standard.criteria.length ? (
              <ul className={cx('quality-standard__criteria')}>
                {standard.criteria.map(({ id, name, maxPoints }) => (
                  <li key={id}>
                    {formatMessage(messages.qualityStandardCriterion, { name, points: maxPoints })}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{formatMessage(messages.qualityStandardEmpty)}</p>
            )}
          </div>
        ) : (
          <p>{formatMessage(messages.qualityStandardUnavailable)}</p>
        )}
      </AiDetailsSectionState>
    </Modal>
  );
};

interface QualityStandardActionProps {
  projectKey: string;
}

const QualityStandardAction = ({ projectKey }: QualityStandardActionProps) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="text"
        adjustWidthOn="content"
        data-automation-id="open-project-quality-standard"
        onClick={() => setIsOpen(true)}
      >
        {formatMessage(messages.currentQualityStandard)}
      </Button>
      {isOpen && <QualityStandardModal projectKey={projectKey} onClose={() => setIsOpen(false)} />}
    </div>
  );
};

interface CurrentQualityStandardProps {
  testCaseId: number;
}

export const CurrentQualityStandard = ({ testCaseId }: CurrentQualityStandardProps) => {
  const isAiFactoryEnabled = useAiFactoryEnabled();
  const projectKey = useSelector(projectKeySelector);
  const activeProjectKey = useSelector(activeProjectKeySelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);

  if (!isAiFactoryEnabled || !projectKey || projectKey !== activeProjectKey) return null;

  return (
    <QualityStandardAction
      key={`${organizationSlug}:${projectSlug}:${projectKey}:${testCaseId}`}
      projectKey={projectKey}
    />
  );
};
