/*
 * Copyright 2025 EPAM Systems
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
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { noop } from 'lodash';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { TestPlanDto } from 'controllers/testPlan';
import { hideModalAction } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { useDeleteTestPlan } from './useDeleteTestPlan';
import { messages } from './messages';

import styles from './deleteTestPlanModal.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const DELETE_TEST_PLAN_MODAL_KEY = 'deleteTestPlanModalKey';

interface DeleteTestPlanModalProps {
  data: TestPlanDto;
  onSuccess?: () => void;
}

export const DeleteTestPlanModal = ({ data, onSuccess = noop }: DeleteTestPlanModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isLoading, deleteTestPlan } = useDeleteTestPlan({ onSuccess });

  const handleDelete = async () => {
    await deleteTestPlan(data.id);
  };

  const handleCancel = () => {
    dispatch(hideModalAction());
  };

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
      </LoadingSubmitButton>
    ),
    disabled: isLoading,
    variant: 'danger' as const,
    onClick: handleDelete,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
    onClick: handleCancel,
  };

  return (
    <Modal
      title={formatMessage(messages.deleteTestPlan)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={handleCancel}
      className={cx('delete-test-plan-modal')}
    >
      <div>
        {formatMessage(messages.deleteConfirmation, {
          testPlanName: data.name,
          b: (chunks) => <strong>{chunks}</strong>,
        })}
      </div>
    </Modal>
  );
};
