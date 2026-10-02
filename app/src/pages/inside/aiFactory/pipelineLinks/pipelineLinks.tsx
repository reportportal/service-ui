/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';

import { createClassnames } from 'common/utils';
import { CollapsibleSection } from 'components/collapsibleSection';
import { PROJECT_PIPELINE_ITERATION_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { AiDetailsSectionState } from 'pages/inside/aiFactory/common/aiDetailsSectionState';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';
import type { ProjectDetails } from 'pages/organization/constants';
import { StageKey } from 'types/aiFactory';
import type { TestCaseAiRS } from 'types/aiFactory';

import { messages } from './messages';
import styles from './pipelineLinks.scss';

const cx = createClassnames(styles);
type PipelineLink = TestCaseAiRS['pipelineLinks'][number];

const isSupportedLink = (link: PipelineLink) =>
  link.stage === StageKey.GRADE || link.stage === StageKey.REVIEW;

export interface PipelineLinksProps {
  aiDetailsState: TestCaseAiLoadState;
}

export const PipelineLinks = ({ aiDetailsState }: PipelineLinksProps) => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const { data, isLoading, isError, reload } = aiDetailsState;
  const links = (data?.pipelineLinks ?? []).filter(isSupportedLink);

  const content = links.length ? (
    <ul className={cx('pipeline-links')} data-automation-id="pipelineLinks">
      {links.map((link) => (
        <li
          key={`${link.pipelineId}-${link.iterationId}-${link.stage}-${link.fixRound ?? 'source'}`}
          className={cx('pipeline-links__item')}
        >
          <span className={cx('pipeline-links__label')}>
            {link.fixRound === undefined
              ? formatMessage(messages.source)
              : formatMessage(messages.fixRound, { number: link.fixRound })}
          </span>
          <Link
            className={cx('pipeline-links__link')}
            data-automation-id={`pipeline-link-${link.stage}-${link.fixRound ?? 'source'}`}
            to={{
              type: PROJECT_PIPELINE_ITERATION_PAGE,
              payload: {
                organizationSlug,
                projectSlug,
                pipelineId: link.pipelineId,
                iterationId: link.iterationId,
              },
              query: { stage: link.stage },
            }}
          >
            {formatMessage(messages.iterationStage, {
              number: link.iterationNumber,
              stage: formatMessage(
                link.stage === StageKey.GRADE ? messages.grade : messages.review,
              ),
            })}
          </Link>
        </li>
      ))}
    </ul>
  ) : null;
  const sectionContent =
    content || isLoading || isError ? (
      <AiDetailsSectionState
        className={cx('pipeline-links__state')}
        isLoading={isLoading}
        isError={isError}
        loadingLabel={formatMessage(messages.loading)}
        errorMessage={formatMessage(messages.loadError)}
        retryLabel={formatMessage(messages.retry)}
        retryAutomationId="retry-pipeline-links"
        onRetry={reload}
      >
        {content}
      </AiDetailsSectionState>
    ) : null;

  return (
    <CollapsibleSection
      title={formatMessage(messages.title)}
      defaultMessage={formatMessage(messages.empty)}
      isInitiallyExpanded={Boolean(links.length) || isLoading || isError}
    >
      {sectionContent}
    </CollapsibleSection>
  );
};
