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

import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Modal, FieldText } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { FieldProvider } from 'components/fields';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';

import { bindMessageToValidator } from 'common/utils/validation';
import styles from './deleteProductVersionModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  deleteProductVersion: {
    id: 'ProductVersionPage.deleteProductVersion',
    defaultMessage: 'Delete product version',
  },
  areYouSure: {
    id: 'ProductVersionPage.areYouSure',
    defaultMessage:
      'Are you sure you want to delete product version {productVersionName}? This irreversible action will delete all it’s data.',
  },
  toConfirm: {
    id: 'ProductVersionPage.toConfirm',
    defaultMessage: 'To confirm, please enter the word ‘delete’',
  },
});

export const DELETE_PRODUCT_VERSION_MODAL = 'deleteProductVersionModal';

const DeleteProductVersionModal = ({
  data: { productVersionName, onSubmit },
  submitFailed,
  handleSubmit,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [isChangedAfterFailedSubmit, setIsChangedAfterFailedSubmit] = useState(false);

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    variant: 'danger',
    disabled: submitFailed && !isChangedAfterFailedSubmit,
    onClick: handleSubmit(onSubmit),
  };

  useEffect(() => {
    if (submitFailed) {
      setIsChangedAfterFailedSubmit(false);
    }
  }, [submitFailed]);

  return (
    <Modal
      title={formatMessage(messages.deleteProductVersion)}
      okButton={okButton}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CANCEL) }}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('delete-product-version-modal')}>
        {formatMessage(messages.areYouSure, { productVersionName })}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldProvider name="deleteCheck" onChange={() => setIsChangedAfterFailedSubmit(true)}>
          <FieldErrorHint provideHint={false}>
            <FieldText label={formatMessage(messages.toConfirm)} defaultWidth={false} />
          </FieldErrorHint>
        </FieldProvider>
      </form>
    </Modal>
  );
};

DeleteProductVersionModal.propTypes = {
  data: PropTypes.shape({
    productVersionName: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
  }),
  submitFailed: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

withModal(DELETE_PRODUCT_VERSION_MODAL)(
  reduxForm({
    form: 'deleteProductVersionForm',
    validate: ({ deleteCheck }) => ({
      deleteCheck: bindMessageToValidator(
        (value) => value === 'delete',
        'enteredTextDoesNotMatchKeyword',
      )(deleteCheck),
    }),
  })(DeleteProductVersionModal),
);
