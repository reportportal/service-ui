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

import { useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { withModal, hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useTestPlanById } from 'hooks/useTypedSelector';

import { useRemoveTestCasesFromTestPlan } from './useRemoveTestCasesFromTestPlan';
import { messages } from './messages';
import { REMOVE_TEST_CASES_FROM_TEST_PLAN_MODAL_KEY, MODAL_Z_INDEX } from './constants';
import { RemoveTestCasesFromTestPlanModalProps } from './types';

import styles from './removeTestCasesFromTestPlanModal.scss';

const cx = createClassnames(styles);

const RemoveTestCasesFromTestPlanModal = ({ data }: RemoveTestCasesFromTestPlanModalProps) => {
  const { selectedTestCaseIds = [], testPlanId = '', onClearSelection = noop } = data || {};

  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const testPlan = useTestPlanById(testPlanId);
  const { isLoading, removeTestCasesFromTestPlan } = useRemoveTestCasesFromTestPlan({
    onSuccess: () => {
      dispatch(hideModalAction());
      onClearSelection();
    },
    testCasesToRemove: selectedTestCaseIds.length,
  });

  const hideModal = useCallback(() => {
    dispatch(hideModalAction());
  }, [dispatch]);

  const handleRemove = useCallback(() => {
    removeTestCasesFromTestPlan(selectedTestCaseIds).catch(noop);
  }, [removeTestCasesFromTestPlan, selectedTestCaseIds]);

  const okButton = useMemo(
    () => ({
      children: <LoadingSubmitButton isLoading={isLoading}>Remove</LoadingSubmitButton>,
      disabled: isLoading,
      variant: 'danger' as const,
      onClick: handleRemove,
    }),
    [isLoading, handleRemove],
  );

  const cancelButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      disabled: isLoading,
      onClick: hideModal,
    }),
    [formatMessage, isLoading, hideModal],
  );

  return (
    <Modal
      title={formatMessage(messages.removeFromTestPlanTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
      zIndex={MODAL_Z_INDEX}
    >
      <div>
        {formatMessage(messages.removeFromTestPlanDescription, {
          count: selectedTestCaseIds.length,
          testPlanName: testPlan?.name || '',
          b: (text) => <span className={cx('remove-modal__text--bold')}>{text}</span>,
        })}
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};

export default withModal(REMOVE_TEST_CASES_FROM_TEST_PLAN_MODAL_KEY)(
  RemoveTestCasesFromTestPlanModal,
);
