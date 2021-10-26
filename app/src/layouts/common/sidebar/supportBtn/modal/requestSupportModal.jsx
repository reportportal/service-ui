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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { withModal } from 'controllers/modal';
import { ModalLayout } from 'components/main/modal';
import { commonValidators } from 'common/utils/validation';
import { userEmailSelector } from 'controllers/user';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import LoginIcon from 'common/img/login-field-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { messages } from '../messages';
import styles from './requestSupportModal.scss';

const cx = classNames.bind(styles);

const RequestSupport = ({ handleSubmit, initialize, invalid }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const email = useSelector(userEmailSelector);
  const [iframe, setIframe] = useState(null);

  useEffect(() => {
    const dummyframe = document.createElement('iframe');
    dummyframe.name = 'dummyframe';
    dummyframe.id = 'dummyframe';
    dummyframe.style.display = 'none';
    document.body.appendChild(dummyframe);

    setIframe(dummyframe);

    initialize({ email });

    return () => {
      dummyframe.parentNode.removeChild(dummyframe);
    };
  }, []);

  const onSubmit = (nextAction) => {
    iframe.onload = () => {
      dispatch(
        showNotification({
          message: formatMessage(messages.requestSent),
          type: NOTIFICATION_TYPES.SUCCESS,
        }),
      );
      nextAction();
    };
    iframe.onerror = () => {
      nextAction();
    };
  };

  return (
    <ModalLayout
      title={formatMessage(messages.requestSupport)}
      okButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.SEND),
        onClick: (closeModal) => {
          handleSubmit(() => {
            onSubmit(closeModal);
          })();
        },
        disabled: invalid,
        attributes: { type: 'submit', form: 'requestFormId' },
      }}
      cancelButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
    >
      <>
        <span className={cx('text')}>{Parser(formatMessage(messages.modalText))}</span>
        <form
          action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8"
          method="POST"
          id="requestFormId"
          target="dummyframe"
        >
          <input type="hidden" name="oid" value="00D24000000k2Rp" />
          <input type="hidden" name="retURL" value="http://" />

          <div className={cx('form-field')}>
            <FieldProvider name="first_name">
              <FieldErrorHint>
                <InputOutside
                  icon={LoginIcon}
                  placeholder={formatMessage(messages.firstNamePlaceholder)}
                  name="first_name"
                />
              </FieldErrorHint>
            </FieldProvider>
          </div>

          <div className={cx('form-field')}>
            <FieldProvider name="last_name">
              <FieldErrorHint>
                <InputOutside
                  icon={LoginIcon}
                  placeholder={formatMessage(messages.lastNamePlaceholder)}
                  name="last_name"
                />
              </FieldErrorHint>
            </FieldProvider>
          </div>

          <div className={cx('form-field')}>
            <FieldProvider name="email">
              <FieldErrorHint>
                <InputOutside
                  icon={LoginIcon}
                  placeholder={formatMessage(messages.emailPlaceholder)}
                  name="email"
                />
              </FieldErrorHint>
            </FieldProvider>
          </div>

          <FieldProvider name="company">
            <FieldErrorHint>
              <InputOutside
                icon={LoginIcon}
                placeholder={formatMessage(messages.companyNamePlaceholder)}
                name="company"
              />
            </FieldErrorHint>
          </FieldProvider>

          <select className={cx('hidden')} id="lead_source" name="lead_source">
            <option value="ReportPortal">ReportPortal</option>
          </select>

          <select className={cx('hidden')} id="lead_status" name="lead_status">
            <option value="New">New</option>
          </select>
        </form>
      </>
    </ModalLayout>
  );
};
RequestSupport.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
};

export const RequestSupportModal = withModal('requestSupportModal')(
  reduxForm({
    form: 'requestSupportForm',
    validate: ({ first_name: firstName, last_name: lastName, email, company }) => {
      return {
        first_name: commonValidators.requiredField(firstName),
        last_name: commonValidators.requiredField(lastName),
        email: commonValidators.email(email),
        company: commonValidators.requiredField(company),
      };
    },
  })(RequestSupport),
);
