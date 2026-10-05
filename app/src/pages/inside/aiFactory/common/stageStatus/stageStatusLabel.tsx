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

import { createClassnames } from 'common/utils';
import { AiStageStatus } from 'types/aiFactory';

import { STAGE_STATUS_MESSAGE } from './stageStatusMessages';
import { STAGE_STATUS_VARIANT } from './stageStatusVariant';
import styles from './stageStatus.scss';

const cx = createClassnames(styles);

export interface StageStatusLabelProps {
  status: AiStageStatus;
}

export const StageStatusLabel = ({ status }: StageStatusLabelProps) => {
  const { formatMessage } = useIntl();

  return (
    <span
      className={cx('label', STAGE_STATUS_VARIANT[status])}
      data-automation-id="stageStatusLabel"
    >
      {formatMessage(STAGE_STATUS_MESSAGE[status])}
    </span>
  );
};
