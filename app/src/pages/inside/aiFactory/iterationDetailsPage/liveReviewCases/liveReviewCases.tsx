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
import { Button, SystemMessage } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import { CaseLink } from '../stagePanels/caseLink';
import { getLiveLibraryCases, type LiveLibraryCase } from './liveLibraryCases';
import { messages } from './messages';
import styles from './liveReviewCases.scss';

const cx = createClassnames(styles);
const MAX_CASES = 50;

export interface LiveReviewCasesProps {
  displayIds: string[];
  projectKey: string;
}

interface CaseResult {
  displayId: string;
  testCase: LiveLibraryCase | null;
}

export const LiveReviewCases = ({ displayIds, projectKey }: LiveReviewCasesProps) => {
  const { formatMessage } = useIntl();
  const [response, setResponse] = useState<{ requestKey: string; results: CaseResult[] } | null>(
    null,
  );
  const [retry, setRetry] = useState(0);
  const idsKey = JSON.stringify(displayIds);
  const requestKey = `${projectKey}:${idsKey}:${retry}`;
  const results = response?.requestKey === requestKey ? response.results : null;

  useEffect(() => {
    if (!projectKey || !displayIds.length || displayIds.length > MAX_CASES) return;
    const controller = new AbortController();
    getLiveLibraryCases(projectKey, JSON.parse(idsKey) as string[], controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResponse({ requestKey, results: data });
      },
    );
    return () => controller.abort();
  }, [projectKey, idsKey, requestKey, displayIds.length]);

  return (
    <section className={cx('live-review-cases')} data-automation-id="liveReviewCases">
      <div className={cx('live-review-cases__heading')}>
        <h3>{formatMessage(messages.title)}</h3>
        {displayIds.length > 0 && displayIds.length <= MAX_CASES && (
          <Button variant="text" onClick={() => setRetry((value) => value + 1)}>
            {formatMessage(messages.refresh)}
          </Button>
        )}
      </div>
      {!displayIds.length && (
        <SystemMessage mode="info">{formatMessage(messages.noReferences)}</SystemMessage>
      )}
      {displayIds.length > MAX_CASES && (
        <SystemMessage mode="info">{formatMessage(messages.tooManyReferences)}</SystemMessage>
      )}
      {displayIds.length > 0 && displayIds.length <= MAX_CASES && !results && (
        <output aria-live="polite">{formatMessage(messages.loading)}</output>
      )}
      {results && (
        <div className={cx('live-review-cases__scroll')}>
          <table>
            <thead>
              <tr>
                <th scope="col">{formatMessage(messages.caseColumn)}</th>
                <th scope="col">{formatMessage(messages.nameColumn)}</th>
                <th scope="col">{formatMessage(messages.statusColumn)}</th>
                <th scope="col">{formatMessage(messages.scoreColumn)}</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ displayId, testCase }) => (
                <tr key={displayId}>
                  <td>
                    {testCase ? <CaseLink testCaseId={testCase.id} name={displayId} /> : displayId}
                  </td>
                  <td>{testCase?.name || formatMessage(messages.unresolved)}</td>
                  <td>
                    {testCase?.status ? (
                      <span
                        className={cx(
                          'live-review-cases__status',
                          `live-review-cases__status--${testCase.status.toLowerCase()}`,
                        )}
                      >
                        {formatMessage(messages[testCase.status === 'READY' ? 'ready' : 'draft'])}
                      </span>
                    ) : (
                      formatMessage(messages.unavailable)
                    )}
                  </td>
                  <td>{testCase?.overallScore ?? formatMessage(messages.unavailable)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
