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

import { FC } from 'react';
import { withModal } from 'components/main/modal';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Modal } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import styles from './updateUserInstanceRoleModal.scss';

const cx = classNames.bind(styles);

interface UpdateUserInstanceRoleModalProps {
  data: {
    title: string;
    description: string;
    onConfirm: () => void;
  };
}

const UpdateUserInstanceRoleModal: FC<UpdateUserInstanceRoleModalProps> = ({ data }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const onConfirm = () => {
    data.onConfirm();
    dispatch(hideModalAction());
  };

  const okButton = {
    text: data.title,
    children: data.title,
    onClick: onConfirm,
    'data-automation-id': 'submitButton',
  };
  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      className={cx('modal')}
      title={data.title}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      {data.description}
    </Modal>
  );
};

export default withModal('updateUserInstanceRoleModal')(UpdateUserInstanceRoleModal);
