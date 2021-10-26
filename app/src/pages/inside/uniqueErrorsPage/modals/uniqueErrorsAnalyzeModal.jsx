/*
 * Copyright 2021 EPAM Systems
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

import React, { Component } from 'react';
import { withModal } from 'controllers/modal';
import { ModalField, ModalLayout } from 'components/main/modal';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldProvider } from 'components/fields/fieldProvider';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { messages } from 'pages/inside/uniqueErrorsPage';
import styles from './uniqueErrorsAnalyzeModal.scss';

const cx = classNames.bind(styles);

@withModal('uniqueErrorsAnalyzeModal')
@reduxForm({
  form: 'uniqueErrorsAnalyzeModal',
  initialValues: { removeNumbers: false },
})
@injectIntl
export class UniqueErrorsAnalyzeModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    data: PropTypes.object,
  };

  static defaultProps = {
    handleSubmit: () => {},
    data: {},
  };

  render() {
    const {
      handleSubmit,
      data: { onSubmit },
      intl: { formatMessage },
    } = this.props;

    const okButton = {
      text: formatMessage(messages.uniqueErrAnalyzeModalOkBtn),
      onClick: () => {
        handleSubmit((values) => {
          onSubmit(values);
        })();
      },
    };
    const cancelButton = {
      text: formatMessage(messages.uniqueErrAnalyzeModalCancelBtn),
    };

    const options = [
      { label: formatMessage(messages.uniqueErrAnalyzeModalIncludeNumbers), value: false },
      { label: formatMessage(messages.uniqueErrAnalyzeModalExcludeNumbers), value: true },
    ];

    return (
      <ModalLayout
        title={formatMessage(messages.uniqueErrAnalyzeModalTitle)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <form className={cx('unique-errors-modal')}>
          <p className={cx('unique-errors-modal-text')}>
            {formatMessage(messages.uniqueErrAnalyzeModalText)}
          </p>
          <ModalField label={formatMessage(messages.uniqueErrAnalyzeModalFieldName)}>
            <FieldProvider name="removeNumbers">
              <InputDropdown options={options} />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
