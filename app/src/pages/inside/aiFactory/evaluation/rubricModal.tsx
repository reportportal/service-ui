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

import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MODAL_Z_INDEX } from 'common/constants/zIndex';
import type { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { hideModalAction, withModal } from 'controllers/modal';
import type { GradeCriterionRS } from 'types/aiFactory';

import { CRITERION_MESSAGE } from './criterionMessages';
import { messages } from './messages';

import styles from './rubricModal.scss';

const cx = createClassnames(styles);

export const AI_EVALUATION_RUBRIC_MODAL_KEY = 'aiEvaluationRubricModal';

export interface RubricModalData {
  criteria: Pick<GradeCriterionRS, 'key' | 'maxScore'>[];
}

export const RubricModalContent = ({ data }: UseModalData<RubricModalData>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  return (
    <Modal
      title={formatMessage(messages.rubricTitle)}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CLOSE) }}
      onClose={() => dispatch(hideModalAction())}
      zIndex={MODAL_Z_INDEX}
      scrollable
    >
      <div className={cx('rubric')}>
        <p className={cx('rubric__intro')}>{formatMessage(messages.rubricIntro)}</p>
        <ul className={cx('rubric__criteria')}>
          {data.criteria.map(({ key, maxScore }) => (
            <li key={key}>
              <div className={cx('rubric__criterion-title')}>
                <span>{formatMessage(CRITERION_MESSAGE[key])}</span>
                <span>{`/${maxScore}`}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className={cx('rubric__note')}>{formatMessage(messages.rubricSnapshotNote)}</p>
        <p className={cx('rubric__note')}>
          {formatMessage(messages.rubricDescriptionsUnavailable)}
        </p>
      </div>
    </Modal>
  );
};

export const RubricModal = withModal(AI_EVALUATION_RUBRIC_MODAL_KEY)(RubricModalContent);
