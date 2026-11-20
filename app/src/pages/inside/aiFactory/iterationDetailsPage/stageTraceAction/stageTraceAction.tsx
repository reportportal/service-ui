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

import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { createStageTraceAction } from 'pages/inside/aiFactory/common/stageTrace/navigation';
import { ProjectDetails } from 'pages/organization/constants';

import { messages } from 'pages/inside/aiFactory/iterationDetailsPage/stageTraceAction/messages';
import styles from 'pages/inside/aiFactory/iterationDetailsPage/iterationDetailsPage.scss';

const cx = createClassnames(styles);

export interface StageTraceActionProps {
  pipelineId: number;
  iterationId: number;
  stageKey: string;
}

export const StageTraceAction = ({ pipelineId, iterationId, stageKey }: StageTraceActionProps) => {
  const { formatMessage } = useIntl();
  const enabled = useAiFactoryEnabled();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  if (!enabled) return null;
  const target = { pipelineId, iterationId, stageKey };
  return (
    <div className={cx('stage-trace-action')} data-automation-id="stage-trace-action">
      <Button
        variant="ghost"
        adjustWidthOn="content"
        className={cx('stage-trace-action__open')}
        onClick={() =>
          dispatch(
            createStageTraceAction({ organizationSlug, projectSlug }, target, { returnTo: target }),
          )
        }
      >
        {formatMessage(messages.open)}
      </Button>
    </div>
  );
};
