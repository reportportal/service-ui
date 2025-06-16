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

import { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import PropTypes from 'prop-types';
import { Modal, FieldText } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { FieldProvider } from 'components/fields';
import { commonValidators } from 'common/utils/validation';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';

const messages = defineMessages({
  renameProductVersion: {
    id: 'ProductVersionPage.renameProductVersion',
    defaultMessage: 'Rename product version',
  },
});

export const RENAME_PRODUCT_VERSION_MODAL = 'renameProductVersionModal';

function RenameProductVersionModal({
  data: { productVersionName, onSubmit },
  initialize,
  handleSubmit,
}) {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.RENAME),
    onClick: handleSubmit(onSubmit),
  };

  useEffect(() => {
    initialize({ productVersionName });
  }, [initialize, productVersionName]);

  return (
    <Modal
      title={formatMessage(messages.renameProductVersion)}
      okButton={okButton}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CANCEL) }}
      onClose={() => dispatch(hideModalAction())}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldProvider name="productVersionName">
          <FieldErrorHint provideHint={false}>
            <FieldText label={formatMessage(COMMON_LOCALE_KEYS.NAME)} defaultWidth={false} />
          </FieldErrorHint>
        </FieldProvider>
      </form>
    </Modal>
  );
}

RenameProductVersionModal.propTypes = {
  data: PropTypes.shape({
    productVersionName: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
  }),
  handleSubmit: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
};

withModal(RENAME_PRODUCT_VERSION_MODAL)(
  reduxForm({
    form: 'renameProductVersionForm',
    validate: ({ productVersionName }) => ({
      productVersionName: commonValidators.requiredField(productVersionName),
    }),
  })(RenameProductVersionModal),
);
