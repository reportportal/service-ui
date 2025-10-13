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

import { MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { deleteTestCaseAction } from 'controllers/testCase/actionCreators';
import { isDeletingTestCaseSelector } from 'controllers/testCase';
import { TestCase } from '../types';

import styles from './deleteTestCaseModal.scss';

const messages = defineMessages({
  deleteTestCaseTitle: {
    id: 'TestCaseLibraryPage.deleteTestCaseTitle',
    defaultMessage: 'Delete Test Case',
  },
  deleteTestCaseText: {
    id: 'TestCaseLibraryPage.deleteTestCaseText',
    defaultMessage:
      'Are you sure you want to delete test case <b>{name}</b>? This irreversible action will delete it’s all test case data.',
  },
});

const cx = classNames.bind(styles) as typeof classNames;

export const DELETE_TEST_CASE_MODAL_KEY = 'deleteTestCaseModalKey';

interface DeleteTestCaseModalProps {
  data: { testCase: TestCase };
}

const DeleteTestCaseModalComponent = ({ data: { testCase } }: DeleteTestCaseModalProps) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(isDeletingTestCaseSelector);
  const { formatMessage } = useIntl();

  const hideModal = () => dispatch(hideModalAction());

  const onSubmit = () => dispatch(deleteTestCaseAction(testCase));

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
      </LoadingSubmitButton>
    ),
    onClick: onSubmit as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isLoading,
    variant: 'danger' as const,
    'data-automation-id': 'submitButton',
  };
  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.deleteTestCaseTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      {formatMessage(messages.deleteTestCaseText, {
        b: (data) => <span className={cx('delete-test-case-modal__text--bold')}>{data}</span>,
        name: testCase.name,
      })}
    </Modal>
  );
};

export default withModal(DELETE_TEST_CASE_MODAL_KEY)(DeleteTestCaseModalComponent);
