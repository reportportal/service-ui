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

import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, SystemMessage } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import {
  getLiveLibraryCases,
  type LiveLibraryCase,
  type LiveLibraryCasesPage,
} from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases';
import { CaseLink } from 'pages/inside/aiFactory/iterationDetailsPage/stagePanels/caseLink';
import { messages } from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/messages';
import styles from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveReviewCases.scss';

const cx = createClassnames(styles);
const PAGE_SIZE = 25;

export interface LiveReviewCasesProps {
  projectKey: string;
  iterationId: number;
  refreshVersion?: number | object;
}

interface ReviewPageState {
  scope: object;
  page: number;
  request: object;
  data?: LiveLibraryCasesPage;
  totalElements?: number;
  hasError?: boolean;
}

export const LiveReviewCases = ({
  projectKey,
  iterationId,
  refreshVersion,
}: LiveReviewCasesProps) => {
  const { formatMessage } = useIntl();
  const scope = useMemo(() => ({ projectKey, iterationId }), [projectKey, iterationId]);
  const [selection, setSelection] = useState<{ scope: object; page: number }>();
  const [state, setState] = useState<ReviewPageState>();
  const [revision, setRevision] = useState(0);
  const page = selection?.scope === scope ? selection.page : 0;
  const request = useMemo(
    () => ({ scope, page, revision, refreshVersion }),
    [scope, page, revision, refreshVersion],
  );
  const currentScope = state?.scope === scope ? state : undefined;
  const results = currentScope?.page === page ? currentScope.data : undefined;
  const pageCount = Math.ceil((currentScope?.totalElements ?? 0) / PAGE_SIZE);
  const isLoading = currentScope?.request !== request;
  const hasError = !isLoading && currentScope?.hasError;

  useEffect(() => {
    const controller = new AbortController();
    getLiveLibraryCases(
      projectKey,
      iterationId,
      page * PAGE_SIZE,
      PAGE_SIZE,
      controller.signal,
    ).then(
      (data) => {
        if (controller.signal.aborted) return;
        const lastPage = Math.max(0, Math.ceil(data.totalElements / PAGE_SIZE) - 1);
        if (page > lastPage) {
          setSelection({ scope, page: lastPage });
          return;
        }
        setState({ scope, page, request, data, totalElements: data.totalElements });
      },
      () => {
        if (controller.signal.aborted) return;
        setState((previous) => ({
          scope,
          page,
          request,
          data: previous?.scope === scope && previous.page === page ? previous.data : undefined,
          totalElements: previous?.scope === scope ? previous.totalElements : undefined,
          hasError: true,
        }));
      },
    );
    return () => controller.abort();
  }, [projectKey, iterationId, page, request, scope]);

  return (
    <section className={cx('live-review-cases')} data-automation-id="liveReviewCases">
      <div className={cx('live-review-cases__heading')}>
        <h3>{formatMessage(messages.title)}</h3>
        <Button
          variant="text"
          disabled={isLoading}
          onClick={() => setRevision((value) => value + 1)}
        >
          {formatMessage(messages.refresh)}
        </Button>
      </div>
      {isLoading && !results && (
        <output aria-live="polite">{formatMessage(messages.loading)}</output>
      )}
      {hasError && <SystemMessage mode="error">{formatMessage(messages.error)}</SystemMessage>}
      {results?.totalElements === 0 && !hasError && (
        <SystemMessage mode="info">{formatMessage(messages.empty)}</SystemMessage>
      )}
      {!!results?.cases.length && <ReviewCaseTable cases={results.cases} />}
      {pageCount > 1 && (
        <div className={cx('live-review-cases__pagination')}>
          <Button
            variant="text"
            disabled={isLoading || page === 0}
            onClick={() => setSelection({ scope, page: page - 1 })}
          >
            {formatMessage(messages.previous)}
          </Button>
          <span aria-live="polite">
            {formatMessage(messages.page, { current: page + 1, total: pageCount })}
          </span>
          <Button
            variant="text"
            disabled={isLoading || page + 1 >= pageCount}
            onClick={() => setSelection({ scope, page: page + 1 })}
          >
            {formatMessage(messages.next)}
          </Button>
        </div>
      )}
    </section>
  );
};

const ReviewCaseTable = ({ cases }: { cases: LiveLibraryCase[] }) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('live-review-cases__scroll')}>
      <table>
        <thead>
          <tr>
            <th scope="col">{formatMessage(messages.caseColumn)}</th>
            <th scope="col">{formatMessage(messages.nameColumn)}</th>
            <th scope="col">{formatMessage(messages.statusColumn)}</th>
            <th scope="col">{formatMessage(messages.scoreColumn)}</th>
            <th scope="col">{formatMessage(messages.madeReadyByColumn)}</th>
          </tr>
        </thead>
        <tbody>
          {cases.map(({ id, displayId, name, status, overallScore, madeReadyBy }) => (
            <tr key={id}>
              <td>
                <CaseLink testCaseId={id} name={displayId} />
              </td>
              <td>{name}</td>
              <td>
                {status ? (
                  <span
                    className={cx(
                      'live-review-cases__status',
                      `live-review-cases__status--${status.toLowerCase()}`,
                    )}
                  >
                    {formatMessage(messages[status === 'READY' ? 'ready' : 'draft'])}
                  </span>
                ) : (
                  formatMessage(messages.unavailable)
                )}
              </td>
              <td>{overallScore ?? formatMessage(messages.unavailable)}</td>
              <td>
                {madeReadyBy?.type === 'AUTO_READY'
                  ? formatMessage(messages.autoReady)
                  : (madeReadyBy?.name ?? formatMessage(messages.unavailable))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
